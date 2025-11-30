import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

function getSupabase() { return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!); }

function getOpenAI() { return new OpenAI({
  apiKey: process.env.OPENAI_API_KEY }); }

// AI-Optimized Volunteer Scheduling
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const date = searchParams.get('date')

    // Get all volunteer teams
    const { data: teams } = await supabase
      .from('volunteer_teams')
      .select(`
        id, name, description, required_count,
        volunteer_members (
          member_id,
          role,
          members (id, first_name, last_name, email)
        )
      `)

    // Get volunteer availability
    const { data: availability } = await supabase
      .from('volunteer_availability')
      .select('member_id, day_of_week, start_time, end_time, is_available')

    // Get upcoming events that need volunteers
    const { data: events } = await supabase
      .from('events')
      .select('id, title, start_date, end_date, location, volunteer_positions_needed')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(10)

    // Get existing schedules
    const { data: schedules } = await supabase
      .from('volunteer_schedules')
      .select(`
        id, event_id, team_id, member_id, position, status,
        members (first_name, last_name)
      `)

    // Build availability map
    const memberAvailability: Record<string, { days: string[], times: any[] }> = {}
    for (const a of availability || []) {
      if (!memberAvailability[a.member_id]) {
        memberAvailability[a.member_id] = { days: [], times: [] }
      }
      if (a.is_available) {
        memberAvailability[a.member_id].days.push(a.day_of_week)
        memberAvailability[a.member_id].times.push({
          day: a.day_of_week,
          start: a.start_time,
          end: a.end_time
        })
      }
    }

    // Calculate team statistics
    const teamStats = (teams || []).map(team => {
      const members = (team as any).volunteer_members || []
      const scheduledCount = schedules?.filter(s => s.team_id === team.id && s.status === 'confirmed').length || 0

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        memberCount: members.length,
        requiredCount: team.required_count || 5,
        scheduledThisMonth: scheduledCount,
        availableMembers: members.filter((m: any) =>
          memberAvailability[m.member_id]?.days.length > 0
        ).length
      }
    })

    // Generate optimal schedule suggestions for upcoming events
    const scheduleSuggestions = (events || []).map(event => {
      const eventDate = new Date(event.start_date)
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][eventDate.getDay()]

      // Find available volunteers for this day
      const availableVolunteers: any[] = []

      for (const team of teams || []) {
        const members = (team as any).volunteer_members || []
        for (const member of members) {
          const avail = memberAvailability[member.member_id]
          if (avail?.days.includes(dayOfWeek)) {
            // Check if not already scheduled
            const alreadyScheduled = schedules?.some(s =>
              s.event_id === event.id && s.member_id === member.member_id
            )
            if (!alreadyScheduled) {
              availableVolunteers.push({
                memberId: member.member_id,
                memberName: `${(member.members as any)?.first_name} ${(member.members as any)?.last_name}`,
                teamId: team.id,
                teamName: team.name,
                role: member.role
              })
            }
          }
        }
      }

      return {
        event: {
          id: event.id,
          title: event.title,
          date: event.start_date,
          location: event.location,
          positionsNeeded: event.volunteer_positions_needed || 10
        },
        dayOfWeek,
        availableVolunteers: availableVolunteers.slice(0, 20),
        currentlyScheduled: schedules?.filter(s => s.event_id === event.id).length || 0,
        gapToFill: Math.max(0, (event.volunteer_positions_needed || 10) - (schedules?.filter(s => s.event_id === event.id).length || 0))
      }
    })

    return NextResponse.json({
      teams: teamStats,
      upcomingEvents: scheduleSuggestions,
      totalVolunteers: Object.keys(memberAvailability).length,
      totalScheduledThisMonth: schedules?.filter(s => s.status === 'confirmed').length || 0
    })

  } catch (error) {
    console.error('Error fetching volunteer data:', error)
    return NextResponse.json({ error: 'Failed to fetch volunteer data' }, { status: 500 })
  }
}

// POST - Create optimized schedule or schedule a volunteer
export async function POST(request: NextRequest) {
  try {
    const { action, eventId, memberId, teamId, position, autoSchedule } = await request.json()

    if (action === 'schedule_volunteer') {
      // Schedule a specific volunteer
      if (!eventId || !memberId) {
        return NextResponse.json({ error: 'eventId and memberId required' }, { status: 400 })
      }

      const { data: schedule, error } = await supabase
        .from('volunteer_schedules')
        .insert({
          event_id: eventId,
          member_id: memberId,
          team_id: teamId,
          position: position || 'General',
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Send notification
      await getSupabase().from('notifications').insert({
        user_id: memberId,
        type: 'volunteer',
        title: 'Volunteer Schedule Request',
        message: 'You have been scheduled for an upcoming event. Please confirm your availability.',
        is_read: false
      })

      return NextResponse.json({ success: true, schedule })
    }

    if (action === 'auto_schedule' && eventId) {
      // AI-powered auto-scheduling
      const { data: event } = await supabase
        .from('events')
        .select('id, title, start_date, volunteer_positions_needed')
        .eq('id', eventId)
        .single()

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      const eventDate = new Date(event.start_date)
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][eventDate.getDay()]

      // Get available volunteers
      const { data: availability } = await supabase
        .from('volunteer_availability')
        .select('member_id')
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)

      const availableMemberIds = availability?.map(a => a.member_id) || []

      // Get existing schedules for this event
      const { data: existingSchedules } = await supabase
        .from('volunteer_schedules')
        .select('member_id')
        .eq('event_id', eventId)

      const alreadyScheduledIds = new Set(existingSchedules?.map(s => s.member_id) || [])

      // Filter to unscheduled available members
      const toSchedule = availableMemberIds
        .filter(id => !alreadyScheduledIds.has(id))
        .slice(0, event.volunteer_positions_needed || 10)

      // Create schedules
      if (toSchedule.length > 0) {
        const scheduleInserts = toSchedule.map(memberId => ({
          event_id: eventId,
          member_id: memberId,
          position: 'General',
          status: 'pending'
        }))

        await getSupabase().from('volunteer_schedules').insert(scheduleInserts)

        // Send notifications
        const notificationInserts = toSchedule.map(memberId => ({
          user_id: memberId,
          type: 'volunteer',
          title: `Volunteer: ${event.title}`,
          message: 'You have been scheduled as a volunteer. Please confirm your availability.',
          is_read: false
        }))

        await getSupabase().from('notifications').insert(notificationInserts)
      }

      return NextResponse.json({
        success: true,
        scheduledCount: toSchedule.length,
        message: `Scheduled ${toSchedule.length} volunteers for ${event.title}`
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error scheduling volunteers:', error)
    return NextResponse.json({ error: 'Failed to schedule volunteers' }, { status: 500 })
  }
}

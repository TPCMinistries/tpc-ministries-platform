import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createAdminClient()
}

interface AvailabilitySlot {
  day: string
  start: string | null
  end: string | null
}

interface AvailabilityRow {
  member_id: string
  day_of_week: string
  start_time: string | null
  end_time: string | null
  is_available: boolean
}

interface VolunteerMemberRow {
  member_id: string
  role: string | null
  members?: {
    id: string
    first_name: string
    last_name: string
    email: string
  } | {
    id: string
    first_name: string
    last_name: string
    email: string
  }[] | null
}

interface VolunteerTeamRow {
  id: string
  name: string
  description: string | null
  required_count: number | null
  volunteer_members?: VolunteerMemberRow[] | null
}

interface VolunteerScheduleRow {
  id?: string
  event_id: string
  team_id: string | null
  member_id: string
  position?: string | null
  status: string
}

interface VolunteerSchedulerRequest {
  action?: 'schedule_volunteer' | 'auto_schedule'
  eventId?: string
  memberId?: string
  teamId?: string
  position?: string
}

const firstRelation = <T,>(value?: T | T[] | null) => {
  if (Array.isArray(value)) {
    return value[0] || null
  }

  return value || null
}

// AI-Optimized Volunteer Scheduling
export async function GET() {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = getSupabase()

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
    const memberAvailability: Record<string, { days: string[], times: AvailabilitySlot[] }> = {}
    for (const a of (availability || []) as AvailabilityRow[]) {
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
    const typedSchedules = (schedules || []) as VolunteerScheduleRow[]
    const typedTeams = (teams || []) as VolunteerTeamRow[]
    const teamStats = typedTeams.map(team => {
      const members = team.volunteer_members || []
      const scheduledCount = typedSchedules.filter(s => s.team_id === team.id && s.status === 'confirmed').length || 0

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        memberCount: members.length,
        requiredCount: team.required_count || 5,
        scheduledThisMonth: scheduledCount,
        availableMembers: members.filter((m) =>
          memberAvailability[m.member_id]?.days.length > 0
        ).length
      }
    })

    // Generate optimal schedule suggestions for upcoming events
    const scheduleSuggestions = (events || []).map(event => {
      const eventDate = new Date(event.start_date)
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][eventDate.getDay()]

      // Find available volunteers for this day
      const availableVolunteers: Array<{
        memberId: string
        memberName: string
        teamId: string
        teamName: string
        role: string | null
      }> = []

      for (const team of typedTeams) {
        const members = team.volunteer_members || []
        for (const member of members) {
          const avail = memberAvailability[member.member_id]
          if (avail?.days.includes(dayOfWeek)) {
            // Check if not already scheduled
            const alreadyScheduled = schedules?.some(s =>
              s.event_id === event.id && s.member_id === member.member_id
            )
            if (!alreadyScheduled) {
              const memberProfile = firstRelation(member.members)
              availableVolunteers.push({
                memberId: member.member_id,
                memberName: `${memberProfile?.first_name || ''} ${memberProfile?.last_name || ''}`.trim() || 'Unknown volunteer',
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
        currentlyScheduled: typedSchedules.filter(s => s.event_id === event.id).length || 0,
        gapToFill: Math.max(0, (event.volunteer_positions_needed || 10) - typedSchedules.filter(s => s.event_id === event.id).length)
      }
    })

    return NextResponse.json({
      teams: teamStats,
      upcomingEvents: scheduleSuggestions,
      totalVolunteers: Object.keys(memberAvailability).length,
      totalScheduledThisMonth: typedSchedules.filter(s => s.status === 'confirmed').length || 0
    })

  } catch (error) {
    console.error('Error fetching volunteer data:', error)
    return NextResponse.json({ error: 'Failed to fetch volunteer data' }, { status: 500 })
  }
}

// POST - Create optimized schedule or schedule a volunteer
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { action, eventId, memberId, teamId, position } = await request.json() as VolunteerSchedulerRequest
    const supabase = getSupabase()

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
      await supabase.from('notifications').insert({
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

        await supabase.from('volunteer_schedules').insert(scheduleInserts)

        // Send notifications
        const notificationInserts = toSchedule.map(memberId => ({
          user_id: memberId,
          type: 'volunteer',
          title: `Volunteer: ${event.title}`,
          message: 'You have been scheduled as a volunteer. Please confirm your availability.',
          is_read: false
        }))

        await supabase.from('notifications').insert(notificationInserts)
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

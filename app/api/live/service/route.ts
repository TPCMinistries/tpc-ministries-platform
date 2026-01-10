import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get current or upcoming live service
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('id')

    // Get specific service or current/next one
    let query = supabase
      .from('live_services')
      .select('*')

    if (serviceId) {
      query = query.eq('id', serviceId)
    } else {
      // Get currently live or next upcoming service
      const now = new Date().toISOString()
      query = query
        .or(`status.eq.live,and(status.eq.scheduled,scheduled_start.gte.${now})`)
        .order('scheduled_start', { ascending: true })
        .limit(1)
    }

    const { data: service, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching service:', error)
      return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
    }

    if (!service) {
      return NextResponse.json({ service: null, message: 'No live or upcoming service' })
    }

    // Get attendee count for live services
    if (service.status === 'live') {
      const { count } = await supabase
        .from('service_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('service_id', service.id)
        .is('left_at', null)

      service.current_attendees = count || 0
    }

    // Check if user is attending (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (member) {
        const { data: attendance } = await supabase
          .from('service_attendance')
          .select('id, joined_at')
          .eq('service_id', service.id)
          .eq('member_id', member.id)
          .single()

        service.user_attending = !!attendance
        service.user_joined_at = attendance?.joined_at
      }
    }

    // Get active poll if any
    if (service.poll_enabled) {
      const { data: poll } = await supabase
        .from('service_polls')
        .select('*')
        .eq('service_id', service.id)
        .eq('is_active', true)
        .single()

      service.active_poll = poll
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error in live service API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Join/leave live service
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const { service_id, action, device_type } = body

    if (!service_id || !action) {
      return NextResponse.json({ error: 'service_id and action required' }, { status: 400 })
    }

    if (action === 'join') {
      // Join the service
      const { data: attendance, error } = await supabase
        .from('service_attendance')
        .upsert({
          service_id,
          member_id: member.id,
          joined_at: new Date().toISOString(),
          device_type: device_type || 'web'
        }, {
          onConflict: 'service_id,member_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error joining service:', error)
        return NextResponse.json({ error: 'Failed to join service' }, { status: 500 })
      }

      // Update attendee count
      await supabase.rpc('increment_attendee_count', { p_service_id: service_id })

      return NextResponse.json({ attendance, success: true })
    } else if (action === 'leave') {
      // Leave the service
      const { error } = await supabase
        .from('service_attendance')
        .update({
          left_at: new Date().toISOString()
        })
        .eq('service_id', service_id)
        .eq('member_id', member.id)

      if (error) {
        console.error('Error leaving service:', error)
        return NextResponse.json({ error: 'Failed to leave service' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in live service POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

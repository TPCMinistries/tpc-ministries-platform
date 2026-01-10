import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get check-ins for an event
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('event_id')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Get event details
    const { data: event } = await supabase
      .from('events')
      .select('id, title, start_time, capacity')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get check-ins
    const { data: checkins, error } = await supabase
      .from('event_checkins')
      .select(`
        *,
        member:members(id, first_name, last_name, email, avatar_url),
        checked_in_by_member:members!event_checkins_checked_in_by_fkey(first_name, last_name)
      `)
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: false })

    if (error) {
      console.error('Error fetching check-ins:', error)
      return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 })
    }

    // Get registrations for comparison
    const { data: registrations, count: registrationCount } = await supabase
      .from('event_registrations')
      .select('member_id, members(first_name, last_name, email)', { count: 'exact' })
      .eq('event_id', eventId)

    return NextResponse.json({
      event,
      checkins: checkins || [],
      checkinCount: checkins?.length || 0,
      registrationCount: registrationCount || 0,
      registrations: registrations || []
    })
  } catch (error) {
    console.error('Check-in GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Check in a member or guest
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: staffMember } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!staffMember || !['admin', 'staff'].includes(staffMember.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      event_id,
      member_id,
      guest_name,
      guest_email,
      guest_phone,
      check_in_method = 'manual',
      notes
    } = body

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    if (!member_id && !guest_name) {
      return NextResponse.json({ error: 'Member ID or guest name is required' }, { status: 400 })
    }

    // Check for duplicate check-in
    if (member_id) {
      const { data: existing } = await supabase
        .from('event_checkins')
        .select('id')
        .eq('event_id', event_id)
        .eq('member_id', member_id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'Member already checked in' }, { status: 409 })
      }
    }

    const { data: checkin, error } = await supabase
      .from('event_checkins')
      .insert({
        event_id,
        member_id,
        guest_name,
        guest_email,
        guest_phone,
        checked_in_by: staffMember.id,
        check_in_method,
        notes
      })
      .select(`
        *,
        member:members(id, first_name, last_name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating check-in:', error)
      return NextResponse.json({ error: 'Failed to check in' }, { status: 500 })
    }

    // Log the action
    const { data: event } = await supabase
      .from('events')
      .select('title')
      .eq('id', event_id)
      .single()

    await supabase.from('admin_audit_log').insert({
      admin_id: staffMember.id,
      action: 'checkin',
      entity_type: 'event',
      entity_id: event_id,
      entity_name: event?.title,
      details: {
        member_id,
        guest_name,
        method: check_in_method
      }
    })

    return NextResponse.json({ checkin })
  } catch (error) {
    console.error('Check-in POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove a check-in
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Check-in ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('event_checkins')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting check-in:', error)
      return NextResponse.json({ error: 'Failed to remove check-in' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Check-in DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

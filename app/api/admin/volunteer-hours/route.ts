import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch volunteer hours
export async function GET(request: NextRequest) {
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
    const memberId = searchParams.get('member_id')
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('volunteer_hours')
      .select(`
        *,
        member:members(id, first_name, last_name, email, avatar_url),
        opportunity:volunteer_opportunities(id, title),
        event:events(id, title),
        approved_by_member:members!volunteer_hours_approved_by_fkey(first_name, last_name)
      `)
      .order('date', { ascending: false })

    if (memberId) query = query.eq('member_id', memberId)
    if (status) query = query.eq('status', status)
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data: hours, error } = await query

    if (error) {
      console.error('Error fetching volunteer hours:', error)
      return NextResponse.json({ error: 'Failed to fetch hours' }, { status: 500 })
    }

    // Get summary stats
    const { data: summary } = await supabase
      .from('volunteer_hours')
      .select('status, hours_worked')

    const stats = {
      totalHours: 0,
      approvedHours: 0,
      pendingHours: 0,
      totalEntries: summary?.length || 0
    }

    summary?.forEach(h => {
      stats.totalHours += Number(h.hours_worked)
      if (h.status === 'approved') stats.approvedHours += Number(h.hours_worked)
      if (h.status === 'pending') stats.pendingHours += Number(h.hours_worked)
    })

    // Get top volunteers
    const { data: topVolunteers } = await supabase
      .from('volunteer_hours')
      .select('member_id, members(first_name, last_name), hours_worked')
      .eq('status', 'approved')

    const volunteerTotals = new Map<string, { name: string; hours: number }>()
    topVolunteers?.forEach(v => {
      const current = volunteerTotals.get(v.member_id) || { name: '', hours: 0 }
      volunteerTotals.set(v.member_id, {
        name: `${(v.members as any)?.first_name} ${(v.members as any)?.last_name}`,
        hours: current.hours + Number(v.hours_worked)
      })
    })

    const leaderboard = Array.from(volunteerTotals.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10)

    return NextResponse.json({
      hours: hours || [],
      stats,
      leaderboard
    })
  } catch (error) {
    console.error('Volunteer hours GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Log volunteer hours
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
    const { member_id, opportunity_id, event_id, date, hours_worked, description, auto_approve } = body

    if (!member_id || !date || !hours_worked) {
      return NextResponse.json({ error: 'Member, date, and hours are required' }, { status: 400 })
    }

    const insertData: any = {
      member_id,
      opportunity_id,
      event_id,
      date,
      hours_worked,
      description,
      status: auto_approve ? 'approved' : 'pending'
    }

    if (auto_approve) {
      insertData.approved_by = staffMember.id
      insertData.approved_at = new Date().toISOString()
    }

    const { data: entry, error } = await supabase
      .from('volunteer_hours')
      .insert(insertData)
      .select(`
        *,
        member:members(first_name, last_name)
      `)
      .single()

    if (error) {
      console.error('Error logging hours:', error)
      return NextResponse.json({ error: 'Failed to log hours' }, { status: 500 })
    }

    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: staffMember.id,
      action: 'create',
      entity_type: 'volunteer_hours',
      entity_id: entry.id,
      details: { member_id, hours_worked, date }
    })

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Volunteer hours POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Approve/reject hours
export async function PATCH(request: NextRequest) {
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
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 })
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data: entry, error } = await supabase
      .from('volunteer_hours')
      .update({
        status,
        approved_by: staffMember.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating hours:', error)
      return NextResponse.json({ error: 'Failed to update hours' }, { status: 500 })
    }

    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: staffMember.id,
      action: status === 'approved' ? 'approve' : 'reject',
      entity_type: 'volunteer_hours',
      entity_id: id,
      details: { status }
    })

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Volunteer hours PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - Fetch volunteer hours
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createAdminClient()
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
      const volunteerMember = Array.isArray(v.members) ? v.members[0] : v.members
      const current = volunteerTotals.get(v.member_id) || { name: '', hours: 0 }
      volunteerTotals.set(v.member_id, {
        name: `${volunteerMember?.first_name || ''} ${volunteerMember?.last_name || ''}`.trim(),
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
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { member_id, opportunity_id, event_id, date, hours_worked, description, auto_approve } = body

    if (!member_id || !date || !hours_worked) {
      return NextResponse.json({ error: 'Member, date, and hours are required' }, { status: 400 })
    }

    const insertData: Record<string, unknown> = {
      member_id,
      opportunity_id,
      event_id,
      date,
      hours_worked,
      description,
      status: auto_approve ? 'approved' : 'pending'
    }

    if (auto_approve) {
      insertData.approved_by = authResult.member.id
      insertData.approved_at = new Date().toISOString()
    }

    const supabase = createAdminClient()
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
      admin_id: authResult.member.id,
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
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 })
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: entry, error } = await supabase
      .from('volunteer_hours')
      .update({
        status,
        approved_by: authResult.member.id,
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
      admin_id: authResult.member.id,
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

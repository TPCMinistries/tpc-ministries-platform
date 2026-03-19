import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET — Fetch proposals (partner sees own, admin sees all)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: member } = await admin
      .from('members')
      .select('id, role, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    // Get latest trip
    const { data: trip } = await admin
      .from('kenya_trips')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!trip) {
      return NextResponse.json({ error: 'No trip found' }, { status: 404 })
    }

    const showAll = request.nextUrl.searchParams.get('all') === 'true'
    const isAdmin = member.is_admin || member.role === 'admin'

    if (showAll && isAdmin) {
      // Admin: fetch all proposals for this trip with partner+member info
      const { data: proposals } = await admin
        .from('kenya_trip_partner_proposals')
        .select('*, kenya_trip_partners(id, partner_type, organization, city, members(first_name, last_name))')
        .eq('trip_id', trip.id)
        .order('created_at', { ascending: false })

      return NextResponse.json({ proposals: proposals || [] })
    }

    // Partner: fetch own proposals
    const { data: partner } = await admin
      .from('kenya_trip_partners')
      .select('id')
      .eq('trip_id', trip.id)
      .eq('member_id', member.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!partner) {
      return NextResponse.json({ error: 'Not a partner' }, { status: 403 })
    }

    const { data: proposals } = await admin
      .from('kenya_trip_partner_proposals')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ proposals: proposals || [] })
  } catch (error) {
    console.error('Proposals GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create new proposal
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: member } = await admin
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    // Get latest trip
    const { data: trip } = await admin
      .from('kenya_trips')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!trip) {
      return NextResponse.json({ error: 'No trip found' }, { status: 404 })
    }

    // Get partner record
    const { data: partner } = await admin
      .from('kenya_trip_partners')
      .select('id, can_propose_changes, is_active')
      .eq('trip_id', trip.id)
      .eq('member_id', member.id)
      .maybeSingle()

    if (!partner || !partner.is_active) {
      return NextResponse.json({ error: 'Not an active partner' }, { status: 403 })
    }

    if (!partner.can_propose_changes) {
      return NextResponse.json({ error: 'You do not have permission to submit proposals' }, { status: 403 })
    }

    const body = await request.json()
    const { proposal_type, title, description } = body

    if (!proposal_type || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields: proposal_type, title, description' }, { status: 400 })
    }

    const validTypes = ['schedule_change', 'logistics_update', 'venue_change', 'resource_addition', 'announcement', 'other']
    if (!validTypes.includes(proposal_type)) {
      return NextResponse.json({ error: 'Invalid proposal_type' }, { status: 400 })
    }

    const { data: proposal, error: insertError } = await admin
      .from('kenya_trip_partner_proposals')
      .insert({
        trip_id: trip.id,
        partner_id: partner.id,
        proposal_type,
        title: title.trim(),
        description: description.trim(),
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Proposal insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
    }

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error('Proposals POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT — Update proposal status (admin only — approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: member } = await admin
      .from('members')
      .select('id, role, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    const isAdmin = member.is_admin || member.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status, admin_response } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields: id, status' }, { status: 400 })
    }

    const validStatuses = ['approved', 'rejected', 'implemented']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be: approved, rejected, or implemented' }, { status: 400 })
    }

    const { data: proposal, error: updateError } = await admin
      .from('kenya_trip_partner_proposals')
      .update({
        status,
        admin_response: admin_response?.trim() || null,
        resolved_by_member_id: member.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Proposal update error:', updateError)
      return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
    }

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error('Proposals PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET — List all partners for the trip (admin only)
export async function GET() {
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

    const { data: partners } = await admin
      .from('kenya_trip_partners')
      .select('*, members(first_name, last_name, email, phone)')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ partners: partners || [] })
  } catch (error) {
    console.error('Partner manage GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — Create a partner record (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: callerMember } = await admin
      .from('members')
      .select('id, role, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!callerMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    const isAdmin = callerMember.is_admin || callerMember.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
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

    const body = await request.json()
    const { member_id, email, partner_type, organization, title, city, responsibilities } = body

    if (!partner_type) {
      return NextResponse.json({ error: 'partner_type is required' }, { status: 400 })
    }

    let targetMemberId = member_id

    // If email is provided but no member_id, look up or inform that member must exist
    if (!targetMemberId && email) {
      const { data: existingMember } = await admin
        .from('members')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()

      if (existingMember) {
        targetMemberId = existingMember.id
      } else {
        return NextResponse.json(
          { error: 'No member found with that email. The person must have a member account first.' },
          { status: 400 }
        )
      }
    }

    if (!targetMemberId) {
      return NextResponse.json({ error: 'member_id or email is required' }, { status: 400 })
    }

    const { data: partner, error: insertError } = await admin
      .from('kenya_trip_partners')
      .insert({
        trip_id: trip.id,
        member_id: targetMemberId,
        partner_type,
        organization: organization?.trim() || null,
        title: title?.trim() || null,
        city: city?.trim() || null,
        responsibilities: responsibilities?.trim() || null,
        can_propose_changes: true,
        is_active: true,
        invited_by_member_id: callerMember.id,
      })
      .select('*, members(first_name, last_name, email, phone)')
      .single()

    if (insertError) {
      // Check for unique violation
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'This member is already a partner for this trip' }, { status: 409 })
      }
      console.error('Partner insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
    }

    return NextResponse.json({ partner })
  } catch (error) {
    console.error('Partner manage POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — Deactivate a partner (admin only)
export async function DELETE(request: NextRequest) {
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
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Partner id is required' }, { status: 400 })
    }

    const { error: updateError } = await admin
      .from('kenya_trip_partners')
      .update({ is_active: false })
      .eq('id', id)

    if (updateError) {
      console.error('Partner deactivate error:', updateError)
      return NextResponse.json({ error: 'Failed to deactivate partner' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Partner manage DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

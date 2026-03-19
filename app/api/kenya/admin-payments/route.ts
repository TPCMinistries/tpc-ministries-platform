import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_CATEGORIES = [
  'flight_credit',
  'hotel_credit',
  'trip_sponsorship',
  'church_gift',
  'scholarship',
  'admin_adjustment',
  'refund_credit',
  'other',
] as const

// Verify caller is staff/admin
async function verifyFinancialAccess() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await admin
    .from('members')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!member || !['admin', 'staff'].includes(member.role)) return null
  return member
}

// GET — list admin payments for a participant
export async function GET(request: NextRequest) {
  try {
    const member = await verifyFinancialAccess()
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized — staff/admin only' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participant_id')

    let query = admin
      .from('kenya_trip_admin_payments')
      .select('*, members!created_by_member_id(first_name, last_name)')
      .order('created_at', { ascending: false })

    if (participantId) {
      query = query.eq('participant_id', participantId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching admin payments:', error)
      return NextResponse.json({ error: 'Failed to fetch admin payments' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Admin payments GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — create admin payment credit
export async function POST(request: NextRequest) {
  try {
    const member = await verifyFinancialAccess()
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized — staff/admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { participant_id, trip_id, amount, category, description } = body

    // Validate required fields (trip_id is optional — will be looked up from participant)
    if (!participant_id) {
      return NextResponse.json({ error: 'Missing required field: participant_id' }, { status: 400 })
    }
    if (amount === undefined || amount === null || amount === '') {
      return NextResponse.json({ error: 'Missing required field: amount' }, { status: 400 })
    }
    if (!category) {
      return NextResponse.json({ error: 'Missing required field: category' }, { status: 400 })
    }

    // Validate amount
    const parsedAmount = parseFloat(String(amount))
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Look up trip_id from participant if not provided
    let resolvedTripId = trip_id
    if (!resolvedTripId) {
      const { data: participant } = await admin
        .from('kenya_trip_participants')
        .select('trip_id')
        .eq('id', participant_id)
        .single()
      resolvedTripId = participant?.trip_id
    }

    if (!resolvedTripId) {
      return NextResponse.json({ error: 'Could not determine trip_id for participant' }, { status: 400 })
    }

    // Insert admin payment
    const { data: payment, error: insertError } = await admin
      .from('kenya_trip_admin_payments')
      .insert({
        participant_id,
        trip_id: resolvedTripId,
        amount: parsedAmount,
        category,
        description: description || null,
        created_by_member_id: member.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating admin payment:', insertError)
      return NextResponse.json({ error: 'Failed to create admin payment' }, { status: 500 })
    }

    // Fetch updated participant balance
    const { data: participant } = await admin
      .from('kenya_trip_participants')
      .select('id, first_name, last_name, trip_cost, scholarship_amount, amount_paid, amount_raised, admin_credits_total, payment_status')
      .eq('id', participant_id)
      .single()

    const tripCost = Number(participant?.trip_cost) || 3500
    const scholarship = Number(participant?.scholarship_amount) || 0
    const selfPayments = Number(participant?.amount_paid) || 0
    const fundraising = Number(participant?.amount_raised) || 0
    const adminCredits = Number(participant?.admin_credits_total) || 0
    const remaining = tripCost - scholarship - selfPayments - fundraising - adminCredits

    return NextResponse.json({
      success: true,
      payment,
      balance: {
        tripCost,
        scholarship,
        selfPayments,
        fundraising,
        adminCredits,
        totalCovered: scholarship + selfPayments + fundraising + adminCredits,
        remaining: Math.max(0, remaining),
        surplus: remaining < 0 ? Math.abs(remaining) : 0,
        paymentStatus: participant?.payment_status || 'pending',
      },
    })
  } catch (error) {
    console.error('Admin payments POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — remove an admin payment
export async function DELETE(request: NextRequest) {
  try {
    const member = await verifyFinancialAccess()
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized — staff/admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing required query param: id' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error } = await admin
      .from('kenya_trip_admin_payments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting admin payment:', error)
      return NextResponse.json({ error: 'Failed to delete admin payment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin payments DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

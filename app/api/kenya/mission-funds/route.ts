import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_SOURCE_TYPES = [
  'church_allocation',
  'grant',
  'corporate_sponsor',
  'individual_donor',
  'fundraising_event',
  'online_campaign',
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

// GET — list mission fund entries for a trip
export async function GET(request: NextRequest) {
  try {
    const member = await verifyFinancialAccess()
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized — staff/admin only' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const tripId = searchParams.get('trip_id')

    let query = admin
      .from('kenya_trip_mission_funds')
      .select('*, members!created_by_member_id(first_name, last_name)')
      .order('received_date', { ascending: false })

    if (tripId) {
      query = query.eq('trip_id', tripId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching mission funds:', error)
      return NextResponse.json({ error: 'Failed to fetch mission funds' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Mission funds GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — create mission fund entry
export async function POST(request: NextRequest) {
  try {
    const member = await verifyFinancialAccess()
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized — staff/admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { trip_id, source_type, amount, donor_name, description, received_date } = body

    if (!trip_id) {
      return NextResponse.json({ error: 'Missing required field: trip_id' }, { status: 400 })
    }
    if (!source_type) {
      return NextResponse.json({ error: 'Missing required field: source_type' }, { status: 400 })
    }
    if (amount === undefined || amount === null || amount === '') {
      return NextResponse.json({ error: 'Missing required field: amount' }, { status: 400 })
    }

    const parsedAmount = parseFloat(String(amount))
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    if (!VALID_SOURCE_TYPES.includes(source_type as typeof VALID_SOURCE_TYPES[number])) {
      return NextResponse.json(
        { error: `Invalid source_type. Must be one of: ${VALID_SOURCE_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: fund, error: insertError } = await admin
      .from('kenya_trip_mission_funds')
      .insert({
        trip_id,
        source_type,
        amount: parsedAmount,
        donor_name: donor_name || null,
        description: description || null,
        received_date: received_date || new Date().toISOString().split('T')[0],
        created_by_member_id: member.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating mission fund entry:', insertError)
      return NextResponse.json({ error: 'Failed to create mission fund entry' }, { status: 500 })
    }

    return NextResponse.json({ success: true, fund })
  } catch (error) {
    console.error('Mission funds POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — remove a mission fund entry
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
      .from('kenya_trip_mission_funds')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting mission fund entry:', error)
      return NextResponse.json({ error: 'Failed to delete mission fund entry' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mission funds DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

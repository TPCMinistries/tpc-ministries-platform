import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth-server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authResult = await requireStaff()
  if (authResult instanceof NextResponse) return authResult

  try {
    const { firstName, lastName, track, tripId } = await request.json()

    if (!firstName?.trim()) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: participant, error } = await adminClient
      .from('kenya_trip_participants')
      .insert({
        trip_id: tripId,
        first_name: firstName.trim(),
        last_name: (lastName || '').trim(),
        email: '',
        phone: '',
        application_status: 'approved',
        payment_status: 'pending',
        passport_status: 'pending',
        visa_status: 'not_started',
        flight_status: '⬜ Not booked',
        hotel_status: '⬜ Not booked',
        booking_type: 'TBD',
        service_track: track || 'Flex',
        fundraising_goal: 3500,
        amount_raised: 0,
        team_leader: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, participant })
  } catch (error) {
    console.error('Kenya add participant error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

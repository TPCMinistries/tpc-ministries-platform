import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check admin/staff access
  const { data: member } = await supabase
    .from('members')
    .select('id, is_admin, role')
    .eq('user_id', user.id)
    .single()

  if (!member || (!member.is_admin && member.role !== 'admin' && member.role !== 'staff')) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

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
  } catch (error: any) {
    console.error('Kenya add participant error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

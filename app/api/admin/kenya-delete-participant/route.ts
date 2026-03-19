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
    const { participantId } = await request.json()

    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Soft archive — set status to 'removed' instead of hard delete
    // This preserves all related data and allows restoration
    const { error } = await adminClient
      .from('kenya_trip_participants')
      .update({ application_status: 'removed' })
      .eq('id', participantId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Kenya archive participant error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth-server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authResult = await requireStaff()
  if (authResult instanceof NextResponse) return authResult

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
  } catch (error) {
    console.error('Kenya archive participant error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

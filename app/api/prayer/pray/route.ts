import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication (optional - can allow anonymous prayers)
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { prayer_request_id } = body

    if (!prayer_request_id) {
      return NextResponse.json(
        { error: 'Prayer request ID is required' },
        { status: 400 }
      )
    }

    // Get member ID if user is logged in
    let memberId: string | null = null
    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      memberId = member?.id || null
    }

    // Check if user already prayed for this request (if logged in)
    if (memberId) {
      const { data: existingPrayer } = await supabase
        .from('prayer_interactions')
        .select('id')
        .eq('prayer_request_id', prayer_request_id)
        .eq('member_id', memberId)
        .single()

      if (existingPrayer) {
        return NextResponse.json(
          { message: 'You have already prayed for this request' },
          { status: 200 }
        )
      }
    }

    // Record the prayer interaction (only if user is logged in)
    if (memberId) {
      const { error: interactionError } = await supabase
        .from('prayer_interactions')
        .insert([
          {
            prayer_request_id,
            member_id: memberId,
          },
        ])

      if (interactionError) {
        console.error('Error recording prayer interaction:', interactionError)
        return NextResponse.json(
          { error: 'Failed to record prayer' },
          { status: 500 }
        )
      }
    }

    // Increment prayer count
    const { error: updateError } = await supabase.rpc('increment_prayer_count', {
      request_id: prayer_request_id,
    })

    if (updateError) {
      // If RPC doesn't exist, do manual update
      const { error: manualUpdateError } = await supabase
        .from('prayer_requests')
        .update({ prayer_count: supabase.sql`prayer_count + 1` })
        .eq('id', prayer_request_id)

      if (manualUpdateError) {
        console.error('Error updating prayer count:', manualUpdateError)
        return NextResponse.json(
          { error: 'Failed to update prayer count' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Thank you for praying!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in prayer pray API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

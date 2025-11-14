import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get subscription data from request
    const subscription = await request.json()

    // Save subscription to database
    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .upsert({
        member_id: member.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        user_agent: request.headers.get('user-agent'),
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: 'member_id,endpoint',
      })

    if (insertError) {
      console.error('Error saving subscription:', insertError)
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

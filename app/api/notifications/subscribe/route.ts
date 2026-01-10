import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try both user_id and auth_user_id for compatibility
    let { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      const { data: memberAlt } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      member = memberAlt
    }

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const { endpoint, keys, deviceName } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    // Upsert the subscription
    const { data: subscription, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        member_id: member.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        device_name: deviceName || request.headers.get('user-agent')?.substring(0, 100) || 'Unknown Device',
        is_active: true,
        updated_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: 'member_id,endpoint'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving subscription:', error)
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed to notifications'
    })

  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get subscription status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      const { data: memberAlt } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      member = memberAlt
    }

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('id, device_name, created_at, last_used_at')
      .eq('member_id', member.id)
      .eq('is_active', true)

    return NextResponse.json({
      success: true,
      isSubscribed: (subscriptions?.length || 0) > 0,
      subscriptionCount: subscriptions?.length || 0,
      devices: subscriptions || []
    })

  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      const { data: memberAlt } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      member = memberAlt
    }

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('id')

    if (subscriptionId) {
      // Delete specific subscription
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('member_id', member.id)
        .eq('id', subscriptionId)
    } else {
      // Deactivate all subscriptions for this member
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('member_id', member.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed from notifications'
    })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

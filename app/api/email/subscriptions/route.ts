import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get member's subscriptions or admin get all
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const stats = searchParams.get('stats')

    // Admin getting subscription stats
    if (stats === 'true' && member.is_admin) {
      const { data: subscriptionStats } = await supabase
        .from('email_subscriptions')
        .select('subscription_type, is_subscribed')

      const statsByType: Record<string, { subscribed: number; unsubscribed: number }> = {}

      ;(subscriptionStats || []).forEach((sub: any) => {
        if (!statsByType[sub.subscription_type]) {
          statsByType[sub.subscription_type] = { subscribed: 0, unsubscribed: 0 }
        }
        if (sub.is_subscribed) {
          statsByType[sub.subscription_type].subscribed++
        } else {
          statsByType[sub.subscription_type].unsubscribed++
        }
      })

      return NextResponse.json({
        success: true,
        stats: statsByType
      })
    }

    // Admin getting specific member's subscriptions
    if (memberId && member.is_admin) {
      const { data: subscriptions, error } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('member_id', memberId)

      if (error) throw error

      return NextResponse.json({
        success: true,
        subscriptions: subscriptions || []
      })
    }

    // Member getting their own subscriptions
    const { data: subscriptions, error } = await supabase
      .from('email_subscriptions')
      .select('*')
      .eq('member_id', member.id)

    if (error) throw error

    // If no subscriptions exist, create defaults
    if (!subscriptions || subscriptions.length === 0) {
      const defaultTypes = [
        'daily_devotional',
        'weekly_newsletter',
        'prophetic_updates',
        'teaching_releases',
        'announcements'
      ]

      const defaultSubs = defaultTypes.map(type => ({
        member_id: member.id,
        subscription_type: type,
        is_subscribed: true,
        frequency: 'default'
      }))

      const { data: newSubs } = await supabase
        .from('email_subscriptions')
        .insert(defaultSubs)
        .select()

      return NextResponse.json({
        success: true,
        subscriptions: newSubs || []
      })
    }

    return NextResponse.json({
      success: true,
      subscriptions
    })

  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({
      error: 'Failed to fetch subscriptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update subscriptions
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const { memberId, subscriptions, unsubscribeAll } = body

    // Determine which member to update
    const targetMemberId = (memberId && member.is_admin) ? memberId : member.id

    // Unsubscribe all
    if (unsubscribeAll) {
      await supabase
        .from('email_subscriptions')
        .update({ is_subscribed: false, updated_at: new Date().toISOString() })
        .eq('member_id', targetMemberId)

      return NextResponse.json({
        success: true,
        message: 'Unsubscribed from all emails'
      })
    }

    // Update individual subscriptions
    if (subscriptions && Array.isArray(subscriptions)) {
      for (const sub of subscriptions) {
        await supabase
          .from('email_subscriptions')
          .upsert({
            member_id: targetMemberId,
            subscription_type: sub.subscription_type,
            is_subscribed: sub.is_subscribed,
            frequency: sub.frequency || 'default',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'member_id,subscription_type'
          })
      }
    }

    // Fetch updated subscriptions
    const { data: updatedSubs } = await supabase
      .from('email_subscriptions')
      .select('*')
      .eq('member_id', targetMemberId)

    return NextResponse.json({
      success: true,
      subscriptions: updatedSubs || [],
      message: 'Subscriptions updated successfully'
    })

  } catch (error) {
    console.error('Error updating subscriptions:', error)
    return NextResponse.json({
      error: 'Failed to update subscriptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

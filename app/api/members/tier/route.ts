import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get member's subscription
    const { data: subscription, error: subError } = await supabase
      .from('member_subscriptions')
      .select(`
        id,
        tier_id,
        status,
        current_period_end,
        membership_tiers:tier_id (
          id,
          name,
          slug,
          price_monthly,
          price_annual,
          benefits
        )
      `)
      .eq('member_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // If no active subscription, return free tier
    if (subError || !subscription) {
      const { data: freeTier } = await supabase
        .from('membership_tiers')
        .select('*')
        .eq('slug', 'free')
        .single()

      return NextResponse.json(
        {
          tier: freeTier || { name: 'Free', slug: 'free', benefits: [] },
          subscription: null,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        tier: subscription.membership_tiers,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching member tier:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

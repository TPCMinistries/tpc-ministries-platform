import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { tier_id, billing_cycle = 'monthly' } = body

    if (!tier_id) {
      return NextResponse.json(
        { error: 'Missing tier_id' },
        { status: 400 }
      )
    }

    // Get tier details
    const { data: tier, error: tierError } = await supabase
      .from('membership_tiers')
      .select('*')
      .eq('id', tier_id)
      .single()

    if (tierError || !tier) {
      return NextResponse.json(
        { error: 'Tier not found' },
        { status: 404 }
      )
    }

    // TODO: Create Stripe checkout session
    // For now, return placeholder data
    const checkoutUrl = `/checkout/success?tier=${tier.slug}&billing=${billing_cycle}`

    return NextResponse.json(
      {
        message: 'Checkout session created (placeholder)',
        checkout_url: checkoutUrl,
        tier: tier.name,
        amount: billing_cycle === 'monthly' ? tier.price_monthly : tier.price_annual,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

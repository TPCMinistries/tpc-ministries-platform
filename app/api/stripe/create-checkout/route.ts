import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

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

    // Get member details
    const { data: member } = await supabase
      .from('members')
      .select('id, email, first_name, last_name')
      .eq('user_id', user.id)
      .single()

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'
    const stripe = getStripe()

    // Determine price based on billing cycle
    const amount = billing_cycle === 'monthly' ? tier.price_monthly : tier.price_annual
    const interval = billing_cycle === 'monthly' ? 'month' : 'year'

    // Create Stripe checkout session for membership subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier.name} Membership`,
              description: tier.description || `TPC Ministries ${tier.name} membership`,
            },
            recurring: {
              interval: interval,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      customer_email: member?.email || user.email,
      client_reference_id: user.id,
      metadata: {
        tier_id: tier.id,
        tier_slug: tier.slug,
        tier_name: tier.name,
        user_id: user.id,
        member_id: member?.id || '',
        billing_cycle: billing_cycle,
        type: 'membership',
      },
      success_url: `${baseUrl}/member/account?tab=membership&success=true&tier=${tier.slug}`,
      cancel_url: `${baseUrl}/member/account?tab=membership&canceled=true`,
    })

    return NextResponse.json(
      {
        checkout_url: session.url,
        session_id: session.id,
        tier: tier.name,
        amount: amount,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error creating membership checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

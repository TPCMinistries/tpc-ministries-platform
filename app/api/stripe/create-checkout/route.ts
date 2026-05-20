import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getBaseUrl } from '@/lib/base-url'
import {
  MEMBERSHIP_TIERS,
  isMembershipTier,
  getStripePriceId,
  type BillingCycle,
} from '@/lib/membership/tiers'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const tier_slug = String(body.tier_slug || '')
    const billing_cycle: BillingCycle = body.billing_cycle === 'annual' ? 'annual' : 'monthly'

    if (!isMembershipTier(tier_slug)) {
      return NextResponse.json({ error: 'Invalid tier_slug' }, { status: 400 })
    }

    const tier = MEMBERSHIP_TIERS[tier_slug]
    const amount = tier.price[billing_cycle]
    const interval = billing_cycle === 'monthly' ? 'month' : 'year'

    const { data: member } = await supabase
      .from('members')
      .select('id, email, first_name, last_name')
      .eq('user_id', user.id)
      .single()

    const baseUrl = getBaseUrl()
    const stripe = getStripe()

    // Prefer a real Stripe Price ID if the env var is set — catalog price gives
    // better analytics + Customer Portal support. Otherwise build the price
    // inline so the flow works in any env without configuration.
    const priceId = getStripePriceId(tier_slug, billing_cycle)
    const lineItem = priceId
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency: 'usd' as const,
            product_data: {
              name: `${tier.name} Membership`,
              description: tier.description,
            },
            recurring: { interval: interval as 'month' | 'year' },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [lineItem as any],
      customer_email: member?.email || user.email,
      client_reference_id: user.id,
      metadata: {
        type: 'membership',
        tier_slug,
        billing_cycle,
        user_id: user.id,
        member_id: member?.id || '',
      },
      subscription_data: {
        metadata: {
          type: 'membership',
          tier_slug,
          billing_cycle,
          user_id: user.id,
          member_id: member?.id || '',
        },
      },
      success_url: `${baseUrl}/member/account?tab=membership&success=true&tier=${tier_slug}`,
      cancel_url: `${baseUrl}/partner/upgrade?tier=${tier_slug}&canceled=true`,
    })

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
      tier: tier.name,
      amount,
    })
  } catch (error: any) {
    console.error('Error creating membership checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

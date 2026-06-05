import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST() {
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'
    const stripe = getStripe()

    // Get member's Stripe customer ID from donations or subscriptions
    const { data: donation } = await supabase
      .from('donations')
      .select('stripe_session_id')
      .eq('user_id', user.id)
      .not('stripe_session_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let customerId: string | null = null

    // Try to find customer from a previous session
    if (donation?.stripe_session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(donation.stripe_session_id)
        if (session.customer) {
          customerId = session.customer as string
        }
      } catch (e) {
        console.warn('Could not retrieve Stripe session:', e)
      }
    }

    // If no customer found, search by email
    if (!customerId && user.email) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })
      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      }
    }

    // If still no customer, create one
    if (!customerId && user.email) {
      const { data: member } = await supabase
        .from('members')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single()

      const customer = await stripe.customers.create({
        email: user.email,
        name: member ? `${member.first_name} ${member.last_name}` : undefined,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Unable to find or create customer account' },
        { status: 400 }
      )
    }

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/member/account?tab=membership`,
    })

    return NextResponse.json(
      {
        portal_url: portalSession.url,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

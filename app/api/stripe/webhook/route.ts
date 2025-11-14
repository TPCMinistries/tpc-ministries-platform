import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set - skipping signature verification')
      event = JSON.parse(body)
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await recordDonation(session)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await recordRecurringDonation(invoice)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function recordDonation(session: Stripe.Checkout.Session) {
  const supabase = await createClient()

  const donationData = {
    amount: (session.amount_total || 0) / 100,
    type: session.metadata?.type || 'general',
    frequency: session.metadata?.frequency || 'once',
    user_id: session.metadata?.user_id !== 'anonymous' ? session.metadata?.user_id : null,
    donor_email: session.customer_email || session.customer_details?.email,
    donor_name: session.metadata?.donor_name || 'Anonymous',
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent as string,
    stripe_subscription_id: session.subscription as string | null,
    status: 'completed',
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('donations').insert(donationData)

  if (error) {
    console.error('Error recording donation:', error)
    throw error
  }

  console.log('Donation recorded:', donationData)
}

async function recordRecurringDonation(invoice: Stripe.Invoice) {
  const supabase = await createClient()
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

  const donationData = {
    amount: (invoice.amount_paid || 0) / 100,
    type: subscription.metadata?.type || 'general',
    frequency: 'monthly',
    user_id: subscription.metadata?.user_id !== 'anonymous' ? subscription.metadata?.user_id : null,
    donor_email: invoice.customer_email,
    donor_name: subscription.metadata?.donor_name || 'Anonymous',
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: invoice.subscription as string,
    status: 'completed',
    created_at: new Date().toISOString(),
  }

  const { error} = await supabase.from('donations').insert(donationData)

  if (error) {
    console.error('Error recording recurring donation:', error)
    throw error
  }

  console.log('Recurring donation recorded:', donationData)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('donations')
    .update({ subscription_status: 'canceled', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }

  console.log('Subscription canceled:', subscription.id)
}

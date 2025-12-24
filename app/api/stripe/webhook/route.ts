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

  // Auto-upgrade giver to partner role
  await upgradeGiverToPartner(supabase, donationData.user_id, donationData.donor_email, donationData.amount)
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

  // Auto-upgrade giver to partner role
  await upgradeGiverToPartner(supabase, donationData.user_id, donationData.donor_email, donationData.amount)
}

// Auto-upgrade givers to partner role
async function upgradeGiverToPartner(
  supabase: any,
  userId: string | null | undefined,
  email: string | null | undefined,
  amount: number
) {
  try {
    // Find member by user_id or email
    let member = null

    if (userId) {
      const { data } = await supabase
        .from('members')
        .select('id, role, tier')
        .eq('user_id', userId)
        .single()
      member = data
    }

    if (!member && email) {
      const { data } = await supabase
        .from('members')
        .select('id, role, tier')
        .eq('email', email)
        .single()
      member = data
    }

    if (!member) {
      console.log('No member found for giver - cannot auto-upgrade')
      return
    }

    // Only upgrade if current role is 'free' or 'member'
    const currentRole = member.role || member.tier || 'free'
    if (!['free', 'member'].includes(currentRole)) {
      console.log(`Member already has ${currentRole} role - no upgrade needed`)
      return
    }

    // Upgrade to partner
    const { error } = await supabase
      .from('members')
      .update({
        role: 'partner',
        tier: 'partner', // Also update legacy tier field
        role_updated_at: new Date().toISOString(),
        role_upgrade_reason: `Auto-upgraded from giving $${amount}`,
      })
      .eq('id', member.id)

    if (error) {
      console.error('Error upgrading member to partner:', error)
      return
    }

    console.log(`Member ${member.id} auto-upgraded to partner role after giving $${amount}`)
  } catch (error) {
    console.error('Error in upgradeGiverToPartner:', error)
  }
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

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

// Use service role for webhook (no user context)
const supabase = createAdminClient()

type LegacyInvoice = Stripe.Invoice & {
  subscription_details?: {
    metadata?: Stripe.Metadata | null
    subscription?: string | Stripe.Subscription
  } | null
  payment_intent?: string | Stripe.PaymentIntent | null
  subscription?: string | Stripe.Subscription | null
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

function getInvoiceSubscriptionDetails(invoice: Stripe.Invoice) {
  const legacyInvoice = invoice as LegacyInvoice
  return invoice.parent?.subscription_details || legacyInvoice.subscription_details || null
}

function getStripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

function getInvoicePaymentIntentId(invoice: Stripe.Invoice) {
  const legacyInvoice = invoice as LegacyInvoice
  const invoicePayment = invoice.payments?.data[0]?.payment
  return getStripeId(legacyInvoice.payment_intent) || getStripeId(invoicePayment?.payment_intent)
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const legacyInvoice = invoice as LegacyInvoice
  const subscriptionDetails = getInvoiceSubscriptionDetails(invoice)
  return getStripeId(subscriptionDetails?.subscription) || getStripeId(legacyInvoice.subscription)
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    console.error('Webhook signature verification failed:', getErrorMessage(err))
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event. If a DB write fails, return 500 so Stripe retries rather
  // than silently dropping a real (already-charged) payment.
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Route based on metadata type
      const metadataType = session.metadata?.type

      if (metadataType === 'kenya_trip_payment') {
        // ========== TRIP PAYMENT (full, deposit, custom) ==========
        await handleTripPayment(session)
      } else if (session.metadata?.donation_type === 'kenya_trip') {
        // ========== FUNDRAISING DONATION ==========
        await handleDonation(session)
      }
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice

      // Handle installment plan payments
      if (getInvoiceSubscriptionDetails(invoice)?.metadata?.type === 'kenya_trip_installment') {
        await handleInstallmentPayment(invoice)
      }
    }
  } catch (err: unknown) {
    console.error('Kenya webhook handler failed, asking Stripe to retry:', getErrorMessage(err))
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleTripPayment(session: Stripe.Checkout.Session) {
  const { participant_id, trip_id, payment_type } = session.metadata || {}
  const amount = (session.amount_total || 0) / 100

  // Record payment
  if (participant_id) {
    const { error: payError } = await supabase.from('kenya_trip_payments').insert({
      participant_id,
      trip_id: trip_id || null,
      amount,
      payment_number: 1,
      total_payments: payment_type === 'full' ? 1 : payment_type === 'deposit' ? 1 : null,
      description: payment_type === 'deposit' ? 'Deposit' : payment_type === 'full' ? 'Full payment' : 'Payment',
      status: 'paid',
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_checkout_session_id: session.id,
      paid_at: new Date().toISOString(),
    })
    if (payError) throw payError

    // Update participant payment status
    const { data: participant } = await supabase
      .from('kenya_trip_participants')
      .select('trip_cost, amount_paid, scholarship_amount, amount_raised, admin_credits_total')
      .eq('id', participant_id)
      .single()

    if (participant) {
      const tripCost = Number(participant.trip_cost) || 3500
      const scholarship = Number(participant.scholarship_amount) || 0
      const newPaid = (Number(participant.amount_paid) || 0) + amount
      const amountRaised = Number(participant.amount_raised) || 0
      const adminCredits = Number(participant.admin_credits_total) || 0
      const remaining = tripCost - scholarship - newPaid - amountRaised - adminCredits

      await supabase
        .from('kenya_trip_participants')
        .update({
          amount_paid: newPaid,
          payment_status: remaining <= 0 ? 'paid' : 'partial',
        })
        .eq('id', participant_id)
    }
  }

  console.log(`Kenya trip payment completed: $${amount} (${payment_type}) for participant ${participant_id}`)
}

async function handleDonation(session: Stripe.Checkout.Session) {
  const {
    participant_id,
    trip_id,
    donor_name,
    donor_email,
    message,
    is_anonymous,
    show_name_publicly,
    net_amount,
    fees_covered,
  } = session.metadata || {}

  try {
    const { error: updateError } = await supabase
      .from('kenya_trip_donations')
      .update({
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_checkout_session_id', session.id)

    if (updateError) {
      console.error('Failed to update donation, inserting instead:', updateError)

      const { error: insertError } = await supabase.from('kenya_trip_donations').insert({
        participant_id,
        trip_id,
        donor_name,
        donor_email,
        is_anonymous: is_anonymous === 'true',
        show_name_publicly: show_name_publicly === 'true',
        amount: parseFloat(String(session.amount_total! / 100)),
        fees_covered: parseFloat(fees_covered || '0'),
        net_amount: parseFloat(net_amount || String(session.amount_total! / 100)),
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        payment_method: 'stripe',
        status: 'completed',
        message: message || null,
        is_manual_entry: false,
      })
      // Neither update nor insert recorded the paid donation — let Stripe retry.
      if (insertError) throw insertError
    }

    console.log(`Kenya donation completed: $${net_amount} for participant ${participant_id}`)
  } catch (error) {
    console.error('Error processing donation webhook:', error)
    throw error
  }
}

async function handleInstallmentPayment(invoice: Stripe.Invoice) {
  const metadata = getInvoiceSubscriptionDetails(invoice)?.metadata || {}
  const { participant_id, trip_id, total_payments } = metadata
  const amount = (invoice.amount_paid || 0) / 100

  try {
    // Count existing payments to determine payment number
    const { count } = await supabase
      .from('kenya_trip_payments')
      .select('id', { count: 'exact' })
      .eq('participant_id', participant_id)
      .eq('status', 'paid')

    const paymentNumber = (count || 0) + 1
    const totalPayments = parseInt(total_payments || '0')

    await supabase.from('kenya_trip_payments').insert({
      participant_id,
      trip_id: trip_id || null,
      amount,
      payment_number: paymentNumber,
      total_payments: totalPayments,
      description: `Installment ${paymentNumber} of ${totalPayments}`,
      status: 'paid',
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: getInvoicePaymentIntentId(invoice),
      paid_at: new Date().toISOString(),
    })

    // Update participant amount_paid
    const { data: participant } = await supabase
      .from('kenya_trip_participants')
      .select('trip_cost, amount_paid, scholarship_amount, amount_raised, admin_credits_total')
      .eq('id', participant_id)
      .single()

    if (participant) {
      const tripCost = Number(participant.trip_cost) || 3500
      const scholarship = Number(participant.scholarship_amount) || 0
      const newPaid = (Number(participant.amount_paid) || 0) + amount
      const amountRaised = Number(participant.amount_raised) || 0
      const adminCredits = Number(participant.admin_credits_total) || 0
      const remaining = tripCost - scholarship - newPaid - amountRaised - adminCredits

      await supabase
        .from('kenya_trip_participants')
        .update({
          amount_paid: newPaid,
          payment_status: remaining <= 0 ? 'paid' : 'partial',
        })
        .eq('id', participant_id)

      // Cancel subscription if fully paid
      const subscriptionId = getInvoiceSubscriptionId(invoice)
      if (remaining <= 0 && subscriptionId) {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
          await stripe.subscriptions.cancel(subscriptionId)
          console.log(`Auto-canceled subscription for fully paid participant ${participant_id}`)
        } catch (cancelError) {
          console.error('Failed to cancel completed subscription:', cancelError)
        }
      }
    }

    console.log(`Kenya installment ${paymentNumber}/${totalPayments}: $${amount} for participant ${participant_id}`)
  } catch (error) {
    console.error('Error processing installment payment:', error)
  }
}

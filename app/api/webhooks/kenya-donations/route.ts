import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

// Use service role for webhook (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
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
    if (invoice.subscription_details?.metadata?.type === 'kenya_trip_installment') {
      await handleInstallmentPayment(invoice)
    }
  }

  return NextResponse.json({ received: true })
}

async function handleTripPayment(session: Stripe.Checkout.Session) {
  const { participant_id, trip_id, payment_type } = session.metadata || {}
  const amount = (session.amount_total || 0) / 100

  try {
    // Record payment
    if (participant_id) {
      await supabase.from('kenya_trip_payments').insert({
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

      // Update participant payment status
      const { data: participant } = await supabase
        .from('kenya_trip_participants')
        .select('trip_cost, amount_paid, scholarship_amount')
        .eq('id', participant_id)
        .single()

      if (participant) {
        const tripCost = Number(participant.trip_cost) || 3500
        const scholarship = Number(participant.scholarship_amount) || 0
        const newPaid = (Number(participant.amount_paid) || 0) + amount
        const remaining = tripCost - scholarship - newPaid

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
  } catch (error) {
    console.error('Error processing trip payment:', error)
  }
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
      console.error('Failed to update donation:', updateError)

      await supabase.from('kenya_trip_donations').insert({
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
    }

    console.log(`Kenya donation completed: $${net_amount} for participant ${participant_id}`)
  } catch (error) {
    console.error('Error processing donation webhook:', error)
  }
}

async function handleInstallmentPayment(invoice: Stripe.Invoice) {
  const metadata = invoice.subscription_details?.metadata || {}
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
      stripe_payment_intent_id: invoice.payment_intent as string,
      paid_at: new Date().toISOString(),
    })

    // Update participant amount_paid
    const { data: participant } = await supabase
      .from('kenya_trip_participants')
      .select('trip_cost, amount_paid, scholarship_amount')
      .eq('id', participant_id)
      .single()

    if (participant) {
      const tripCost = Number(participant.trip_cost) || 3500
      const scholarship = Number(participant.scholarship_amount) || 0
      const newPaid = (Number(participant.amount_paid) || 0) + amount
      const remaining = tripCost - scholarship - newPaid

      await supabase
        .from('kenya_trip_participants')
        .update({
          amount_paid: newPaid,
          payment_status: remaining <= 0 ? 'paid' : 'partial',
        })
        .eq('id', participant_id)

      // Cancel subscription if fully paid
      if (remaining <= 0 && invoice.subscription) {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
          await stripe.subscriptions.cancel(invoice.subscription as string)
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

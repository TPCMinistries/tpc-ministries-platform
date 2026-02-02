import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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
    event = stripe.webhooks.constructEvent(
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

    // Check if this is a Kenya trip donation
    if (session.metadata?.donation_type !== 'kenya_trip') {
      return NextResponse.json({ received: true, skipped: true })
    }

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
    } = session.metadata

    try {
      // Update the donation record to completed
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

        // If no existing record, create one (backup)
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

      // The database trigger will automatically update the participant's amount_raised

      console.log(`Kenya donation completed: $${net_amount} for participant ${participant_id}`)

    } catch (error) {
      console.error('Error processing Kenya donation webhook:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

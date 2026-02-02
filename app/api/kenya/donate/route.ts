import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      participantId,
      amount,
      netAmount,
      feesCovered,
      donorName,
      donorEmail,
      message,
      isAnonymous,
      showNamePublicly,
    } = body

    if (!participantId || !amount || amount < 10) {
      return NextResponse.json({ error: 'Invalid donation amount' }, { status: 400 })
    }

    if (!donorEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get participant info
    const { data: participant, error: participantError } = await supabase
      .from('kenya_trip_participants')
      .select('id, first_name, last_name, trip_id')
      .eq('id', participantId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Donation for ${participant.first_name} ${participant.last_name}`,
              description: `Kenya Kingdom Impact Trip 2025 - Support ${participant.first_name}'s mission`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/kenya/support/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/kenya/support/${participant.first_name.toLowerCase()}-${participant.last_name.toLowerCase()}`,
      customer_email: donorEmail,
      metadata: {
        participant_id: participantId,
        trip_id: participant.trip_id,
        donor_name: donorName || 'Anonymous',
        donor_email: donorEmail,
        message: message || '',
        is_anonymous: isAnonymous ? 'true' : 'false',
        show_name_publicly: showNamePublicly ? 'true' : 'false',
        net_amount: netAmount.toString(),
        fees_covered: feesCovered.toString(),
        donation_type: 'kenya_trip',
      },
    })

    // Create pending donation record
    await supabase.from('kenya_trip_donations').insert({
      participant_id: participantId,
      trip_id: participant.trip_id,
      donor_name: donorName || 'Anonymous',
      donor_email: donorEmail,
      is_anonymous: isAnonymous,
      show_name_publicly: showNamePublicly,
      amount: amount,
      fees_covered: feesCovered,
      net_amount: netAmount,
      stripe_checkout_session_id: session.id,
      payment_method: 'stripe',
      status: 'pending',
      message: message || null,
      is_manual_entry: false,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Donation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

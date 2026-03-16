import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, designation, donorName, donorEmail } = body

    // Validate amount
    if (!amount || isNaN(amount) || amount < 1) {
      return NextResponse.json({ error: 'Minimum contribution is $1.00' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get active trip
    const { data: trip } = await supabase
      .from('kenya_trips')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Create pending fund record
    const { data: fundRecord, error: insertError } = await supabase
      .from('kenya_supply_funds')
      .insert({
        trip_id: trip?.id || null,
        donor_name: donorName || 'Anonymous',
        donor_email: donorEmail || null,
        amount,
        designation: designation || 'general',
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating fund record:', insertError)
      return NextResponse.json({ error: 'Failed to process contribution' }, { status: 500 })
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3001'
    const amountInCents = Math.round(amount * 100)

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Kenya Mission Supply Fund',
              description: designation
                ? `Pack the Mission — ${designation}`
                : 'Pack the Mission — General Supply Fund',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      ...(donorEmail ? { customer_email: donorEmail } : {}),
      metadata: {
        type: 'pack-fund',
        fund_record_id: fundRecord?.id || '',
        trip_id: trip?.id || '',
        designation: designation || 'general',
      },
      success_url: `${baseUrl}/kenya/pack-the-mission?funded=true`,
      cancel_url: `${baseUrl}/kenya/pack-the-mission`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Error in pack-the-mission fund POST:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

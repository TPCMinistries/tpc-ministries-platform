import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sponsorName, sponsorEmail, sponsorshipType, amount, frequency } = body

    // Validate required fields
    if (!sponsorName || !sponsorEmail || !sponsorshipType || !amount) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sponsorEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (amount < 1) {
      return NextResponse.json({ error: 'Minimum amount is $1.00' }, { status: 400 })
    }

    const isMonthly = frequency === 'monthly'
    const supabase = createAdminClient()

    // Get active trip
    const { data: trip } = await supabase
      .from('kenya_trips')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Create pending sponsorship record
    const { data: sponsorship, error: insertError } = await supabase
      .from('kenya_sponsorships')
      .insert({
        trip_id: trip?.id || null,
        sponsor_name: sponsorName,
        sponsor_email: sponsorEmail,
        sponsorship_type: sponsorshipType,
        amount,
        frequency: isMonthly ? 'monthly' : 'one_time',
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating sponsorship record:', insertError)
      return NextResponse.json({ error: 'Failed to process sponsorship' }, { status: 500 })
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3001'
    const amountInCents = Math.round(amount * 100)

    const stripe = getStripe()

    const sessionConfig: Record<string, unknown> = {
      payment_method_types: ['card'],
      customer_email: sponsorEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Kenya Sponsorship — ${sponsorshipType}`,
              description: isMonthly
                ? `Monthly sponsorship: ${sponsorshipType}`
                : `One-time sponsorship: ${sponsorshipType}`,
            },
            unit_amount: amountInCents,
            ...(isMonthly ? { recurring: { interval: 'month' as const } } : {}),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'pack-sponsorship',
        sponsorship_record_id: sponsorship?.id || '',
        trip_id: trip?.id || '',
        sponsorship_type: sponsorshipType,
      },
      success_url: `${baseUrl}/kenya/pack-the-mission?sponsored=true`,
      cancel_url: `${baseUrl}/kenya/pack-the-mission`,
    }

    if (isMonthly) {
      sessionConfig.mode = 'subscription'
    } else {
      sessionConfig.mode = 'payment'
    }

    const session = await stripe.checkout.sessions.create(sessionConfig as Parameters<typeof stripe.checkout.sessions.create>[0])

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Error in pack-the-mission sponsorship POST:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

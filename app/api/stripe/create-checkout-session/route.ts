import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, type, frequency, donorEmail, donorName } = body

    // Validate inputs
    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!type || !['general', 'missions', 'leadership'].includes(type)) {
      return NextResponse.json({ error: 'Invalid donation type' }, { status: 400 })
    }

    if (!frequency || !['once', 'monthly'].includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 })
    }

    // Get the current user if logged in
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Determine the correct URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3001'

    const typeLabels = {
      general: 'General Ministry',
      missions: 'Global Missions',
      leadership: 'Leadership Support',
    }

    if (frequency === 'monthly') {
      // Create a recurring subscription
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Monthly Donation - ${typeLabels[type as keyof typeof typeLabels]}`,
                description: `Monthly recurring donation to ${typeLabels[type as keyof typeof typeLabels]}`,
              },
              recurring: {
                interval: 'month',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        customer_email: donorEmail || user?.email,
        client_reference_id: user?.id,
        metadata: {
          type,
          frequency,
          user_id: user?.id || 'anonymous',
          donor_name: donorName || 'Anonymous',
        },
        success_url: `${baseUrl}/giving/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/giving`,
      })

      return NextResponse.json({ sessionId: session.id, url: session.url })
    } else {
      // Create a one-time payment
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Donation - ${typeLabels[type as keyof typeof typeLabels]}`,
                description: `One-time donation to ${typeLabels[type as keyof typeof typeLabels]}`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        customer_email: donorEmail || user?.email,
        client_reference_id: user?.id,
        metadata: {
          type,
          frequency,
          user_id: user?.id || 'anonymous',
          donor_name: donorName || 'Anonymous',
        },
        success_url: `${baseUrl}/giving/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/giving`,
      })

      return NextResponse.json({ sessionId: session.id, url: session.url })
    }
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw
    })
    return NextResponse.json(
      {
        error: error.message || 'Failed to create checkout session',
        details: `${error.type || ''} ${error.code || ''} - ${error.message}`.trim()
      },
      { status: 500 }
    )
  }
}

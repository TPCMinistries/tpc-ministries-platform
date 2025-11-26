import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, type, frequency, donorEmail, donorName } = body

    console.log('Received donation request:', { amount, type, frequency })

    // Validate inputs
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid amount: amount is required and must be a number' }, { status: 400 })
    }

    // Stripe minimum is $0.50 USD, but we'll enforce $1 minimum for donations
    if (amount < 1) {
      return NextResponse.json({ error: 'Minimum donation amount is $1.00' }, { status: 400 })
    }

    if (!type || !['general', 'missions', 'leadership'].includes(type)) {
      return NextResponse.json({ error: 'Invalid donation type' }, { status: 400 })
    }

    if (!frequency || !['once', 'monthly'].includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 })
    }

    // Get the current user if logged in
    let user = null
    try {
      const supabase = await createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser
    } catch (supabaseError) {
      console.warn('Supabase auth error (non-fatal):', supabaseError)
      // Continue without user - anonymous donations are allowed
    }

    // Determine the correct URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3001'
    
    if (!baseUrl || baseUrl === 'http://localhost:3001') {
      console.warn('WARNING: NEXT_PUBLIC_SITE_URL not set, using fallback URL')
    }

    const typeLabels = {
      general: 'General Ministry',
      missions: 'Global Missions',
      leadership: 'Leadership Support',
    }

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100)
    
    // Validate minimum amount in cents (Stripe minimum is $0.50, but we use $1.00)
    if (amountInCents < 100) {
      return NextResponse.json({ error: 'Amount too low. Minimum is $1.00' }, { status: 400 })
    }

    console.log('Creating Stripe session:', { amountInCents, frequency, type })

    // Initialize Stripe client
    let stripe
    try {
      stripe = getStripe()
    } catch (stripeInitError: any) {
      console.error('Failed to initialize Stripe:', stripeInitError)
      return NextResponse.json(
        {
          error: 'Stripe configuration error',
          details: stripeInitError?.message || 'Failed to initialize Stripe client',
        },
        { status: 500 }
      )
    }

    if (frequency === 'monthly') {
      // Create a recurring subscription with dynamic price
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Monthly Donation',
              },
              recurring: {
                interval: 'month',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        ...(donorEmail || user?.email ? { customer_email: donorEmail || user?.email } : {}),
        ...(user?.id ? { client_reference_id: user.id } : {}),
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
      // Create a one-time payment with dynamic price
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Donation',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        ...(donorEmail || user?.email ? { customer_email: donorEmail || user?.email } : {}),
        ...(user?.id ? { client_reference_id: user.id } : {}),
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
    console.error('=== STRIPE CHECKOUT ERROR ===')
    console.error('Error object:', error)
    console.error('Error message:', error?.message)
    console.error('Error type:', error?.type)
    console.error('Error code:', error?.code)
    console.error('Error statusCode:', error?.statusCode)
    console.error('Error raw:', error?.raw)
    console.error('Stack:', error?.stack)
    console.error('===========================')

    // Check if it's a Stripe error
    if (error?.type && error?.code) {
      return NextResponse.json(
        {
          error: `Stripe error: ${error.message || 'Unknown error'}`,
          details: `${error.type} - ${error.code}: ${error.message}`,
          stripeError: true,
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
        },
        { status: 500 }
      )
    }

    // Check if it's a validation or other error
    const errorMessage = error?.message || 'Failed to create checkout session'
    const errorDetails = error?.stack || error?.toString() || 'Unknown error occurred'
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        fullError: error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'No error object'
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

// Handle ebook purchases via GET request (from Link component)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (type !== 'ebook' || !id) {
      return NextResponse.redirect(new URL('/ebooks', request.url))
    }

    // Fetch the ebook from Supabase
    const supabase = await createClient()
    const { data: ebook, error: ebookError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .eq('type', 'ebook')
      .eq('published', true)
      .single()

    if (ebookError || !ebook) {
      console.error('Ebook not found:', ebookError)
      return NextResponse.redirect(new URL('/ebooks', request.url))
    }

    // Get the current user if logged in
    let user = null
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser
    } catch (supabaseError) {
      console.warn('Supabase auth error (non-fatal):', supabaseError)
    }

    // Determine the correct URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3001'

    // Initialize Stripe
    const stripe = getStripe()

    // Create one-time payment for ebook ($9.99)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: ebook.title,
              description: ebook.description || `Ebook by ${ebook.author || 'TPC Ministries'}`,
              ...(ebook.thumbnail_url ? { images: [ebook.thumbnail_url] } : {}),
            },
            unit_amount: 999, // $9.99 in cents
          },
          quantity: 1,
        },
      ],
      ...(user?.email ? { customer_email: user.email } : {}),
      ...(user?.id ? { client_reference_id: user.id } : {}),
      metadata: {
        type: 'ebook',
        ebook_id: ebook.id,
        ebook_title: ebook.title,
        user_id: user?.id || 'anonymous',
      },
      success_url: `${baseUrl}/ebooks/${ebook.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/ebooks/${ebook.id}`,
    })

    // Redirect to Stripe checkout
    return NextResponse.redirect(session.url!)
  } catch (error: any) {
    console.error('Ebook checkout error:', error)
    return NextResponse.redirect(new URL('/ebooks', request.url))
  }
}

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
      console.log('Initializing Stripe client...')
      const hasKey = !!process.env.STRIPE_SECRET_KEY
      console.log('STRIPE_SECRET_KEY exists:', hasKey, hasKey ? `(${process.env.STRIPE_SECRET_KEY.substring(0, 20)}...)` : '')
      stripe = getStripe()
      console.log('Stripe client initialized successfully')
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
      let session
      try {
        console.log('Creating Stripe checkout session (subscription)...')
        session = await stripe.checkout.sessions.create({
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
      } catch (stripeError: any) {
        console.error('Stripe API call failed:', stripeError)
        throw stripeError
      }

      return NextResponse.json({ sessionId: session.id, url: session.url })
    } else {
      // Create a one-time payment with dynamic price
      let session
      try {
        console.log('Creating Stripe checkout session (one-time)...')
        session = await stripe.checkout.sessions.create({
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
      } catch (stripeError: any) {
        console.error('Stripe API call failed:', stripeError)
        throw stripeError
      }

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

    // Check if it's a Stripe connection error
    if (error?.type === 'StripeConnectionError' || error?.message?.includes('connection')) {
      return NextResponse.json(
        {
          error: 'Unable to connect to Stripe. Please check your internet connection and try again.',
          details: `Connection error: ${error.message}`,
          stripeError: true,
          errorType: error?.type,
        },
        { status: 503 } // Service Unavailable
      )
    }

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

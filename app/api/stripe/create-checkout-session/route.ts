import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

function errorRecord(error: unknown) {
  return typeof error === 'object' && error !== null
    ? error as Record<string, unknown>
    : {}
}

function stringifyError(error: unknown) {
  return error
    ? JSON.stringify(error, Object.getOwnPropertyNames(error))
    : 'No error object'
}

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
  } catch (error: unknown) {
    console.error('Ebook checkout error:', error)
    return NextResponse.redirect(new URL('/ebooks', request.url))
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, type, frequency, donorEmail, donorName, campaign } = body

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

    const campaignKey = campaign ? String(campaign).slice(0, 50) : undefined
    const isCovenantPartner = campaignKey === 'covenant-partners'
    const productName = isCovenantPartner
      ? 'TPC Ministries Covenant Partnership'
      : frequency === 'monthly'
        ? 'Monthly Donation'
        : 'Donation'
    const successUrl = isCovenantPartner
      ? `${baseUrl}/partners/welcome?session_id={CHECKOUT_SESSION_ID}&campaign=covenant-partners`
      : `${baseUrl}/giving/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = isCovenantPartner ? `${baseUrl}/partners#start-partnership` : `${baseUrl}/giving`
    const checkoutMetadata = {
      type,
      frequency,
      user_id: user?.id || 'anonymous',
      donor_name: donorName || 'Anonymous',
      ...(campaignKey ? { campaign: campaignKey } : {}),
    }

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100)
    
    // Validate minimum amount in cents (Stripe minimum is $0.50, but we use $1.00)
    if (amountInCents < 100) {
      return NextResponse.json({ error: 'Amount too low. Minimum is $1.00' }, { status: 400 })
    }

    console.log('Creating Stripe session:', { amountInCents, frequency, type })

    // Initialize Stripe client
    let stripe: Stripe
    try {
      console.log('Initializing Stripe client...')
      console.log('STRIPE_SECRET_KEY configured:', Boolean(process.env.STRIPE_SECRET_KEY))
      stripe = getStripe()
      console.log('Stripe client initialized successfully')
    } catch (stripeInitError: unknown) {
      console.error('Failed to initialize Stripe:', stripeInitError)
      return NextResponse.json(
        {
          error: 'Stripe configuration error',
          details: errorMessage(stripeInitError) || 'Failed to initialize Stripe client',
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
                name: productName,
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
        metadata: checkoutMetadata,
        subscription_data: {
          metadata: checkoutMetadata,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        })
      } catch (stripeError: unknown) {
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
                name: productName,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        ...(donorEmail || user?.email ? { customer_email: donorEmail || user?.email } : {}),
        ...(user?.id ? { client_reference_id: user.id } : {}),
        metadata: checkoutMetadata,
        success_url: successUrl,
        cancel_url: cancelUrl,
        })
      } catch (stripeError: unknown) {
        console.error('Stripe API call failed:', stripeError)
        throw stripeError
      }

      return NextResponse.json({ sessionId: session.id, url: session.url })
    }
  } catch (error: unknown) {
    const errorInfo = errorRecord(error)
    const message = errorMessage(error)
    console.error('=== STRIPE CHECKOUT ERROR ===')
    console.error('Error object:', error)
    console.error('Error message:', message)
    console.error('Error type:', errorInfo.type)
    console.error('Error code:', errorInfo.code)
    console.error('Error statusCode:', errorInfo.statusCode)
    console.error('Error raw:', errorInfo.raw)
    console.error('Stack:', errorInfo.stack)
    console.error('===========================')

    // Check if it's a Stripe connection error
    if (errorInfo.type === 'StripeConnectionError' || message.includes('connection')) {
      return NextResponse.json(
        {
          error: 'Unable to connect to Stripe. Please check your internet connection and try again.',
          details: `Connection error: ${message}`,
          stripeError: true,
          errorType: errorInfo.type,
        },
        { status: 503 } // Service Unavailable
      )
    }

    // Check if it's a Stripe error
    if (errorInfo.type && errorInfo.code) {
      return NextResponse.json(
        {
          error: `Stripe error: ${message}`,
          details: `${String(errorInfo.type)} - ${String(errorInfo.code)}: ${message}`,
          stripeError: true,
          fullError: stringifyError(error)
        },
        { status: 500 }
      )
    }

    // Check if it's a validation or other error
    const errorDetails = typeof errorInfo.stack === 'string'
      ? errorInfo.stack
      : String(error || 'Unknown error occurred')
    
    return NextResponse.json(
      {
        error: message || 'Failed to create checkout session',
        details: errorDetails,
        fullError: stringifyError(error)
      },
      { status: 500 }
    )
  }
}

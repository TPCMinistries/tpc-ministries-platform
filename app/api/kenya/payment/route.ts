import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

const TRIP_COST = 3500
const DEPOSIT_AMOUNT = 500

interface PaymentRequest {
  email: string
  firstName: string
  lastName: string
  paymentType: 'full' | 'deposit' | 'installment_4' | 'installment_6' | 'custom'
  customAmount?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json()
    const { email, firstName, lastName, paymentType, customAmount } = body

    if (!email || !paymentType) {
      return NextResponse.json(
        { error: 'Email and payment type are required.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'

    // Find participant by email
    const { data: participant } = await supabase
      .from('kenya_trip_participants')
      .select('id, trip_id, first_name, last_name, email, trip_cost, amount_paid, scholarship_amount, stripe_customer_id')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    const name = participant
      ? `${participant.first_name} ${participant.last_name}`
      : `${firstName} ${lastName}`

    const tripCost = participant?.trip_cost ? Number(participant.trip_cost) : TRIP_COST
    const alreadyPaid = participant?.amount_paid ? Number(participant.amount_paid) : 0
    const scholarship = participant?.scholarship_amount ? Number(participant.scholarship_amount) : 0
    const remaining = tripCost - alreadyPaid - scholarship

    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'This participant is already fully paid.' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId = participant?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          participant_id: participant?.id || '',
          trip: 'kenya_2026',
        },
      })
      customerId = customer.id

      // Save customer ID if participant exists
      if (participant) {
        await supabase
          .from('kenya_trip_participants')
          .update({ stripe_customer_id: customerId })
          .eq('id', participant.id)
      }
    }

    let sessionConfig: any

    if (paymentType === 'full') {
      // Pay in full — one-time payment
      sessionConfig = {
        mode: 'payment' as const,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Kenya Kingdom Impact Trip 2026 — Full Payment',
              description: `Trip payment for ${name}`,
            },
            unit_amount: Math.round(remaining * 100),
          },
          quantity: 1,
        }],
      }
    } else if (paymentType === 'deposit') {
      // Deposit payment
      const depositAmount = Math.min(DEPOSIT_AMOUNT, remaining)
      sessionConfig = {
        mode: 'payment' as const,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Kenya Kingdom Impact Trip 2026 — Deposit',
              description: `$${depositAmount} deposit for ${name}. Remaining balance: $${(remaining - depositAmount).toLocaleString()}`,
            },
            unit_amount: Math.round(depositAmount * 100),
          },
          quantity: 1,
        }],
      }
    } else if (paymentType === 'installment_4' || paymentType === 'installment_6') {
      // Installment plan via Stripe subscription
      const months = paymentType === 'installment_4' ? 4 : 6
      const monthlyAmount = Math.ceil(remaining / months)

      sessionConfig = {
        mode: 'subscription' as const,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Kenya Trip 2026 — ${months}-Month Payment Plan`,
              description: `$${monthlyAmount}/mo for ${months} months (${name})`,
            },
            recurring: { interval: 'month' as const },
            unit_amount: Math.round(monthlyAmount * 100),
          },
          quantity: 1,
        }],
        subscription_data: {
          metadata: {
            participant_id: participant?.id || '',
            trip_id: participant?.trip_id || '',
            payment_type: paymentType,
            total_payments: months.toString(),
            monthly_amount: monthlyAmount.toString(),
            type: 'kenya_trip_installment',
          },
        },
      }
    } else if (paymentType === 'custom' && customAmount) {
      const amount = Math.min(customAmount, remaining)
      sessionConfig = {
        mode: 'payment' as const,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Kenya Kingdom Impact Trip 2026 — Payment',
              description: `Trip payment for ${name}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid payment type.' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      ...sessionConfig,
      customer: customerId,
      payment_method_types: ['card'],
      success_url: `${baseUrl}/kenya/pay/success?session_id={CHECKOUT_SESSION_ID}&type=${paymentType}`,
      cancel_url: `${baseUrl}/kenya/pay?email=${encodeURIComponent(email)}&canceled=true`,
      metadata: {
        participant_id: participant?.id || '',
        trip_id: participant?.trip_id || '',
        payment_type: paymentType,
        type: 'kenya_trip_payment',
      },
    })

    // Update participant payment tracking
    if (participant) {
      const months = paymentType === 'installment_4' ? 4 : paymentType === 'installment_6' ? 6 : null
      await supabase
        .from('kenya_trip_participants')
        .update({
          payment_type: paymentType.startsWith('installment') ? 'installment' : paymentType,
          payment_initiated_at: new Date().toISOString(),
          ...(months ? { payment_plan_months: months } : {}),
          ...(paymentType === 'deposit' ? { deposit_amount: DEPOSIT_AMOUNT } : {}),
          ...(sessionConfig.mode === 'subscription' ? { stripe_subscription_id: session.subscription } : {}),
        })
        .eq('id', participant.id)
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error('Kenya payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment session.' },
      { status: 500 }
    )
  }
}

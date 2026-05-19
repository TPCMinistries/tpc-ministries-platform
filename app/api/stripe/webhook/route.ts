import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { MEMBERSHIP_TIERS, isMembershipTier } from '@/lib/membership/tiers'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set - skipping signature verification')
      event = JSON.parse(body)
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // Route by metadata type
        if (session.metadata?.type === 'ebook') {
          await recordEbookPurchase(session)
        } else if (session.metadata?.type === 'pack-fund') {
          await handlePackFundCompleted(session)
        } else if (session.metadata?.type === 'pack-sponsorship') {
          await handlePackSponsorshipCompleted(session)
        } else if (session.metadata?.type === 'membership') {
          await handleMembershipCheckout(session)
        } else {
          await recordDonation(session)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          // Skip donation insert for membership invoices — they aren't donations.
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
          if (sub.metadata?.type === 'membership') {
            await recordMembershipInvoice(invoice, sub)
          } else {
            await recordRecurringDonation(invoice)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function recordEbookPurchase(session: Stripe.Checkout.Session) {
  const supabase = await createClient()

  const ebookId = session.metadata?.ebook_id
  const ebookTitle = session.metadata?.ebook_title
  const userId = session.metadata?.user_id !== 'anonymous' ? session.metadata?.user_id : null
  const customerEmail = session.customer_email || session.customer_details?.email

  // Record purchase in donations table with type 'ebook_purchase'
  const purchaseData = {
    amount: (session.amount_total || 0) / 100,
    type: 'ebook_purchase',
    frequency: 'once',
    user_id: userId,
    donor_email: customerEmail,
    donor_name: session.customer_details?.name || 'Customer',
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent as string,
    status: 'completed',
    notes: `Ebook: ${ebookTitle} (ID: ${ebookId})`,
    created_at: new Date().toISOString(),
  }

  const { error: purchaseError } = await supabase.from('donations').insert(purchaseData)

  if (purchaseError) {
    console.error('Error recording ebook purchase:', purchaseError)
    // Don't throw - still try to update download count
  } else {
    console.log('Ebook purchase recorded:', purchaseData)
  }

  // Increment download count on the ebook resource
  if (ebookId) {
    const { data: resource } = await supabase
      .from('resources')
      .select('download_count')
      .eq('id', ebookId)
      .single()

    const currentCount = resource?.download_count || 0

    const { error: updateError } = await supabase
      .from('resources')
      .update({ download_count: currentCount + 1 })
      .eq('id', ebookId)

    if (updateError) {
      console.error('Error incrementing download count:', updateError)
    } else {
      console.log(`Download count incremented for ebook ${ebookId}`)
    }
  }
}

async function recordDonation(session: Stripe.Checkout.Session) {
  const supabase = await createClient()

  const donationData = {
    amount: (session.amount_total || 0) / 100,
    type: session.metadata?.type || 'general',
    frequency: session.metadata?.frequency || 'once',
    user_id: session.metadata?.user_id !== 'anonymous' ? session.metadata?.user_id : null,
    donor_email: session.customer_email || session.customer_details?.email,
    donor_name: session.metadata?.donor_name || 'Anonymous',
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent as string,
    stripe_subscription_id: session.subscription as string | null,
    status: 'completed',
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('donations').insert(donationData)

  if (error) {
    console.error('Error recording donation:', error)
    throw error
  }

  console.log('Donation recorded:', donationData)

  // Auto-upgrade giver to partner role
  await upgradeGiverToPartner(supabase, donationData.user_id, donationData.donor_email, donationData.amount)

  // Fire thank-you email (best-effort, never blocks webhook ack)
  await sendDonationReceipt({
    donorName: donationData.donor_name,
    email: donationData.donor_email,
    amount: donationData.amount,
    donationType: donationData.type,
    transactionId: donationData.stripe_session_id,
    isRecurring: false,
  })
}

async function recordRecurringDonation(invoice: Stripe.Invoice) {
  const supabase = await createClient()
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

  const donationData = {
    amount: (invoice.amount_paid || 0) / 100,
    type: subscription.metadata?.type || 'general',
    frequency: 'monthly',
    user_id: subscription.metadata?.user_id !== 'anonymous' ? subscription.metadata?.user_id : null,
    donor_email: invoice.customer_email,
    donor_name: subscription.metadata?.donor_name || 'Anonymous',
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: invoice.subscription as string,
    status: 'completed',
    created_at: new Date().toISOString(),
  }

  const { error} = await supabase.from('donations').insert(donationData)

  if (error) {
    console.error('Error recording recurring donation:', error)
    throw error
  }

  console.log('Recurring donation recorded:', donationData)

  // Auto-upgrade giver to partner role
  await upgradeGiverToPartner(supabase, donationData.user_id, donationData.donor_email, donationData.amount)

  // Fire monthly receipt email
  await sendDonationReceipt({
    donorName: donationData.donor_name,
    email: donationData.donor_email,
    amount: donationData.amount,
    donationType: donationData.type,
    transactionId: donationData.stripe_invoice_id,
    isRecurring: true,
  })
}

// Best-effort donation receipt — calls the existing send-donation-receipt endpoint.
// Never throws — webhook must always 200 to Stripe.
async function sendDonationReceipt(params: {
  donorName: string
  email: string | null | undefined
  amount: number
  donationType: string
  transactionId?: string | null
  isRecurring: boolean
}) {
  if (!params.email) return
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'
    await fetch(`${baseUrl}/api/email/send-donation-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donorName: params.donorName,
        email: params.email,
        amount: params.amount,
        donationType: params.donationType,
        transactionId: params.transactionId,
        isRecurring: params.isRecurring,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      }),
    })
  } catch (err) {
    console.error('Donation receipt send failed (non-fatal):', err)
  }
}

// Auto-upgrade givers to partner role
async function upgradeGiverToPartner(
  supabase: any,
  userId: string | null | undefined,
  email: string | null | undefined,
  amount: number
) {
  try {
    // Find member by user_id or email
    let member = null

    if (userId) {
      const { data } = await supabase
        .from('members')
        .select('id, role, tier')
        .eq('user_id', userId)
        .single()
      member = data
    }

    if (!member && email) {
      const { data } = await supabase
        .from('members')
        .select('id, role, tier')
        .eq('email', email)
        .single()
      member = data
    }

    if (!member) {
      console.log('No member found for giver - cannot auto-upgrade')
      return
    }

    // Only upgrade if current role is 'free' or 'member'
    const currentRole = member.role || member.tier || 'free'
    if (!['free', 'member'].includes(currentRole)) {
      console.log(`Member already has ${currentRole} role - no upgrade needed`)
      return
    }

    // Upgrade to partner
    const { error } = await supabase
      .from('members')
      .update({
        role: 'partner',
        tier: 'partner', // Also update legacy tier field
        role_updated_at: new Date().toISOString(),
        role_upgrade_reason: `Auto-upgraded from giving $${amount}`,
      })
      .eq('id', member.id)

    if (error) {
      console.error('Error upgrading member to partner:', error)
      return
    }

    console.log(`Member ${member.id} auto-upgraded to partner role after giving $${amount}`)
  } catch (error) {
    console.error('Error in upgradeGiverToPartner:', error)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const supabase = createAdminClient()

  if (subscription.metadata?.type === 'membership') {
    // Membership cancellation: mark sub canceled + downgrade tier back to free.
    const nowIso = new Date().toISOString()
    const { data: sub } = await supabase
      .from('member_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: nowIso,
        updated_at: nowIso,
      })
      .eq('stripe_subscription_id', subscription.id)
      .select('member_id')
      .single()

    if (sub?.member_id) {
      await supabase
        .from('members')
        .update({
          role: 'free',
          tier: 'free',
          role_updated_at: nowIso,
          role_upgrade_reason: 'Membership canceled',
        })
        .eq('id', sub.member_id)
    }

    console.log('Membership canceled:', subscription.id)
    return
  }

  // Legacy donation-subscription path.
  const { error } = await supabase
    .from('donations')
    .update({ subscription_status: 'canceled', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }

  console.log('Subscription canceled:', subscription.id)
}

// ── Membership: initial checkout completed ──
async function handleMembershipCheckout(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()

  const tierSlug = session.metadata?.tier_slug || ''
  const billingCycle = session.metadata?.billing_cycle || 'monthly'
  const userId = session.metadata?.user_id || session.client_reference_id || null
  const memberIdMeta = session.metadata?.member_id || null
  const email = session.customer_email || session.customer_details?.email || null
  const stripeSubscriptionId = session.subscription as string | null
  const stripeCustomerId = session.customer as string | null

  if (!isMembershipTier(tierSlug)) {
    console.error('Membership checkout: invalid tier_slug', tierSlug)
    return
  }

  const tier = MEMBERSHIP_TIERS[tierSlug]

  // Resolve member by metadata first, then user_id, then email.
  let member: { id: string } | null = null
  if (memberIdMeta) {
    const { data } = await supabase.from('members').select('id').eq('id', memberIdMeta).single()
    member = data
  }
  if (!member && userId) {
    const { data } = await supabase.from('members').select('id').eq('user_id', userId).single()
    member = data
  }
  if (!member && email) {
    const { data } = await supabase.from('members').select('id').eq('email', email).single()
    member = data
  }

  if (!member) {
    console.error('Membership checkout: no member found for', { userId, email })
    return
  }

  // Pull subscription details for current_period_*.
  let periodStart: string | null = null
  let periodEnd: string | null = null
  if (stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
      periodStart = sub.current_period_start
        ? new Date(sub.current_period_start * 1000).toISOString() : null
      periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString() : null
    } catch (err) {
      console.error('Failed to fetch subscription for period dates:', err)
    }
  }

  const nowIso = new Date().toISOString()

  // Upsert member_subscriptions by stripe_subscription_id.
  if (stripeSubscriptionId) {
    const { data: existing } = await supabase
      .from('member_subscriptions')
      .select('id')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .maybeSingle()

    const payload = {
      member_id: member.id,
      user_id: userId,
      tier_slug: tierSlug,
      billing_cycle: billingCycle,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_customer_id: stripeCustomerId,
      status: 'active',
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      updated_at: nowIso,
    }

    if (existing) {
      await supabase.from('member_subscriptions').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('member_subscriptions').insert({ ...payload, created_at: nowIso })
    }
  }

  // Upgrade tier + role.
  await supabase
    .from('members')
    .update({
      role: tier.role,
      tier: tier.role,
      role_updated_at: nowIso,
      role_upgrade_reason: `${tier.name} membership (${billingCycle})`,
    })
    .eq('id', member.id)

  console.log(`Membership activated: member=${member.id} tier=${tierSlug}`)
}

// ── Membership: recurring invoice paid ──
async function recordMembershipInvoice(
  invoice: Stripe.Invoice,
  subscription: Stripe.Subscription,
) {
  const supabase = createAdminClient()
  const nowIso = new Date().toISOString()
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString() : null
  const periodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000).toISOString() : null

  await supabase
    .from('member_subscriptions')
    .update({
      status: 'active',
      current_period_start: periodStart,
      current_period_end: periodEnd,
      updated_at: nowIso,
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log('Membership renewed:', subscription.id, 'next:', periodEnd)
}

// ── Pack the Mission: Supply Fund ──
async function handlePackFundCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()
  const fundRecordId = session.metadata?.fund_record_id

  if (!fundRecordId) {
    console.error('Pack fund webhook: missing fund_record_id in metadata')
    return
  }

  // Build update payload — backfill donor info from Stripe if missing
  const updateData: Record<string, string> = {
    status: 'completed',
    stripe_payment_intent: session.payment_intent as string,
    updated_at: new Date().toISOString(),
  }

  // Stripe customer_details has the real name/email from checkout
  const customerName = session.customer_details?.name
  const customerEmail = session.customer_details?.email

  // Fetch current record to check if donor info is missing
  const { data: existing } = await supabase
    .from('kenya_supply_funds')
    .select('donor_name, donor_email')
    .eq('id', fundRecordId)
    .single()

  if (existing && (!existing.donor_name || existing.donor_name === 'Anonymous') && customerName) {
    updateData.donor_name = customerName
  }
  if (existing && !existing.donor_email && customerEmail) {
    updateData.donor_email = customerEmail
  }

  const { error } = await supabase
    .from('kenya_supply_funds')
    .update(updateData)
    .eq('id', fundRecordId)

  if (error) {
    console.error('Error updating pack fund record:', error)
    throw error
  }

  console.log('Pack fund completed:', fundRecordId)
}

// ── Pack the Mission: Sponsorship ──
async function handlePackSponsorshipCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()
  const sponsorshipId = session.metadata?.sponsorship_record_id

  if (!sponsorshipId) {
    console.error('Pack sponsorship webhook: missing sponsorship_record_id in metadata')
    return
  }

  const { error } = await supabase
    .from('kenya_sponsorships')
    .update({
      status: 'active',
      stripe_payment_intent: session.payment_intent as string,
      stripe_subscription_id: session.subscription as string | null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sponsorshipId)

  if (error) {
    console.error('Error updating sponsorship record:', error)
    throw error
  }

  console.log('Pack sponsorship activated:', sponsorshipId)
}

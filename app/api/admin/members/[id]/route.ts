import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireStaff()
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = createAdminClient()

    const [memberResult, donationsResult, subscriptionsResult, checkinsResult, prayersResult] = await Promise.all([
      supabase
        .from('members')
        .select('*')
        .eq('id', params.id)
        .single(),
      supabase
        .from('donations')
        .select('id, amount, status, donation_type, designation, is_recurring, created_at, stripe_subscription_id, stripe_payment_intent_id')
        .eq('member_id', params.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('member_subscriptions')
        .select('id, tier_slug, status, billing_cycle, current_period_end, stripe_customer_id, stripe_subscription_id, created_at, updated_at')
        .eq('member_id', params.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('daily_checkins')
        .select('id, mood, prayer_focus, notes, created_at')
        .eq('member_id', params.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('prayer_requests')
        .select('id, title, description, status, created_at')
        .eq('user_id', params.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    if (memberResult.error) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 })
    }

    const donations = donationsResult.error ? [] : donationsResult.data || []
    const subscriptions = subscriptionsResult.error ? [] : subscriptionsResult.data || []
    const checkins = checkinsResult.error ? [] : checkinsResult.data || []
    const prayerRequests = prayersResult.error ? [] : prayersResult.data || []
    const successfulStatuses = ['succeeded', 'completed', 'paid']
    const successfulDonations = donations.filter(d => successfulStatuses.includes(d.status || ''))
    const recurringDonations = successfulDonations.filter(d => d.is_recurring || d.donation_type === 'recurring')
    const totalGiven = successfulDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0)
    const covenantGiven = successfulDonations
      .filter(donation => donation.designation === 'covenant_partner')
      .reduce((sum, donation) => sum + Number(donation.amount || 0), 0)
    const monthlyRecognized = recurringDonations
      .filter(donation => {
        if (!donation.created_at) return false
        const date = new Date(donation.created_at)
        const now = new Date()
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
      })
      .reduce((sum, donation) => sum + Number(donation.amount || 0), 0)

    return NextResponse.json({
      success: true,
      member: memberResult.data,
      giving: {
        donations,
        totalGiven,
        covenantGiven,
        monthlyRecognized,
        donationCount: successfulDonations.length,
        recurringDonationCount: recurringDonations.length,
        lastGiftAt: successfulDonations[0]?.created_at || null,
      },
      subscriptions,
      care: {
        checkins,
        prayerRequests,
      },
    })
  } catch (error) {
    console.error('Error loading admin member detail:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load member detail' },
      { status: 500 }
    )
  }
}

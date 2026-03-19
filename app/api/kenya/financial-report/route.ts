import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Categories where the ministry deploys funds (counts toward "Deployed")
const DEPLOYED_CATEGORIES = [
  'flight_credit', 'hotel_credit', 'trip_sponsorship', 'church_gift',
  'scholarship', 'admin_adjustment', 'other',
]

// Categories that are pass-through (updates delegate balance but NOT ministry deployment)
const PASSTHROUGH_CATEGORIES = ['external_payment', 'refund_credit']

// Verify caller is staff/admin
async function verifyFinancialAccess() {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await admin
    .from('members')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!member || !['admin', 'staff'].includes(member.role)) return null
  return member
}

export async function GET() {
  try {
    const member = await verifyFinancialAccess()
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized — staff/admin only' }, { status: 403 })
    }

    const admin = createAdminClient()

    // Get latest trip
    const { data: trip } = await admin
      .from('kenya_trips')
      .select('id, fundraising_goal')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!trip) {
      return NextResponse.json({ error: 'No trip found' }, { status: 404 })
    }

    // Fetch all data in parallel
    const [participantsRes, adminPaymentsRes, missionFundsRes, expensesRes] = await Promise.all([
      admin
        .from('kenya_trip_participants')
        .select('id, first_name, last_name, email, service_track, trip_cost, scholarship_amount, amount_paid, amount_raised, admin_credits_total, payment_status, application_status')
        .eq('trip_id', trip.id)
        .neq('application_status', 'removed')
        .order('last_name'),
      admin
        .from('kenya_trip_admin_payments')
        .select('id, participant_id, amount, category, description, created_at, created_by_member_id, members!created_by_member_id(first_name, last_name)')
        .eq('trip_id', trip.id)
        .order('created_at', { ascending: false }),
      admin
        .from('kenya_trip_mission_funds')
        .select('*, members!created_by_member_id(first_name, last_name)')
        .eq('trip_id', trip.id)
        .order('received_date', { ascending: false }),
      admin
        .from('kenya_trip_expenses')
        .select('id, amount, status, description, category_id')
        .eq('trip_id', trip.id)
        .in('status', ['approved', 'paid', 'reimbursed']),
    ])

    const participants = participantsRes.data || []
    const adminPayments = adminPaymentsRes.data || []
    const missionFunds = missionFundsRes.data || []
    const approvedExpenses = expensesRes.data || []

    // Build per-delegate breakdown
    const byDelegate = participants.map(p => {
      const tripCost = Number(p.trip_cost) || 3500
      const scholarship = Number(p.scholarship_amount) || 0
      const selfPayments = Number(p.amount_paid) || 0
      const fundraising = Number(p.amount_raised) || 0
      const adminCredits = Number(p.admin_credits_total) || 0
      const totalCovered = scholarship + selfPayments + fundraising + adminCredits
      const remaining = tripCost - totalCovered
      const surplus = remaining < 0 ? Math.abs(remaining) : 0

      return {
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        email: p.email,
        track: p.service_track || 'Flex',
        applicationStatus: p.application_status,
        tripCost,
        scholarship,
        selfPayments,
        fundraising,
        adminCredits,
        totalCovered,
        remaining: Math.max(0, remaining),
        surplus,
        paymentStatus: p.payment_status || 'pending',
      }
    })

    // Build delegate-level summary
    const totalDelegates = byDelegate.length
    const totalTripCost = byDelegate.reduce((sum, d) => sum + d.tripCost, 0)
    const totalScholarships = byDelegate.reduce((sum, d) => sum + d.scholarship, 0)
    const totalAdminCredits = byDelegate.reduce((sum, d) => sum + d.adminCredits, 0)
    const totalSelfPayments = byDelegate.reduce((sum, d) => sum + d.selfPayments, 0)
    const totalFundraising = byDelegate.reduce((sum, d) => sum + d.fundraising, 0)
    const totalCovered = byDelegate.reduce((sum, d) => sum + d.totalCovered, 0)
    const totalOutstanding = byDelegate.reduce((sum, d) => sum + d.remaining, 0)
    const totalSurplus = byDelegate.reduce((sum, d) => sum + d.surplus, 0)

    // Mission Fund calculations
    const missionFundRaised = missionFunds.reduce((sum, f) => sum + Number(f.amount), 0)
    const missionFundGoal = Number(trip.fundraising_goal) || 60000

    // Deployed = ministry-funded admin credits + approved budget expenses
    const deployedCredits = adminPayments
      .filter(ap => DEPLOYED_CATEGORIES.includes(ap.category))
      .reduce((sum, ap) => sum + Number(ap.amount), 0)
    const deployedExpenses = approvedExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const totalDeployed = deployedCredits + deployedExpenses
    const missionFundAvailable = Math.max(0, missionFundRaised - totalDeployed)

    // Build by-track summary
    const trackMap = new Map<string, { delegates: number; totalCost: number; totalCovered: number; outstanding: number }>()
    for (const d of byDelegate) {
      const track = d.track
      const existing = trackMap.get(track) || { delegates: 0, totalCost: 0, totalCovered: 0, outstanding: 0 }
      trackMap.set(track, {
        delegates: existing.delegates + 1,
        totalCost: existing.totalCost + d.tripCost,
        totalCovered: existing.totalCovered + d.totalCovered,
        outstanding: existing.outstanding + d.remaining,
      })
    }
    const byTrack = Array.from(trackMap.entries()).map(([track, data]) => ({
      track,
      ...data,
    }))

    // Build admin credits breakdown by category
    const categoryMap = new Map<string, { total: number; count: number }>()
    for (const ap of adminPayments) {
      const existing = categoryMap.get(ap.category) || { total: 0, count: 0 }
      categoryMap.set(ap.category, {
        total: existing.total + Number(ap.amount),
        count: existing.count + 1,
      })
    }
    const adminCreditsBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data,
    }))

    return NextResponse.json({
      tripId: trip.id,
      summary: {
        totalDelegates,
        totalTripCost,
        totalScholarships,
        totalAdminCredits,
        totalSelfPayments,
        totalFundraising,
        totalCovered,
        totalOutstanding,
        totalSurplus,
      },
      missionFund: {
        raised: missionFundRaised,
        goal: missionFundGoal,
        deployed: totalDeployed,
        deployedCredits,
        deployedExpenses,
        available: missionFundAvailable,
      },
      byTrack,
      byDelegate,
      adminCreditsBreakdown,
      adminPayments,
      missionFunds,
    })
  } catch (error) {
    console.error('Financial report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

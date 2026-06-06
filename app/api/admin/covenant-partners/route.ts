import { NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MEMBERSHIP_TIERS, isMembershipTier } from '@/lib/membership/tiers'

export const dynamic = 'force-dynamic'

type MemberTier = 'free' | 'partner' | 'covenant'

interface MemberRow {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  tier: MemberTier | null
  role: string | null
  created_at: string | null
  joined_at: string | null
  last_active_at: string | null
}

interface DonationMember {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  tier: MemberTier | null
}

interface DonationRow {
  id: string
  member_id: string | null
  amount: number | string | null
  status: string | null
  donation_type: string | null
  designation: string | null
  is_recurring: boolean | null
  created_at: string | null
  stripe_subscription_id?: string | null
  members: DonationMember | DonationMember[] | null
}

interface SubscriptionRow {
  id: string
  member_id: string | null
  tier_slug: string | null
  status: string | null
  billing_cycle: string | null
  current_period_end: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string | null
}

interface PartnerEventRow {
  id: string
  title: string
  description: string | null
  event_type: string | null
  location: string | null
  virtual_link: string | null
  start_time: string | null
  max_attendees: number | null
  tier_required: string | null
}

interface EventRegistrationMember {
  first_name: string | null
  last_name: string | null
  email: string | null
}

interface EventRegistrationRow {
  id: string
  event_id: string
  user_id: string | null
  attendance_type: string | null
  status: string | null
  members: EventRegistrationMember | EventRegistrationMember[] | null
}

function dollars(value: number | string | null | undefined) {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? amount : 0
}

function memberName(member: Pick<MemberRow, 'first_name' | 'last_name' | 'email'>) {
  const name = [member.first_name, member.last_name].filter(Boolean).join(' ').trim()
  return name || member.email || 'Unnamed Partner'
}

function getDonationMember(row: DonationRow): DonationMember | null {
  if (Array.isArray(row.members)) return row.members[0] || null
  return row.members || null
}

function partnerLevelFromAmount(amount: number) {
  if (amount >= 250) return 'Vision Partner'
  if (amount >= 100) return 'Kingdom Partner'
  if (amount >= 50) return 'Steward'
  if (amount >= 25) return 'Builder'
  return 'Custom Gift'
}

function monthlyAmountFromSubscription(subscription: SubscriptionRow | undefined) {
  if (!subscription?.tier_slug || !isMembershipTier(subscription.tier_slug)) return 0
  const tier = MEMBERSHIP_TIERS[subscription.tier_slug]
  return subscription.billing_cycle === 'annual' ? tier.price.annual / 12 : tier.price.monthly
}

export async function GET() {
  const authResult = await requireStaff()
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = createAdminClient()
    const successfulStatuses = ['succeeded', 'completed', 'paid']
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const recentWindow = new Date(now)
    recentWindow.setDate(recentWindow.getDate() - 45)

    const [membersResult, donationsResult, subscriptionsResult] = await Promise.all([
      supabase
        .from('members')
        .select('id, first_name, last_name, email, phone:phone_number, tier, role, created_at, joined_at:join_date')
        .in('tier', ['partner', 'covenant'])
        .order('created_at', { ascending: false }),
      supabase
        .from('donations')
        .select(`
          id,
          member_id,
          amount,
          status,
          donation_type,
          designation,
          is_recurring,
          created_at,
          stripe_subscription_id,
          members:member_id (
            id,
            first_name,
            last_name,
            email,
            tier
          )
        `)
        .eq('designation', 'covenant_partner')
        .in('status', successfulStatuses)
        .order('created_at', { ascending: false })
        .limit(300),
      supabase
        .from('member_subscriptions')
        .select('id, member_id, tier_slug, status, billing_cycle, current_period_end, stripe_customer_id, stripe_subscription_id, created_at')
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false }),
    ])

    if (membersResult.error) throw membersResult.error
    if (donationsResult.error) throw donationsResult.error

    const members = (membersResult.data || []) as MemberRow[]
    const donations = (donationsResult.data || []) as DonationRow[]
    const subscriptions = subscriptionsResult.error
      ? [] as SubscriptionRow[]
      : (subscriptionsResult.data || []) as SubscriptionRow[]

    const { data: upcomingPartnerEvents } = await supabase
      .from('events')
      .select('id, title, description, event_type, location, virtual_link, start_time, max_attendees, tier_required')
      .eq('status', 'upcoming')
      .gte('start_time', now.toISOString())
      .in('tier_required', ['partner', 'covenant'])
      .order('start_time', { ascending: true })
      .limit(5)

    const partnerEventRows = (upcomingPartnerEvents || []) as PartnerEventRow[]
    const partnerEventIds = partnerEventRows.map(event => event.id)
    const { data: eventRegistrationRows } = partnerEventIds.length > 0
      ? await supabase
          .from('event_registrations')
          .select(`
            id,
            event_id,
            user_id,
            attendance_type,
            status,
            members:user_id (
              first_name,
              last_name,
              email
            )
          `)
          .in('event_id', partnerEventIds)
          .in('status', ['registered', 'attended'])
      : { data: [] }

    const registrationsByEvent = ((eventRegistrationRows || []) as EventRegistrationRow[])
      .reduce<Record<string, EventRegistrationRow[]>>((acc, registration) => {
        acc[registration.event_id] = acc[registration.event_id] || []
        acc[registration.event_id].push(registration)
        return acc
      }, {})

    const donationsByMember = new Map<string, {
      total: number
      monthlyRecognized: number
      lastAmount: number
      lastGiftAt: string | null
      recurring: boolean
      donationCount: number
    }>()

    let anonymousMonthlyRecognized = 0
    let totalCovenantGiving = 0
    let monthlyRecognized = 0
    let recurringChargeCount = 0
    const recurringPartnerIds = new Set<string>()

    for (const donation of donations) {
      const amount = dollars(donation.amount)
      totalCovenantGiving += amount

      const createdAt = donation.created_at ? new Date(donation.created_at) : null
      const isThisMonth = !!createdAt && createdAt >= new Date(startOfMonth)
      const isRecent = !!createdAt && createdAt >= recentWindow
      const isRecurring = donation.is_recurring === true || donation.donation_type === 'recurring'

      if (isThisMonth && isRecurring) {
        monthlyRecognized += amount
        recurringChargeCount += 1
        if (!donation.member_id) anonymousMonthlyRecognized += amount
      }

      if (donation.member_id) {
        if (isRecurring && isRecent) recurringPartnerIds.add(donation.member_id)

        const current = donationsByMember.get(donation.member_id) || {
          total: 0,
          monthlyRecognized: 0,
          lastAmount: 0,
          lastGiftAt: null,
          recurring: false,
          donationCount: 0,
        }

        current.total += amount
        current.donationCount += 1
        if (isThisMonth && isRecurring) current.monthlyRecognized += amount
        if (!current.lastGiftAt || (donation.created_at && donation.created_at > current.lastGiftAt)) {
          current.lastGiftAt = donation.created_at
          current.lastAmount = amount
        }
        current.recurring = current.recurring || isRecurring
        donationsByMember.set(donation.member_id, current)
      }
    }

    const memberMap = new Map(members.map(member => [member.id, member]))
    for (const donation of donations) {
      const nestedMember = getDonationMember(donation)
      if (!nestedMember?.id || memberMap.has(nestedMember.id)) continue

      memberMap.set(nestedMember.id, {
        id: nestedMember.id,
        first_name: nestedMember.first_name,
        last_name: nestedMember.last_name,
        email: nestedMember.email,
        phone: null,
        tier: nestedMember.tier,
        role: null,
        created_at: null,
        joined_at: null,
        last_active_at: null,
      })
    }

    const activeSubscriptionMemberIds = new Set(
      subscriptions
        .filter(sub => sub.member_id && ['active', 'trialing', 'past_due'].includes(sub.status || ''))
        .map(sub => sub.member_id as string)
    )

    const activePartnerIds = new Set<string>()
    for (const member of memberMap.values()) {
      if (member.tier === 'partner' || member.tier === 'covenant') activePartnerIds.add(member.id)
    }
    for (const id of activeSubscriptionMemberIds) activePartnerIds.add(id)
    for (const id of recurringPartnerIds) activePartnerIds.add(id)

    const partnerRows = Array.from(memberMap.values())
      .filter(member => activePartnerIds.has(member.id))
      .map(member => {
        const giving = donationsByMember.get(member.id)
        const subscription = subscriptions.find(sub => sub.member_id === member.id)
        const monthlyAmount = giving?.monthlyRecognized || monthlyAmountFromSubscription(subscription)
        const levelAmount = giving?.lastAmount || monthlyAmount

        return {
          id: member.id,
          name: memberName(member),
          email: member.email,
          phone: member.phone,
          tier: member.tier || 'partner',
          level: partnerLevelFromAmount(levelAmount),
          monthlyAmount,
          totalGiven: giving?.total || 0,
          lastGiftAt: giving?.lastGiftAt,
          lastAmount: giving?.lastAmount || 0,
          recurring: giving?.recurring || !!subscription,
          subscriptionStatus: subscription?.status || null,
          joinedAt: member.joined_at || member.created_at,
          lastActiveAt: null,
        }
      })
      .sort((a, b) => {
        const aDate = a.lastGiftAt || a.joinedAt || ''
        const bDate = b.lastGiftAt || b.joinedAt || ''
        return bDate.localeCompare(aDate)
      })

    const tierBreakdown = {
      partner: partnerRows.filter(row => row.tier === 'partner').length,
      covenant: partnerRows.filter(row => row.tier === 'covenant').length,
    }

    const levelBreakdown = partnerRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.level] = (acc[row.level] || 0) + 1
      return acc
    }, {})

    const joinedWithinDays = (value: string | null, days: number) => {
      if (!value) return false
      const joinedAt = new Date(value)
      if (Number.isNaN(joinedAt.getTime())) return false
      const cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - days)
      return joinedAt >= cutoff
    }

    const inactivePartnerRows = partnerRows.filter(row => {
      if (row.recurring) return false
      const lastSignal = row.lastGiftAt || row.lastActiveAt
      if (!lastSignal) return true
      const lastSignalAt = new Date(lastSignal)
      if (Number.isNaN(lastSignalAt.getTime())) return true
      const diff = now.getTime() - lastSignalAt.getTime()
      return Math.floor(diff / (1000 * 60 * 60 * 24)) > 45
    })

    const onboardingSummary = {
      joinedLast7: partnerRows.filter(row => joinedWithinDays(row.joinedAt, 7)).length,
      joinedLast30: partnerRows.filter(row => joinedWithinDays(row.joinedAt, 30)).length,
      missingEmail: partnerRows.filter(row => !row.email).length,
      noGivingRecord: partnerRows.filter(row => row.totalGiven <= 0).length,
      activeRecurring: partnerRows.filter(row => row.recurring).length,
      paymentAttention: partnerRows.filter(row => row.subscriptionStatus === 'past_due').length,
      followUpWatch: inactivePartnerRows.length,
      readinessRate: partnerRows.length > 0
        ? Math.round((partnerRows.filter(row => row.email && (row.recurring || row.totalGiven > 0)).length / partnerRows.length) * 100)
        : 0,
    }

    const recentActivity = donations.slice(0, 12).map(donation => {
      const nestedMember = getDonationMember(donation)
      return {
        id: donation.id,
        partnerName: nestedMember
          ? memberName({
              first_name: nestedMember.first_name,
              last_name: nestedMember.last_name,
              email: nestedMember.email,
            })
          : 'Anonymous Covenant Partner',
        amount: dollars(donation.amount),
        recurring: donation.is_recurring === true || donation.donation_type === 'recurring',
        createdAt: donation.created_at,
      }
    })

    const partnerEvents = partnerEventRows.map(event => {
      const registrations = registrationsByEvent[event.id] || []
      const onlineCount = registrations.filter(registration => registration.attendance_type === 'virtual').length
      const inPersonCount = registrations.length - onlineCount
      const sampleRegistrants = registrations.slice(0, 5).map(registration => {
        const member = Array.isArray(registration.members) ? registration.members[0] : registration.members
        return memberName({
          first_name: member?.first_name || null,
          last_name: member?.last_name || null,
          email: member?.email || null,
        })
      })

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        eventType: event.event_type,
        location: event.location,
        virtual: Boolean(event.virtual_link),
        startTime: event.start_time,
        maxAttendees: event.max_attendees,
        tierRequired: event.tier_required,
        registeredCount: registrations.length,
        inPersonCount,
        onlineCount,
        sampleRegistrants,
      }
    })

    return NextResponse.json({
      success: true,
      metrics: {
        activePartners: activePartnerIds.size,
        monthlyRecognized,
        anonymousMonthlyRecognized,
        totalCovenantGiving,
        recurringChargeCount,
        averageMonthlyGift: recurringChargeCount > 0 ? monthlyRecognized / recurringChargeCount : 0,
        partnerTierCount: tierBreakdown.partner,
        covenantTierCount: tierBreakdown.covenant,
        activeSubscriptions: activeSubscriptionMemberIds.size,
      },
      tierBreakdown,
      levelBreakdown,
      onboardingSummary,
      partnerEvents,
      partners: partnerRows,
      recentActivity,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error loading covenant partner dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load covenant partner dashboard' },
      { status: 500 }
    )
  }
}

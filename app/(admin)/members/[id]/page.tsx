'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  HeartHandshake,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MemberDetail {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  tier?: 'free' | 'partner' | 'covenant' | null
  role?: string | null
  is_admin?: boolean | null
  joined_at?: string | null
  last_active_at?: string | null
  created_at?: string | null
  notes?: string | null
  role_upgrade_reason?: string | null
}

interface Donation {
  id: string
  amount: number
  status: string | null
  donation_type: string | null
  designation: string | null
  is_recurring: boolean | null
  created_at: string | null
}

interface Subscription {
  id: string
  tier_slug: string | null
  status: string | null
  billing_cycle: string | null
  current_period_end: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string | null
}

interface Checkin {
  id: string
  mood: string | null
  prayer_focus: string | null
  notes: string | null
  created_at: string | null
}

interface PrayerRequest {
  id: string
  title: string
  description: string
  status: string | null
  created_at: string | null
}

interface MemberPayload {
  success: boolean
  member: MemberDetail
  giving: {
    donations: Donation[]
    totalGiven: number
    covenantGiven: number
    monthlyRecognized: number
    donationCount: number
    recurringDonationCount: number
    lastGiftAt: string | null
  }
  subscriptions: Subscription[]
  care: {
    checkins: Checkin[]
    prayerRequests: PrayerRequest[]
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}

function formatDate(value?: string | null) {
  if (!value) return 'Not recorded'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function tierLabel(tier?: string | null) {
  if (tier === 'covenant') return 'Covenant Partner'
  if (tier === 'partner') return 'Partner'
  return 'Free Member'
}

function subscriptionAmount(subscription?: Subscription) {
  if (!subscription?.tier_slug) return 0
  if (subscription.tier_slug === 'covenant') {
    return subscription.billing_cycle === 'annual' ? 1500 : 150
  }
  if (subscription.tier_slug === 'partner') {
    return subscription.billing_cycle === 'annual' ? 500 : 50
  }
  return 0
}

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<MemberPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMember = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/members/${params.id}`, { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to load member')
      }

      setData(payload)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load member')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMember()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading member profile...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Member unavailable</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchMember} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { member, giving, subscriptions, care } = data
  const fullName = `${member.first_name} ${member.last_name}`.trim()
  const activeSubscription = subscriptions.find(sub => ['active', 'trialing', 'past_due'].includes(sub.status || ''))

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button asChild variant="ghost">
            <Link href="/members">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Members
            </Link>
          </Button>
          <Button onClick={fetchMember} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                <User className="h-8 w-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold text-navy">{fullName}</h1>
                  <Badge className={member.tier === 'covenant' ? 'bg-navy text-white' : member.tier === 'partner' ? 'bg-gold text-navy' : 'bg-slate-200 text-navy'}>
                    {tierLabel(member.tier)}
                  </Badge>
                  {member.is_admin && <Badge variant="outline">Admin</Badge>}
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </span>
                  {member.phone && (
                    <span className="inline-flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {member.phone}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(member.joined_at || member.created_at)}
                  </span>
                </div>
                {member.role_upgrade_reason && (
                  <p className="mt-3 text-sm text-muted-foreground">{member.role_upgrade_reason}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="bg-navy hover:bg-navy/90">
                <Link href={`/email-campaigns?tab=quicksend`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin-covenant-partners">
                  <HeartHandshake className="mr-2 h-4 w-4" />
                  Partner Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Giving</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{formatCurrency(giving.totalGiven)}</div>
              <p className="mt-1 text-xs text-muted-foreground">{giving.donationCount} successful gifts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Covenant Giving</CardTitle>
              <HeartHandshake className="h-5 w-5 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{formatCurrency(giving.covenantGiven)}</div>
              <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(giving.monthlyRecognized)} recognized this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Subscription</CardTitle>
              <CreditCard className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize text-navy">{activeSubscription?.status || 'None'}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeSubscription
                  ? `${formatCurrency(subscriptionAmount(activeSubscription))} / ${activeSubscription.billing_cycle || 'month'}`
                  : 'No active Stripe subscription found'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Care Signals</CardTitle>
              <ShieldCheck className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{care.checkins.length + care.prayerRequests.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Recent check-ins and prayer requests</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-navy">Giving History</CardTitle>
              <CardDescription>Recent successful and pending giving records connected to this member.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {giving.donations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                          No giving history found for this member.
                        </TableCell>
                      </TableRow>
                    ) : (
                      giving.donations.slice(0, 12).map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell>{formatDate(donation.created_at)}</TableCell>
                          <TableCell className="capitalize">{(donation.designation || 'general').replace(/_/g, ' ')}</TableCell>
                          <TableCell>{donation.is_recurring || donation.donation_type === 'recurring' ? 'Recurring' : 'One-time'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{donation.status || 'unknown'}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(donation.amount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-navy">Subscription Records</CardTitle>
                <CardDescription>Stripe-backed membership or recurring subscription records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {subscriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subscription records found.</p>
                ) : (
                  subscriptions.map((subscription) => (
                    <div key={subscription.id} className="rounded-lg border bg-white p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize text-navy">{subscription.tier_slug || 'Subscription'}</p>
                        <Badge className={subscription.status === 'active' ? 'bg-green-600 text-white' : 'bg-slate-200 text-navy'}>
                          {subscription.status || 'unknown'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {subscriptionAmount(subscription) ? formatCurrency(subscriptionAmount(subscription)) : 'Amount unknown'} / {subscription.billing_cycle || 'month'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Current period ends {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-navy">Recent Care Notes</CardTitle>
                <CardDescription>Check-ins and prayer requests that may need pastoral awareness.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {care.checkins.length === 0 && care.prayerRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent care signals found.</p>
                ) : (
                  <>
                    {care.checkins.map((checkin) => (
                      <div key={checkin.id} className="rounded-lg border bg-white p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-navy">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Daily check-in · {formatDate(checkin.created_at)}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {[checkin.mood, checkin.prayer_focus, checkin.notes].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    ))}
                    {care.prayerRequests.map((request) => (
                      <div key={request.id} className="rounded-lg border bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-navy">{request.title}</p>
                          <Badge variant="outline">{request.status || 'active'}</Badge>
                        </div>
                        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{request.description}</p>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}

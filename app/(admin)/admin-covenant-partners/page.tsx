'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  HeartHandshake,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
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

interface CovenantPartnerMetrics {
  activePartners: number
  monthlyRecognized: number
  anonymousMonthlyRecognized: number
  totalCovenantGiving: number
  recurringChargeCount: number
  averageMonthlyGift: number
  partnerTierCount: number
  covenantTierCount: number
  activeSubscriptions: number
}

interface CovenantPartnerRow {
  id: string
  name: string
  email: string | null
  phone: string | null
  tier: 'free' | 'partner' | 'covenant'
  level: string
  monthlyAmount: number
  totalGiven: number
  lastGiftAt: string | null
  lastAmount: number
  recurring: boolean
  subscriptionStatus: string | null
  joinedAt: string | null
  lastActiveAt: string | null
}

interface CovenantPartnerActivity {
  id: string
  partnerName: string
  amount: number
  recurring: boolean
  createdAt: string | null
}

interface CovenantPartnerData {
  success: boolean
  metrics: CovenantPartnerMetrics
  tierBreakdown: Record<string, number>
  levelBreakdown: Record<string, number>
  partners: CovenantPartnerRow[]
  recentActivity: CovenantPartnerActivity[]
  generatedAt: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

function formatDate(value: string | null) {
  if (!value) return 'Not recorded'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function tierLabel(tier: string) {
  if (tier === 'covenant') return 'Covenant'
  if (tier === 'partner') return 'Partner'
  return 'Member'
}

export default function AdminCovenantPartnersPage() {
  const [data, setData] = useState<CovenantPartnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/covenant-partners', { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to load covenant partner data')
      }

      setData(payload)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const topLevels = useMemo(() => {
    if (!data) return []
    return Object.entries(data.levelBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }, [data])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading Covenant Partner command view...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Covenant Partner data unavailable
            </CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-col gap-4 rounded-xl bg-navy p-6 text-white shadow-lg sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-sm text-gold">
              <HeartHandshake className="h-4 w-4" />
              Covenant Partner Operations
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Partner Stewardship Dashboard</h1>
            <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">
              Track the people, recurring support, communication rhythm, and pastoral follow-up behind the Covenant Partner movement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/email-campaigns?tab=quicksend&partnerTemplate=monthly-update">
                <Mail className="mr-2 h-4 w-4" />
                Email Partners
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/partners" target="_blank">
                View Landing Page
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Partners</CardTitle>
              <Users className="h-5 w-5 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{data.metrics.activePartners}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {data.metrics.partnerTierCount} partner tier, {data.metrics.covenantTierCount} covenant tier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recognized</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{formatCurrency(data.metrics.monthlyRecognized)}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                From recurring covenant partner charges this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Monthly Gift</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{formatCurrency(data.metrics.averageMonthlyGift)}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on {data.metrics.recurringChargeCount} recorded recurring charges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Covenant Giving</CardTitle>
              <Sparkles className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{formatCurrency(data.metrics.totalCovenantGiving)}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Recorded under the covenant partner designation
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-navy">Partner Roster</CardTitle>
                <CardDescription>Live partner records connected to member tier and covenant giving data.</CardDescription>
              </div>
              <Button onClick={fetchData} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-right">This Month</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Last Gift</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.partners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          No Covenant Partner records are available yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.partners.slice(0, 12).map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell>
                            <div className="font-medium text-navy">{partner.name}</div>
                            <div className="text-xs text-muted-foreground">{partner.email || 'No email on file'}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gold/50 bg-gold/10 text-navy">
                              {partner.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={partner.tier === 'covenant' ? 'bg-navy text-white' : 'bg-slate-200 text-navy'}>
                              {tierLabel(partner.tier)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(partner.monthlyAmount)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(partner.totalGiven)}</TableCell>
                          <TableCell>{formatDate(partner.lastGiftAt)}</TableCell>
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
                <CardTitle className="text-navy">Stewardship Rhythm</CardTitle>
                <CardDescription>Recommended next actions for the partner community.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start bg-navy hover:bg-navy/90">
                  <Link href="/email-campaigns?tab=quicksend&partnerTemplate=welcome">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Send Partner Welcome Email
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/email-campaigns?tab=quicksend&partnerTemplate=gathering">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Invite to Partner Gathering
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/partner-hub" target="_blank">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Review Partner Hub
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-navy">Partnership Levels</CardTitle>
                <CardDescription>Current mix based on recent covenant partner giving.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topLevels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No level data available yet.</p>
                ) : (
                  topLevels.map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                      <span className="text-sm font-medium text-navy">{level}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-navy">Recent Covenant Activity</CardTitle>
                <CardDescription>Latest partner gifts recorded by Stripe/webhook data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent covenant partner activity.</p>
                ) : (
                  data.recentActivity.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-navy">{activity.partnerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.recurring ? 'Recurring partner gift' : 'One-time covenant gift'} · {formatDate(activity.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-navy">{formatCurrency(activity.amount)}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}

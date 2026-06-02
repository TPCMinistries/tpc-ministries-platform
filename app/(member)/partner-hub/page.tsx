import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Mail,
  Mic2,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

const partnerResources = [
  {
    title: 'Monthly Partner Gathering',
    description: 'A recurring space for alignment, teaching, prayer, and corporate encouragement.',
    status: 'Scheduling',
    icon: CalendarDays,
  },
  {
    title: 'Bi-weekly Partner Teaching',
    description: 'Focused equipping for spiritual maturity, wisdom, leadership, and future-readiness.',
    status: 'Email rhythm',
    icon: BookOpen,
  },
  {
    title: 'AI and Future-Readiness Training',
    description: 'Practical sessions helping believers think wisely about technology, vocation, and the future ahead.',
    status: 'Coming soon',
    icon: Sparkles,
  },
  {
    title: 'Missions and International Updates',
    description: 'Early visibility into missions needs, prayer points, and opportunities to support global assignments.',
    status: 'Active',
    icon: Globe2,
  },
]

const partnerCommitments = [
  'Grow spiritually, practically, and prophetically',
  'Help sustain discipleship, prayer, missions, media, and leadership development',
  'Stay aligned with the assignment without treating ministry as a transaction',
  'Pray, participate, and build as God gives grace and capacity',
]

const upcomingRhythm = [
  {
    label: 'Teaching',
    title: 'Wisdom for the Future Ahead',
    note: 'Partner teaching topic being prepared for email release.',
    icon: GraduationCap,
  },
  {
    label: 'Gathering',
    title: 'Monthly Partner Alignment',
    note: 'Live gathering details will appear here once scheduled.',
    icon: Users,
  },
  {
    label: 'Ministry',
    title: 'Corporate Prayer and Encouragement',
    note: 'Designated partner moments will be announced through partner communications.',
    icon: Mic2,
  },
]

const onboardingSteps = [
  'Confirm your account and giving settings',
  'Watch for the next partner email update',
  'Bring prayer focus to the monthly gathering',
  'Choose one area of practical growth for this season',
]

const impactUpdates = [
  {
    title: 'Prophetic ministry and prayer',
    note: 'Partner support helps create space for prayer gatherings, encouragement, and ministry moments.',
  },
  {
    title: 'Education and missions',
    note: 'Ongoing giving strengthens missions communication, field preparation, and education outreach.',
  },
  {
    title: 'Future-readiness equipping',
    note: 'Partners help build resources that prepare believers for wisdom, leadership, technology, and purpose.',
  },
]

const successfulDonationStatuses = ['succeeded', 'completed', 'paid']

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

function partnershipLevel(amount: number) {
  if (amount >= 250) return 'Vision Partner'
  if (amount >= 100) return 'Kingdom Partner'
  if (amount >= 50) return 'Steward'
  if (amount >= 25) return 'Builder'
  return 'Covenant Partner'
}

function formatEventDate(value: string | null) {
  if (!value) return 'Date pending'

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export default async function PartnerHubPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: member } = user
    ? await supabase
        .from('members')
        .select('id, first_name, tier, role, created_at')
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null }

  const { data: covenantDonations } = member?.id
    ? await supabase
        .from('donations')
        .select('id, amount, donation_type, designation, is_recurring, status, created_at')
        .eq('member_id', member.id)
        .eq('designation', 'covenant_partner')
        .in('status', successfulDonationStatuses)
        .order('created_at', { ascending: false })
        .limit(24)
    : { data: [] }

  const { data: subscriptions } = member?.id
    ? await supabase
        .from('member_subscriptions')
        .select('id, tier_slug, billing_cycle, status, current_period_end, created_at')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  const { data: partnerEvents } = await supabase
    .from('events')
    .select('id, title, description, event_type, location, virtual_link, start_time, tier_required')
    .eq('status', 'upcoming')
    .gte('start_time', new Date().toISOString())
    .in('tier_required', ['partner', 'covenant'])
    .order('start_time', { ascending: true })
    .limit(3)

  const { data: partnerLibrary } = await supabase
    .from('resources')
    .select('id, title, description, type, file_url, category, tier_required, created_at')
    .eq('published', true)
    .in('tier_required', ['partner', 'covenant'])
    .order('created_at', { ascending: false })
    .limit(4)

  const firstName = member?.first_name || 'Friend'
  const role = member?.role || member?.tier || 'free'
  const isPartner = ['partner', 'covenant', 'covenant_partner', 'staff', 'admin'].includes(role)
  const memberSince = member?.created_at
    ? new Date(member.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null
  const donations = covenantDonations || []
  const activeSubscription = (subscriptions || []).find((subscription) =>
    ['active', 'trialing', 'past_due'].includes(subscription.status || '')
  )
  const totalCovenantGiving = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0)
  const currentMonth = new Date()
  const monthlyRecognized = donations
    .filter((donation) => {
      if (!donation.created_at) return false
      const createdAt = new Date(donation.created_at)
      const recurring = donation.is_recurring === true || donation.donation_type === 'recurring'
      return recurring
        && createdAt.getFullYear() === currentMonth.getFullYear()
        && createdAt.getMonth() === currentMonth.getMonth()
    })
    .reduce((sum, donation) => sum + Number(donation.amount || 0), 0)
  const lastGift = donations[0] || null
  const partnerStanding = activeSubscription?.status === 'active' || monthlyRecognized > 0 || isPartner
  const level = partnershipLevel(Number(lastGift?.amount || monthlyRecognized || 0))
  const dynamicEvents = partnerEvents || []
  const dynamicResources = partnerLibrary || []

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <section className="relative overflow-hidden rounded-2xl bg-navy-950 p-6 text-white shadow-sm md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,184,131,0.22),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(91,134,171,0.16),transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm text-gold">
              <HeartHandshake className="h-4 w-4" />
              Covenant Partner Hub
            </div>
            <h1 className="font-display text-3xl font-bold md:text-5xl">Welcome back, {firstName}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-navy-100 md:text-lg">
              This is the home base for Covenant Partner updates, teachings, gatherings, and practical
              equipping. The aim is steady growth, mature alignment, and kingdom impact.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <Link href="/library">
                  Continue Learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <Link href="/my-giving">Manage Giving</Link>
              </Button>
            </div>
          </div>
          <Card className="border-white/15 bg-white/10 text-white backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-gold" />
                Partner Standing
              </CardTitle>
              <CardDescription className="text-navy-100">
                Your current member record and next recommended action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/10 p-4">
                <span className="text-sm text-navy-100">Status</span>
                <Badge className={partnerStanding ? 'bg-gold text-navy-950' : 'bg-white/15 text-white'}>
                  {partnerStanding ? 'Partner Access' : 'Member'}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/10 p-4">
                <span className="text-sm text-navy-100">Partnership Level</span>
                <span className="font-medium text-white">{level}</span>
              </div>
              {memberSince && (
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/10 p-4">
                  <span className="text-sm text-navy-100">Member Since</span>
                  <span className="font-medium text-white">{memberSince}</span>
                </div>
              )}
              {!partnerStanding && (
                <div className="rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm text-gold-100">
                  Covenant Partner access is connected to monthly partnership. You can begin the partner
                  flow when you are ready.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <DollarSign className="h-5 w-5 text-gold-text" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy dark:text-foreground">
              {formatCurrency(monthlyRecognized)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Recurring covenant partnership recognized this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Covenant Giving</CardTitle>
            <HeartHandshake className="h-5 w-5 text-gold-text" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy dark:text-foreground">
              {formatCurrency(totalCovenantGiving)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{donations.length} recorded covenant partner gifts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Gift</CardTitle>
            <Receipt className="h-5 w-5 text-gold-text" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy dark:text-foreground">
              {lastGift ? formatCurrency(Number(lastGift.amount || 0)) : '$0'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(lastGift?.created_at || null)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subscription</CardTitle>
            <CreditCard className="h-5 w-5 text-gold-text" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize text-navy dark:text-foreground">
              {activeSubscription?.status || 'Not Found'}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeSubscription?.current_period_end
                ? `Current period ends ${formatDate(activeSubscription.current_period_end)}`
                : 'Stripe status appears here when available'}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl text-navy dark:text-foreground">
              Partnership record
            </CardTitle>
            <CardDescription>
              Recent Covenant Partner giving connected to your member profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {donations.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-background p-5 text-sm text-muted-foreground">
                No covenant partner gifts are connected to this account yet. If you recently partnered,
                Stripe may still be syncing your record.
              </div>
            ) : (
              donations.slice(0, 5).map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4"
                >
                  <div>
                    <p className="font-medium text-navy dark:text-foreground">
                      {donation.is_recurring || donation.donation_type === 'recurring'
                        ? 'Recurring Covenant Partnership'
                        : 'Covenant Partner Gift'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(donation.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy dark:text-foreground">
                      {formatCurrency(Number(donation.amount || 0))}
                    </p>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {donation.status || 'recorded'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl text-navy dark:text-foreground">
              Your next best step
            </CardTitle>
            <CardDescription>
              Keep the partnership rhythm simple and steady.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-gold/30 bg-gold/10 p-4">
              <div className="mb-2 flex items-center gap-2 font-medium text-navy dark:text-foreground">
                <ShieldCheck className="h-4 w-4 text-gold-text" />
                Stay connected to the monthly rhythm
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Watch for partner updates, attend the next gathering when scheduled, and keep your giving
                settings current so the ministry can steward partnership clearly.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild variant="gold" className="w-full">
                <Link href="/my-giving">Review Giving</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/events">View Upcoming Events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl text-navy dark:text-foreground">
              Partner commitments
            </CardTitle>
            <CardDescription>
              Partnership is a way to build faithfully while staying connected to ongoing equipping.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {partnerCommitments.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-foreground/80">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm text-muted-foreground">
              <strong className="text-navy dark:text-foreground">Reminder:</strong> Prophetic ministry is
              never for sale. Partnership sustains the work and keeps you connected to teaching,
              community, and equipping.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl text-navy dark:text-foreground">
              Partner library
            </CardTitle>
            <CardDescription>
              Recent partner resources and equipping materials published for this level.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {dynamicResources.length === 0 ? (
              partnerResources.map((resource) => {
                const Icon = resource.icon
                return (
                  <div key={resource.title} className="rounded-lg border bg-background p-4">
                    <div className="mb-2 flex items-center gap-2 font-medium text-navy dark:text-foreground">
                      <Icon className="h-4 w-4 text-gold-text" />
                      {resource.title}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{resource.description}</p>
                    <Badge variant="outline" className="mt-3">{resource.status}</Badge>
                  </div>
                )
              })
            ) : (
              dynamicResources.map((resource) => (
                <div key={resource.id} className="rounded-lg border bg-background p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 font-medium text-navy dark:text-foreground">
                      <FileText className="h-4 w-4 shrink-0 text-gold-text" />
                      <span>{resource.title}</span>
                    </div>
                    <Badge variant="outline" className="capitalize">{resource.type || 'resource'}</Badge>
                  </div>
                  {resource.description && (
                    <p className="text-sm leading-6 text-muted-foreground">{resource.description}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">{resource.category || 'Partner Resource'}</span>
                    {resource.file_url && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={resource.file_url} target="_blank">
                          Open
                          <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl text-navy dark:text-foreground">
              Partner onboarding
            </CardTitle>
            <CardDescription>
              A simple path for staying connected after becoming a Covenant Partner.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {onboardingSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-lg border bg-background p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold text-gold-text">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground/80">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl text-navy dark:text-foreground">
              What partnership is helping build
            </CardTitle>
            <CardDescription>
              These impact notes can become dynamic updates as the ministry rhythm matures.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {impactUpdates.map((update) => (
              <div key={update.title} className="rounded-lg border bg-background p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-navy dark:text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-gold-text" />
                  {update.title}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{update.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-navy dark:text-foreground">Upcoming partner rhythm</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Partner gatherings, teachings, and ministry moments connected to this level.
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/events">View Events</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {dynamicEvents.length === 0
            ? upcomingRhythm.map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.title}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="outline">{item.label}</Badge>
                        <Icon className="h-5 w-5 text-gold-text" />
                      </div>
                      <CardTitle className="text-xl text-navy dark:text-foreground">{item.title}</CardTitle>
                      <CardDescription>{item.note}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })
            : dynamicEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="outline" className="capitalize">{event.event_type || 'event'}</Badge>
                      <CalendarDays className="h-5 w-5 text-gold-text" />
                    </div>
                    <CardTitle className="text-xl text-navy dark:text-foreground">{event.title}</CardTitle>
                    <CardDescription>{event.description || 'Partner event details will be updated soon.'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm font-medium text-navy dark:text-foreground">
                      {formatEventDate(event.start_time)}
                    </div>
                    {(event.location || event.virtual_link) && (
                      <p className="text-sm text-muted-foreground">
                        {event.location || 'Online gathering'}
                      </p>
                    )}
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/events">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-gold-text">
              <Mail className="h-4 w-4" />
              Partner communication
            </div>
            <h2 className="font-display text-2xl text-navy dark:text-foreground">Stay ready for the next update</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Partner emails should carry teaching, schedule details, prayer direction, and ministry progress.
              Until those automations are finalized, this hub keeps the pathway clear.
            </p>
          </div>
          <Button asChild variant="gold" size="lg">
            <Link href="/account?tab=membership">Account Settings</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

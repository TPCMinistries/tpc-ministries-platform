import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Mail,
  Mic2,
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

export default async function PartnerHubPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: member } = user
    ? await supabase
        .from('members')
        .select('first_name, tier, role, created_at')
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null }

  const firstName = member?.first_name || 'Friend'
  const role = member?.role || member?.tier || 'free'
  const isPartner = ['partner', 'covenant', 'staff', 'admin'].includes(role)
  const memberSince = member?.created_at
    ? new Date(member.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

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
                <Badge className={isPartner ? 'bg-gold text-navy-950' : 'bg-white/15 text-white'}>
                  {isPartner ? 'Partner Access' : 'Member'}
                </Badge>
              </div>
              {memberSince && (
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/10 p-4">
                  <span className="text-sm text-navy-100">Member Since</span>
                  <span className="font-medium text-white">{memberSince}</span>
                </div>
              )}
              {!isPartner && (
                <div className="rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm text-gold-100">
                  Covenant Partner access is connected to monthly partnership. You can begin the partner
                  flow when you are ready.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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

        <div className="grid gap-4 sm:grid-cols-2">
          {partnerResources.map((resource) => {
            const Icon = resource.icon
            return (
              <Card key={resource.title}>
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-gold/15">
                    <Icon className="h-5 w-5 text-gold-text" />
                  </div>
                  <CardTitle className="text-lg text-navy dark:text-foreground">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{resource.status}</Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-navy dark:text-foreground">Upcoming partner rhythm</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These cards will become dynamic as partner gatherings and teachings are scheduled.
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/events">View Events</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {upcomingRhythm.map((item) => {
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
          })}
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

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gift,
  HeartHandshake,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: {
    absolute: 'Welcome Covenant Partner | TPC Ministries',
  },
  description:
    'Welcome to Covenant Partnership with TPC Ministries. See what happens next and how to stay connected to partner gatherings, teaching, missions, and equipping.',
}

const nextSteps = [
  {
    title: 'Watch your inbox',
    description:
      'You will receive your Stripe confirmation and Covenant Partner welcome communication at the email used during checkout.',
    icon: Mail,
  },
  {
    title: 'Create or access your member account',
    description:
      'Use the same email from checkout so your partner record, giving history, and ministry access can stay connected.',
    icon: ShieldCheck,
  },
  {
    title: 'Open the Partner Hub',
    description:
      'The Partner Hub is the home for partner updates, gatherings, resources, and the monthly rhythm of connection.',
    icon: HeartHandshake,
  },
  {
    title: 'Join the partner rhythm',
    description:
      'Monthly gatherings, teachings, and special ministry updates will be shared as the schedule is finalized.',
    icon: CalendarDays,
  },
]

const partnerPath = [
  'Monthly live partner gatherings',
  'Bi-weekly teaching and equipping by email',
  'Partner updates on missions, media, discipleship, and leadership development',
  'Opportunities to participate in partner gatherings and ministry moments as scheduled',
]

const supportCards = [
  {
    title: 'Manage your monthly partnership',
    description: 'Review giving history, receipts, and recurring partnership details from your member account.',
    href: '/my-giving',
    cta: 'View Giving',
    icon: Gift,
  },
  {
    title: 'Access partner-only updates',
    description: 'Open the Partner Hub for resources, gatherings, and the ministry rhythm connected to this flow.',
    href: '/partner-hub',
    cta: 'Open Partner Hub',
    icon: Users,
  },
  {
    title: 'Need help connecting your account?',
    description: 'If your member account and checkout email do not match, contact the ministry team for support.',
    href: '/contact',
    cta: 'Contact Support',
    icon: MessageSquareText,
  },
]

type CovenantPartnerWelcomePageProps = {
  searchParams?: {
    session_id?: string
  }
}

export default function CovenantPartnerWelcomePage({ searchParams }: CovenantPartnerWelcomePageProps) {
  const sessionId = searchParams?.session_id
  const checkoutReference = sessionId ? `${sessionId.slice(0, 8)}...${sessionId.slice(-6)}` : null

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-navy-950 px-4 pb-16 pt-32 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,184,131,0.2),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(91,134,171,0.16),transparent_28%),linear-gradient(180deg,#0e1a2e_0%,#152844_70%,#0e1a2e_100%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/15">
            <HeartHandshake className="h-8 w-8 text-gold" />
          </div>
          <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold">
            Covenant Partnership
          </p>
          <h1 className="mt-4 font-display text-display-md text-white sm:text-display-lg md:text-display-xl">
            Welcome to the Covenant Partner community
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-navy-100">
            Thank you for helping sustain the prophetic ministry, discipleship, missions, and practical
            equipping of TPC Ministries. This is your first checkpoint for staying connected to the
            ministry rhythm you are helping build.
          </p>
          <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-gold/30 bg-gold/10 p-4 text-left text-body-sm text-gold-100">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
              <div>
                <p className="font-semibold text-gold">Your monthly partnership checkout was received.</p>
                <p className="mt-1 text-navy-100">
                  Stripe will send the official confirmation and receipt. If you created this partnership
                  while logged out, use the same email when creating your member account.
                </p>
                {checkoutReference && (
                  <p className="mt-2 text-navy-200">Checkout reference: {checkoutReference}</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" variant="gold">
              <Link href="/auth/signup?next=%2Fpartner-hub">
                Create Member Account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            >
              <Link href="/auth/login?next=%2Fpartner-hub">Access Partner Hub</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold-text">
              What Happens Next
            </p>
            <h2 className="mt-3 font-display text-display-md text-navy">A clear partner pathway</h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              Partnership is a sustained rhythm of alignment, learning, prayer, and mission. The goal is
              connection without pressure and clarity without confusion.
            </p>
            <div className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-gold-text" />
                <div>
                  <h3 className="font-display text-body-xl text-navy">Recommended first action</h3>
                  <p className="mt-2 text-body-md text-muted-foreground">
                    Create or log into your member account with the checkout email, then open the Partner
                    Hub. That gives the ministry a clean path to connect your giving, partner access, and
                    future communications.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {nextSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <article key={step.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-gold/15">
                      <Icon className="h-5 w-5 text-gold-text" />
                    </div>
                    <div>
                      <p className="text-body-xs font-semibold uppercase tracking-[0.16em] text-gold-text">
                        Step {index + 1}
                      </p>
                      <h3 className="mt-1 font-display text-body-xl text-navy">{step.title}</h3>
                      <p className="mt-2 text-body-md text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-lg border border-gold/30 bg-card p-6 shadow-sm md:p-8">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <Sparkles className="h-9 w-9 text-gold-text" />
              <h2 className="mt-4 font-display text-display-sm text-navy">Your partner rhythm</h2>
              <p className="mt-3 text-body-md text-muted-foreground">
                These are the first connection points being organized for Covenant Partners.
              </p>
            </div>
            <ul className="grid gap-3">
              {partnerPath.map((item) => (
                <li key={item} className="flex gap-3 text-body-md text-navy">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-text" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-sm text-muted-foreground">
              The Partner Hub is the home base for partner communication, equipping, and ministry updates.
            </p>
            <Button asChild variant="outline">
              <Link href="/partner-hub">
                Open Partner Hub
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold-text">
              Account and Support
            </p>
            <h2 className="mt-3 font-display text-display-md text-navy">Keep the flow connected</h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              The best partner experience happens when checkout, member access, communications, and
              giving records are connected through the same email address.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {supportCards.map((card) => {
              const Icon = card.icon
              return (
                <article key={card.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gold/15">
                    <Icon className="h-5 w-5 text-gold-text" />
                  </div>
                  <h3 className="mt-4 font-display text-body-xl text-navy">{card.title}</h3>
                  <p className="mt-3 text-body-md text-muted-foreground">{card.description}</p>
                  <Button asChild variant="link" className="mt-4 h-auto p-0 text-gold-text">
                    <Link href={card.href}>
                      {card.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-navy-950 px-4 py-section-sm text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold">
              A Pastoral Note
            </p>
            <h2 className="mt-3 font-display text-display-md text-white">Thank you for helping build.</h2>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/8 p-6">
            <p className="text-body-lg text-navy-100">
              Covenant Partnership is not payment for prophecy or access to ministry. It is a mature,
              prayerful way to help sustain the work while staying connected to teaching, community,
              missions, and equipping for the future ahead.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="gold">
                <Link href="/partner-hub">
                  Continue to Partner Hub
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <Link href="/partners">Return to Partner Page</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

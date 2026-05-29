import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Mail,
  ShieldCheck,
  Sparkles,
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
      'You will receive confirmation and partner communication at the email used during checkout.',
    icon: Mail,
  },
  {
    title: 'Join the partner rhythm',
    description:
      'Monthly gatherings, teachings, and special ministry updates will be shared as the schedule is finalized.',
    icon: CalendarDays,
  },
  {
    title: 'Create or access your member account',
    description:
      'Use the member portal to follow teachings, track your journey, manage giving, and access partner updates.',
    icon: ShieldCheck,
  },
]

const partnerPath = [
  'Monthly live partner gatherings',
  'Bi-weekly teaching and equipping by email',
  'Partner updates on missions, media, discipleship, and leadership development',
  'Opportunities to participate in partner gatherings and ministry moments as scheduled',
]

export default function CovenantPartnerWelcomePage() {
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
            Welcome to the builder community
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-navy-100">
            Thank you for helping sustain the prophetic ministry, discipleship, missions, and practical
            equipping of TPC Ministries. This page gives you the next steps for staying connected.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" variant="gold">
              <Link href="/auth/signup">
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
              <Link href="/auth/login">Access Member Portal</Link>
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
          </div>
          <div className="grid gap-4">
            {nextSteps.map((step) => {
              const Icon = step.icon
              return (
                <article key={step.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-gold/15">
                      <Icon className="h-5 w-5 text-gold-text" />
                    </div>
                    <div>
                      <h3 className="font-display text-body-xl text-navy">{step.title}</h3>
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
              Need a one-time giving record or receipt history? Use the member giving area after login.
            </p>
            <Button asChild variant="outline">
              <Link href="/my-giving">
                View My Giving
                <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

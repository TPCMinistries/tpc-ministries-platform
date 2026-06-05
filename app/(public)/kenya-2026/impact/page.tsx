import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ArrowRight,
  HandHeart,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Camera,
  Church,
  MapPin,
  Calendar,
  Users,
  Sparkles,
} from 'lucide-react'

// Aggregate numbers locked from kenya_trip_* tables as of trip close (2026-05-07).
// Source SQL lives in supabase/migrations/20260521_archive_kenya_trip_data.sql
// — the underlying tables are now marked ARCHIVE and these stats are frozen.
const STATS = {
  approvedParticipants: 14,
  totalApplicants: 27,
  waitlistApplicants: 21,
  serviceTracks: 5,
  daysOnGround: 14,
  itineraryEntries: 52,
  lodgingLocations: 4,
  conferenceSessions: 28,
  conferences: 2,
  supplyFunds: 8,
} as const

const SERVICE_TRACKS = [
  {
    name: 'Ministry',
    icon: Church,
    scope: 'Nairobi conference (Apr 24) + Mombasa conference (May 3) + local church visits across Western Kenya.',
  },
  {
    name: 'Healthcare',
    icon: Stethoscope,
    scope: 'Community health outreach in partnership with local clinics. Triage, prayer, and basic care for hundreds.',
  },
  {
    name: 'Education',
    icon: GraduationCap,
    scope: 'School visits and youth-track conference sessions. Investing in the next generation of Kenyan leaders.',
  },
  {
    name: 'Business',
    icon: Briefcase,
    scope: 'Conference workshops and one-on-one mentoring with Kenyan entrepreneurs. Kingdom-economy strategy.',
  },
  {
    name: 'Media',
    icon: Camera,
    scope: 'Photography, videography, social media, and the trip documentary. So the story keeps reaching.',
  },
] as const

export const metadata: Metadata = {
  title: 'Kenya 2026 — Impact Report | TPC Ministries',
  description:
    'Fourteen days on the ground, five service tracks, two conferences, and a Kingdom imprint that will outlast the trip. The numbers + the next step.',
  openGraph: {
    title: 'Kenya 2026 — Impact Report',
    description: 'What 14 days of Kingdom impact looks like, by the numbers.',
    images: ['/videos/kenya/posters/highlight-video.jpg'],
  },
}

export default function KenyaImpactPage() {
  return (
    <div className="bg-navy-950 text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-20 sm:px-6 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,184,131,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(30,58,138,0.5),transparent_70%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Link
            href="/kenya-2026"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-md transition hover:border-gold/40 hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to the recap
          </Link>

          <p className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold/80">
            <Sparkles className="h-3.5 w-3.5" />
            Kenya 2026 · Impact report
          </p>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            14 days.
            <br />
            <span className="text-gold">Kingdom imprint.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-balance text-base text-white/70 sm:text-lg">
            April 22 – May 7, 2026. Five service tracks, two conferences, dozens of locations, and a movement that won&apos;t end with the return flights. Here&apos;s what God did — by the numbers.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-gold text-navy-950 hover:bg-gold/90">
              <Link href="/giving">
                Support the next mission
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              <Link href="/kenya-2026">
                Watch the footage
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* BIG NUMBERS GRID */}
      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-gold/80">
            By the numbers
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl text-white sm:text-4xl lg:text-5xl">
            What 14 days on the ground actually looked like.
          </h2>

          <div className="mt-12 grid grid-cols-2 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            <BigStat value={STATS.approvedParticipants} label="Servants on the ground" />
            <BigStat value={STATS.serviceTracks}        label="Service tracks" />
            <BigStat value={STATS.daysOnGround}         label="Days in-country" />
            <BigStat value={STATS.conferenceSessions}   label="Conference sessions" />
            <BigStat value={STATS.lodgingLocations}     label="Mission bases" />
            <BigStat value={STATS.itineraryEntries}     label="Scheduled engagements" />
            <BigStat value={STATS.conferences}          label="Major conferences" />
            <BigStat value={STATS.totalApplicants}      label="Applications received" />
            <BigStat value={STATS.waitlistApplicants}   label="On the waitlist" />
            <BigStat value={STATS.supplyFunds}          label="Supply funds raised" />
          </div>
        </div>
      </section>

      {/* SERVICE TRACKS */}
      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-gold/80">
            How we showed up
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-center font-display text-3xl text-white sm:text-4xl lg:text-5xl">
            Five tracks. One mission.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-center text-white/70">
            Each servant brought their craft, their calling, and their hands. Every track multiplied the others.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICE_TRACKS.map((t) => {
              const Icon = t.icon
              return (
                <div
                  key={t.name}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-7 transition hover:border-gold/30 hover:from-gold/[0.04]"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/5 blur-3xl transition group-hover:bg-gold/10" />
                  <div className="relative">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-gold/10">
                      <Icon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="font-display text-2xl text-white">{t.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">
                      {t.scope}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CONFERENCES SPOTLIGHT */}
      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <ConferenceCard
            city="Nairobi"
            date="April 24, 2026"
            label="Opening Kingdom conference"
            description="Brought the trip&apos;s prophetic and ministry tracks together with hundreds of Nairobi believers. Worship, prophetic words, and equipping for Kenyan leaders."
          />
          <ConferenceCard
            city="Mombasa"
            date="May 3, 2026"
            label="Coastal Kingdom conference"
            description="Carried the same fire to the coast — a multi-day gathering of pastors, marketplace leaders, and youth on Kenya&apos;s eastern shore."
          />
        </div>
      </section>

      {/* PARTICIPANT QUOTES PLACEHOLDER */}
      {/* TODO(consent): Once the 23 participants re-confirm publishing rights,
          drop 5-7 quote cards here pulled from kenya_trip_reflections + their
          fundraising_story field. Use first name only by default; full name +
          headshot only with explicit per-person consent. Photo source:
          public/videos/kenya/posters/* and the curated kenya-2026/photos/* set.
          See HANDOFF.md Phase B for the full handoff.
      */}

      {/* WHAT'S NEXT */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.12),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold/80">
            What&apos;s next
          </p>
          <h2 className="mt-4 font-display text-4xl text-white sm:text-5xl">
            Kenya was the first.
            <br />
            <span className="text-gold">Not the last.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-balance text-white/70">
            Kingdom Impact Trips are a regular rhythm now. The next one is being prepared. Give to seed it, or get on the list to go.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-gold text-navy-950 hover:bg-gold/90">
              <Link href="/giving">
                Give toward the next mission
                <HandHeart className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              <Link href="/connect">
                Tell us you want to go
                <Users className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function BigStat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-4xl font-bold text-gold sm:text-5xl lg:text-6xl">
        {value}
      </div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:text-xs">
        {label}
      </div>
    </div>
  )
}

function ConferenceCard({
  city,
  date,
  label,
  description,
}: {
  city: string
  date: string
  label: string
  description: string
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 sm:p-10">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
          <MapPin className="h-3.5 w-3.5" />
          {city}
        </div>
        <h3 className="mt-4 font-display text-4xl text-white sm:text-5xl">{label}</h3>
        <div className="mt-3 inline-flex items-center gap-2 text-sm text-white/60">
          <Calendar className="h-4 w-4" />
          {date}
        </div>
        <p className="mt-6 text-base leading-relaxed text-white/70">{description}</p>
      </div>
    </div>
  )
}

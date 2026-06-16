import type { Metadata } from 'next'
import Image from 'next/image'
import { Calendar, Globe, MapPin, Video } from 'lucide-react'
import { DebriefRegisterForm } from './_components/register-form'

export const metadata: Metadata = {
  title: 'Kenya Report & Debrief — Live Virtual Event | TPC Ministries',
  description:
    'The delegation is home. Hear what we did, what God did, and what comes next. A live virtual debrief of the Kenya Global Impact Delegation — Saturday, June 27. Register free.',
  openGraph: {
    title: 'Kenya Report & Debrief — Live Virtual Event',
    description:
      'The delegation is home. Hear what we did, what God did, and what comes next. Saturday, June 27 — live on Zoom. Register free.',
    images: ['/images/kenya/debrief-delegation-og.jpg'],
  },
}

const TIMES = [
  { zone: 'Pacific Time', time: '9:00 AM' },
  { zone: 'Eastern Time', time: '12:00 PM' },
  { zone: 'East Africa Time', time: '7:00 PM' },
]

const DELEGATION: { name: string; role?: string; photo?: string }[] = [
  {
    name: 'Lorenzo Daughtry-Chambers',
    role: 'Founder & CEO, IHA',
    photo: '/images/kenya/delegation/lorenzo.jpg',
  },
  {
    name: 'Prophetess Sarah Daughtry-Chambers',
    role: 'Co-Founder, TPC Ministries',
    photo: '/images/kenya/delegation/sarah.jpg',
  },
  {
    name: 'Dr. Michele Y. Griffith',
    role: 'Chief Medical Officer',
    photo: '/images/kenya/delegation/griffith.jpg',
  },
  {
    name: 'Achumboro Ataande, Esq.',
    role: 'Attorney & CXO',
    photo: '/images/kenya/delegation/achumboro.jpg',
  },
  {
    name: 'Evangelist Eileen Jesse',
    role: 'Evangelist & Social Work',
    photo: '/images/kenya/delegation/eileen.jpg',
  },
  {
    name: 'Sharon Daughtry',
    role: 'Exec. Director & Activist',
    photo: '/images/kenya/delegation/sharon.jpg',
  },
  { name: 'Minister Curlean Chaney', photo: '/images/kenya/delegation/chaney.jpg' },
  { name: 'Iris Wells', photo: '/images/kenya/delegation/iris.jpg' },
  { name: 'Shalay Lindsey' },
  { name: 'Prophet Joshua Johnson' },
  { name: 'Prophetess Suzette Patterson', photo: '/images/kenya/delegation/suzette.jpg' },
]

// Initials for the monogram fallback, ignoring honorifics and suffixes.
const HONORIFICS = new Set([
  'dr.', 'dr', 'prophet', 'prophetess', 'minister', 'evangelist', 'rev.', 'rev',
  'pastor', 'apostle', 'bishop', 'mr.', 'mrs.', 'ms.',
])
function initials(name: string): string {
  const parts = name
    .replace(/,.*$/, '')
    .split(/\s+/)
    .filter((w) => w && !HONORIFICS.has(w.toLowerCase()))
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

const FACTS = [
  { icon: Calendar, label: '14 Days' },
  { icon: MapPin, label: '3 Cities' },
  { icon: Globe, label: '4 Service Tracks' },
  { icon: Video, label: 'A Global Coalition' },
]

export default function KenyaDebriefPage() {
  return (
    <div className="bg-navy-950 text-white">
      {/* Hero + registration */}
      <section className="relative isolate overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(212,184,131,0.5) 1px, transparent 0)',
            backgroundSize: '34px 34px',
          }}
        />
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:pt-32">
          {/* Left: details */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
              Global Impact Delegation · Live Virtual Debrief
            </div>

            <h1 className="mt-6 font-serif text-6xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl">
              Kenya
            </h1>
            <p className="mt-2 text-2xl font-semibold uppercase tracking-[0.35em] text-white sm:text-3xl">
              Report &amp; Debrief
            </p>

            <p className="mt-6 max-w-xl font-serif text-xl italic leading-relaxed text-white/80">
              The delegation is home. Hear what we did, what God did &mdash; and what comes next.
            </p>

            <p className="mt-4 text-sm uppercase tracking-[0.15em] text-gold/80">
              Nairobi · Kakamega · Mombasa
            </p>

            {/* Facts */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FACTS.map((f) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.label}
                    className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center backdrop-blur-sm"
                  >
                    <Icon className="h-5 w-5 text-gold" />
                    <span className="text-xs font-semibold text-white/80">{f.label}</span>
                  </div>
                )
              })}
            </div>

            {/* Date + times */}
            <div className="mt-8 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6 backdrop-blur-sm">
              <p className="font-serif text-2xl font-bold text-gold">Saturday · June 27</p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {TIMES.map((t) => (
                  <div key={t.zone} className="text-center">
                    <p className="font-serif text-xl font-bold text-white sm:text-2xl">{t.time}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-white/60">{t.zone}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 border-t border-white/10 pt-4 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
                <Video className="h-4 w-4 text-gold" />
                Live on Zoom
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:pt-10">
            <div className="lg:sticky lg:top-24">
              <h2 className="mb-4 text-center font-serif text-2xl font-bold text-white">
                Reserve your spot
              </h2>
              <DebriefRegisterForm />
            </div>
          </div>
        </div>
      </section>

      {/* From the field: video + photo */}
      <section className="relative border-t border-white/10 bg-navy-950 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              From the field
            </div>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
              <video
                controls
                preload="none"
                poster="/videos/kenya/posters/highlight-video.jpg"
                className="aspect-video h-full w-full bg-black object-cover"
              >
                <source src="/videos/kenya/highlight-video.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
              <Image
                src="/videos/kenya/posters/ministry-moments.jpg"
                alt="Members of the delegation praying with the local community in Kenya"
                width={1280}
                height={720}
                sizes="(max-width: 1024px) 100vw, 576px"
                className="aspect-video h-full w-full object-cover"
              />
            </div>
          </div>
          <p className="mt-5 text-center text-sm uppercase tracking-[0.2em] text-white/50">
            On the ground · Nairobi · Kakamega · Mombasa
          </p>
        </div>
      </section>

      {/* Delegation */}
      <section className="relative border-t border-white/10 bg-navy-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Hear from our delegation
            </div>
            <h2 className="mx-auto mt-5 max-w-2xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
              The people who carried it.
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {DELEGATION.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-4 bg-navy-950 px-5 py-4 transition-colors hover:bg-white/[0.04]"
              >
                {person.photo ? (
                  <Image
                    src={person.photo}
                    alt={person.name}
                    width={96}
                    height={96}
                    className="h-12 w-12 shrink-0 rounded-full object-cover object-center ring-1 ring-gold/40"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-bold tracking-wide text-gold ring-1 ring-gold/30">
                    {initials(person.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-serif text-lg font-bold text-white">{person.name}</p>
                  {person.role && (
                    <p className="truncate text-xs uppercase tracking-[0.12em] text-gold/80">
                      {person.role}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center text-sm uppercase tracking-[0.2em] text-white/50">
            In partnership with the Institute for Human Advancement
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden border-t border-white/10 bg-black py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(212,184,131,0.4) 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
            Be in the room.
          </h2>
          <p className="mt-4 text-white/70">
            Free to attend. Register and we&apos;ll send you the recording, even if you can&apos;t
            make it live.
          </p>
          <div className="mx-auto mt-10 max-w-md text-left">
            <DebriefRegisterForm />
          </div>
          <p className="mt-12 font-serif text-2xl italic text-white/60">
            &ldquo;Go therefore and make disciples of all nations.&rdquo;
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold/70">Matthew 28:19</p>
        </div>
      </section>
    </div>
  )
}

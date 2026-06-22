import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Globe, MapPin, Video } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kenya Report & Debrief — Recap | TPC Ministries',
  description:
    'The Kenya Global Impact Delegation debrief aired Saturday, June 20. The delegation is home — see what we did, what God did, and what comes next.',
  openGraph: {
    title: 'Kenya Report & Debrief — Recap',
    description:
      'The Kenya Global Impact Delegation debrief aired Saturday, June 20. See what we did, what God did, and what comes next.',
    images: ['/images/kenya/debrief-delegation-og.jpg'],
  },
}

const DELEGATION: { name: string; role?: string; photo?: string }[] = [
  {
    name: 'Lorenzo Daughtry-Chambers',
    role: 'Co-Founder, TPC Ministries & IHA',
    photo: '/images/kenya/delegation/lorenzo.jpg',
  },
  {
    name: 'Prophetess Sarah Daughtry-Chambers',
    role: 'Co-Founder, TPC Ministries',
    photo: '/images/kenya/delegation/sarah.jpg',
  },
  {
    name: 'Dr. Michele Y. Griffith',
    role: 'Chief Medical Officer, IHA',
    photo: '/images/kenya/delegation/griffith.jpg',
  },
  {
    name: 'Achumboro Ataande, Esq.',
    role: 'CEO, Uplift Communities & Trip Co-Architect',
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
  { name: 'Minister Curlean Chaney', role: 'Delegate', photo: '/images/kenya/delegation/chaney.jpg' },
  { name: 'Iris Wells', role: 'Delegate', photo: '/images/kenya/delegation/iris.jpg' },
  { name: 'Shalay Lindsey', role: 'Delegate' },
  { name: 'Prophet Joshua Johnson', role: 'Delegate', photo: '/images/kenya/delegation/joshua.jpg' },
  {
    name: 'Prophetess Suzette Patterson',
    role: 'Delegate',
    photo: '/images/kenya/delegation/suzette.jpg',
  },
  { name: 'Chyann Starks', role: 'Delegate', photo: '/images/kenya/delegation/chyann.jpg' },
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
      {/* Hero */}
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

        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-28 text-center sm:px-6 lg:px-8 lg:pt-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
            Global Impact Delegation · The Debrief Has Aired
          </div>

          <h1 className="mt-6 font-serif text-6xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl">
            Kenya
          </h1>
          <p className="mt-2 text-2xl font-semibold uppercase tracking-[0.35em] text-white sm:text-3xl">
            Report &amp; Debrief
          </p>

          <p className="mx-auto mt-6 max-w-xl font-serif text-xl italic leading-relaxed text-white/80">
            The delegation is home. See what we did, what God did &mdash; and what comes next.
          </p>

          <p className="mt-4 text-sm uppercase tracking-[0.15em] text-gold/80">
            Nairobi · Kakamega · Mombasa
          </p>

          {/* Facts */}
          <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
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

          {/* Concluded badge + watch CTA */}
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6 backdrop-blur-sm">
            <p className="font-serif text-xl font-bold text-gold">
              Held Saturday, June 20, 2026
            </p>
            <p className="mt-2 text-sm text-white/70">
              The live debrief has concluded. Watch highlights from the field below.
            </p>
            <a
              href="#from-the-field"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-navy-950 transition hover:bg-gold/90"
            >
              <Video className="h-4 w-4" />
              Watch the highlights
            </a>
          </div>
        </div>
      </section>

      {/* From the field: video + photo */}
      <section
        id="from-the-field"
        className="relative scroll-mt-24 border-t border-white/10 bg-navy-950 py-16"
      >
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
              Our delegation
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
                    <p className="text-xs uppercase leading-snug tracking-[0.12em] text-gold/80">
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

      {/* Closing CTA — what comes next */}
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
            What comes next.
          </h2>
          <p className="mt-4 text-white/70">
            The mission continues beyond Kenya. Stay connected with TPC Ministries and find your
            place in what God is doing next.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/get-involved"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-navy-950 transition hover:bg-gold/90"
            >
              Get involved
            </Link>
            <Link
              href="/kenya-2026"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white/5"
            >
              The full Kenya story
            </Link>
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

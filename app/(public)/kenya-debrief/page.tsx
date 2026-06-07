import type { Metadata } from 'next'
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
    images: ['/videos/kenya/posters/highlight-video.jpg'],
  },
}

const TIMES = [
  { zone: 'Pacific Time', time: '9:00 AM' },
  { zone: 'Eastern Time', time: '12:00 PM' },
  { zone: 'East Africa Time', time: '7:00 PM' },
]

const DELEGATION = [
  { name: 'Dr. Michele Y. Griffith', role: 'Chief Medical Officer' },
  { name: 'Achumboro Ataande, Esq.', role: 'Attorney & CXO' },
  { name: 'Lorenzo Daughtry-Chambers', role: 'Founder & CEO, IHA' },
  { name: 'Prophetess Sarah Daughtry-Chambers', role: 'Co-Founder, TPC Ministries' },
  { name: 'Evangelist Eileen Jesse', role: 'Evangelist & Social Work' },
  { name: 'Sharon Daughtry', role: 'Exec. Director & Activist' },
]

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

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DELEGATION.map((person) => (
              <div
                key={person.name}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-gold/40 hover:bg-white/[0.07]"
              >
                <p className="font-serif text-xl font-bold text-white">{person.name}</p>
                <p className="mt-1 text-sm uppercase tracking-[0.12em] text-gold/80">
                  {person.role}
                </p>
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

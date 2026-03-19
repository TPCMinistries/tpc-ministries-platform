import type { Metadata } from 'next'
import Link from 'next/link'
import { KenyaTeamForm } from '@/components/kenya/kenya-team-form'
import { Users, MapPin, Calendar, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kenya Team Registration | Kenya 2026 Kingdom Impact Trip',
  description: 'Join the Kenya-based team for the Kingdom Impact Trip 2026. Register as an administrator, partner organization, or local attendee.',
}

export default function KenyaTeamSignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <section className="relative flex min-h-[40vh] items-center overflow-hidden bg-green-950">
        <div className="absolute inset-0 bg-gradient-to-b from-green-950 via-green-900 to-green-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-4xl px-4 py-32">
          <Link
            href="/kenya"
            className="mb-6 inline-flex items-center gap-1 text-body-sm text-gold transition-colors hover:text-gold-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kenya Trip Info
          </Link>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20">
              <Users className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-display-lg text-white md:text-display-xl">Kenya Team Registration</h1>
              <p className="text-body-lg text-white/50">Kingdom Impact Trip 2026</p>
            </div>
          </div>

          {/* Trip quick facts */}
          <div className="mt-6 flex flex-wrap gap-4 text-body-sm">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Calendar className="h-4 w-4 text-gold" />
              <span className="text-white/80">April 22 – May 7, 2026</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <MapPin className="h-4 w-4 text-gold" />
              <span className="text-white/80">Nairobi, Kakamega &amp; Mombasa</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Introduction */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 rounded-2xl border border-green-700/20 bg-green-50/50 p-6 md:p-8">
          <h2 className="mb-3 font-display text-display-xs text-foreground">Karibu! Join the Kenya Team</h2>
          <p className="mb-4 text-body-md leading-relaxed text-muted-foreground">
            We&apos;re looking for administrators, partner organizations, and local attendees to join
            the Kenya-based team for the Kingdom Impact Trip 2026. Whether you&apos;re helping coordinate
            logistics, representing a church or organization, or simply want to attend &mdash; we&apos;d
            love to have you.
          </p>
          <p className="text-body-sm text-muted-foreground">
            All information is kept confidential and used solely for trip coordination. Fields marked with <span className="font-semibold text-green-700">*</span> are required.
          </p>
        </div>

        {/* Form */}
        <KenyaTeamForm />

        {/* Footer info */}
        <div className="mt-8 pb-12 text-center text-body-sm text-muted-foreground">
          <p>
            Questions about the form? Contact us at{' '}
            <a href="mailto:info@tpcmin.org" className="font-medium text-green-700 hover:underline">
              info@tpcmin.org
            </a>
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} TPC Ministries. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

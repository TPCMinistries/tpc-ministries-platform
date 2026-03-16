import type { Metadata } from 'next'
import Link from 'next/link'
import { TravelForm } from '@/components/kenya/travel-form'
import { Plane, MapPin, Calendar, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Travel Information Form | Kenya 2026 Kingdom Impact Trip',
  description: 'Complete your travel details for the Kenya 2026 Kingdom Impact Trip. April 22 – May 7, 2026.',
}

export default function KenyaTravelFormPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <section className="relative flex min-h-[40vh] items-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
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
              <Plane className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-display-lg text-white md:text-display-xl">Travel Information Form</h1>
              <p className="text-body-lg text-white/50">Kenya Kingdom Impact Trip 2026</p>
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
        <div className="mb-8 rounded-2xl border border-gold/20 bg-gold/5 p-6 md:p-8">
          <h2 className="mb-3 font-display text-display-xs text-foreground">Welcome, Kingdom Delegate!</h2>
          <p className="mb-4 text-body-md leading-relaxed text-muted-foreground">
            Thank you for your commitment to the Kenya Kingdom Impact Trip 2026. Please complete the travel information below so our team can coordinate your flight, accommodations, and logistics.
          </p>
          <p className="text-body-sm text-muted-foreground">
            All information is kept confidential and used solely for trip coordination purposes. Fields marked with <span className="font-semibold text-gold-600">*</span> are required.
          </p>
        </div>

        {/* Form */}
        <TravelForm />

        {/* Footer info */}
        <div className="mt-8 pb-12 text-center text-body-sm text-muted-foreground">
          <p>
            Questions about the form? Contact us at{' '}
            <a href="mailto:info@tpcmin.org" className="font-medium text-gold-600 hover:underline">
              info@tpcmin.org
            </a>
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} TPC Ministries. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

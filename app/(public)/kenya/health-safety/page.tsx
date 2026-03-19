import type { Metadata } from 'next'
import Link from 'next/link'
import { HealthSafetyForm } from '@/components/kenya/health-safety-form'
import { Heart, MapPin, Calendar, ArrowLeft, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Health & Safety Form | Kenya 2026 Kingdom Impact Trip',
  description: 'Complete your health, safety, and emergency contact details for the Kenya 2026 Kingdom Impact Trip.',
}

export default function KenyaHealthSafetyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <section className="relative flex min-h-[40vh] items-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-4xl px-4 py-32">
          <Link
            href="/kenya"
            className="mb-6 inline-flex items-center gap-1 text-body-sm text-green-400 transition-colors hover:text-green-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kenya Trip Info
          </Link>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
              <Heart className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h1 className="font-display text-display-lg text-white md:text-display-xl">Health & Safety Form</h1>
              <p className="text-body-lg text-white/50">Kenya Kingdom Impact Trip 2026</p>
            </div>
          </div>

          {/* Trip quick facts */}
          <div className="mt-6 flex flex-wrap gap-4 text-body-sm">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Calendar className="h-4 w-4 text-green-400" />
              <span className="text-white/80">April 22 – May 7, 2026</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <MapPin className="h-4 w-4 text-green-400" />
              <span className="text-white/80">Nairobi, Kakamega &amp; Mombasa</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-white/80">Step 2 of 2</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Form */}
      <section className="container mx-auto max-w-3xl px-4 -mt-16 relative z-10 pb-20">
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">
            <strong>Step 2:</strong> You&apos;ve already submitted your travel details — thank you! Now we need your health, safety, and emergency contact information. This is critical for your safety during the trip.
          </p>
        </div>
        <HealthSafetyForm />
      </section>
    </div>
  )
}

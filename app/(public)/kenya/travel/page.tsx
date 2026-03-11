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
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <Link
            href="/kenya"
            className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kenya Trip Info
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Plane className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Travel Information Form</h1>
              <p className="text-stone-300 text-lg">Kenya Kingdom Impact Trip 2026</p>
            </div>
          </div>

          {/* Trip quick facts */}
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>April 22 – May 7, 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>Nairobi, Kakamega &amp; Mombasa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-stone-900 mb-3">Welcome, Kingdom Delegate!</h2>
          <p className="text-stone-700 leading-relaxed mb-4">
            Thank you for your commitment to the Kenya Kingdom Impact Trip 2026. Please complete the travel information below so our team can coordinate your flight, accommodations, and logistics.
          </p>
          <p className="text-stone-600 text-sm">
            All information is kept confidential and used solely for trip coordination purposes. Fields marked with <span className="text-amber-600 font-semibold">*</span> are required.
          </p>
        </div>

        {/* Form */}
        <TravelForm />

        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-stone-500 pb-12">
          <p>
            Questions about the form? Contact us at{' '}
            <a href="mailto:info@tpcmin.org" className="text-amber-600 hover:underline font-medium">
              info@tpcmin.org
            </a>
          </p>
          <p className="mt-2">&copy; {new Date().getFullYear()} TPC Ministries. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

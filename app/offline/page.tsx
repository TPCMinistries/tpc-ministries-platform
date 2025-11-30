'use client'

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6">
            <WifiOff className="h-12 w-12 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">You're Offline</h1>
          <p className="text-white/70">
            It looks like you've lost your internet connection. Don't worry, your spiritual journey continues!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">While you're offline, you can:</h2>
          <ul className="text-left text-white/80 space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-gold">•</span>
              <span>Read previously loaded devotionals</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold">•</span>
              <span>View your saved prayer requests</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold">•</span>
              <span>Journal your thoughts (they'll sync when you're back online)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold">•</span>
              <span>Review your reading plan progress</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gold hover:bg-gold/90 text-navy font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>

          <Link
            href="/dashboard"
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="h-5 w-5" />
            Go to Dashboard
          </Link>
        </div>

        <p className="text-white/50 text-sm mt-8">
          TPC Ministries • Your faith journey, online or offline
        </p>
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="h-24 w-24 text-red-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-red-900 mb-4">Something went wrong!</h1>
          <p className="text-lg text-red-700 mb-4">
            We encountered an unexpected error. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-sm text-red-600 font-mono bg-red-200 p-3 rounded">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={reset} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Link href="/">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-red-700 mb-4">Need immediate assistance?</p>
          <a
            href="mailto:support@tpcministries.com"
            className="text-red-900 hover:text-red-700 underline font-semibold"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

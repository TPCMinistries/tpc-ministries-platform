'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'

interface ErrorDisplayProps {
  error: Error & { digest?: string }
  reset: () => void
  variant?: 'default' | 'admin' | 'member'
  homeUrl?: string
  backUrl?: string
  showContact?: boolean
}

const variantStyles = {
  default: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    icon: 'text-red-600',
    title: 'text-red-900',
    text: 'text-red-700',
    digest: 'bg-red-200 text-red-600',
  },
  admin: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
    icon: 'text-gray-600',
    title: 'text-gray-900',
    text: 'text-gray-700',
    digest: 'bg-gray-200 text-gray-600',
  },
  member: {
    bg: 'bg-gradient-to-br from-navy/5 to-gold/5',
    icon: 'text-navy',
    title: 'text-navy',
    text: 'text-gray-700',
    digest: 'bg-navy/10 text-navy',
  },
}

export default function ErrorDisplay({
  error,
  reset,
  variant = 'default',
  homeUrl = '/',
  backUrl,
  showContact = true,
}: ErrorDisplayProps) {
  const styles = variantStyles[variant]

  useEffect(() => {
    // Log error to console (could be sent to error reporting service)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className={`min-h-[60vh] flex items-center justify-center ${styles.bg} px-4 py-12`}>
      <div className="max-w-lg w-full text-center" role="alert">
        <div className="mb-8">
          <AlertTriangle className={`h-16 w-16 ${styles.icon} mx-auto mb-4`} aria-hidden="true" />
          <h1 className={`text-3xl font-bold ${styles.title} mb-3`}>
            Something went wrong
          </h1>
          <p className={`text-base ${styles.text} mb-4`}>
            We encountered an unexpected error. Please try again.
          </p>
          {error.digest && (
            <p className={`text-xs font-mono ${styles.digest} p-2 rounded inline-block`}>
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>

          {backUrl ? (
            <Link href={backUrl}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Go Back
              </Button>
            </Link>
          ) : (
            <Link href={homeUrl}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                Go Home
              </Button>
            </Link>
          )}
        </div>

        {showContact && (
          <div className="mt-8">
            <a
              href="mailto:support@tpcministries.org"
              className={`inline-flex items-center gap-2 ${styles.text} hover:underline text-sm`}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Contact Support
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

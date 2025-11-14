'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy to-blue-900 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-xl text-blue-100 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto text-white border-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        <div className="mt-12 text-blue-200">
          <p className="mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/teachings" className="text-blue-100 hover:text-white underline">
              Teachings
            </Link>
            <Link href="/assessments" className="text-blue-100 hover:text-white underline">
              Assessments
            </Link>
            <Link href="/missions" className="text-blue-100 hover:text-white underline">
              Missions
            </Link>
            <Link href="/partner" className="text-blue-100 hover:text-white underline">
              Become a Partner
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

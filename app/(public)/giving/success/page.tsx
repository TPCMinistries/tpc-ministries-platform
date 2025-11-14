'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

function GivingSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // You could fetch session details here if needed
    setLoading(false)
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-navy">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-navy">Thank You for Your Generosity!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-gray-700">
            Your donation has been received successfully. You should receive a receipt via email shortly.
          </p>

          <div className="rounded-lg bg-gold/10 p-4">
            <p className="text-sm text-gray-700">
              Your generosity enables us to spread the Gospel, transform lives, and impact communities around the world.
            </p>
          </div>

          <p className="text-sm text-gray-600">
            "Give, and it will be given to you... For with the measure you use, it will be measured to you." - Luke 6:38
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/member/dashboard" className="w-full">
              <Button className="w-full bg-navy hover:bg-navy/90">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function GivingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <GivingSuccessContent />
    </Suspense>
  )
}

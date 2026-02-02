'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Heart, Sparkles, Share2, ArrowRight } from 'lucide-react'

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Small delay for visual effect
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 text-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6" />
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>

              <h1 className="text-3xl font-bold text-navy mb-2">Thank You!</h1>
              <p className="text-xl text-gray-600 mb-6">Your donation has been received.</p>

              <div className="bg-gold/10 rounded-lg p-4 mb-6">
                <Heart className="h-8 w-8 text-gold mx-auto mb-2" />
                <p className="text-gray-700">
                  Your generosity is helping make the Kenya Kingdom Impact Trip possible.
                  You're part of something life-changing!
                </p>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                A confirmation email has been sent to your email address.
                Your donation is tax-deductible as TPC Ministries is a 501(c)(3) nonprofit organization.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Visit TPC Ministries
                  </Button>
                </Link>
                <Link href="/kenya">
                  <Button className="w-full sm:w-auto bg-navy hover:bg-navy/90">
                    Learn About Kenya Trip
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-3">Share the mission:</p>
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://tpcmin.org/kenya')}`,
                        '_blank'
                      )
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent('I just donated to support the Kenya Kingdom Impact Trip 2025! Join me in making a difference.')}&url=${encodeURIComponent('https://tpcmin.org/kenya')}`,
                        '_blank'
                      )
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Twitter
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

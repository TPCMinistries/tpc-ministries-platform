'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'creating' | 'error' | 'success'>('checking')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const setupMemberAccount = async () => {
      try {
        setStatus('creating')

        // Call API to create member record
        const response = await fetch('/api/onboarding/setup-member', {
          method: 'POST',
          credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
          const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to set up account')
          throw new Error(errorMsg)
        }

        // Determine redirect path based on admin status and new member status
        let redirectPath = '/dashboard'
        if (data.is_admin) {
          redirectPath = '/admin-dashboard'
        } else if (data.is_new_member) {
          redirectPath = '/welcome'
        }

        // Always use window.location for hard redirect to ensure it works
        // This bypasses any client-side routing issues
        window.location.href = redirectPath
        
      } catch (err: any) {
        console.error('Onboarding error:', err)
        setStatus('error')
        setError(err.message || 'Failed to set up your account. Please try again.')
      }
    }

    setupMemberAccount()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-tpc-navy via-tpc-navy/95 to-tpc-navy/90 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Setting Up Your Account</CardTitle>
          <CardDescription className="text-center">
            Please wait while we prepare your TPC Ministries account...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'checking' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-navy" />
              <p className="text-gray-600">Checking your account...</p>
            </div>
          )}

          {status === 'creating' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-navy" />
              <p className="text-gray-600">Creating your member profile...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-medium">Account setup complete!</p>
              <p className="text-gray-600 text-sm">Redirecting you to your dashboard...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">Setup Error</p>
              <p className="text-gray-600 text-sm text-center">{error}</p>
              <div className="flex gap-2">
                <Button onClick={() => window.location.href = '/auth/login'} variant="outline">
                  Back to Login
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

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
        })

        const data = await response.json()

        if (!response.ok) {
          const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to set up account')
          throw new Error(errorMsg)
        }

        // If member already existed, redirect immediately without showing success state
        if (data.message === 'Member record already exists' || data.is_admin !== undefined) {
          // Use window.location for a hard redirect to avoid any client-side navigation issues
          if (data.is_admin) {
            window.location.href = '/admin-dashboard'
          } else {
            window.location.href = '/dashboard'
          }
          return
        }

        setStatus('success')

        // Redirect to appropriate dashboard immediately using window.location for hard redirect
        setTimeout(() => {
          if (data.is_admin) {
            window.location.href = '/admin-dashboard'
          } else {
            window.location.href = '/dashboard'
          }
        }, 500) // Small delay to show success message
      } catch (err: any) {
        setStatus('error')
        setError(err.message)
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
              <Button onClick={() => router.push('/auth/login')} variant="outline">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

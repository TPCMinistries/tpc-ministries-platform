'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MemberDashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Immediately redirect to the correct dashboard path
    // This catches any direct navigation to /member/dashboard
    window.location.replace('/dashboard')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  )
}


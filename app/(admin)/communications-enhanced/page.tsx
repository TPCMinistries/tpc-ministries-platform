'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CommunicationsEnhancedRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the consolidated Campaigns page with Templates tab
    router.replace('/email-campaigns?tab=templates')
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Redirecting to Campaigns...</p>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CommunicationsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the consolidated Campaigns page with Quick Send tab
    router.replace('/email-campaigns?tab=quicksend')
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Redirecting to Campaigns...</p>
    </div>
  )
}

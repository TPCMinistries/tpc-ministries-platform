'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InboxRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new unified Communications page
    router.replace('/communications')
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Redirecting to Communications...</p>
    </div>
  )
}

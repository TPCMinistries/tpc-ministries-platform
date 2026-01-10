'use client'

import ErrorDisplay from '@/components/error/error-display'

export default function MemberError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      error={error}
      reset={reset}
      variant="member"
      homeUrl="/dashboard"
      backUrl="/dashboard"
    />
  )
}

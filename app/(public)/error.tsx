'use client'

import ErrorDisplay from '@/components/error/error-display'

export default function PublicError({
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
      variant="default"
      homeUrl="/"
    />
  )
}

'use client'

/**
 * Skip Link Component
 * Allows keyboard users to skip navigation and jump directly to main content.
 * Visually hidden until focused.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}

/**
 * Screen Reader Only Announcer
 * Used for announcing dynamic content changes to screen readers.
 */
export function LiveAnnouncer({
  message,
  politeness = 'polite'
}: {
  message: string
  politeness?: 'polite' | 'assertive'
}) {
  if (!message) return null

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

/**
 * Visually Hidden Component
 * Content is hidden visually but accessible to screen readers.
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

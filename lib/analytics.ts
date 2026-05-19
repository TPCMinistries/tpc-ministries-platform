// Lightweight client-side event tracker.
// Sends to whatever analytics provider is on `window` (Google Analytics via gtag).
// No-ops on the server and when no provider is configured.

type EventName =
  | 'page_view'
  | 'ai_chat_open'
  | 'ai_chat_message'
  | 'ai_chat_limit_reached'
  | 'ai_chat_handoff_signup'
  | 'signup_start'
  | 'signup_complete'
  | 'give_click'
  | 'apply_click'
  | 'kenya_recap_view'
  | 'gallery_open'
  | 'devotional_click'

type EventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: EventParams) => void
    dataLayer?: unknown[]
  }
}

/**
 * Send an event to the configured analytics provider.
 * Safe to call from anywhere — no-ops on server and when no provider exists.
 */
export function track(name: EventName, params?: EventParams): void {
  if (typeof window === 'undefined') return
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params)
      return
    }
    // Fallback: push to dataLayer if it exists (GTM pattern)
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...params })
    }
  } catch {
    // Analytics is best-effort, never throw.
  }
}

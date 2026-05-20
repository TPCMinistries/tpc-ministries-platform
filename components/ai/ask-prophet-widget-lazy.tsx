'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Lazy-load the real widget (which pulls in framer-motion + chat state) only
// after the browser is idle. Keeps it out of the initial bundle and off the
// critical render path so LCP/INP don't pay for it on first paint.
const AskProphetWidget = dynamic(
  () => import('./ask-prophet-widget').then((m) => m.AskProphetWidget),
  { ssr: false, loading: () => null },
)

export function AskProphetWidgetLazy() {
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    const idle = (cb: () => void) => {
      if (typeof (window as any).requestIdleCallback === 'function') {
        ;(window as any).requestIdleCallback(cb, { timeout: 2500 })
      } else {
        setTimeout(cb, 1500)
      }
    }
    idle(() => setShouldMount(true))
  }, [])

  if (!shouldMount) return null
  return <AskProphetWidget />
}

'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const CommandMenu = dynamic(
  () => import('./command-menu').then((m) => ({ default: m.CommandMenu })),
  { ssr: false, loading: () => null },
)

export function CommandMenuLazy() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const idle = (cb: () => void) => {
      if (typeof (window as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback === 'function') {
        ;(window as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback(cb, { timeout: 2500 })
      } else {
        setTimeout(cb, 1500)
      }
    }
    idle(() => setMounted(true))
  }, [])

  if (!mounted) return null
  return <CommandMenu />
}

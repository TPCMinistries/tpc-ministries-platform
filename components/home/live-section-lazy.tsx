'use client'

import dynamic from 'next/dynamic'
import { LazyMount } from './lazy-mount'

const LiveSection = dynamic(
  () => import('./live-section').then((m) => ({ default: m.LiveSection })),
  { ssr: false, loading: () => null },
)

export function LiveSectionLazy() {
  return (
    <LazyMount minHeight="500px">
      <LiveSection />
    </LazyMount>
  )
}

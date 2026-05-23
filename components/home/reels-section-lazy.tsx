'use client'

import dynamic from 'next/dynamic'
import { LazyMount } from './lazy-mount'

const ReelsSection = dynamic(
  () => import('./reels-section').then((m) => ({ default: m.ReelsSection })),
  { ssr: false, loading: () => null },
)

export function ReelsSectionLazy() {
  return (
    <LazyMount minHeight="600px">
      <ReelsSection />
    </LazyMount>
  )
}

'use client'

import dynamic from 'next/dynamic'
import { LazyMount } from './lazy-mount'

const KenyaCinemaSection = dynamic(
  () => import('./kenya-cinema-section').then((m) => ({ default: m.KenyaCinemaSection })),
  { ssr: false, loading: () => null },
)

export function KenyaCinemaSectionLazy() {
  return (
    <LazyMount minHeight="700px">
      <KenyaCinemaSection />
    </LazyMount>
  )
}

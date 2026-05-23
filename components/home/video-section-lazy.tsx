'use client'

import dynamic from 'next/dynamic'
import { LazyMount } from './lazy-mount'

const VideoSection = dynamic(
  () => import('./video-section').then((m) => ({ default: m.VideoSection })),
  { ssr: false, loading: () => null },
)

export function VideoSectionLazy() {
  return (
    <LazyMount minHeight="500px">
      <VideoSection />
    </LazyMount>
  )
}

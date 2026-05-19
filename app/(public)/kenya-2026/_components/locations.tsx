'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { MapPin, Volume2, VolumeX } from 'lucide-react'
import { Section } from '@/components/ui/section'

type Location = {
  id: string
  name: string
  src: string
  poster: string
  aspect: 'video' | 'portrait'
}

const LOCATIONS: Location[] = [
  {
    id: 'homabay',
    name: 'Homa Bay',
    src: '/videos/kenya/homabay.mp4',
    poster: '/videos/kenya/posters/homabay.jpg',
    aspect: 'video',
  },
  {
    id: 'sda-church-dago',
    name: 'SDA Church · Dago',
    src: '/videos/kenya/sda-church-dago.mp4',
    poster: '/videos/kenya/posters/sda-church-dago.jpg',
    aspect: 'video',
  },
]

function LocationCard({ loc, index }: { loc: Location; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { amount: 0.4 })
  const shouldReduceMotion = useReducedMotion()
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v || shouldReduceMotion) return
    if (inView) v.play().catch(() => {})
    else v.pause()
  }, [inView, shouldReduceMotion])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl bg-navy-900 ring-1 ring-white/10 transition-all hover:ring-gold/40"
    >
      <div
        className={`relative overflow-hidden bg-black ${
          loc.aspect === 'portrait' ? 'aspect-[9/16] sm:aspect-[3/4]' : 'aspect-video'
        }`}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={loc.src}
          poster={loc.poster}
          muted={muted}
          loop
          playsInline
          preload="metadata"
        />
        <button
          onClick={() => {
            const v = videoRef.current
            if (!v) return
            v.muted = !v.muted
            setMuted(v.muted)
          }}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gold/80">
          <MapPin className="h-3 w-3" />
          Kenya 2026
        </div>
        <h3 className="mt-2 font-serif text-2xl font-bold text-white">
          {loc.name}
        </h3>
      </div>
    </motion.div>
  )
}

export function KenyaLocations() {
  return (
    <Section size="lg" className="bg-gradient-to-b from-navy-950 to-navy-900">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
          Places we went
        </div>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Where the work happened.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Specific places. Specific people. Footage from each stop.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {LOCATIONS.map((loc, i) => (
          <LocationCard key={loc.id} loc={loc} index={i} />
        ))}
      </div>
    </Section>
  )
}

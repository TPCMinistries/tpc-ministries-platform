'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Section } from '@/components/ui/section'

type Reel = {
  id: string
  src: string
  poster: string
  title: string
  tag: string
}

const REELS: Reel[] = [
  { id: 'reel-033',    src: '/videos/kenya/reel-033.mp4',    poster: '/videos/kenya/posters/reel-033.jpg',    title: 'Reel · 03', tag: 'KENYA 2026' },
  { id: 'video-03',    src: '/videos/kenya/video-03.mp4',    poster: '/videos/kenya/posters/video-03.jpg',    title: 'Reel · 04', tag: 'KENYA 2026' },
  { id: 'timeline-2',  src: '/videos/kenya/timeline-2.mp4',  poster: '/videos/kenya/posters/timeline-2.jpg',  title: 'Timeline cut', tag: 'KENYA 2026' },
  { id: 'reel-01',     src: '/videos/kenya/reel-01.mp4',     poster: '/videos/kenya/posters/reel-01.jpg',     title: 'Reel · 01', tag: 'KENYA 2026' },
  { id: 'reel-02',     src: '/videos/kenya/reel-02.mp4',     poster: '/videos/kenya/posters/reel-02.jpg',     title: 'Reel · 02', tag: 'KENYA 2026' },
  { id: 'vertical-03', src: '/videos/kenya/vertical-03.mp4', poster: '/videos/kenya/posters/vertical-03.jpg', title: 'B-roll', tag: 'KENYA 2026' },
]

function ReelCard({ reel }: { reel: Reel }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  function toggle() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="group relative w-[78vw] flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 transition hover:ring-gold/40 sm:w-[44vw] md:w-auto md:flex-shrink">
      <div className="relative aspect-[9/16] overflow-hidden">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={reel.src}
          poster={reel.poster}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onClick={toggle}
          onMouseEnter={(e) => {
            const v = e.currentTarget
            v.play().then(() => setPlaying(true)).catch(() => {})
          }}
          onMouseLeave={(e) => {
            const v = e.currentTarget
            v.pause()
            setPlaying(false)
          }}
        />
        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Tag */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gold backdrop-blur-sm">
          {reel.tag}
        </div>

        {/* Sound toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            const v = videoRef.current
            if (!v) return
            v.muted = !v.muted
            setMuted(v.muted)
          }}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        {/* Play overlay */}
        <button
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            playing ? 'opacity-0 hover:opacity-100' : 'opacity-100'
          }`}
        >
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold text-navy-950 shadow-2xl ring-4 ring-gold/30 transition-transform group-hover:scale-110">
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-6 w-6 translate-x-0.5" />}
          </div>
        </button>

        {/* Title */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h4 className="font-serif text-base font-bold leading-tight text-white sm:text-lg">
            {reel.title}
          </h4>
        </div>
      </div>
    </div>
  )
}

export function KenyaVerticalReels() {
  return (
    <Section size="lg" className="bg-navy-900">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
          From the field
        </div>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Reels from Kenya.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Vertical shorts from the trip. Tap to play.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-6"
      >
        {REELS.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </motion.div>
    </Section>
  )
}

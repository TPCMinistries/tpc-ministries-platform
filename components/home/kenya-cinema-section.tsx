'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

const FEATURED = {
  src: '/videos/kenya/highlight-video.mp4',
  poster: '/videos/kenya/posters/highlight-video.jpg',
  title: 'Kenya 2026 — the highlight reel',
  subtitle: 'Fourteen days on the ground.',
}

const TEASERS = [
  {
    id: 'homabay',
    src: '/videos/kenya/homabay.mp4',
    poster: '/videos/kenya/posters/homabay.jpg',
    title: 'Homa Bay',
    blurb: '',
  },
  {
    id: 'sda-church-dago',
    src: '/videos/kenya/sda-church-dago.mp4',
    poster: '/videos/kenya/posters/sda-church-dago.jpg',
    title: 'SDA Church · Dago',
    blurb: '',
  },
]

function FeaturedFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { amount: 0.5 })
  const shouldReduceMotion = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [userPaused, setUserPaused] = useState(false)

  // Auto-play (muted) when scrolled into view, pause when out
  useEffect(() => {
    const v = videoRef.current
    if (!v || shouldReduceMotion || userPaused) return
    if (inView) {
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      v.pause()
      setPlaying(false)
    }
  }, [inView, shouldReduceMotion, userPaused])

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {})
      setUserPaused(false)
    } else {
      v.pause()
      setPlaying(false)
      setUserPaused(true)
    }
  }

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-navy-950 shadow-2xl shadow-navy-950/40"
    >
      <video
        ref={videoRef}
        src={FEATURED.src}
        poster={FEATURED.poster}
        muted={muted}
        playsInline
        loop
        preload="metadata"
        className="aspect-video w-full object-cover"
        onClick={togglePlay}
      />

      {/* Bottom gradient + caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-navy-950 via-navy-950/70 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 sm:p-7">
        <p className="text-body-xs font-semibold uppercase tracking-[0.18em] text-gold-300/80">
          Featured film
        </p>
        <h3 className="font-display text-display-xs text-white sm:text-display-sm">
          {FEATURED.title}
        </h3>
        <p className="text-body-sm text-white/65">{FEATURED.subtitle}</p>
      </div>

      {/* Controls */}
      <div className="absolute right-3 top-3 flex gap-2 sm:right-4 sm:top-4">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause film' : 'Play film'}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-950/70 text-white backdrop-blur-sm transition-colors hover:bg-navy-900"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" />}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-950/70 text-white backdrop-blur-sm transition-colors hover:bg-navy-900"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Center play hint, only when paused & not yet playing */}
      {!playing && (
        <motion.button
          type="button"
          onClick={togglePlay}
          aria-label="Play film"
          initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold text-navy-950 shadow-2xl transition-transform hover:scale-105">
            <Play className="ml-1 h-9 w-9" fill="currentColor" />
          </span>
        </motion.button>
      )}
    </div>
  )
}

function TeaserCard({ teaser }: { teaser: (typeof TEASERS)[number] }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  function handleEnter() {
    videoRef.current?.play().catch(() => {})
  }
  function handleLeave() {
    const v = videoRef.current
    if (!v) return
    v.pause()
    v.currentTime = 0
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-navy-950 shadow-lg transition-all hover:border-gold/40 hover:shadow-xl"
    >
      <video
        ref={videoRef}
        src={teaser.src}
        poster={teaser.poster}
        muted={muted}
        playsInline
        loop
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent" />

      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-navy-950/70 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
      >
        {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
        <div>
          <p className="flex items-center gap-1.5 text-body-xs font-semibold uppercase tracking-[0.18em] text-gold-300/90">
            <MapPin className="h-3 w-3" />
            {teaser.title}
          </p>
          <p className="mt-1 text-body-sm font-medium text-white">{teaser.blurb}</p>
        </div>
      </div>
    </div>
  )
}

export function KenyaCinemaSection() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-b from-background via-navy-950 to-navy-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.15),transparent_60%)]" />

      <div className="relative">
        <ScrollReveal className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="text-body-xs font-semibold uppercase tracking-[0.18em] text-gold-200">
              Kenya 2026
            </span>
          </div>
          <h2 className="font-display text-display-md md:text-display-lg text-white">
            See what God is doing.
          </h2>
          <p className="mt-3 text-body-lg text-white/55">
            We brought cameras with us. The Spirit brought everything else.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <FeaturedFilm />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {TEASERS.map((t) => (
              <TeaserCard key={t.id} teaser={t} />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
            <Link href="/kenya-2026">
              <Button size="lg" className="h-12 bg-gold px-6 font-bold text-navy-950 hover:bg-gold-300">
                See the full story
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/kenya/give">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-2 border-white/20 bg-white/5 px-6 text-white hover:border-gold/60 hover:bg-gold/10"
              >
                Support the mission
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </Section>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { Section } from '@/components/ui/section'

export function KenyaMasterReel() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { amount: 0.5 })
  const shouldReduceMotion = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [userPaused, setUserPaused] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v || shouldReduceMotion || userPaused) return
    if (inView) {
      v.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
    } else {
      v.pause()
      setPlaying(false)
    }
  }, [inView, shouldReduceMotion, userPaused])

  function toggle() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
      setUserPaused(false)
    } else {
      v.pause()
      setPlaying(false)
      setUserPaused(true)
    }
  }

  function toggleSound() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <Section size="lg" className="bg-navy-950">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">
          <Sparkles className="h-3 w-3" />
          The highlight reel
        </div>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          The trip, in eighty seconds.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          Tap the screen to hear it. Sound makes it.
        </p>
      </div>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="group relative mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 sm:rounded-3xl"
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/videos/kenya/highlight-video.mp4"
          poster="/videos/kenya/posters/highlight-video.jpg"
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onClick={toggle}
        />

        {/* Controls */}
        <button
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/70 group-hover:opacity-100 focus-visible:opacity-100"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
        </button>

        <button
          onClick={toggleSound}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/70"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? 'Tap for sound' : 'Sound on'}
        </button>
      </motion.div>
    </Section>
  )
}

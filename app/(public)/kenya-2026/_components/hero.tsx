'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Heart, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function KenyaStoryHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const v = videoRef.current
    if (!v || shouldReduceMotion) return
    v.play().catch(() => {})
  }, [shouldReduceMotion])

  return (
    <section className="relative isolate flex min-h-[92vh] w-full items-end overflow-hidden bg-navy-950">
      {/* Background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/kenya/highlight-video.mp4"
        poster="/videos/kenya/posters/highlight-video.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/40 to-navy-950" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/30 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            Kenya 2026 · April 23 – May 6
          </div>

          <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            What God did<br />
            <span className="text-gold">in Kenya.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            Fourteen days on the ground in Kenya. This is the footage.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="#journey">
              <Button
                size="lg"
                className="h-12 w-full bg-gold px-6 font-bold text-navy-950 hover:bg-gold-300 sm:w-auto"
              >
                Watch the journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/kenya/give">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full border-2 border-white/30 bg-white/5 px-6 font-semibold text-white backdrop-blur-sm hover:border-gold/60 hover:bg-gold/10 sm:w-auto"
              >
                <Heart className="mr-2 h-4 w-4" />
                Support the work
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.button
          aria-label="Scroll to journey"
          onClick={() => {
            const el = document.getElementById('journey')
            el?.scrollIntoView({ behavior: 'smooth' })
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-gold md:inline-flex"
        >
          Scroll
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </motion.button>
      </div>
    </section>
  )
}

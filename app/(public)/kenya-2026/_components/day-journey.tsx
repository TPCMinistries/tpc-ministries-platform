'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { Section } from '@/components/ui/section'

type Day = {
  day: number
  date?: string
  src: string
  poster: string
}

// Trip dates: April 23 – May 6, 2026 → Day 11 = May 3, Day 14 = May 6.
// Themes/blurbs intentionally omitted until verified against real trip notes.
const DAYS: Day[] = [
  { day: 11, date: 'May 3, 2026', src: '/videos/kenya/day-11.mp4', poster: '/videos/kenya/posters/day-11.jpg' },
  { day: 12, date: 'May 4, 2026', src: '/videos/kenya/day-12.mp4', poster: '/videos/kenya/posters/day-12.jpg' },
  { day: 13, date: 'May 5, 2026', src: '/videos/kenya/day-13.mp4', poster: '/videos/kenya/posters/day-13.jpg' },
  { day: 14, date: 'May 6, 2026', src: '/videos/kenya/day-14.mp4', poster: '/videos/kenya/posters/day-14.jpg' },
]

function DayCard({ day, index }: { day: Day; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { amount: 0.5 })
  const shouldReduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v || shouldReduceMotion) return
    if (inView || hovered) {
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [inView, hovered, shouldReduceMotion])

  const reverse = index % 2 === 1

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.05 }}
      className={`grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16 ${
        reverse ? 'md:[&>*:first-child]:order-2' : ''
      }`}
    >
      {/* Video */}
      <div
        className="group relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 transition-all duration-300 hover:ring-gold/40"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={day.src}
          poster={day.poster}
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gold/80">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-gold">
            Day {day.day}
          </span>
          {day.date && (
            <span className="inline-flex items-center gap-1 text-white/50">
              <Calendar className="h-3 w-3" />
              {day.date}
            </span>
          )}
        </div>
        <h3 className="mt-4 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
          Day {day.day} in Kenya
        </h3>
        <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
          Footage from the field. Press play, or hover and let it play in place.
        </p>
      </div>
    </motion.div>
  )
}

export function KenyaDayJourney() {
  return (
    <Section size="lg" className="bg-navy-950" id="journey">
      <div className="mb-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
          The journey
        </div>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Day by day.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          The closing days of the mission, in our own footage.
        </p>
      </div>

      <div className="space-y-20 lg:space-y-28">
        {DAYS.map((day, i) => (
          <DayCard key={day.day} day={day} index={i} />
        ))}
      </div>
    </Section>
  )
}

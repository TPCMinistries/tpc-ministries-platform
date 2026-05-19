'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import Image from 'next/image'
import { Section } from '@/components/ui/section'

type Day = {
  day: number
  date: string
  caption: string
  photos: string[]
  video?: { src: string; poster: string }
}

// Trip dates: April 23 – May 6, 2026.
// Photos curated to /public/kenya-2026/photos/day-{NN}/{NN}.jpg by scripts/curate-kenya-photos.sh.
// Captions are designer-neutral — location + framing only, no fabricated narrative.
const DAYS: Day[] = [
  {
    day: 1,
    date: 'April 23, 2026',
    caption: 'Day one — landed in Kenya. First frames of the assignment.',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'].map((f) => `/kenya-2026/photos/day-01/${f}`),
  },
  {
    day: 2,
    date: 'April 24, 2026',
    caption: 'Day two — on the ground. The team in motion.',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'].map((f) => `/kenya-2026/photos/day-02/${f}`),
  },
  {
    day: 3,
    date: 'April 25, 2026',
    caption: 'Day three — a still from the day. The footage tells the rest.',
    photos: ['/kenya-2026/photos/day-03/01.jpg'],
  },
  {
    day: 4,
    date: 'April 26, 2026',
    caption: 'Day four — moments captured between sessions.',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'].map((f) => `/kenya-2026/photos/day-04/${f}`),
  },
  {
    day: 5,
    date: 'April 27, 2026',
    caption: 'Day five — a still from the day. The footage tells the rest.',
    photos: ['/kenya-2026/photos/day-05/01.jpg'],
  },
  {
    day: 6,
    date: 'April 28, 2026',
    caption: 'Day six — ground-level. People, places, presence.',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'].map((f) => `/kenya-2026/photos/day-06/${f}`),
  },
  {
    day: 7,
    date: 'April 29, 2026',
    caption: 'Day seven — mid-trip. The work was already underway.',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'].map((f) => `/kenya-2026/photos/day-07/${f}`),
  },
  {
    day: 8,
    date: 'April 30, 2026',
    caption: 'Day eight — close-quarters. Faces of the mission.',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'].map((f) => `/kenya-2026/photos/day-08/${f}`),
  },
  {
    day: 9,
    date: 'May 1, 2026',
    caption: 'Day nine — a still from the day. The footage tells the rest.',
    photos: ['/kenya-2026/photos/day-09/01.jpg'],
  },
  {
    day: 10,
    date: 'May 2, 2026',
    caption: 'Day ten — by the water. Podcast recordings rolling.',
    photos: ['/kenya-2026/photos/day-10/01.jpg'],
  },
  {
    day: 11,
    date: 'May 3, 2026',
    caption: 'Day eleven — final stretch. The team and the people.',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'].map((f) => `/kenya-2026/photos/day-11/${f}`),
    video: { src: '/videos/kenya/day-11.mp4', poster: '/videos/kenya/posters/day-11.jpg' },
  },
  {
    day: 12,
    date: 'May 4, 2026',
    caption: 'Day twelve — a still from the day. Watch the full footage below.',
    photos: ['/kenya-2026/photos/day-12/01.jpg'],
    video: { src: '/videos/kenya/day-12.mp4', poster: '/videos/kenya/posters/day-12.jpg' },
  },
  {
    day: 13,
    date: 'May 5, 2026',
    caption: 'Day thirteen — gathering and going.',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'].map((f) => `/kenya-2026/photos/day-13/${f}`),
    video: { src: '/videos/kenya/day-13.mp4', poster: '/videos/kenya/posters/day-13.jpg' },
  },
  {
    day: 14,
    date: 'May 6, 2026',
    caption: 'Day fourteen — closing day. Sent out.',
    photos: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg'].map((f) => `/kenya-2026/photos/day-14/${f}`),
    video: { src: '/videos/kenya/day-14.mp4', poster: '/videos/kenya/posters/day-14.jpg' },
  },
]

function DayMedia({ day }: { day: Day }) {
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

  // Days with video: video on top (aspect-video), photo strip below.
  // Days without video: hero photo, photo strip below if more than one.
  if (day.video) {
    return (
      <div ref={containerRef} className="space-y-3">
        <div
          className="group relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 transition-all hover:ring-gold/40"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={day.video.src}
            poster={day.video.poster}
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
        <PhotoStrip photos={day.photos} day={day.day} />
      </div>
    )
  }

  // No video — hero photo + strip
  const [hero, ...rest] = day.photos
  return (
    <div ref={containerRef} className="space-y-3">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 transition-all hover:ring-gold/40">
        <Image
          src={hero}
          alt={`Day ${day.day} in Kenya`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      {rest.length > 0 && <PhotoStrip photos={rest} day={day.day} />}
    </div>
  )
}

function PhotoStrip({ photos, day }: { photos: string[]; day: number }) {
  if (photos.length === 0) return null
  return (
    <div className="grid grid-cols-4 gap-2">
      {photos.slice(0, 4).map((src, i) => (
        <div
          key={src}
          className="group relative aspect-square overflow-hidden rounded-lg bg-black ring-1 ring-white/10 transition-all hover:ring-gold/40"
        >
          <Image
            src={src}
            alt={`Day ${day} — photo ${i + 1}`}
            fill
            sizes="(max-width: 768px) 25vw, 12vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ))}
    </div>
  )
}

function DayCard({ day, index }: { day: Day; index: number }) {
  const reverse = index % 2 === 1
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.04 }}
      className={`grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16 ${
        reverse ? 'md:[&>*:first-child]:order-2' : ''
      }`}
    >
      <DayMedia day={day} />

      {/* Text */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gold/80">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-gold">
            Day {day.day}
          </span>
          <span className="inline-flex items-center gap-1 text-white/50">
            <Calendar className="h-3 w-3" />
            {day.date}
          </span>
        </div>
        <h3 className="mt-4 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
          Day {day.day} in Kenya
        </h3>
        <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
          {day.caption}
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
          Fourteen days, in order.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/70">
          From the first frame to the last. Hover or scroll — each clip plays in place.
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

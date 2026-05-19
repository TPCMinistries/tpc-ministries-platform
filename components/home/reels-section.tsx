'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Play, Sparkles, ArrowRight, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

type Reel =
  | {
      kind: 'youtube'
      id: string
      youtubeId: string
      title: string
      duration?: string
      tag?: string
    }
  | {
      kind: 'mp4'
      id: string
      src: string
      poster: string
      title: string
      duration?: string
      tag?: string
    }
  | {
      kind: 'placeholder'
      id: string
      title: string
      tag?: string
    }

// EDITING GUIDE
// • Drop a real short by adding to the array — order is render order
// • Source files live in /public/videos/kenya/{reel|vertical}-*.mp4
// • Posters are auto-generated at /public/videos/kenya/posters/<name>.jpg
const REELS: Reel[] = [
  {
    kind: 'mp4',
    id: 'kenya-reel-01',
    src: '/videos/kenya/reel-01.mp4',
    poster: '/videos/kenya/posters/reel-01.jpg',
    title: 'Reel · 01',
    tag: 'KENYA 2026',
  },
  {
    kind: 'mp4',
    id: 'kenya-itete-market',
    src: '/videos/kenya/itete-market.mp4',
    poster: '/videos/kenya/posters/itete-market.jpg',
    title: 'Itete Market',
    tag: 'KENYA 2026',
  },
  {
    kind: 'mp4',
    id: 'kenya-reel-02',
    src: '/videos/kenya/reel-02.mp4',
    poster: '/videos/kenya/posters/reel-02.jpg',
    title: 'Reel · 02',
    tag: 'KENYA 2026',
  },
  {
    kind: 'mp4',
    id: 'kenya-video-03',
    src: '/videos/kenya/video-03.mp4',
    poster: '/videos/kenya/posters/video-03.jpg',
    title: 'Reel · 03',
    tag: 'KENYA 2026',
  },
  {
    kind: 'mp4',
    id: 'kenya-reel-033',
    src: '/videos/kenya/reel-033.mp4',
    poster: '/videos/kenya/posters/reel-033.jpg',
    title: 'Reel · 04',
    tag: 'KENYA 2026',
  },
  {
    kind: 'mp4',
    id: 'kenya-vertical-03',
    src: '/videos/kenya/vertical-03.mp4',
    poster: '/videos/kenya/posters/vertical-03.jpg',
    title: 'B-roll',
    tag: 'KENYA 2026',
  },
  {
    kind: 'youtube',
    id: 'purpose',
    youtubeId: '8uUheKZ9HD4',
    title: 'A word on purpose',
    tag: 'PROPHETIC',
  },
  {
    kind: 'youtube',
    id: 'street',
    youtubeId: 'E05bXP7bq6A',
    title: 'Ministering on the street',
    tag: 'STREET',
  },
]

function YoutubeReelCard({ reel }: { reel: Extract<Reel, { kind: 'youtube' }> }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-navy-950">
        <iframe
          src={`https://www.youtube.com/embed/${reel.youtubeId}?autoplay=1&modestbranding=1&rel=0`}
          title={reel.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      aria-label={`Play ${reel.title}`}
      className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-navy-950 shadow-lg ring-1 ring-white/5 transition-all duration-300 hover:shadow-2xl hover:ring-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${reel.youtubeId}/maxresdefault.jpg`}
        alt={reel.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/30 to-transparent" />

      {/* Tag */}
      {reel.tag && (
        <span className="absolute left-3 top-3 rounded-full bg-gold px-2 py-1 text-[10px] font-black uppercase tracking-wider text-navy-950">
          {reel.tag}
        </span>
      )}

      {/* Play icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-navy-950 shadow-2xl transition-transform duration-300 group-hover:scale-110">
          <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
        </div>
      </div>

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="line-clamp-2 text-body-sm font-semibold text-white">{reel.title}</p>
      </div>
    </button>
  )
}

function Mp4ReelCard({ reel }: { reel: Extract<Reel, { kind: 'mp4' }> }) {
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
      className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-navy-950 shadow-lg ring-1 ring-white/5 transition-all duration-300 hover:shadow-2xl hover:ring-gold/50"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <video
        ref={videoRef}
        src={reel.src}
        poster={reel.poster}
        muted={muted}
        playsInline
        loop
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent" />

      {reel.tag && (
        <span className="absolute left-3 top-3 rounded-full bg-gold px-2 py-1 text-[10px] font-black uppercase tracking-wider text-navy-950">
          {reel.tag}
        </span>
      )}

      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-navy-950/70 text-white backdrop-blur-sm transition-colors hover:bg-navy-900"
      >
        {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="line-clamp-2 text-body-sm font-semibold text-white">{reel.title}</p>
      </div>
    </div>
  )
}

function PlaceholderReelCard({ reel }: { reel: Extract<Reel, { kind: 'placeholder' }> }) {
  return (
    <div className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 shadow-lg ring-1 ring-gold/20 transition-all duration-300 hover:ring-gold/60">
      {/* Stylized stripes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,184,131,0.25),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.4),transparent_70%)]" />

      {reel.tag && (
        <span className="absolute left-3 top-3 rounded-full bg-gold px-2 py-1 text-[10px] font-black uppercase tracking-wider text-navy-950">
          {reel.tag}
        </span>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        <Sparkles className="mb-3 h-7 w-7 text-gold" />
        <p className="text-body-sm font-bold text-white">{reel.title}</p>
        <p className="mt-1 text-[11px] text-gold-200/70">Coming after the trip</p>
      </div>
    </div>
  )
}

export function ReelsSection() {
  return (
    <Section className="relative overflow-hidden bg-navy-950 text-white" container={false}>
      {/* Background tints */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,184,131,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(30,58,97,0.4),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
              <span className="text-body-xs font-semibold uppercase tracking-[0.18em] text-gold-200">
                Reels
              </span>
            </div>
            <h2 className="font-display text-display-md md:text-display-lg text-white">
              Quick word. Big impact.
            </h2>
            <p className="mt-3 text-body-lg text-white/55">
              60-second prophetic words, street ministry moments, and stories from the field.
              Built for the scroll.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.youtube.com/@TPCMinistries"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/20 bg-white/5 text-white hover:border-gold/60 hover:bg-gold/10"
              >
                <Play className="mr-2 h-4 w-4" />
                YouTube
              </Button>
            </a>
            <Link href="/teachings">
              <Button size="lg" className="bg-gold text-navy-950 hover:bg-gold-300">
                All teachings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        {/* Horizontal-scroll on mobile, grid on desktop */}
        <ScrollReveal>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible lg:grid-cols-5">
            {REELS.map((reel) => (
              <div
                key={reel.id}
                className="w-[68vw] flex-shrink-0 snap-start sm:w-[44vw] md:w-auto"
              >
                {reel.kind === 'youtube' && <YoutubeReelCard reel={reel} />}
                {reel.kind === 'mp4' && <Mp4ReelCard reel={reel} />}
                {reel.kind === 'placeholder' && <PlaceholderReelCard reel={reel} />}
              </div>
            ))}
          </div>
        </ScrollReveal>

        <p className="mt-6 text-center text-[11px] text-white/30 md:hidden">
          Swipe →
        </p>
      </div>
    </Section>
  )
}

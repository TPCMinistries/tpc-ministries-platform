'use client'

import { useState, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { StaggerChildren, StaggerItem } from '@/components/motion/stagger-children'

interface VideoData {
  id: string
  title: string
  featured?: boolean
}

const videos: VideoData[] = [
  { id: '8uUheKZ9HD4', title: 'Prophet Lorenzo Speaks About Purpose', featured: true },
  { id: 'E05bXP7bq6A', title: 'Prophet Lorenzo Ministers on the Street', featured: true },
  { id: 'vKGQERI3VzY', title: 'The Work of Christian Transformation' },
  { id: 'ET4Gesxc49g', title: 'Bible Study: Fruits of The Spirit' },
  { id: 'mOAtkdiMKKg', title: 'Bible Study: Parable of The Talents' },
  { id: 'c-IiTvUed3c', title: 'TPC Wealth Calculator' },
]

function VideoThumbnail({ video }: { video: VideoData }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  if (isPlaying) {
    return (
      <div className="group">
        <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <h3 className="mt-3 font-semibold text-navy text-body-md">{video.title}</h3>
      </div>
    )
  }

  return (
    <div className="group">
      <button
        onClick={handlePlay}
        className="relative block w-full aspect-video overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
        aria-label={`Play video: ${video.title}`}
      >
        {/* Thumbnail image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-navy-950/30 transition-colors duration-300 group-hover:bg-navy-950/20" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 text-navy-950 shadow-lg backdrop-blur-sm transition-transform duration-300 ${
              shouldReduceMotion ? '' : 'group-hover:scale-110'
            }`}
          >
            <Play className="ml-1 h-7 w-7" fill="currentColor" />
          </div>
        </div>
      </button>
      <h3 className="mt-3 font-semibold text-navy text-body-md">{video.title}</h3>
    </div>
  )
}

export function VideoSection() {
  const featured = videos.filter((v) => v.featured)
  const regular = videos.filter((v) => !v.featured)

  return (
    <Section className="bg-background">
      <ScrollReveal className="mb-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-navy/10 px-4 py-2">
          <Play className="h-4 w-4 text-navy" />
          <span className="text-body-sm font-medium text-navy">Video Teachings</span>
        </div>
        <h2 className="mb-4 font-display text-display-md md:text-display-lg text-navy">
          Watch &amp; Be Transformed
        </h2>
        <p className="mx-auto max-w-2xl text-body-xl text-muted-foreground">
          Powerful teachings and prophetic insights to awaken your purpose and ignite your vision
        </p>
      </ScrollReveal>

      {/* Masonry-like grid: 2 large + 4 small */}
      <StaggerChildren className="grid gap-6 md:grid-cols-2">
        {/* 2 Featured / Large */}
        {featured.map((video) => (
          <StaggerItem key={video.id}>
            <VideoThumbnail video={video} />
          </StaggerItem>
        ))}
      </StaggerChildren>

      <StaggerChildren className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {regular.map((video) => (
          <StaggerItem key={video.id}>
            <VideoThumbnail video={video} />
          </StaggerItem>
        ))}
      </StaggerChildren>

      <div className="mt-12 text-center">
        <a
          href="https://www.youtube.com/@TPCMinistries"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-navy text-navy hover:bg-navy hover:text-white"
          >
            <Play className="mr-2 h-5 w-5" />
            Subscribe on YouTube
          </Button>
        </a>
      </div>
    </Section>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Section } from '@/components/ui/section'

export type DayPhotos = {
  day: number
  photos: string[]
}

type Item = {
  day: number
  src: string
}

type Props = {
  days: DayPhotos[]
  total: number
}

export function GalleryClient({ days, total }: Props) {
  const [filter, setFilter] = useState<number | 'all'>('all')
  const [lightbox, setLightbox] = useState<number | null>(null)

  // Flatten all photos with their day, then filter.
  const allItems: Item[] = useMemo(
    () => days.flatMap((d) => d.photos.map((src) => ({ day: d.day, src }))),
    [days]
  )

  const items: Item[] = useMemo(
    () => (filter === 'all' ? allItems : allItems.filter((i) => i.day === filter)),
    [allItems, filter]
  )

  // Reset lightbox when filter changes
  useEffect(() => {
    setLightbox(null)
  }, [filter])

  // Keyboard handling for lightbox
  useEffect(() => {
    if (lightbox === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
      else if (e.key === 'ArrowRight') setLightbox((i) => (i === null ? null : (i + 1) % items.length))
      else if (e.key === 'ArrowLeft') setLightbox((i) => (i === null ? null : (i - 1 + items.length) % items.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, items.length])

  return (
    <div className="bg-navy-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/kenya-2026"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to recap
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">
                Kenya 2026 · Gallery
              </div>
              <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
                {total} photos. 14 days.
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/60 sm:text-base">
                Click any photo to view full-screen. Filter by day to focus.
              </p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
              All ({allItems.length})
            </FilterPill>
            {days.map((d) => (
              <FilterPill key={d.day} active={filter === d.day} onClick={() => setFilter(d.day)}>
                Day {d.day} ({d.photos.length})
              </FilterPill>
            ))}
          </div>
        </div>
      </header>

      {/* Masonry grid (CSS columns) */}
      <Section size="lg" className="bg-navy-950">
        <motion.div
          layout
          className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 [&>*]:mb-3 sm:[&>*]:mb-4"
        >
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.button
                key={item.src}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.02 }}
                onClick={() => setLightbox(i)}
                className="group block w-full overflow-hidden rounded-xl bg-navy-900 ring-1 ring-white/5 transition-all hover:ring-gold/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <div className="relative">
                  <Image
                    src={item.src}
                    alt={`Day ${item.day}`}
                    width={800}
                    height={1067}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-gold">
                      Day {item.day}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {items.length === 0 && (
          <div className="py-20 text-center text-white/50">
            No photos for that day yet.
          </div>
        )}
      </Section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && items[lightbox] && (
          <Lightbox
            item={items[lightbox]}
            onClose={() => setLightbox(null)}
            onPrev={() => setLightbox((i) => (i === null ? null : (i - 1 + items.length) % items.length))}
            onNext={() => setLightbox((i) => (i === null ? null : (i + 1) % items.length))}
            index={lightbox}
            total={items.length}
          />
        )}
      </AnimatePresence>

      {/* Bottom CTA */}
      <Section size="lg" className="border-t border-white/10 bg-navy-950">
        <div className="text-center">
          <p className="mx-auto max-w-xl text-white/70">
            Want the full story behind the photos?
          </p>
          <Link
            href="/kenya-2026"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-sm font-bold uppercase tracking-[0.15em] text-gold transition hover:border-gold hover:bg-gold/20"
          >
            Read the recap
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
        active
          ? 'border-gold bg-gold text-navy-950'
          : 'border-white/15 bg-white/5 text-white/70 hover:border-gold/50 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
  index,
  total,
}: {
  item: Item
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  index: number
  total: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6">
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
          Day {item.day} · {index + 1} / {total}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          aria-label="Close"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image */}
      <motion.div
        key={item.src}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="relative max-h-[85vh] max-w-[92vw] sm:max-w-[88vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={item.src}
          alt={`Day ${item.day}`}
          width={1600}
          height={1067}
          sizes="92vw"
          className="h-auto max-h-[85vh] w-auto rounded-lg object-contain"
          priority
        />
      </motion.div>

      {/* Prev/Next */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 sm:left-6 sm:h-14 sm:w-14"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-6 sm:h-14 sm:w-14"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </motion.div>
  )
}

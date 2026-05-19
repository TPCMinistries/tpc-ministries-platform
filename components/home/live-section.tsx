'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Radio, Play, ArrowRight, Users, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

type LiveService = {
  id: string
  title?: string
  description?: string
  status: 'scheduled' | 'live' | 'ended' | string
  scheduled_start?: string
  scheduled_end?: string
  stream_url?: string
  thumbnail_url?: string
  current_attendees?: number
}

type TimeLeft = { days: number; hours: number; minutes: number }

function diffParts(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  }
}

function formatLocal(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function LiveSection() {
  const [service, setService] = useState<LiveService | null>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/live/service', { cache: 'no-store' })
        if (!res.ok) throw new Error('no service')
        const data = await res.json()
        if (!cancelled) setService(data?.service ?? null)
      } catch {
        if (!cancelled) setService(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const isLive = service?.status === 'live'
  const isScheduled = service?.status === 'scheduled' && service.scheduled_start
  const countdown = isScheduled && service.scheduled_start
    ? diffParts(new Date(service.scheduled_start))
    : null

  // touch `now` so eslint doesn't strip the ticker
  void now

  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,184,131,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

      <div className="relative grid items-center gap-10 md:grid-cols-2">
        {/* Left: copy */}
        <ScrollReveal>
          <div className="mb-4 inline-flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-body-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                On air now
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.06] px-3 py-1 text-body-xs font-semibold uppercase tracking-[0.18em] text-gold-200">
                <Radio className="h-3.5 w-3.5" />
                Watch live
              </span>
            )}
          </div>

          <h2 className="mb-4 font-display text-display-md md:text-display-lg text-white">
            {isLive ? 'We’re live right now.' : 'Join the next service.'}
          </h2>

          <p className="mb-6 max-w-lg text-body-lg text-white/60">
            {isLive
              ? service?.description ||
                'Worship, the Word, and a prophetic moment — come into the room.'
              : isScheduled
                ? service?.description ||
                  'A space for worship, the Word, and prophetic ministry — wherever you are in the world.'
                : 'Sunday gatherings and prophetic conferences streamed live to the US and around the world. Subscribe to know when we go on air.'}
          </p>

          {/* Service meta */}
          {service && (
            <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-body-sm text-white/55">
              {service.title && (
                <span className="font-semibold text-white">{service.title}</span>
              )}
              {service.scheduled_start && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gold" />
                  {formatLocal(service.scheduled_start)}
                </span>
              )}
              {isLive && typeof service.current_attendees === 'number' && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gold" />
                  {service.current_attendees.toLocaleString()} watching
                </span>
              )}
            </div>
          )}

          {/* Countdown */}
          {countdown && (
            <div className="mb-6 grid max-w-md grid-cols-3 gap-3">
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hrs', value: countdown.hours },
                { label: 'Min', value: countdown.minutes },
              ].map((u) => (
                <div
                  key={u.label}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center backdrop-blur-sm"
                >
                  <div className="font-display text-display-sm text-gold">
                    {String(u.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40">
                    {u.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {isLive ? (
              <Link href="/kenya/live">
                <Button
                  size="lg"
                  className="h-12 bg-red-600 px-6 font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500"
                >
                  <Play className="mr-2 h-4 w-4" fill="currentColor" />
                  Watch now
                </Button>
              </Link>
            ) : (
              <Link href="/kenya/live">
                <Button
                  size="lg"
                  className="h-12 bg-gold px-6 font-bold text-navy-950 hover:bg-gold-300"
                >
                  <Radio className="mr-2 h-4 w-4" />
                  Open live page
                </Button>
              </Link>
            )}
            <a
              href="https://www.youtube.com/@TPCMinistries"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-2 border-white/20 bg-white/5 px-6 text-white hover:border-gold/60 hover:bg-gold/10"
              >
                <Bell className="mr-2 h-4 w-4" />
                Subscribe on YouTube
              </Button>
            </a>
          </div>
        </ScrollReveal>

        {/* Right: visual */}
        <ScrollReveal delay={0.15}>
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-gold/20 via-transparent to-transparent blur-2xl" />
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-navy-950 shadow-2xl">
              {isLive && service?.stream_url ? (
                <iframe
                  src={service.stream_url}
                  title={service?.title || 'Live service'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      service?.thumbnail_url ||
                      'https://img.youtube.com/vi/8uUheKZ9HD4/maxresdefault.jpg'
                    }
                    alt="TPC Ministries live service"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    {loading ? (
                      <p className="text-body-sm text-white/50">Loading next service…</p>
                    ) : isScheduled ? (
                      <>
                        <Calendar className="mb-3 h-10 w-10 text-gold" />
                        <p className="text-body-md font-semibold text-white">
                          Next service
                        </p>
                        <p className="mt-1 text-body-sm text-white/60">
                          {service?.scheduled_start && formatLocal(service.scheduled_start)}
                        </p>
                      </>
                    ) : (
                      <>
                        <Play className="mb-3 h-10 w-10 text-gold" fill="currentColor" />
                        <p className="text-body-md font-semibold text-white">
                          Watch latest teachings
                        </p>
                        <p className="mt-1 text-body-sm text-white/60">
                          Live services stream right here when we go on air.
                        </p>
                      </>
                    )}
                    <Link href="/live" className="mt-4">
                      <Button className="bg-gold text-navy-950 hover:bg-gold-300">
                        Open live page
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </Section>
  )
}

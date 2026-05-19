'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import Link from 'next/link'
import Image from 'next/image'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Search,
  Headphones,
  Clock,
  Calendar,
  Download,
  Share2,
  Rss,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'

interface Episode {
  id: string
  slug: string
  title: string
  description: string
  author: string
  audio_url: string
  thumbnail?: string
  duration_minutes: number
  published_at: string
  episode_number?: number
  season_number?: number
  views: number
}

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Audio player state
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetchEpisodes()
  }, [currentPage, searchQuery])

  const fetchEpisodes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        content_type: 'podcast',
        page: currentPage.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery })
      })

      const res = await fetch(`/api/public/teachings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setEpisodes(data.teachings || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching episodes:', error)
    } finally {
      setLoading(false)
    }
  }

  const playEpisode = (episode: Episode) => {
    if (currentEpisode?.id === episode.id) {
      togglePlayPause()
    } else {
      setCurrentEpisode(episode)
      setIsPlaying(true)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, duration)
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleShare = (episode: Episode) => {
    const url = `${window.location.origin}/podcast/${episode.slug || episode.id}`
    if (navigator.share) {
      navigator.share({
        title: episode.title,
        text: episode.description,
        url
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hidden Audio Element */}
      {currentEpisode && (
        <audio
          ref={audioRef}
          src={currentEpisode.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          autoPlay
        />
      )}

      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-6xl px-4 py-32">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <ScrollReveal variant="fade-scale">
              <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 shadow-2xl md:h-64 md:w-64">
                <Headphones className="h-24 w-24 text-gold md:h-32 md:w-32" />
              </div>
            </ScrollReveal>
            <div className="text-center md:text-left">
              <ScrollReveal>
                <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">In the Prophet's Voice</p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <h1 className="mb-4 font-display text-display-lg md:text-display-xl text-white">
                  TPC Ministries Podcast
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="mb-6 max-w-xl text-body-xl text-white/70">
                  Prophetic teaching, spiritual insight, and Kingdom strategy — recorded for the road.
                </p>
              </ScrollReveal>
              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                <Link href="/podcast/feed.xml" target="_blank">
                  <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy">
                    <Rss className="mr-2 h-4 w-4" />
                    RSS Feed
                  </Button>
                </Link>
                <Link href="https://podcasts.apple.com" target="_blank">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Apple Podcasts
                  </Button>
                </Link>
                <Link href="https://spotify.com" target="_blank">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Spotify
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Search */}
      <section className="border-b border-border bg-secondary px-4 py-6">
        <div className="container mx-auto max-w-6xl">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search episodes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Episodes Grid */}
      <section className="flex-1 bg-background px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
            </div>
          ) : episodes.length === 0 ? (
            <Card className="rounded-2xl py-16 text-center">
              <CardContent>
                <Headphones className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 font-display text-display-xs text-foreground">No Episodes Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'Check back soon for new episodes'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {episodes.map((episode) => (
                  <Card
                    key={episode.id}
                    className={`overflow-hidden rounded-2xl transition-all hover:border-gold/30 hover:shadow-md ${
                      currentEpisode?.id === episode.id ? 'ring-2 ring-gold' : ''
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Thumbnail */}
                        <div className="relative h-48 w-full flex-shrink-0 md:h-auto md:w-48">
                          {episode.thumbnail ? (
                            <Image
                              src={episode.thumbnail}
                              alt={episode.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 192px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy to-navy-800">
                              <Headphones className="h-12 w-12 text-gold/50" />
                            </div>
                          )}
                          {/* Play Button Overlay */}
                          <button
                            onClick={() => playEpisode(episode)}
                            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
                          >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold">
                              {currentEpisode?.id === episode.id && isPlaying ? (
                                <Pause className="h-8 w-8 text-navy" />
                              ) : (
                                <Play className="ml-1 h-8 w-8 text-navy" />
                              )}
                            </div>
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              {episode.episode_number && (
                                <span className="text-body-sm font-medium text-gold">
                                  Episode {episode.episode_number}
                                  {episode.season_number && ` - Season ${episode.season_number}`}
                                </span>
                              )}
                              <h3 className="mb-2 line-clamp-2 font-display text-display-xs text-foreground">
                                {episode.title}
                              </h3>
                              <p className="mb-4 line-clamp-2 text-body-sm text-muted-foreground">
                                {episode.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-body-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(episode.published_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {episode.duration_minutes} min
                                </span>
                                {episode.author && (
                                  <span>By {episode.author}</span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleShare(episode)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              {episode.audio_url && (
                                <Link href={episode.audio_url} download>
                                  <Button variant="ghost" size="icon">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-body-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Fixed Audio Player */}
      {currentEpisode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-navy-950 shadow-lg">
          <div className="container mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Episode Info */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gold/20">
                  <Headphones className="h-6 w-6 text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{currentEpisode.title}</p>
                  <p className="truncate text-body-sm text-white/40">{currentEpisode.author}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  className="text-white hover:text-gold"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  onClick={togglePlayPause}
                  className="h-10 w-10 bg-gold text-navy hover:bg-gold/90"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  className="text-white hover:text-gold"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress */}
              <div className="hidden flex-1 items-center gap-3 md:flex">
                <span className="w-12 text-right text-body-sm text-white/40">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="w-12 text-body-sm text-white/40">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Volume */}
              <div className="hidden items-center gap-2 lg:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:text-gold"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed player */}
      {currentEpisode && <div className="h-20" />}
    </div>
  )
}

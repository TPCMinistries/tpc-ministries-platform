'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
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

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

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
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-gold/20 to-gold/5 rounded-2xl flex items-center justify-center shadow-2xl">
              <Headphones className="h-24 w-24 md:h-32 md:w-32 text-gold" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                TPC Ministries Podcast
              </h1>
              <p className="text-xl text-gray-300 mb-6 max-w-xl">
                Prophetic teachings, spiritual insights, and Kingdom wisdom for your journey.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link href="/podcast/feed.xml" target="_blank">
                  <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy">
                    <Rss className="mr-2 h-4 w-4" />
                    RSS Feed
                  </Button>
                </Link>
                <Link href="https://podcasts.apple.com" target="_blank">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Apple Podcasts
                  </Button>
                </Link>
                <Link href="https://spotify.com" target="_blank">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Spotify
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="px-4 py-6 bg-gray-50 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
      <section className="px-4 py-12 bg-white flex-1">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
            </div>
          ) : episodes.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Headphones className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Episodes Found</h3>
                <p className="text-gray-500">
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
                    className={`overflow-hidden transition-all hover:shadow-md ${
                      currentEpisode?.id === episode.id ? 'ring-2 ring-gold' : ''
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Thumbnail */}
                        <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                          {episode.thumbnail ? (
                            <Image
                              src={episode.thumbnail}
                              alt={episode.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 192px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-navy to-navy-800 flex items-center justify-center">
                              <Headphones className="h-12 w-12 text-gold/50" />
                            </div>
                          )}
                          {/* Play Button Overlay */}
                          <button
                            onClick={() => playEpisode(episode)}
                            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <div className="h-16 w-16 rounded-full bg-gold flex items-center justify-center">
                              {currentEpisode?.id === episode.id && isPlaying ? (
                                <Pause className="h-8 w-8 text-navy" />
                              ) : (
                                <Play className="h-8 w-8 text-navy ml-1" />
                              )}
                            </div>
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              {episode.episode_number && (
                                <span className="text-sm text-gold font-medium">
                                  Episode {episode.episode_number}
                                  {episode.season_number && ` • Season ${episode.season_number}`}
                                </span>
                              )}
                              <h3 className="text-xl font-bold text-navy mb-2 line-clamp-2">
                                {episode.title}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                {episode.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Fixed Audio Player */}
      {currentEpisode && (
        <div className="fixed bottom-0 left-0 right-0 bg-navy border-t border-navy-700 shadow-lg z-50">
          <div className="container mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Episode Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gold/20 rounded flex-shrink-0 flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{currentEpisode.title}</p>
                  <p className="text-gray-400 text-sm truncate">{currentEpisode.author}</p>
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
                  className="bg-gold hover:bg-gold/90 text-navy h-10 w-10"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
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
              <div className="hidden md:flex items-center gap-3 flex-1">
                <span className="text-gray-400 text-sm w-12 text-right">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-gray-400 text-sm w-12">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Volume */}
              <div className="hidden lg:flex items-center gap-2">
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

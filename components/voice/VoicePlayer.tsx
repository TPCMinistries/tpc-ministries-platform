'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoicePlayerProps {
  audioUrl: string
  duration?: number
  title?: string
  subtitle?: string
  className?: string
  compact?: boolean
  onPlay?: () => void
}

export default function VoicePlayer({
  audioUrl,
  duration,
  title,
  subtitle,
  className,
  compact = false,
  onPlay
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration || 0)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
      onPlay?.()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        <Button
          type="button"
          onClick={togglePlay}
          variant="ghost"
          size="sm"
          className="rounded-full w-8 h-8 p-0 bg-navy/10 hover:bg-navy/20"
        >
          {isPlaying ? (
            <Pause className="h-3 w-3 text-navy" />
          ) : (
            <Play className="h-3 w-3 text-navy ml-0.5" />
          )}
        </Button>

        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-navy transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-xs text-gray-500 tabular-nums">
          {formatTime(currentTime)}/{formatTime(totalDuration)}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('bg-gradient-to-r from-navy/5 to-gold/5 rounded-xl p-4', className)}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Title and subtitle */}
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h4 className="font-semibold text-navy">{title}</h4>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Play button */}
        <Button
          type="button"
          onClick={togglePlay}
          className="rounded-full w-12 h-12 p-0 bg-navy hover:bg-navy/90"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-white" />
          ) : (
            <Play className="h-5 w-5 text-white ml-0.5" />
          )}
        </Button>

        {/* Progress section */}
        <div className="flex-1">
          {/* Progress bar */}
          <input
            type="range"
            min={0}
            max={totalDuration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-navy
              [&::-webkit-slider-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, #1e3a5f ${progress}%, #e5e7eb ${progress}%)`
            }}
          />

          {/* Time display */}
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 tabular-nums">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-gray-500 tabular-nums">
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>

        {/* Mute button */}
        <Button
          type="button"
          onClick={toggleMute}
          variant="ghost"
          size="sm"
          className="rounded-full w-8 h-8 p-0"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-gray-400" />
          ) : (
            <Volume2 className="h-4 w-4 text-gray-600" />
          )}
        </Button>
      </div>
    </div>
  )
}

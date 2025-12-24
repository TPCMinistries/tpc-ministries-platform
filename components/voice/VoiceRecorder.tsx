'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Play, Pause, Trash2, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  maxDurationSeconds?: number // null/undefined = no limit (for admin)
  disabled?: boolean
  className?: string
  showUpload?: boolean
  onUpload?: (file: File) => void
}

export default function VoiceRecorder({
  onRecordingComplete,
  maxDurationSeconds,
  disabled = false,
  className,
  showUpload = false,
  onUpload
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  // Auto-stop at max duration
  useEffect(() => {
    if (maxDurationSeconds && duration >= maxDurationSeconds && isRecording) {
      stopRecording()
    }
  }, [duration, maxDurationSeconds, isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setIsPlaying(false)
  }

  const confirmRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration)
      discardRecording()
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onUpload) {
      onUpload(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const remainingTime = maxDurationSeconds ? maxDurationSeconds - duration : null

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Hidden file input for upload */}
      {showUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      )}

      {/* Recording/Playback UI */}
      {!audioBlob ? (
        // Recording Mode
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <>
              <Button
                type="button"
                onClick={startRecording}
                disabled={disabled}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 p-0"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <span className="text-sm text-gray-500">Tap to record</span>

              {showUpload && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Recording in progress */}
              <Button
                type="button"
                onClick={pauseRecording}
                variant="outline"
                className="rounded-full w-10 h-10 p-0"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>

              <Button
                type="button"
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 p-0 animate-pulse"
              >
                <Square className="h-5 w-5" />
              </Button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-lg font-mono font-bold text-red-600">
                    {formatDuration(duration)}
                  </span>
                  {remainingTime !== null && (
                    <span className="text-sm text-gray-400">
                      ({formatDuration(remainingTime)} left)
                    </span>
                  )}
                </div>

                {/* Progress bar for max duration */}
                {maxDurationSeconds && (
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${(duration / maxDurationSeconds) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        // Playback Mode
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Button
            type="button"
            onClick={togglePlayback}
            variant="outline"
            className="rounded-full w-10 h-10 p-0"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="flex-1">
            <div className="text-sm font-medium text-navy">Recording ready</div>
            <div className="text-xs text-gray-500">{formatDuration(duration)}</div>
          </div>

          <Button
            type="button"
            onClick={discardRecording}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            onClick={confirmRecording}
            size="sm"
            className="bg-navy hover:bg-navy/90"
          >
            Use Recording
          </Button>
        </div>
      )}
    </div>
  )
}

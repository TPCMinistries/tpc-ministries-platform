'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Youtube, Video, X, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface VideoInputProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
}

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
  return null
}

function isYoutubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url)
}

export default function VideoInput({ value, onChange, placeholder }: VideoInputProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)

  useEffect(() => {
    if (value && isYoutubeUrl(value)) {
      setThumbnail(getYoutubeThumbnail(value))
    } else {
      setThumbnail(null)
    }
  }, [value])

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Paste YouTube or video URL'}
            className="pr-10"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => window.open(value, '_blank')}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>

      {thumbnail && (
        <div className="relative w-40 aspect-video rounded overflow-hidden bg-gray-100">
          <Image src={thumbnail} alt="YouTube thumbnail" fill className="object-cover" sizes="160px" />
          <div className="absolute top-1 left-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
            <Youtube className="h-3 w-3" />
            YouTube
          </div>
        </div>
      )}

      {value && !isYoutubeUrl(value) && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Video className="h-3 w-3" />
          Direct video URL
        </div>
      )}
    </div>
  )
}

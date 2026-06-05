'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Search, Upload, Loader2, Check, ImageIcon,
  Music, Video, FileText,
} from 'lucide-react'
import Image from 'next/image'

interface MediaItem {
  id: string
  file_name: string
  original_name: string
  public_url: string
  media_type: string
  mime_type: string
  file_size_bytes: number
  alt_text?: string
  caption?: string
  folder?: string
  created_at: string
}

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string, metadata?: { alt?: string; type?: string }) => void
  mediaTypeFilter?: 'image' | 'video' | 'audio' | 'document' | 'all'
  title?: string
}

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  mediaTypeFilter = 'all',
  title = 'Select Media',
}: MediaPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState<string>('browse')

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (mediaTypeFilter !== 'all') params.set('type', mediaTypeFilter)
      if (search) params.set('search', search)
      params.set('limit', '60')

      const res = await fetch(`/api/admin/media?${params}`)
      const json = await res.json()
      setMedia(json.data || [])
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }, [mediaTypeFilter, search])

  useEffect(() => {
    if (open) {
      fetchMedia()
      setSelected(null)
    }
  }, [open, fetchMedia])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'general')

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const json = await res.json()
      // Select the newly uploaded item
      onSelect(json.data.public_url, {
        alt: json.data.alt_text,
        type: json.data.media_type,
      })
      onClose()
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSelect = () => {
    if (!selected) return
    onSelect(selected.public_url, {
      alt: selected.alt_text,
      type: selected.media_type,
    })
    onClose()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />
      case 'audio': return <Music className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-navy">{title}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search media..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
                className="pl-10"
              />
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-navy" />
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No media found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setTab('upload')}
                  >
                    Upload one
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                  {media.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selected?.id === item.id
                          ? 'border-navy ring-2 ring-navy/20'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => setSelected(item)}
                      onDoubleClick={() => {
                        setSelected(item)
                        handleSelect()
                      }}
                    >
                      {item.media_type === 'image' ? (
                        <Image
                          src={item.public_url}
                          alt={item.alt_text || item.file_name}
                          fill
                          className="object-cover"
                          sizes="150px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-2">
                          {getTypeIcon(item.media_type)}
                          <span className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                            {item.original_name || item.file_name}
                          </span>
                        </div>
                      )}
                      {selected?.id === item.id && (
                        <div className="absolute top-1 right-1 bg-navy text-white rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">
                        {item.original_name || item.file_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selection info bar */}
            {selected && (
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {getTypeIcon(selected.media_type)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selected.original_name || selected.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatSize(selected.file_size_bytes)} &middot; {selected.media_type}
                    </p>
                  </div>
                </div>
                <Button onClick={handleSelect} className="bg-navy hover:bg-navy/90">
                  Insert Selected
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <input
                type="file"
                id="media-picker-upload"
                className="hidden"
                onChange={handleUpload}
                accept={
                  mediaTypeFilter === 'image' ? 'image/*' :
                  mediaTypeFilter === 'audio' ? 'audio/*' :
                  mediaTypeFilter === 'video' ? 'video/*' :
                  '*/*'
                }
              />
              {uploading ? (
                <div>
                  <Loader2 className="h-12 w-12 animate-spin text-navy mx-auto mb-4" />
                  <p className="text-gray-600">Uploading...</p>
                </div>
              ) : (
                <label htmlFor="media-picker-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-navy mx-auto mb-4" />
                  <p className="text-gray-900 font-medium mb-1">
                    Click to upload a file
                  </p>
                  <p className="text-sm text-gray-500">
                    {mediaTypeFilter === 'image' ? 'JPG, PNG, WebP, or GIF' :
                     mediaTypeFilter === 'audio' ? 'MP3, WAV, or AAC' :
                     mediaTypeFilter === 'video' ? 'MP4, WebM, or MOV' :
                     'Any file type'}
                  </p>
                </label>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

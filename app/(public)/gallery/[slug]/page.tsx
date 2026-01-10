'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Share2,
  Calendar,
  MapPin,
  Camera,
  Images,
  Eye,
  Loader2,
  ZoomIn
} from 'lucide-react'

interface Photo {
  id: string
  original_url: string
  thumbnail_url: string
  medium_url: string
  large_url: string
  title: string
  description: string
  alt_text: string
  width: number
  height: number
}

interface Album {
  id: string
  title: string
  slug: string
  description: string
  category: string
  date: string
  location: string
  photo_count: number
  view_count: number
  photographer: string
}

export default function AlbumPage({ params }: { params: { slug: string } }) {
  const [album, setAlbum] = useState<Album | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  useEffect(() => {
    fetchAlbum()
  }, [params.slug])

  const fetchAlbum = async () => {
    try {
      const res = await fetch(`/api/public/gallery/${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setAlbum(data.album)
        setPhotos(data.photos || [])
      }
    } catch (error) {
      console.error('Error fetching album:', error)
    } finally {
      setLoading(false)
    }
  }

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = 'auto'
  }

  const goToPrevious = useCallback(() => {
    setCurrentPhotoIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))
  }, [photos.length])

  const goToNext = useCallback(() => {
    setCurrentPhotoIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1))
  }, [photos.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case 'Escape':
          closeLightbox()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, goToPrevious, goToNext])

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: album?.title,
        text: album?.description,
        url
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-navy" />
      </div>
    )
  }

  if (!album) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Images className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy mb-4">Album Not Found</h1>
          <Link href="/gallery">
            <Button>Back to Gallery</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[currentPhotoIndex]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Gallery
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {album.title}
              </h1>
              {album.description && (
                <p className="text-gray-300 max-w-2xl mb-4">
                  {album.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {album.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(album.date)}
                  </span>
                )}
                {album.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {album.location}
                  </span>
                )}
                {album.photographer && (
                  <span className="flex items-center gap-1">
                    <Camera className="h-4 w-4" />
                    {album.photographer}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Images className="h-4 w-4" />
                  {album.photo_count} photos
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {album.view_count} views
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleShare}
              className="border-white/30 text-white hover:bg-white/10 self-start md:self-auto"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Album
            </Button>
          </div>
        </div>
      </section>

      {/* Photos Grid */}
      <section className="px-4 py-12 bg-gray-50 flex-1">
        <div className="container mx-auto max-w-6xl">
          {photos.length === 0 ? (
            <div className="text-center py-16">
              <Images className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No photos in this album yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => openLightbox(index)}
                  className="relative aspect-square overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <Image
                    src={photo.thumbnail_url || photo.medium_url || photo.original_url}
                    alt={photo.alt_text || photo.title || `Photo ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Navigation */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight className="h-10 w-10" />
          </button>

          {/* Main Image */}
          <div className="absolute inset-0 flex items-center justify-center p-16">
            <div className="relative w-full h-full">
              <Image
                src={currentPhoto.large_url || currentPhoto.original_url}
                alt={currentPhoto.alt_text || currentPhoto.title || ''}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="container mx-auto max-w-4xl flex items-center justify-between">
              <div>
                {currentPhoto.title && (
                  <h3 className="text-white font-medium">{currentPhoto.title}</h3>
                )}
                {currentPhoto.description && (
                  <p className="text-gray-300 text-sm">{currentPhoto.description}</p>
                )}
                <p className="text-gray-400 text-sm mt-1">
                  {currentPhotoIndex + 1} of {photos.length}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={currentPhoto.original_url}
                  download
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  <Download className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

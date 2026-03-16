'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  Camera,
  Calendar,
  MapPin,
  Images,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star
} from 'lucide-react'

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
  is_featured: boolean
  cover_photo?: {
    id: string
    thumbnail_url: string
    medium_url: string
  }
}

const categoryLabels: Record<string, string> = {
  events: 'Events',
  worship: 'Worship',
  outreach: 'Outreach',
  missions: 'Missions',
  baptism: 'Baptisms',
  community: 'Community',
  other: 'Other'
}

const categoryColors: Record<string, string> = {
  events: 'bg-blue-100 text-blue-800',
  worship: 'bg-purple-100 text-purple-800',
  outreach: 'bg-green-100 text-green-800',
  missions: 'bg-orange-100 text-orange-800',
  baptism: 'bg-cyan-100 text-cyan-800',
  community: 'bg-pink-100 text-pink-800',
  other: 'bg-secondary text-secondary-foreground'
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [featuredAlbums, setFeaturedAlbums] = useState<Album[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchFeaturedAlbums()
  }, [])

  useEffect(() => {
    fetchAlbums()
  }, [currentPage, searchQuery, selectedCategory])

  const fetchFeaturedAlbums = async () => {
    try {
      const res = await fetch('/api/public/gallery?featured=true&limit=3')
      if (res.ok) {
        const data = await res.json()
        setFeaturedAlbums(data.albums || [])
      }
    } catch (error) {
      console.error('Error fetching featured albums:', error)
    }
  }

  const fetchAlbums = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      })

      const res = await fetch(`/api/public/gallery?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAlbums(data.albums || [])
        setCategories(data.categories || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching albums:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <Camera className="mx-auto mb-6 h-16 w-16 text-gold" />
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Captured Moments</p>
          <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
            Photo Gallery
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            Capturing moments of faith, community, and God&apos;s work in our midst.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Featured Albums */}
      {featuredAlbums.length > 0 && (
        <section className="bg-navy px-4 py-section-sm dark:bg-navy-950">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 fill-gold text-gold" />
              <h2 className="font-display text-display-xs text-white">Featured Albums</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {featuredAlbums.map(album => (
                <Link key={album.id} href={`/gallery/${album.slug}`}>
                  <Card className="group h-full overflow-hidden rounded-2xl border-white/10 bg-white/5 transition-all hover:border-gold/30 hover:shadow-xl">
                    <div className="relative h-48">
                      {album.cover_photo?.medium_url ? (
                        <Image
                          src={album.cover_photo.medium_url}
                          alt={album.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy to-navy-800">
                          <Images className="h-12 w-12 text-gold/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="line-clamp-1 text-body-lg font-bold text-white">
                          {album.title}
                        </h3>
                        <p className="text-body-sm text-white/70">
                          {album.photo_count} photos
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="border-b border-border bg-secondary px-4 py-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search albums..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory('all')
                  setCurrentPage(1)
                }}
              >
                All Albums
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat)
                    setCurrentPage(1)
                  }}
                >
                  {categoryLabels[cat] || cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="flex-1 bg-background px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
            </div>
          ) : albums.length === 0 ? (
            <Card className="rounded-2xl py-16 text-center">
              <CardContent>
                <Camera className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 font-display text-display-xs text-foreground">No Albums Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Check back soon for new photos'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {albums.map(album => (
                  <Link key={album.id} href={`/gallery/${album.slug}`}>
                    <Card className="group h-full overflow-hidden rounded-2xl border-border transition-all hover:border-gold/30 hover:shadow-lg">
                      <div className="relative h-56">
                        {album.cover_photo?.medium_url ? (
                          <Image
                            src={album.cover_photo.medium_url}
                            alt={album.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-secondary">
                            <Images className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                        {album.category && (
                          <span className={`absolute left-3 top-3 rounded px-2 py-1 text-body-xs font-medium ${categoryColors[album.category] || categoryColors.other}`}>
                            {categoryLabels[album.category] || album.category}
                          </span>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="mb-2 line-clamp-1 font-bold text-foreground transition-colors group-hover:text-gold">
                          {album.title}
                        </h3>
                        {album.description && (
                          <p className="mb-3 line-clamp-2 text-body-sm text-muted-foreground">
                            {album.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-body-xs text-muted-foreground">
                          {album.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(album.date)}
                            </span>
                          )}
                          {album.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {album.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Images className="h-3 w-3" />
                            {album.photo_count} photos
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {album.view_count} views
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
    </div>
  )
}

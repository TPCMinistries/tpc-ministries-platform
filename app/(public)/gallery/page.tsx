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
  other: 'bg-gray-100 text-gray-800'
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
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <Camera className="h-16 w-16 text-gold mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Photo Gallery
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Capturing moments of faith, community, and God's work in our midst.
          </p>
        </div>
      </section>

      {/* Featured Albums */}
      {featuredAlbums.length > 0 && (
        <section className="px-4 py-12 bg-gradient-to-br from-gold/5 to-amber-50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-gold fill-gold" />
              <h2 className="text-2xl font-bold text-navy">Featured Albums</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredAlbums.map(album => (
                <Link key={album.id} href={`/gallery/${album.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all group h-full">
                    <div className="relative h-48">
                      {album.cover_photo?.medium_url ? (
                        <Image
                          src={album.cover_photo.medium_url}
                          alt={album.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-navy to-navy-800 flex items-center justify-center">
                          <Images className="h-12 w-12 text-gold/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-bold text-white line-clamp-1">
                          {album.title}
                        </h3>
                        <p className="text-sm text-gray-200">
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
      <section className="px-4 py-6 bg-gray-50 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                className={selectedCategory === 'all' ? 'bg-navy' : ''}
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
                  className={selectedCategory === cat ? 'bg-navy' : ''}
                >
                  {categoryLabels[cat] || cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="px-4 py-12 bg-white flex-1">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
            </div>
          ) : albums.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Albums Found</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Check back soon for new photos'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map(album => (
                  <Link key={album.id} href={`/gallery/${album.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                      <div className="relative h-56">
                        {album.cover_photo?.medium_url ? (
                          <Image
                            src={album.cover_photo.medium_url}
                            alt={album.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <Images className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        {album.category && (
                          <span className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium ${categoryColors[album.category] || categoryColors.other}`}>
                            {categoryLabels[album.category] || album.category}
                          </span>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-navy mb-2 line-clamp-1 group-hover:text-gold transition-colors">
                          {album.title}
                        </h3>
                        {album.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {album.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
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
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Heart,
  Quote,
  Play,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  User
} from 'lucide-react'

interface Testimony {
  id: string
  title: string
  content: string
  category?: string
  image_url?: string
  video_url?: string
  is_anonymous: boolean
  is_featured: boolean
  likes_count: number
  created_at: string
  member?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

const categoryLabels: Record<string, string> = {
  healing: 'Healing',
  provision: 'Provision',
  breakthrough: 'Breakthrough',
  salvation: 'Salvation',
  deliverance: 'Deliverance',
  answered_prayer: 'Answered Prayer',
  other: 'Testimony'
}

const categoryColors: Record<string, string> = {
  healing: 'bg-green-100 text-green-800',
  provision: 'bg-blue-100 text-blue-800',
  breakthrough: 'bg-purple-100 text-purple-800',
  salvation: 'bg-pink-100 text-pink-800',
  deliverance: 'bg-orange-100 text-orange-800',
  answered_prayer: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800'
}

export default function TestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [featuredTestimonies, setFeaturedTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<string>('all')
  const [featuredIndex, setFeaturedIndex] = useState(0)

  useEffect(() => {
    fetchFeatured()
  }, [])

  useEffect(() => {
    fetchTestimonies()
  }, [page, filter])

  const fetchFeatured = async () => {
    try {
      const res = await fetch('/api/public/testimonies?featured=true&limit=5')
      const data = await res.json()
      setFeaturedTestimonies(data.testimonies || [])
    } catch (error) {
      console.error('Error fetching featured:', error)
    }
  }

  const fetchTestimonies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9'
      })
      if (filter !== 'all') {
        params.append('category', filter)
      }

      const res = await fetch(`/api/public/testimonies?${params}`)
      const data = await res.json()
      setTestimonies(data.testimonies || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching testimonies:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featuredTestimonies.length)
  }

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + featuredTestimonies.length) % featuredTestimonies.length)
  }

  const categories = Object.keys(categoryLabels)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Testimonies
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real stories of God's faithfulness, healing, and breakthrough in the lives of our community.
          </p>
        </div>
      </section>

      {/* Featured Testimony Carousel */}
      {featuredTestimonies.length > 0 && (
        <section className="px-4 py-16 bg-gradient-to-br from-gold/10 to-amber-50">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Sparkles className="h-5 w-5 text-gold" />
              <h2 className="text-2xl font-bold text-navy">Featured Stories</h2>
            </div>

            <div className="relative">
              <Card className="overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <Quote className="h-12 w-12 text-gold/30 mb-4" />

                  <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6">
                    {featuredTestimonies[featuredIndex]?.content.length > 300
                      ? `${featuredTestimonies[featuredIndex].content.substring(0, 300)}...`
                      : featuredTestimonies[featuredIndex]?.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center">
                        {featuredTestimonies[featuredIndex]?.member?.avatar_url ? (
                          <img
                            src={featuredTestimonies[featuredIndex].member?.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-navy" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-navy">
                          {featuredTestimonies[featuredIndex]?.is_anonymous
                            ? 'Anonymous'
                            : `${featuredTestimonies[featuredIndex]?.member?.first_name || ''} ${featuredTestimonies[featuredIndex]?.member?.last_name?.charAt(0) || ''}.`}
                        </p>
                        {featuredTestimonies[featuredIndex]?.category && (
                          <Badge className={categoryColors[featuredTestimonies[featuredIndex].category || 'other']}>
                            {categoryLabels[featuredTestimonies[featuredIndex].category || 'other']}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Heart className="h-4 w-4 text-red-400" />
                      {featuredTestimonies[featuredIndex]?.likes_count || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {featuredTestimonies.length > 1 && (
                <>
                  <button
                    onClick={prevFeatured}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-6 w-6 text-navy" />
                  </button>
                  <button
                    onClick={nextFeatured}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-6 w-6 text-navy" />
                  </button>

                  <div className="flex justify-center gap-2 mt-4">
                    {featuredTestimonies.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFeaturedIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === featuredIndex ? 'bg-navy' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* All Testimonies */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setFilter('all'); setPage(1) }}
              className={filter === 'all' ? 'bg-navy' : ''}
            >
              All Stories
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={filter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setFilter(cat); setPage(1) }}
                className={filter === cat ? 'bg-navy' : ''}
              >
                {categoryLabels[cat]}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
            </div>
          ) : testimonies.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Testimonies Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Be the first to share what God has done in your life!
                </p>
                <Link href="/auth/signup">
                  <Button className="bg-navy hover:bg-navy/90">
                    Join to Share Your Story
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonies.map(testimony => (
                  <Card key={testimony.id} className="hover:shadow-lg transition-shadow">
                    {testimony.image_url && (
                      <div className="aspect-video bg-gray-100 relative overflow-hidden">
                        <img
                          src={testimony.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {testimony.video_url && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="bg-white rounded-full p-3">
                              <Play className="h-6 w-6 text-navy" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        {testimony.category && (
                          <Badge className={categoryColors[testimony.category]}>
                            {categoryLabels[testimony.category]}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1 text-sm text-gray-400">
                          <Heart className="h-4 w-4" />
                          {testimony.likes_count}
                        </span>
                      </div>

                      <h3 className="font-semibold text-navy mb-2 line-clamp-2">
                        {testimony.title}
                      </h3>

                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {testimony.content}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-navy" />
                        </div>
                        <span>
                          {testimony.is_anonymous
                            ? 'Anonymous'
                            : `${testimony.member?.first_name || ''} ${testimony.member?.last_name?.charAt(0) || ''}.`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
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

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-navy to-navy-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Share Your Story
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Your testimony could be the encouragement someone needs today.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-gold text-navy hover:bg-gold/90">
              Join Our Community
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  Quote,
  Play,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  User,
  BookOpen,
  Users,
  Star
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
      {/* Hero Section with Background Image */}
      <section className="relative bg-tpc-navy px-4 py-20 md:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=2070"
            alt="People worshipping together"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-tpc-navy/80 via-tpc-navy/70 to-tpc-navy" />
        </div>

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Heart className="h-4 w-4 text-tpc-gold" />
            <span className="text-tpc-gold text-sm font-medium">Real Stories, Real Faith</span>
          </div>
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Stories of Transformation
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Witness the power of God at work through the testimonies of our community.
            Every story is a testament to His faithfulness, healing, and breakthrough.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-white/70">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-tpc-gold" />
              <span>Community Stories</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-tpc-gold" />
              <span>Featured Testimonies</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-tpc-gold" />
              <span>Life-Changing Encounters</span>
            </div>
          </div>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tpc-navy"></div>
            </div>
          ) : testimonies.length === 0 ? (
            <div className="space-y-12">
              {/* Inspiring Message */}
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-stone-900 mb-4">
                  Stories Coming Soon
                </h2>
                <p className="text-stone-600">
                  We're collecting powerful testimonies from our community.
                  Soon this page will be filled with stories of healing, breakthrough, and transformation.
                </p>
              </div>

              {/* Preview Cards with Placeholder Images */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Healing Story Preview */}
                <Card className="overflow-hidden opacity-90">
                  <div className="aspect-video relative">
                    <Image
                      src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=800"
                      alt="Healing testimony"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-green-100 text-green-800 mb-2">Healing</Badge>
                      <p className="text-white font-semibold">Stories of Physical & Spiritual Healing</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-stone-500 text-sm italic">
                      "He heals the brokenhearted and binds up their wounds." - Psalm 147:3
                    </p>
                  </CardContent>
                </Card>

                {/* Breakthrough Story Preview */}
                <Card className="overflow-hidden opacity-90">
                  <div className="aspect-video relative">
                    <Image
                      src="https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=800"
                      alt="Breakthrough testimony"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-purple-100 text-purple-800 mb-2">Breakthrough</Badge>
                      <p className="text-white font-semibold">Testimonies of Divine Breakthrough</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-stone-500 text-sm italic">
                      "With God all things are possible." - Matthew 19:26
                    </p>
                  </CardContent>
                </Card>

                {/* Provision Story Preview */}
                <Card className="overflow-hidden opacity-90">
                  <div className="aspect-video relative">
                    <Image
                      src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800"
                      alt="Provision testimony"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-blue-100 text-blue-800 mb-2">Provision</Badge>
                      <p className="text-white font-semibold">Stories of God's Faithful Provision</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-stone-500 text-sm italic">
                      "My God shall supply all your need." - Philippians 4:19
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* CTA */}
              <div className="text-center">
                <p className="text-stone-600 mb-4">Have a testimony to share?</p>
                <Link href="/auth/signup">
                  <Button className="bg-tpc-navy hover:bg-tpc-navy/90 text-white">
                    Join to Share Your Story
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
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
      <section className="relative px-4 py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073"
            alt="Hands raised in worship"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-tpc-navy/85" />
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Quote className="h-12 w-12 text-tpc-gold/50 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Story Matters
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Every testimony is a seed of faith that can inspire and encourage others.
            Share what God has done in your life.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-tpc-gold text-tpc-navy hover:bg-tpc-gold/90 font-bold">
              Join Our Community
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

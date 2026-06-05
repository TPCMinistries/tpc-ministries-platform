'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
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
  other: 'bg-secondary text-secondary-foreground'
}

export default function TestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [featuredTestimonies, setFeaturedTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<string>('all')
  const [featuredIndex, setFeaturedIndex] = useState(0)

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await fetch('/api/public/testimonies?featured=true&limit=5')
      const data = await res.json()
      setFeaturedTestimonies(data.testimonies || [])
    } catch (error) {
      console.error('Error fetching featured:', error)
    }
  }, [])

  const fetchTestimonies = useCallback(async () => {
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
  }, [filter, page])

  useEffect(() => {
    fetchFeatured()
  }, [fetchFeatured])

  useEffect(() => {
    fetchTestimonies()
  }, [fetchTestimonies])

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
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=2070"
            alt="People worshipping together"
            fill
            className="object-cover opacity-15"
            priority
          />
        </div>
        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <ScrollReveal>
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Real Stories, Real Faith</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
              What God did<br />in their lives.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mx-auto max-w-2xl text-body-xl text-white/70">
              Testimonies of healing, breakthrough, and walking in assignment — straight from the community.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </ScrollReveal>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/40">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gold" />
              <span>Community Stories</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-gold" />
              <span>Featured Testimonies</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gold" />
              <span>Life-Changing Encounters</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Featured Testimony Carousel */}
      {featuredTestimonies.length > 0 && (
        <section className="bg-navy px-4 py-section dark:bg-navy-950">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              <h2 className="font-display text-display-xs text-white">Featured Stories</h2>
            </div>

            <div className="relative">
              <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="p-8 md:p-12">
                  <Quote className="mb-4 h-12 w-12 text-gold/30" />

                  <p className="mb-6 text-body-xl leading-relaxed text-white/70 md:text-display-xs md:font-normal">
                    {featuredTestimonies[featuredIndex]?.content.length > 300
                      ? `${featuredTestimonies[featuredIndex].content.substring(0, 300)}...`
                      : featuredTestimonies[featuredIndex]?.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                        {featuredTestimonies[featuredIndex]?.member?.avatar_url ? (
                          <Image
                            src={featuredTestimonies[featuredIndex].member?.avatar_url}
                            alt=""
                            width={48}
                            height={48}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-gold" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
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

                    <div className="flex items-center gap-2 text-body-sm text-white/40">
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
                    className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 rounded-full border border-white/10 bg-navy-950 p-2 shadow-lg hover:border-gold/30"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={nextFeatured}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full border border-white/10 bg-navy-950 p-2 shadow-lg hover:border-gold/30"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>

                  <div className="mt-4 flex justify-center gap-2">
                    {featuredTestimonies.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFeaturedIndex(i)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          i === featuredIndex ? 'bg-gold' : 'bg-white/20'
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
      <section className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Community</p>
            <h2 className="font-display text-display-md text-foreground">All Stories</h2>
          </div>

          {/* Filter */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setFilter('all'); setPage(1) }}
            >
              All Stories
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={filter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setFilter(cat); setPage(1) }}
              >
                {categoryLabels[cat]}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-navy"></div>
            </div>
          ) : testimonies.length === 0 ? (
            <div className="space-y-12">
              {/* Inspiring Message */}
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="mb-4 font-display text-display-xs text-foreground">
                  Stories Coming Soon
                </h2>
                <p className="text-body-lg text-muted-foreground">
                  We&apos;re collecting powerful testimonies from our community.
                  Soon this page will be filled with stories of healing, breakthrough, and transformation.
                </p>
              </div>

              {/* Preview Cards with Placeholder Images */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Healing Story Preview */}
                <Card className="overflow-hidden rounded-2xl opacity-90">
                  <div className="relative aspect-video">
                    <Image
                      src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=800"
                      alt="Healing testimony"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="mb-2 bg-green-100 text-green-800">Healing</Badge>
                      <p className="font-semibold text-white">Stories of Physical & Spiritual Healing</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-body-sm italic text-muted-foreground">
                      &ldquo;He heals the brokenhearted and binds up their wounds.&rdquo; - Psalm 147:3
                    </p>
                  </CardContent>
                </Card>

                {/* Breakthrough Story Preview */}
                <Card className="overflow-hidden rounded-2xl opacity-90">
                  <div className="relative aspect-video">
                    <Image
                      src="https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=800"
                      alt="Breakthrough testimony"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="mb-2 bg-purple-100 text-purple-800">Breakthrough</Badge>
                      <p className="font-semibold text-white">Testimonies of Divine Breakthrough</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-body-sm italic text-muted-foreground">
                      &ldquo;With God all things are possible.&rdquo; - Matthew 19:26
                    </p>
                  </CardContent>
                </Card>

                {/* Provision Story Preview */}
                <Card className="overflow-hidden rounded-2xl opacity-90">
                  <div className="relative aspect-video">
                    <Image
                      src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800"
                      alt="Provision testimony"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="mb-2 bg-blue-100 text-blue-800">Provision</Badge>
                      <p className="font-semibold text-white">Stories of God&apos;s Faithful Provision</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-body-sm italic text-muted-foreground">
                      &ldquo;My God shall supply all your need.&rdquo; - Philippians 4:19
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* CTA */}
              <div className="text-center">
                <p className="mb-4 text-muted-foreground">Have a testimony to share?</p>
                <Link href="/auth/signup">
                  <Button variant="glow">
                    Join to Share Your Story
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonies.map(testimony => (
                  <Card key={testimony.id} className="rounded-2xl border-border transition-all hover:border-gold/30 hover:shadow-lg">
                    {testimony.image_url && (
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        <Image
                          src={testimony.image_url}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="h-full w-full object-cover"
                        />
                        {testimony.video_url && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="rounded-full bg-white p-3">
                              <Play className="h-6 w-6 text-navy" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="mb-3 flex items-center justify-between">
                        {testimony.category && (
                          <Badge className={categoryColors[testimony.category]}>
                            {categoryLabels[testimony.category]}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1 text-body-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          {testimony.likes_count}
                        </span>
                      </div>

                      <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">
                        {testimony.title}
                      </h3>

                      <p className="mb-4 line-clamp-3 text-body-sm text-muted-foreground">
                        {testimony.content}
                      </p>

                      <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/10">
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
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-body-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
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

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073"
            alt="Hands raised in worship"
            fill
            className="object-cover opacity-10"
          />
        </div>

        <div className="container relative mx-auto max-w-4xl text-center">
          <Quote className="mx-auto mb-6 h-12 w-12 text-gold/50" />
          <h2 className="mb-4 font-display text-display-md text-white">
            Your Story Matters
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-body-xl text-white/50">
            Every testimony is a seed of faith that can inspire and encourage others.
            Share what God has done in your life.
          </p>
          <Link href="/auth/signup">
            <Button variant="glow" size="lg">
              Join Our Community
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

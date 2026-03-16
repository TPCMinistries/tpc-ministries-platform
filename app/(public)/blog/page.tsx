'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  ArrowRight,
  Eye,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt?: string
  featured_image_url?: string
  category: string
  author_name?: string
  author_image_url?: string
  published_at: string
  views_count: number
  is_featured: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  announcements: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  devotionals: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  'ministry-updates': 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  'event-recaps': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  testimonies: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory, page])

  useEffect(() => {
    fetchFeaturedPost()
  }, [])

  const fetchFeaturedPost = async () => {
    try {
      const res = await fetch('/api/public/blog?featured=true&limit=1')
      const data = await res.json()
      if (data.posts?.length > 0) {
        setFeaturedPost(data.posts[0])
      }
    } catch (error) {
      console.error('Error fetching featured post:', error)
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9'
      })
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const res = await fetch(`/api/public/blog?${params}`)
      const data = await res.json()
      setPosts(data.posts || [])
      setCategories(data.categories || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getReadTime = (content?: string) => {
    if (!content) return '3 min read'
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  const filteredPosts = searchQuery
    ? posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Stories &amp; Updates
          </p>
          <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
            Blog &amp; News
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            Stay updated with ministry news, devotionals, and stories of transformation.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="px-4 py-section">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-6 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-gold" />
              <h2 className="font-display text-body-lg font-semibold text-navy dark:text-white">Featured Post</h2>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-gold/30 hover:shadow-xl">
              <div className="grid md:grid-cols-2">
                {featuredPost.featured_image_url ? (
                  <div className="relative h-64 min-h-[300px] md:h-full">
                    <Image
                      src={featuredPost.featured_image_url}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                ) : (
                  <div className="flex h-64 min-h-[300px] items-center justify-center bg-gradient-to-br from-navy to-navy-800 md:h-full">
                    <Newspaper className="h-16 w-16 text-gold/50" />
                  </div>
                )}
                <div className="p-8">
                  <Badge className={categoryColors[featuredPost.category] || 'bg-secondary text-muted-foreground'}>
                    {featuredPost.category.replace('-', ' ')}
                  </Badge>
                  <h3 className="mt-4 mb-3 font-display text-display-xs text-navy dark:text-white">
                    {featuredPost.title}
                  </h3>
                  <p className="mb-4 line-clamp-3 text-body-md text-muted-foreground">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mb-6 flex items-center gap-4 text-body-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(featuredPost.published_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {featuredPost.views_count} views
                    </span>
                  </div>
                  <Link href={`/blog/${featuredPost.slug}`}>
                    <Button variant="glow">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          {/* Search and Filter */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setSelectedCategory('all'); setPage(1) }}
              >
                All Posts
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1) }}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-section">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-navy dark:border-gold"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card py-16 text-center">
              <Newspaper className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 font-display text-display-xs text-foreground">
                No Posts Found
              </h3>
              <p className="text-body-md text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Check back soon for new content'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map(post => (
                  <div key={post.id} className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-gold/30 hover:shadow-xl">
                    <Link href={`/blog/${post.slug}`}>
                      {post.featured_image_url ? (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={post.featured_image_url}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-navy/80 to-navy">
                          <Newspaper className="h-12 w-12 text-gold/50" />
                        </div>
                      )}
                    </Link>
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <Badge className={categoryColors[post.category] || 'bg-secondary text-muted-foreground'}>
                          {post.category.replace('-', ' ')}
                        </Badge>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="mb-2 font-display text-body-lg font-semibold text-navy transition-colors group-hover:text-gold dark:text-white">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="mb-4 line-clamp-2 text-body-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getReadTime(post.excerpt)}
                        </span>
                      </div>
                    </div>
                  </div>
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

      {/* Newsletter CTA */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />

        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Stay Connected
          </p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
            Never Miss an Update
          </h2>
          <p className="mb-10 text-body-xl text-white/50">
            Subscribe to receive our latest articles and ministry news directly in your inbox.
          </p>
          <Link href="/#newsletter">
            <Button variant="glow" size="xl">
              Subscribe Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

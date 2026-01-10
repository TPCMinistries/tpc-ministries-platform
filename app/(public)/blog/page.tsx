'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  news: 'bg-blue-100 text-blue-800',
  announcements: 'bg-yellow-100 text-yellow-800',
  devotionals: 'bg-purple-100 text-purple-800',
  'ministry-updates': 'bg-green-100 text-green-800',
  'event-recaps': 'bg-red-100 text-red-800',
  testimonies: 'bg-orange-100 text-orange-800'
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
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Blog & News
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stay updated with ministry news, devotionals, and stories of transformation.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="px-4 py-12 bg-gradient-to-br from-gold/10 to-amber-50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-6">
              <Newspaper className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-semibold text-navy">Featured Post</h2>
            </div>

            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                {featuredPost.featured_image_url ? (
                  <div className="relative h-64 md:h-full min-h-[300px]">
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
                  <div className="h-64 md:h-full min-h-[300px] bg-gradient-to-br from-navy to-navy-800 flex items-center justify-center">
                    <Newspaper className="h-16 w-16 text-gold/50" />
                  </div>
                )}
                <CardContent className="p-8">
                  <Badge className={categoryColors[featuredPost.category] || 'bg-gray-100 text-gray-800'}>
                    {featuredPost.category.replace('-', ' ')}
                  </Badge>
                  <h3 className="text-2xl font-bold text-navy mt-4 mb-3">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
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
                    <Button className="bg-navy hover:bg-navy/90">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Blog Posts */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                className={selectedCategory === 'all' ? 'bg-navy' : ''}
              >
                All Posts
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1) }}
                  className={selectedCategory === cat.slug ? 'bg-navy' : ''}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Posts Found
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Check back soon for new content'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <Link href={`/blog/${post.slug}`}>
                      {post.featured_image_url ? (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={post.featured_image_url}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-navy/80 to-navy flex items-center justify-center">
                          <Newspaper className="h-12 w-12 text-gold/50" />
                        </div>
                      )}
                    </Link>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={categoryColors[post.category] || 'bg-gray-100 text-gray-800'}>
                          {post.category.replace('-', ' ')}
                        </Badge>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="font-bold text-navy mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getReadTime(post.excerpt)}
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

      {/* Newsletter CTA */}
      <section className="px-4 py-16 bg-gradient-to-br from-navy to-navy-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Never Miss an Update
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Subscribe to receive our latest articles and ministry news directly in your inbox.
          </p>
          <Link href="/#newsletter">
            <Button size="lg" className="bg-gold text-navy hover:bg-gold/90">
              Subscribe Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

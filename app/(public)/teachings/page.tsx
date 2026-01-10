'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Search,
  Play,
  BookOpen,
  Headphones,
  FileText,
  Clock,
  Eye,
  Bookmark,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Video
} from 'lucide-react'

interface Teaching {
  id: string
  title: string
  content_type: string
  author: string
  description?: string
  duration_minutes?: number
  view_count: number
  content_url?: string
  thumbnail_url?: string
  is_premium?: boolean
  published_at: string
}

export default function TeachingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [teachings, setTeachings] = useState<Teaching[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchTeachings()
  }, [selectedType, selectedTopic, sortBy, page])

  const fetchTeachings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: sortBy
      })
      if (selectedType !== 'all') params.append('content_type', selectedType)
      if (selectedTopic !== 'all') params.append('topic', selectedTopic)
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/public/teachings?${params}`)
      const data = await res.json()

      setTeachings(data.teachings || [])
      setTopics(data.topics || [])
      setTypes(data.types || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching teachings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTeachings()
  }

  const contentTypes = [
    { value: 'all', label: 'All Content', icon: FileText },
    { value: 'video', label: 'Videos', icon: Play },
    { value: 'article', label: 'Articles', icon: FileText },
    { value: 'book', label: 'Books', icon: BookOpen },
    { value: 'audio', label: 'Audio', icon: Headphones },
  ]

  const getTypeIcon = (contentType: string) => {
    const icons: Record<string, React.ReactNode> = {
      video: <Play className="h-4 w-4" />,
      article: <FileText className="h-4 w-4" />,
      book: <BookOpen className="h-4 w-4" />,
      audio: <Headphones className="h-4 w-4" />,
      podcast: <Headphones className="h-4 w-4" />,
    }
    return icons[contentType] || <FileText className="h-4 w-4" />
  }

  const getTypeBadgeColor = (contentType: string) => {
    const colors: Record<string, string> = {
      video: 'bg-red-100 text-red-700',
      article: 'bg-blue-100 text-blue-700',
      book: 'bg-purple-100 text-purple-700',
      audio: 'bg-green-100 text-green-700',
      podcast: 'bg-green-100 text-green-700',
    }
    return colors[contentType] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const topicLabels: Record<string, string> = {
    faith: 'Faith',
    leadership: 'Leadership',
    prayer: 'Prayer',
    purpose: 'Purpose',
    healing: 'Healing',
    business: 'Business/Ministry',
    technology: 'AI/Technology',
    worship: 'Worship',
    discipleship: 'Discipleship',
    evangelism: 'Evangelism',
    family: 'Family',
    finances: 'Finances',
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="mb-4 font-serif text-5xl font-bold text-white md:text-6xl">
              Teachings & Resources
            </h1>
            <p className="text-xl text-gray-300">
              Transformative content for your spiritual growth
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search teachings, topics, speakers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg border-0 shadow-lg"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-8">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                {/* Content Type Filter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-navy">Content Type</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contentTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => { setSelectedType(type.value); setPage(1) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedType === type.value
                            ? 'bg-navy text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Topics Filter */}
                {topics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-navy">Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <button
                        onClick={() => { setSelectedTopic('all'); setPage(1) }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedTopic === 'all'
                            ? 'bg-gold text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        All Topics
                      </button>
                      {topics.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => { setSelectedTopic(topic); setPage(1) }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedTopic === topic
                              ? 'bg-gold text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {topicLabels[topic] || topic}
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>

            {/* Mobile Filter Panel */}
            {showFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-navy">Filters</h3>
                    <button onClick={() => setShowFilters(false)}>
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-navy mb-3">Content Type</h4>
                      <div className="space-y-2">
                        {contentTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => { setSelectedType(type.value); setPage(1) }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              selectedType === type.value
                                ? 'bg-navy text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {topics.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-navy mb-3">Topics</h4>
                        <div className="space-y-1">
                          <button
                            onClick={() => { setSelectedTopic('all'); setPage(1) }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              selectedTopic === 'all'
                                ? 'bg-gold text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            All Topics
                          </button>
                          {topics.map((topic) => (
                            <button
                              key={topic}
                              onClick={() => { setSelectedTopic(topic); setPage(1) }}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                selectedTopic === topic
                                  ? 'bg-gold text-white'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {topicLabels[topic] || topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => setShowFilters(false)}
                    className="w-full mt-6 bg-navy hover:bg-navy/90"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile Filter Button */}
            <div className="lg:hidden fixed bottom-4 right-4 z-40">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-full h-14 w-14 bg-navy hover:bg-navy/90 shadow-lg"
              >
                <Filter className="h-6 w-6" />
              </Button>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-navy">
                  {loading ? 'Loading...' : `${total} ${total === 1 ? 'Result' : 'Results'}`}
                </h2>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
                </div>
              ) : teachings.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Video className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No teachings found</p>
                    <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search query</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedType('all')
                        setSelectedTopic('all')
                        setSearchQuery('')
                        setPage(1)
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {teachings.map((teaching) => (
                      <Link key={teaching.id} href={`/teachings/${teaching.id}`}>
                        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full cursor-pointer">
                          <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-navy/80 to-navy">
                            {teaching.thumbnail_url ? (
                              <img
                                src={teaching.thumbnail_url}
                                alt={teaching.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {teaching.content_type === 'video' && <Play className="h-12 w-12 text-gold/50" />}
                                {teaching.content_type === 'audio' && <Headphones className="h-12 w-12 text-gold/50" />}
                                {teaching.content_type === 'podcast' && <Headphones className="h-12 w-12 text-gold/50" />}
                                {teaching.content_type === 'article' && <FileText className="h-12 w-12 text-gold/50" />}
                                {teaching.content_type === 'book' && <BookOpen className="h-12 w-12 text-gold/50" />}
                                {!['video', 'audio', 'podcast', 'article', 'book'].includes(teaching.content_type) && <Play className="h-12 w-12 text-gold/50" />}
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  // Handle bookmark
                                }}
                                className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                              >
                                <Bookmark className="h-4 w-4 text-navy" />
                              </button>
                            </div>
                            <div className="absolute bottom-3 left-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeBadgeColor(teaching.content_type)}`}>
                                {getTypeIcon(teaching.content_type)}
                                {teaching.content_type.charAt(0).toUpperCase() + teaching.content_type.slice(1)}
                              </span>
                            </div>
                            {teaching.is_premium && (
                              <div className="absolute top-3 left-3">
                                <span className="px-2 py-1 bg-gold text-navy text-xs font-bold rounded">
                                  PREMIUM
                                </span>
                              </div>
                            )}
                          </div>

                          <CardHeader>
                            <CardTitle className="text-lg text-navy group-hover:text-gold transition-colors line-clamp-2">
                              {teaching.title}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600">
                              By {teaching.author || 'TPC Ministries'}
                            </CardDescription>
                          </CardHeader>

                          <CardContent>
                            {teaching.description && (
                              <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                                {teaching.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              {teaching.duration_minutes && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {teaching.duration_minutes} min
                                </div>
                              )}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {teaching.view_count || 0}
                                </div>
                                <span>{formatDate(teaching.published_at)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
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
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-gold/10 to-amber-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Want Access to Premium Content?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community to unlock exclusive teachings, courses, and resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-navy hover:bg-navy/90">
                Create Free Account
              </Button>
            </Link>
            <Link href="/partner">
              <Button size="lg" variant="outline">
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

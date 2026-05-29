'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
  Video,
  ArrowRight
} from 'lucide-react'
import { ScrollReveal } from '@/components/motion/scroll-reveal'

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
      video: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
      article: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      book: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      audio: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
      podcast: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    }
    return colors[contentType] || 'bg-secondary text-muted-foreground'
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
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <ScrollReveal>
            <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
              The Word, Released
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
              Teachings of the<br />Prophet.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mx-auto max-w-2xl text-body-xl text-white/70">
              Messages, prophecy, and equipping — preached, written, recorded.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </ScrollReveal>

          {/* Search Bar */}
          <ScrollReveal delay={0.4}>
            <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search teachings, topics, speakers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 border-white/10 bg-white/10 pl-12 text-lg text-white placeholder:text-white/40 backdrop-blur-sm focus:border-gold/50 focus:bg-white/15"
                />
              </div>
            </form>
          </ScrollReveal>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Main Content */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-8">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden w-64 flex-shrink-0 lg:block">
              <div className="sticky top-4 space-y-6">
                {/* Content Type Filter */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="mb-4 font-display text-body-md font-semibold text-navy dark:text-white">Content Type</h3>
                  <div className="space-y-2">
                    {contentTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => { setSelectedType(type.value); setPage(1) }}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-body-sm transition-colors ${
                          selectedType === type.value
                            ? 'bg-navy text-white dark:bg-gold dark:text-navy-950'
                            : 'text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topics Filter */}
                {topics.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-display text-body-md font-semibold text-navy dark:text-white">Topics</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => { setSelectedTopic('all'); setPage(1) }}
                        className={`w-full rounded-xl px-3 py-2 text-left text-body-sm transition-colors ${
                          selectedTopic === 'all'
                            ? 'bg-gold text-navy-950'
                            : 'text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        All Topics
                      </button>
                      {topics.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => { setSelectedTopic(topic); setPage(1) }}
                          className={`w-full rounded-xl px-3 py-2 text-left text-body-sm transition-colors ${
                            selectedTopic === topic
                              ? 'bg-gold text-navy-950'
                              : 'text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          {topicLabels[topic] || topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Mobile Filter Panel */}
            {showFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                <div className="absolute bottom-0 right-0 top-0 w-80 overflow-y-auto bg-background p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-display text-display-xs text-navy dark:text-white">Filters</h3>
                    <button onClick={() => setShowFilters(false)}>
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-3 font-display text-body-md font-semibold text-navy dark:text-white">Content Type</h4>
                      <div className="space-y-2">
                        {contentTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => { setSelectedType(type.value); setPage(1) }}
                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-body-sm transition-colors ${
                              selectedType === type.value
                                ? 'bg-navy text-white dark:bg-gold dark:text-navy-950'
                                : 'text-muted-foreground hover:bg-secondary'
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
                        <h4 className="mb-3 font-display text-body-md font-semibold text-navy dark:text-white">Topics</h4>
                        <div className="space-y-1">
                          <button
                            onClick={() => { setSelectedTopic('all'); setPage(1) }}
                            className={`w-full rounded-xl px-3 py-2 text-left text-body-sm transition-colors ${
                              selectedTopic === 'all'
                                ? 'bg-gold text-navy-950'
                                : 'text-muted-foreground hover:bg-secondary'
                            }`}
                          >
                            All Topics
                          </button>
                          {topics.map((topic) => (
                            <button
                              key={topic}
                              onClick={() => { setSelectedTopic(topic); setPage(1) }}
                              className={`w-full rounded-xl px-3 py-2 text-left text-body-sm transition-colors ${
                                selectedTopic === topic
                                  ? 'bg-gold text-navy-950'
                                  : 'text-muted-foreground hover:bg-secondary'
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
                    variant="glow"
                    className="mt-6 w-full"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile Filter Button */}
            <div className="fixed bottom-4 right-4 z-40 lg:hidden">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="glow"
                className="h-14 w-14 rounded-full shadow-lg"
              >
                <Filter className="h-6 w-6" />
              </Button>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-display-xs text-navy dark:text-white">
                  {loading ? 'Loading...' : `${total} ${total === 1 ? 'Result' : 'Results'}`}
                </h2>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-body-sm text-foreground"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {loading ? (
                <div className="flex justify-center py-section">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-navy dark:border-gold"></div>
                </div>
              ) : teachings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
                  <Video className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-body-lg text-foreground">No teachings found</p>
                  <p className="mb-6 text-body-sm text-muted-foreground">Try adjusting your filters or search query</p>
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
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {teachings.map((teaching) => (
                      <Link key={teaching.id} href={`/teachings/${teaching.id}`}>
                        <div className="group h-full cursor-pointer overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-gold/30 hover:shadow-xl">
                          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-navy/80 to-navy">
                            {teaching.thumbnail_url ? (
                              <img
                                src={teaching.thumbnail_url}
                                alt={teaching.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                {teaching.content_type === 'video' && <Play className="h-12 w-12 text-gold/50" />}
                                {teaching.content_type === 'audio' && <Headphones className="h-12 w-12 text-gold/50" />}
                                {teaching.content_type === 'podcast' && <Headphones className="h-12 w-12 text-gold/50" />}
                                {teaching.content_type === 'article' && <FileText className="h-12 w-12 text-gold/50" />}
                                {teaching.content_type === 'book' && <BookOpen className="h-12 w-12 text-gold/50" />}
                                {!['video', 'audio', 'podcast', 'article', 'book'].includes(teaching.content_type) && <Play className="h-12 w-12 text-gold/50" />}
                              </div>
                            )}
                            <div className="absolute right-3 top-3">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  // Handle bookmark
                                }}
                                className="rounded-full bg-white/90 p-2 shadow-lg transition-colors hover:bg-white"
                              >
                                <Bookmark className="h-4 w-4 text-navy" />
                              </button>
                            </div>
                            <div className="absolute bottom-3 left-3">
                              <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getTypeBadgeColor(teaching.content_type)}`}>
                                {getTypeIcon(teaching.content_type)}
                                {teaching.content_type.charAt(0).toUpperCase() + teaching.content_type.slice(1)}
                              </span>
                            </div>
                            {teaching.is_premium && (
                              <div className="absolute left-3 top-3">
                                <span className="rounded bg-gold px-2 py-1 text-xs font-bold text-navy">
                                  PREMIUM
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-6">
                            <h3 className="mb-1 font-display text-body-lg font-semibold text-navy transition-colors group-hover:text-gold dark:text-white dark:group-hover:text-gold">
                              {teaching.title}
                            </h3>
                            <p className="mb-3 text-body-sm text-muted-foreground">
                              By {teaching.author || 'TPC Ministries'}
                            </p>

                            {teaching.description && (
                              <p className="mb-4 line-clamp-2 text-body-sm text-muted-foreground">
                                {teaching.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-body-sm text-muted-foreground">
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
                          </div>
                        </div>
                      </Link>
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
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />

        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Go Deeper
          </p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
            Want Access to Premium Content?
          </h2>
          <p className="mb-10 text-body-xl text-white/50">
            Join the community for teachings, courses, and resources that support lasting growth.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/signup">
              <Button variant="glow" size="xl">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/partners">
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-gold/30 text-white hover:bg-gold/10"
              >
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

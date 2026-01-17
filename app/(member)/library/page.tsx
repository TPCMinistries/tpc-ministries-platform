'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BookOpen,
  Video,
  Headphones,
  FileText,
  Clock,
  Play,
  Search,
  Check,
  Download,
  Lock,
  Crown,
  Library,
  Loader2,
  Sparkles,
  TrendingUp,
  Filter,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Eye,
  ArrowUpDown,
  Flame,
  Calendar,
  ListVideo,
  X,
  ExternalLink,
  Share2,
  Info
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface LibraryItem {
  id: string
  title: string
  description?: string
  author?: string
  type: 'video' | 'audio' | 'article' | 'ebook' | 'sermon'
  source: 'teaching' | 'resource' | 'sermon'
  thumbnail_url?: string
  duration_minutes?: number
  tier_required: string
  has_access: boolean
  progress_percent?: number
  completed?: boolean
  download_count?: number
  view_count?: number
  sermon_date?: string
  series_name?: string
  tags?: string[]
  created_at: string
  in_watchlist?: boolean
  href: string
}

interface Series {
  name: string
  count: number
  thumbnail?: string
  type?: string
  items: LibraryItem[]
}

interface Stats {
  total: number
  videos: number
  audio: number
  ebooks: number
  inProgress: number
  watchlist: number
}

interface Sections {
  continueWatching: LibraryItem[]
  recentlyAdded: LibraryItem[]
  featured: LibraryItem[]
  popular: LibraryItem[]
}

const TABS = [
  { value: 'all', label: 'All', icon: Library },
  { value: 'videos', label: 'Videos', icon: Video },
  { value: 'audio', label: 'Audio', icon: Headphones },
  { value: 'ebooks', label: 'Ebooks', icon: BookOpen },
  { value: 'watchlist', label: 'My List', icon: Bookmark },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'duration-short', label: 'Shortest First' },
  { value: 'duration-long', label: 'Longest First' },
]

export default function UnifiedLibraryPage() {
  const [content, setContent] = useState<LibraryItem[]>([])
  const [sections, setSections] = useState<Sections>({
    continueWatching: [],
    recentlyAdded: [],
    featured: [],
    popular: []
  })
  const [series, setSeries] = useState<Series[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, videos: 0, audio: 0, ebooks: 0, inProgress: 0, watchlist: 0 })
  const [memberTier, setMemberTier] = useState('free')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedSeries, setSelectedSeries] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showBrowseAll, setShowBrowseAll] = useState(false)
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null)

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchLibrary()
  }, [activeTab, selectedTag, selectedSeries, sortBy])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchLibrary()
    }, 300)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const fetchLibrary = async () => {
    try {
      const params = new URLSearchParams()
      params.set('tab', activeTab)
      params.set('sort', sortBy)
      if (searchQuery) params.set('search', searchQuery)
      if (selectedTag) params.set('tag', selectedTag)
      if (selectedSeries) params.set('series', selectedSeries)

      const response = await fetch(`/api/library?${params}`)
      const result = await response.json()

      if (response.ok) {
        setContent(result.data || [])
        setSections(result.sections || { continueWatching: [], recentlyAdded: [], featured: [], popular: [] })
        setSeries(result.series || [])
        setStats(result.stats || { total: 0, videos: 0, audio: 0, ebooks: 0, inProgress: 0, watchlist: 0 })
        setAvailableTags(result.tags || [])
        setMemberTier(result.member_tier || 'free')
      }
    } catch (error) {
      console.error('Error fetching library:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWatchlist = async (item: LibraryItem, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await fetch('/api/library/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: item.id,
          content_type: item.source,
          action: item.in_watchlist ? 'remove' : 'add'
        })
      })

      if (response.ok) {
        // Update local state
        setContent(prev => prev.map(c =>
          c.id === item.id && c.source === item.source
            ? { ...c, in_watchlist: !c.in_watchlist }
            : c
        ))
        setSections(prev => ({
          ...prev,
          continueWatching: prev.continueWatching.map(c =>
            c.id === item.id && c.source === item.source ? { ...c, in_watchlist: !c.in_watchlist } : c
          ),
          recentlyAdded: prev.recentlyAdded.map(c =>
            c.id === item.id && c.source === item.source ? { ...c, in_watchlist: !c.in_watchlist } : c
          ),
          featured: prev.featured.map(c =>
            c.id === item.id && c.source === item.source ? { ...c, in_watchlist: !c.in_watchlist } : c
          ),
          popular: prev.popular.map(c =>
            c.id === item.id && c.source === item.source ? { ...c, in_watchlist: !c.in_watchlist } : c
          ),
        }))
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'sermon':
        return Video
      case 'audio':
        return Headphones
      case 'ebook':
        return BookOpen
      case 'article':
        return FileText
      default:
        return BookOpen
    }
  }

  const getDefaultThumbnail = (type: string) => {
    switch (type) {
      case 'video':
      case 'sermon':
        return '/images/hero/lorenzo-speaking.png'
      case 'ebook':
        return '/images/team/lorenzo-about.png'
      case 'audio':
        return '/images/team/lorenzo-ministry.jpg'
      case 'article':
        return '/images/team/lorenzo-about.png'
      default:
        return '/images/logos/logo-gold.png'
    }
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'free': return 'Free'
      case 'member': return 'Member'
      case 'partner': return 'Partner'
      case 'covenant': return 'Covenant'
      default: return tier
    }
  }

  const clearFilters = () => {
    setSelectedTag('')
    setSelectedSeries('')
    setSearchQuery('')
    setSortBy('newest')
  }

  const hasActiveFilters = selectedTag || selectedSeries || searchQuery || sortBy !== 'newest'

  // Horizontal scroll content card
  const ContentCard = ({ item, size = 'normal' }: { item: LibraryItem; size?: 'normal' | 'large' }) => {
    const Icon = getContentIcon(item.type)
    const isLocked = !item.has_access

    return (
      <Link href={isLocked ? '/partner' : item.href}>
        <Card className={`overflow-hidden transition-all hover:shadow-lg cursor-pointer bg-white dark:bg-gray-800 border-0 shadow-sm group ${
          size === 'large' ? 'w-72' : 'w-56'
        } flex-shrink-0`}>
          <div className={`relative ${size === 'large' ? 'aspect-video' : 'aspect-[4/3]'} bg-gray-100 dark:bg-gray-700`}>
            <Image
              src={item.thumbnail_url || getDefaultThumbnail(item.type)}
              alt={item.title}
              fill
              className="object-cover"
            />

            {/* Progress bar */}
            {item.progress_percent !== undefined && item.progress_percent > 0 && (
              <div className="absolute bottom-0 left-0 right-0">
                <div className="h-1 bg-black/30">
                  <div
                    className="h-full bg-gold"
                    style={{ width: `${item.progress_percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Completed badge */}
            {item.completed && (
              <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}

            {/* Locked overlay */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-navy" />
                  <span className="text-sm font-medium text-navy dark:text-white">
                    {getTierLabel(item.tier_required)}
                  </span>
                </div>
              </div>
            )}

            {/* Play button overlay */}
            {(item.type === 'video' || item.type === 'sermon') && !isLocked && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play className="h-5 w-5 text-navy ml-0.5" />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setPreviewItem(item)
                }}
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <Info className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={(e) => toggleWatchlist(item, e)}
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                {item.in_watchlist ? (
                  <BookmarkCheck className="h-4 w-4 text-gold" />
                ) : (
                  <Bookmark className="h-4 w-4 text-white" />
                )}
              </button>
            </div>

            {/* Type badge */}
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-navy/80 text-white border-0 text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Badge>
            </div>
          </div>

          <CardContent className="p-3">
            <h3 className="font-semibold text-sm text-navy dark:text-white line-clamp-2 mb-1">
              {item.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="truncate">{item.author}</span>
              {item.duration_minutes && (
                <span className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <Clock className="h-3 w-3" />
                  {item.duration_minutes}m
                </span>
              )}
            </div>
            {item.progress_percent !== undefined && item.progress_percent > 0 && !item.completed && (
              <p className="text-xs text-gold mt-1">{item.progress_percent}% complete</p>
            )}
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Horizontal scroll section
  const HorizontalSection = ({
    title,
    icon: Icon,
    items,
    showViewAll,
    viewAllHref,
    emptyMessage,
    size = 'normal'
  }: {
    title: string
    icon: any
    items: LibraryItem[]
    showViewAll?: boolean
    viewAllHref?: string
    emptyMessage?: string
    size?: 'normal' | 'large'
  }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const checkScroll = useCallback(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }, [])

    useEffect(() => {
      checkScroll()
      const ref = scrollRef.current
      if (ref) {
        ref.addEventListener('scroll', checkScroll)
        return () => ref.removeEventListener('scroll', checkScroll)
      }
    }, [items, checkScroll])

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = direction === 'left' ? -300 : 300
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }

    if (items.length === 0) {
      if (emptyMessage) {
        return (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Icon className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-semibold text-navy dark:text-white">{title}</h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{emptyMessage}</p>
          </div>
        )
      }
      return null
    }

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold text-navy dark:text-white">{title}</h2>
            <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
              {items.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {canScrollLeft && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-gray-300 dark:border-gray-600"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {canScrollRight && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-gray-300 dark:border-gray-600"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {showViewAll && viewAllHref && (
              <Link href={viewAllHref}>
                <Button variant="ghost" size="sm" className="text-navy dark:text-gold">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <ContentCard key={`${item.source}-${item.id}`} item={item} size={size} />
          ))}
        </div>
      </div>
    )
  }

  // Series Card
  const SeriesCard = ({ series: s }: { series: Series }) => (
    <button
      onClick={() => {
        setSelectedSeries(s.name)
        setShowBrowseAll(true)
      }}
      className="flex-shrink-0 w-48 group"
    >
      <Card className="overflow-hidden transition-all hover:shadow-lg bg-white dark:bg-gray-800 border-0 shadow-sm">
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
          <Image
            src={s.thumbnail || getDefaultThumbnail(s.type || 'video')}
            alt={s.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-semibold text-white text-sm line-clamp-2">{s.name}</h3>
            <p className="text-xs text-white/70 mt-1">{s.count} {s.count === 1 ? 'item' : 'items'}</p>
          </div>
          <div className="absolute top-2 right-2">
            <Badge className="bg-navy/80 text-white border-0 text-xs">
              <ListVideo className="h-3 w-3 mr-1" />
              Series
            </Badge>
          </div>
        </div>
      </Card>
    </button>
  )

  // Grid content card for browse all view
  const GridCard = ({ item }: { item: LibraryItem }) => {
    const Icon = getContentIcon(item.type)
    const isLocked = !item.has_access

    return (
      <Link href={isLocked ? '/partner' : item.href}>
        <Card className="overflow-hidden transition-all hover:shadow-xl cursor-pointer h-full bg-white dark:bg-gray-800 border-0 shadow-sm group">
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
            <Image
              src={item.thumbnail_url || getDefaultThumbnail(item.type)}
              alt={item.title}
              fill
              className="object-cover"
            />

            {/* Progress bar */}
            {item.progress_percent !== undefined && item.progress_percent > 0 && (
              <div className="absolute bottom-0 left-0 right-0">
                <div className="h-1 bg-black/30">
                  <div className="h-full bg-gold" style={{ width: `${item.progress_percent}%` }} />
                </div>
              </div>
            )}

            {/* Completed badge */}
            {item.completed && (
              <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}

            {/* Locked overlay */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white/95 dark:bg-gray-800/95 rounded-xl px-4 py-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-navy" />
                  <span className="text-sm font-medium text-navy dark:text-white">
                    {getTierLabel(item.tier_required)} Only
                  </span>
                </div>
              </div>
            )}

            {/* Type badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-navy/80 text-white border-0">
                <Icon className="h-3 w-3 mr-1" />
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Badge>
            </div>

            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setPreviewItem(item)
                }}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <Info className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={(e) => toggleWatchlist(item, e)}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                {item.in_watchlist ? (
                  <BookmarkCheck className="h-4 w-4 text-gold" />
                ) : (
                  <Bookmark className="h-4 w-4 text-white" />
                )}
              </button>
            </div>

            {/* Tier badge */}
            {item.tier_required !== 'free' && !item.completed && !isLocked && (
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-gold text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  {getTierLabel(item.tier_required)}
                </Badge>
              </div>
            )}

            {/* Play button for videos */}
            {(item.type === 'video' || item.type === 'sermon') && !isLocked && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
                  <Play className="h-7 w-7 text-navy ml-1" />
                </div>
              </div>
            )}
          </div>

          <CardHeader className="pb-2">
            <CardTitle className="text-base line-clamp-2 text-navy dark:text-white">{item.title}</CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span className="truncate">{item.author}</span>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                {item.view_count !== undefined && item.view_count > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <Eye className="h-3 w-3" />
                    {item.view_count}
                  </span>
                )}
                {item.duration_minutes && (
                  <span className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {item.duration_minutes}m
                  </span>
                )}
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {item.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.series_name && (
                  <Badge variant="outline" className="text-xs border-navy/30 text-navy dark:border-gold/30 dark:text-gold">
                    {item.series_name}
                  </Badge>
                )}
              </div>
              {item.progress_percent !== undefined && item.progress_percent > 0 && !item.completed && (
                <span className="text-xs font-medium text-gold">{item.progress_percent}%</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-navy dark:text-gold mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy via-navy-800 to-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                  <Library className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <p className="text-gold text-sm">Grow in Knowledge</p>
                  <h1 className="text-3xl font-bold">Content Library</h1>
                </div>
              </div>
              <p className="text-white/70 mt-2 max-w-md">
                Teachings, sermons, and resources from Prophet Lorenzo to deepen your faith journey.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gold">{stats.total}</p>
                <p className="text-xs text-white/70">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.videos}</p>
                <p className="text-xs text-white/70">Videos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.ebooks}</p>
                <p className="text-xs text-white/70">Ebooks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                <p className="text-xs text-white/70">In Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Show either curated sections or browse all */}
        {!showBrowseAll && !searchQuery && !hasActiveFilters ? (
          <>
            {/* Continue Watching */}
            <HorizontalSection
              title="Continue Watching"
              icon={Play}
              items={sections.continueWatching}
              emptyMessage="Start watching something to see your progress here."
              size="large"
            />

            {/* Featured Content */}
            {sections.featured.length > 0 && (
              <HorizontalSection
                title="Featured"
                icon={Sparkles}
                items={sections.featured}
                size="large"
              />
            )}

            {/* Series/Collections */}
            {series.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <ListVideo className="h-5 w-5 text-gold" />
                  <h2 className="text-lg font-semibold text-navy dark:text-white">Teaching Series</h2>
                  <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                    {series.length}
                  </Badge>
                </div>
                <div
                  className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {series.map((s) => (
                    <SeriesCard key={s.name} series={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Recently Added */}
            <HorizontalSection
              title="Recently Added"
              icon={Calendar}
              items={sections.recentlyAdded}
            />

            {/* Popular */}
            <HorizontalSection
              title="Popular"
              icon={Flame}
              items={sections.popular}
            />

            {/* Browse All Button */}
            <div className="text-center mt-8">
              <Button
                size="lg"
                onClick={() => setShowBrowseAll(true)}
                className="bg-navy hover:bg-navy/90 text-white"
              >
                <Library className="h-5 w-5 mr-2" />
                Browse All Content
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Back button when browsing all */}
            {showBrowseAll && !searchQuery && !hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  setShowBrowseAll(false)
                  clearFilters()
                }}
                className="mb-4 text-navy dark:text-gold"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Button>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm mb-6">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const count = tab.value === 'all' ? stats.total :
                             tab.value === 'videos' ? stats.videos :
                             tab.value === 'audio' ? stats.audio :
                             tab.value === 'ebooks' ? stats.ebooks :
                             stats.watchlist
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      activeTab === tab.value
                        ? 'bg-navy text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-navy dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="text-xs opacity-80">({count})</span>
                  </button>
                )
              })}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {availableTags.length > 0 && (
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-[160px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="text-gray-500">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filters */}
            {(selectedTag || selectedSeries) && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-gray-600 dark:text-gray-400">Filtered by:</span>
                {selectedSeries && (
                  <Badge className="bg-navy text-white border-0 gap-1">
                    <ListVideo className="h-3 w-3" />
                    {selectedSeries}
                    <button onClick={() => setSelectedSeries('')} className="ml-1 hover:text-gold">×</button>
                  </Badge>
                )}
                {selectedTag && (
                  <Badge className="bg-gold text-white border-0 gap-1">
                    {selectedTag}
                    <button onClick={() => setSelectedTag('')} className="ml-1 hover:text-navy">×</button>
                  </Badge>
                )}
              </div>
            )}

            {/* Content Grid */}
            {content.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-navy/10 dark:bg-gold/10 mx-auto mb-6 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-navy dark:text-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-navy dark:text-white">
                    {activeTab === 'watchlist'
                      ? 'Your Watchlist is Empty'
                      : searchQuery
                      ? 'No Results Found'
                      : 'No Content Available'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    {activeTab === 'watchlist'
                      ? 'Save content to your watchlist by clicking the bookmark icon.'
                      : searchQuery
                      ? 'Try a different search term or remove filters.'
                      : 'New content will appear here soon.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {content.map((item) => (
                  <GridCard key={`${item.source}-${item.id}`} item={item} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Upgrade Banner for Free Users */}
        {memberTier === 'free' && (
          <Card className="bg-gradient-to-r from-navy to-navy-800 text-white border-0 shadow-xl overflow-hidden relative mt-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <CardContent className="flex flex-col md:flex-row items-center justify-between py-8 gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-7 w-7 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Unlock All Content</h3>
                  <p className="text-white/70">
                    Become a Partner to access exclusive teachings, ebooks, and resources.
                  </p>
                </div>
              </div>
              <Link href="/partner">
                <Button size="lg" className="bg-gold hover:bg-gold-dark text-white shadow-lg gap-2">
                  <Crown className="h-5 w-5" />
                  Become a Partner
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {previewItem && (
            <>
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden -mt-2">
                <Image
                  src={previewItem.thumbnail_url || getDefaultThumbnail(previewItem.type)}
                  alt={previewItem.title}
                  fill
                  className="object-cover"
                />
                {/* Progress bar */}
                {previewItem.progress_percent !== undefined && previewItem.progress_percent > 0 && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="h-1.5 bg-black/30">
                      <div className="h-full bg-gold" style={{ width: `${previewItem.progress_percent}%` }} />
                    </div>
                  </div>
                )}
                {/* Type badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-navy/80 text-white border-0">
                    {(() => {
                      const Icon = getContentIcon(previewItem.type)
                      return <Icon className="h-3 w-3 mr-1" />
                    })()}
                    {previewItem.type.charAt(0).toUpperCase() + previewItem.type.slice(1)}
                  </Badge>
                </div>
                {/* Tier badge */}
                {previewItem.tier_required !== 'free' && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gold text-white border-0">
                      <Crown className="h-3 w-3 mr-1" />
                      {getTierLabel(previewItem.tier_required)}
                    </Badge>
                  </div>
                )}
              </div>

              <DialogHeader className="mt-4">
                <DialogTitle className="text-xl text-navy dark:text-white">
                  {previewItem.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4 text-sm">
                  <span>{previewItem.author}</span>
                  {previewItem.duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {previewItem.duration_minutes} min
                    </span>
                  )}
                  {previewItem.view_count !== undefined && previewItem.view_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {previewItem.view_count} views
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              {previewItem.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {previewItem.description}
                </p>
              )}

              {/* Tags and Series */}
              <div className="flex flex-wrap gap-2 mt-4">
                {previewItem.series_name && (
                  <Badge variant="outline" className="border-navy/30 text-navy dark:border-gold/30 dark:text-gold">
                    <ListVideo className="h-3 w-3 mr-1" />
                    {previewItem.series_name}
                  </Badge>
                )}
                {previewItem.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-gray-600 dark:text-gray-400">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Progress info */}
              {previewItem.progress_percent !== undefined && previewItem.progress_percent > 0 && (
                <div className="mt-4 p-3 bg-gold/10 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gold font-medium">
                      {previewItem.completed ? 'Completed' : `${previewItem.progress_percent}% complete`}
                    </span>
                    {!previewItem.completed && (
                      <span className="text-gray-500">
                        Continue where you left off
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                {previewItem.has_access ? (
                  <Link href={previewItem.href} className="flex-1">
                    <Button className="w-full bg-navy hover:bg-navy/90 text-white" size="lg">
                      {previewItem.type === 'video' || previewItem.type === 'sermon' ? (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          {previewItem.progress_percent ? 'Continue Watching' : 'Watch Now'}
                        </>
                      ) : previewItem.type === 'audio' ? (
                        <>
                          <Headphones className="h-5 w-5 mr-2" />
                          {previewItem.progress_percent ? 'Continue Listening' : 'Listen Now'}
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-5 w-5 mr-2" />
                          {previewItem.progress_percent ? 'Continue Reading' : 'Read Now'}
                        </>
                      )}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/partner" className="flex-1">
                    <Button className="w-full bg-gold hover:bg-gold-dark text-white" size="lg">
                      <Lock className="h-5 w-5 mr-2" />
                      Unlock with {getTierLabel(previewItem.tier_required)}
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={(e) => toggleWatchlist(previewItem, e)}
                  className="border-gray-300 dark:border-gray-600"
                >
                  {previewItem.in_watchlist ? (
                    <BookmarkCheck className="h-5 w-5 text-gold" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

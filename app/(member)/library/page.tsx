'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  BookMarked,
  Filter
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
  sermon_date?: string
  series_name?: string
  tags?: string[]
  created_at: string
  href: string
}

interface Stats {
  total: number
  videos: number
  audio: number
  ebooks: number
  inProgress: number
}

const TABS = [
  { value: 'all', label: 'All', icon: Library },
  { value: 'videos', label: 'Videos', icon: Video },
  { value: 'audio', label: 'Audio', icon: Headphones },
  { value: 'ebooks', label: 'Ebooks', icon: BookOpen },
  { value: 'progress', label: 'My Progress', icon: TrendingUp },
]

export default function UnifiedLibraryPage() {
  const [content, setContent] = useState<LibraryItem[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, videos: 0, audio: 0, ebooks: 0, inProgress: 0 })
  const [memberTier, setMemberTier] = useState('free')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState('')

  useEffect(() => {
    fetchLibrary()
  }, [activeTab, selectedTag])

  const fetchLibrary = async () => {
    try {
      const params = new URLSearchParams()
      params.set('tab', activeTab)
      if (searchQuery) params.set('search', searchQuery)
      if (selectedTag) params.set('tag', selectedTag)

      const response = await fetch(`/api/library?${params}`)
      const result = await response.json()

      if (response.ok) {
        setContent(result.data || [])
        setStats(result.stats || { total: 0, videos: 0, audio: 0, ebooks: 0, inProgress: 0 })
        setAvailableTags(result.tags || [])
        setMemberTier(result.member_tier || 'free')
      }
    } catch (error) {
      console.error('Error fetching library:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchLibrary()
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

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'video':
        return 'from-red-400 to-rose-500'
      case 'sermon':
        return 'from-indigo-400 to-purple-500'
      case 'audio':
        return 'from-violet-400 to-purple-500'
      case 'ebook':
        return 'from-emerald-400 to-green-500'
      case 'article':
        return 'from-blue-400 to-cyan-500'
      default:
        return 'from-gray-400 to-slate-500'
    }
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'Free'
      case 'member':
        return 'Member'
      case 'partner':
        return 'Partner'
      case 'covenant':
        return 'Covenant'
      default:
        return tier
    }
  }

  const filteredContent = content.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Library className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-purple-200">Grow in Knowledge</p>
                    <h1 className="text-3xl font-bold">Content Library</h1>
                  </div>
                </div>
                <p className="text-purple-200 mt-2 max-w-md">
                  Discover teachings, sermons, ebooks, and resources to deepen your faith journey.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Library className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Videos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.videos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 flex items-center justify-center">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Audio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.audio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ebooks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ebooks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-xl shadow-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const count = tab.value === 'all' ? stats.total :
                         tab.value === 'videos' ? stats.videos :
                         tab.value === 'audio' ? stats.audio :
                         tab.value === 'ebooks' ? stats.ebooks :
                         stats.inProgress
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.value
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm"
            />
          </div>
          {availableTags.length > 0 && (
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[180px] bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
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
        </div>

        {/* Active Tag Filter Badge */}
        {selectedTag && selectedTag !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filtered by:</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 gap-1">
              {selectedTag}
              <button
                onClick={() => setSelectedTag('')}
                className="ml-1 hover:text-purple-200"
              >
                ×
              </button>
            </Badge>
          </div>
        )}

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {activeTab === 'progress'
                  ? 'No Content In Progress'
                  : searchQuery
                  ? 'No Results Found'
                  : 'No Content Available'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {activeTab === 'progress'
                  ? 'Start watching or reading something to track your progress here.'
                  : searchQuery
                  ? 'Try a different search term or remove filters.'
                  : 'New content will appear here soon.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent.map((item) => {
              const Icon = getContentIcon(item.type)
              const isLocked = !item.has_access
              const gradient = getTypeGradient(item.type)

              return (
                <Link key={`${item.source}-${item.id}`} href={isLocked ? '/partner' : item.href}>
                  <Card className={`overflow-hidden transition-all hover:shadow-xl cursor-pointer h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 ${
                    isLocked ? 'opacity-90' : ''
                  }`}>
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                      {item.thumbnail_url ? (
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`rounded-full bg-gradient-to-r ${gradient} p-6 shadow-lg`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Progress bar */}
                      {item.progress_percent !== undefined && item.progress_percent > 0 && (
                        <div className="absolute bottom-0 left-0 right-0">
                          <div className="h-1 bg-black/20">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                              style={{ width: `${item.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Completed badge */}
                      {item.completed && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full p-1.5 shadow-lg">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}

                      {/* Locked overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <div className="bg-white/95 dark:bg-slate-800/95 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
                            <Lock className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {getTierLabel(item.tier_required)} Only
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Type badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className={`bg-gradient-to-r ${gradient} text-white border-0 shadow-md`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>
                      </div>

                      {/* Tier badge for premium content */}
                      {item.tier_required !== 'free' && !item.completed && !isLocked && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-md">
                            <Crown className="h-3 w-3 mr-1" />
                            {getTierLabel(item.tier_required)}
                          </Badge>
                        </div>
                      )}

                      {/* Play button for videos */}
                      {(item.type === 'video' || item.type === 'sermon') && !isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                          <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform">
                            <Play className="h-7 w-7 text-purple-600 ml-1" />
                          </div>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-2 text-gray-900 dark:text-white">{item.title}</CardTitle>
                      {item.author && (
                        <CardDescription className="flex items-center justify-between">
                          <span className="truncate">{item.author}</span>
                          {item.duration_minutes && (
                            <span className="flex items-center gap-1 text-xs flex-shrink-0 ml-2">
                              <Clock className="h-3 w-3" />
                              {item.duration_minutes}m
                            </span>
                          )}
                        </CardDescription>
                      )}
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
                            <Badge variant="outline" className="text-xs border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400">
                              {item.series_name}
                            </Badge>
                          )}
                          {item.download_count !== undefined && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Download className="h-3 w-3" />
                              {item.download_count}
                            </span>
                          )}
                        </div>

                        {item.progress_percent !== undefined && item.progress_percent > 0 && !item.completed && (
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{item.progress_percent}%</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {/* Upgrade Banner for Free Users */}
        {memberTier === 'free' && (
          <Card className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <CardContent className="flex flex-col md:flex-row items-center justify-between py-8 gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Unlock All Content</h3>
                  <p className="text-purple-200">
                    Become a Partner to access exclusive teachings, ebooks, and resources.
                  </p>
                </div>
              </div>
              <Link href="/partner">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg gap-2">
                  <Crown className="h-5 w-5" />
                  Become a Partner
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

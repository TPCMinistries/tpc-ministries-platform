'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
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

export default function UnifiedLibraryPage() {
  const [content, setContent] = useState<LibraryItem[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, videos: 0, audio: 0, ebooks: 0, inProgress: 0 })
  const [memberTier, setMemberTier] = useState('free')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchLibrary()
  }, [activeTab])

  const fetchLibrary = async () => {
    try {
      const params = new URLSearchParams()
      params.set('tab', activeTab)
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/library?${params}`)
      const result = await response.json()

      if (response.ok) {
        setContent(result.data || [])
        setStats(result.stats || { total: 0, videos: 0, audio: 0, ebooks: 0, inProgress: 0 })
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'sermon':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'audio':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'ebook':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'article':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Library className="h-8 w-8 text-navy" />
          <h1 className="text-3xl font-bold text-navy">Library</h1>
        </div>
        <p className="text-gray-600">Browse all teachings, ebooks, sermons, and resources</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="videos" className="text-xs sm:text-sm">
            <Video className="h-4 w-4 mr-1 hidden sm:inline" />
            Videos ({stats.videos})
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-xs sm:text-sm">
            <Headphones className="h-4 w-4 mr-1 hidden sm:inline" />
            Audio ({stats.audio})
          </TabsTrigger>
          <TabsTrigger value="ebooks" className="text-xs sm:text-sm">
            <BookOpen className="h-4 w-4 mr-1 hidden sm:inline" />
            Ebooks ({stats.ebooks})
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs sm:text-sm">
            My Progress ({stats.inProgress})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredContent.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-600 text-center">
                  {activeTab === 'progress'
                    ? 'No content in progress yet. Start watching or reading something!'
                    : searchQuery
                    ? 'No results found. Try a different search term.'
                    : 'No content available in this category.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.map((item) => {
                const Icon = getContentIcon(item.type)
                const isLocked = !item.has_access

                return (
                  <Link key={`${item.source}-${item.id}`} href={isLocked ? '/partner' : item.href}>
                    <Card className={`overflow-hidden transition-all hover:shadow-lg cursor-pointer h-full ${
                      isLocked ? 'opacity-90' : ''
                    }`}>
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-navy/10 to-gold/10">
                        {item.thumbnail_url ? (
                          <Image
                            src={item.thumbnail_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-white/80 p-6">
                              <Icon className="h-8 w-8 text-navy" />
                            </div>
                          </div>
                        )}

                        {/* Progress bar */}
                        {item.progress_percent !== undefined && item.progress_percent > 0 && (
                          <div className="absolute bottom-0 left-0 right-0">
                            <Progress value={item.progress_percent} className="h-1 rounded-none" />
                          </div>
                        )}

                        {/* Completed badge */}
                        {item.completed && (
                          <div className="absolute top-2 right-2 bg-green-600 rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}

                        {/* Locked overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2">
                              <Lock className="h-4 w-4 text-navy" />
                              <span className="text-sm font-medium">
                                {getTierLabel(item.tier_required)} Only
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Type badge */}
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className={`${getTypeColor(item.type)} border`}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </Badge>
                        </div>

                        {/* Tier badge for premium content */}
                        {item.tier_required !== 'free' && (
                          <div className="absolute top-2 right-2">
                            {!item.completed && (
                              <Badge className="bg-gold text-white">
                                <Crown className="h-3 w-3 mr-1" />
                                {getTierLabel(item.tier_required)}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Play button for videos */}
                        {(item.type === 'video' || item.type === 'sermon') && !isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="h-6 w-6 text-navy ml-1" />
                            </div>
                          </div>
                        )}
                      </div>

                      <CardHeader className="pb-2">
                        <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
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
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.series_name && (
                              <Badge variant="outline" className="text-xs">
                                {item.series_name}
                              </Badge>
                            )}
                            {item.download_count !== undefined && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Download className="h-3 w-3" />
                                {item.download_count}
                              </span>
                            )}
                          </div>

                          {item.progress_percent !== undefined && item.progress_percent > 0 && !item.completed && (
                            <span className="text-xs text-gray-600">{item.progress_percent}% complete</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upgrade Banner for Free Users */}
      {memberTier === 'free' && (
        <Card className="bg-gradient-to-r from-navy to-navy-800 text-white">
          <CardContent className="flex flex-col md:flex-row items-center justify-between py-6 gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Unlock All Content</h3>
              <p className="text-blue-100">
                Become a Partner to access exclusive teachings, ebooks, and resources.
              </p>
            </div>
            <Link href="/partner">
              <Button className="bg-gold hover:bg-gold-dark text-white">
                <Crown className="h-4 w-4 mr-2" />
                Become a Partner
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

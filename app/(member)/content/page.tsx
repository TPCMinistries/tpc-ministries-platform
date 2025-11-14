'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Video, FileText, Headphones, BookOpen, Clock, Play, Bookmark, Lock, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'

interface ContentItem {
  id: string
  title: string
  description: string
  author: string
  content_type: string
  duration_minutes?: number
  thumbnail_url?: string
  is_premium: boolean
  season_id?: string
  season_name?: string
  season_color?: string
  progress_percentage?: number
  is_bookmarked?: boolean
}

export default function MemberContentPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<ContentItem[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [contentTypeFilter, setContentTypeFilter] = useState('all')
  const [seasonFilter, setSeasonFilter] = useState(searchParams.get('season') || 'all')
  const [sortBy, setSortBy] = useState('newest')
  const [seasons, setSeasons] = useState<Array<{ id: string; name: string }>>([])
  const [memberSeasonIds, setMemberSeasonIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchContent()
  }, [])

  useEffect(() => {
    filterContent()
  }, [content, searchQuery, contentTypeFilter, seasonFilter, sortBy])

  const fetchContent = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      // Fetch all seasons for filter
      const { data: seasonsData } = await supabase
        .from('seasons')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order')

      setSeasons(seasonsData || [])

      // Fetch member's enrolled seasons
      const { data: memberSeasonsData } = await supabase
        .from('member_seasons')
        .select('season_id')
        .eq('member_id', member.id)

      setMemberSeasonIds(new Set(memberSeasonsData?.map(ms => ms.season_id) || []))

      // Fetch teachings
      const { data: teachings } = await supabase
        .from('teachings')
        .select(`
          *,
          seasons (
            name,
            color
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      // Fetch member's progress
      const { data: progressData } = await supabase
        .from('content_progress')
        .select('teaching_id, progress_percentage, completed')
        .eq('member_id', member.id)

      const progressMap = new Map(
        progressData?.map(p => [p.teaching_id, p]) || []
      )

      // Fetch member's bookmarks (check if table exists)
      const { data: bookmarksData } = await supabase
        .from('member_bookmarks')
        .select('teaching_id')
        .eq('member_id', member.id)
        .then(res => res)
        .catch(() => ({ data: [] }))

      const bookmarkSet = new Set(bookmarksData?.map(b => b.teaching_id) || [])

      const formattedContent: ContentItem[] = teachings?.map(t => {
        const progress = progressMap.get(t.id)
        return {
          id: t.id,
          title: t.title,
          description: t.description || '',
          author: t.author || 'TPC Ministries',
          content_type: t.content_type || 'article',
          duration_minutes: t.duration_minutes,
          thumbnail_url: t.thumbnail_url,
          is_premium: t.is_premium || false,
          season_id: t.season_id,
          season_name: t.seasons?.name,
          season_color: t.seasons?.color,
          progress_percentage: progress?.completed ? 100 : progress?.progress_percentage,
          is_bookmarked: bookmarkSet.has(t.id)
        }
      }) || []

      setContent(formattedContent)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterContent = () => {
    let filtered = [...content]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Content type filter
    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.content_type === contentTypeFilter)
    }

    // Season filter
    if (seasonFilter !== 'all') {
      filtered = filtered.filter(item => item.season_id === seasonFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return Math.random() - 0.5 // TODO: Sort by actual popularity
        case 'duration-short':
          return (a.duration_minutes || 0) - (b.duration_minutes || 0)
        case 'duration-long':
          return (b.duration_minutes || 0) - (a.duration_minutes || 0)
        default:
          return 0
      }
    })

    setFilteredContent(filtered)
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video
      case 'audio':
        return Headphones
      case 'article':
        return FileText
      default:
        return BookOpen
    }
  }

  const ContentCard = ({ item }: { item: ContentItem }) => {
    const Icon = getContentIcon(item.content_type)

    return (
      <Link href={`/member/content/${item.id}`}>
        <Card className="hover:shadow-lg transition-all cursor-pointer h-full group">
          <div className="relative">
            {item.thumbnail_url ? (
              <div className="aspect-video bg-gray-200 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                </div>
              </div>
            ) : (
              <div
                className="aspect-video bg-gradient-to-br rounded-t-lg flex items-center justify-center"
                style={{
                  backgroundImage: item.season_color
                    ? `linear-gradient(to bottom right, ${item.season_color}20, ${item.season_color}40)`
                    : 'linear-gradient(to bottom right, #1e3a8a20, #1e3a8a40)'
                }}
              >
                <Icon className="h-12 w-12 text-navy opacity-40" />
              </div>
            )}
            {item.is_bookmarked && (
              <div className="absolute top-2 right-2">
                <Bookmark className="h-5 w-5 text-gold fill-gold" />
              </div>
            )}
            {item.is_premium && (
              <Badge className="absolute top-2 left-2 bg-gold text-white">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
            {item.progress_percentage !== undefined && (
              <div className="absolute bottom-0 left-0 right-0">
                <Progress value={item.progress_percentage} className="h-1 rounded-none" />
              </div>
            )}
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-start gap-2 mb-2">
              <Icon className="h-4 w-4 text-navy flex-shrink-0 mt-0.5" />
              <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">{item.description}</CardDescription>
          </CardHeader>

          <CardContent className="pt-0 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{item.author}</span>
              {item.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.duration_minutes}m
                </span>
              )}
            </div>
            {item.season_name && (
              <Badge variant="outline" style={{ borderColor: item.season_color, color: item.season_color }}>
                {item.season_name}
              </Badge>
            )}
          </CardContent>
        </Card>
      </Link>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy mb-2">Content Library</h1>
        <p className="text-gray-600">Explore teachings, courses, and resources for your journey</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="book">Books</SelectItem>
          </SelectContent>
        </Select>
        <Select value={seasonFilter} onValueChange={setSeasonFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            {seasons.map(season => (
              <SelectItem key={season.id} value={season.id}>
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="duration-short">Duration (Short)</SelectItem>
            <SelectItem value="duration-long">Duration (Long)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="seasons">My Seasons</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredContent.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-navy mb-2">No content found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="seasons" className="mt-6">
          {filteredContent.filter(item => item.season_id && memberSeasonIds.has(item.season_id)).length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.filter(item => item.season_id && memberSeasonIds.has(item.season_id)).map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-navy mb-2">No Content from Your Seasons</h3>
                <p className="text-gray-600 mb-4">Join a season to see content here</p>
                <Link href="/member/seasons">
                  <Button>Browse Seasons</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookmarked" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent.filter(item => item.is_bookmarked).map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent.filter(item => item.progress_percentage && item.progress_percentage < 95).map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent.filter(item => item.progress_percentage && item.progress_percentage >= 95).map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

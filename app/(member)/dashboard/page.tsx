'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Play,
  Heart,
  DollarSign,
  Sparkles,
  ArrowRight,
  Video,
  FileText,
  Headphones
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DailyHub from '@/components/member/daily-hub'
import PlantWidget from '@/components/member/plant-widget'

interface DashboardStats {
  total_content_consumed: number
  content_this_week: number
  content_this_month: number
  assessments_completed: number
  days_since_joining: number
  current_season_streak: number
}

interface Season {
  id: string
  name: string
  color: string
  icon_name: string
  progress_percentage: number
  content_completed: number
  content_total: number
}

interface ContentItem {
  id: string
  title: string
  author: string
  content_type: string
  thumbnail_url?: string
  duration_minutes?: number
  progress_percentage?: number
  season_name?: string
  season_color?: string
}

interface UpcomingEvent {
  id: string
  title: string
  date: string
  time: string
  type: string
}

export default function MemberDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [memberName, setMemberName] = useState('')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [currentSeasons, setCurrentSeasons] = useState<Season[]>([])
  const [recommendedContent, setRecommendedContent] = useState<ContentItem[]>([])
  const [continueWatching, setContinueWatching] = useState<ContentItem[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get member info
      const { data: member } = await supabase
        .from('members')
        .select('id, first_name, last_name, created_at')
        .eq('user_id', user.id)
        .single()

      if (member) {
        setMemberName(member.first_name || 'Friend')

        // Calculate days since joining
        const joinDate = new Date(member.created_at)
        const daysSinceJoining = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24))

        // Fetch teaching progress (completed teachings)
        const { data: teachingProgress } = await supabase
          .from('member_progress')
          .select('*')
          .eq('member_id', member.id)

        const totalCompleted = teachingProgress?.filter(p => p.completed).length || 0

        // Calculate date ranges
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Filter by date
        const completedThisWeek = teachingProgress?.filter(p =>
          p.completed &&
          p.completed_at &&
          new Date(p.completed_at) >= oneWeekAgo
        ).length || 0

        const completedThisMonth = teachingProgress?.filter(p =>
          p.completed &&
          p.completed_at &&
          new Date(p.completed_at) >= oneMonthAgo
        ).length || 0

        // Fetch assessment results (fix: use member_id instead of user_id)
        const { data: assessmentResults } = await supabase
          .from('assessment_results')
          .select('id')
          .eq('member_id', member.id)

        setStats({
          total_content_consumed: totalCompleted,
          content_this_week: completedThisWeek,
          content_this_month: completedThisMonth,
          assessments_completed: assessmentResults?.length || 0,
          days_since_joining: daysSinceJoining,
          current_season_streak: 0 // TODO: Calculate from seasons
        })

        // Fetch current seasons (if seasons table exists)
        const { data: seasons } = await supabase
          .from('seasons')
          .select('*')
          .limit(2)

        if (seasons && seasons.length > 0) {
          setCurrentSeasons(seasons.map(s => ({
            id: s.id,
            name: s.name || s.title,
            color: s.color || '#10b981',
            icon_name: 'Sparkles',
            progress_percentage: 0,
            content_completed: 0,
            content_total: 0
          })))
        } else {
          setCurrentSeasons([])
        }

        // Fetch recent teachings for recommended content
        const { data: teachings } = await supabase
          .from('teachings')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(3)

        if (teachings) {
          setRecommendedContent(teachings.map(t => ({
            id: t.id,
            title: t.title,
            author: t.speaker,
            content_type: t.video_url ? 'video' : t.audio_url ? 'audio' : 'article',
            duration_minutes: t.duration_minutes,
            thumbnail_url: t.thumbnail_url
          })))
        } else {
          setRecommendedContent([])
        }

        // Fetch in-progress teachings
        const { data: inProgress } = await supabase
          .from('teaching_progress')
          .select(`
            *,
            teaching:teachings(*)
          `)
          .eq('member_id', member.id)
          .eq('completed', false)
          .order('last_watched_at', { ascending: false })
          .limit(2)

        if (inProgress) {
          setContinueWatching(inProgress.map(p => ({
            id: p.teaching.id,
            title: p.teaching.title,
            author: p.teaching.speaker,
            content_type: p.teaching.video_url ? 'video' : 'audio',
            duration_minutes: p.teaching.duration_minutes,
            progress_percentage: Math.round((p.progress_seconds / (p.teaching.duration_minutes * 60)) * 100),
            thumbnail_url: p.teaching.thumbnail_url
          })))
        } else {
          setContinueWatching([])
        }

        // Fetch upcoming events
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'upcoming')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(2)

        if (events) {
          setUpcomingEvents(events.map(e => ({
            id: e.id,
            title: e.title,
            date: new Date(e.start_time).toLocaleDateString(),
            time: new Date(e.start_time).toLocaleTimeString(),
            type: e.event_type
          })))
        } else {
          setUpcomingEvents([])
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-navy to-navy-800 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {memberName}!</h1>
            <p className="text-gray-300 text-lg">
              Continue your spiritual journey today
            </p>
            {currentSeasons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {currentSeasons.map((season) => (
                  <Badge
                    key={season.id}
                    variant="outline"
                    className="border-white/30 text-white"
                    style={{ backgroundColor: `${season.color}20` }}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {season.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-300">Days in Journey</p>
              <p className="text-3xl font-bold">{stats?.days_since_joining}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Spiritual Hub - Scripture, Check-in, Streaks */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DailyHub />
        <PlantWidget />
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Content</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{stats?.total_content_consumed}</div>
            <p className="text-xs text-gray-600 mt-1">
              +{stats?.content_this_week} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Season Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{stats?.current_season_streak}</div>
            <p className="text-xs text-gray-600 mt-1">consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assessments</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{stats?.assessments_completed}</div>
            <p className="text-xs text-gray-600 mt-1">completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{stats?.content_this_month}</div>
            <p className="text-xs text-gray-600 mt-1">content consumed</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Journey */}
      {currentSeasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-navy">Your Journey</CardTitle>
            <CardDescription>Track your progress through your current seasons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentSeasons.map((season) => (
              <div key={season.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: season.color }}
                    />
                    <span className="font-semibold text-navy">{season.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {season.content_completed}/{season.content_total} completed
                  </span>
                </div>
                <Progress value={season.progress_percentage} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">{season.progress_percentage}% complete</p>
              </div>
            ))}
            <Link href="/seasons">
              <Button variant="outline" className="w-full">
                View All Seasons
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Continue Watching/Reading */}
      {continueWatching.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-navy">Continue Watching</h2>
            <Link href="/content?tab=in-progress">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {continueWatching.map((content) => {
              const Icon = getContentIcon(content.content_type)
              return (
                <Link key={content.id} href={`/content/${content.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="relative">
                      {content.thumbnail_url && (
                        <div className="aspect-video bg-gray-200 rounded-t-lg relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-12 w-12 text-white opacity-80" />
                          </div>
                        </div>
                      )}
                      {content.progress_percentage && (
                        <div className="absolute bottom-0 left-0 right-0">
                          <Progress value={content.progress_percentage} className="h-1 rounded-none" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-2 mb-2">
                        <Icon className="h-4 w-4 text-navy flex-shrink-0 mt-0.5" />
                        <CardTitle className="text-base line-clamp-2">{content.title}</CardTitle>
                      </div>
                      <CardDescription className="flex items-center justify-between">
                        <span>{content.author}</span>
                        {content.duration_minutes && (
                          <span className="flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            {content.duration_minutes}m
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Recommended For You */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-navy">Recommended For You</h2>
          <Link href="/content">
            <Button variant="ghost" size="sm">
              Browse All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendedContent.map((content) => {
            const Icon = getContentIcon(content.content_type)
            return (
              <Link key={content.id} href={`/content/${content.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {content.thumbnail_url && (
                    <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <Icon className="h-4 w-4 text-navy flex-shrink-0 mt-0.5" />
                      <CardTitle className="text-base line-clamp-2">{content.title}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center justify-between">
                      <span>{content.author}</span>
                      {content.duration_minutes && (
                        <span className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {content.duration_minutes}m
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  {content.season_name && (
                    <CardContent className="pt-0">
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: content.season_color,
                          color: content.season_color
                        }}
                      >
                        {content.season_name}
                      </Badge>
                    </CardContent>
                  )}
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions & Upcoming Events */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-navy">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/seasons">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Sparkles className="h-6 w-6 text-gold" />
                <span className="text-sm">Browse Seasons</span>
              </Button>
            </Link>
            <Link href="/assessments">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-sm">Take Assessment</span>
              </Button>
            </Link>
            <Link href="/prayer">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Heart className="h-6 w-6 text-red-600" />
                <span className="text-sm">Prayer Request</span>
              </Button>
            </Link>
            <Link href="/give">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <DollarSign className="h-6 w-6 text-blue-600" />
                <span className="text-sm">Give</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-navy">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="flex-shrink-0 w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate">{event.title}</p>
                  <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                  <Badge variant="outline" className="mt-1">{event.type}</Badge>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

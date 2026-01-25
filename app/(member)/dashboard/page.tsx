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
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DailyHub from '@/components/member/daily-hub'
import PlantWidget from '@/components/member/plant-widget'
import EngagementWidget from '@/components/member/engagement-widget'
import ActivityFeed from '@/components/member/activity-feed'
import QuickActionsWidget from '@/components/member/quick-actions-widget'
import { EmptyState } from '@/components/ui/empty-state'

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

        // Fetch assessment results
        const { data: assessmentResults } = await supabase
          .from('member_assessment_results')
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
      <div className="relative bg-gradient-to-br from-tpc-navy via-tpc-navy/95 to-tpc-navy/90 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-tpc-gold text-sm font-medium mb-1">Good to see you</p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Welcome back, {memberName}!</h1>
            <p className="text-white/70 text-lg">
              Continue your spiritual journey today
            </p>
            {currentSeasons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {currentSeasons.map((season) => (
                  <Badge
                    key={season.id}
                    variant="outline"
                    className="border-tpc-gold/30 text-white bg-tpc-gold/10"
                  >
                    <Sparkles className="h-3 w-3 mr-1 text-tpc-gold" />
                    {season.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-tpc-gold">Days in Journey</p>
              <p className="text-4xl font-bold">{stats?.days_since_joining || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Spiritual Hub - Scripture, Check-in, Streaks */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DailyHub />
        <PlantWidget />
        <EngagementWidget />
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-tpc-navy">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Total Content</CardTitle>
            <BookOpen className="h-4 w-4 text-tpc-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tpc-navy">{stats?.total_content_consumed || 0}</div>
            <p className="text-xs text-stone-500 mt-1">
              +{stats?.content_this_week || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-tpc-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Season Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-tpc-gold-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tpc-navy">{stats?.current_season_streak || 0}</div>
            <p className="text-xs text-stone-500 mt-1">consecutive days</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">Assessments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tpc-navy">{stats?.assessments_completed || 0}</div>
            <p className="text-xs text-stone-500 mt-1">completed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-tpc-navy">{stats?.content_this_month || 0}</div>
            <p className="text-xs text-stone-500 mt-1">content consumed</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Journey */}
      {currentSeasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-tpc-navy">Your Journey</CardTitle>
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
                    <span className="font-semibold text-tpc-navy">{season.name}</span>
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

      {/* Quick Actions, Activity Feed & Upcoming Events */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Smart Quick Actions */}
        <QuickActionsWidget />

        {/* Community Activity Feed */}
        <ActivityFeed limit={8} />

        {/* Upcoming Events */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-tpc-navy dark:text-white">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-4 pb-4 border-b dark:border-gray-700 last:border-0 last:pb-0">
                <div className="flex-shrink-0 w-12 h-12 bg-tpc-navy/10 dark:bg-tpc-navy/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-tpc-navy dark:text-tpc-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-tpc-navy dark:text-white truncate">{event.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{event.date} at {event.time}</p>
                  <Badge variant="outline" className="mt-1">{event.type}</Badge>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <EmptyState
                variant="compact"
                icon={Calendar}
                title="No upcoming events"
                description="Check back soon for gatherings"
                action={{ label: "View Calendar", href: "/events" }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useMemo } from 'react'
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
import VerseOfTheDayWidget from '@/components/member/VerseOfTheDay'
import ActivityFeed from '@/components/member/activity-feed'
import QuickActionsWidget from '@/components/member/quick-actions-widget'
import { EmptyState } from '@/components/ui/empty-state'
import { StreakDisplay } from '@/components/ui/streak-display'
import { QuickStats } from '@/components/ui/quick-stats'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { NumberCounter } from '@/components/motion/number-counter'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { StaggerChildren, StaggerItem } from '@/components/motion/stagger-children'

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

function getTimeOfDayGradient(): { gradient: string; period: 'morning' | 'afternoon' | 'evening' } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return {
      gradient: 'from-amber-500/20 via-gold/10 to-tpc-beige',
      period: 'morning',
    }
  }
  if (hour >= 12 && hour < 17) {
    return {
      gradient: 'from-gold/15 via-tpc-beige to-background',
      period: 'afternoon',
    }
  }
  return {
    gradient: 'from-navy via-navy-800 to-navy-950',
    period: 'evening',
  }
}

// Gold particle dots for the welcome banner
function ParticleField() {
  // Deterministic positions to avoid hydration mismatch
  const particles = useMemo(() => [
    { left: '10%', top: '20%', delay: '0s', size: 3 },
    { left: '25%', top: '60%', delay: '0.5s', size: 2 },
    { left: '45%', top: '15%', delay: '1s', size: 4 },
    { left: '65%', top: '45%', delay: '1.5s', size: 2 },
    { left: '80%', top: '25%', delay: '0.3s', size: 3 },
    { left: '90%', top: '70%', delay: '0.8s', size: 2 },
    { left: '15%', top: '80%', delay: '1.2s', size: 3 },
    { left: '55%', top: '75%', delay: '0.6s', size: 2 },
  ], [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gold/30 animate-glow-pulse"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

// Milestone path SVG for journey progress
function MilestonePath({ seasons }: { seasons: Season[] }) {
  if (seasons.length === 0) return null

  const totalMilestones = seasons.length
  const pathWidth = 100
  const pathHeight = 60
  const stepX = pathWidth / (totalMilestones + 1)

  return (
    <div className="w-full overflow-x-auto py-4">
      <svg
        viewBox={`0 0 ${pathWidth} ${pathHeight}`}
        className="w-full min-w-[300px] h-auto"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Journey progress milestones"
      >
        {/* Curved path connecting milestones */}
        {seasons.length > 1 && (
          <path
            d={seasons.map((_, i) => {
              const x = stepX * (i + 1)
              const y = pathHeight / 2 + (i % 2 === 0 ? -8 : 8)
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            }).join(' ')}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
        )}

        {/* Milestone dots */}
        {seasons.map((season, i) => {
          const x = stepX * (i + 1)
          const y = pathHeight / 2 + (i % 2 === 0 ? -8 : 8)
          const isComplete = season.progress_percentage >= 100
          const isInProgress = season.progress_percentage > 0 && season.progress_percentage < 100

          return (
            <g key={season.id}>
              {/* Glow effect for current milestone */}
              {isInProgress && (
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="none"
                  stroke="hsl(37 48% 67%)"
                  strokeWidth="0.5"
                  opacity="0.4"
                  className="animate-glow-pulse"
                />
              )}
              {/* Milestone dot */}
              <circle
                cx={x}
                cy={y}
                r="3"
                fill={isComplete ? 'hsl(37 48% 67%)' : isInProgress ? 'hsl(37 48% 67%)' : 'hsl(var(--muted))'}
                stroke={isComplete ? 'hsl(37 48% 55%)' : 'hsl(var(--border))'}
                strokeWidth="0.5"
              />
              {/* Checkmark for completed */}
              {isComplete && (
                <text
                  x={x}
                  y={y + 1.2}
                  textAnchor="middle"
                  fontSize="4"
                  fill="white"
                  fontWeight="bold"
                >
                  &#x2713;
                </text>
              )}
              {/* Label */}
              <text
                x={x}
                y={i % 2 === 0 ? y + 8 : y - 6}
                textAnchor="middle"
                fontSize="2.8"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {season.name.length > 15 ? season.name.substring(0, 13) + '...' : season.name}
              </text>
              {/* Percentage */}
              <text
                x={x}
                y={i % 2 === 0 ? y + 12 : y - 10}
                textAnchor="middle"
                fontSize="2.2"
                fill="currentColor"
                className="text-muted-foreground/70"
              >
                {season.progress_percentage}%
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function MemberDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [memberName, setMemberName] = useState('')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [currentSeasons, setCurrentSeasons] = useState<Season[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const { gradient, period } = useMemo(() => getTimeOfDayGradient(), [])
  const isEvening = period === 'evening'

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
      <div className="p-4 lg:p-8 space-y-8">
        {/* Welcome banner skeleton */}
        <SkeletonCard className="h-48" lines={2} />
        {/* Stats row */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
        {/* Hub row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <SkeletonCard className="lg:col-span-2" lines={4} />
          <SkeletonCard lines={3} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Welcome Banner with time-based gradient + integrated verse */}
      <ScrollReveal variant="fade-up">
        <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-8 overflow-hidden ${isEvening ? 'text-white' : 'text-foreground'}`}>
          <ParticleField />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${isEvening ? 'text-gold' : 'text-gold-700 dark:text-gold'}`}>Good to see you</p>
              <h1 className={`text-3xl md:text-4xl font-display font-bold mb-2 ${isEvening ? 'text-white' : 'text-navy dark:text-foreground'}`}>
                Welcome back, {memberName}!
              </h1>
              <p className={`text-lg ${isEvening ? 'text-white/70' : 'text-muted-foreground'}`}>
                Continue your spiritual journey today
              </p>
              {currentSeasons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentSeasons.map((season) => (
                    <Badge
                      key={season.id}
                      variant="outline"
                      className={isEvening
                        ? 'border-gold/30 text-white bg-gold/10'
                        : 'border-gold/40 text-navy bg-gold/10 dark:text-white dark:border-gold/30 dark:bg-gold/10'
                      }
                    >
                      <Sparkles className="h-3 w-3 mr-1 text-gold" />
                      {season.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center gap-4">
              <StreakDisplay
                count={stats?.current_season_streak || 0}
                variant="badge"
                className={isEvening ? 'bg-white/10 border-white/20' : 'bg-navy/10 border-navy/20 dark:bg-white/10 dark:border-white/20'}
              />
              <div className={`text-right backdrop-blur-sm rounded-xl p-4 ${isEvening ? 'bg-white/10' : 'bg-navy/10 dark:bg-white/10'}`}>
                <p className={`text-sm ${isEvening ? 'text-gold' : 'text-gold-700 dark:text-gold'}`}>Days in Journey</p>
                <NumberCounter
                  value={stats?.days_since_joining || 0}
                  className="text-4xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* Integrated verse hint */}
          <div className={`mt-6 pt-4 border-t ${isEvening ? 'border-white/10' : 'border-border/30'}`}>
            <VerseOfTheDayWidget className="" />
          </div>
        </div>
      </ScrollReveal>

      {/* Daily Spiritual Hub - Scripture, Check-in, Streaks */}
      {/* Daily Spiritual Hub - Scripture, Check-in, Streaks */}
      <ScrollReveal variant="fade-up" delay={0.1}>
        <div className="grid gap-6 lg:grid-cols-3">
          <DailyHub />
          <PlantWidget />
          <EngagementWidget />
        </div>
      </ScrollReveal>

      {/* Stats Overview with NumberCounter */}
      <ScrollReveal variant="fade-up" delay={0.15}>
        <QuickStats
          stats={[
            {
              label: "Total Content",
              value: stats?.total_content_consumed || 0,
              change: stats?.content_this_week ? stats.content_this_week : undefined,
              icon: BookOpen,
            },
            {
              label: "Day Streak",
              value: stats?.current_season_streak || 0,
              icon: TrendingUp,
            },
            {
              label: "Assessments",
              value: stats?.assessments_completed || 0,
              icon: CheckCircle,
            },
            {
              label: "This Month",
              value: stats?.content_this_month || 0,
              icon: Calendar,
            },
          ]}
          variant="card"
        />
      </ScrollReveal>

      {/* Your Journey - Milestone Path */}
      {currentSeasons.length > 0 && (
        <ScrollReveal variant="fade-up" delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-navy dark:text-foreground font-display">Your Journey</CardTitle>
              <CardDescription>Track your progress through your current seasons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visual milestone path */}
              <MilestonePath seasons={currentSeasons} />

              {/* Detailed progress below path */}
              {currentSeasons.map((season) => (
                <div key={season.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: season.color }}
                      />
                      <span className="font-semibold text-navy dark:text-foreground">{season.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {season.content_completed}/{season.content_total} completed
                    </span>
                  </div>
                  <Progress value={season.progress_percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{season.progress_percentage}% complete</p>
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
        </ScrollReveal>
      )}

      {/* Quick Actions, Activity Feed & Upcoming Events */}
      <ScrollReveal variant="fade-up" delay={0.25}>
        <StaggerChildren className="grid gap-6 lg:grid-cols-3">
          {/* Smart Quick Actions */}
          <StaggerItem>
            <QuickActionsWidget />
          </StaggerItem>

          {/* Community Activity Feed */}
          <StaggerItem>
            <ActivityFeed limit={8} />
          </StaggerItem>

          {/* Upcoming Events */}
          <StaggerItem>
            <Card>
              <CardHeader>
                <CardTitle className="text-navy dark:text-foreground font-display">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-12 h-12 bg-navy/10 dark:bg-navy/30 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-navy dark:text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy dark:text-foreground truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date} at {event.time}</p>
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
          </StaggerItem>
        </StaggerChildren>
      </ScrollReveal>
    </div>
  )
}

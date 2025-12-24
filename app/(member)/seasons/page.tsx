'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Calendar,
  CheckCircle,
  ArrowRight,
  Loader2,
  Sun,
  Leaf,
  Snowflake,
  Flower2,
  TreeDeciduous,
  Target,
  TrendingUp,
  Clock,
  BookOpen
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Season {
  id: string
  name: string
  description: string
  color: string
  icon_name: string
  is_active: boolean
  is_member?: boolean
  started_date?: string
  content_completed?: number
  content_total?: number
  progress_percentage?: number
}

const SEASON_ICONS: { [key: string]: any } = {
  sun: Sun,
  leaf: Leaf,
  snowflake: Snowflake,
  flower: Flower2,
  tree: TreeDeciduous,
  sparkles: Sparkles,
  target: Target,
  default: Sparkles
}

export default function MemberSeasonsPage() {
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [mySeasons, setMySeasons] = useState<Season[]>([])
  const [availableSeasons, setAvailableSeasons] = useState<Season[]>([])

  useEffect(() => {
    fetchSeasons()
  }, [])

  const fetchSeasons = async () => {
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

      // Get all active seasons
      const { data: seasons } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      // Get member's seasons
      const { data: memberSeasons } = await supabase
        .from('member_seasons')
        .select('season_id, started_at, completed_at')
        .eq('member_id', member.id)

      const memberSeasonIds = new Set(memberSeasons?.map(ms => ms.season_id) || [])

      // Separate my seasons and available seasons
      const my: Season[] = []
      const available: Season[] = []

      for (const season of seasons || []) {
        const memberSeason = memberSeasons?.find(ms => ms.season_id === season.id)

        if (memberSeasonIds.has(season.id)) {
          // Get total content count for this season
          const { count: totalCount } = await supabase
            .from('teachings')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', season.id)
            .eq('is_published', true)

          // Get completed content count
          const { data: progressData } = await supabase
            .from('content_progress')
            .select('teaching_id')
            .eq('member_id', member.id)
            .eq('completed', true)

          const completedTeachingIds = new Set(progressData?.map(p => p.teaching_id) || [])

          // Count completed content in this season
          const { data: seasonTeachings } = await supabase
            .from('teachings')
            .select('id')
            .eq('season_id', season.id)
            .eq('is_published', true)

          const completedInSeason = seasonTeachings?.filter(t => completedTeachingIds.has(t.id)).length || 0
          const total = totalCount || 0
          const percentage = total > 0 ? Math.round((completedInSeason / total) * 100) : 0

          my.push({
            ...season,
            is_member: true,
            started_date: memberSeason?.started_at,
            content_completed: completedInSeason,
            content_total: total,
            progress_percentage: percentage
          })
        } else {
          available.push(season)
        }
      }

      setMySeasons(my)
      setAvailableSeasons(available)
    } catch (error) {
      console.error('Error fetching seasons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSeason = async (seasonId: string) => {
    setJoining(seasonId)
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

      await supabase
        .from('member_seasons')
        .insert({
          member_id: member.id,
          season_id: seasonId,
          started_at: new Date().toISOString()
        })

      // Refresh seasons
      await fetchSeasons()
    } catch (error) {
      console.error('Error joining season:', error)
    } finally {
      setJoining(null)
    }
  }

  const getSeasonIcon = (iconName: string) => {
    return SEASON_ICONS[iconName] || SEASON_ICONS.default
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const totalCompleted = mySeasons.reduce((sum, s) => sum + (s.content_completed || 0), 0)
  const totalContent = mySeasons.reduce((sum, s) => sum + (s.content_total || 0), 0)
  const overallProgress = totalContent > 0 ? Math.round((totalCompleted / totalContent) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your seasons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-amber-200">Every Season Has Purpose</p>
                    <h1 className="text-3xl font-bold">Spiritual Seasons</h1>
                  </div>
                </div>
                <p className="text-amber-100 mt-2 max-w-md">
                  Join themed spiritual journeys designed to help you grow in specific areas of your faith walk.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Seasons</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{mySeasons.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCompleted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Content</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalContent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Current Seasons */}
        {mySeasons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sun className="h-6 w-6 text-amber-500" />
              Your Active Seasons
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mySeasons.map((season) => {
                const Icon = getSeasonIcon(season.icon_name)
                const isComplete = season.progress_percentage === 100

                return (
                  <Card
                    key={season.id}
                    className="overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl transition-all group"
                  >
                    {/* Colored top bar */}
                    <div
                      className="h-2"
                      style={{ background: `linear-gradient(to right, ${season.color}, ${season.color}dd)` }}
                    />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform"
                          style={{ background: `linear-gradient(135deg, ${season.color}, ${season.color}cc)` }}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <Badge className={`${isComplete ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'} text-white border-0`}>
                          {isComplete ? 'Complete' : 'In Progress'}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">{season.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{season.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        Started {formatDate(season.started_date!)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {season.content_completed}/{season.content_total} lessons
                          </span>
                        </div>
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${season.progress_percentage}%`,
                              background: `linear-gradient(to right, ${season.color}, ${season.color}dd)`
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                          {season.progress_percentage}% complete
                        </p>
                      </div>

                      <Link href={`/seasons/${season.id}`}>
                        <Button
                          className="w-full gap-2 text-white shadow-lg hover:shadow-xl transition-all"
                          style={{ background: `linear-gradient(135deg, ${season.color}, ${season.color}dd)` }}
                        >
                          {isComplete ? 'Review Season' : 'Continue Journey'}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Available Seasons */}
        {availableSeasons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Leaf className="h-6 w-6 text-emerald-500" />
              {mySeasons.length > 0 ? 'Explore More Seasons' : 'Available Seasons'}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableSeasons.map((season) => {
                const Icon = getSeasonIcon(season.icon_name)

                return (
                  <Card
                    key={season.id}
                    className="overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl transition-all group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transform group-hover:scale-105 transition-all"
                          style={{ background: `linear-gradient(135deg, ${season.color}, ${season.color}cc)` }}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                          Not Started
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">{season.name}</CardTitle>
                      <CardDescription className="line-clamp-3">{season.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full gap-2 transition-all"
                        variant="outline"
                        onClick={() => handleJoinSeason(season.id)}
                        disabled={joining === season.id}
                        style={{
                          borderColor: season.color,
                          color: season.color
                        }}
                      >
                        {joining === season.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Begin This Season
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {mySeasons.length === 0 && availableSeasons.length === 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Seasons Available</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                New spiritual seasons are being prepared. Check back soon for new journeys to embark on.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Encouragement Card */}
        <Card className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white border-0 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Embrace Every Season</h3>
                <p className="text-amber-100 text-sm">
                  "To everything there is a season, and a time for every purpose under heaven." — Ecclesiastes 3:1
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

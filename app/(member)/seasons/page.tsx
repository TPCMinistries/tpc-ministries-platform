'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Calendar, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy mb-2">My Seasons</h1>
        <p className="text-gray-600">
          Join and track your progress through different spiritual seasons
        </p>
      </div>

      {/* My Current Seasons */}
      {mySeasons.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-navy mb-4">Active Seasons</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mySeasons.map((season) => (
              <Card key={season.id} className="border-2" style={{ borderColor: season.color }}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${season.color}20` }}
                    >
                      <Sparkles className="h-6 w-6" style={{ color: season.color }} />
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-navy">{season.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{season.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Started {new Date(season.started_date!).toLocaleDateString()}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-navy">Progress</span>
                      <span className="text-sm text-gray-600">
                        {season.content_completed}/{season.content_total} completed
                      </span>
                    </div>
                    <Progress value={season.progress_percentage} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">{season.progress_percentage}% complete</p>
                  </div>

                  <Link href={`/member/seasons/${season.id}`}>
                    <Button className="w-full" style={{ backgroundColor: season.color }}>
                      View Season
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Seasons */}
      <div>
        <h2 className="text-2xl font-bold text-navy mb-4">
          {mySeasons.length > 0 ? 'Explore More Seasons' : 'Available Seasons'}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableSeasons.map((season) => (
            <Card key={season.id} className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${season.color}20` }}
                  >
                    <Sparkles className="h-6 w-6" style={{ color: season.color }} />
                  </div>
                </div>
                <CardTitle className="text-xl text-navy">{season.name}</CardTitle>
                <CardDescription>{season.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleJoinSeason(season.id)}
                  disabled={joining === season.id}
                  style={{ borderColor: season.color, color: season.color }}
                >
                  {joining === season.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Join Season
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {mySeasons.length === 0 && availableSeasons.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-navy mb-2">No Seasons Available</h3>
            <p className="text-gray-600">Check back soon for new spiritual seasons</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Calendar,
  ArrowLeft,
  Play,
  BookOpen,
  Headphones,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Season {
  id: string
  name: string
  description: string
  color: string
  icon_name: string
  is_active: boolean
}

interface Teaching {
  id: string
  title: string
  description: string
  content_type: 'video' | 'audio' | 'article' | 'book' | 'course'
  thumbnail_url?: string
  author: string
  duration_minutes?: number
  published_at: string
  season_id: string
  is_published: boolean
  progress?: number
  completed?: boolean
}

export default function SeasonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const seasonId = params.id as string

  const [loading, setLoading] = useState(true)
  const [season, setSeason] = useState<Season | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [teachings, setTeachings] = useState<Teaching[]>([])
  const [nextRecommended, setNextRecommended] = useState<Teaching | null>(null)
  const [progressStats, setProgressStats] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  })

  useEffect(() => {
    fetchSeasonData()
  }, [seasonId])

  const fetchSeasonData = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      // Fetch season details
      const { data: seasonData } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', seasonId)
        .single()

      if (!seasonData) {
        router.push('/member/seasons')
        return
      }

      setSeason(seasonData)

      // Check if member is enrolled
      const { data: memberSeason } = await supabase
        .from('member_seasons')
        .select('*')
        .eq('member_id', member.id)
        .eq('season_id', seasonId)
        .maybeSingle()

      setIsMember(!!memberSeason)

      // Fetch teachings for this season
      const { data: teachingsData } = await supabase
        .from('teachings')
        .select('*')
        .eq('season_id', seasonId)
        .eq('is_published', true)
        .order('published_at', { ascending: true })

      // Fetch progress for each teaching
      const { data: progressData } = await supabase
        .from('content_progress')
        .select('teaching_id, progress_percentage, completed')
        .eq('member_id', member.id)

      const progressMap = new Map(
        progressData?.map(p => [p.teaching_id, p]) || []
      )

      const teachingsWithProgress = (teachingsData || []).map(teaching => ({
        ...teaching,
        progress: progressMap.get(teaching.id)?.progress_percentage || 0,
        completed: progressMap.get(teaching.id)?.completed || false
      }))

      setTeachings(teachingsWithProgress)

      // Find next recommended (first incomplete teaching)
      const nextIncomplete = teachingsWithProgress.find(t => !t.completed)
      setNextRecommended(nextIncomplete || null)

      // Calculate progress stats
      const completed = teachingsWithProgress.filter(t => t.completed).length
      const total = teachingsWithProgress.length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

      setProgressStats({ completed, total, percentage })
    } catch (error) {
      console.error('Error fetching season data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSeason = async () => {
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

      await supabase.from('member_seasons').insert({
        member_id: member.id,
        season_id: seasonId,
        started_at: new Date().toISOString()
      })

      setIsMember(true)
    } catch (error) {
      console.error('Error joining season:', error)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />
      case 'audio':
        return <Headphones className="h-4 w-4" />
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'book':
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!season) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-navy mb-4">Season Not Found</h2>
          <Link href="/member/seasons">
            <Button>Back to Seasons</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Back Button */}
      <Link href="/member/seasons">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Seasons
        </Button>
      </Link>

      {/* Season Header */}
      <div
        className="rounded-lg p-8 text-white"
        style={{ backgroundColor: season.color }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{season.name}</h1>
                {isMember && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enrolled
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-lg text-white/90 max-w-3xl">{season.description}</p>
          </div>
        </div>

        {/* Progress Stats for Members */}
        {isMember && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <p className="text-3xl font-bold">{progressStats.percentage}%</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <p className="text-3xl font-bold">{progressStats.completed}/{progressStats.total}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Remaining</span>
              </div>
              <p className="text-3xl font-bold">{progressStats.total - progressStats.completed}</p>
            </div>
          </div>
        )}
      </div>

      {/* Join Button for Non-Members */}
      {!isMember && (
        <Card className="border-2" style={{ borderColor: season.color }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-navy mb-2">Join This Season</h3>
                <p className="text-gray-600">
                  Start your journey through this season and track your progress
                </p>
              </div>
              <Button
                onClick={handleJoinSeason}
                size="lg"
                style={{ backgroundColor: season.color }}
              >
                Join Season
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Recommended */}
      {isMember && nextRecommended && (
        <div>
          <h2 className="text-2xl font-bold text-navy mb-4">Continue Where You Left Off</h2>
          <Card className="border-2" style={{ borderColor: season.color }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {nextRecommended.thumbnail_url ? (
                  <img
                    src={nextRecommended.thumbnail_url}
                    alt={nextRecommended.title}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div
                    className="w-48 h-32 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${season.color}20` }}
                  >
                    {getContentIcon(nextRecommended.content_type)}
                  </div>
                )}
                <div className="flex-1">
                  <Badge className="mb-2" style={{ backgroundColor: season.color }}>
                    Up Next
                  </Badge>
                  <h3 className="text-2xl font-bold text-navy mb-2">{nextRecommended.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{nextRecommended.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      {getContentIcon(nextRecommended.content_type)}
                      {nextRecommended.content_type}
                    </span>
                    {nextRecommended.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {nextRecommended.duration_minutes} min
                      </span>
                    )}
                    <span>{nextRecommended.author}</span>
                  </div>
                  <Link href={`/member/content/${nextRecommended.id}`}>
                    <Button style={{ backgroundColor: season.color }}>
                      Continue
                      <Play className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Content */}
      <div>
        <h2 className="text-2xl font-bold text-navy mb-4">All Content in This Season</h2>
        {teachings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No content available yet for this season</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teachings.map((teaching) => (
              <Card
                key={teaching.id}
                className={`transition-all hover:shadow-lg ${
                  teaching.completed ? 'border-green-200 bg-green-50/30' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  {teaching.thumbnail_url ? (
                    <div className="relative mb-3">
                      <img
                        src={teaching.thumbnail_url}
                        alt={teaching.title}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      {teaching.completed && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="w-full h-40 rounded-lg flex items-center justify-center mb-3 relative"
                      style={{ backgroundColor: `${season.color}20` }}
                    >
                      {getContentIcon(teaching.content_type)}
                      {teaching.completed && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  <CardTitle className="text-lg line-clamp-2">{teaching.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {teaching.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      {getContentIcon(teaching.content_type)}
                      {teaching.content_type}
                    </span>
                    {teaching.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {teaching.duration_minutes}m
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">By {teaching.author}</p>

                  {teaching.progress > 0 && !teaching.completed && (
                    <div>
                      <Progress value={teaching.progress} className="h-2 mb-1" />
                      <p className="text-xs text-gray-600">{teaching.progress}% complete</p>
                    </div>
                  )}

                  <Link href={`/member/content/${teaching.id}`}>
                    <Button className="w-full" variant="outline">
                      {teaching.completed ? 'Review' : teaching.progress > 0 ? 'Continue' : 'Start'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

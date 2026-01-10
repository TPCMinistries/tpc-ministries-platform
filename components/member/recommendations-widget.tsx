'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Sparkles,
  Video,
  Headphones,
  FileText,
  Clock,
  ArrowRight,
  BookOpen,
  RefreshCw,
  Loader2
} from 'lucide-react'

interface Recommendation {
  id: string
  title: string
  description?: string
  content_type: 'video' | 'audio' | 'article'
  duration_minutes?: number
  thumbnail_url?: string
  category?: string
  reason: string
}

export default function RecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get member with spiritual profile
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      // Get spiritual profile for personalization
      const { data: profile } = await supabase
        .from('member_spiritual_profiles')
        .select('primary_gift, secondary_gift, current_season, interests')
        .eq('member_id', member.id)
        .single()

      // Get already watched content
      const { data: watched } = await supabase
        .from('member_activity')
        .select('content_id')
        .eq('member_id', member.id)
        .in('activity_type', ['teaching_viewed', 'content_view'])

      const watchedIds = new Set(watched?.map(w => w.content_id) || [])

      // Build personalized query
      let query = supabase
        .from('teachings')
        .select('id, title, description, video_url, audio_url, duration_minutes, thumbnail_url, category, tags')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      // If we have profile data, prioritize matching content
      const recommendations: Recommendation[] = []

      // Fetch content
      const { data: teachings } = await query.limit(20)

      if (teachings) {
        // Score and sort by relevance
        const scored = teachings
          .filter(t => !watchedIds.has(t.id))
          .map(teaching => {
            let score = 0
            let reason = 'New for you'

            // Score based on matching gift/season
            if (profile?.primary_gift && teaching.category?.toLowerCase().includes(profile.primary_gift.toLowerCase())) {
              score += 10
              reason = `Matches your gift: ${profile.primary_gift}`
            }
            if (profile?.current_season && teaching.tags?.some((t: string) => t.toLowerCase().includes(profile.current_season.toLowerCase()))) {
              score += 8
              reason = `For your current season`
            }

            // Newer content gets slight boost
            score += 2

            return {
              ...teaching,
              score,
              reason,
              content_type: teaching.video_url ? 'video' : teaching.audio_url ? 'audio' : 'article'
            }
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)

        scored.forEach(t => {
          recommendations.push({
            id: t.id,
            title: t.title,
            description: t.description,
            content_type: t.content_type as 'video' | 'audio' | 'article',
            duration_minutes: t.duration_minutes,
            thumbnail_url: t.thumbnail_url,
            category: t.category,
            reason: t.reason
          })
        })
      }

      setRecommendations(recommendations)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRecommendations()
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return Video
      case 'audio': return Headphones
      default: return FileText
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            Recommended For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-24 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              Recommended For You
            </CardTitle>
            <CardDescription>Personalized based on your journey</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh recommendations"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recommendations yet</p>
            <p className="text-sm text-gray-400">Complete your spiritual profile to get personalized content</p>
            <Link href="/my-assessments">
              <Button variant="outline" className="mt-4">
                Take Assessment
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {recommendations.map((item) => {
              const Icon = getContentIcon(item.content_type)
              return (
                <Link key={item.id} href={`/library/${item.id}`}>
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                    <div className="relative w-24 h-16 bg-gradient-to-br from-navy/20 to-gold/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.thumbnail_url ? (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.thumbnail_url})` }} />
                      ) : (
                        <Icon className="h-6 w-6 text-navy" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-navy dark:group-hover:text-gold transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Icon className="h-3 w-3 mr-1" />
                          {item.content_type}
                        </Badge>
                        {item.duration_minutes && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.duration_minutes}m
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gold mt-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {item.reason}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
            <Link href="/library">
              <Button variant="outline" className="w-full">
                Browse All Content
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}

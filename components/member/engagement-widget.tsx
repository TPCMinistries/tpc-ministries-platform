'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Trophy,
  BookOpen,
  Calendar,
  TrendingUp,
  Star,
  ArrowRight,
  Gift,
  ClipboardCheck,
  Video
} from 'lucide-react'

interface EngagementData {
  engagement_score: number
  total_days_active: number
  content_viewed: number
  events_attended: number
  donations_made: number
  assessments_completed: number
}

export default function EngagementWidget() {
  const [data, setData] = useState<EngagementData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEngagementData()
  }, [])

  const fetchEngagementData = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get member ID
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) {
        const { data: memberAlt } = await supabase
          .from('members')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()
        if (!memberAlt) return
      }

      const memberId = member?.id

      // Get engagement data
      const { data: streak } = await supabase
        .from('engagement_streaks')
        .select('*')
        .eq('member_id', memberId)
        .single()

      // Get assessment count
      const { count: assessmentCount } = await supabase
        .from('member_assessment_results')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', memberId)

      if (streak) {
        setData({
          engagement_score: streak.engagement_score || 0,
          total_days_active: streak.total_days_active || 0,
          content_viewed: streak.content_viewed || 0,
          events_attended: streak.events_attended || 0,
          donations_made: streak.donations_made || 0,
          assessments_completed: assessmentCount || 0
        })
      } else {
        setData({
          engagement_score: 0,
          total_days_active: 0,
          content_viewed: 0,
          events_attended: 0,
          donations_made: 0,
          assessments_completed: assessmentCount || 0
        })
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreLevel = (score: number) => {
    if (score < 100) return { level: 'Newcomer', color: 'bg-gray-500', next: 100 }
    if (score < 300) return { level: 'Explorer', color: 'bg-blue-500', next: 300 }
    if (score < 600) return { level: 'Committed', color: 'bg-green-500', next: 600 }
    if (score < 1000) return { level: 'Devoted', color: 'bg-purple-500', next: 1000 }
    if (score < 2000) return { level: 'Faithful', color: 'bg-tpc-gold', next: 2000 }
    return { level: 'Champion', color: 'bg-amber-500', next: score }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const scoreLevel = getScoreLevel(data.engagement_score)
  const progressToNext = data.engagement_score < scoreLevel.next
    ? (data.engagement_score / scoreLevel.next) * 100
    : 100

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-tpc-navy to-tpc-navy/90 text-white pb-10">
        <div className="flex items-center justify-between">
          <div>
            <CardDescription className="text-white/70">Your TPC Journey</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-tpc-gold" />
              {data.total_days_active} Days Active
            </CardTitle>
          </div>
          <div className="text-right">
            <Badge className={`${scoreLevel.color} text-white`}>
              {scoreLevel.level}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="-mt-6 space-y-5">
        {/* Score Card */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${scoreLevel.color} flex items-center justify-center`}>
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-tpc-navy">{data.engagement_score} points</p>
                  <p className="text-xs text-gray-500">Level {Math.floor(data.engagement_score / 200) + 1}</p>
                </div>
              </div>
            </div>
            <Progress value={progressToNext} className="h-2" />
            {data.engagement_score < scoreLevel.next && (
              <p className="text-xs text-gray-500 mt-1">
                {scoreLevel.next - data.engagement_score} points to {getScoreLevel(scoreLevel.next).level}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Activity Stats - TPC Specific */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Video className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-tpc-navy">{data.content_viewed}</p>
            <p className="text-xs text-gray-600">Teachings</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <ClipboardCheck className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-tpc-navy">{data.assessments_completed}</p>
            <p className="text-xs text-gray-600">Assessments</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-tpc-navy">{data.events_attended}</p>
            <p className="text-xs text-gray-600">Events</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <Gift className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-tpc-navy">{data.donations_made}</p>
            <p className="text-xs text-gray-600">Gifts Given</p>
          </div>
        </div>

        {/* CTA */}
        <Link href="/my-assessments">
          <Button variant="outline" className="w-full border-tpc-navy/20 text-tpc-navy hover:bg-tpc-navy/5">
            <Trophy className="h-4 w-4 mr-2 text-tpc-gold" />
            Take an Assessment
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

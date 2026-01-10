'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Flame,
  Trophy,
  Target,
  BookOpen,
  Heart,
  Calendar,
  TrendingUp,
  Zap,
  Star,
  ArrowRight
} from 'lucide-react'

interface EngagementData {
  current_streak: number
  longest_streak: number
  engagement_score: number
  total_days_active: number
  devotionals_read: number
  prayers_submitted: number
  prayers_prayed_for: number
  content_viewed: number
  events_attended: number
  donations_made: number
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
        // Try auth_user_id
        const { data: memberAlt } = await supabase
          .from('members')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()
        if (!memberAlt) return
      }

      const memberId = member?.id

      // Get engagement streak data
      const { data: streak } = await supabase
        .from('engagement_streaks')
        .select('*')
        .eq('member_id', memberId)
        .single()

      if (streak) {
        setData({
          current_streak: streak.current_streak || 0,
          longest_streak: streak.longest_streak || 0,
          engagement_score: streak.engagement_score || 0,
          total_days_active: streak.total_days_active || 0,
          devotionals_read: streak.devotionals_read || 0,
          prayers_submitted: streak.prayers_submitted || 0,
          prayers_prayed_for: streak.prayers_prayed_for || 0,
          content_viewed: streak.content_viewed || 0,
          events_attended: streak.events_attended || 0,
          donations_made: streak.donations_made || 0
        })
      } else {
        // Initialize with defaults if no streak record exists
        setData({
          current_streak: 0,
          longest_streak: 0,
          engagement_score: 0,
          total_days_active: 0,
          devotionals_read: 0,
          prayers_submitted: 0,
          prayers_prayed_for: 0,
          content_viewed: 0,
          events_attended: 0,
          donations_made: 0
        })
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your streak today!"
    if (streak === 1) return "Great start! Keep it going!"
    if (streak < 7) return "You're building momentum!"
    if (streak < 30) return "Amazing consistency!"
    if (streak < 100) return "You're on fire!"
    return "Legendary dedication!"
  }

  const getScoreLevel = (score: number) => {
    if (score < 100) return { level: 'Newcomer', color: 'bg-gray-500', next: 100 }
    if (score < 300) return { level: 'Explorer', color: 'bg-blue-500', next: 300 }
    if (score < 600) return { level: 'Committed', color: 'bg-green-500', next: 600 }
    if (score < 1000) return { level: 'Devoted', color: 'bg-purple-500', next: 1000 }
    if (score < 2000) return { level: 'Faithful', color: 'bg-gold', next: 2000 }
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
      <CardHeader className="bg-gradient-to-r from-navy to-navy-800 text-white pb-12">
        <div className="flex items-center justify-between">
          <div>
            <CardDescription className="text-gray-300">Your Engagement</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Flame className={`h-6 w-6 ${data.current_streak > 0 ? 'text-orange-400' : 'text-gray-400'}`} />
              {data.current_streak} Day Streak
            </CardTitle>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-300">Best Streak</p>
            <p className="text-xl font-bold">{data.longest_streak} days</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mt-2">{getStreakMessage(data.current_streak)}</p>
      </CardHeader>

      <CardContent className="-mt-8 space-y-6">
        {/* Score Card */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${scoreLevel.color} flex items-center justify-center`}>
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-navy">{scoreLevel.level}</p>
                  <p className="text-xs text-gray-500">{data.engagement_score} points</p>
                </div>
              </div>
              <Badge className={`${scoreLevel.color} text-white`}>
                Level {Math.floor(data.engagement_score / 200) + 1}
              </Badge>
            </div>
            <Progress value={progressToNext} className="h-2" />
            {data.engagement_score < scoreLevel.next && (
              <p className="text-xs text-gray-500 mt-1">
                {scoreLevel.next - data.engagement_score} points to next level
              </p>
            )}
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-navy">{data.devotionals_read}</p>
            <p className="text-xs text-gray-600">Devotionals</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Heart className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-navy">{data.prayers_submitted}</p>
            <p className="text-xs text-gray-600">Prayers</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-navy">{data.total_days_active}</p>
            <p className="text-xs text-gray-600">Active Days</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Content Viewed</span>
            <span className="font-medium text-navy">{data.content_viewed}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Prayers Prayed For</span>
            <span className="font-medium text-navy">{data.prayers_prayed_for}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Events Attended</span>
            <span className="font-medium text-navy">{data.events_attended}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Donations Made</span>
            <span className="font-medium text-navy">{data.donations_made}</span>
          </div>
        </div>

        {/* CTA */}
        <Link href="/achievements">
          <Button variant="outline" className="w-full">
            <Trophy className="h-4 w-4 mr-2 text-gold" />
            View Achievements
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

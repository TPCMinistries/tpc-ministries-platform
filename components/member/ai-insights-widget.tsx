'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Heart,
  BookOpen,
  Target,
  Lightbulb,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface AIInsight {
  type: 'growth' | 'suggestion' | 'encouragement' | 'milestone'
  title: string
  message: string
  actionLabel?: string
  actionUrl?: string
  icon: 'trending' | 'heart' | 'book' | 'target' | 'lightbulb'
}

export default function AIInsightsWidget() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    generateInsights()
  }, [])

  const generateInsights = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get member data for context
      const { data: member } = await supabase
        .from('members')
        .select('id, first_name, current_streak, longest_streak, created_at')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      // Get recent activity
      const { data: recentProgress } = await supabase
        .from('member_progress')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })
        .limit(10)

      const { data: assessmentResults } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })
        .limit(3)

      // Generate personalized insights based on data
      const generatedInsights: AIInsight[] = []

      // Streak-based insights
      if (member.current_streak && member.current_streak >= 7) {
        generatedInsights.push({
          type: 'milestone',
          title: 'Amazing Consistency!',
          message: `You've maintained a ${member.current_streak}-day streak! Your dedication to daily spiritual growth is inspiring.`,
          icon: 'trending'
        })
      } else if (member.current_streak && member.current_streak >= 3) {
        generatedInsights.push({
          type: 'encouragement',
          title: 'Keep Going!',
          message: `You're on a ${member.current_streak}-day streak. Just ${7 - member.current_streak} more days to hit your first week milestone!`,
          actionLabel: 'Check In Today',
          actionUrl: '/check-in',
          icon: 'heart'
        })
      }

      // Content-based insights
      const completedCount = recentProgress?.filter(p => p.completed).length || 0
      if (completedCount >= 5) {
        generatedInsights.push({
          type: 'growth',
          title: 'Spiritual Growth Detected',
          message: `You've completed ${completedCount} teachings recently. Your hunger for God's word is evident!`,
          actionLabel: 'Explore More',
          actionUrl: '/teachings',
          icon: 'book'
        })
      } else if (completedCount < 2) {
        generatedInsights.push({
          type: 'suggestion',
          title: 'New Content Awaits',
          message: 'Discover fresh teachings tailored to your spiritual journey. Start with something short!',
          actionLabel: 'Browse Teachings',
          actionUrl: '/teachings',
          icon: 'lightbulb'
        })
      }

      // Assessment-based insights
      if (assessmentResults && assessmentResults.length > 0) {
        generatedInsights.push({
          type: 'growth',
          title: 'Know Your Gifts',
          message: 'Your spiritual gifts assessment reveals unique ways God has equipped you to serve.',
          actionLabel: 'View Results',
          actionUrl: '/assessments',
          icon: 'target'
        })
      } else {
        generatedInsights.push({
          type: 'suggestion',
          title: 'Discover Your Gifts',
          message: 'Take a spiritual gifts assessment to understand how God has uniquely gifted you.',
          actionLabel: 'Start Assessment',
          actionUrl: '/assessments',
          icon: 'target'
        })
      }

      // Days since joining insights
      const daysSinceJoining = Math.floor((Date.now() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceJoining === 7) {
        generatedInsights.unshift({
          type: 'milestone',
          title: 'One Week Anniversary!',
          message: 'Congratulations on your first week with TPC! We\'re blessed to have you on this journey.',
          icon: 'heart'
        })
      } else if (daysSinceJoining === 30) {
        generatedInsights.unshift({
          type: 'milestone',
          title: 'One Month Milestone!',
          message: 'You\'ve been growing with us for a month! Your commitment to spiritual growth is inspiring.',
          icon: 'heart'
        })
      }

      // Show top 3 insights
      setInsights(generatedInsights.slice(0, 3))
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    generateInsights()
  }

  const getIcon = (iconType: AIInsight['icon']) => {
    switch (iconType) {
      case 'trending':
        return TrendingUp
      case 'heart':
        return Heart
      case 'book':
        return BookOpen
      case 'target':
        return Target
      case 'lightbulb':
        return Lightbulb
      default:
        return Sparkles
    }
  }

  const getTypeColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'milestone':
        return 'bg-gold/20 text-gold border-gold/30'
      case 'growth':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'encouragement':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'suggestion':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gold/20 rounded-lg">
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
            <CardTitle className="text-navy dark:text-white">Personal Insights</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>AI-powered insights for your journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Check back soon for personalized insights!</p>
          </div>
        ) : (
          insights.map((insight, index) => {
            const Icon = getIcon(insight.icon)
            return (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(insight.type).split(' ')[0]}`}>
                    <Icon className={`h-4 w-4 ${getTypeColor(insight.type).split(' ')[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-navy dark:text-white text-sm">
                        {insight.title}
                      </h4>
                      <Badge variant="outline" className={`text-xs ${getTypeColor(insight.type)}`}>
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {insight.message}
                    </p>
                    {insight.actionLabel && insight.actionUrl && (
                      <Link href={insight.actionUrl}>
                        <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-gold">
                          {insight.actionLabel}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Award,
  Users,
  MessageSquare,
  BookOpen,
  Trophy,
  Flame,
  Heart,
  Sparkles,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

interface Member {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
}

interface Activity {
  id: string
  activity_type: string
  title: string
  description?: string
  metadata: Record<string, any>
  created_at: string
  member: Member
}

interface ActivityFeedProps {
  limit?: number
  showHeader?: boolean
  className?: string
}

export default function ActivityFeed({ limit = 10, showHeader = true, className }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [limit])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/community/activity?limit=${limit}`)

      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }

      const data = await response.json()
      setActivities(data.activities || [])
    } catch (err) {
      console.error('Error fetching activities:', err)
      setError('Failed to load activity feed')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, typeof Award> = {
      assessment_complete: CheckCircle,
      group_join: Users,
      badge_earned: Award,
      discussion_created: MessageSquare,
      course_complete: BookOpen,
      milestone_reached: Trophy,
      testimony_shared: Heart,
      streak_achieved: Flame
    }
    return icons[type] || Sparkles
  }

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      assessment_complete: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      group_join: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      badge_earned: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
      discussion_created: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      course_complete: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
      milestone_reached: 'text-gold bg-gold/20',
      testimony_shared: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30',
      streak_achieved: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
    }
    return colors[type] || 'text-gray-600 bg-gray-100 dark:bg-gray-800'
  }

  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Community Activity</CardTitle>
          </CardHeader>
        )}
        <CardContent className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchActivities} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              Community Activity
            </CardTitle>
            <Button onClick={fetchActivities} variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Be the first to make something happen!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.activity_type)
              const colorClass = getActivityColor(activity.activity_type)

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.member.avatar_url} />
                      <AvatarFallback className="bg-navy text-white text-sm">
                        {activity.member.first_name?.[0]}{activity.member.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">
                        {activity.member.first_name} {activity.member.last_name}
                      </span>{' '}
                      <span className="text-gray-600 dark:text-gray-400">
                        {activity.title.toLowerCase()}
                      </span>
                    </p>
                    {activity.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

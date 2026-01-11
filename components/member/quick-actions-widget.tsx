'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles,
  Sunrise,
  Heart,
  BookOpen,
  Users,
  ClipboardList,
  PenLine,
  Gift,
  Bot,
  CalendarDays,
  ArrowRight,
  CheckCircle,
  Circle
} from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  href: string
  priority: number
  completed?: boolean
  highlight?: boolean
  badge?: string
}

export default function QuickActionsWidget() {
  const [actions, setActions] = useState<QuickAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContextualActions()
  }, [])

  const fetchContextualActions = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get member info
      const { data: member } = await supabase
        .from('members')
        .select('id, avatar_url, bio')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      const contextualActions: QuickAction[] = []

      // Check today's check-in status
      const today = new Date().toISOString().split('T')[0]
      const { data: todayCheckin } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('member_id', member.id)
        .eq('date', today)
        .single()

      // Streams of Grace - primary daily spiritual practice
      contextualActions.push({
        id: 'streams-of-grace',
        label: 'Streams of Grace',
        description: 'Daily devotional & prayer',
        icon: <Sunrise className="h-5 w-5 text-amber-500" />,
        href: 'https://www.streamsofgrace.app',
        priority: 1,
        highlight: true,
        badge: 'Daily'
      })

      // Check onboarding status
      const { data: onboarding } = await supabase
        .from('member_onboarding')
        .select('*')
        .eq('member_id', member.id)
        .single()

      // Profile completion
      if (!member.avatar_url || !member.bio) {
        contextualActions.push({
          id: 'complete-profile',
          label: 'Complete Profile',
          description: 'Add your photo and bio',
          icon: <Circle className="h-5 w-5 text-orange-500" />,
          href: '/account',
          priority: 2,
          badge: 'Setup'
        })
      }

      // Take first assessment
      if (onboarding && !onboarding.assessment_taken) {
        contextualActions.push({
          id: 'take-assessment',
          label: 'Discover Your Gifts',
          description: 'Take a spiritual assessment',
          icon: <ClipboardList className="h-5 w-5 text-purple-500" />,
          href: '/my-assessments',
          priority: 3,
          badge: 'New'
        })
      }

      // Check for unread messages
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      // Standard actions
      const standardActions: QuickAction[] = [
        {
          id: 'ask-ai',
          label: 'Ask Prophet Lorenzo',
          description: 'Get spiritual guidance',
          icon: <Bot className="h-5 w-5 text-navy" />,
          href: '/ask-prophet-lorenzo',
          priority: 4,
          highlight: true,
          badge: 'AI'
        },
        {
          id: 'assessments',
          label: 'Assessments',
          description: 'Discover your gifts',
          icon: <ClipboardList className="h-5 w-5 text-purple-500" />,
          href: '/my-assessments',
          priority: 5
        },
        {
          id: 'journal',
          label: 'My Journal',
          description: 'Write your reflections',
          icon: <PenLine className="h-5 w-5 text-blue-500" />,
          href: '/journal',
          priority: 6
        },
        {
          id: 'library',
          label: 'Library',
          description: 'Browse teachings',
          icon: <BookOpen className="h-5 w-5 text-green-600" />,
          href: '/library',
          priority: 7
        },
        {
          id: 'groups',
          label: 'My Groups',
          description: 'Connect with community',
          icon: <Users className="h-5 w-5 text-indigo-500" />,
          href: '/groups',
          priority: 8
        },
        {
          id: 'events',
          label: 'Upcoming Events',
          description: 'See what\'s happening',
          icon: <CalendarDays className="h-5 w-5 text-teal-500" />,
          href: '/events',
          priority: 9
        },
        {
          id: 'give',
          label: 'Give',
          description: 'Support the ministry',
          icon: <Gift className="h-5 w-5 text-gold" />,
          href: '/my-giving',
          priority: 10
        }
      ]

      // Combine and sort by priority
      const allActions = [...contextualActions, ...standardActions]
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 6) // Show top 6 actions

      setActions(allActions)
    } catch (error) {
      console.error('Error fetching actions:', error)
      // Fallback actions
      setActions([
        {
          id: 'streams-of-grace',
          label: 'Streams of Grace',
          description: 'Daily devotional',
          icon: <Sunrise className="h-5 w-5 text-amber-500" />,
          href: 'https://www.streamsofgrace.app',
          priority: 1,
          highlight: true
        },
        {
          id: 'assessments',
          label: 'Assessments',
          description: 'Discover your gifts',
          icon: <ClipboardList className="h-5 w-5 text-purple-500" />,
          href: '/my-assessments',
          priority: 2
        },
        {
          id: 'library',
          label: 'Library',
          description: 'Browse teachings',
          icon: <BookOpen className="h-5 w-5 text-green-600" />,
          href: '/library',
          priority: 3
        },
        {
          id: 'groups',
          label: 'Groups',
          description: 'Connect with others',
          icon: <Users className="h-5 w-5 text-indigo-500" />,
          href: '/groups',
          priority: 4
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-navy dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link key={action.id} href={action.href}>
              <Button
                variant="outline"
                className={`w-full h-auto py-3 px-3 flex flex-col items-start gap-1.5 text-left transition-all hover:shadow-md dark:border-gray-600 dark:hover:bg-gray-700 ${
                  action.highlight
                    ? 'border-gold/50 bg-gradient-to-br from-gold/5 to-amber-50 dark:from-gold/10 dark:to-amber-900/20 hover:border-gold'
                    : action.completed
                    ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  {action.icon}
                  {action.badge && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        action.badge === 'AI'
                          ? 'bg-gold/10 text-gold border-gold/30'
                          : action.badge === 'Today'
                          ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                          : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                      }`}
                    >
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <div className="w-full">
                  <span className={`text-sm font-medium block truncate ${
                    action.completed ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'
                  }`}>
                    {action.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                    {action.description}
                  </span>
                </div>
              </Button>
            </Link>
          ))}
        </div>

        {/* View all actions link */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:text-navy dark:hover:text-gold transition-colors">
            See all features
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

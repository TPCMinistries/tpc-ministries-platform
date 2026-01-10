'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Flame,
  Calendar,
  Heart,
  MessageCircle,
  Gift,
  BookOpen,
  Trophy,
  X,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  action_url?: string
  is_read: boolean
  created_at: string
}

interface NotificationCenterProps {
  variant?: 'full' | 'compact' | 'dropdown'
  limit?: number
  showHeader?: boolean
}

export default function NotificationCenter({
  variant = 'full',
  limit = 20,
  showHeader = true
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
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

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (filter === 'unread') {
        query = query.eq('is_read', false)
      }

      const { data } = await query

      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, limit])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `member_id=eq.${member.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev])
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupRealtime()
  }, [])

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    setMarkingRead(notificationId)

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    } finally {
      setMarkingRead(null)
    }
  }

  const markAllAsRead = async () => {
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
        .from('notifications')
        .update({ is_read: true })
        .eq('member_id', member.id)
        .eq('is_read', false)

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const dismissNotification = async (notificationId: string) => {
    const supabase = createClient()

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'streak_warning':
      case 'streak':
        return { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/20' }
      case 'event':
      case 'reminder':
        return { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/20' }
      case 'prayer':
        return { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/20' }
      case 'message':
      case 'reply':
        return { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/20' }
      case 'gift':
      case 'donation':
        return { icon: Gift, color: 'text-gold', bg: 'bg-gold/20' }
      case 'content':
      case 'teaching':
        return { icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/20' }
      case 'achievement':
      case 'milestone':
        return { icon: Trophy, color: 'text-gold', bg: 'bg-gold/20' }
      default:
        return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-500/20' }
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  const displayedNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications

  if (loading && variant === 'compact') {
    return (
      <div className="flex items-center justify-center py-4">
        <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    )
  }

  // Compact variant for dropdown
  if (variant === 'compact' || variant === 'dropdown') {
    return (
      <div className="w-full max-w-sm">
        {showHeader && (
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <ScrollArea className="h-64">
          {displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <BellOff className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {displayedNotifications.slice(0, 5).map((notification) => {
                const { icon: Icon, color, bg } = getNotificationIcon(notification.type)
                return (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {notification.action_url && (
                        <Link href={notification.action_url}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
        {displayedNotifications.length > 5 && (
          <div className="p-2 border-t dark:border-gray-700">
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="w-full">
                View All Notifications
              </Button>
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Full variant
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gold" />
            <CardTitle className="text-navy dark:text-white">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={fetchNotifications}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription>Stay updated with your spiritual journey</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <NotificationList
              notifications={displayedNotifications}
              markAsRead={markAsRead}
              dismissNotification={dismissNotification}
              markingRead={markingRead}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <NotificationList
              notifications={displayedNotifications}
              markAsRead={markAsRead}
              dismissNotification={dismissNotification}
              markingRead={markingRead}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function NotificationList({
  notifications,
  markAsRead,
  dismissNotification,
  markingRead,
  getNotificationIcon
}: {
  notifications: Notification[]
  markAsRead: (id: string) => void
  dismissNotification: (id: string) => void
  markingRead: string | null
  getNotificationIcon: (type: string) => { icon: any; color: string; bg: string }
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <BellOff className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-lg font-medium">No notifications</p>
        <p className="text-sm">You're all caught up!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const { icon: Icon, color, bg } = getNotificationIcon(notification.type)
        return (
          <div
            key={notification.id}
            className={`relative p-4 rounded-lg border transition-all ${
              !notification.is_read
                ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => markAsRead(notification.id)}
                      disabled={markingRead === notification.id}
                    >
                      {markingRead === notification.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Mark read
                        </>
                      )}
                    </Button>
                  )}
                  {notification.action_url && (
                    <Link href={notification.action_url}>
                      <Button variant="link" size="sm" className="h-6 text-xs text-gold">
                        View
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {!notification.is_read && (
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500" />
            )}
          </div>
        )
      })}
    </div>
  )
}

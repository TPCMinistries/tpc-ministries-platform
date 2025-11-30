'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  BookOpen,
  Heart,
  Trophy,
  Users,
  MessageCircle,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  body?: string
  notification_type: string
  action_url?: string
  is_read: boolean
  created_at: string
}

interface NotificationPrefs {
  push_enabled: boolean
  email_enabled: boolean
  email_digest: string
  notify_devotional_reminder: boolean
  notify_prayer_answered: boolean
  notify_new_content: boolean
  notify_group_activity: boolean
  notify_achievement_unlocked: boolean
  notify_streak_at_risk: boolean
  notify_prophecy_received: boolean
  notify_event_reminder: boolean
  notify_messages: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    fetchMember()
  }, [])

  useEffect(() => {
    if (memberId) {
      fetchNotifications()
      fetchPreferences()
    }
  }, [memberId, filter])

  const fetchMember = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (member) setMemberId(member.id)
    }
  }

  const fetchNotifications = async () => {
    if (!memberId) return

    const supabase = createClient()
    setLoading(true)

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (filter === 'unread') {
      query = query.eq('is_read', false)
    }

    const { data } = await query
    if (data) setNotifications(data)
    setLoading(false)
  }

  const fetchPreferences = async () => {
    if (!memberId) return

    const supabase = createClient()
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('member_id', memberId)
      .single()

    if (data) {
      setPrefs(data)
    } else {
      // Create default preferences
      const defaultPrefs = {
        member_id: memberId,
        push_enabled: true,
        email_enabled: true,
        email_digest: 'daily',
        notify_devotional_reminder: true,
        notify_prayer_answered: true,
        notify_new_content: true,
        notify_group_activity: true,
        notify_achievement_unlocked: true,
        notify_streak_at_risk: true,
        notify_prophecy_received: true,
        notify_event_reminder: true,
        notify_messages: true
      }

      await supabase.from('notification_preferences').insert(defaultPrefs)
      setPrefs(defaultPrefs as any)
    }
  }

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)

    fetchNotifications()
  }

  const markAllAsRead = async () => {
    if (!memberId) return

    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('member_id', memberId)
      .eq('is_read', false)

    fetchNotifications()
  }

  const deleteNotification = async (id: string) => {
    const supabase = createClient()
    await supabase.from('notifications').delete().eq('id', id)
    fetchNotifications()
  }

  const updatePreference = async (key: string, value: boolean | string) => {
    if (!memberId || !prefs) return

    const supabase = createClient()
    await supabase
      .from('notification_preferences')
      .update({ [key]: value })
      .eq('member_id', memberId)

    setPrefs({ ...prefs, [key]: value })
  }

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      devotional: BookOpen,
      prayer: Heart,
      achievement: Trophy,
      group: Users,
      message: MessageCircle,
      event: Calendar,
      prophecy: Sparkles,
      system: AlertCircle
    }
    return icons[type] || Bell
  }

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      devotional: 'text-blue-500 bg-blue-50',
      prayer: 'text-purple-500 bg-purple-50',
      achievement: 'text-gold bg-gold/10',
      group: 'text-green-500 bg-green-50',
      message: 'text-navy bg-navy/10',
      event: 'text-orange-500 bg-orange-50',
      prophecy: 'text-amber-500 bg-amber-50',
      system: 'text-gray-500 bg-gray-50'
    }
    return colors[type] || 'text-gray-500 bg-gray-50'
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <Bell className="h-6 w-6 text-gold" />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && prefs && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Global Settings */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={prefs.push_enabled}
                    onChange={(e) => updatePreference('push_enabled', e.target.checked)}
                    className="rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={prefs.email_enabled}
                    onChange={(e) => updatePreference('email_enabled', e.target.checked)}
                    className="rounded"
                  />
                </label>
              </div>

              {/* Notification Types */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Notify me about:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'notify_devotional_reminder', label: 'Devotional Reminders', icon: BookOpen },
                    { key: 'notify_prayer_answered', label: 'Prayer Answers', icon: Heart },
                    { key: 'notify_achievement_unlocked', label: 'Achievements', icon: Trophy },
                    { key: 'notify_group_activity', label: 'Group Activity', icon: Users },
                    { key: 'notify_streak_at_risk', label: 'Streak Warnings', icon: AlertCircle },
                    { key: 'notify_new_content', label: 'New Content', icon: Sparkles },
                    { key: 'notify_event_reminder', label: 'Events', icon: Calendar },
                    { key: 'notify_messages', label: 'Messages', icon: MessageCircle }
                  ].map(({ key, label, icon: Icon }) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(prefs as any)[key]}
                        onChange={(e) => updatePreference(key, e.target.checked)}
                        className="rounded"
                      />
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-navy' : ''}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? 'bg-navy' : ''}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No notifications</h3>
              <p className="text-gray-500 mt-1">
                {filter === 'unread' ? 'You\'re all caught up!' : 'You\'ll see your notifications here'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => {
              const Icon = getNotificationIcon(notification.notification_type)
              const colorClass = getNotificationColor(notification.notification_type)

              return (
                <Card
                  key={notification.id}
                  className={`transition-all ${!notification.is_read ? 'bg-blue-50/50 border-blue-200' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-medium ${!notification.is_read ? 'text-navy' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            {notification.body && (
                              <p className="text-sm text-gray-600 mt-0.5">{notification.body}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Action Button */}
                        {notification.action_url && (
                          <Link href={notification.action_url}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => markAsRead(notification.id)}
                            >
                              View Details
                            </Button>
                          </Link>
                        )}
                      </div>

                      {/* Unread Indicator */}
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

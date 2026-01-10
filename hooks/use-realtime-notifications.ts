'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Notification {
  id: string
  member_id: string
  title: string
  body: string
  notification_type: string
  action_url: string | null
  is_read: boolean
  is_sent: boolean
  created_at: string
}

interface UseRealtimeNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

export function useRealtimeNotifications(memberId: string | null): UseRealtimeNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!memberId) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        console.error('Error fetching notifications:', fetchError)
        setError('Failed to load notifications')
        return
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
      setError(null)
    } catch (err) {
      console.error('Error in fetchNotifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Set up real-time subscription
  useEffect(() => {
    if (!memberId) return

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const setupRealtime = () => {
      channel = supabase
        .channel(`notifications:${memberId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `member_id=eq.${memberId}`,
          },
          (payload) => {
            // Add new notification to the top of the list
            const newNotification = payload.new as Notification
            setNotifications(prev => [newNotification, ...prev])
            setUnreadCount(prev => prev + 1)

            // Optional: Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.body,
                icon: '/icons/icon-192x192.png',
              })
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `member_id=eq.${memberId}`,
          },
          (payload) => {
            // Update notification in the list
            const updatedNotification = payload.new as Notification
            setNotifications(prev =>
              prev.map(n => (n.id === updatedNotification.id ? updatedNotification : n))
            )
            // Recalculate unread count
            setNotifications(prev => {
              setUnreadCount(prev.filter(n => !n.is_read).length)
              return prev
            })
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `member_id=eq.${memberId}`,
          },
          (payload) => {
            // Remove notification from the list
            const deletedId = (payload.old as { id: string }).id
            setNotifications(prev => prev.filter(n => n.id !== deletedId))
          }
        )
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [memberId])

  const markAsRead = useCallback(async (id: string) => {
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (updateError) {
        console.error('Error marking as read:', updateError)
        return
      }

      // Optimistically update local state
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error in markAsRead:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!memberId) return

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('member_id', memberId)
        .eq('is_read', false)

      if (updateError) {
        console.error('Error marking all as read:', updateError)
        return
      }

      // Optimistically update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error in markAllAsRead:', err)
    }
  }, [memberId])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}

// Hook to request browser notification permission
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (err) {
      console.error('Error requesting notification permission:', err)
      return false
    }
  }, [])

  return { permission, requestPermission }
}

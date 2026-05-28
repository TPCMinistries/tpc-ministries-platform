'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Bell, LogOut, Search, ChevronDown, Download, Check, Loader2, Keyboard, ChevronRight } from 'lucide-react'
import { ThemeToggleButton } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import KeyboardShortcutsModal from './keyboard-shortcuts-modal'
import { useReducedMotion } from 'framer-motion'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  body: string
  notification_type?: string
  type?: string
  action_url?: string
  url?: string
  is_read: boolean
  created_at: string
}

interface MemberTopBarProps {
  member: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
    tier?: string
    bio?: string
    phone?: string
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Breadcrumb label map
const BREADCRUMB_LABELS: Record<string, string> = {
  'dashboard': 'Dashboard',
  'kenya-trip': 'Kenya 2026',
  'messages': 'Messages',
  'ask-prophet-lorenzo': 'Ask Prophet Lorenzo',
  'journal': 'My Journal',
  'library': 'Library',
  'learning': 'Learning Paths',
  'my-assessments': 'My Assessments',
  'groups': 'Groups',
  'connections': 'Connections',
  'events': 'Events',
  'live': 'Live Stream',
  'my-journey': 'My Journey',
  'my-giving': 'Giving',
  'account': 'Account',
  'profile': 'Profile',
  'notifications': 'Notifications',
  'partner': 'Partner',
  'member-settings': 'Settings',
  'admin-command-center': 'Admin Command Center',
  'admin-dashboard': 'Classic Admin Dashboard',
  'kenya-command-center': 'Kenya 2026 Command',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function ProfileCompletionRing({ member }: { member: MemberTopBarProps['member'] }) {
  // Calculate profile completion: avatar, bio, phone (3 fields)
  let filled = 0
  if (member.avatar_url) filled++
  if (member.bio) filled++
  if (member.phone) filled++
  const total = 3
  const percentage = Math.round((filled / total) * 100)

  if (percentage === 100) return null

  const radius = 18
  const stroke = 3
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      className="absolute -inset-[4px]"
      aria-label={`Profile ${percentage}% complete`}
    >
      {/* Background track */}
      <circle
        stroke="hsl(var(--border))"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* Progress arc */}
      <circle
        stroke="hsl(37 48% 67%)"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="transition-all duration-500"
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
    </svg>
  )
}

export default function MemberTopBar({ member }: MemberTopBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all')

  // Initialize keyboard shortcuts
  const { setShowShortcutsModal } = useKeyboardShortcuts()

  // Breadcrumbs from pathname
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((seg, i) => ({
      label: BREADCRUMB_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      href: '/' + segments.slice(0, i + 1).join('/'),
      isLast: i === segments.length - 1,
    }))
  }, [pathname])

  const greeting = useMemo(() => getGreeting(), [])

  // Filter notifications for display
  const displayedNotifications = useMemo(() => {
    if (notifFilter === 'unread') {
      return notifications.filter(n => !n.is_read)
    }
    return notifications
  }, [notifications, notifFilter])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/member/notifications?limit=5')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }, [])

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    setMarkingAllRead(true)
    try {
      const res = await fetch('/api/member/notifications', { method: 'PATCH' })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    } finally {
      setMarkingAllRead(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      try {
        await fetch(`/api/member/notifications/${notification.id}/read`, { method: 'PATCH' })
        setNotifications(prev => prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }

    // Navigate if action URL exists
    const url = notification.action_url || notification.url
    if (url) {
      router.push(url)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Real-time notification subscription
  useEffect(() => {
    if (!member.id) return

    const supabase = createClient()

    // Subscribe to new notifications for this member
    const channel = supabase
      .channel(`notifications:${member.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `member_id=eq.${member.id}`
        },
        (payload) => {
          // Add new notification to the top of the list
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [member.id])

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      setCanInstall(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      setInstallPrompt(null)
      setCanInstall(false)
    } else {
      // iOS - open instructions
      router.push('/member-settings#install')
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-card/80 dark:bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        {/* Left: Breadcrumbs + Greeting */}
        <div className="flex-1 flex items-center gap-6 min-w-0">
          {/* Breadcrumbs (desktop) */}
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-sm min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <div key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                {crumb.isLast ? (
                  <span className="text-foreground font-medium truncate">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Ambient greeting (desktop, after search) */}
          <p className="hidden lg:block text-sm text-muted-foreground whitespace-nowrap">
            {greeting}, <span className="text-foreground font-medium">{member.first_name}</span>
          </p>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search content, seasons, assessments..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Mobile Search Icon */}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>

          {/* Keyboard Shortcuts Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setShowShortcutsModal(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggleButton />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    aria-hidden="true"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-navy hover:text-navy/80 dark:text-gold dark:hover:text-gold/80"
                    onClick={(e) => {
                      e.preventDefault()
                      markAllAsRead()
                    }}
                    disabled={markingAllRead}
                  >
                    {markingAllRead ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    Mark all read
                  </Button>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 px-2 pb-2">
                <button
                  onClick={(e) => { e.preventDefault(); setNotifFilter('all') }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    notifFilter === 'all'
                      ? 'bg-navy text-white dark:bg-gold dark:text-navy-950'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); setNotifFilter('unread') }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    notifFilter === 'unread'
                      ? 'bg-navy text-white dark:bg-gold dark:text-navy-950'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
              </div>

              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : displayedNotifications.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm">
                      {notifFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                  </div>
                ) : (
                  displayedNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      {index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        className={`flex flex-col items-start py-3 cursor-pointer ${
                          !notification.is_read ? 'bg-gold/5 dark:bg-gold/10' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-2 w-full">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-gold rounded-full mt-1.5 flex-shrink-0" />
                          )}
                          <div className={!notification.is_read ? '' : 'ml-4'}>
                            <p className="text-sm font-medium">{notification.title}</p>
                            {notification.body && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.body}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-center justify-center text-navy dark:text-gold font-medium cursor-pointer"
                onClick={() => router.push('/notifications')}
              >
                View All Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white text-sm font-semibold">
                    {member.first_name?.[0]}{member.last_name?.[0]}
                  </div>
                  <ProfileCompletionRing member={member} />
                </div>
                <span className="hidden lg:inline text-sm font-medium">
                  {member.first_name}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground font-normal">{member.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/member-settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/account')}>
                Billing & Subscription
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/partner')}>
                Upgrade Membership
              </DropdownMenuItem>
              {canInstall && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleInstall} className="text-green-600">
                    <Download className="mr-2 h-4 w-4" />
                    Install App
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />
    </header>
  )
}

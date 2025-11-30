'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  Heart as HeartIcon,
  DollarSign,
  User,
  Settings,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  ClipboardList,
  Calendar,
  Leaf,
  PenLine,
  Sun,
  ScrollText,
  HandHeart,
  Library,
  CalendarDays,
  Gift,
  Bot,
  Users,
  Trophy,
  Bell,
  Radio,
  Star,
  Utensils,
  Video,
  UserCheck,
  Sunrise,
  Cake,
  Home as HomeIcon,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface MemberSidebarProps {
  member: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
    tier?: string
    is_admin?: boolean
  }
}

export default function MemberSidebar({ member }: MemberSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const navigation = [
    // Main
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadCount },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Ask Prophet Lorenzo', href: '/ask-prophet-lorenzo', icon: Bot, highlight: true },

    // Daily Spiritual Rhythm
    { name: 'Daily Check-in', href: '/daily-checkin', icon: Sunrise },
    { name: 'Daily Devotional', href: '/devotional', icon: Sun },
    { name: 'Reading Plans', href: '/reading-plans', icon: BookOpen },
    { name: 'My Journal', href: '/journal', icon: PenLine },
    { name: 'My Prophecies', href: '/my-prophecy', icon: ScrollText },

    // Prayer & Fasting
    { name: 'Prayer Wall', href: '/prayer', icon: HeartIcon },
    { name: 'My Prayers', href: '/my-prayers', icon: HandHeart },
    { name: 'Prayer Partners', href: '/prayer-partners', icon: Users, highlight: true },
    { name: 'Fasting', href: '/fasting', icon: Utensils },

    // Learning & Growth
    { name: 'PLANT Learning', href: '/plant', icon: Leaf },
    { name: 'Sermons', href: '/sermons', icon: Video },
    { name: 'My Journey', href: '/my-journey', icon: Sparkles, highlight: true },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'My Assessments', href: '/my-assessments', icon: ClipboardList },
    { name: 'My Library', href: '/library', icon: Library },
    { name: 'Resources', href: '/resources', icon: BookOpen },

    // Community & Connection
    { name: 'Community Groups', href: '/groups', icon: Users },
    { name: 'Member Directory', href: '/directory', icon: Cake },
    { name: 'Accountability', href: '/accountability', icon: UserCheck },
    { name: 'Testimonies', href: '/testimonies', icon: Star },
    { name: 'Live Stream', href: '/live', icon: Radio },

    // Events & Service
    { name: 'Events', href: '/events', icon: CalendarDays },
    { name: 'Seasons', href: '/seasons', icon: Calendar },
    { name: 'Serve', href: '/serve', icon: HandHeart },
    { name: 'Pastoral Care', href: '/pastoral-care', icon: HeartIcon },

    // Account
    { name: 'My Family', href: '/family', icon: HomeIcon },
    { name: 'Giving', href: '/my-giving', icon: Gift },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/member-settings', icon: Settings },
  ]

  useEffect(() => {
    fetchUnreadCount()

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [member.id])

  const fetchUnreadCount = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('recipient_type', 'member')
        .eq('is_read', false)

      if (!error && data !== null) {
        setUnreadCount(data || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'covenant':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'partner':
        return 'bg-gold/20 text-gold border-gold/30'
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'covenant':
        return 'Covenant'
      case 'partner':
        return 'Partner'
      default:
        return 'Free'
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white shadow-lg"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-navy-800">
              <Sparkles className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-navy">TPC Ministries</h1>
              <p className="text-xs text-gray-500">Member Portal</p>
            </div>
          </div>

          {/* Member Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white font-semibold">
                {member.first_name?.[0]}{member.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {member.first_name} {member.last_name}
                </p>
                <Badge variant="outline" className={cn('text-xs mt-1', getTierColor(member.tier))}>
                  {getTierLabel(member.tier)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item: any) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-navy text-white'
                          : item.highlight
                          ? 'bg-gradient-to-r from-gold/20 to-amber-100 text-amber-800 border border-gold/30 hover:from-gold/30 hover:to-amber-200'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-navy'
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        item.highlight && !isActive && "text-gold"
                      )} />
                      <span className="flex-1">{item.name}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge className="bg-red-600 text-white text-xs px-2 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                      {item.highlight && !isActive && (
                        <Badge className="bg-gold text-white text-xs px-1.5 py-0">AI</Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Admin Portal Link */}
          {member.is_admin && (
            <div className="px-3 py-4 border-t border-gray-200">
              <Link href="/admin-dashboard">
                <Button className="w-full bg-navy hover:bg-navy/90 text-white">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          )}

          {/* Upgrade CTA (for free members) */}
          {member.tier === 'free' && (
            <div className="px-3 py-4 border-t border-gray-200">
              <div className="bg-gradient-to-br from-gold/10 to-navy/10 rounded-lg p-4 border border-gold/20">
                <p className="text-sm font-semibold text-navy mb-2">Upgrade Your Journey</p>
                <p className="text-xs text-gray-600 mb-3">
                  Unlock exclusive content and prophetic words
                </p>
                <Link href="/partner">
                  <Button size="sm" className="w-full bg-gold hover:bg-gold-dark text-white">
                    Become a Partner
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

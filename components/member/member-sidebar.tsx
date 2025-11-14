'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Compass,
  BookOpen,
  CheckSquare,
  Heart as HeartIcon,
  DollarSign,
  User,
  Settings,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  ClipboardList,
  Calendar
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
  }
}

export default function MemberSidebar({ member }: MemberSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const navigation = [
    { name: 'Dashboard', href: '/member/dashboard', icon: Home },
    { name: 'Messages', href: '/member/messages', icon: MessageSquare, badge: unreadCount },
    { name: 'Prayer Wall', href: '/member/prayer-wall', icon: HeartIcon },
    { name: 'My Prayers', href: '/member/my-prayers', icon: HeartIcon },
    { name: 'My Library', href: '/member/library', icon: BookOpen },
    { name: 'Seasons', href: '/member/seasons', icon: Calendar },
    { name: 'My Assessments', href: '/member/my-assessments', icon: ClipboardList },
    { name: 'Profile', href: '/member/profile', icon: User },
    { name: 'Events', href: '/member/events', icon: Sparkles },
    { name: 'Giving', href: '/member/my-giving', icon: DollarSign },
    { name: 'Resources', href: '/member/resources', icon: BookOpen },
    { name: 'Settings', href: '/member/member-settings', icon: Settings },
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
              {navigation.map((item) => {
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
                          : 'text-gray-700 hover:bg-gray-100 hover:text-navy'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge className="bg-red-600 text-white text-xs px-2 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

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

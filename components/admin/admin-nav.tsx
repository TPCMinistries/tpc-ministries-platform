'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  Brain,
  TrendingUp,
  Mic,
  LayoutDashboard,
  Users,
  MessageSquare,
  BookOpen,
  Heart,
  Calendar,
  DollarSign,
  Mail,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Leaf,
  Video,
  BarChart3,
  UserPlus,
  HandHeart
} from 'lucide-react'

interface NavSection {
  title: string
  icon: React.ReactNode
  items: NavItem[]
  defaultOpen?: boolean
}

interface NavItem {
  name: string
  href: string
  badge?: number
  highlight?: boolean
  icon?: 'brain' | 'trending' | 'mic'
}

export default function AdminNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [newLeadsCount, setNewLeadsCount] = useState(0)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'AI & Intelligence': true,
    'Overview': true,
    'People': true,
  })

  useEffect(() => {
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCounts = async () => {
    const supabase = createClient()

    try {
      const { count: messagesCount, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_type', 'admin')
        .eq('is_read', false)

      if (!messagesError && messagesCount !== null) {
        setUnreadCount(messagesCount)
      }

      const { count: leadsCount, error: leadsError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')

      if (!leadsError && leadsCount !== null) {
        setNewLeadsCount(leadsCount)
      }
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }))
  }

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      icon: <LayoutDashboard className="h-4 w-4" />,
      defaultOpen: true,
      items: [
        { name: 'Dashboard', href: '/admin-dashboard' },
        { name: 'Inbox', href: '/inbox', badge: unreadCount },
        { name: 'Analytics', href: '/analytics' },
      ]
    },
    {
      title: 'People',
      icon: <Users className="h-4 w-4" />,
      defaultOpen: true,
      items: [
        { name: 'Members', href: '/members', badge: newLeadsCount },
        { name: 'Member Care', href: '/member-care' },
      ]
    },
    {
      title: 'Content',
      icon: <BookOpen className="h-4 w-4" />,
      items: [
        { name: 'Content Library', href: '/admin-content' },
        { name: 'Daily Content', href: '/daily-content' },
        { name: 'Sermons', href: '/admin-sermons' },
      ]
    },
    {
      title: 'Learning',
      icon: <Leaf className="h-4 w-4" />,
      items: [
        { name: 'PLANT Courses', href: '/admin-plant' },
        { name: 'Assessments', href: '/assessments-management' },
      ]
    },
    {
      title: 'Community',
      icon: <Heart className="h-4 w-4" />,
      items: [
        { name: 'Groups', href: '/admin-groups' },
        { name: 'Prayer Requests', href: '/prayers' },
        { name: 'Testimonies', href: '/admin-testimonies' },
        { name: 'Events', href: '/admin-events' },
      ]
    },
    {
      title: 'Finance',
      icon: <DollarSign className="h-4 w-4" />,
      items: [
        { name: 'Giving', href: '/admin-giving' },
      ]
    },
    {
      title: 'Prophetic',
      icon: <Sparkles className="h-4 w-4" />,
      items: [
        { name: 'Prophecy Queue', href: '/admin-prophecy' },
      ]
    },
    {
      title: 'AI & Automation',
      icon: <Brain className="h-4 w-4" />,
      items: [
        { name: 'AI Hub', href: '/admin-command-center', highlight: true, icon: 'brain' },
        { name: 'Workflows', href: '/admin-workflows' },
      ]
    },
    {
      title: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      items: [
        { name: 'General Settings', href: '/admin-settings' },
      ]
    },
  ]

  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto">
      <div className="space-y-1">
        {navSections.map((section) => {
          const isOpen = openSections[section.title] ?? section.defaultOpen ?? false
          const hasActiveItem = section.items.some(
            item => pathname === item.href || pathname.startsWith(item.href + '/')
          )

          return (
            <div key={section.title} className="mb-2">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors',
                  hasActiveItem
                    ? 'text-gold'
                    : 'text-gray-400 hover:text-gray-200'
                )}
              >
                {section.icon}
                <span className="flex-1 text-left">{section.title}</span>
                {isOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>

              {/* Section Items */}
              {isOpen && (
                <div className="ml-2 mt-1 space-y-0.5 border-l border-gray-700 pl-3">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-gold text-navy font-medium'
                            : item.highlight
                            ? 'text-purple-300 hover:bg-purple-600/20'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        )}
                      >
                        {item.highlight && !isActive && item.icon === 'brain' && (
                          <Brain className="h-3.5 w-3.5 text-purple-400" />
                        )}
                        {item.highlight && !isActive && item.icon === 'trending' && (
                          <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
                        )}
                        {!isActive && item.icon === 'mic' && (
                          <Mic className="h-3.5 w-3.5 text-gold" />
                        )}
                        <span className="flex-1">{item.name}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge className="bg-red-600 text-white text-xs px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center">
                            {item.badge}
                          </Badge>
                        )}
                        {item.highlight && !isActive && (
                          <Badge className="bg-purple-600/80 text-white text-[10px] px-1 py-0">AI</Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

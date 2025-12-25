'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BookOpen,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronRight,
  Brain,
  Calendar,
  Heart,
  Video,
  FileText,
  HandHeart,
  Sparkles,
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
}

export default function AdminNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [newLeadsCount, setNewLeadsCount] = useState(0)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Main': true,
    'People & Community': true,
  })

  useEffect(() => {
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCounts = async () => {
    const supabase = createClient()

    try {
      // Count unread emails
      const { count: emailCount } = await supabase
        .from('inbox_emails')
        .select('*', { count: 'exact', head: true })
        .eq('folder', 'inbox')
        .eq('is_read', false)

      // Count unread SMS conversations
      const { count: smsCount } = await supabase
        .from('sms_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('is_unread', true)
        .eq('is_archived', false)

      setUnreadCount((emailCount || 0) + (smsCount || 0))

      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')

      if (leadsCount !== null) {
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
      title: 'Main',
      icon: <LayoutDashboard className="h-4 w-4" />,
      defaultOpen: true,
      items: [
        { name: 'Dashboard', href: '/admin-dashboard' },
        { name: 'Communications', href: '/communications', badge: unreadCount },
      ]
    },
    {
      title: 'People & Community',
      icon: <Users className="h-4 w-4" />,
      defaultOpen: true,
      items: [
        { name: 'Members', href: '/members', badge: newLeadsCount },
        { name: 'Member Care', href: '/member-care' },
        { name: 'Groups', href: '/admin-groups' },
        { name: 'Events', href: '/admin-events' },
        { name: 'Volunteers', href: '/admin-volunteer' },
        { name: 'Prayers', href: '/prayers' },
        { name: 'Testimonies', href: '/admin-testimonies' },
      ]
    },
    {
      title: 'Content',
      icon: <BookOpen className="h-4 w-4" />,
      items: [
        { name: 'Content Library', href: '/admin-content' },
        { name: 'Sermons', href: '/admin-sermons' },
        { name: 'Daily Content', href: '/daily-content' },
        { name: 'Resources', href: '/admin-resources' },
        { name: 'Media', href: '/media' },
        { name: 'PLANT Courses', href: '/admin-plant' },
      ]
    },
    {
      title: 'Finance',
      icon: <DollarSign className="h-4 w-4" />,
      items: [
        { name: 'Giving Overview', href: '/admin-giving' },
        { name: 'Donations', href: '/donations' },
      ]
    },
    {
      title: 'AI Tools',
      icon: <Brain className="h-4 w-4" />,
      items: [
        { name: 'Command Center', href: '/admin-command-center' },
        { name: 'Predictions', href: '/admin-predictive' },
        { name: 'Giving Forecast', href: '/admin-giving-forecast' },
        { name: 'Workflows', href: '/admin-workflows' },
      ]
    },
    {
      title: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      items: [
        { name: 'Settings', href: '/admin-settings' },
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
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        )}
                      >
                        <span className="flex-1">{item.name}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge className="bg-red-600 text-white text-xs px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center">
                            {item.badge}
                          </Badge>
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

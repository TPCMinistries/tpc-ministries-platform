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
      title: 'AI & Intelligence',
      icon: <Brain className="h-4 w-4" />,
      defaultOpen: true,
      items: [
        { name: 'Command Center', href: '/admin-command-center', highlight: true, icon: 'brain' },
        { name: 'Predictive Analytics', href: '/admin-predictive', highlight: true, icon: 'trending' },
        { name: 'Giving Forecast', href: '/admin-giving-forecast', highlight: true, icon: 'trending' },
        { name: 'AI Sermon Notes', href: '/admin-sermon-notes', highlight: true, icon: 'brain' },
        { name: 'Volunteer Scheduler', href: '/admin-volunteer-scheduler', highlight: true, icon: 'brain' },
        { name: 'Workflows', href: '/admin-workflows' },
      ]
    },
    {
      title: 'Overview',
      icon: <LayoutDashboard className="h-4 w-4" />,
      defaultOpen: true,
      items: [
        { name: 'Dashboard', href: '/admin-dashboard' },
        { name: 'Messages', href: '/admin-messages', badge: unreadCount },
        { name: 'Voice Messages', href: '/admin-voice-messages', icon: 'mic' },
        { name: 'Analytics', href: '/analytics' },
        { name: 'Ministry Reports', href: '/admin-reports' },
      ]
    },
    {
      title: 'People',
      icon: <Users className="h-4 w-4" />,
      defaultOpen: true,
      items: [
        { name: 'Members', href: '/members' },
        { name: 'Leads', href: '/leads', badge: newLeadsCount },
        { name: 'Invites', href: '/admin-invites' },
        { name: 'Member Insights', href: '/admin-insights' },
        { name: 'Celebrations', href: '/admin-celebrations' },
        { name: 'Pastoral Care', href: '/admin-pastoral' },
      ]
    },
    {
      title: 'Spiritual Growth',
      icon: <BookOpen className="h-4 w-4" />,
      items: [
        { name: 'Daily Scripture', href: '/admin-scripture' },
        { name: 'Devotionals', href: '/admin-devotionals' },
        { name: 'Reading Plans', href: '/admin-reading-plans' },
        { name: 'Sermons', href: '/admin-sermons' },
        { name: 'Fasting Events', href: '/admin-fasting' },
      ]
    },
    {
      title: 'Prophetic',
      icon: <Sparkles className="h-4 w-4" />,
      items: [
        { name: 'Prophecy Queue', href: '/admin-prophecy' },
        { name: 'AI Training', href: '/admin-ai-training' },
      ]
    },
    {
      title: 'Learning (PLANT)',
      icon: <Leaf className="h-4 w-4" />,
      items: [
        { name: 'Course Manager', href: '/admin-plant' },
        { name: 'Content Library', href: '/admin-content' },
      ]
    },
    {
      title: 'Community',
      icon: <Heart className="h-4 w-4" />,
      items: [
        { name: 'Community Groups', href: '/admin-groups' },
        { name: 'Testimonies', href: '/admin-testimonies' },
        { name: 'Volunteer Teams', href: '/admin-volunteer' },
        { name: 'Assessments', href: '/assessments-management' },
      ]
    },
    {
      title: 'Events & Media',
      icon: <Video className="h-4 w-4" />,
      items: [
        { name: 'Events', href: '/admin-events' },
        { name: 'Live Streams', href: '/admin-live' },
        { name: 'Media Library', href: '/media' },
      ]
    },
    {
      title: 'Finance',
      icon: <DollarSign className="h-4 w-4" />,
      items: [
        { name: 'Giving Overview', href: '/admin-giving' },
        { name: 'Donations', href: '/donations' },
        { name: 'Prayer Requests', href: '/prayers' },
      ]
    },
    {
      title: 'Communications',
      icon: <Mail className="h-4 w-4" />,
      items: [
        { name: 'Email Inbox', href: '/admin-inbox' },
        { name: 'SMS Inbox', href: '/sms-inbox' },
        { name: 'Campaigns', href: '/communications' },
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

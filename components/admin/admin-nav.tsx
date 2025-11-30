'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Brain, TrendingUp } from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [newLeadsCount, setNewLeadsCount] = useState(0)

  useEffect(() => {
    fetchCounts()

    // Poll for new messages and leads every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCounts = async () => {
    const supabase = createClient()

    try {
      // Fetch unread messages count
      const { count: messagesCount, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_type', 'admin')
        .eq('is_read', false)

      if (!messagesError && messagesCount !== null) {
        setUnreadCount(messagesCount)
      }

      // Fetch new leads count
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

  const navItems = [
    // AI & Intelligence
    { name: 'AI Command Center', href: '/admin-command-center', highlight: true, icon: 'brain' },
    { name: 'Predictive Analytics', href: '/admin-predictive', highlight: true, icon: 'trending' },
    { name: 'Giving Forecast', href: '/admin-giving-forecast', highlight: true, icon: 'trending' },
    { name: 'AI Sermon Notes', href: '/admin-sermon-notes', highlight: true, icon: 'brain' },
    { name: 'Workflows', href: '/admin-workflows' },
    // Main
    { name: 'Dashboard', href: '/admin-dashboard' },
    { name: 'Messages', href: '/admin-messages', badge: unreadCount },
    { name: 'Leads', href: '/leads' },
    // People
    { name: 'Members', href: '/members' },
    { name: 'Invites', href: '/admin-invites' },
    { name: 'Member Insights', href: '/admin-insights' },
    { name: 'Celebrations', href: '/admin-celebrations' },
    { name: 'Pastoral Care', href: '/admin-pastoral' },
    // Engagement
    { name: 'Daily Scripture', href: '/admin-scripture' },
    { name: 'Reading Plans', href: '/admin-reading-plans' },
    { name: 'Sermons', href: '/admin-sermons' },
    { name: 'Fasting Events', href: '/admin-fasting' },
    // Content
    { name: 'Content', href: '/admin-content' },
    { name: 'Devotionals', href: '/admin-devotionals' },
    { name: 'PLANT LMS', href: '/admin-plant' },
    { name: 'AI Training', href: '/admin-ai-training' },
    { name: 'Prophecy', href: '/admin-prophecy' },
    // Community
    { name: 'Community Groups', href: '/admin-groups' },
    { name: 'Testimonies', href: '/admin-testimonies' },
    { name: 'Volunteer Teams', href: '/admin-volunteer' },
    { name: 'AI Volunteer Scheduler', href: '/admin-volunteer-scheduler', highlight: true, icon: 'brain' },
    // Events & Media
    { name: 'Events', href: '/admin-events' },
    { name: 'Live Streams', href: '/admin-live' },
    { name: 'Media Library', href: '/media' },
    // Finance
    { name: 'Giving', href: '/admin-giving' },
    { name: 'Donations', href: '/donations' },
    { name: 'Prayers', href: '/prayers' },
    // Operations
    { name: 'Email Inbox', href: '/admin-inbox' },
    { name: 'SMS Inbox', href: '/sms-inbox' },
    { name: 'Communications', href: '/communications' },
    { name: 'Assessments', href: '/assessments-management' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Ministry Reports', href: '/admin-reports' },
    { name: 'Settings', href: '/admin-settings' },
  ]

  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto">
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gold text-navy'
                  : (item as any).highlight
                  ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30 hover:from-purple-600/30 hover:to-indigo-600/30'
                  : 'text-gray-300 hover:bg-navy-800 hover:text-white'
              )}
            >
              {(item as any).highlight && !isActive && (item as any).icon === 'brain' && (
                <Brain className="h-4 w-4 text-purple-400" />
              )}
              {(item as any).highlight && !isActive && (item as any).icon === 'trending' && (
                <TrendingUp className="h-4 w-4 text-purple-400" />
              )}
              <span className="flex-1">{item.name}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge className="bg-red-600 text-white text-xs px-2 py-0.5">
                  {item.badge}
                </Badge>
              )}
              {(item as any).highlight && !isActive && (
                <Badge className="bg-purple-600 text-white text-xs px-1.5 py-0">AI</Badge>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

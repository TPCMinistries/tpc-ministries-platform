'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

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
    { name: 'Dashboard', href: '/admin-dashboard' },
    { name: 'Messages', href: '/admin-messages', badge: unreadCount },
    { name: 'Leads', href: '/leads' },
    { name: 'Members', href: '/members' },
    { name: 'Events', href: '/admin-events' },
    { name: 'Donations', href: '/donations' },
    { name: 'Prayers', href: '/prayers' },
    { name: 'Content', href: '/admin-content' },
    { name: 'Prophecy', href: '/admin-prophecy' },
    { name: 'Media Library', href: '/media' },
    { name: 'Communications', href: '/communications' },
    { name: 'Assessments', href: '/assessments-management' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Settings', href: '/admin-settings' },
  ]

  return (
    <nav className="flex-1 px-3 py-4">
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
                  : 'text-gray-300 hover:bg-navy-800 hover:text-white'
              )}
            >
              <span className="flex-1">{item.name}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge className="bg-red-600 text-white text-xs px-2 py-0.5">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

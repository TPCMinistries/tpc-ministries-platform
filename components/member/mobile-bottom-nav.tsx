'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Heart as HeartIcon,
  Users,
  MessageSquare,
  User,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface MobileBottomNavProps {
  unreadMessages?: number
}

export default function MobileBottomNav({ unreadMessages = 0 }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Routine', href: '/daily-routine', icon: Sparkles, highlight: true },
    { name: 'Prayer', href: '/prayer', icon: HeartIcon },
    { name: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadMessages },
    { name: 'Profile', href: '/account', icon: User },
  ]

  const handleTap = () => {
    // Haptic feedback for supported devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 lg:hidden dark:bg-gray-900/95 dark:border-gray-800 safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleTap}
              className={cn(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl relative transition-all active:scale-95',
                isActive
                  ? 'text-navy dark:text-gold'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                item.highlight && !isActive && 'text-gold'
              )}
              aria-label={item.badge ? `${item.name}, ${item.badge} unread` : item.name}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute inset-0 bg-navy/5 dark:bg-gold/10 rounded-xl" />
              )}
              <div className="relative z-10">
                <Icon className={cn(
                  'h-6 w-6 transition-all duration-200',
                  isActive && 'scale-110',
                  item.highlight && !isActive && 'text-gold'
                )} />
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold border-2 border-white dark:border-gray-900"
                    aria-hidden="true"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                'text-[10px] mt-0.5 font-medium relative z-10',
                isActive && 'font-semibold'
              )}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-navy dark:bg-gold rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

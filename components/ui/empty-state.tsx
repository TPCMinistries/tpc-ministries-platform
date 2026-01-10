import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  BookOpen,
  Heart,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Play,
  type LucideIcon
} from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  variant?: 'default' | 'compact' | 'card'
  className?: string
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  variant = 'default',
  className = ''
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-3 flex items-center justify-center">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{title}</p>
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button size="sm" variant="outline">{action.label}</Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" onClick={action.onClick}>{action.label}</Button>
          )
        )}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 text-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-700 shadow-sm mx-auto mb-4 flex items-center justify-center">
          <Icon className="h-8 w-8 text-navy dark:text-gold" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm mx-auto">{description}</p>
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button className="bg-navy hover:bg-navy-800">{action.label}</Button>
            </Link>
          ) : (
            <Button className="bg-navy hover:bg-navy-800" onClick={action.onClick}>{action.label}</Button>
          )
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy/10 to-gold/10 mx-auto mb-6 flex items-center justify-center">
        <Icon className="h-10 w-10 text-navy dark:text-gold" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button size="lg" className="bg-navy hover:bg-navy-800">{action.label}</Button>
          </Link>
        ) : (
          <Button size="lg" className="bg-navy hover:bg-navy-800" onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  )
}

// Pre-configured empty states for common scenarios
export const emptyStates = {
  content: {
    icon: BookOpen,
    title: "Start Your Learning Journey",
    description: "Explore our library of teachings, devotionals, and resources to grow in your faith.",
    action: { label: "Browse Library", href: "/library" }
  },
  streak: {
    icon: TrendingUp,
    title: "Begin Your Streak Today",
    description: "Check in daily to build your streak and stay consistent in your spiritual walk.",
    action: { label: "Check In Now", href: "/daily-checkin" }
  },
  prayers: {
    icon: Heart,
    title: "Share Your First Prayer",
    description: "Let the community stand with you in faith. Your prayer requests are heard.",
    action: { label: "Add Prayer Request", href: "/prayer" }
  },
  groups: {
    icon: Users,
    title: "Find Your Community",
    description: "Join a group to connect with others, grow together, and build lasting friendships.",
    action: { label: "Discover Groups", href: "/groups" }
  },
  events: {
    icon: Calendar,
    title: "No Upcoming Events",
    description: "Check back soon for worship services, conferences, and community gatherings.",
    action: { label: "View Calendar", href: "/events" }
  },
  assessments: {
    icon: CheckCircle,
    title: "Discover Your Gifts",
    description: "Take an assessment to understand your spiritual gifts and find your purpose.",
    action: { label: "Start Assessment", href: "/assessments" }
  },
  continueWatching: {
    icon: Play,
    title: "Start Watching",
    description: "Begin a teaching and it will appear here so you can pick up where you left off.",
    action: { label: "Browse Teachings", href: "/library" }
  }
}

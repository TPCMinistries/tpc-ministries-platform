"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { LucideIcon, Heart, Sparkles, BookOpen, Users, Calendar, PenLine, MessageSquare, Gift, FileText, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EmptyStateType = 
  | "prayer"
  | "prophecy"
  | "teachings"
  | "groups"
  | "events"
  | "journal"
  | "messages"
  | "giving"
  | "resources"
  | "generic"

interface EmptyStateConfig {
  icon: LucideIcon
  iconColor: string
  iconBg: string
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

const emptyStateConfigs: Record<EmptyStateType, EmptyStateConfig> = {
  prayer: {
    icon: Heart,
    iconColor: "text-pink-600 dark:text-pink-400",
    iconBg: "bg-pink-100 dark:bg-pink-900/20",
    title: "Your prayers are being heard",
    description: "You haven't submitted any prayer requests yet. Our community would love to stand with you in prayer.",
    action: { label: "Share a Prayer Request", href: "/prayer/new" }
  },
  prophecy: {
    icon: Sparkles,
    iconColor: "text-tpc-gold",
    iconBg: "bg-tpc-gold/10",
    title: "Your prophetic words will appear here",
    description: "As Prophet Lorenzo shares words specifically for you, they'll be stored safely in your personal vault.",
  },
  teachings: {
    icon: Play,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/20",
    title: "Start your learning journey",
    description: "Explore our library of teachings, sermons, and prophetic messages to grow in your faith.",
    action: { label: "Browse Teachings", href: "/library" }
  },
  groups: {
    icon: Users,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/20",
    title: "Find your community",
    description: "Connect with others on the same journey. Join a group that matches your interests and calling.",
    action: { label: "Explore Groups", href: "/groups" }
  },
  events: {
    icon: Calendar,
    iconColor: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/20",
    title: "No upcoming events",
    description: "Check back soon for conferences, workshops, and gatherings. Great things are being planned!",
    action: { label: "View Calendar", href: "/events" }
  },
  journal: {
    icon: PenLine,
    iconColor: "text-tpc-navy dark:text-tpc-gold",
    iconBg: "bg-tpc-navy/10 dark:bg-tpc-gold/10",
    title: "Begin your reflection",
    description: "Journaling helps process what God is doing in your life. Start with today's thoughts.",
    action: { label: "Write First Entry", href: "/journal/new" }
  },
  messages: {
    icon: MessageSquare,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/20",
    title: "Your inbox is empty",
    description: "Messages from leadership and community members will appear here.",
  },
  giving: {
    icon: Gift,
    iconColor: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/20",
    title: "Start your giving journey",
    description: "Your generosity helps advance the Kingdom. Every gift makes an eternal impact.",
    action: { label: "Give Now", href: "/give" }
  },
  resources: {
    icon: FileText,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-900/20",
    title: "Resources coming soon",
    description: "Downloadable guides, worksheets, and ebooks will be available here.",
  },
  generic: {
    icon: BookOpen,
    iconColor: "text-gray-600 dark:text-gray-400",
    iconBg: "bg-gray-100 dark:bg-gray-800",
    title: "Nothing here yet",
    description: "Check back soon for new content.",
  }
}

interface SmartEmptyStateProps {
  type?: EmptyStateType
  customIcon?: LucideIcon
  customTitle?: string
  customDescription?: string
  customAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

export function SmartEmptyState({
  type = "generic",
  customIcon,
  customTitle,
  customDescription,
  customAction,
  className,
  size = "md"
}: SmartEmptyStateProps) {
  const config = emptyStateConfigs[type]
  const Icon = customIcon || config.icon
  const title = customTitle || config.title
  const description = customDescription || config.description
  const action = customAction || config.action

  const sizes = {
    sm: { icon: "w-12 h-12", iconInner: "h-5 w-5", title: "text-base", desc: "text-sm", padding: "p-6" },
    md: { icon: "w-16 h-16", iconInner: "h-7 w-7", title: "text-lg", desc: "text-sm", padding: "p-8" },
    lg: { icon: "w-20 h-20", iconInner: "h-9 w-9", title: "text-xl", desc: "text-base", padding: "p-12" }
  }

  const s = sizes[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center text-center", s.padding, className)}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className={cn("rounded-full flex items-center justify-center mb-4", s.icon, config.iconBg)}
      >
        <Icon className={cn(s.iconInner, config.iconColor)} />
      </motion.div>
      
      <h3 className={cn("font-semibold text-foreground mb-2", s.title)}>
        {title}
      </h3>
      
      <p className={cn("text-muted-foreground max-w-sm mb-6", s.desc)}>
        {description}
      </p>

      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : 'onClick' in action && action.onClick ? (
            <Button onClick={action.onClick}>{action.label}</Button>
          ) : (
            <Button>{action.label}</Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

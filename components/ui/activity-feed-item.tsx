"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Heart, BookOpen, Gift, Users, Calendar, 
  Sparkles, MessageSquare, Award, CheckCircle
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type ActivityType = 
  | "prayer" 
  | "teaching" 
  | "donation" 
  | "group" 
  | "event" 
  | "prophecy" 
  | "message"
  | "achievement"
  | "prayer_answered"

interface ActivityFeedItemProps {
  type: ActivityType
  title: string
  description?: string
  timestamp: string
  href?: string
  user?: {
    name: string
    avatar?: string
    initials?: string
  }
  metadata?: Record<string, any>
  className?: string
}

const typeConfig: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  prayer: { icon: Heart, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  teaching: { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  donation: { icon: Gift, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  group: { icon: Users, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  event: { icon: Calendar, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  prophecy: { icon: Sparkles, color: "text-tpc-gold", bg: "bg-tpc-gold/10" },
  message: { icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
  achievement: { icon: Award, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  prayer_answered: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
}

export function ActivityFeedItem({
  type,
  title,
  description,
  timestamp,
  href,
  user,
  metadata,
  className,
}: ActivityFeedItemProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  const content = (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg transition-colors",
      href && "hover:bg-muted/50 cursor-pointer",
      className
    )}>
      {user ? (
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-xs">
            {user.initials || user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", config.bg)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          {user && <span className="font-medium">{user.name} </span>}
          <span className={user ? "text-muted-foreground" : "font-medium"}>{title}</span>
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
      </div>

      {!user && (
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", config.bg)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

interface ActivityFeedProps {
  items: ActivityFeedItemProps[]
  maxItems?: number
  className?: string
}

export function ActivityFeed({ items, maxItems = 10, className }: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("space-y-1", className)}
    >
      {displayItems.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ActivityFeedItem {...item} />
        </motion.div>
      ))}
    </motion.div>
  )
}

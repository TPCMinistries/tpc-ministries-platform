"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  AlertTriangle, MessageSquare, UserPlus, Heart, 
  ChevronRight, CheckCircle, Clock, Bell
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type AttentionItemType = "message" | "lead" | "prayer" | "member" | "event" | "custom"

interface AttentionItem {
  id: string
  type: AttentionItemType
  title: string
  description: string
  href: string
  urgency: "high" | "medium" | "low"
  timestamp?: string
  actionLabel?: string
}

interface NeedsAttentionPanelProps {
  items: AttentionItem[]
  onDismiss?: (id: string) => void
  onAction?: (item: AttentionItem) => void
  maxItems?: number
  className?: string
}

const typeConfig: Record<AttentionItemType, { icon: React.ElementType; color: string; bg: string }> = {
  message: { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  lead: { icon: UserPlus, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  prayer: { icon: Heart, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  member: { icon: UserPlus, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  event: { icon: Bell, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  custom: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
}

const urgencyConfig = {
  high: { border: "border-l-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  medium: { border: "border-l-yellow-500", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  low: { border: "border-l-blue-500", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
}

export function NeedsAttentionPanel({
  items,
  onDismiss,
  onAction,
  maxItems = 5,
  className,
}: NeedsAttentionPanelProps) {
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set())

  const visibleItems = items
    .filter(item => !dismissedIds.has(item.id))
    .slice(0, maxItems)

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id))
    onDismiss?.(id)
  }

  if (visibleItems.length === 0) {
    return (
      <Card className={cn("border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10", className)}>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-1">All Caught Up!</h3>
          <p className="text-sm text-green-600 dark:text-green-400">No items need your attention right now.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-orange-200 dark:border-orange-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            Needs Attention
            <Badge variant="secondary" className="ml-1">
              {visibleItems.length}
            </Badge>
          </CardTitle>
          {items.length > maxItems && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin-tasks">View All</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {visibleItems.map((item, index) => {
            const config = typeConfig[item.type]
            const urgency = urgencyConfig[item.urgency]
            const Icon = config.icon

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "group flex items-start gap-3 p-3 rounded-lg border-l-4 bg-muted/30 hover:bg-muted/50 transition-colors",
                  urgency.border
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm line-clamp-1">{item.title}</span>
                    {item.urgency === "high" && (
                      <Badge className={urgency.badge} variant="secondary">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                  {item.timestamp && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleDismiss(item.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8"
                    asChild
                  >
                    <Link href={item.href}>
                      {item.actionLabel || "Handle"}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

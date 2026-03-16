"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
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
  message: { icon: MessageSquare, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  lead: { icon: UserPlus, color: "text-success dark:text-success-foreground", bg: "bg-success/10 dark:bg-success/20" },
  prayer: { icon: Heart, color: "text-spiritual dark:text-spiritual-foreground", bg: "bg-spiritual/10 dark:bg-spiritual/20" },
  member: { icon: UserPlus, color: "text-navy dark:text-navy-300", bg: "bg-navy-100 dark:bg-navy-900/30" },
  event: { icon: Bell, color: "text-warning dark:text-warning-foreground", bg: "bg-warning/10 dark:bg-warning/20" },
  custom: { icon: AlertTriangle, color: "text-gold-700 dark:text-gold-300", bg: "bg-gold-100 dark:bg-gold-900/30" },
}

const urgencyConfig = {
  high: { border: "border-l-destructive", badge: "bg-destructive/10 text-destructive dark:bg-destructive/20" },
  medium: { border: "border-l-warning", badge: "bg-warning/10 text-warning dark:bg-warning/20" },
  low: { border: "border-l-blue-500 dark:border-l-blue-400", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
}

const itemVariants = {
  initial: { opacity: 0, x: -20, height: "auto" as const },
  animate: { opacity: 1, x: 0, height: "auto" as const },
  exit: { opacity: 0, x: 60, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 },
}

export function NeedsAttentionPanel({
  items,
  onDismiss,
  onAction,
  maxItems = 5,
  className,
}: NeedsAttentionPanelProps) {
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set())
  const shouldReduceMotion = useReducedMotion()

  const visibleItems = items
    .filter(item => !dismissedIds.has(item.id))
    .slice(0, maxItems)

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id))
    onDismiss?.(id)
  }

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 25 }

  if (visibleItems.length === 0) {
    return (
      <Card className={cn("border-success/30 bg-success/5 dark:border-success/20 dark:bg-success/5", className)}>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 dark:bg-success/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <h3 className="font-semibold text-success mb-1">All Caught Up!</h3>
          <p className="text-sm text-muted-foreground">No items need your attention right now.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-warning/30 dark:border-warning/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-warning/10 dark:bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-warning" />
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
        <AnimatePresence mode="popLayout" initial={false}>
          <div className="space-y-2">
            {visibleItems.map((item, index) => {
              const config = typeConfig[item.type]
              const urgency = urgencyConfig[item.urgency]
              const Icon = config.icon

              const content = (
                <div
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
                </div>
              )

              if (shouldReduceMotion) {
                return <div key={item.id}>{content}</div>
              }

              return (
                <motion.div
                  key={item.id}
                  layout
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{
                    ...transition,
                    delay: index * 0.05,
                  }}
                >
                  {content}
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

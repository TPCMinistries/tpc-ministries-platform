"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Users, DollarSign, TrendingUp, TrendingDown,
  Heart, BookOpen, Calendar, MessageSquare
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { NumberCounter } from "@/components/motion/number-counter"
import { cn } from "@/lib/utils"

interface StatCard {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: "members" | "revenue" | "prayers" | "teachings" | "events" | "messages"
}

interface AdminQuickStatsProps {
  stats: StatCard[]
  className?: string
}

const iconConfig = {
  members: { icon: Users, color: "text-navy", bg: "bg-navy-100 dark:bg-navy-900/30" },
  revenue: { icon: DollarSign, color: "text-gold-700", bg: "bg-gold-100 dark:bg-gold-900/30" },
  prayers: { icon: Heart, color: "text-spiritual dark:text-spiritual-foreground", bg: "bg-spiritual/10 dark:bg-spiritual/20" },
  teachings: { icon: BookOpen, color: "text-success dark:text-success-foreground", bg: "bg-success/10 dark:bg-success/20" },
  events: { icon: Calendar, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  messages: { icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
}

function parseNumericValue(value: string | number): { numeric: number; prefix: string; suffix: string } {
  if (typeof value === "number") {
    return { numeric: value, prefix: "", suffix: "" }
  }
  // Match patterns like "$1,234", "1,234", "1.2K", etc.
  const match = value.match(/^([^0-9]*)([0-9,]+\.?[0-9]*)(.*)$/)
  if (match) {
    const prefix = match[1]
    const numStr = match[2].replace(/,/g, "")
    const suffix = match[3]
    const numeric = parseFloat(numStr)
    if (!isNaN(numeric)) {
      return { numeric, prefix, suffix }
    }
  }
  return { numeric: 0, prefix: "", suffix: "" }
}

export function AdminQuickStats({ stats, className }: AdminQuickStatsProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat, index) => {
        const config = iconConfig[stat.icon]
        const Icon = config.icon
        const isPositive = stat.change !== undefined && stat.change > 0
        const isNegative = stat.change !== undefined && stat.change < 0
        const { numeric, prefix, suffix } = parseNumericValue(stat.value)

        const cardContent = (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                {stat.change !== undefined && (
                  <div className={cn(
                    "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
                    isPositive && "bg-success/10 text-success dark:bg-success/20",
                    isNegative && "bg-destructive/10 text-destructive dark:bg-destructive/20",
                    !isPositive && !isNegative && "bg-muted text-muted-foreground"
                  )}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : isNegative ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    {isPositive ? "+" : ""}{stat.change}%
                  </div>
                )}
              </div>
              <div className="text-2xl lg:text-3xl font-bold">
                {numeric > 0 ? (
                  <NumberCounter
                    value={numeric}
                    prefix={prefix}
                    suffix={suffix}
                    decimals={0}
                  />
                ) : (
                  <span>{typeof stat.value === "number" ? stat.value : stat.value}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              {stat.changeLabel && (
                <p className="text-xs text-muted-foreground mt-0.5">{stat.changeLabel}</p>
              )}
            </CardContent>
          </Card>
        )

        if (shouldReduceMotion) {
          return <div key={stat.label}>{cardContent}</div>
        }

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 25 }}
          >
            {cardContent}
          </motion.div>
        )
      })}
    </div>
  )
}

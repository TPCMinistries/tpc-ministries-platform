"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  Users, DollarSign, TrendingUp, TrendingDown,
  Heart, BookOpen, Calendar, MessageSquare
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
  members: { icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  revenue: { icon: DollarSign, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  prayers: { icon: Heart, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  teachings: { icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  events: { icon: Calendar, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  messages: { icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
}

export function AdminQuickStats({ stats, className }: AdminQuickStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat, index) => {
        const config = iconConfig[stat.icon]
        const Icon = config.icon
        const isPositive = stat.change && stat.change > 0
        const isNegative = stat.change && stat.change < 0

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", config.bg)}>
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>
                  {stat.change !== undefined && (
                    <div className={cn(
                      "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
                      isPositive && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                      isNegative && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      !isPositive && !isNegative && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
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
                <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                {stat.changeLabel && (
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.changeLabel}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

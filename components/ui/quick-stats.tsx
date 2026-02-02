"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, TrendingDown, Minus,
  Users, DollarSign, Heart, BookOpen,
  LucideIcon
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatItem {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  iconColor?: string
  iconBg?: string
}

interface QuickStatsProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  variant?: "default" | "compact" | "card"
  className?: string
}

const defaultIcons: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  members: { icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  revenue: { icon: DollarSign, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  giving: { icon: DollarSign, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  prayers: { icon: Heart, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  teachings: { icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
}

function getIconForLabel(label: string) {
  const key = label.toLowerCase()
  for (const [matchKey, config] of Object.entries(defaultIcons)) {
    if (key.includes(matchKey)) return config
  }
  return { icon: Users, color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-800" }
}

export function QuickStats({
  stats,
  columns = 4,
  variant = "default",
  className,
}: QuickStatsProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }

  if (variant === "card") {
    return (
      <div className={cn("grid gap-4", gridCols[columns], className)}>
        {stats.map((stat, index) => {
          const iconConfig = stat.icon 
            ? { icon: stat.icon, color: stat.iconColor || "text-gray-600", bg: stat.iconBg || "bg-gray-100" }
            : getIconForLabel(stat.label)
          const Icon = iconConfig.icon

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-2 rounded-lg", iconConfig.bg)}>
                      <Icon className={cn("h-5 w-5", iconConfig.color)} />
                    </div>
                    {stat.change !== undefined && (
                      <div className={cn(
                        "flex items-center gap-0.5 text-xs font-medium",
                        stat.change > 0 ? "text-green-600" : stat.change < 0 ? "text-red-600" : "text-gray-500"
                      )}>
                        {stat.change > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : stat.change < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        {Math.abs(stat.change)}%
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-4", className)}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg"
          >
            <span className="text-lg font-bold">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            {stat.change !== undefined && (
              <span className={cn(
                "text-xs font-medium",
                stat.change > 0 ? "text-green-600" : stat.change < 0 ? "text-red-600" : "text-gray-500"
              )}>
                {stat.change > 0 ? "+" : ""}{stat.change}%
              </span>
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {stats.map((stat, index) => {
        const iconConfig = stat.icon 
          ? { icon: stat.icon, color: stat.iconColor || "text-gray-600", bg: stat.iconBg || "bg-gray-100" }
          : getIconForLabel(stat.label)
        const Icon = iconConfig.icon

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-muted/30 rounded-xl border"
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", iconConfig.bg)}>
                <Icon className={cn("h-4 w-4", iconConfig.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold">{stat.value}</p>
                  {stat.change !== undefined && (
                    <span className={cn(
                      "text-xs font-medium flex items-center",
                      stat.change > 0 ? "text-green-600" : stat.change < 0 ? "text-red-600" : "text-gray-500"
                    )}>
                      {stat.change > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      ) : stat.change < 0 ? (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      ) : null}
                      {stat.change > 0 ? "+" : ""}{stat.change}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

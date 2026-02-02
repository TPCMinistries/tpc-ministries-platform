"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Flame, Trophy, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakDisplayProps {
  count: number
  label?: string
  variant?: "default" | "compact" | "badge" | "celebration"
  showMilestones?: boolean
  className?: string
}

const milestones = [7, 14, 30, 60, 90, 180, 365]

function getMilestoneIcon(days: number): React.ElementType {
  if (days >= 365) return Trophy
  if (days >= 90) return Star
  if (days >= 30) return Zap
  return Flame
}

function getStreakColor(days: number): string {
  if (days >= 90) return "text-yellow-500"
  if (days >= 30) return "text-orange-500"
  if (days >= 7) return "text-red-500"
  return "text-orange-400"
}

function getStreakBg(days: number): string {
  if (days >= 90) return "bg-yellow-100 dark:bg-yellow-900/30"
  if (days >= 30) return "bg-orange-100 dark:bg-orange-900/30"
  if (days >= 7) return "bg-red-100 dark:bg-red-900/30"
  return "bg-orange-100 dark:bg-orange-900/30"
}

export function StreakDisplay({
  count,
  label = "day streak",
  variant = "default",
  showMilestones = false,
  className,
}: StreakDisplayProps) {
  const Icon = getMilestoneIcon(count)
  const color = getStreakColor(count)
  const bg = getStreakBg(count)
  
  const nextMilestone = milestones.find(m => m > count) || milestones[milestones.length - 1]
  const prevMilestone = milestones.filter(m => m <= count).pop() || 0
  const progressToNext = ((count - prevMilestone) / (nextMilestone - prevMilestone)) * 100

  if (count === 0) {
    return null
  }

  if (variant === "badge") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
          bg, color,
          className
        )}
      >
        <Flame className="h-3 w-3" />
        {count}
      </motion.div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1", color, className)}>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          <Flame className="h-4 w-4" />
        </motion.div>
        <span className="text-sm font-bold">{count}</span>
      </div>
    )
  }

  if (variant === "celebration") {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
        className={cn(
          "flex flex-col items-center justify-center p-6 rounded-2xl",
          bg,
          className
        )}
      >
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatDelay: 1
          }}
          className={cn("mb-2", color)}
        >
          <Icon className="h-12 w-12" />
        </motion.div>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn("text-4xl font-bold", color)}
        >
          {count}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground mt-1"
        >
          {label}
        </motion.span>
        
        {showMilestones && count < nextMilestone && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.4 }}
            className="mt-4 w-full max-w-[200px]"
          >
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{count} days</span>
              <span>{nextMilestone} days</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: progressToNext + "%" }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className={cn("h-full rounded-full", color.replace("text-", "bg-"))}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    )
  }

  // Default variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
        }}
        transition={{ 
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 2.5
        }}
        className={cn("p-2 rounded-full", bg)}
      >
        <Icon className={cn("h-5 w-5", color)} />
      </motion.div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-xl font-bold", color)}>{count}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        {showMilestones && count < nextMilestone && (
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: progressToNext + "%" }}
              className={cn("h-full rounded-full", color.replace("text-", "bg-"))}
            />
          </div>
        )}
      </div>
    </div>
  )
}

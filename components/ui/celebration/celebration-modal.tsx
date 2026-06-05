"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type CelebrationType = 
  | "prayer-answered"
  | "milestone"
  | "streak"
  | "prophecy-received"
  | "first-donation"
  | "course-completed"
  | "badge-earned"

interface CelebrationConfig {
  emoji: string
  title: string
  description: string
  confetti: boolean
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
  }
}

const celebrationConfigs: Record<CelebrationType, CelebrationConfig> = {
  "prayer-answered": {
    emoji: "🙏✨",
    title: "Prayer Answered!",
    description: "God has moved! Your prayer has been marked as answered.",
    confetti: true,
    primaryAction: { label: "Share Testimony", href: "/testimonies/new" },
    secondaryAction: { label: "Praise Report" },
  },
  "milestone": {
    emoji: "🎯",
    title: "Milestone Reached!",
    description: "You've reached a new milestone in your spiritual journey.",
    confetti: true,
    primaryAction: { label: "View Journey" },
  },
  "streak": {
    emoji: "🔥",
    title: "Streak Achievement!",
    description: "Your consistency is inspiring. Keep going!",
    confetti: false,
    primaryAction: { label: "Continue" },
  },
  "prophecy-received": {
    emoji: "✨📜",
    title: "New Prophetic Word!",
    description: "A personal word has been deposited into your vault.",
    confetti: true,
    primaryAction: { label: "Read Now", href: "/my-prophecies" },
    secondaryAction: { label: "Later" },
  },
  "first-donation": {
    emoji: "💝",
    title: "Thank You for Giving!",
    description: "Your generosity helps sustain the ministry assignment and strengthen the community.",
    confetti: true,
    primaryAction: { label: "Partner Hub", href: "/partner-hub" },
  },
  "course-completed": {
    emoji: "🎓",
    title: "Course Completed!",
    description: "Congratulations on finishing this learning journey.",
    confetti: true,
    primaryAction: { label: "Get Certificate" },
    secondaryAction: { label: "Next Course" },
  },
  "badge-earned": {
    emoji: "🏆",
    title: "Badge Earned!",
    description: "You've unlocked a new achievement badge.",
    confetti: false,
    primaryAction: { label: "View Badges" },
  },
}

interface CelebrationModalProps {
  type: CelebrationType
  open: boolean
  onOpenChange: (open: boolean) => void
  customTitle?: string
  customDescription?: string
  customEmoji?: string
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
  metadata?: Record<string, unknown>
}

export function CelebrationModal({
  type,
  open,
  onOpenChange,
  customTitle,
  customDescription,
  customEmoji,
  onPrimaryAction,
  onSecondaryAction,
  metadata,
}: CelebrationModalProps) {
  const config = celebrationConfigs[type]
  const title = customTitle || config.title
  const description = customDescription || config.description
  const emoji = customEmoji || config.emoji
  const streakDays = typeof metadata?.streakDays === "number" || typeof metadata?.streakDays === "string"
    ? metadata.streakDays
    : null
  const shouldReduceMotion = useReducedMotion()

  React.useEffect(() => {
    if (open && config.confetti && !shouldReduceMotion) {
      // Dynamically import canvas-confetti to reduce bundle size
      import("canvas-confetti").then(({ default: confetti }) => {
        const duration = 2000
        const end = Date.now() + duration

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#d4b883", "#1e3a61", "#c9a961"],
          })
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#d4b883", "#1e3a61", "#c9a961"],
          })

          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        }
        frame()
      })
    }
  }, [open, config.confetti, shouldReduceMotion])

  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction()
    } else if (config.primaryAction?.href) {
      window.location.href = config.primaryAction.href
    }
    onOpenChange(false)
  }

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction()
    } else if (config.secondaryAction?.onClick) {
      config.secondaryAction.onClick()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={shouldReduceMotion ? undefined : { scale: 0, rotate: -180 }}
              animate={shouldReduceMotion ? undefined : { scale: 1, rotate: 0 }}
              transition={shouldReduceMotion ? undefined : { type: "spring", duration: 0.6 }}
              className="text-6xl mb-4 mx-auto"
            >
              {emoji}
            </motion.div>
          )}
        </AnimatePresence>
        
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-serif text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        {streakDays && (
          <motion.div
            initial={shouldReduceMotion ? undefined : { scale: 0 }}
            animate={shouldReduceMotion ? undefined : { scale: 1 }}
            transition={shouldReduceMotion ? undefined : { delay: 0.3 }}
            className="text-4xl font-bold text-gold-700 py-4"
          >
            {streakDays} Days! 🔥
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
          {config.primaryAction && (
            <Button 
              onClick={handlePrimaryAction}
              className="bg-tpc-gold hover:bg-tpc-gold-dark text-tpc-navy"
            >
              {config.primaryAction.label}
            </Button>
          )}
          {config.secondaryAction && (
            <Button 
              variant="outline" 
              onClick={handleSecondaryAction}
            >
              {config.secondaryAction.label}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for triggering celebrations
export function useCelebration() {
  const [celebrationState, setCelebrationState] = React.useState<{
    type: CelebrationType
    open: boolean
    metadata?: Record<string, unknown>
  }>({
    type: "milestone",
    open: false,
  })

  const celebrate = React.useCallback((type: CelebrationType, metadata?: Record<string, unknown>) => {
    setCelebrationState({ type, open: true, metadata })
  }, [])

  const closeCelebration = React.useCallback(() => {
    setCelebrationState(prev => ({ ...prev, open: false }))
  }, [])

  return {
    ...celebrationState,
    celebrate,
    onOpenChange: (open: boolean) => {
      if (!open) closeCelebration()
    },
  }
}

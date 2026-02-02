"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PrayerButtonProps {
  prayerCount: number
  hasPrayed?: boolean
  onPray: () => void | Promise<void>
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "minimal"
  showCount?: boolean
  className?: string
}

export function PrayerButton({
  prayerCount,
  hasPrayed = false,
  onPray,
  size = "md",
  variant = "default",
  showCount = true,
  className,
}: PrayerButtonProps) {
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [localPrayed, setLocalPrayed] = React.useState(hasPrayed)
  const [localCount, setLocalCount] = React.useState(prayerCount)

  const handleClick = async () => {
    if (localPrayed) return
    
    setIsAnimating(true)
    setLocalPrayed(true)
    setLocalCount(prev => prev + 1)
    
    try {
      await onPray()
    } catch (error) {
      // Revert on error
      setLocalPrayed(false)
      setLocalCount(prev => prev - 1)
    }
    
    setTimeout(() => setIsAnimating(false), 600)
  }

  const sizes = {
    sm: { button: "h-8 px-3 text-xs", icon: "h-3.5 w-3.5", gap: "gap-1.5" },
    md: { button: "h-10 px-4 text-sm", icon: "h-4 w-4", gap: "gap-2" },
    lg: { button: "h-12 px-6 text-base", icon: "h-5 w-5", gap: "gap-2.5" }
  }

  const s = sizes[size]

  const variants = {
    default: localPrayed 
      ? "bg-pink-100 text-pink-700 hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300"
      : "bg-pink-600 text-white hover:bg-pink-700",
    outline: localPrayed
      ? "border-pink-300 text-pink-600 bg-pink-50 dark:border-pink-800 dark:text-pink-400 dark:bg-pink-900/20"
      : "border-pink-300 text-pink-600 hover:bg-pink-50 dark:border-pink-700 dark:text-pink-400",
    minimal: localPrayed
      ? "text-pink-600 dark:text-pink-400"
      : "text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400"
  }

  return (
    <Button
      variant={variant === "minimal" ? "ghost" : variant === "outline" ? "outline" : "default"}
      onClick={handleClick}
      disabled={localPrayed}
      className={cn(
        s.button,
        s.gap,
        "relative overflow-hidden transition-all duration-300",
        variants[variant],
        localPrayed && "cursor-default",
        className
      )}
    >
      {/* Ripple effect on click */}
      <AnimatePresence>
        {isAnimating && (
          <motion.span
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-pink-400 rounded-full"
            style={{ originX: 0.5, originY: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Heart icon with animation */}
      <motion.span
        animate={isAnimating ? { 
          scale: [1, 1.4, 1],
          rotate: [0, -15, 15, 0]
        } : {}}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <Heart 
          className={cn(
            s.icon,
            localPrayed && "fill-current"
          )} 
        />
      </motion.span>

      {/* Text & Count */}
      <span className="relative z-10 flex items-center gap-1">
        {localPrayed ? "Praying" : "Pray"}
        {showCount && (
          <AnimatePresence mode="popLayout">
            <motion.span
              key={localCount}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="tabular-nums"
            >
              {localCount > 0 && `(${localCount})`}
            </motion.span>
          </AnimatePresence>
        )}
      </span>

      {/* Floating hearts on pray */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ 
                  y: 0, 
                  x: 0, 
                  opacity: 1, 
                  scale: 0.5 
                }}
                animate={{ 
                  y: -40 - (i * 10), 
                  x: (i - 1) * 15, 
                  opacity: 0, 
                  scale: 1 
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.1 
                }}
                className="absolute text-pink-500 pointer-events-none"
              >
                <Heart className="h-4 w-4 fill-current" />
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>
    </Button>
  )
}

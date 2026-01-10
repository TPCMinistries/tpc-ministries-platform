'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Trophy,
  Award,
  Star,
  Sparkles,
  Flame,
  Target,
  CheckCircle,
  X,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  achievement_type: string
  title: string
  description?: string
  achievement_data?: any
  celebrated: boolean
}

interface AchievementCelebrationProps {
  className?: string
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  return (
    <div
      className="absolute animate-confetti"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${delay}ms`,
        backgroundColor: color,
        width: `${8 + Math.random() * 8}px`,
        height: `${8 + Math.random() * 8}px`,
        borderRadius: Math.random() > 0.5 ? '50%' : '0',
      }}
    />
  )
}

// Confetti animation styles
const confettiStyles = `
  @keyframes confetti {
    0% {
      transform: translateY(-10vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
  .animate-confetti {
    animation: confetti 3s ease-out forwards;
  }
`

export default function AchievementCelebration({ className }: AchievementCelebrationProps) {
  const [achievement, setAchievement] = useState<Achievement | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [confettiColors] = useState(['#FFD700', '#1e3a5f', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const checkForAchievements = useCallback(async () => {
    try {
      const res = await fetch('/api/member/achievements/uncelebrated')
      if (res.ok) {
        const data = await res.json()
        if (data.achievement) {
          setAchievement(data.achievement)
          setShowCelebration(true)
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }, [])

  useEffect(() => {
    // Check for achievements on mount and periodically
    checkForAchievements()
    const interval = setInterval(checkForAchievements, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [checkForAchievements])

  const markAsCelebrated = async () => {
    if (!achievement) return

    try {
      await fetch('/api/member/achievements/celebrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievement_id: achievement.id })
      })
    } catch (error) {
      console.error('Error marking achievement:', error)
    }
  }

  const handleClose = () => {
    markAsCelebrated()
    setShowCelebration(false)
    setAchievement(null)
  }

  const handleShare = async () => {
    if (!achievement) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: achievement.title,
          text: `I just earned "${achievement.title}" on TPC Ministries!`,
          url: window.location.origin
        })
      } catch (error) {
        // User cancelled or error
      }
    }
    handleClose()
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'badge_earned':
        return <Award className="h-16 w-16 text-gold" />
      case 'streak_milestone':
        return <Flame className="h-16 w-16 text-orange-500" />
      case 'level_up':
        return <Star className="h-16 w-16 text-purple-500" />
      case 'assessment_complete':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'pledge_fulfilled':
        return <Target className="h-16 w-16 text-blue-500" />
      case 'onboarding_complete':
        return <Sparkles className="h-16 w-16 text-gold" />
      default:
        return <Trophy className="h-16 w-16 text-gold" />
    }
  }

  if (!mounted || !showCelebration || !achievement) return null

  return createPortal(
    <>
      <style>{confettiStyles}</style>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={i * 50}
              color={confettiColors[i % confettiColors.length]}
            />
          ))}
        </div>

        {/* Achievement Card */}
        <div className={cn(
          "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300",
          className
        )}>
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Gradient header */}
          <div className="bg-gradient-to-br from-navy to-navy/80 p-8 text-center">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white/10 backdrop-blur-sm mb-4 animate-bounce">
              {getAchievementIcon(achievement.achievement_type)}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Congratulations!
            </h2>
            <p className="text-gold text-sm font-medium">
              Achievement Unlocked
            </p>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {achievement.title}
            </h3>
            {achievement.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {achievement.description}
              </p>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                onClick={handleClose}
                className="bg-gold hover:bg-gold/90 text-navy gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Awesome!
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

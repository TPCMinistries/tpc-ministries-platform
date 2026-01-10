'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Flame, Clock, AlertTriangle, X, Zap } from 'lucide-react'
import Link from 'next/link'

interface StreakStatus {
  currentStreak: number
  lastActivityAt: string | null
  hoursUntilLoss: number | null
  isAtRisk: boolean
}

export default function StreakWarningBanner() {
  const [status, setStatus] = useState<StreakStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreakStatus()
    // Check every 5 minutes
    const interval = setInterval(fetchStreakStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchStreakStatus = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('current_streak, last_activity_at')
        .eq('user_id', user.id)
        .single()

      if (!member) {
        // Try engagement_streaks table
        const { data: memberAlt } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (memberAlt) {
          const { data: streak } = await supabase
            .from('engagement_streaks')
            .select('current_streak, last_activity_at')
            .eq('member_id', memberAlt.id)
            .single()

          if (streak) {
            calculateStatus(streak.current_streak, streak.last_activity_at)
          }
        }
      } else {
        calculateStatus(member.current_streak, member.last_activity_at)
      }
    } catch (error) {
      console.error('Error fetching streak status:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStatus = (currentStreak: number, lastActivityAt: string | null) => {
    if (!lastActivityAt || currentStreak === 0) {
      setStatus({
        currentStreak: currentStreak || 0,
        lastActivityAt,
        hoursUntilLoss: null,
        isAtRisk: false
      })
      return
    }

    const lastActivity = new Date(lastActivityAt)
    const now = new Date()
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
    const hoursUntilLoss = Math.max(0, 24 - hoursSinceActivity)
    const isAtRisk = hoursUntilLoss <= 4 && hoursUntilLoss > 0 && currentStreak > 0

    setStatus({
      currentStreak,
      lastActivityAt,
      hoursUntilLoss: Math.round(hoursUntilLoss * 10) / 10,
      isAtRisk
    })
  }

  if (loading || !status || !status.isAtRisk || dismissed) {
    return null
  }

  return (
    <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse-slow">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="relative">
            <Flame className="h-10 w-10 text-yellow-300 animate-bounce" />
            <AlertTriangle className="h-4 w-4 text-white absolute -bottom-1 -right-1" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            Your {status.currentStreak}-Day Streak is at Risk!
          </h3>
          <p className="text-sm text-white/90">
            <Clock className="h-3 w-3 inline mr-1" />
            Only {status.hoursUntilLoss} hours left to keep your streak alive
          </p>
        </div>

        <div className="flex-shrink-0">
          <Link href="/check-in">
            <Button
              size="sm"
              className="bg-white text-orange-600 hover:bg-yellow-100 font-bold shadow-lg"
            >
              <Zap className="h-4 w-4 mr-1" />
              Check In Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Urgency bar */}
      <div className="mt-3 h-1.5 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-300 transition-all duration-500"
          style={{ width: `${Math.max(0, (status.hoursUntilLoss || 0) / 24 * 100)}%` }}
        />
      </div>
    </div>
  )
}

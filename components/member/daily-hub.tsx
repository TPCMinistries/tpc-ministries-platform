'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Sun,
  Moon,
  Sunrise,
  BookOpen,
  Flame,
  Trophy,
  CheckCircle2,
  Heart,
  Calendar,
  Star,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Scripture {
  reference: string
  text: string
  theme: string
  reflection: string
}

interface Streak {
  current_streak: number
  longest_streak: number
  total_checkins: number
}

interface CheckinData {
  mood?: string
  prayer_focus?: string
  devotional_read?: boolean
  scripture_read?: boolean
}

interface BadgeData {
  badge_type: string
  badge_name: string
  badge_description: string
  earned_at: string
}

const moodOptions = [
  { value: 'grateful', label: 'Grateful', emoji: '🙏', color: 'bg-amber-100 hover:bg-amber-200 border-amber-300' },
  { value: 'peaceful', label: 'Peaceful', emoji: '😌', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { value: 'joyful', label: 'Joyful', emoji: '😊', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { value: 'hopeful', label: 'Hopeful', emoji: '🌟', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
  { value: 'struggling', label: 'Struggling', emoji: '😔', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
  { value: 'seeking', label: 'Seeking', emoji: '🔍', color: 'bg-teal-100 hover:bg-teal-200 border-teal-300' },
]

export default function DailyHub() {
  const [scripture, setScripture] = useState<Scripture | null>(null)
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0, total_checkins: 0 })
  const [todayCheckin, setTodayCheckin] = useState<CheckinData | null>(null)
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'mood' | 'prayer' | 'complete'>('mood')
  const [checkinData, setCheckinData] = useState<CheckinData>({
    mood: '',
    prayer_focus: '',
    devotional_read: false,
    scripture_read: false
  })
  const [saving, setSaving] = useState(false)
  const [showPrayerInput, setShowPrayerInput] = useState(false)

  useEffect(() => {
    fetchDailyData()
  }, [])

  const fetchDailyData = async () => {
    try {
      const scriptureRes = await fetch('/api/daily-hub/scripture')
      if (scriptureRes.ok) {
        const scriptureData = await scriptureRes.json()
        setScripture(scriptureData)
      }

      const checkinRes = await fetch('/api/daily-hub/checkin')
      if (checkinRes.ok) {
        const checkinInfo = await checkinRes.json()
        setStreak(checkinInfo.streak)
        setBadges(checkinInfo.badges)
        if (checkinInfo.checkin) {
          setTodayCheckin(checkinInfo.checkin)
          setCheckinData(checkinInfo.checkin)
          setStep('complete')
        }
      }
    } catch (error) {
      console.error('Error fetching daily data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSelect = async (mood: string) => {
    const newData = { ...checkinData, mood, scripture_read: true }
    setCheckinData(newData)
    setShowPrayerInput(true)
  }

  const handleCheckin = async (skipPrayer = false) => {
    setSaving(true)
    try {
      const dataToSave = skipPrayer
        ? { ...checkinData, prayer_focus: '' }
        : checkinData

      const res = await fetch('/api/daily-hub/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      })

      if (res.ok) {
        setTodayCheckin(dataToSave)
        setStep('complete')
        setShowPrayerInput(false)
        fetchDailyData()
      }
    } catch (error) {
      console.error('Error saving check-in:', error)
    } finally {
      setSaving(false)
    }
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { greeting: 'Good Morning', icon: Sunrise, period: 'morning' }
    if (hour < 17) return { greeting: 'Good Afternoon', icon: Sun, period: 'afternoon' }
    return { greeting: 'Good Evening', icon: Moon, period: 'evening' }
  }

  const { greeting, icon: TimeIcon, period } = getTimeOfDay()

  if (loading) {
    return (
      <Card className="col-span-full lg:col-span-2 bg-gradient-to-br from-tpc-navy to-tpc-navy/90">
        <CardContent className="py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/20 rounded w-1/3"></div>
            <div className="h-24 bg-white/10 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Already checked in today - show summary
  if (todayCheckin && step === 'complete') {
    const selectedMood = moodOptions.find(m => m.value === todayCheckin.mood)

    return (
      <Card className="col-span-full lg:col-span-2 bg-gradient-to-br from-tpc-navy via-tpc-navy to-tpc-navy/95 text-white overflow-hidden">
        <CardContent className="p-6">
          {/* Header with streak */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tpc-gold/20 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-tpc-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Today's Check-in Complete</h3>
                <p className="text-white/70 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-orange-500/20 px-3 py-1.5 rounded-full">
              <Flame className="h-5 w-5 text-orange-400" />
              <span className="font-bold text-orange-300">{streak.current_streak}</span>
              <span className="text-orange-300/70 text-sm">day streak</span>
            </div>
          </div>

          {/* Mood display */}
          {selectedMood && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
              <p className="text-white/60 text-sm mb-2">You're feeling</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedMood.emoji}</span>
                <span className="text-2xl font-semibold">{selectedMood.label}</span>
              </div>
            </div>
          )}

          {/* Scripture preview */}
          {scripture && (
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <p className="text-tpc-gold text-sm font-medium mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Today's Scripture
              </p>
              <p className="text-white/90 font-serif italic line-clamp-2">"{scripture.text}"</p>
              <p className="text-white/60 text-sm mt-2">— {scripture.reference}</p>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
              <p className="text-xl font-bold">{streak.current_streak}</p>
              <p className="text-xs text-white/60">Current</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xl font-bold">{streak.longest_streak}</p>
              <p className="text-xs text-white/60">Best</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Calendar className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold">{streak.total_checkins}</p>
              <p className="text-xs text-white/60">Total</p>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-tpc-gold" />
                <span className="text-sm text-white/70">Your Badges</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {badges.slice(0, 4).map((badge) => (
                  <Badge
                    key={badge.badge_type}
                    className="bg-tpc-gold/20 text-tpc-gold border-tpc-gold/30"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {badge.badge_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Check-in flow
  return (
    <Card className="col-span-full lg:col-span-2 bg-gradient-to-br from-tpc-navy via-tpc-navy to-tpc-navy/95 text-white overflow-hidden">
      <CardContent className="p-6">
        {/* Greeting header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-full",
              period === 'morning' ? 'bg-amber-500/20' : period === 'afternoon' ? 'bg-yellow-500/20' : 'bg-indigo-500/20'
            )}>
              <TimeIcon className={cn(
                "h-6 w-6",
                period === 'morning' ? 'text-amber-400' : period === 'afternoon' ? 'text-yellow-400' : 'text-indigo-400'
              )} />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold">{greeting}!</h2>
              <p className="text-white/70">Let's start your day with intention</p>
            </div>
          </div>
          {streak.current_streak > 0 && (
            <div className="flex items-center gap-1 bg-orange-500/20 px-3 py-1.5 rounded-full">
              <Flame className="h-5 w-5 text-orange-400" />
              <span className="font-bold text-orange-300">{streak.current_streak}</span>
            </div>
          )}
        </div>

        {/* Scripture */}
        {scripture && (
          <div className="bg-white/5 backdrop-blur rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 text-tpc-gold mb-3">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Today's Scripture</span>
              {scripture.theme && (
                <Badge variant="outline" className="ml-auto text-xs border-tpc-gold/30 text-tpc-gold">
                  {scripture.theme}
                </Badge>
              )}
            </div>
            <blockquote className="text-lg font-serif italic text-white/95 leading-relaxed mb-3">
              "{scripture.text}"
            </blockquote>
            <p className="text-white/70 text-sm font-medium">— {scripture.reference}</p>
            {scripture.reflection && (
              <p className="text-white/60 text-sm mt-3 pt-3 border-t border-white/10">
                <Sparkles className="h-4 w-4 inline mr-2 text-tpc-gold" />
                {scripture.reflection}
              </p>
            )}
          </div>
        )}

        {/* Mood Selection */}
        {!showPrayerInput ? (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-400" />
              How is your spirit today?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40",
                    "active:scale-95"
                  )}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Prayer Focus Input */
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                moodOptions.find(m => m.value === checkinData.mood)?.color || 'bg-white/10'
              )}>
                <span>{moodOptions.find(m => m.value === checkinData.mood)?.emoji}</span>
                <span className="text-gray-700 font-medium">
                  {moodOptions.find(m => m.value === checkinData.mood)?.label}
                </span>
              </div>
              <button
                onClick={() => setShowPrayerInput(false)}
                className="text-white/60 hover:text-white text-sm underline"
              >
                Change
              </button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <span className="text-lg">🙏</span>
                What would you like prayer for? (optional)
              </label>
              <Textarea
                placeholder="Share what's on your heart..."
                value={checkinData.prayer_focus || ''}
                onChange={(e) => setCheckinData({ ...checkinData, prayer_focus: e.target.value })}
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleCheckin(true)}
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10"
                disabled={saving}
              >
                Skip
              </Button>
              <Button
                onClick={() => handleCheckin(false)}
                className="flex-1 bg-tpc-gold text-tpc-navy hover:bg-tpc-gold/90 font-semibold"
                disabled={saving}
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    Complete Check-in
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Quick link to devotional */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <Link href="https://www.streamsofgrace.app" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10 justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Read Today's Full Devotional
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sun,
  Moon,
  BookOpen,
  Flame,
  Trophy,
  CheckCircle,
  Heart,
  Sparkles,
  Calendar,
  Star,
  Award
} from 'lucide-react'
import Link from 'next/link'

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
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'peaceful', label: 'Peaceful', emoji: '☮️' },
  { value: 'joyful', label: 'Joyful', emoji: '😊' },
  { value: 'hopeful', label: 'Hopeful', emoji: '🌟' },
  { value: 'struggling', label: 'Struggling', emoji: '😔' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'seeking', label: 'Seeking', emoji: '🔍' },
]

export default function DailyHub() {
  const [scripture, setScripture] = useState<Scripture | null>(null)
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0, total_checkins: 0 })
  const [todayCheckin, setTodayCheckin] = useState<CheckinData | null>(null)
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [loading, setLoading] = useState(true)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [checkinData, setCheckinData] = useState<CheckinData>({
    mood: '',
    prayer_focus: '',
    devotional_read: false,
    scripture_read: false
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDailyData()
  }, [])

  const fetchDailyData = async () => {
    try {
      // Fetch scripture
      const scriptureRes = await fetch('/api/daily-hub/scripture')
      if (scriptureRes.ok) {
        const scriptureData = await scriptureRes.json()
        setScripture(scriptureData)
      }

      // Fetch check-in data
      const checkinRes = await fetch('/api/daily-hub/checkin')
      if (checkinRes.ok) {
        const checkinInfo = await checkinRes.json()
        setStreak(checkinInfo.streak)
        setBadges(checkinInfo.badges)
        if (checkinInfo.checkin) {
          setTodayCheckin(checkinInfo.checkin)
          setCheckinData(checkinInfo.checkin)
        }
      }
    } catch (error) {
      console.error('Error fetching daily data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/daily-hub/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkinData,
          scripture_read: true // They've seen the scripture
        })
      })

      if (res.ok) {
        const result = await res.json()
        setTodayCheckin(checkinData)
        setCheckinOpen(false)
        // Refresh streak data
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
    if (hour < 12) return { greeting: 'Good Morning', icon: Sun }
    if (hour < 17) return { greeting: 'Good Afternoon', icon: Sun }
    return { greeting: 'Good Evening', icon: Moon }
  }

  const { greeting, icon: TimeIcon } = getTimeOfDay()

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-amber-200 rounded w-1/2"></div>
            <div className="h-20 bg-amber-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Daily Scripture Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-full">
                <BookOpen className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-lg text-amber-900">Scripture of the Day</CardTitle>
                <CardDescription className="text-amber-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardDescription>
              </div>
            </div>
            {scripture?.theme && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                {scripture.theme}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {scripture && (
            <>
              <blockquote className="text-lg font-serif italic text-amber-900 leading-relaxed border-l-4 border-amber-400 pl-4">
                "{scripture.text}"
              </blockquote>
              <p className="text-sm font-semibold text-amber-800">— {scripture.reference}</p>
              {scripture.reflection && (
                <p className="text-sm text-amber-700 bg-amber-100/50 p-3 rounded-lg">
                  <Star className="h-4 w-4 inline mr-2 text-amber-600" />
                  {scripture.reflection}
                </p>
              )}
            </>
          )}
          <div className="flex gap-2 pt-2">
            <Link href="/devotional" className="flex-1">
              <Button variant="outline" className="w-full border-amber-300 text-amber-800 hover:bg-amber-100">
                <BookOpen className="h-4 w-4 mr-2" />
                Read Full Devotional
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Streak & Check-in Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-full">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Your Spiritual Journey</CardTitle>
                <CardDescription>Track your daily walk with God</CardDescription>
              </div>
            </div>
            <Dialog open={checkinOpen} onOpenChange={setCheckinOpen}>
              <DialogTrigger asChild>
                <Button
                  variant={todayCheckin ? "outline" : "default"}
                  className={todayCheckin ? "border-green-300 text-green-700" : ""}
                >
                  {todayCheckin ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Checked In
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Daily Check-in
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TimeIcon className="h-5 w-5 text-amber-500" />
                    {greeting}! How are you today?
                  </DialogTitle>
                  <DialogDescription>
                    Take a moment to reflect on your spiritual state today
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Mood Selection */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">How is your spirit today?</label>
                    <div className="flex flex-wrap gap-2">
                      {moodOptions.map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => setCheckinData({ ...checkinData, mood: mood.value })}
                          className={`px-3 py-2 rounded-full text-sm flex items-center gap-1 transition-all ${
                            checkinData.mood === mood.value
                              ? 'bg-navy text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span>{mood.emoji}</span>
                          <span>{mood.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prayer Focus */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      What would you like prayer for today?
                    </label>
                    <Textarea
                      placeholder="Share your prayer focus or leave blank..."
                      value={checkinData.prayer_focus || ''}
                      onChange={(e) => setCheckinData({ ...checkinData, prayer_focus: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Devotional Read */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCheckinData({ ...checkinData, devotional_read: !checkinData.devotional_read })}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        checkinData.devotional_read
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {checkinData.devotional_read && <CheckCircle className="h-4 w-4" />}
                    </button>
                    <span className="text-sm">I've read today's devotional</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCheckinOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCheckin} disabled={saving}>
                    {saving ? 'Saving...' : 'Complete Check-in'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-orange-600">{streak.current_streak}</span>
              </div>
              <p className="text-xs text-gray-600">Day Streak</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold text-purple-600">{streak.longest_streak}</span>
              </div>
              <p className="text-xs text-gray-600">Best Streak</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold text-blue-600">{streak.total_checkins}</span>
              </div>
              <p className="text-xs text-gray-600">Total Days</p>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-gold" />
                Your Badges
              </h4>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <Badge
                    key={badge.badge_type}
                    variant="outline"
                    className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
                    title={badge.badge_description}
                  >
                    <Star className="h-3 w-3 mr-1 text-amber-500" />
                    {badge.badge_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Today's Check-in Summary */}
          {todayCheckin && todayCheckin.mood && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Today's Check-in Complete</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Feeling: {moodOptions.find(m => m.value === todayCheckin.mood)?.label || todayCheckin.mood}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

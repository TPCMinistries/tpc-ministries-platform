'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import {
  Trophy,
  Flame,
  Star,
  Lock,
  CheckCircle,
  TrendingUp,
  Calendar,
  BookOpen,
  Heart,
  Users,
  Gift,
  Zap
} from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  badge_color: string
  category: string
  requirement_type: string
  requirement_value: number
  points_awarded: number
  is_secret: boolean
  unlocked_at?: string
}

interface Streak {
  streak_type: string
  current_streak: number
  longest_streak: number
  last_activity_date: string
}

interface Points {
  total_points: number
  level: number
  points_this_month: number
  points_this_week: number
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [points, setPoints] = useState<Points | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) return

    // Fetch all data in parallel
    const [achievementsRes, unlockedRes, streaksRes, pointsRes] = await Promise.all([
      supabase.from('achievements').select('*').eq('is_active', true).order('display_order'),
      supabase.from('member_achievements').select('achievement_id, unlocked_at').eq('member_id', member.id),
      supabase.from('member_streaks').select('*').eq('member_id', member.id),
      supabase.from('member_points').select('*').eq('member_id', member.id).single()
    ])

    if (achievementsRes.data) {
      // Map unlocked achievements with their unlock dates
      const unlockedMap = new Map(
        unlockedRes.data?.map(u => [u.achievement_id, u.unlocked_at]) || []
      )

      const achievementsWithStatus = achievementsRes.data.map(a => ({
        ...a,
        unlocked_at: unlockedMap.get(a.id)
      }))

      setAchievements(achievementsWithStatus)
      setUnlockedIds(new Set(unlockedRes.data?.map(u => u.achievement_id) || []))
    }

    if (streaksRes.data) setStreaks(streaksRes.data)
    if (pointsRes.data) setPoints(pointsRes.data)

    setLoading(false)
  }

  const categories = [
    { value: 'all', label: 'All', icon: Trophy },
    { value: 'devotional', label: 'Devotional', icon: BookOpen },
    { value: 'prayer', label: 'Prayer', icon: Heart },
    { value: 'journal', label: 'Journal', icon: BookOpen },
    { value: 'community', label: 'Community', icon: Users },
    { value: 'learning', label: 'Learning', icon: Star },
    { value: 'streak', label: 'Streaks', icon: Flame },
    { value: 'giving', label: 'Giving', icon: Gift },
    { value: 'milestone', label: 'Milestones', icon: Zap }
  ]

  const filteredAchievements = achievements.filter(a =>
    selectedCategory === 'all' || a.category === selectedCategory
  )

  const unlockedCount = achievements.filter(a => unlockedIds.has(a.id)).length
  const totalPoints = points?.total_points || 0
  const level = points?.level || 1

  // Calculate points to next level
  const pointsForCurrentLevel = (level - 1) * (level - 1) * 100
  const pointsForNextLevel = level * level * 100
  const progressToNextLevel = ((totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100

  const getStreakIcon = (type: string) => {
    const icons: Record<string, any> = {
      devotional: BookOpen,
      prayer: Heart,
      journal: BookOpen,
      login: Calendar,
      giving: Gift
    }
    return icons[type] || Flame
  }

  const getStreakLabel = (type: string) => {
    const labels: Record<string, string> = {
      devotional: 'Devotional',
      prayer: 'Prayer',
      journal: 'Journal',
      login: 'Daily Login',
      giving: 'Giving'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-8 w-8 text-gold" />
            <h1 className="text-3xl font-bold text-navy">Achievements</h1>
          </div>
          <p className="text-gray-600">Track your spiritual growth journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Level Card */}
          <Card className="bg-gradient-to-br from-navy to-navy/80 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70 text-sm">Your Level</span>
                <Star className="h-5 w-5 text-gold" />
              </div>
              <p className="text-4xl font-bold">{level}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress to Level {level + 1}</span>
                  <span>{Math.round(progressToNextLevel)}%</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2 bg-white/20" />
              </div>
            </CardContent>
          </Card>

          {/* Total Points */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Total Points</span>
                <Zap className="h-5 w-5 text-gold" />
              </div>
              <p className="text-4xl font-bold text-navy">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                +{points?.points_this_week || 0} this week
              </p>
            </CardContent>
          </Card>

          {/* Achievements Unlocked */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Achievements</span>
                <Trophy className="h-5 w-5 text-gold" />
              </div>
              <p className="text-4xl font-bold text-navy">{unlockedCount}/{achievements.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((unlockedCount / achievements.length) * 100)}% complete
              </p>
            </CardContent>
          </Card>

          {/* Best Streak */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">Best Streak</span>
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-4xl font-bold text-navy">
                {Math.max(...streaks.map(s => s.longest_streak), 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Streaks */}
        {streaks.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Your Active Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {streaks.map(streak => {
                  const Icon = getStreakIcon(streak.streak_type)
                  const isActive = streak.last_activity_date === new Date().toISOString().split('T')[0]

                  return (
                    <div
                      key={streak.streak_type}
                      className={`p-4 rounded-lg border-2 ${
                        isActive ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-5 w-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium">{getStreakLabel(streak.streak_type)}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                          {streak.current_streak}
                        </span>
                        <span className="text-sm text-gray-500">days</span>
                        {isActive && <Flame className="h-4 w-4 text-orange-500 ml-1" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Best: {streak.longest_streak} days
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => {
            const Icon = cat.icon
            const count = achievements.filter(a =>
              cat.value === 'all' ? true : a.category === cat.value
            ).length
            const unlockedInCat = achievements.filter(a =>
              (cat.value === 'all' ? true : a.category === cat.value) && unlockedIds.has(a.id)
            ).length

            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-navy text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-navy'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{cat.label}</span>
                <span className={`text-xs ${selectedCategory === cat.value ? 'text-white/70' : 'text-gray-500'}`}>
                  {unlockedInCat}/{count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => {
            const isUnlocked = unlockedIds.has(achievement.id)
            const isSecret = achievement.is_secret && !isUnlocked

            return (
              <Card
                key={achievement.id}
                className={`relative overflow-hidden transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-gold/10 to-amber-50 border-gold/30'
                    : isSecret
                    ? 'bg-gray-100 opacity-60'
                    : 'bg-white'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                        isUnlocked
                          ? 'bg-gold/20'
                          : isSecret
                          ? 'bg-gray-200'
                          : 'bg-gray-100'
                      }`}
                    >
                      {isSecret ? (
                        <Lock className="h-6 w-6 text-gray-400" />
                      ) : (
                        <span>{achievement.icon}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-semibold ${isSecret ? 'text-gray-400' : 'text-navy'}`}>
                            {isSecret ? '???' : achievement.name}
                          </h3>
                          <p className={`text-sm ${isSecret ? 'text-gray-400' : 'text-gray-600'}`}>
                            {isSecret ? 'Secret achievement' : achievement.description}
                          </p>
                        </div>
                        {isUnlocked && (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Points & Date */}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge
                          variant="outline"
                          className={isUnlocked ? 'border-gold text-gold' : 'border-gray-300 text-gray-500'}
                        >
                          +{achievement.points_awarded} pts
                        </Badge>
                        {isUnlocked && achievement.unlocked_at && (
                          <span className="text-xs text-gray-500">
                            Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Unlocked Ribbon */}
                {isUnlocked && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gold text-navy text-xs font-bold px-8 py-1 transform rotate-45 translate-x-6 translate-y-3">
                      UNLOCKED
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No achievements in this category</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

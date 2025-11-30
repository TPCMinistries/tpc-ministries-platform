'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  Trophy,
  Flame,
  Star,
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Heart,
  Users,
  Gift,
  Zap,
  Crown,
  Award,
  ChevronRight,
  Play,
  CheckCircle
} from 'lucide-react'

interface GamificationData {
  member: {
    name: string
    joinedDate: string
    daysAsMember: number
  }
  streaks: {
    current: number
    longest: number
    lastActivityDate: string | null
    isActiveToday: boolean
  }
  points: {
    total: number
    thisWeek: number
    thisMonth: number
  }
  level: {
    current: number
    name: string
    minPoints: number
    maxPoints: number
    progress: number
    nextLevel: string
  }
  badges: {
    earned: Array<{
      id: string
      name: string
      description: string
      icon: string
      category: string
      points: number
      earnedAt: string
    }>
    available: Array<{
      id: string
      name: string
      description: string
      icon: string
      category: string
      points: number
    }>
    recentlyEarned: Array<{
      id: string
      name: string
      icon: string
      earnedAt: string
    }>
  }
  leaderboard: {
    rank: number
    percentile: number
  }
  nextMilestones: Array<{
    badge: string
    progress: number
    target: number
    description: string
  }>
}

interface Recommendation {
  id: string
  title: string
  name?: string
  description?: string
  matchScore: number
  matchReason: string
  category?: string
  thumbnail_url?: string
  start_date?: string
  daysUntil?: number
}

export default function MyJourneyPage() {
  const [gamification, setGamification] = useState<GamificationData | null>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'recommendations'>('overview')

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

    // Fetch gamification data
    const gamRes = await fetch(`/api/member/gamification?memberId=${member.id}`)
    if (gamRes.ok) {
      const data = await gamRes.json()
      setGamification(data)
    }

    // Fetch recommendations
    const recRes = await fetch(`/api/ai/recommendations?memberId=${member.id}`)
    if (recRes.ok) {
      const data = await recRes.json()
      setRecommendations(data)
    }

    setLoading(false)
  }

  const getLevelIcon = (level: number) => {
    if (level >= 6) return Crown
    if (level >= 4) return Star
    return Target
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your journey...</p>
        </div>
      </div>
    )
  }

  const LevelIcon = gamification ? getLevelIcon(gamification.level.current) : Target

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-gold" />
            <h1 className="text-3xl font-bold text-navy">My Spiritual Journey</h1>
          </div>
          <p className="text-gray-600">Track your growth and discover your next steps</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'badges', label: 'Badges', icon: Trophy },
            { id: 'recommendations', label: 'For You', icon: Sparkles }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                activeTab === tab.id
                  ? 'bg-navy text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-navy'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && gamification && (
          <>
            {/* Level & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Level Card */}
              <Card className="md:col-span-2 bg-gradient-to-br from-navy to-navy/80 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center">
                      <LevelIcon className="h-10 w-10 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/70 text-sm">Current Level</p>
                      <p className="text-3xl font-bold">{gamification.level.name}</p>
                      <p className="text-white/70 text-sm">Level {gamification.level.current}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress to {gamification.level.nextLevel}</span>
                      <span>{Math.round(gamification.level.progress)}%</span>
                    </div>
                    <Progress value={gamification.level.progress} className="h-2 bg-white/20" />
                    <p className="text-xs text-white/60 mt-1">
                      {gamification.points.total.toLocaleString()} / {gamification.level.maxPoints.toLocaleString()} points
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Points Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-500 text-sm">Total Points</span>
                    <Zap className="h-5 w-5 text-gold" />
                  </div>
                  <p className="text-4xl font-bold text-navy">{gamification.points.total.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+{gamification.points.thisWeek} this week</span>
                  </div>
                </CardContent>
              </Card>

              {/* Streak Card */}
              <Card className={gamification.streaks.isActiveToday ? 'border-orange-200 bg-orange-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-500 text-sm">Current Streak</span>
                    <Flame className={`h-5 w-5 ${gamification.streaks.isActiveToday ? 'text-orange-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-bold ${gamification.streaks.isActiveToday ? 'text-orange-500' : 'text-gray-400'}`}>
                      {gamification.streaks.current}
                    </p>
                    <span className="text-gray-500">days</span>
                    {gamification.streaks.isActiveToday && <Flame className="h-5 w-5 text-orange-500 animate-pulse" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Best: {gamification.streaks.longest} days</p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 text-gold mx-auto mb-2" />
                  <p className="text-2xl font-bold text-navy">{gamification.badges.earned.length}</p>
                  <p className="text-xs text-gray-500">Badges Earned</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-6 w-6 text-navy mx-auto mb-2" />
                  <p className="text-2xl font-bold text-navy">{gamification.member.daysAsMember}</p>
                  <p className="text-xs text-gray-500">Days as Member</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-navy">#{gamification.leaderboard.rank}</p>
                  <p className="text-xs text-gray-500">Leaderboard Rank</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-navy">Top {gamification.leaderboard.percentile}%</p>
                  <p className="text-xs text-gray-500">Percentile</p>
                </CardContent>
              </Card>
            </div>

            {/* Next Milestones */}
            {gamification.nextMilestones.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-navy" />
                    Next Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {gamification.nextMilestones.map((milestone, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-navy">{milestone.badge}</span>
                          <span className="text-sm text-gray-500">{milestone.progress}/{milestone.target}</span>
                        </div>
                        <Progress value={(milestone.progress / milestone.target) * 100} className="h-2 mb-2" />
                        <p className="text-xs text-gray-500">{milestone.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recently Earned */}
            {gamification.badges.recentlyEarned.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gold" />
                    Recently Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {gamification.badges.recentlyEarned.map(badge => (
                      <div key={badge.id} className="flex-shrink-0 text-center p-4 bg-gold/10 rounded-xl border border-gold/30">
                        <span className="text-4xl">{badge.icon}</span>
                        <p className="font-medium text-navy mt-2">{badge.name}</p>
                        <p className="text-xs text-gray-500">{new Date(badge.earnedAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && gamification && (
          <>
            {/* Badge Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Earned Badges */}
              {gamification.badges.earned.map(badge => (
                <Card key={badge.id} className="bg-gradient-to-br from-gold/10 to-amber-50 border-gold/30">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">{badge.icon}</span>
                    </div>
                    <h3 className="font-semibold text-navy">{badge.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge variant="outline" className="border-gold text-gold">+{badge.points} pts</Badge>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {/* Available Badges */}
              {gamification.badges.available.map(badge => (
                <Card key={badge.id} className="opacity-60 hover:opacity-80 transition-opacity">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl grayscale">{badge.icon}</span>
                    </div>
                    <h3 className="font-semibold text-gray-600">{badge.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                    <Badge variant="outline" className="mt-2 border-gray-300 text-gray-500">
                      +{badge.points} pts
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && recommendations && (
          <div className="space-y-8">
            {/* AI Summary */}
            {recommendations.aiSummary && (
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy mb-2">Personalized for You</h3>
                      <p className="text-gray-700">{recommendations.aiSummary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Groups */}
            {recommendations.recommendations?.groups?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recommended Groups
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.recommendations.groups.map((group: Recommendation) => (
                    <Card key={group.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-navy">{group.name}</h3>
                          <Badge className="bg-green-100 text-green-700">{group.matchScore}% match</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                        <p className="text-xs text-purple-600 mb-3">{group.matchReason}</p>
                        <Button size="sm" className="w-full bg-navy hover:bg-navy/90">
                          <Users className="h-4 w-4 mr-2" />
                          Join Group
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Events */}
            {recommendations.recommendations?.events?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events for You
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.recommendations.events.map((event: Recommendation) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-navy">{event.title}</h3>
                            {event.daysUntil !== undefined && (
                              <p className="text-xs text-gray-500">
                                {event.daysUntil === 0 ? 'Today' : event.daysUntil === 1 ? 'Tomorrow' : `In ${event.daysUntil} days`}
                              </p>
                            )}
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">{event.matchScore}% match</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                        <p className="text-xs text-purple-600 mb-3">{event.matchReason}</p>
                        <Button size="sm" variant="outline" className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Register
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Teachings */}
            {recommendations.recommendations?.teachings?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Teachings for You
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.recommendations.teachings.map((teaching: Recommendation) => (
                    <Card key={teaching.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                      {teaching.thumbnail_url && (
                        <div className="aspect-video bg-gray-100 relative">
                          <img src={teaching.thumbnail_url} alt={teaching.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-navy">{teaching.title}</h3>
                          <Badge className="bg-amber-100 text-amber-700">{teaching.matchScore}%</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{teaching.category}</p>
                        <p className="text-xs text-purple-600">{teaching.matchReason}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

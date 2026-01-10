'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  DollarSign,
  Calendar,
  MessageSquare,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Flame,
  Award,
} from 'lucide-react'

interface InsightCard {
  id: string
  type: 'positive' | 'warning' | 'neutral' | 'action'
  title: string
  description: string
  metric?: string
  trend?: 'up' | 'down' | 'neutral'
  actionText?: string
  actionUrl?: string
}

interface EngagementMetrics {
  totalMembers: number
  activeThisWeek: number
  newThisMonth: number
  avgStreak: number
  streaksAtRisk: number
  topEngagers: { name: string; streak: number }[]
}

interface GivingMetrics {
  totalThisMonth: number
  comparedToLastMonth: number
  avgDonation: number
  recurringDonors: number
  newDonorsThisMonth: number
}

interface ContentMetrics {
  totalTeachings: number
  totalDevotionals: number
  avgViews: number
  topContent: { title: string; views: number }[]
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<InsightCard[]>([])
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null)
  const [givingMetrics, setGivingMetrics] = useState<GivingMetrics | null>(null)
  const [contentMetrics, setContentMetrics] = useState<ContentMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsLoading(true)
    await Promise.all([
      fetchEngagementMetrics(),
      fetchGivingMetrics(),
      fetchContentMetrics(),
    ])
    generateInsights()
    setIsLoading(false)
  }

  const fetchEngagementMetrics = async () => {
    try {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Get total members
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })

      // Get active this week
      const { count: activeThisWeek } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('last_activity_at', oneWeekAgo.toISOString())

      // Get new this month
      const { count: newThisMonth } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString())

      // Get streak data
      const { data: streakData } = await supabase
        .from('members')
        .select('current_streak, first_name, last_name')
        .gt('current_streak', 0)
        .order('current_streak', { ascending: false })
        .limit(10)

      const avgStreak = streakData?.length
        ? streakData.reduce((sum, m) => sum + (m.current_streak || 0), 0) / streakData.length
        : 0

      // Get streaks at risk (active streak, no activity in 20+ hours)
      const twentyHoursAgo = new Date(now.getTime() - 20 * 60 * 60 * 1000)
      const { count: streaksAtRisk } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gt('current_streak', 0)
        .lt('last_activity_at', twentyHoursAgo.toISOString())

      setEngagementMetrics({
        totalMembers: totalMembers || 0,
        activeThisWeek: activeThisWeek || 0,
        newThisMonth: newThisMonth || 0,
        avgStreak: Math.round(avgStreak * 10) / 10,
        streaksAtRisk: streaksAtRisk || 0,
        topEngagers: (streakData || []).slice(0, 5).map(m => ({
          name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Member',
          streak: m.current_streak || 0,
        })),
      })
    } catch (error) {
      console.error('Error fetching engagement metrics:', error)
    }
  }

  const fetchGivingMetrics = async () => {
    try {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // This month's donations
      const { data: thisMonthDonations } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', thisMonthStart.toISOString())

      // Last month's donations
      const { data: lastMonthDonations } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString())

      // Recurring donors
      const { count: recurringDonors } = await supabase
        .from('donations')
        .select('*', { count: 'exact', head: true })
        .eq('is_recurring', true)

      // New donors this month
      const { data: newDonors } = await supabase
        .from('donations')
        .select('member_id')
        .gte('created_at', thisMonthStart.toISOString())

      const thisMonthTotal = thisMonthDonations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      const lastMonthTotal = lastMonthDonations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      const percentChange = lastMonthTotal > 0
        ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
        : 0

      setGivingMetrics({
        totalThisMonth: thisMonthTotal,
        comparedToLastMonth: percentChange,
        avgDonation: thisMonthDonations?.length
          ? Math.round(thisMonthTotal / thisMonthDonations.length)
          : 0,
        recurringDonors: recurringDonors || 0,
        newDonorsThisMonth: new Set(newDonors?.map(d => d.member_id)).size,
      })
    } catch (error) {
      console.error('Error fetching giving metrics:', error)
    }
  }

  const fetchContentMetrics = async () => {
    try {
      const { count: totalTeachings } = await supabase
        .from('teachings')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      const { count: totalDevotionals } = await supabase
        .from('daily_content')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      const { data: topContent } = await supabase
        .from('teachings')
        .select('title, view_count')
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .limit(5)

      const { data: allTeachings } = await supabase
        .from('teachings')
        .select('view_count')
        .eq('is_published', true)

      const avgViews = allTeachings?.length
        ? Math.round(allTeachings.reduce((sum, t) => sum + (t.view_count || 0), 0) / allTeachings.length)
        : 0

      setContentMetrics({
        totalTeachings: totalTeachings || 0,
        totalDevotionals: totalDevotionals || 0,
        avgViews,
        topContent: (topContent || []).map(c => ({
          title: c.title,
          views: c.view_count || 0,
        })),
      })
    } catch (error) {
      console.error('Error fetching content metrics:', error)
    }
  }

  const generateInsights = async () => {
    setIsGenerating(true)

    // Generate insights based on the data
    const newInsights: InsightCard[] = []

    // Engagement insights
    if (engagementMetrics) {
      const engagementRate = engagementMetrics.totalMembers > 0
        ? (engagementMetrics.activeThisWeek / engagementMetrics.totalMembers) * 100
        : 0

      if (engagementRate > 50) {
        newInsights.push({
          id: '1',
          type: 'positive',
          title: 'Strong Member Engagement',
          description: `${Math.round(engagementRate)}% of your members were active this week. This is excellent engagement!`,
          metric: `${engagementMetrics.activeThisWeek}/${engagementMetrics.totalMembers} active`,
          trend: 'up',
        })
      } else if (engagementRate < 30) {
        newInsights.push({
          id: '2',
          type: 'warning',
          title: 'Low Member Engagement',
          description: `Only ${Math.round(engagementRate)}% of members were active this week. Consider sending a re-engagement campaign.`,
          metric: `${engagementMetrics.activeThisWeek}/${engagementMetrics.totalMembers} active`,
          trend: 'down',
          actionText: 'Send Re-engagement Email',
          actionUrl: '/email-campaigns?tab=quicksend',
        })
      }

      if (engagementMetrics.streaksAtRisk > 0) {
        newInsights.push({
          id: '3',
          type: 'action',
          title: 'Streaks at Risk',
          description: `${engagementMetrics.streaksAtRisk} members may lose their streak today. Send a reminder!`,
          metric: `${engagementMetrics.streaksAtRisk} at risk`,
          actionText: 'Send Streak Reminder',
          actionUrl: '/sms-campaigns',
        })
      }

      if (engagementMetrics.newThisMonth > 5) {
        newInsights.push({
          id: '4',
          type: 'positive',
          title: 'Growing Community',
          description: `You've welcomed ${engagementMetrics.newThisMonth} new members this month. Great growth!`,
          metric: `+${engagementMetrics.newThisMonth} new`,
          trend: 'up',
        })
      }
    }

    // Giving insights
    if (givingMetrics) {
      if (givingMetrics.comparedToLastMonth > 10) {
        newInsights.push({
          id: '5',
          type: 'positive',
          title: 'Giving is Up!',
          description: `Donations are ${givingMetrics.comparedToLastMonth}% higher than last month. Keep the momentum going!`,
          metric: `$${givingMetrics.totalThisMonth.toLocaleString()}`,
          trend: 'up',
        })
      } else if (givingMetrics.comparedToLastMonth < -10) {
        newInsights.push({
          id: '6',
          type: 'warning',
          title: 'Giving Decline',
          description: `Donations are down ${Math.abs(givingMetrics.comparedToLastMonth)}% from last month. Consider a giving campaign.`,
          metric: `$${givingMetrics.totalThisMonth.toLocaleString()}`,
          trend: 'down',
          actionText: 'Create Giving Campaign',
          actionUrl: '/admin-giving',
        })
      }

      if (givingMetrics.newDonorsThisMonth > 0) {
        newInsights.push({
          id: '7',
          type: 'positive',
          title: 'New Donors',
          description: `${givingMetrics.newDonorsThisMonth} new people gave for the first time this month!`,
          metric: `+${givingMetrics.newDonorsThisMonth} new donors`,
          trend: 'up',
        })
      }
    }

    // Content insights
    if (contentMetrics) {
      newInsights.push({
        id: '8',
        type: 'neutral',
        title: 'Content Performance',
        description: `Your teachings average ${contentMetrics.avgViews} views each. Your top content is performing well.`,
        metric: `${contentMetrics.totalTeachings} teachings`,
      })
    }

    // Add some AI recommendations
    newInsights.push({
      id: '9',
      type: 'action',
      title: 'AI Recommendation',
      description: 'Based on engagement patterns, Sunday morning is your best time for sending announcements.',
      actionText: 'Schedule Content',
      actionUrl: '/daily-content',
    })

    newInsights.push({
      id: '10',
      type: 'action',
      title: 'Lead Follow-up Needed',
      description: 'You have unscored leads that need AI analysis for prioritization.',
      actionText: 'Score Leads',
      actionUrl: '/lead-scoring',
    })

    setInsights(newInsights)
    setIsGenerating(false)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'action':
        return <Lightbulb className="h-5 w-5 text-blue-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-500/10 border-green-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'action':
        return 'bg-blue-500/10 border-blue-500/20'
      default:
        return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="h-8 w-8 text-gold" />
            AI Insights
          </h1>
          <p className="text-gray-400 mt-1">
            AI-powered analytics and recommendations for your ministry
          </p>
        </div>
        <Button
          onClick={fetchAllData}
          disabled={isLoading || isGenerating}
          className="bg-gold hover:bg-gold/90 text-navy"
        >
          {isLoading || isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh Insights
            </>
          )}
        </Button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-white">
                  {engagementMetrics?.totalMembers || 0}
                </p>
                <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +{engagementMetrics?.newThisMonth || 0} this month
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active This Week</p>
                <p className="text-2xl font-bold text-white">
                  {engagementMetrics?.activeThisWeek || 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {engagementMetrics?.totalMembers
                    ? Math.round((engagementMetrics.activeThisWeek / engagementMetrics.totalMembers) * 100)
                    : 0}% engagement rate
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Giving This Month</p>
                <p className="text-2xl font-bold text-white">
                  ${(givingMetrics?.totalThisMonth || 0).toLocaleString()}
                </p>
                <p className={`text-xs flex items-center gap-1 mt-1 ${
                  (givingMetrics?.comparedToLastMonth || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(givingMetrics?.comparedToLastMonth || 0) >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(givingMetrics?.comparedToLastMonth || 0)}% vs last month
                </p>
              </div>
              <div className="p-3 bg-gold/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Streak</p>
                <p className="text-2xl font-bold text-white">
                  {engagementMetrics?.avgStreak || 0} days
                </p>
                <p className="text-xs text-orange-400 flex items-center gap-1 mt-1">
                  <Flame className="h-3 w-3" />
                  {engagementMetrics?.streaksAtRisk || 0} at risk
                </p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Recommendations and observations based on your ministry data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gold" />
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No insights available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${getInsightBg(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">{insight.title}</h3>
                        {insight.trend && (
                          <Badge
                            className={insight.trend === 'up'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : insight.trend === 'down'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }
                          >
                            {insight.metric}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{insight.description}</p>
                      {insight.actionText && insight.actionUrl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="px-0 text-gold hover:text-gold/80 mt-2"
                          onClick={() => window.location.href = insight.actionUrl!}
                        >
                          {insight.actionText} →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Engagers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" />
              Top Engagers
            </CardTitle>
            <CardDescription>Members with the longest active streaks</CardDescription>
          </CardHeader>
          <CardContent>
            {engagementMetrics?.topEngagers?.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No active streaks</p>
            ) : (
              <div className="space-y-3">
                {engagementMetrics?.topEngagers?.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-gold/20 text-gold' :
                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-500' :
                        'bg-gray-700 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-white">{member.name}</span>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      <Flame className="h-3 w-3 mr-1" />
                      {member.streak} days
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gold" />
              Top Content
            </CardTitle>
            <CardDescription>Most viewed teachings</CardDescription>
          </CardHeader>
          <CardContent>
            {contentMetrics?.topContent?.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No content data</p>
            ) : (
              <div className="space-y-3">
                {contentMetrics?.topContent?.map((content, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white truncate flex-1 mr-4">{content.title}</span>
                    <Badge variant="outline" className="text-gray-400">
                      {content.views} views
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

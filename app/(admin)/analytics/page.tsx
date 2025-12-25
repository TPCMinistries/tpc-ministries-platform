'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LineChart, AreaChart, BarChart, DonutChart, CHART_COLORS } from '@/components/charts'
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Sparkles,
  Eye,
  Clock,
  Target,
  RefreshCw,
  Loader2,
  BookOpen,
  Heart,
  MessageSquare,
  Bot,
  PenLine,
  Calendar,
  GraduationCap,
  Trophy,
  Flame,
  Award,
  ChevronDown,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react'

interface Analytics {
  dateRange: {
    startDate: string
    endDate: string
    comparisonStartDate: string
    comparisonEndDate: string
  }
  members: {
    total: number
    newThisWeek: number
    newThisMonth: number
    newInPeriod: number
    newInComparison: number
    changePercent: number
    activeMembers: number
    activeMembersComparison: number
    engagementRate: number
    engagementRateComparison: number
    engagementChange: number
    byTier: { free: number; partner: number; covenant: number }
    tierChartData: Array<{ name: string; value: number }>
    growthTrend: Array<{ date: string; newMembers: number }>
    mostActive: Array<{ id: string; name: string; actions: number; score: number }>
    atRisk: Array<{ id: string; name: string; daysInactive: number; lastAction: string }>
  }
  content: {
    teachings: {
      total: number
      mostViewed: Array<{ id: string; title: string; views: number; completionRate: number }>
      avgCompletionRate: number
    }
    prophecies: {
      mostListened: Array<{ id: string; title: string; listens: number; avgListenTime: string }>
    }
    searchTrends: Array<{ keyword: string; searches: number }>
    devotionalsRead: number
    devotionalsReadComparison: number
    devotionalsChange: number
  }
  revenue: {
    periodTotal: number
    comparisonTotal: number
    changePercent: number
    thisMonth: number
    lastMonth: number
    change: number
    trend: 'up' | 'down'
    mrr: number
    byTier: {
      partner: { mrr: number; count: number }
      covenant: { mrr: number; count: number }
    }
    byMission: Array<{ location: string; amount: number; donations: number }>
    fundChartData: Array<{ name: string; value: number }>
    revenueTrend: Array<{ date: string; amount: number }>
    avgLifetimeValue: number
  }
  engagement: {
    dau: number
    wau: number
    mau: number
    avgSessionDuration: string
    topFeatures: Array<{ feature: string; usage: number; percentage: number }>
    featureChartData: Array<{ name: string; value: number }>
    activityTrend: Array<{ date: string; activities: number }>
    aiChats: number
    prayerRequests: number
    journalEntries: number
  }
  growth: {
    weekly: Array<{ week: string; newMembers: number }>
  }
  plant?: {
    totalEnrollments: number
    enrollmentsInPeriod: number
    completedCourses: number
    completionRate: number
    lessonsCompleted: number
    avgQuizScore: number
    topCourses: Array<{ id: string; title: string; enrollments: number }>
  }
  gamification?: {
    totalPointsAwarded: number
    badgesAwarded: number
    activeStreaks: number
    achievementsUnlocked: number
    leaderboard: Array<{ rank: number; name: string; points: number }>
  }
}

interface AIInsight {
  type: 'success' | 'warning' | 'info' | 'prediction'
  category: 'growth' | 'engagement' | 'revenue' | 'content' | 'members'
  title: string
  description: string
  metric?: string
  change?: number
  recommendation?: string
  confidence?: number
}

interface AIPrediction {
  type: 'giving' | 'growth' | 'churn' | 'engagement'
  title: string
  prediction: string
  confidence: number
  trend: 'up' | 'down' | 'stable'
  recommendation: string
}

interface AIInsightsData {
  insights: AIInsight[]
  predictions: AIPrediction[]
  summary: string
  generatedAt: string
}

const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', days: -1 },
  { label: 'Last month', days: -2 },
]

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [memberPeriod, setMemberPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [aiInsights, setAiInsights] = useState<AIInsightsData | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      const response = await fetch(`/api/admin/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [dateRange])

  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true)
    try {
      const response = await fetch('/api/admin/analytics/insights')
      if (response.ok) {
        const data = await response.json()
        setAiInsights(data)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoadingInsights(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
    fetchInsights()
  }, [fetchAnalytics, fetchInsights])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
    fetchInsights()
  }

  const handlePresetClick = (preset: typeof DATE_PRESETS[0]) => {
    const now = new Date()
    let start: Date
    let end: Date = now

    if (preset.days === -1) {
      // This month
      start = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (preset.days === -2) {
      // Last month
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0)
    } else {
      start = new Date(now.getTime() - preset.days * 24 * 60 * 60 * 1000)
    }

    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    })
    setShowDatePicker(false)
  }

  const getMemberGrowth = () => {
    if (!analytics) return 0
    switch (memberPeriod) {
      case 'daily': return Math.round(analytics.members.newThisWeek / 7)
      case 'weekly': return analytics.members.newThisWeek
      case 'monthly': return analytics.members.newThisMonth
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-navy mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Analytics</h1>
            <p className="text-gray-600">Comprehensive platform insights and metrics</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border p-4 z-50">
                  <div className="space-y-2 mb-4">
                    {DATE_PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => handlePresetClick(preset)}
                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-navy hover:bg-navy/90"
                      onClick={() => setShowDatePicker(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Insights Panel */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-purple-900">AI Insights</CardTitle>
                      <CardDescription className="text-purple-600">
                        Automated analysis and predictions
                      </CardDescription>
                    </div>
                  </div>
                  {aiInsights?.generatedAt && (
                    <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                      Updated {new Date(aiInsights.generatedAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingInsights ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  </div>
                ) : aiInsights ? (
                  <div className="space-y-4">
                    {/* AI Summary */}
                    <div className="p-4 bg-white/70 rounded-lg border border-purple-100">
                      <p className="text-gray-700">{aiInsights.summary}</p>
                    </div>

                    {/* Insights Grid */}
                    {aiInsights.insights.length > 0 && (
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {aiInsights.insights.slice(0, 3).map((insight, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              insight.type === 'success'
                                ? 'bg-green-50 border-green-200'
                                : insight.type === 'warning'
                                  ? 'bg-amber-50 border-amber-200'
                                  : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {insight.type === 'success' ? (
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              ) : insight.type === 'warning' ? (
                                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                              ) : (
                                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900">{insight.title}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{insight.description}</p>
                                {insight.metric && (
                                  <Badge
                                    variant="outline"
                                    className={`mt-2 text-xs ${
                                      insight.type === 'success'
                                        ? 'text-green-700 border-green-300'
                                        : insight.type === 'warning'
                                          ? 'text-amber-700 border-amber-300'
                                          : 'text-blue-700 border-blue-300'
                                    }`}
                                  >
                                    {insight.metric}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Predictions */}
                    {aiInsights.predictions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-purple-900 mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Predictions
                        </h4>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                          {aiInsights.predictions.map((prediction, index) => (
                            <div key={index} className="p-3 bg-white/70 rounded-lg border border-purple-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500">{prediction.title}</span>
                                {prediction.trend === 'up' ? (
                                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                                ) : prediction.trend === 'down' ? (
                                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                                ) : (
                                  <Activity className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                              <p className="font-bold text-gray-900">{prediction.prediction}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${prediction.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">{prediction.confidence}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No insights available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Members</p>
                      <p className="text-3xl font-bold text-navy">{analytics?.members.total.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {analytics?.members.changePercent && analytics.members.changePercent > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${analytics?.members.changePercent && analytics.members.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analytics?.members.changePercent > 0 ? '+' : ''}{analytics?.members.changePercent}% vs prev
                        </span>
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-navy opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Revenue (Period)</p>
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(analytics?.revenue.periodTotal || 0)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {analytics?.revenue.changePercent && analytics.revenue.changePercent > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${analytics?.revenue.changePercent && analytics.revenue.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analytics?.revenue.changePercent > 0 ? '+' : ''}{analytics?.revenue.changePercent}% vs prev
                        </span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Engagement Rate</p>
                      <p className="text-3xl font-bold text-purple-600">{analytics?.members.engagementRate}%</p>
                      <div className="flex items-center gap-1 mt-1">
                        {analytics?.members.engagementChange && analytics.members.engagementChange > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${analytics?.members.engagementChange && analytics.members.engagementChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analytics?.members.engagementChange > 0 ? '+' : ''}{analytics?.members.engagementChange}% vs prev
                        </span>
                      </div>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Monthly Recurring</p>
                      <p className="text-3xl font-bold text-gold">{formatCurrency(analytics?.revenue.mrr || 0)}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {analytics?.revenue.byTier.partner.count} partners + {analytics?.revenue.byTier.covenant.count} covenant
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-gold opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Member Growth</CardTitle>
                  <CardDescription>New members over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.members.growthTrend && analytics.members.growthTrend.length > 0 ? (
                    <AreaChart
                      data={analytics.members.growthTrend}
                      xAxisKey="date"
                      areas={[{ dataKey: 'newMembers', name: 'New Members', color: CHART_COLORS.navy }]}
                      height={250}
                      formatXAxis={formatDate}
                    />
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-400">
                      No growth data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Trend</CardTitle>
                  <CardDescription>Daily giving over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.revenue.revenueTrend && analytics.revenue.revenueTrend.length > 0 ? (
                    <AreaChart
                      data={analytics.revenue.revenueTrend}
                      xAxisKey="date"
                      areas={[{ dataKey: 'amount', name: 'Amount', color: CHART_COLORS.green }]}
                      height={250}
                      formatXAxis={formatDate}
                      formatTooltip={(v) => `$${v.toLocaleString()}`}
                    />
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-400">
                      No revenue data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Distribution Charts */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Membership Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.members.tierChartData ? (
                    <DonutChart
                      data={analytics.members.tierChartData}
                      height={200}
                    />
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-400">
                      No tier data
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Giving by Fund</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.revenue.fundChartData && analytics.revenue.fundChartData.length > 0 ? (
                    <DonutChart
                      data={analytics.revenue.fundChartData}
                      height={200}
                      formatValue={(v) => `$${v.toLocaleString()}`}
                    />
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-400">
                      No fund data
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feature Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.engagement.featureChartData && analytics.engagement.featureChartData.length > 0 ? (
                    <BarChart
                      data={analytics.engagement.featureChartData.slice(0, 5)}
                      xAxisKey="name"
                      bars={[{ dataKey: 'value', name: 'Usage', color: CHART_COLORS.purple }]}
                      height={200}
                      layout="vertical"
                      showLegend={false}
                    />
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-400">
                      No usage data
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">
                    {analytics?.members.total.toLocaleString() || 0}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {analytics?.members.byTier.partner || 0} partners
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {analytics?.members.byTier.covenant || 0} covenant
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Engagement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{analytics?.members.engagementRate || 0}%</div>
                  <div className="flex items-center gap-1 mt-1">
                    {(analytics?.members.engagementChange || 0) >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${(analytics?.members.engagementChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics?.members.engagementChange || 0}% vs previous period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Member Growth</CardTitle>
                    <div className="flex gap-1">
                      {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setMemberPeriod(period)}
                          className={`px-2 py-1 text-xs rounded ${
                            memberPeriod === period
                              ? 'bg-navy text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">
                    +{getMemberGrowth()}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">New members this {memberPeriod.replace('ly', '')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Member Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Trend</CardTitle>
                <CardDescription>New member signups over time</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.members.growthTrend && analytics.members.growthTrend.length > 0 ? (
                  <LineChart
                    data={analytics.members.growthTrend}
                    xAxisKey="date"
                    lines={[{ dataKey: 'newMembers', name: 'New Members', color: CHART_COLORS.navy }]}
                    height={300}
                    formatXAxis={formatDate}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No growth data available
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Most Active Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Most Active Members</CardTitle>
                  <CardDescription>Top engagement scores this period</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.members.mostActive.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No activity data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics?.members.mostActive.map((member, index) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gold text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-navy">{member.name}</p>
                              <p className="text-xs text-gray-600">{member.actions} actions</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gold">{member.score}</p>
                            <p className="text-xs text-gray-600">score</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* At-Risk Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">At-Risk Members</CardTitle>
                  <CardDescription>Inactive 30+ days - need re-engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.members.atRisk.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>Great! No at-risk members</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analytics?.members.atRisk.map((member) => (
                        <div key={member.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-navy">{member.name}</p>
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              {member.daysInactive} days
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Last: {member.lastAction}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-navy" />
                    <span className="text-sm text-gray-600">Total Teachings</span>
                  </div>
                  <div className="text-3xl font-bold mt-2">{analytics?.content.teachings.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Devotionals Read</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">{analytics?.content.devotionalsRead || 0}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {(analytics?.content.devotionalsChange || 0) >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${(analytics?.content.devotionalsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics?.content.devotionalsChange || 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Avg Completion</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mt-2">{analytics?.content.teachings.avgCompletionRate || 0}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-600">AI Chats</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mt-2">{analytics?.engagement?.aiChats || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Most Viewed Teachings</CardTitle>
                  <CardDescription>Top performing content</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.content.teachings.mostViewed.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No teachings yet</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics?.content.teachings.mostViewed.map((teaching) => (
                        <div key={teaching.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-navy truncate">{teaching.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {teaching.views}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {teaching.completionRate}% completion
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-green-600 h-1.5 rounded-full"
                              style={{ width: `${teaching.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Search Trends</CardTitle>
                  <CardDescription>What members are searching for</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.content.searchTrends.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No search data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics?.content.searchTrends.map((trend, index) => (
                        <div key={trend.keyword} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                            <span className="font-medium text-navy capitalize">{trend.keyword}</span>
                          </div>
                          <span className="text-sm text-gray-600">{trend.searches} searches</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">
                    {formatCurrency(analytics?.revenue?.mrr || 0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">From memberships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Period Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(analytics?.revenue?.periodTotal || 0)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {(analytics?.revenue?.changePercent || 0) >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${(analytics?.revenue?.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics?.revenue?.changePercent || 0}% vs prev
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">
                    {formatCurrency(analytics?.revenue?.thisMonth || 0)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {analytics?.revenue.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${analytics?.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics?.revenue.change || 0}% vs last month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Lifetime Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">
                    ${analytics?.revenue.avgLifetimeValue?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Per member</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily giving over time</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.revenue.revenueTrend && analytics.revenue.revenueTrend.length > 0 ? (
                  <AreaChart
                    data={analytics.revenue.revenueTrend}
                    xAxisKey="date"
                    areas={[{ dataKey: 'amount', name: 'Amount', color: CHART_COLORS.green }]}
                    height={300}
                    formatXAxis={formatDate}
                    formatTooltip={(v) => `$${v.toLocaleString()}`}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No revenue data available
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Revenue by Tier</CardTitle>
                  <CardDescription>Breakdown by membership level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gold/5 rounded-lg border border-gold/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-navy">Partners</span>
                        <span className="text-lg font-bold text-gold">
                          {formatCurrency(analytics?.revenue?.byTier?.partner?.mrr || 0)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{analytics?.revenue?.byTier?.partner?.count || 0} members</p>
                    </div>
                    <div className="p-4 bg-navy/5 rounded-lg border border-navy/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-navy">Covenant Partners</span>
                        <span className="text-lg font-bold text-navy">
                          {formatCurrency(analytics?.revenue?.byTier?.covenant?.mrr || 0)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{analytics?.revenue?.byTier?.covenant?.count || 0} members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Giving by Fund</CardTitle>
                  <CardDescription>This period's giving breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.revenue.fundChartData && analytics.revenue.fundChartData.length > 0 ? (
                    <DonutChart
                      data={analytics.revenue.fundChartData}
                      height={250}
                      formatValue={(v) => `$${v.toLocaleString()}`}
                    />
                  ) : (
                    <p className="text-center py-8 text-gray-500">No donations this period</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Daily Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{analytics?.engagement.dau || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Weekly Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{analytics?.engagement.wau?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Monthly Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{analytics?.engagement.mau?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Session Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{analytics?.engagement.avgSessionDuration || '0:00'}</div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Trend</CardTitle>
                <CardDescription>Daily platform activity</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.engagement.activityTrend && analytics.engagement.activityTrend.length > 0 ? (
                  <LineChart
                    data={analytics.engagement.activityTrend}
                    xAxisKey="date"
                    lines={[{ dataKey: 'activities', name: 'Activities', color: CHART_COLORS.purple }]}
                    height={300}
                    formatXAxis={formatDate}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    No activity data available
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Feature Usage</CardTitle>
                  <CardDescription>Most used platform features</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.engagement.featureChartData && analytics.engagement.featureChartData.length > 0 ? (
                    <BarChart
                      data={analytics.engagement.featureChartData}
                      xAxisKey="name"
                      bars={[{ dataKey: 'value', name: 'Usage' }]}
                      height={300}
                      layout="vertical"
                      colorByIndex
                      showLegend={false}
                    />
                  ) : (
                    <p className="text-center py-8 text-gray-500">No feature usage data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Activity Highlights</CardTitle>
                  <CardDescription>Key engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bot className="h-6 w-6 text-purple-600" />
                        <span className="font-medium">AI Conversations</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">{analytics?.engagement.aiChats || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Heart className="h-6 w-6 text-red-500" />
                        <span className="font-medium">Prayer Requests</span>
                      </div>
                      <span className="text-2xl font-bold text-red-500">{analytics?.engagement.prayerRequests || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <PenLine className="h-6 w-6 text-blue-600" />
                        <span className="font-medium">Journal Entries</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{analytics?.engagement.journalEntries || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Tab (PLANT & Gamification) */}
          <TabsContent value="learning" className="space-y-6">
            {/* PLANT LMS Section */}
            <div>
              <h2 className="text-2xl font-bold text-navy mb-4 flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                PLANT Learning System
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-navy" />
                      <span className="text-sm text-gray-600">Total Enrollments</span>
                    </div>
                    <div className="text-3xl font-bold mt-2">{analytics?.plant?.totalEnrollments || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-600">Completion Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mt-2">{analytics?.plant?.completionRate || 0}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Lessons Completed</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mt-2">{analytics?.plant?.lessonsCompleted || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span className="text-sm text-gray-600">Avg Quiz Score</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mt-2">{analytics?.plant?.avgQuizScore || 0}%</div>
                  </CardContent>
                </Card>
              </div>

              {analytics?.plant?.topCourses && analytics.plant.topCourses.length > 0 && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Top Courses</CardTitle>
                    <CardDescription>Most enrolled courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.plant.topCourses.map((course, index) => (
                        <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-gray-400">{index + 1}</span>
                            <span className="font-medium text-navy">{course.title}</span>
                          </div>
                          <Badge>{course.enrollments} enrolled</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Gamification Section */}
            <div>
              <h2 className="text-2xl font-bold text-navy mb-4 flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Gamification
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-gold" />
                      <span className="text-sm text-gray-600">Points Awarded</span>
                    </div>
                    <div className="text-3xl font-bold text-gold mt-2">
                      {(analytics?.gamification?.totalPointsAwarded || 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span className="text-sm text-gray-600">Badges Awarded</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mt-2">{analytics?.gamification?.badgesAwarded || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <span className="text-sm text-gray-600">Active Streaks</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-500 mt-2">{analytics?.gamification?.activeStreaks || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-600">Achievements</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mt-2">{analytics?.gamification?.achievementsUnlocked || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {analytics?.gamification?.leaderboard && analytics.gamification.leaderboard.length > 0 && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                    <CardDescription>Top members by points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.gamification.leaderboard.map((member) => (
                        <div key={member.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm ${
                              member.rank === 1 ? 'bg-gold text-white' :
                              member.rank === 2 ? 'bg-gray-400 text-white' :
                              member.rank === 3 ? 'bg-amber-700 text-white' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {member.rank}
                            </div>
                            <span className="font-medium text-navy">{member.name}</span>
                          </div>
                          <span className="text-lg font-bold text-gold">{member.points.toLocaleString()} pts</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

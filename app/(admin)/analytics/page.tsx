'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  PenLine
} from 'lucide-react'

interface Analytics {
  members: {
    total: number
    newThisWeek: number
    newThisMonth: number
    activeMembers: number
    engagementRate: number
    byTier: { free: number; partner: number; covenant: number }
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
  }
  revenue: {
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
    avgLifetimeValue: number
  }
  engagement: {
    dau: number
    wau: number
    mau: number
    avgSessionDuration: string
    topFeatures: Array<{ feature: string; usage: number; percentage: number }>
    aiChats: number
    prayerRequests: number
    journalEntries: number
  }
  growth: {
    weekly: Array<{ week: string; newMembers: number }>
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [memberPeriod, setMemberPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
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
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  const getMemberGrowth = () => {
    if (!analytics) return 0
    switch (memberPeriod) {
      case 'daily': return Math.round(analytics.members.newThisWeek / 7)
      case 'weekly': return analytics.members.newThisWeek
      case 'monthly': return analytics.members.newThisMonth
    }
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

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            {/* Growth Metrics */}
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
                  <p className="text-sm text-gray-600 mt-1">Active in last 30 days</p>
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

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Most Active Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Most Active Members</CardTitle>
                  <CardDescription>Top engagement scores this month</CardDescription>
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
            {/* Quick Stats */}
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
                    <span className="text-sm text-gray-600">Devotionals Read (30d)</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">{analytics?.content.devotionalsRead || 0}</div>
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
                    <span className="text-sm text-gray-600">AI Chats (30d)</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mt-2">{analytics?.engagement?.aiChats || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Most Viewed Teachings */}
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

              {/* Search Trends */}
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
            {/* Revenue Metrics */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">
                    ${(analytics?.revenue?.mrr || 0) >= 1000
                      ? ((analytics?.revenue?.mrr || 0) / 1000).toFixed(1) + 'k'
                      : analytics?.revenue?.mrr || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">From memberships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ${(analytics?.revenue?.thisMonth || 0) >= 1000
                      ? ((analytics?.revenue?.thisMonth || 0) / 1000).toFixed(1) + 'k'
                      : analytics?.revenue?.thisMonth || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Total revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">vs Last Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${analytics?.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics?.revenue.trend === 'up' ? '+' : ''}{analytics?.revenue.change || 0}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    {analytics?.revenue.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    Revenue change
                  </p>
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

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue by Tier */}
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
                          ${((analytics?.revenue?.byTier?.partner?.mrr || 0) / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{analytics?.revenue?.byTier?.partner?.count || 0} members</p>
                    </div>
                    <div className="p-4 bg-navy/5 rounded-lg border border-navy/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-navy">Covenant Partners</span>
                        <span className="text-lg font-bold text-navy">
                          ${((analytics?.revenue?.byTier?.covenant?.mrr || 0) / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{analytics?.revenue?.byTier?.covenant?.count || 0} members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donations by Mission */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Donations by Fund</CardTitle>
                  <CardDescription>This month's giving</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.revenue.byMission.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No donations this month</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics?.revenue.byMission.map((mission) => (
                        <div key={mission.location} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-navy">{mission.location}</p>
                            <p className="text-xs text-gray-600">{mission.donations} donations</p>
                          </div>
                          <span className="font-semibold text-navy">
                            ${mission.amount >= 1000 ? (mission.amount / 1000).toFixed(1) + 'k' : mission.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            {/* Active Users */}
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

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Most Used Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Most Used Features</CardTitle>
                  <CardDescription>Feature adoption by members</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.engagement.topFeatures.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No feature usage data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics?.engagement.topFeatures.map((feature) => (
                        <div key={feature.feature}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-navy">{feature.feature}</span>
                            <span className="text-sm text-gray-600">{feature.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-navy h-2 rounded-full"
                              style={{ width: `${feature.percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{feature.usage} uses</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Activity Highlights</CardTitle>
                  <CardDescription>Key engagement metrics (30 days)</CardDescription>
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
        </Tabs>
      </div>
    </div>
  )
}

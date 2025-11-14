'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Sparkles,
  Eye,
  Clock,
  Target,
} from 'lucide-react'

export default function AnalyticsPage() {
  const [memberPeriod, setMemberPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  // Mock data - will be replaced with API calls
  const memberMetrics = {
    growth: {
      daily: 2.3,
      weekly: 12,
      monthly: 47,
    },
    churnRate: 3.2,
    engagementRate: 68.5,
    mostActive: [
      { id: '1', name: 'Sarah Johnson', score: 98, actions: 127 },
      { id: '2', name: 'Michael Chen', score: 95, actions: 114 },
      { id: '3', name: 'David Williams', score: 92, actions: 108 },
    ],
    atRisk: [
      { id: '4', name: 'Jessica Martinez', daysInactive: 45, lastAction: 'Viewed teaching' },
      { id: '5', name: 'Robert Taylor', daysInactive: 38, lastAction: 'Completed assessment' },
    ],
  }

  const contentMetrics = {
    teachings: {
      mostViewed: [
        { id: '1', title: 'The Power of Purpose-Driven Faith', views: 1247, completionRate: 78 },
        { id: '2', title: 'Leadership Principles from Nehemiah', views: 1089, completionRate: 82 },
        { id: '3', title: 'Faith and Business Excellence', views: 956, completionRate: 71 },
      ],
      avgCompletionRate: 76,
    },
    prophecies: {
      mostListened: [
        { id: '1', title: 'A Season of Divine Acceleration', listens: 892, avgListenTime: '15:42' },
        { id: '2', title: 'Walking in Your Kingdom Assignment', listens: 734, avgListenTime: '18:20' },
        { id: '3', title: 'Breaking Generational Barriers', listens: 678, avgListenTime: '12:15' },
      ],
    },
    searchTrends: [
      { keyword: 'purpose', searches: 234 },
      { keyword: 'breakthrough', searches: 189 },
      { keyword: 'business', searches: 167 },
      { keyword: 'leadership', searches: 145 },
      { keyword: 'healing', searches: 132 },
    ],
    contentGaps: [
      { topic: 'AI in Ministry', searches: 87, available: 2 },
      { topic: 'Financial Freedom', searches: 76, available: 3 },
      { topic: 'Marriage', searches: 64, available: 1 },
    ],
  }

  const revenueMetrics = {
    mrr: 32500,
    mrrTrend: 12.3,
    newRevenue: 8750,
    churnedRevenue: 1250,
    byTier: {
      partner: { mrr: 25000, count: 500 },
      covenant: { mrr: 7500, count: 50 },
    },
    avgLifetimeValue: 1847,
    donationTrends: {
      thisMonth: 18500,
      lastMonth: 15200,
      change: 21.7,
    },
    byMission: [
      { location: 'Kenya', amount: 8500, donations: 127 },
      { location: 'South Africa', amount: 6200, donations: 89 },
      { location: 'Grenada', amount: 4800, donations: 76 },
      { location: 'General', amount: 11000, donations: 234 },
    ],
  }

  const engagementMetrics = {
    dau: 487,
    wau: 1234,
    mau: 2847,
    avgSessionDuration: '18:42',
    topFeatures: [
      { feature: 'Teachings Library', usage: 2341, percentage: 82 },
      { feature: 'Season Journey', usage: 1876, percentage: 66 },
      { feature: 'Prayer Requests', usage: 1543, percentage: 54 },
      { feature: 'Prophetic Words', usage: 1289, percentage: 45 },
      { feature: 'Community', usage: 987, percentage: 35 },
    ],
    dropOffPoints: [
      { point: 'Season Week 3', dropOff: 23, retention: 77 },
      { point: 'Assessment Start', dropOff: 18, retention: 82 },
      { point: 'Teaching 30min Mark', dropOff: 15, retention: 85 },
    ],
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy mb-2">Analytics</h1>
          <p className="text-gray-600">Comprehensive platform insights and metrics</p>
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
                  <CardTitle className="text-sm font-medium text-gray-600">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{memberMetrics.churnRate}%</div>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <ArrowDownRight className="h-3 w-3" />
                    Down from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Engagement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{memberMetrics.engagementRate}%</div>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3" />
                    Up 4.2% this month
                  </p>
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
                    +{memberMetrics.growth[memberPeriod]}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">New members this {memberPeriod.replace('ly', '')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-navy">Member Growth Trend</CardTitle>
                <CardDescription>Last 90 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Growth chart will be rendered here</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Most Active Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Most Active Members</CardTitle>
                  <CardDescription>Top engagement scores this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {memberMetrics.mostActive.map((member, index) => (
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
                </CardContent>
              </Card>

              {/* At-Risk Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">At-Risk Members</CardTitle>
                  <CardDescription>Inactive 30+ days - need re-engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {memberMetrics.atRisk.map((member) => (
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Most Viewed Teachings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Most Viewed Teachings</CardTitle>
                  <CardDescription>Top performing content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentMetrics.teachings.mostViewed.map((teaching) => (
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
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Average Completion Rate:{' '}
                      <span className="font-semibold text-navy">{contentMetrics.teachings.avgCompletionRate}%</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Most Listened Prophetic Words */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Most Listened Prophetic Words</CardTitle>
                  <CardDescription>Popular prophetic content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentMetrics.prophecies.mostListened.map((prophecy) => (
                      <div key={prophecy.id} className="flex items-start justify-between p-3 bg-gold/5 rounded-lg">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <Sparkles className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-navy truncate">{prophecy.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                {prophecy.listens}
                              </span>
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {prophecy.avgListenTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Search Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Search Trends</CardTitle>
                  <CardDescription>What members are searching for</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {contentMetrics.searchTrends.map((trend, index) => (
                      <div key={trend.keyword} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                          <span className="font-medium text-navy capitalize">{trend.keyword}</span>
                        </div>
                        <span className="text-sm text-gray-600">{trend.searches} searches</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Content Gaps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-600" />
                    Content Gaps
                  </CardTitle>
                  <CardDescription>High demand, low supply topics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentMetrics.contentGaps.map((gap) => (
                      <div key={gap.topic} className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-navy">{gap.topic}</p>
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            {gap.searches} searches
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Only {gap.available} teaching(s) available</p>
                      </div>
                    ))}
                  </div>
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
                  <div className="text-3xl font-bold text-navy">${(revenueMetrics.mrr / 1000).toFixed(1)}k</div>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +{revenueMetrics.mrrTrend}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">New Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">${(revenueMetrics.newRevenue / 1000).toFixed(1)}k</div>
                  <p className="text-xs text-gray-600 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Churned Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">${(revenueMetrics.churnedRevenue / 1000).toFixed(1)}k</div>
                  <p className="text-xs text-gray-600 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Lifetime Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">${revenueMetrics.avgLifetimeValue.toLocaleString()}</div>
                  <p className="text-xs text-gray-600 mt-1">Per member</p>
                </CardContent>
              </Card>
            </div>

            {/* MRR Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-navy">MRR Trend</CardTitle>
                <CardDescription>Monthly recurring revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">MRR trend chart will be rendered here</p>
                </div>
              </CardContent>
            </Card>

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
                        <span className="text-lg font-bold text-gold">${(revenueMetrics.byTier.partner.mrr / 1000).toFixed(1)}k</span>
                      </div>
                      <p className="text-sm text-gray-600">{revenueMetrics.byTier.partner.count} members</p>
                    </div>
                    <div className="p-4 bg-navy/5 rounded-lg border border-navy/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-navy">Covenant Partners</span>
                        <span className="text-lg font-bold text-navy">${(revenueMetrics.byTier.covenant.mrr / 1000).toFixed(1)}k</span>
                      </div>
                      <p className="text-sm text-gray-600">{revenueMetrics.byTier.covenant.count} members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donation Trends & Mission Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Mission Revenue</CardTitle>
                  <CardDescription>Donations by location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {revenueMetrics.byMission.map((mission) => (
                      <div key={mission.location} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-navy">{mission.location}</p>
                          <p className="text-xs text-gray-600">{mission.donations} donations</p>
                        </div>
                        <span className="font-semibold text-navy">${(mission.amount / 1000).toFixed(1)}k</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Donations This Month</span>
                      <span className="text-lg font-bold text-green-600">
                        ${(revenueMetrics.donationTrends.thisMonth / 1000).toFixed(1)}k
                      </span>
                    </div>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-3 w-3" />
                      +{revenueMetrics.donationTrends.change}% vs last month
                    </p>
                  </div>
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
                  <div className="text-3xl font-bold text-navy">{engagementMetrics.dau}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Weekly Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{engagementMetrics.wau.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Monthly Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{engagementMetrics.mau.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Session Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{engagementMetrics.avgSessionDuration}</div>
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
                  <div className="space-y-3">
                    {engagementMetrics.topFeatures.map((feature) => (
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
                        <p className="text-xs text-gray-500 mt-1">{feature.usage} users</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Drop-off Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Drop-off Points</CardTitle>
                  <CardDescription>Where members stop engaging</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {engagementMetrics.dropOffPoints.map((point) => (
                      <div key={point.point} className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-navy">{point.point}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              {point.dropOff}% drop
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              {point.retention}% retain
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${point.retention}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
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

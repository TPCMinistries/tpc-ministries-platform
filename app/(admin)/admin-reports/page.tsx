'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LineChart, AreaChart, BarChart, DonutChart, CHART_COLORS } from '@/components/charts'
import {
  FileText,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Heart,
  Calendar,
  BarChart3,
  Loader2,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
  BookOpen,
  MessageSquare,
  PenLine
} from 'lucide-react'

interface ReportData {
  membership: {
    total: number
    new: number
    byTier: { free: number; partner: number; covenant: number }
    growthRate: string
    trend?: Array<{ date: string; count: number }>
  }
  financial: {
    totalRevenue: number
    donationCount: number
    averageDonation: number
    byFund: Array<{ fund: string; amount: number }>
    partnerMRR: number
    covenantMRR: number
    trend?: Array<{ date: string; amount: number }>
    recurring?: number
    oneTime?: number
  }
  engagement: {
    activeMembers: number
    engagementRate: string
    totalActivities: number
    byActivityType: Array<{ type: string; count: number }>
    trend?: Array<{ date: string; activities: number }>
    dau?: number
    wau?: number
    mau?: number
  }
  spiritual: {
    prayerRequests: number
    answeredPrayers: number
    answerRate: string
    teachingsWatched: number
    devotionalsRead: number
    trend?: Array<{ date: string; prayers: number; answered: number }>
    byCategory?: Array<{ category: string; count: number }>
  }
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [reportType, setReportType] = useState('board')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      const res = await fetch(`/api/admin/reports?${params}`)
      if (res.ok) {
        const data = await res.json()
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    }
    setLoading(false)
  }, [reportType, dateRange])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const exportReport = async (format: 'json' | 'csv') => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format
      })
      const res = await fetch(`/api/admin/reports?${params}`)

      if (format === 'csv') {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      } else {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
    setExporting(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const reportTypes = [
    { id: 'board', label: 'Board Overview', icon: BarChart3 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'donations', label: 'Donations', icon: DollarSign },
    { id: 'engagement', label: 'Engagement', icon: TrendingUp },
    { id: 'prayers', label: 'Prayers', icon: Heart }
  ]

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-gold" />
              Ministry Reports
            </h1>
            <p className="text-gray-600">Generate and export comprehensive ministry reports</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => exportReport('csv')}
              disabled={exporting || loading}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
            <Button
              onClick={() => exportReport('json')}
              disabled={exporting || loading}
              className="bg-navy hover:bg-navy/90"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export JSON
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Report Type */}
              <div className="flex gap-2">
                {reportTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      reportType === type.id
                        ? 'bg-navy text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="flex-1" />

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <Button variant="outline" size="sm" onClick={fetchReport}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-navy mx-auto mb-4" />
              <p className="text-gray-500">Generating report...</p>
            </div>
          </div>
        ) : reportData ? (
          <>
            {/* Board Overview Report */}
            {reportType === 'board' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-navy to-navy/80 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Total Members</span>
                        <Users className="h-5 w-5 text-gold" />
                      </div>
                      <p className="text-4xl font-bold">{reportData.membership.total}</p>
                      <p className="text-sm text-white/70 mt-1">
                        +{reportData.membership.new} new ({reportData.membership.growthRate})
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Total Revenue</span>
                        <DollarSign className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-4xl font-bold text-navy">
                        ${reportData.financial.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {reportData.financial.donationCount} donations
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Engagement Rate</span>
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-4xl font-bold text-navy">{reportData.engagement.engagementRate}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {reportData.engagement.activeMembers} active members
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Prayer Answer Rate</span>
                        <Heart className="h-5 w-5 text-red-500" />
                      </div>
                      <p className="text-4xl font-bold text-navy">{reportData.spiritual.answerRate}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {reportData.spiritual.answeredPrayers}/{reportData.spiritual.prayerRequests} answered
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Membership Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DonutChart
                        data={[
                          { name: 'Free', value: reportData.membership.byTier.free },
                          { name: 'Partner', value: reportData.membership.byTier.partner },
                          { name: 'Covenant', value: reportData.membership.byTier.covenant }
                        ]}
                        height={250}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Giving by Fund
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {reportData.financial.byFund.length > 0 ? (
                        <DonutChart
                          data={reportData.financial.byFund.map(f => ({
                            name: f.fund,
                            value: f.amount
                          }))}
                          height={250}
                          formatValue={(v) => `$${v.toLocaleString()}`}
                        />
                      ) : (
                        <div className="h-[250px] flex items-center justify-center text-gray-400">
                          No donation data
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Activity & Spiritual */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Top Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {reportData.engagement.byActivityType.length > 0 ? (
                        <BarChart
                          data={reportData.engagement.byActivityType.slice(0, 6).map(a => ({
                            name: a.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            value: a.count
                          }))}
                          xAxisKey="name"
                          bars={[{ dataKey: 'value', name: 'Count' }]}
                          height={250}
                          layout="vertical"
                          colorByIndex
                          showLegend={false}
                        />
                      ) : (
                        <div className="h-[250px] flex items-center justify-center text-gray-400">
                          No activity data
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Spiritual Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-3xl font-bold text-navy">{reportData.spiritual.prayerRequests}</p>
                          <p className="text-sm text-gray-500">Prayer Requests</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-3xl font-bold text-green-600">{reportData.spiritual.answeredPrayers}</p>
                          <p className="text-sm text-gray-500">Answered</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-3xl font-bold text-blue-600">{reportData.spiritual.teachingsWatched}</p>
                          <p className="text-sm text-gray-500">Teachings Watched</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-3xl font-bold text-purple-600">{reportData.spiritual.devotionalsRead}</p>
                          <p className="text-sm text-gray-500">Devotionals Read</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Members Report */}
            {reportType === 'members' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Total Members</span>
                        <Users className="h-5 w-5 text-navy" />
                      </div>
                      <p className="text-4xl font-bold text-navy">{reportData.membership.total}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">New This Period</span>
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-4xl font-bold text-green-600">+{reportData.membership.new}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Growth Rate</span>
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-4xl font-bold text-purple-600">{reportData.membership.growthRate}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Paid Members</span>
                        <DollarSign className="h-5 w-5 text-gold" />
                      </div>
                      <p className="text-4xl font-bold text-gold">
                        {reportData.membership.byTier.partner + reportData.membership.byTier.covenant}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Membership by Tier</CardTitle>
                      <CardDescription>Distribution across membership levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DonutChart
                        data={[
                          { name: 'Free', value: reportData.membership.byTier.free },
                          { name: 'Partner ($50/mo)', value: reportData.membership.byTier.partner },
                          { name: 'Covenant ($150/mo)', value: reportData.membership.byTier.covenant }
                        ]}
                        height={280}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tier Breakdown</CardTitle>
                      <CardDescription>Detailed membership metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Free Members</span>
                            <span className="text-gray-600">{reportData.membership.byTier.free}</span>
                          </div>
                          <Progress
                            value={(reportData.membership.byTier.free / reportData.membership.total) * 100}
                            className="h-3"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.round((reportData.membership.byTier.free / reportData.membership.total) * 100)}% of total
                          </p>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Partners</span>
                            <span className="text-gray-600">{reportData.membership.byTier.partner}</span>
                          </div>
                          <Progress
                            value={(reportData.membership.byTier.partner / reportData.membership.total) * 100}
                            className="h-3 [&>div]:bg-gold"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            ${(reportData.membership.byTier.partner * 50).toLocaleString()}/mo MRR
                          </p>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Covenant Partners</span>
                            <span className="text-gray-600">{reportData.membership.byTier.covenant}</span>
                          </div>
                          <Progress
                            value={(reportData.membership.byTier.covenant / reportData.membership.total) * 100}
                            className="h-3 [&>div]:bg-purple-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            ${(reportData.membership.byTier.covenant * 150).toLocaleString()}/mo MRR
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Donations Report */}
            {reportType === 'donations' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80">Total Giving</span>
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <p className="text-4xl font-bold">${reportData.financial.totalRevenue.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Donations</span>
                        <Heart className="h-5 w-5 text-red-500" />
                      </div>
                      <p className="text-4xl font-bold text-navy">{reportData.financial.donationCount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Average Gift</span>
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-4xl font-bold text-navy">${reportData.financial.averageDonation.toFixed(0)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Monthly Recurring</span>
                        <RefreshCcw className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-4xl font-bold text-purple-600">
                        ${(reportData.financial.partnerMRR + reportData.financial.covenantMRR).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Giving by Fund</CardTitle>
                      <CardDescription>Distribution across ministry funds</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reportData.financial.byFund.length > 0 ? (
                        <DonutChart
                          data={reportData.financial.byFund.map(f => ({
                            name: f.fund,
                            value: f.amount
                          }))}
                          height={280}
                          formatValue={(v) => `$${v.toLocaleString()}`}
                        />
                      ) : (
                        <div className="h-[280px] flex items-center justify-center text-gray-400">
                          No fund data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Fund Details</CardTitle>
                      <CardDescription>Breakdown by giving category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reportData.financial.byFund.length > 0 ? (
                        <div className="space-y-4">
                          {reportData.financial.byFund.map((fund, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: Object.values(CHART_COLORS)[i % 6] }}
                              />
                              <span className="flex-1 font-medium">{fund.fund}</span>
                              <span className="text-lg font-bold text-navy">${fund.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-[280px] flex items-center justify-center text-gray-400">
                          No fund data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recurring Revenue Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-gold/10 rounded-lg border border-gold/20">
                        <h3 className="text-lg font-bold text-navy mb-2">Partner Memberships</h3>
                        <p className="text-3xl font-bold text-gold">${reportData.financial.partnerMRR.toLocaleString()}/mo</p>
                        <p className="text-sm text-gray-600 mt-1">{reportData.membership.byTier.partner} members x $50</p>
                      </div>
                      <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                        <h3 className="text-lg font-bold text-navy mb-2">Covenant Memberships</h3>
                        <p className="text-3xl font-bold text-purple-600">${reportData.financial.covenantMRR.toLocaleString()}/mo</p>
                        <p className="text-sm text-gray-600 mt-1">{reportData.membership.byTier.covenant} members x $150</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Engagement Report */}
            {reportType === 'engagement' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Active Members</span>
                        <Users className="h-5 w-5 text-navy" />
                      </div>
                      <p className="text-4xl font-bold text-navy">{reportData.engagement.activeMembers}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Engagement Rate</span>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-4xl font-bold text-green-600">{reportData.engagement.engagementRate}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Total Activities</span>
                        <Activity className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-4xl font-bold text-purple-600">
                        {reportData.engagement.totalActivities.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Avg per Member</span>
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-4xl font-bold text-blue-600">
                        {reportData.engagement.activeMembers > 0
                          ? Math.round(reportData.engagement.totalActivities / reportData.engagement.activeMembers)
                          : 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Distribution</CardTitle>
                      <CardDescription>Most popular platform features</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reportData.engagement.byActivityType.length > 0 ? (
                        <BarChart
                          data={reportData.engagement.byActivityType.slice(0, 8).map(a => ({
                            name: a.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            value: a.count
                          }))}
                          xAxisKey="name"
                          bars={[{ dataKey: 'value', name: 'Count' }]}
                          height={300}
                          layout="vertical"
                          colorByIndex
                          showLegend={false}
                        />
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                          No activity data
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Breakdown</CardTitle>
                      <CardDescription>Detailed activity counts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {reportData.engagement.byActivityType.slice(0, 8).map((activity, i) => {
                          const percentage = (activity.count / reportData.engagement.totalActivities) * 100
                          return (
                            <div key={i}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm capitalize">{activity.type.replace(/_/g, ' ')}</span>
                                <span className="text-sm font-medium">{activity.count.toLocaleString()}</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                              <p className="text-xs text-gray-500 mt-0.5">{percentage.toFixed(1)}% of total</p>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Prayers Report */}
            {reportType === 'prayers' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Prayer Requests</span>
                        <Heart className="h-5 w-5 text-red-500" />
                      </div>
                      <p className="text-4xl font-bold text-navy">{reportData.spiritual.prayerRequests}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Answered Prayers</span>
                        <Heart className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-4xl font-bold text-green-600">{reportData.spiritual.answeredPrayers}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Answer Rate</span>
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-4xl font-bold text-purple-600">{reportData.spiritual.answerRate}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Pending</span>
                        <MessageSquare className="h-5 w-5 text-amber-500" />
                      </div>
                      <p className="text-4xl font-bold text-amber-600">
                        {reportData.spiritual.prayerRequests - reportData.spiritual.answeredPrayers}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prayer Status</CardTitle>
                      <CardDescription>Answered vs Pending prayers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DonutChart
                        data={[
                          { name: 'Answered', value: reportData.spiritual.answeredPrayers },
                          { name: 'Pending', value: reportData.spiritual.prayerRequests - reportData.spiritual.answeredPrayers }
                        ]}
                        height={280}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Spiritual Activity</CardTitle>
                      <CardDescription>Content engagement metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Teachings Watched</p>
                            <p className="text-2xl font-bold text-blue-600">{reportData.spiritual.teachingsWatched}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <PenLine className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Devotionals Read</p>
                            <p className="text-2xl font-bold text-purple-600">{reportData.spiritual.devotionalsRead}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <Heart className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Prayer Answer Rate</p>
                            <p className="text-2xl font-bold text-green-600">{reportData.spiritual.answerRate}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No report data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  Heart,
  Calendar,
  BarChart3,
  PieChart,
  Loader2,
  RefreshCcw,
  Filter
} from 'lucide-react'

interface ReportData {
  membership: {
    total: number
    new: number
    byTier: { free: number; partner: number; covenant: number }
    growthRate: string
  }
  financial: {
    totalRevenue: number
    donationCount: number
    averageDonation: number
    byFund: Array<{ fund: string; amount: number }>
    partnerMRR: number
    covenantMRR: number
  }
  engagement: {
    activeMembers: number
    engagementRate: string
    totalActivities: number
    byActivityType: Array<{ type: string; count: number }>
  }
  spiritual: {
    prayerRequests: number
    answeredPrayers: number
    answerRate: string
    teachingsWatched: number
    devotionalsRead: number
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

  useEffect(() => {
    fetchReport()
  }, [reportType, dateRange])

  const fetchReport = async () => {
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
  }

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

                {/* Membership Breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Membership by Tier
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Free Members</span>
                            <span className="font-medium">{reportData.membership.byTier.free}</span>
                          </div>
                          <Progress
                            value={(reportData.membership.byTier.free / reportData.membership.total) * 100}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Partners ($50/mo)</span>
                            <span className="font-medium">{reportData.membership.byTier.partner}</span>
                          </div>
                          <Progress
                            value={(reportData.membership.byTier.partner / reportData.membership.total) * 100}
                            className="h-2 [&>div]:bg-gold"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Covenant Partners ($150/mo)</span>
                            <span className="font-medium">{reportData.membership.byTier.covenant}</span>
                          </div>
                          <Progress
                            value={(reportData.membership.byTier.covenant / reportData.membership.total) * 100}
                            className="h-2 [&>div]:bg-purple-500"
                          />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Monthly Recurring: <span className="font-bold text-navy">
                            ${(reportData.financial.partnerMRR + reportData.financial.covenantMRR).toLocaleString()}
                          </span>
                        </p>
                      </div>
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
                      <div className="space-y-3">
                        {reportData.financial.byFund.slice(0, 5).map((fund, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              ['bg-navy', 'bg-gold', 'bg-purple-500', 'bg-green-500', 'bg-blue-500'][i]
                            }`} />
                            <span className="flex-1 text-sm">{fund.fund}</span>
                            <span className="font-medium">${fund.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Average Donation: <span className="font-bold text-navy">
                            ${reportData.financial.averageDonation.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Engagement & Spiritual */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Top Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {reportData.engagement.byActivityType.slice(0, 5).map((activity, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{activity.type.replace(/_/g, ' ')}</span>
                            <Badge variant="outline">{activity.count}</Badge>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Total Activities: <span className="font-bold text-navy">
                            {reportData.engagement.totalActivities.toLocaleString()}
                          </span>
                        </p>
                      </div>
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

            {/* Other report types would show different views */}
            {reportType !== 'board' && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-navy mb-2">
                    {reportTypes.find(r => r.id === reportType)?.label} Report
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Export this report to view detailed {reportType} data
                  </p>
                  <Button onClick={() => exportReport('csv')} className="bg-navy hover:bg-navy/90">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV Report
                  </Button>
                </CardContent>
              </Card>
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

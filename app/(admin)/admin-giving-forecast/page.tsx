'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Target,
  Sparkles,
  RefreshCcw,
  Loader2,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

interface ForecastData {
  current: {
    mrr: number
    membershipMRR: number
    totalMRR: number
    avgMonthlyTotal: number
    trend: {
      direction: 'up' | 'down' | 'stable'
      amount: number
      percentage: string
    }
  }
  membership: {
    partners: number
    covenantPartners: number
    partnerMRR: number
    covenantMRR: number
  }
  annual: {
    ytdTotal: number
    projectedAnnual: number
    goalProgress: string
  }
  historical: Array<{
    month: string
    total: number
    count: number
    recurring: number
    oneTime: number
  }>
  forecasts: Array<{
    month: string
    projected: number
    confidence: number
    breakdown: {
      recurring: number
      projected_onetime: number
      seasonal_factor: number
    }
  }>
  byFund: Array<{
    fund: string
    total: number
    percentage: string
  }>
  insights: string
  metrics: {
    totalDonors: number
    avgDonation: number
    topDonorCount: number
    recurringDonorCount: number
  }
}

export default function AdminGivingForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [months, setMonths] = useState(6)

  useEffect(() => {
    fetchForecast()
  }, [months])

  const fetchForecast = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/giving-forecast?months=${months}`)
      if (res.ok) {
        const forecast = await res.json()
        setData(forecast)
      }
    } catch (error) {
      console.error('Error fetching forecast:', error)
    }
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const TrendIcon = data?.current.trend.direction === 'up' ? TrendingUp :
    data?.current.trend.direction === 'down' ? TrendingDown : Minus

  const trendColor = data?.current.trend.direction === 'up' ? 'text-green-500' :
    data?.current.trend.direction === 'down' ? 'text-red-500' : 'text-gray-500'

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-navy mx-auto mb-4" />
          <p className="text-gray-500">Analyzing giving data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-gold" />
              Giving Forecast
            </h1>
            <p className="text-gray-600">AI-powered donation predictions and financial insights</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={months}
              onChange={e => setMonths(parseInt(e.target.value))}
              className="border rounded-lg px-3 py-2"
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
            <Button variant="outline" onClick={fetchForecast}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {data && (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-navy to-navy/80 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70">Total MRR</span>
                    <DollarSign className="h-5 w-5 text-gold" />
                  </div>
                  <p className="text-4xl font-bold">{formatCurrency(data.current.totalMRR)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendIcon className={`h-4 w-4 ${data.current.trend.direction === 'up' ? 'text-green-400' : data.current.trend.direction === 'down' ? 'text-red-400' : 'text-white/70'}`} />
                    <span className="text-sm text-white/70">
                      {data.current.trend.direction === 'up' ? '+' : ''}{formatCurrency(data.current.trend.amount)}/mo
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">YTD Total</span>
                    <Calendar className="h-5 w-5 text-navy" />
                  </div>
                  <p className="text-4xl font-bold text-navy">{formatCurrency(data.annual.ytdTotal)}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Projected: {formatCurrency(data.annual.projectedAnnual)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Avg Monthly</span>
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-4xl font-bold text-navy">{formatCurrency(data.current.avgMonthlyTotal)}</p>
                  <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                    <span className="text-sm">{data.current.trend.percentage}% trend</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Goal Progress</span>
                    <Target className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-4xl font-bold text-navy">{data.annual.goalProgress}%</p>
                  <Progress value={parseFloat(data.annual.goalProgress)} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            {data.insights && (
              <Card className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy mb-2">AI Insights</h3>
                      <p className="text-gray-700 whitespace-pre-line">{data.insights}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Forecast Chart & Membership */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Forecast */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {months}-Month Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.forecasts.map((forecast, i) => (
                      <div key={forecast.month} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-gray-500">
                          {new Date(forecast.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{formatCurrency(forecast.projected)}</span>
                            <Badge variant="outline" className={
                              forecast.confidence >= 80 ? 'border-green-500 text-green-600' :
                                forecast.confidence >= 60 ? 'border-amber-500 text-amber-600' :
                                  'border-gray-500 text-gray-600'
                            }>
                              {forecast.confidence}% confidence
                            </Badge>
                          </div>
                          <div className="flex gap-1 h-4">
                            <div
                              className="bg-navy rounded-l"
                              style={{ width: `${(forecast.breakdown.recurring / forecast.projected) * 100}%` }}
                              title={`Recurring: ${formatCurrency(forecast.breakdown.recurring)}`}
                            />
                            <div
                              className="bg-gold rounded-r"
                              style={{ width: `${(forecast.breakdown.projected_onetime / forecast.projected) * 100}%` }}
                              title={`One-time: ${formatCurrency(forecast.breakdown.projected_onetime)}`}
                            />
                          </div>
                          {forecast.breakdown.seasonal_factor !== 1 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Seasonal factor: {forecast.breakdown.seasonal_factor}x
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-navy rounded" />
                      <span className="text-xs text-gray-500">Recurring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gold rounded" />
                      <span className="text-xs text-gray-500">One-time</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Membership Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Membership Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gold/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Partners</span>
                        <Badge className="bg-gold text-navy">{data.membership.partners}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-navy">
                        {formatCurrency(data.membership.partnerMRR)}/mo
                      </p>
                      <p className="text-xs text-gray-500">$50/member</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Covenant Partners</span>
                        <Badge className="bg-purple-500">{data.membership.covenantPartners}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-navy">
                        {formatCurrency(data.membership.covenantMRR)}/mo
                      </p>
                      <p className="text-xs text-gray-500">$150/member</p>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Membership MRR</span>
                        <span className="font-bold text-navy">
                          {formatCurrency(data.current.membershipMRR)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Donor Metrics & Fund Distribution */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Donor Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Donor Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-navy">{data.metrics.totalDonors}</p>
                      <p className="text-sm text-gray-500">Total Donors</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{data.metrics.recurringDonorCount}</p>
                      <p className="text-sm text-gray-500">Recurring Donors</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(data.metrics.avgDonation)}</p>
                      <p className="text-sm text-gray-500">Avg Donation</p>
                    </div>
                    <div className="text-center p-4 bg-gold/10 rounded-lg">
                      <p className="text-3xl font-bold text-gold">{data.metrics.topDonorCount}</p>
                      <p className="text-sm text-gray-500">Top Donors ($500+)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fund Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Giving by Fund
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.byFund.slice(0, 5).map((fund, i) => (
                      <div key={fund.fund}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{fund.fund}</span>
                          <span className="font-medium">{formatCurrency(fund.total)} ({fund.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${['bg-navy', 'bg-gold', 'bg-purple-500', 'bg-green-500', 'bg-blue-500'][i]}`}
                            style={{ width: `${fund.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Data */}
            {data.historical.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Historical Performance (Last 12 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-48">
                    {data.historical.map((month, i) => {
                      const maxTotal = Math.max(...data.historical.map(m => m.total))
                      const height = (month.total / maxTotal) * 100

                      return (
                        <div key={month.month} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex flex-col items-center" style={{ height: `${height}%` }}>
                            <div
                              className="w-full bg-gold rounded-t"
                              style={{ height: `${(month.oneTime / month.total) * 100}%` }}
                              title={`One-time: ${formatCurrency(month.oneTime)}`}
                            />
                            <div
                              className="w-full bg-navy rounded-b"
                              style={{ height: `${(month.recurring / month.total) * 100}%` }}
                              title={`Recurring: ${formatCurrency(month.recurring)}`}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2 -rotate-45 origin-left">
                            {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

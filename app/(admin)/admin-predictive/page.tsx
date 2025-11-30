'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Target,
  Brain,
  RefreshCw,
  ChevronRight,
  Mail,
  Clock,
  Lightbulb,
  DollarSign,
  FileText,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ChurnMember {
  memberId: string
  memberName: string
  email: string
  tier: string
  churnProbability: number
  riskLevel: 'high' | 'medium' | 'low'
  riskFactors: string[]
  daysInactive: number
  engagementScore: number
  optimalContactTime: { dayOfWeek: string; timeOfDay: string }
}

interface ContentGap {
  topic: string
  searchCount: number
  avgResults: number
}

interface Recommendation {
  title: string
  description: string
}

interface PredictiveData {
  churn: {
    atRiskCount: number
    highRisk: number
    mediumRisk: number
    lowRisk: number
    members: ChurnMember[]
  }
  engagement: {
    overview: {
      totalTracked: number
      increasingEngagement: number
      decliningEngagement: number
      stableEngagement: number
      avgCurrentScore: number
      avgProjectedScore: number
      projectedTrend: string
    }
  }
  content: {
    gaps: ContentGap[]
    recommendations: { topic: string; reason: string; suggestedType: string }[]
  }
  revenue: {
    currentMRR: number
    lastMonthTotal: number
    projectedNextMonth: number
    trend: string
    changePercentage: number
  }
  recommendations: Recommendation[]
}

export default function PredictiveAnalyticsPage() {
  const [data, setData] = useState<PredictiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<ChurnMember | null>(null)
  const [memberRecommendation, setMemberRecommendation] = useState<string>('')
  const [loadingRecommendation, setLoadingRecommendation] = useState(false)

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/predictive')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMemberRecommendation = async (memberId: string) => {
    setLoadingRecommendation(true)
    try {
      const response = await fetch('/api/admin/predictive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      })
      const result = await response.json()
      setMemberRecommendation(result.recommendation || 'Unable to generate recommendation')
    } catch (error) {
      setMemberRecommendation('Error generating recommendation')
    } finally {
      setLoadingRecommendation(false)
    }
  }

  const handleMemberClick = (member: ChurnMember) => {
    setSelectedMember(member)
    setMemberRecommendation('')
    fetchMemberRecommendation(member.memberId)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'increasing':
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'down':
      case 'decreasing':
        return <ArrowDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing patterns and generating predictions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Predictive Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered forecasting and recommendations for ministry growth
          </p>
        </div>
        <Button onClick={fetchPredictions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Churn Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{data?.churn?.atRiskCount || 0}</div>
                <p className="text-xs text-gray-500">members at risk</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="destructive">{data?.churn?.highRisk || 0} high</Badge>
              <Badge variant="secondary">{data?.churn?.mediumRisk || 0} medium</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Engagement Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{data?.engagement?.overview?.avgProjectedScore || 0}</span>
                  {getTrendIcon(data?.engagement?.overview?.projectedTrend || 'stable')}
                </div>
                <p className="text-xs text-gray-500">projected 30-day score</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Current: {data?.engagement?.overview?.avgCurrentScore || 0}</span>
                <span>Projected: {data?.engagement?.overview?.avgProjectedScore || 0}</span>
              </div>
              <Progress value={data?.engagement?.overview?.avgProjectedScore || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Content Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{data?.content?.gaps?.length || 0}</div>
                <p className="text-xs text-gray-500">topics needed</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            {data?.content?.gaps?.[0] && (
              <p className="text-xs text-gray-600 mt-3 truncate">
                Top request: "{data.content.gaps[0].topic}"
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    ${(data?.revenue?.projectedNextMonth || 0).toLocaleString()}
                  </span>
                  {getTrendIcon(data?.revenue?.trend || 'stable')}
                </div>
                <p className="text-xs text-gray-500">projected next month</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-600 mt-3">
              {data?.revenue?.changePercentage !== undefined && (
                <span className={data.revenue.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {data.revenue.changePercentage >= 0 ? '+' : ''}{data.revenue.changePercentage}% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Strategic Recommendations
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on current ministry analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.recommendations?.map((rec, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Detailed Views */}
      <Tabs defaultValue="churn" className="space-y-4">
        <TabsList>
          <TabsTrigger value="churn" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Churn Risk
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Members at Risk of Leaving</CardTitle>
              <CardDescription>
                AI-identified members showing signs of disengagement. Click for personalized outreach recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.churn?.members?.map((member) => (
                  <div
                    key={member.memberId}
                    onClick={() => handleMemberClick(member)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(member.riskLevel)}`} />
                      <div>
                        <div className="font-medium">{member.memberName}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-red-600">{member.churnProbability}% risk</div>
                        <div className="text-xs text-gray-500">{member.daysInactive} days inactive</div>
                      </div>
                      <Badge variant={member.tier === 'covenant' ? 'default' : member.tier === 'partner' ? 'secondary' : 'outline'}>
                        {member.tier}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
                {(!data?.churn?.members || data.churn.members.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No members currently at significant churn risk</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Growing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {data?.engagement?.overview?.increasingEngagement || 0}
                </div>
                <p className="text-sm text-gray-600">members with increasing engagement</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Minus className="h-5 w-5 text-gray-600" />
                  Stable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">
                  {data?.engagement?.overview?.stableEngagement || 0}
                </div>
                <p className="text-sm text-gray-600">members with stable engagement</p>
              </CardContent>
            </Card>

            <Card className="bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Declining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {data?.engagement?.overview?.decliningEngagement || 0}
                </div>
                <p className="text-sm text-gray-600">members with declining engagement</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Average</span>
                  <span className="font-semibold">{data?.engagement?.overview?.avgCurrentScore || 0}/100</span>
                </div>
                <Progress value={data?.engagement?.overview?.avgCurrentScore || 0} className="h-3" />

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">30-Day Projection</span>
                  <span className="font-semibold">{data?.engagement?.overview?.avgProjectedScore || 0}/100</span>
                </div>
                <Progress value={data?.engagement?.overview?.avgProjectedScore || 0} className="h-3 bg-purple-100" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Gap Analysis</CardTitle>
              <CardDescription>
                Topics members are searching for but not finding enough content on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.content?.gaps?.map((gap, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{gap.topic}</div>
                      <div className="text-sm text-gray-500">
                        {gap.searchCount} searches, avg {gap.avgResults} results
                      </div>
                    </div>
                    <Badge variant="outline">Create Content</Badge>
                  </div>
                ))}
                {(!data?.content?.gaps || data.content.gaps.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No significant content gaps identified</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.content?.recommendations?.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold capitalize">{rec.topic}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                    <Badge variant="secondary" className="mt-2">{rec.suggestedType}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getRiskColor(selectedMember?.riskLevel || 'low')}`} />
              {selectedMember?.memberName}
            </DialogTitle>
            <DialogDescription>{selectedMember?.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Churn Risk</div>
                <div className="text-xl font-bold text-red-600">{selectedMember?.churnProbability}%</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Days Inactive</div>
                <div className="text-xl font-bold">{selectedMember?.daysInactive}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Risk Factors</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMember?.riskFactors?.map((factor, index) => (
                  <Badge key={index} variant="outline" className="text-red-600">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Best Time to Reach Out</span>
              </div>
              <p className="text-blue-800">
                {selectedMember?.optimalContactTime?.dayOfWeek} at {selectedMember?.optimalContactTime?.timeOfDay}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">AI Recommendation</span>
              </div>
              {loadingRecommendation ? (
                <p className="text-purple-700 animate-pulse">Generating personalized recommendation...</p>
              ) : (
                <p className="text-purple-800">{memberRecommendation}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => window.location.href = `mailto:${selectedMember?.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="flex-1">
                <Target className="h-4 w-4 mr-2" />
                Add to Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

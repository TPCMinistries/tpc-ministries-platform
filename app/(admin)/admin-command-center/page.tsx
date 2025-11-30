'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Brain,
  Sparkles,
  Users,
  DollarSign,
  Heart,
  AlertTriangle,
  Bell,
  TrendingUp,
  TrendingDown,
  Calendar,
  MessageSquare,
  ChevronRight,
  RefreshCw,
  Loader2,
  CheckCircle,
  Gift,
  UserPlus,
  UserX,
  Zap,
  Target,
  BookOpen,
  Mail,
  Phone,
  X,
  Clock,
  ArrowUpRight,
  Cake,
  Activity
} from 'lucide-react'

interface PastoralAlert {
  id: string
  member_id: string
  member_name: string
  alert_type: 'inactive' | 'struggling' | 'celebration' | 'milestone' | 'new_member' | 'churn_risk'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  suggested_action: string
  metadata: Record<string, any>
  created_at: string
}

interface SuggestedAction {
  id: string
  type: 'urgent' | 'opportunity' | 'celebration' | 'strategy' | 'growth'
  title: string
  description: string
  action: string
  actionUrl: string
}

interface AIInsights {
  dailyBriefing: string
  pastoralAlerts: PastoralAlert[]
  atRiskMembers: PastoralAlert[]
  upcomingCelebrations: PastoralAlert[]
  contentGaps: any[]
  engagementTrends: { activeRate: number; newMemberRate: number }
  revenueInsights: { thisMonth: number; lastMonth: number; change: number; trend: string }
  suggestedActions: SuggestedAction[]
  memberStats: { total: number; newThisWeek: number; activeThisMonth: number; byTier: Record<string, number> }
}

export default function AdminCommandCenter() {
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<PastoralAlert | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionNotes, setActionNotes] = useState('')
  const [processingAction, setProcessingAction] = useState(false)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/admin/ai-insights')
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchInsights()
  }

  const handleAlertAction = async (action: string) => {
    if (!selectedAlert) return
    setProcessingAction(true)

    try {
      await fetch('/api/admin/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          alertId: selectedAlert.id,
          memberId: selectedAlert.member_id,
          data: { notes: actionNotes }
        })
      })

      setActionDialogOpen(false)
      setActionNotes('')
      setSelectedAlert(null)
      fetchInsights() // Refresh data
    } catch (error) {
      console.error('Error processing action:', error)
    } finally {
      setProcessingAction(false)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'inactive': return <UserX className="h-5 w-5 text-orange-500" />
      case 'struggling': return <Heart className="h-5 w-5 text-red-500" />
      case 'celebration': return <Cake className="h-5 w-5 text-pink-500" />
      case 'milestone': return <Target className="h-5 w-5 text-green-500" />
      case 'new_member': return <UserPlus className="h-5 w-5 text-blue-500" />
      case 'churn_risk': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-red-200 bg-red-50'
      case 'opportunity': return 'border-blue-200 bg-blue-50'
      case 'celebration': return 'border-pink-200 bg-pink-50'
      case 'strategy': return 'border-purple-200 bg-purple-50'
      case 'growth': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <Zap className="h-5 w-5 text-red-500" />
      case 'opportunity': return <Target className="h-5 w-5 text-blue-500" />
      case 'celebration': return <Gift className="h-5 w-5 text-pink-500" />
      case 'strategy': return <Brain className="h-5 w-5 text-purple-500" />
      case 'growth': return <TrendingUp className="h-5 w-5 text-green-500" />
      default: return <ChevronRight className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-navy mx-auto mb-4" />
          <p className="text-gray-600">Loading AI Command Center...</p>
        </div>
      </div>
    )
  }

  const highPriorityAlerts = insights?.pastoralAlerts.filter(a => a.priority === 'high') || []
  const mediumPriorityAlerts = insights?.pastoralAlerts.filter(a => a.priority === 'medium') || []

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Brain className="h-7 w-7 text-white" />
            </div>
            AI Command Center
          </h1>
          <p className="text-gray-600 mt-1">Intelligent ministry operations hub</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Insights
        </Button>
      </div>

      {/* AI Daily Briefing */}
      <Card className="bg-gradient-to-r from-navy to-navy-800 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Sparkles className="h-8 w-8 text-gold" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold">Today's AI Briefing</h2>
                <Badge className="bg-gold/20 text-gold border-gold/30">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </Badge>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                {insights?.dailyBriefing || 'Welcome to your ministry command center. Check your pastoral alerts for members who need attention today.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-navy">{insights?.memberStats.total || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">+{insights?.memberStats.newThisWeek || 0}</span>
              <span className="text-gray-500">this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Rate</p>
                <p className="text-3xl font-bold text-navy">{insights?.engagementTrends.activeRate || 0}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Active in last 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue This Month</p>
                <p className="text-3xl font-bold text-navy">
                  ${((insights?.revenueInsights.thisMonth || 0) / 1000).toFixed(1)}k
                </p>
              </div>
              <div className="p-3 bg-gold/20 rounded-xl">
                <DollarSign className="h-6 w-6 text-gold" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              {insights?.revenueInsights.trend === 'up' ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-medium">+{insights?.revenueInsights.change}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 font-medium">{insights?.revenueInsights.change}%</span>
                </>
              )}
              <span className="text-gray-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alerts Today</p>
                <p className="text-3xl font-bold text-navy">{insights?.pastoralAlerts.length || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className={`${highPriorityAlerts.length > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50'}`}>
                {highPriorityAlerts.length} high priority
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Actions */}
      {insights?.suggestedActions && insights.suggestedActions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-gold" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {insights.suggestedActions.map((action) => (
                <Link key={action.id} href={action.actionUrl}>
                  <div className={`p-4 rounded-xl border-2 ${getActionTypeColor(action.type)} hover:shadow-md transition-shadow cursor-pointer`}>
                    <div className="flex items-start gap-3">
                      {getActionTypeIcon(action.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy text-sm">{action.title}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{action.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-navy">
                      {action.action}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Pastoral Alerts
            {highPriorityAlerts.length > 0 && (
              <Badge className="bg-red-600 text-white ml-1">{highPriorityAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="at-risk" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            At-Risk Members
          </TabsTrigger>
          <TabsTrigger value="celebrations" className="gap-2">
            <Gift className="h-4 w-4" />
            Celebrations
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Content Insights
          </TabsTrigger>
        </TabsList>

        {/* Pastoral Alerts Tab */}
        <TabsContent value="alerts">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* High Priority */}
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  High Priority ({highPriorityAlerts.length})
                </CardTitle>
                <CardDescription>Needs immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                {highPriorityAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No high priority alerts!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {highPriorityAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                        onClick={() => {
                          setSelectedAlert(alert)
                          setActionDialogOpen(true)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.alert_type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-navy">{alert.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                            <p className="text-xs text-gray-500 mt-2 italic">
                              Suggested: {alert.suggested_action}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medium Priority */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                  <Bell className="h-5 w-5" />
                  Medium Priority ({mediumPriorityAlerts.length})
                </CardTitle>
                <CardDescription>Follow up when possible</CardDescription>
              </CardHeader>
              <CardContent>
                {mediumPriorityAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No medium priority alerts!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {mediumPriorityAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => {
                          setSelectedAlert(alert)
                          setActionDialogOpen(true)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.alert_type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-navy">{alert.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* At-Risk Tab */}
        <TabsContent value="at-risk">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                Members Needing Attention
              </CardTitle>
              <CardDescription>
                Members with declining engagement or extended inactivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights?.atRiskMembers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">Great news! No at-risk members detected.</p>
                  <p className="text-sm">Your congregation is engaged and active.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights?.atRiskMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 border rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedAlert(member)
                        setActionDialogOpen(true)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-navy text-white flex items-center justify-center font-bold">
                            {member.member_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-navy">{member.member_name}</p>
                            <p className="text-sm text-gray-600">{member.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getPriorityColor(member.priority)}>
                            {member.priority}
                          </Badge>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-1">
                              <Mail className="h-4 w-4" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Phone className="h-4 w-4" />
                              Call
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Celebrations Tab */}
        <TabsContent value="celebrations">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Cake className="h-6 w-6 text-pink-500" />
                Upcoming Celebrations
              </CardTitle>
              <CardDescription>
                Birthdays, anniversaries, and milestones to celebrate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights?.upcomingCelebrations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No upcoming celebrations this week</p>
                  <p className="text-sm">Check back later for birthdays and milestones</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {insights?.upcomingCelebrations.map((celebration) => (
                    <div
                      key={celebration.id}
                      className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center font-bold">
                          {celebration.member_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{celebration.member_name}</p>
                          <p className="text-sm text-pink-600">{celebration.title}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{celebration.description}</p>
                      <Button size="sm" className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                        <Gift className="h-4 w-4 mr-2" />
                        Send Birthday Blessing
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Insights Tab */}
        <TabsContent value="content">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Gaps</CardTitle>
                <CardDescription>Topics members are searching for</CardDescription>
              </CardHeader>
              <CardContent>
                {insights?.contentGaps.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No content gaps detected</p>
                ) : (
                  <div className="space-y-3">
                    {insights?.contentGaps.map((gap, index) => (
                      <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-navy">{gap.topic}</p>
                          {gap.search_count > 0 && (
                            <Badge variant="outline">{gap.search_count} searches</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{gap.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Member Tier Breakdown</CardTitle>
                <CardDescription>Membership distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Free Members</span>
                      <span className="text-2xl font-bold">{insights?.memberStats.byTier.free || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${((insights?.memberStats.byTier.free || 0) / (insights?.memberStats.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Partners</span>
                      <span className="text-2xl font-bold text-gold">{insights?.memberStats.byTier.partner || 0}</span>
                    </div>
                    <div className="w-full bg-gold/20 rounded-full h-2">
                      <div
                        className="bg-gold h-2 rounded-full"
                        style={{ width: `${((insights?.memberStats.byTier.partner || 0) / (insights?.memberStats.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Covenant Partners</span>
                      <span className="text-2xl font-bold text-purple-600">{insights?.memberStats.byTier.covenant || 0}</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${((insights?.memberStats.byTier.covenant || 0) / (insights?.memberStats.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && getAlertIcon(selectedAlert.alert_type)}
              {selectedAlert?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedAlert?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-blue-800">Suggested Action:</p>
              <p className="text-sm text-blue-700">{selectedAlert?.suggested_action}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Add any notes about this interaction..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAlertAction('dismiss_alert')}
              disabled={processingAction}
            >
              <X className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
            <Button
              onClick={() => handleAlertAction('mark_contacted')}
              disabled={processingAction}
              className="bg-navy"
            >
              {processingAction ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Mark as Contacted
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  TrendingUp,
  DollarSign,
  Heart,
  ArrowUpRight,
  BookOpen,
  Clock,
  CheckCircle,
  Sparkles,
  MessageSquare,
  Calendar,
  BarChart3,
  FileText,
  Send,
  Plus,
  Loader2,
  Activity,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Tab = 'overview' | 'analytics' | 'reports'

interface DashboardStats {
  totalMembers: number
  membersThisWeek: number
  activeMembers: number
  revenueThisMonth: number
  pendingPrayerRequests: number
  totalTeachings: number
  unreadMessages: number
  upcomingEvents: number
}

interface ActivityItem {
  id: string
  type: 'donation' | 'prayer' | 'member' | 'content'
  title: string
  subtitle?: string
  timestamp: string
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    membersThisWeek: 0,
    activeMembers: 0,
    revenueThisMonth: 0,
    pendingPrayerRequests: 0,
    totalTeachings: 0,
    unreadMessages: 0,
    upcomingEvents: 0,
  })
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Fetch member stats
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count: membersThisWeek } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      // Fetch prayer requests
      const { count: pendingPrayerRequests } = await supabase
        .from('prayer_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Fetch unread messages
      const { count: unreadEmails } = await supabase
        .from('inbox_emails')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      // Fetch upcoming events
      const { count: upcomingEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', new Date().toISOString())

      // Fetch recent activity
      const { data: recentDonations } = await supabase
        .from('donations')
        .select('id, amount, created_at, members(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentPrayers } = await supabase
        .from('prayer_requests')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentMembers } = await supabase
        .from('members')
        .select('id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      // Combine activity
      const activityItems: ActivityItem[] = []

      recentDonations?.forEach(d => {
        const member = d.members as any
        activityItems.push({
          id: `donation-${d.id}`,
          type: 'donation',
          title: `$${d.amount} donation received`,
          subtitle: member ? `from ${member.first_name} ${member.last_name}` : undefined,
          timestamp: d.created_at,
        })
      })

      recentPrayers?.forEach(p => {
        activityItems.push({
          id: `prayer-${p.id}`,
          type: 'prayer',
          title: 'New prayer request',
          subtitle: p.title,
          timestamp: p.created_at,
        })
      })

      recentMembers?.forEach(m => {
        activityItems.push({
          id: `member-${m.id}`,
          type: 'member',
          title: `${m.first_name} ${m.last_name} joined`,
          timestamp: m.created_at,
        })
      })

      // Sort by timestamp
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setStats({
        totalMembers: totalMembers || 0,
        membersThisWeek: membersThisWeek || 0,
        activeMembers: Math.round((totalMembers || 0) * 0.6), // Estimate
        revenueThisMonth: 0, // Would need donations query
        pendingPrayerRequests: pendingPrayerRequests || 0,
        totalTeachings: 0,
        unreadMessages: unreadEmails || 0,
        upcomingEvents: upcomingEvents || 0,
      })

      setActivity(activityItems.slice(0, 10))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <DollarSign className="h-4 w-4 text-gold" />
      case 'prayer':
        return <Heart className="h-4 w-4 text-red-600" />
      case 'member':
        return <Users className="h-4 w-4 text-green-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-navy" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
            <p className="text-gray-600">Ministry overview and quick actions</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reports
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-navy" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-navy" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy">{stats.totalMembers.toLocaleString()}</div>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <ArrowUpRight className="h-3 w-3" />
                        +{stats.membersThisWeek} this week
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600">Unread Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy">{stats.unreadMessages}</div>
                      <Link href="/communications" className="text-xs text-blue-600 hover:underline">
                        View inbox →
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600">Prayer Requests</CardTitle>
                        <Heart className="h-4 w-4 text-red-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy">{stats.pendingPrayerRequests}</div>
                      <Link href="/prayers" className="text-xs text-red-600 hover:underline">
                        Review requests →
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-navy">{stats.upcomingEvents}</div>
                      <Link href="/admin-events" className="text-xs text-purple-600 hover:underline">
                        Manage events →
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Recent Activity */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-navy">Recent Activity</CardTitle>
                          <CardDescription>Latest platform activity</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Activity className="h-3 w-3 mr-1" />
                          Live
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {activity.length > 0 ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {activity.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="mt-0.5">{getActivityIcon(item.type)}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-navy">{item.title}</p>
                                {item.subtitle && (
                                  <p className="text-xs text-gray-600 truncate">{item.subtitle}</p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTimeAgo(item.timestamp)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recent activity</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-navy">Quick Actions</CardTitle>
                      <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Link href="/communications?tab=campaigns">
                        <Button className="w-full justify-start" variant="outline" size="sm">
                          <Send className="mr-2 h-4 w-4" />
                          Send Campaign
                        </Button>
                      </Link>
                      <Link href="/admin-events">
                        <Button className="w-full justify-start" variant="outline" size="sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          Create Event
                        </Button>
                      </Link>
                      <Link href="/admin-content">
                        <Button className="w-full justify-start" variant="outline" size="sm">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Add Content
                        </Button>
                      </Link>
                      <Link href="/members">
                        <Button className="w-full justify-start" variant="outline" size="sm">
                          <Users className="mr-2 h-4 w-4" />
                          View Members
                        </Button>
                      </Link>
                      <Link href="/prayers">
                        <Button className="w-full justify-start" variant="outline" size="sm">
                          <Heart className="mr-2 h-4 w-4" />
                          Review Prayers
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-navy">Analytics Dashboard</CardTitle>
                        <CardDescription>Detailed metrics and trends</CardDescription>
                      </div>
                      <Link href="/analytics">
                        <Button className="bg-navy hover:bg-navy/90">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Open Full Analytics
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-navy" />
                          <span className="font-medium">Member Growth</span>
                        </div>
                        <p className="text-2xl font-bold text-navy">{stats.totalMembers}</p>
                        <p className="text-sm text-green-600">+{stats.membersThisWeek} this week</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Engagement</span>
                        </div>
                        <p className="text-2xl font-bold text-navy">
                          {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-600">Active members</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">Content Views</span>
                        </div>
                        <p className="text-2xl font-bold text-navy">-</p>
                        <p className="text-sm text-gray-600">This month</p>
                      </div>
                    </div>
                    <p className="text-center text-gray-500">
                      View the full analytics dashboard for detailed charts, trends, and insights.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-navy">Reports</CardTitle>
                        <CardDescription>Generate and export reports</CardDescription>
                      </div>
                      <Link href="/admin-reports">
                        <Button className="bg-navy hover:bg-navy/90">
                          <FileText className="h-4 w-4 mr-2" />
                          Open Report Builder
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Link href="/admin-reports?type=membership" className="block">
                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-navy" />
                            <div>
                              <h3 className="font-medium">Membership Report</h3>
                              <p className="text-sm text-gray-600">Growth, tiers, and engagement</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <Link href="/admin-reports?type=financial" className="block">
                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-8 w-8 text-gold" />
                            <div>
                              <h3 className="font-medium">Financial Report</h3>
                              <p className="text-sm text-gray-600">Donations and revenue</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <Link href="/admin-reports?type=engagement" className="block">
                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Activity className="h-8 w-8 text-green-600" />
                            <div>
                              <h3 className="font-medium">Engagement Report</h3>
                              <p className="text-sm text-gray-600">Activity and participation</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <Link href="/admin-reports?type=spiritual" className="block">
                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Heart className="h-8 w-8 text-red-600" />
                            <div>
                              <h3 className="font-medium">Spiritual Report</h3>
                              <p className="text-sm text-gray-600">Prayers and devotionals</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

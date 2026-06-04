'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import { StaggerChildren, StaggerItem } from '@/components/motion/stagger-children'
import {
  Users,
  DollarSign,
  Heart,
  Clock,
  CheckCircle,
  Calendar,
  BarChart3,
  Send,
  Activity,
  Eye,
  RefreshCw,
  AlertTriangle,
  UserPlus,
  Zap,
  Target,
  Video,
  ChevronRight,
  Mail,
  UserCheck,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AdminQuickStats } from '@/components/admin/redesign/admin-quick-stats'
import { SearchTrigger } from '@/components/ui/search-trigger'

interface DashboardStats {
  totalMembers: number
  membersThisWeek: number
  membersLastWeek: number
  activeMembers: number
  revenueThisMonth: number
  revenueLastMonth: number
  pendingPrayerRequests: number
  totalTeachings: number
  teachingViews: number
  unreadMessages: number
  upcomingEvents: number
  newLeads: number
  pendingGroupRequests: number
}

interface ActivityItem {
  id: string
  type: 'donation' | 'prayer' | 'member' | 'content' | 'event'
  title: string
  subtitle?: string
  timestamp: string
  amount?: number
}

interface NeedsAttentionItem {
  id: string
  type: 'prayer' | 'message' | 'lead' | 'group' | 'event'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  href: string
  count?: number
}

interface UpcomingItem {
  id: string
  type: 'event' | 'campaign'
  title: string
  date: string
  attendees?: number
}

interface TopContent {
  id: string
  title: string
  views: number
  type: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    membersThisWeek: 0,
    membersLastWeek: 0,
    activeMembers: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
    pendingPrayerRequests: 0,
    totalTeachings: 0,
    teachingViews: 0,
    unreadMessages: 0,
    upcomingEvents: 0,
    newLeads: 0,
    pendingGroupRequests: 0,
  })
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionItem[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([])
  const [topContent, setTopContent] = useState<TopContent[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // Parallel fetch for better performance
      const [
        membersResult,
        membersThisWeekResult,
        membersLastWeekResult,
        prayersResult,
        unreadEmailsResult,
        unreadSmsResult,
        eventsResult,
        leadsResult,
        groupRequestsResult,
        donationsThisMonthResult,
        donationsLastMonthResult,
        teachingsResult,
        recentDonations,
        recentPrayers,
        recentMembers,
        upcomingEventsData,
        topTeachings,
      ] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('members').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        supabase.from('members').select('*', { count: 'exact', head: true }).gte('created_at', twoWeeksAgo.toISOString()).lt('created_at', weekAgo.toISOString()),
        supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('inbox_emails').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('sms_conversations').select('*', { count: 'exact', head: true }).eq('is_unread', true),
        supabase.from('events').select('*', { count: 'exact', head: true }).gte('start_time', now.toISOString()),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('donations').select('amount').gte('created_at', monthStart.toISOString()),
        supabase.from('donations').select('amount').gte('created_at', lastMonthStart.toISOString()).lt('created_at', lastMonthEnd.toISOString()),
        supabase.from('teachings').select('*', { count: 'exact', head: true }),
        supabase.from('donations').select('id, amount, created_at, members(first_name, last_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('prayer_requests').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('members').select('id, first_name, last_name, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('events').select('id, title, start_time, event_type').gte('start_time', now.toISOString()).order('start_time', { ascending: true }).limit(5),
        supabase.from('teachings').select('id, title, view_count, content_type').order('view_count', { ascending: false }).limit(5),
      ])

      // Calculate revenue
      const revenueThisMonth = donationsThisMonthResult.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      const revenueLastMonth = donationsLastMonthResult.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

      // Calculate active members (members who logged in within last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const { count: activeCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('last_login_at', thirtyDaysAgo.toISOString())

      // Total teaching views
      const totalViews = topTeachings.data?.reduce((sum, t) => sum + (t.view_count || 0), 0) || 0

      setStats({
        totalMembers: membersResult.count || 0,
        membersThisWeek: membersThisWeekResult.count || 0,
        membersLastWeek: membersLastWeekResult.count || 0,
        activeMembers: activeCount || 0,
        revenueThisMonth,
        revenueLastMonth,
        pendingPrayerRequests: prayersResult.count || 0,
        totalTeachings: teachingsResult.count || 0,
        teachingViews: totalViews,
        unreadMessages: (unreadEmailsResult.count || 0) + (unreadSmsResult.count || 0),
        upcomingEvents: eventsResult.count || 0,
        newLeads: leadsResult.count || 0,
        pendingGroupRequests: groupRequestsResult.count || 0,
      })

      // Build activity feed
      const activityItems: ActivityItem[] = []

      recentDonations.data?.forEach(d => {
        const member = Array.isArray(d.members) ? d.members[0] : d.members
        activityItems.push({
          id: `donation-${d.id}`,
          type: 'donation',
          title: `$${d.amount} donation received`,
          subtitle: member ? `from ${member.first_name} ${member.last_name}` : undefined,
          timestamp: d.created_at,
          amount: d.amount,
        })
      })

      recentPrayers.data?.forEach(p => {
        activityItems.push({
          id: `prayer-${p.id}`,
          type: 'prayer',
          title: 'New prayer request',
          subtitle: p.title,
          timestamp: p.created_at,
        })
      })

      recentMembers.data?.forEach(m => {
        activityItems.push({
          id: `member-${m.id}`,
          type: 'member',
          title: `${m.first_name} ${m.last_name} joined`,
          timestamp: m.created_at,
        })
      })

      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivity(activityItems.slice(0, 10))

      // Build needs attention items
      const attentionItems: NeedsAttentionItem[] = []

      if ((prayersResult.count || 0) > 0) {
        attentionItems.push({
          id: 'prayers',
          type: 'prayer',
          title: 'Prayer requests need review',
          description: `${prayersResult.count} pending requests`,
          priority: (prayersResult.count || 0) > 5 ? 'high' : 'medium',
          href: '/prayers',
          count: prayersResult.count || 0,
        })
      }

      if ((unreadEmailsResult.count || 0) + (unreadSmsResult.count || 0) > 0) {
        attentionItems.push({
          id: 'messages',
          type: 'message',
          title: 'Unread messages',
          description: `${(unreadEmailsResult.count || 0) + (unreadSmsResult.count || 0)} messages waiting`,
          priority: 'medium',
          href: '/communications',
          count: (unreadEmailsResult.count || 0) + (unreadSmsResult.count || 0),
        })
      }

      if ((leadsResult.count || 0) > 0) {
        attentionItems.push({
          id: 'leads',
          type: 'lead',
          title: 'New leads to follow up',
          description: `${leadsResult.count} new leads`,
          priority: 'high',
          href: '/members?tab=leads',
          count: leadsResult.count || 0,
        })
      }

      if ((groupRequestsResult.count || 0) > 0) {
        attentionItems.push({
          id: 'groups',
          type: 'group',
          title: 'Group join requests',
          description: `${groupRequestsResult.count} pending approvals`,
          priority: 'low',
          href: '/admin-groups',
          count: groupRequestsResult.count || 0,
        })
      }

      setNeedsAttention(attentionItems)

      // Build upcoming items
      const upcomingItems: UpcomingItem[] = upcomingEventsData.data?.map(e => ({
        id: e.id,
        type: 'event' as const,
        title: e.title,
        date: new Date(e.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      })) || []

      setUpcoming(upcomingItems)

      // Set top content
      setTopContent(topTeachings.data?.map(t => ({
        id: t.id,
        title: t.title,
        views: t.view_count || 0,
        type: t.content_type || 'video',
      })) || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <DollarSign className="h-4 w-4 text-gold-700" />
      case 'prayer':
        return <Heart className="h-4 w-4 text-spiritual" />
      case 'member':
        return <UserPlus className="h-4 w-4 text-success" />
      case 'event':
        return <Calendar className="h-4 w-4 text-spiritual" />
      default:
        return <CheckCircle className="h-4 w-4 text-navy" />
    }
  }

  const getAttentionIcon = (type: string) => {
    switch (type) {
      case 'prayer':
        return <Heart className="h-5 w-5" />
      case 'message':
        return <Mail className="h-5 w-5" />
      case 'lead':
        return <Target className="h-5 w-5" />
      case 'group':
        return <Users className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/5 border-destructive/20 text-destructive dark:bg-destructive/10 dark:border-destructive/30'
      case 'medium':
        return 'bg-warning/5 border-warning/20 text-warning dark:bg-warning/10 dark:border-warning/30'
      default:
        return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
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

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const memberGrowth = calculateGrowth(stats.membersThisWeek, stats.membersLastWeek)
  const revenueGrowth = calculateGrowth(stats.revenueThisMonth, stats.revenueLastMonth)

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <PageLoader message="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy font-display">{greeting}!</h1>
            <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your ministry today.</p>
          </div>
          <div className="flex items-center gap-3">
            <SearchTrigger className="hidden md:flex" />
            <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Needs Attention Banner */}
        {needsAttention.length > 0 && (
          <ScrollReveal variant="fade-up">
            <Card className="border-warning/30 bg-gradient-to-r from-warning/5 to-warning/10 dark:from-warning/5 dark:to-warning/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <CardTitle className="text-lg text-foreground">Needs Your Attention</CardTitle>
                  <Badge className="bg-warning text-warning-foreground ml-auto">{needsAttention.length} items</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {needsAttention.map((item) => (
                    <Link key={item.id} href={item.href}>
                      <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md ${getPriorityColor(item.priority)}`}>
                        {getAttentionIcon(item.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.title}</p>
                          <p className="text-xs opacity-75">{item.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* Stats Cards - Redesigned */}
        <AdminQuickStats
          stats={[
            {
              label: "Total Members",
              value: stats.totalMembers.toLocaleString(),
              change: memberGrowth,
              changeLabel: "vs last week",
              icon: "members"
            },
            {
              label: "Revenue This Month",
              value: `$${stats.revenueThisMonth.toLocaleString()}`,
              change: revenueGrowth,
              changeLabel: "vs last month",
              icon: "revenue"
            },
            {
              label: "Pending Prayers",
              value: stats.pendingPrayerRequests,
              icon: "prayers"
            },
            {
              label: "Content Views",
              value: stats.teachingViews.toLocaleString(),
              changeLabel: `${stats.totalTeachings} teachings`,
              icon: "teachings"
            }
          ]}
        />

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-navy">Recent Activity</CardTitle>
                  <CardDescription>Live updates from your ministry</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-success/5 text-success border-success/20 dark:bg-success/10">
                  <span className="w-1.5 h-1.5 bg-success rounded-full mr-1.5 animate-pulse" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <StaggerChildren className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {activity.map((item) => (
                    <StaggerItem key={item.id}>
                      <div
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="mt-0.5 p-1.5 rounded-full bg-card shadow-sm">
                          {getActivityIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy dark:text-foreground">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Upcoming */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card variant="interactive">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-navy dark:text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gold" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Link href="/email-campaigns">
                  <Button className="w-full h-auto py-3 flex-col gap-1 bg-navy hover:bg-navy/90" size="sm">
                    <Send className="h-4 w-4" />
                    <span className="text-xs">Send Email</span>
                  </Button>
                </Link>
                <Link href="/admin-events">
                  <Button className="w-full h-auto py-3 flex-col gap-1" variant="outline" size="sm">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">New Event</span>
                  </Button>
                </Link>
                <Link href="/admin-content">
                  <Button className="w-full h-auto py-3 flex-col gap-1" variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                    <span className="text-xs">Add Content</span>
                  </Button>
                </Link>
                <Link href="/members">
                  <Button className="w-full h-auto py-3 flex-col gap-1" variant="outline" size="sm">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-xs">View Members</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-navy dark:text-foreground">Upcoming</CardTitle>
                  <Link href="/admin-events">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View all
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {upcoming.length > 0 ? (
                  <div className="space-y-3">
                    {upcoming.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-spiritual/10 dark:bg-spiritual/20 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-spiritual" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy dark:text-foreground truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-navy dark:text-foreground">Top Content</CardTitle>
                  <CardDescription>Most viewed teachings</CardDescription>
                </div>
                <Link href="/admin-content">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Manage
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {topContent.length > 0 ? (
                <StaggerChildren className="space-y-3">
                  {topContent.map((content, index) => (
                    <StaggerItem key={content.id}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? 'bg-gold/20 text-gold-700 dark:bg-gold/30 dark:text-gold-300 ring-2 ring-gold/30'
                            : 'bg-navy/10 dark:bg-navy/20 text-navy dark:text-navy-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy dark:text-foreground truncate">{content.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            {content.views.toLocaleString()} views
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {content.type}
                        </Badge>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No content yet</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Reports */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-navy dark:text-foreground">Quick Reports</CardTitle>
                  <CardDescription>Generate common reports</CardDescription>
                </div>
                <Link href="/admin-reports">
                  <Button variant="ghost" size="sm" className="text-xs">
                    All Reports
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin-reports?type=membership">
                  <div className="p-4 border rounded-lg hover:bg-muted hover:-translate-y-0.5 hover:shadow-md transition-all text-center">
                    <Users className="h-6 w-6 text-navy dark:text-navy-300 mx-auto mb-2" />
                    <p className="text-sm font-medium">Membership</p>
                  </div>
                </Link>
                <Link href="/admin-reports?type=financial">
                  <div className="p-4 border rounded-lg hover:bg-muted hover:-translate-y-0.5 hover:shadow-md transition-all text-center">
                    <DollarSign className="h-6 w-6 text-gold-700 dark:text-gold-300 mx-auto mb-2" />
                    <p className="text-sm font-medium">Financial</p>
                  </div>
                </Link>
                <Link href="/admin-reports?type=engagement">
                  <div className="p-4 border rounded-lg hover:bg-muted hover:-translate-y-0.5 hover:shadow-md transition-all text-center">
                    <Activity className="h-6 w-6 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium">Engagement</p>
                  </div>
                </Link>
                <Link href="/analytics">
                  <div className="p-4 border rounded-lg hover:bg-muted hover:-translate-y-0.5 hover:shadow-md transition-all text-center">
                    <BarChart3 className="h-6 w-6 text-spiritual mx-auto mb-2" />
                    <p className="text-sm font-medium">Analytics</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

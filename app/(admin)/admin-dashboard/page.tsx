import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
} from 'lucide-react'
import { getAdminDashboardStats, getRecentActivity } from '@/lib/db/admin-queries'

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats().catch(() => ({
    totalMembers: 0,
    membersThisWeek: 0,
    activeMembers: 0,
    revenueThisMonth: 0,
    pendingPrayerRequests: 0,
    totalTeachings: 0,
  }))

  const activityFeed = await getRecentActivity(10).catch(() => [])

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy mb-2">Dashboard</h1>
          <p className="text-gray-600">Ministry control center and analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
                <Users className="h-5 w-5 text-navy" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.totalMembers.toLocaleString()}</div>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                +{stats.membersThisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Active Members</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.activeMembers.toLocaleString()}</div>
              <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Revenue This Month</CardTitle>
                <DollarSign className="h-5 w-5 text-gold" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">
                ${stats.revenueThisMonth >= 1000
                  ? (stats.revenueThisMonth / 1000).toFixed(1) + 'k'
                  : stats.revenueThisMonth.toFixed(0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Total donations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Prayer Requests</CardTitle>
                <Heart className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.pendingPrayerRequests}</div>
              <p className="text-sm text-gray-600 mt-1">Active requests</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          {/* Recent Activity Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-navy">Recent Activity</CardTitle>
                  <CardDescription>Latest platform actions</CardDescription>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Real-time feed
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activityFeed.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activityFeed.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-navy">{activity.title}</p>
                        {activity.subtitle && (
                          <p className="text-xs text-gray-600 mt-0.5">{activity.subtitle}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-navy">Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin-content">
                <Button className="w-full justify-start bg-navy hover:bg-navy/90">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Teachings
                </Button>
              </Link>
              <Link href="/admin-prophecy">
                <Button className="w-full justify-start" variant="outline">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Manage Prophecies
                </Button>
              </Link>
              <Link href="/members">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  View Members
                </Button>
              </Link>
              <Link href="/donations">
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Donations
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-navy">Content Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Teachings</span>
                  <span className="text-xl font-bold text-navy">{stats.totalTeachings}</span>
                </div>
                <Link href="/admin-content">
                  <Button size="sm" variant="outline" className="w-full">
                    Manage Content
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-navy">Prayer Ministry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Requests</span>
                  <span className="text-xl font-bold text-red-600">{stats.pendingPrayerRequests}</span>
                </div>
                <Link href="/prayers">
                  <Button size="sm" variant="outline" className="w-full">
                    Review Prayers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-navy">Member Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Rate</span>
                  <span className="text-xl font-bold text-green-600">
                    {stats.totalMembers > 0
                      ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
                      : 0}%
                  </span>
                </div>
                <Link href="/analytics">
                  <Button size="sm" variant="outline" className="w-full">
                    View Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

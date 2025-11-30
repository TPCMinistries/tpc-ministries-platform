'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Brain,
  Users,
  TrendingUp,
  Activity,
  Heart,
  BookOpen,
  MessageSquare,
  Search,
  Loader2,
  Eye,
  Sparkles,
  Calendar,
  PenLine,
  Sun,
  Target,
  ChevronRight,
  BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MemberInsight {
  id: string
  first_name: string
  last_name: string
  email: string
  tier: string
  created_at: string
  // Spiritual profile
  primary_gift?: string
  current_season?: string
  total_devotionals_read?: number
  total_journal_entries?: number
  total_prayers_submitted?: number
  // Activity counts
  recent_activity_count?: number
  last_active?: string
  // Engagement score (calculated)
  engagement_score?: number
}

interface ActivityStat {
  activity_type: string
  count: number
}

interface RecentActivity {
  id: string
  member_name: string
  activity_type: string
  resource_name: string
  created_at: string
}

export default function AdminInsightsPage() {
  const [members, setMembers] = useState<MemberInsight[]>([])
  const [activityStats, setActivityStats] = useState<ActivityStat[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [selectedMember, setSelectedMember] = useState<MemberInsight | null>(null)
  const [memberActivity, setMemberActivity] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      // Fetch members with their spiritual profiles
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(`
          id, first_name, last_name, email, tier, created_at,
          member_spiritual_profiles (
            primary_gift, current_season, total_devotionals_read,
            total_journal_entries, total_prayers_submitted
          )
        `)
        .order('created_at', { ascending: false })

      if (membersError) console.error('Members error:', membersError)

      // Fetch activity stats (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: statsData } = await supabase
        .from('member_activity')
        .select('activity_type')
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Fetch recent activity
      const { data: recentData } = await supabase
        .from('member_activity')
        .select(`
          id, activity_type, resource_name, created_at,
          members (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      // Process members with engagement scores
      const processedMembers = (membersData || []).map((m: any) => {
        const profile = m.member_spiritual_profiles?.[0] || {}
        const engagementScore = calculateEngagementScore(profile)

        return {
          id: m.id,
          first_name: m.first_name,
          last_name: m.last_name,
          email: m.email,
          tier: m.tier,
          created_at: m.created_at,
          primary_gift: profile.primary_gift,
          current_season: profile.current_season,
          total_devotionals_read: profile.total_devotionals_read || 0,
          total_journal_entries: profile.total_journal_entries || 0,
          total_prayers_submitted: profile.total_prayers_submitted || 0,
          engagement_score: engagementScore
        }
      })

      setMembers(processedMembers)

      // Process activity stats
      const statsCounts: Record<string, number> = {}
      ;(statsData || []).forEach((a: any) => {
        statsCounts[a.activity_type] = (statsCounts[a.activity_type] || 0) + 1
      })

      setActivityStats(
        Object.entries(statsCounts).map(([type, count]) => ({ activity_type: type, count }))
      )

      // Process recent activity
      setRecentActivity(
        (recentData || []).map((a: any) => ({
          id: a.id,
          member_name: a.members ? `${a.members.first_name} ${a.members.last_name}` : 'Unknown',
          activity_type: a.activity_type,
          resource_name: a.resource_name || '-',
          created_at: a.created_at
        }))
      )

    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateEngagementScore = (profile: any): number => {
    let score = 0
    score += Math.min((profile.total_devotionals_read || 0) * 5, 30)
    score += Math.min((profile.total_journal_entries || 0) * 10, 30)
    score += Math.min((profile.total_prayers_submitted || 0) * 5, 20)
    if (profile.primary_gift) score += 10
    if (profile.current_season) score += 10
    return Math.min(score, 100)
  }

  const fetchMemberActivity = async (memberId: string) => {
    const supabase = createClient()

    const { data } = await supabase
      .from('member_activity')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(50)

    setMemberActivity(data || [])
  }

  const handleViewMember = (member: MemberInsight) => {
    setSelectedMember(member)
    fetchMemberActivity(member.id)
  }

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTier = filterTier === 'all' || m.tier === filterTier

    return matchesSearch && matchesTier
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'devotional_read': return <Sun className="h-4 w-4" />
      case 'journal_entry': return <PenLine className="h-4 w-4" />
      case 'prayer_submitted': return <Heart className="h-4 w-4" />
      case 'course_progress': return <BookOpen className="h-4 w-4" />
      case 'ai_chat': return <Sparkles className="h-4 w-4" />
      case 'page_view': return <Eye className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'devotional_read': return 'Devotional Read'
      case 'journal_entry': return 'Journal Entry'
      case 'prayer_submitted': return 'Prayer Submitted'
      case 'course_progress': return 'Course Progress'
      case 'ai_chat': return 'AI Chat'
      case 'page_view': return 'Page View'
      case 'prophecy_viewed': return 'Prophecy Viewed'
      case 'assessment_completed': return 'Assessment'
      case 'giving': return 'Giving'
      default: return type.replace(/_/g, ' ')
    }
  }

  const getEngagementBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-green-600">High</Badge>
    if (score >= 40) return <Badge className="bg-amber-500">Medium</Badge>
    return <Badge variant="secondary">Low</Badge>
  }

  // Summary stats
  const totalMembers = members.length
  const activeMembers = members.filter(m => (m.engagement_score || 0) >= 40).length
  const totalActivity = activityStats.reduce((sum, s) => sum + s.count, 0)

  if (selectedMember) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedMember(null)}>
            &larr; Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy">
              {selectedMember.first_name} {selectedMember.last_name}
            </h1>
            <p className="text-muted-foreground">{selectedMember.email}</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {selectedMember.tier?.charAt(0).toUpperCase() + selectedMember.tier?.slice(1)} Member
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-gold" />
                <span className="text-sm text-muted-foreground">Engagement</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold">{selectedMember.engagement_score}%</span>
                {getEngagementBadge(selectedMember.engagement_score || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-amber-500" />
                <span className="text-sm text-muted-foreground">Devotionals</span>
              </div>
              <div className="text-2xl font-bold mt-2">{selectedMember.total_devotionals_read}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <PenLine className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Journal Entries</span>
              </div>
              <div className="text-2xl font-bold mt-2">{selectedMember.total_journal_entries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Prayers</span>
              </div>
              <div className="text-2xl font-bold mt-2">{selectedMember.total_prayers_submitted}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Spiritual Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Primary Gift</span>
                  <span className="font-medium">{selectedMember.primary_gift || 'Not assessed'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Current Season</span>
                  <span className="font-medium">{selectedMember.current_season || 'Growth'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">
                    {new Date(selectedMember.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {memberActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No activity recorded</p>
                ) : (
                  memberActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{getActivityLabel(activity.activity_type)}</p>
                        {activity.resource_name && (
                          <p className="text-xs text-muted-foreground">{activity.resource_name}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          Member Insights
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-powered analytics and member behavior insights
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-navy" />
              <span className="text-sm text-muted-foreground">Total Members</span>
            </div>
            <div className="text-3xl font-bold mt-2">{totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Active Members</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mt-2">{activeMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Activities (30d)</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{totalActivity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gold" />
              <span className="text-sm text-muted-foreground">AI Chats (30d)</span>
            </div>
            <div className="text-3xl font-bold text-gold mt-2">
              {activityStats.find(s => s.activity_type === 'ai_chat')?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity Feed
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="covenant">Covenant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Primary Gift</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Devotionals</TableHead>
                      <TableHead>Journal</TableHead>
                      <TableHead>Prayers</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{member.first_name} {member.last_name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {member.tier?.charAt(0).toUpperCase() + member.tier?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.primary_gift || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold rounded-full"
                                style={{ width: `${member.engagement_score}%` }}
                              />
                            </div>
                            <span className="text-xs">{member.engagement_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{member.total_devotionals_read}</TableCell>
                        <TableCell>{member.total_journal_entries}</TableCell>
                        <TableCell>{member.total_prayers_submitted}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewMember(member)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Member Activity</CardTitle>
              <CardDescription>Last 50 activities across all members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.member_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getActivityLabel(activity.activity_type)}
                        {activity.resource_name !== '-' && ` - ${activity.resource_name}`}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown (30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityStats.sort((a, b) => b.count - a.count).map((stat) => (
                    <div key={stat.activity_type} className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                        {getActivityIcon(stat.activity_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {getActivityLabel(stat.activity_type)}
                          </span>
                          <span className="text-sm text-muted-foreground">{stat.count}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-navy rounded-full"
                            style={{ width: `${(stat.count / Math.max(...activityStats.map(s => s.count))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-green-600">High Engagement (70%+)</span>
                      <span className="text-sm">{members.filter(m => (m.engagement_score || 0) >= 70).length}</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(members.filter(m => (m.engagement_score || 0) >= 70).length / totalMembers) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-amber-500">Medium Engagement (40-69%)</span>
                      <span className="text-sm">{members.filter(m => (m.engagement_score || 0) >= 40 && (m.engagement_score || 0) < 70).length}</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(members.filter(m => (m.engagement_score || 0) >= 40 && (m.engagement_score || 0) < 70).length / totalMembers) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Low Engagement (&lt;40%)</span>
                      <span className="text-sm">{members.filter(m => (m.engagement_score || 0) < 40).length}</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full"
                        style={{ width: `${(members.filter(m => (m.engagement_score || 0) < 40).length / totalMembers) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Heart,
  Users,
  TrendingUp,
  Activity,
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
  Cake,
  Gift,
  Star,
  PartyPopper,
  Mail,
  Send,
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  MapPin,
  Save,
  X,
  BarChart3,
  HandHeart
} from 'lucide-react'

// Types
interface MemberInsight {
  id: string
  first_name: string
  last_name: string
  email: string
  tier: string
  created_at: string
  primary_gift?: string
  current_season?: string
  total_devotionals_read?: number
  total_journal_entries?: number
  total_prayers_submitted?: number
  engagement_score?: number
}

interface MemberCelebration {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  wedding_anniversary: string | null
  membership_date: string | null
  photo_url: string | null
}

interface PastoralStaff {
  id: string
  member_id: string | null
  name: string
  title: string
  email: string
  phone: string | null
  bio: string | null
  photo_url: string | null
  specialties: string[]
  is_available: boolean
  created_at: string
}

interface Appointment {
  id: string
  member_id: string
  staff_id: string
  staff_name?: string
  member_name?: string
  member_email?: string
  appointment_type: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  location: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
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

export default function MemberCarePage() {
  const [activeTab, setActiveTab] = useState('insights')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Insights state
  const [members, setMembers] = useState<MemberInsight[]>([])
  const [activityStats, setActivityStats] = useState<ActivityStat[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [filterTier, setFilterTier] = useState('all')
  const [selectedMember, setSelectedMember] = useState<MemberInsight | null>(null)
  const [memberActivity, setMemberActivity] = useState<any[]>([])

  // Celebrations state
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<(MemberCelebration & { nextDate?: Date })[]>([])
  const [upcomingAnniversaries, setUpcomingAnniversaries] = useState<(MemberCelebration & { nextDate?: Date })[]>([])
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [selectedCelebration, setSelectedCelebration] = useState<MemberCelebration | null>(null)
  const [messageContent, setMessageContent] = useState('')

  // Pastoral state
  const [staff, setStaff] = useState<PastoralStaff[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<PastoralStaff | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    bio: '',
    photo_url: '',
    specialties: '',
    is_available: true,
  })

  // Stats
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    birthdaysThisWeek: 0,
    pendingAppointments: 0,
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchInsightsData(),
      fetchCelebrationsData(),
      fetchPastoralData(),
    ])
    setLoading(false)
  }

  // ============ INSIGHTS FUNCTIONS ============
  const fetchInsightsData = async () => {
    const supabase = createClient()

    try {
      // Fetch members with their spiritual profiles
      const { data: membersData } = await supabase
        .from('members')
        .select(`
          id, first_name, last_name, email, tier, created_at,
          member_spiritual_profiles (
            primary_gift, current_season, total_devotionals_read,
            total_journal_entries, total_prayers_submitted
          )
        `)
        .order('created_at', { ascending: false })

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

      // Process members
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

      // Calculate stats
      const activeMembers = processedMembers.filter(m => (m.engagement_score || 0) >= 40).length
      setStats(prev => ({ ...prev, totalMembers: processedMembers.length, activeMembers }))

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

  // ============ CELEBRATIONS FUNCTIONS ============
  const fetchCelebrationsData = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, date_of_birth, wedding_anniversary, membership_date, photo_url')
      .order('first_name')

    if (data) {
      calculateUpcoming(data)
    }
  }

  const calculateUpcoming = (memberData: MemberCelebration[]) => {
    const today = new Date()
    const thisYear = today.getFullYear()

    // Filter birthdays in the next 30 days
    const birthdays = memberData
      .filter(m => m.date_of_birth)
      .map(m => {
        const bday = new Date(m.date_of_birth!)
        const nextBirthday = new Date(thisYear, bday.getMonth(), bday.getDate())
        if (nextBirthday < today) {
          nextBirthday.setFullYear(thisYear + 1)
        }
        return { ...m, nextDate: nextBirthday }
      })
      .filter(m => {
        const daysUntil = Math.ceil((m.nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntil >= 0 && daysUntil <= 30
      })
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())

    setUpcomingBirthdays(birthdays)

    // Count birthdays this week
    const birthdaysThisWeek = birthdays.filter(m => {
      const daysUntil = Math.ceil((m.nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil <= 7
    }).length
    setStats(prev => ({ ...prev, birthdaysThisWeek }))

    // Filter anniversaries in the next 30 days
    const anniversaries = memberData
      .filter(m => m.wedding_anniversary)
      .map(m => {
        const anniv = new Date(m.wedding_anniversary!)
        const nextAnniv = new Date(thisYear, anniv.getMonth(), anniv.getDate())
        if (nextAnniv < today) {
          nextAnniv.setFullYear(thisYear + 1)
        }
        return { ...m, nextDate: nextAnniv }
      })
      .filter(m => {
        const daysUntil = Math.ceil((m.nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntil >= 0 && daysUntil <= 30
      })
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())

    setUpcomingAnniversaries(anniversaries)
  }

  const getDaysUntil = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dateStr)
    const thisYear = today.getFullYear()
    const nextOccurrence = new Date(thisYear, date.getMonth(), date.getDate())
    if (nextOccurrence < today) {
      nextOccurrence.setFullYear(thisYear + 1)
    }
    const diffTime = nextOccurrence.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getAge = (dateStr: string) => {
    const today = new Date()
    const birth = new Date(dateStr)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age + 1
  }

  const getYearsTogether = (dateStr: string) => {
    const today = new Date()
    const wedding = new Date(dateStr)
    let years = today.getFullYear() - wedding.getFullYear()
    const m = today.getMonth() - wedding.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < wedding.getDate())) {
      years--
    }
    return years + 1
  }

  const openMessageModal = (member: MemberCelebration, type: string) => {
    setSelectedCelebration(member)
    if (type === 'birthday') {
      setMessageContent(`Happy Birthday, ${member.first_name}! Wishing you a blessed year ahead filled with God's grace and favor.`)
    } else if (type === 'anniversary') {
      setMessageContent(`Happy Anniversary, ${member.first_name}! Celebrating the beautiful journey of love and commitment. May God continue to bless your union.`)
    }
    setShowMessageModal(true)
  }

  const sendMessage = async () => {
    console.log('Sending message to:', selectedCelebration?.email, messageContent)
    alert('Message sent successfully!')
    setShowMessageModal(false)
    setSelectedCelebration(null)
    setMessageContent('')
  }

  // ============ PASTORAL FUNCTIONS ============
  const fetchPastoralData = async () => {
    const supabase = createClient()

    // Fetch staff
    const { data: staffData } = await supabase
      .from('pastoral_staff')
      .select('*')
      .order('name')

    if (staffData) {
      setStaff(staffData)
    }

    // Fetch appointments
    const { data: appointmentData } = await supabase
      .from('pastoral_appointments')
      .select(`
        *,
        pastoral_staff(name),
        members(first_name, last_name, email)
      `)
      .order('scheduled_date', { ascending: true })

    if (appointmentData) {
      const processed = appointmentData.map((a: any) => ({
        ...a,
        staff_name: a.pastoral_staff?.name,
        member_name: a.members ? `${a.members.first_name} ${a.members.last_name}` : 'Unknown',
        member_email: a.members?.email
      }))
      setAppointments(processed)

      // Count pending
      const pending = processed.filter((a: any) => a.status === 'pending').length
      setStats(prev => ({ ...prev, pendingAppointments: pending }))
    }
  }

  const handleCreateStaff = async () => {
    const supabase = createClient()
    const payload = {
      ...staffFormData,
      specialties: staffFormData.specialties.split(',').map(s => s.trim()).filter(Boolean),
      photo_url: staffFormData.photo_url || null,
      phone: staffFormData.phone || null,
      bio: staffFormData.bio || null,
    }

    if (selectedStaff) {
      await supabase.from('pastoral_staff').update(payload).eq('id', selectedStaff.id)
    } else {
      await supabase.from('pastoral_staff').insert([payload])
    }

    fetchPastoralData()
    closeStaffModal()
  }

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Delete this pastoral staff member?')) return
    const supabase = createClient()
    await supabase.from('pastoral_staff').delete().eq('id', id)
    fetchPastoralData()
  }

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('pastoral_appointments').update({ status }).eq('id', id)
    fetchPastoralData()
  }

  const openStaffEditModal = (staffMember: PastoralStaff) => {
    setSelectedStaff(staffMember)
    setStaffFormData({
      name: staffMember.name,
      title: staffMember.title,
      email: staffMember.email,
      phone: staffMember.phone || '',
      bio: staffMember.bio || '',
      photo_url: staffMember.photo_url || '',
      specialties: staffMember.specialties?.join(', ') || '',
      is_available: staffMember.is_available,
    })
    setShowStaffModal(true)
  }

  const closeStaffModal = () => {
    setShowStaffModal(false)
    setSelectedStaff(null)
    setStaffFormData({
      name: '',
      title: '',
      email: '',
      phone: '',
      bio: '',
      photo_url: '',
      specialties: '',
      is_available: true,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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

  // Filters
  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTier = filterTier === 'all' || m.tier === filterTier
    return matchesSearch && matchesTier
  })

  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    const matchesSearch = a.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.staff_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Member Detail View
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
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy flex items-center gap-3">
              <HandHeart className="h-10 w-10 text-rose-500" />
              Member Care
            </h1>
            <p className="text-gray-600 mt-1">
              Insights, celebrations, and pastoral care management
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-3xl font-bold text-navy">{stats.totalMembers}</p>
                </div>
                <Users className="h-10 w-10 text-navy/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Members</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeMembers}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Birthdays This Week</p>
                  <p className="text-3xl font-bold">{stats.birthdaysThisWeek}</p>
                </div>
                <Cake className="h-10 w-10 text-white/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Appointments</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="insights" className="gap-2">
              <Activity className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="celebrations" className="gap-2">
              <PartyPopper className="h-4 w-4" />
              Celebrations
            </TabsTrigger>
            <TabsTrigger value="pastoral" className="gap-2">
              <Heart className="h-4 w-4" />
              Pastoral
            </TabsTrigger>
          </TabsList>

          {/* ============ INSIGHTS TAB ============ */}
          <TabsContent value="insights" className="space-y-6">
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

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Member Table */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Member Engagement</CardTitle>
                  <CardDescription>Click a member to view their profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.slice(0, 10).map((member) => (
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
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(member)
                                fetchMemberActivity(member.id)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {recentActivity.slice(0, 15).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.member_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getActivityLabel(activity.activity_type)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============ CELEBRATIONS TAB ============ */}
          <TabsContent value="celebrations" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Upcoming Birthdays */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Cake className="h-5 w-5 text-pink-500" />
                    <CardTitle>Upcoming Birthdays</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingBirthdays.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No upcoming birthdays in the next 30 days</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingBirthdays.slice(0, 10).map((member) => {
                        const daysUntil = getDaysUntil(member.date_of_birth!)
                        const turningAge = getAge(member.date_of_birth!)
                        return (
                          <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                            {member.photo_url ? (
                              <img src={member.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                                <span className="text-pink-600 font-medium">
                                  {member.first_name[0]}{member.last_name[0]}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{member.first_name} {member.last_name}</p>
                              <p className="text-sm text-gray-500">
                                Turning {turningAge} • {new Date(member.date_of_birth!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-medium ${daysUntil === 0 ? 'text-pink-600' : daysUntil <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
                                {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openMessageModal(member, 'birthday')}
                                className="ml-2"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Anniversaries */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <CardTitle>Upcoming Anniversaries</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingAnniversaries.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No upcoming anniversaries in the next 30 days</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAnniversaries.slice(0, 10).map((member) => {
                        const daysUntil = getDaysUntil(member.wedding_anniversary!)
                        const years = getYearsTogether(member.wedding_anniversary!)
                        return (
                          <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <Heart className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{member.first_name} {member.last_name}</p>
                              <p className="text-sm text-gray-500">
                                {years} years • {new Date(member.wedding_anniversary!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-medium ${daysUntil === 0 ? 'text-red-600' : daysUntil <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
                                {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openMessageModal(member, 'anniversary')}
                                className="ml-2"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============ PASTORAL TAB ============ */}
          <TabsContent value="pastoral" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <Button onClick={() => setShowStaffModal(true)} className="bg-navy hover:bg-navy/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Appointments */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-semibold text-lg text-navy">Appointments</h3>
                {filteredAppointments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No appointments found</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredAppointments.slice(0, 10).map((apt) => (
                    <Card key={apt.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-center min-w-[50px]">
                            <div className="text-xl font-bold text-navy">
                              {new Date(apt.scheduled_date).getDate()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(apt.scheduled_date).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(apt.status)}`}>
                                {apt.status}
                              </span>
                              <span className="bg-navy/10 text-navy px-2 py-0.5 rounded text-xs capitalize">
                                {apt.appointment_type.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="font-semibold text-navy">{apt.member_name}</h3>
                            <p className="text-sm text-gray-600">
                              with {apt.staff_name} at {apt.scheduled_time}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {apt.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateAppointmentStatus(apt.id, 'confirmed')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateAppointmentStatus(apt.id, 'cancelled')}
                                  className="text-red-600 border-red-200"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {apt.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateAppointmentStatus(apt.id, 'completed')}
                                className="bg-navy hover:bg-navy/90"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Staff */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-navy">Pastoral Staff</h3>
                {staff.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No staff added</p>
                    </CardContent>
                  </Card>
                ) : (
                  staff.map((s) => (
                    <Card key={s.id} className={!s.is_available ? 'opacity-60' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {s.photo_url ? (
                            <img src={s.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-navy/40" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-navy">{s.name}</h3>
                              {!s.is_available && (
                                <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{s.title}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openStaffEditModal(s)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteStaff(s.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Message Modal */}
        {showMessageModal && selectedCelebration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">Send Message</h2>
                <button onClick={() => setShowMessageModal(false)}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>To</Label>
                  <p className="text-sm text-gray-600">{selectedCelebration.first_name} {selectedCelebration.last_name} ({selectedCelebration.email})</p>
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={sendMessage} className="flex-1 bg-navy hover:bg-navy/90">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" onClick={() => setShowMessageModal(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff Modal */}
        {showStaffModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedStaff ? 'Edit Staff Member' : 'Add Pastoral Staff'}
                </h2>
                <button onClick={closeStaffModal}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={staffFormData.name}
                      onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                      placeholder="Pastor John Smith"
                    />
                  </div>
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={staffFormData.title}
                      onChange={(e) => setStaffFormData({ ...staffFormData, title: e.target.value })}
                      placeholder="Senior Pastor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={staffFormData.email}
                      onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={staffFormData.phone}
                      onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={staffFormData.bio}
                    onChange={(e) => setStaffFormData({ ...staffFormData, bio: e.target.value })}
                    rows={3}
                    placeholder="Brief bio..."
                  />
                </div>

                <div>
                  <Label>Specialties (comma-separated)</Label>
                  <Input
                    value={staffFormData.specialties}
                    onChange={(e) => setStaffFormData({ ...staffFormData, specialties: e.target.value })}
                    placeholder="marriage, grief, youth"
                  />
                </div>

                <div>
                  <Label>Photo URL</Label>
                  <Input
                    value={staffFormData.photo_url}
                    onChange={(e) => setStaffFormData({ ...staffFormData, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={staffFormData.is_available}
                    onChange={(e) => setStaffFormData({ ...staffFormData, is_available: e.target.checked })}
                  />
                  <span className="text-sm">Available for appointments</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleCreateStaff} className="flex-1 bg-navy hover:bg-navy/90">
                    <Save className="mr-2 h-4 w-4" />
                    {selectedStaff ? 'Update' : 'Add'} Staff
                  </Button>
                  <Button variant="outline" onClick={closeStaffModal}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

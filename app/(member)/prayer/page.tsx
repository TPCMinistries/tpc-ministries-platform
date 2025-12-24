'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Heart,
  Plus,
  Check,
  Clock,
  Users,
  Lock,
  Globe,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Loader2,
  HandHeart,
  Send,
  CheckCircle,
  Star,
  Utensils,
  Flame,
  Target,
  Calendar
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PrayerRequest {
  id: string
  title: string
  description: string
  category: string
  privacy: 'private' | 'members' | 'public'
  is_answered: boolean
  answered_at?: string
  created_at: string
  prayer_count: number
}

interface FastingLog {
  id: string
  fast_date: string
  fast_type: string
  completed: boolean
  prayer_focus?: string
  reflections?: string
  breakthroughs?: string
}

const FAST_TYPES = [
  { value: 'full', label: 'Full Fast', description: 'No food, water only', icon: Target },
  { value: 'partial', label: 'Partial Fast', description: 'Specific foods or meals', icon: Utensils },
  { value: 'daniel', label: 'Daniel Fast', description: 'Fruits, vegetables, water', icon: Heart },
  { value: 'social_media', label: 'Social Media Fast', description: 'No social media', icon: Users },
  { value: 'custom', label: 'Custom Fast', description: 'Your own commitment', icon: Sparkles }
]

const CATEGORIES = [
  { value: 'all', label: 'All Categories', gradient: 'from-gray-400 to-slate-500' },
  { value: 'healing', label: 'Healing', gradient: 'from-red-400 to-rose-500', emoji: '🩹' },
  { value: 'guidance', label: 'Guidance', gradient: 'from-blue-400 to-indigo-500', emoji: '🧭' },
  { value: 'provision', label: 'Provision', gradient: 'from-green-400 to-emerald-500', emoji: '🌱' },
  { value: 'relationship', label: 'Relationships', gradient: 'from-pink-400 to-rose-500', emoji: '💕' },
  { value: 'salvation', label: 'Salvation', gradient: 'from-purple-400 to-violet-500', emoji: '✝️' },
  { value: 'thanksgiving', label: 'Thanksgiving', gradient: 'from-amber-400 to-orange-500', emoji: '🙏' },
  { value: 'general', label: 'General', gradient: 'from-slate-400 to-gray-500', emoji: '💬' },
]

export default function PrayerWallPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<PrayerRequest[]>([])
  const [communityRequests, setCommunityRequests] = useState<PrayerRequest[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'my-requests' | 'community' | 'fasting'>('community')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [prayersGiven, setPrayersGiven] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    privacy: 'members'
  })
  const [submitting, setSubmitting] = useState(false)

  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set())
  const [prayingFor, setPrayingFor] = useState<string | null>(null)
  const [justPrayed, setJustPrayed] = useState<string | null>(null)
  const [myRequestsFilter, setMyRequestsFilter] = useState<'all' | 'active' | 'answered'>('all')

  // Fasting state
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([])
  const [memberId, setMemberId] = useState<string | null>(null)
  const [showFastForm, setShowFastForm] = useState(false)
  const [fastForm, setFastForm] = useState({
    fast_type: 'partial',
    prayer_focus: '',
    reflections: '',
    breakthroughs: ''
  })
  const [fastSubmitting, setFastSubmitting] = useState(false)

  useEffect(() => {
    fetchPrayerRequests()
    fetchPrayersGiven()
    fetchFastingLogs()
  }, [])

  const fetchPrayerRequests = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      // Fetch member's own prayer requests
      const { data: myRequests } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })

      // Fetch community prayer requests
      const { data: community } = await supabase
        .from('prayer_requests')
        .select('*')
        .neq('member_id', member.id)
        .in('privacy', ['members', 'public'])
        .order('created_at', { ascending: false })
        .limit(50)

      // Fetch which ones user has prayed for
      const { data: interactions } = await supabase
        .from('prayer_interactions')
        .select('prayer_request_id')
        .eq('member_id', member.id)

      setRequests(myRequests || [])
      setCommunityRequests(community || [])

      if (interactions) {
        setPrayedFor(new Set(interactions.map(i => i.prayer_request_id)))
      }
    } catch (error) {
      console.error('Error fetching prayer requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrayersGiven = async () => {
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      const { count } = await supabase
        .from('prayer_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', member.id)

      setPrayersGiven(count || 0)
    } catch (error) {
      console.error('Error fetching prayers given:', error)
    }
  }

  const fetchFastingLogs = async () => {
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return
      setMemberId(member.id)

      const { data: logs } = await supabase
        .from('fasting_logs')
        .select('*')
        .eq('member_id', member.id)
        .order('fast_date', { ascending: false })
        .limit(30)

      if (logs) {
        setFastingLogs(logs)
      }
    } catch (error) {
      console.error('Error fetching fasting logs:', error)
    }
  }

  const logFast = async () => {
    if (!memberId) return
    setFastSubmitting(true)
    const supabase = createClient()

    try {
      await supabase.from('fasting_logs').insert({
        member_id: memberId,
        fast_date: new Date().toISOString().split('T')[0],
        fast_type: fastForm.fast_type,
        prayer_focus: fastForm.prayer_focus,
        reflections: fastForm.reflections,
        breakthroughs: fastForm.breakthroughs,
        completed: true
      })

      setShowFastForm(false)
      setFastForm({ fast_type: 'partial', prayer_focus: '', reflections: '', breakthroughs: '' })
      fetchFastingLogs()
    } catch (error) {
      console.error('Error logging fast:', error)
    } finally {
      setFastSubmitting(false)
    }
  }

  const todayFastLogged = fastingLogs.some(
    log => log.fast_date === new Date().toISOString().split('T')[0]
  )

  const fastingStreak = () => {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < fastingLogs.length; i++) {
      const logDate = new Date(fastingLogs[i].fast_date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      if (logDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const getFastTypeInfo = (type: string) => {
    return FAST_TYPES.find(t => t.value === type) || FAST_TYPES[4]
  }

  const handleSubmit = async () => {
    const supabase = createClient()
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      await supabase.from('prayer_requests').insert({
        member_id: member.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        privacy: formData.privacy,
        is_answered: false,
        prayer_count: 0
      })

      setFormData({
        title: '',
        description: '',
        category: 'general',
        privacy: 'members'
      })
      setIsDialogOpen(false)
      fetchPrayerRequests()
    } catch (error) {
      console.error('Error submitting prayer request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePray = async (requestId: string) => {
    if (prayedFor.has(requestId) || prayingFor === requestId) return

    setPrayingFor(requestId)
    try {
      const response = await fetch('/api/prayer/pray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prayer_request_id: requestId })
      })

      if (response.ok) {
        setPrayedFor(prev => new Set([...Array.from(prev), requestId]))
        setPrayersGiven(prev => prev + 1)
        setJustPrayed(requestId)
        setTimeout(() => setJustPrayed(null), 2000)

        setCommunityRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? { ...req, prayer_count: (req.prayer_count || 0) + 1 }
              : req
          )
        )
      }
    } catch (error) {
      console.error('Error recording prayer:', error)
    } finally {
      setPrayingFor(null)
    }
  }

  const handleMarkAnswered = async (requestId: string) => {
    const supabase = createClient()

    try {
      await supabase
        .from('prayer_requests')
        .update({
          is_answered: true,
          answered_at: new Date().toISOString()
        })
        .eq('id', requestId)

      fetchPrayerRequests()
    } catch (error) {
      console.error('Error marking request as answered:', error)
    }
  }

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this prayer request?')) return

    const supabase = createClient()
    try {
      await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', requestId)

      fetchPrayerRequests()
    } catch (error) {
      console.error('Error deleting prayer request:', error)
    }
  }

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1]
  }

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public': return <Globe className="h-3 w-3" />
      case 'members': return <Users className="h-3 w-3" />
      default: return <Lock className="h-3 w-3" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredCommunityRequests = communityRequests.filter(req => {
    const matchesCategory = categoryFilter === 'all' || req.category === categoryFilter
    const matchesSearch = !searchQuery ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredMyRequests = requests.filter(req => {
    if (myRequestsFilter === 'all') return true
    if (myRequestsFilter === 'active') return !req.is_answered
    if (myRequestsFilter === 'answered') return req.is_answered
    return true
  })

  const stats = {
    total: requests.length,
    answered: requests.filter(r => r.is_answered).length,
    prayersReceived: requests.reduce((sum, r) => sum + (r.prayer_count || 0), 0),
    prayersGiven
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading prayer wall...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <HandHeart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-blue-200">United in Prayer</p>
                    <h1 className="text-3xl font-bold">Prayer Wall</h1>
                  </div>
                </div>
                <p className="text-blue-200 mt-2 max-w-md">
                  Lift up your needs and join others in prayer. Together, we believe for breakthrough.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg gap-2">
                      <Plus className="h-5 w-5" />
                      Share Prayer Request
                    </Button>
                  </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Share Your Prayer Need</DialogTitle>
                    <DialogDescription>
                      Share with the community or submit privately to our ministry team for personal prayer
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="title">Prayer Request</Label>
                      <Input
                        id="title"
                        placeholder="What would you like prayer for?"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Details (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Share more details if you'd like..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.emoji} {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Who can see this?</Label>
                        <Select
                          value={formData.privacy}
                          onValueChange={(value) => setFormData({ ...formData, privacy: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ministry">⛪ Ministry Team Only</SelectItem>
                            <SelectItem value="private">🔒 Just Me</SelectItem>
                            <SelectItem value="members">👥 Members Only</SelectItem>
                            <SelectItem value="public">🌍 Everyone</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.privacy === 'ministry' && 'Our ministry team will pray for you personally'}
                          {formData.privacy === 'private' && 'Only you can see this prayer request'}
                          {formData.privacy === 'members' && 'Visible to all TPC members on the prayer wall'}
                          {formData.privacy === 'public' && 'Visible to everyone, including visitors'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!formData.title || submitting}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Prayer
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
                <p className="text-xs text-blue-200 text-center">
                  Share with the community or privately with our ministry team
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                  <HandHeart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">My Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Answered</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.answered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Prayers Received</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.prayersReceived}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Prayers Given</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.prayersGiven}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'community'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            Community ({communityRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'my-requests'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <HandHeart className="h-4 w-4" />
            My Prayers ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('fasting')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'fasting'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Utensils className="h-4 w-4" />
            Fasting
          </button>
        </div>

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search prayers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.emoji || '📋'} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prayer Requests Grid */}
            {filteredCommunityRequests.length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto mb-6 flex items-center justify-center">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {searchQuery || categoryFilter !== 'all' ? 'No Matching Prayers' : 'No Prayer Requests Yet'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    {searchQuery || categoryFilter !== 'all'
                      ? 'Try adjusting your filters.'
                      : 'Be the first to share a prayer request with the community.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredCommunityRequests.map((request) => {
                  const catInfo = getCategoryInfo(request.category)
                  const hasPrayed = prayedFor.has(request.id)
                  const isPraying = prayingFor === request.id
                  const wasJustPrayed = justPrayed === request.id

                  return (
                    <Card
                      key={request.id}
                      className={`bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm hover:shadow-lg transition-all ${
                        wasJustPrayed ? 'ring-2 ring-green-400 ring-offset-2' : ''
                      } ${request.is_answered ? 'bg-green-50/50 dark:bg-green-950/20' : ''}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${catInfo.gradient} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-lg">{catInfo.emoji || '🙏'}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge className={`bg-gradient-to-r ${catInfo.gradient} text-white border-0 text-xs`}>
                                {catInfo.label}
                              </Badge>
                              {request.is_answered && (
                                <Badge className="bg-gradient-to-r from-emerald-400 to-green-500 text-white border-0 text-xs gap-1">
                                  <Check className="h-3 w-3" />
                                  Answered
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(request.created_at)}
                              </span>
                            </div>

                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {request.title}
                            </h3>

                            {request.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                                {request.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <Heart className={`h-4 w-4 ${hasPrayed ? 'fill-rose-500 text-rose-500' : ''}`} />
                                <span>{request.prayer_count || 0} prayers</span>
                              </div>

                              <Button
                                size="sm"
                                onClick={() => handlePray(request.id)}
                                disabled={hasPrayed || isPraying}
                                className={`gap-2 transition-all ${
                                  hasPrayed
                                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white hover:from-emerald-500 hover:to-green-600'
                                    : 'bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white'
                                } ${wasJustPrayed ? 'scale-105' : ''}`}
                              >
                                {isPraying ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Praying...
                                  </>
                                ) : hasPrayed ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Prayed
                                  </>
                                ) : (
                                  <>
                                    <Heart className="h-4 w-4" />
                                    I Prayed
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="space-y-4">
            {/* Filter Buttons */}
            {requests.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setMyRequestsFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    myRequestsFilter === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                      : 'bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  All ({requests.length})
                </button>
                <button
                  onClick={() => setMyRequestsFilter('active')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    myRequestsFilter === 'active'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                      : 'bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Active ({requests.filter(r => !r.is_answered).length})
                </button>
                <button
                  onClick={() => setMyRequestsFilter('answered')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    myRequestsFilter === 'answered'
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md'
                      : 'bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  Answered ({requests.filter(r => r.is_answered).length})
                </button>
              </div>
            )}

            {requests.length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto mb-6 flex items-center justify-center">
                    <HandHeart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Prayer Requests Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    Share your prayer needs and let the community stand with you in faith.
                  </p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Share Your First Prayer
                  </Button>
                </CardContent>
              </Card>
            ) : filteredMyRequests.length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center">
                    {myRequestsFilter === 'answered' ? (
                      <CheckCircle className="h-8 w-8 text-gray-400" />
                    ) : (
                      <Clock className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    No {myRequestsFilter === 'answered' ? 'Answered' : 'Active'} Prayers
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {myRequestsFilter === 'answered'
                      ? "When God answers your prayers, mark them as answered to celebrate!"
                      : "All your prayers have been answered! Praise God!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredMyRequests.map((request) => {
                const catInfo = getCategoryInfo(request.category)

                return (
                  <Card
                    key={request.id}
                    className={`bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm hover:shadow-lg transition-all ${
                      request.is_answered ? 'bg-green-50/50 dark:bg-green-950/20' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${catInfo.gradient} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-xl">{catInfo.emoji || '🙏'}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge className={`bg-gradient-to-r ${catInfo.gradient} text-white border-0`}>
                                  {catInfo.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs gap-1">
                                  {getPrivacyIcon(request.privacy)}
                                  {request.privacy}
                                </Badge>
                                {request.is_answered && (
                                  <Badge className="bg-gradient-to-r from-emerald-400 to-green-500 text-white border-0 gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Answered
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {request.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(request.created_at)}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(request.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {request.description && (
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              {request.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <Heart className="h-4 w-4 text-rose-500" />
                                <span>{request.prayer_count || 0} people praying</span>
                              </div>
                            </div>

                            {!request.is_answered && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAnswered(request.id)}
                                className="gap-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Mark Answered
                              </Button>
                            )}

                            {request.is_answered && request.answered_at && (
                              <p className="text-sm text-green-600 dark:text-green-400">
                                Answered on {new Date(request.answered_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* Fasting Tab */}
        {activeTab === 'fasting' && (
          <div className="space-y-6">
            {/* Fasting Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <Flame className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{fastingStreak()}</p>
                  <p className="text-xs opacity-80">Day Streak</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-navy" />
                  <p className="text-2xl font-bold text-navy">{fastingLogs.length}</p>
                  <p className="text-xs text-gray-500">Total Fasts</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0">
                <CardContent className="p-4 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold text-navy">{fastingLogs.filter(l => l.breakthroughs).length}</p>
                  <p className="text-xs text-gray-500">Breakthroughs</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0">
                <CardContent className="p-4 text-center">
                  {todayFastLogged ? (
                    <>
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm font-medium text-green-600">Logged Today</p>
                    </>
                  ) : (
                    <>
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium text-gray-500">Not Logged</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Log Fast Form */}
            {!todayFastLogged && !showFastForm && (
              <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">Are you fasting today?</h3>
                  <p className="opacity-80 mb-4">Log your fast to track your journey</p>
                  <Button onClick={() => setShowFastForm(true)} className="bg-white text-orange-600 hover:bg-orange-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Today's Fast
                  </Button>
                </CardContent>
              </Card>
            )}

            {showFastForm && (
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0">
                <CardHeader>
                  <CardTitle>Log Your Fast</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Type of Fast</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {FAST_TYPES.map((type) => {
                        const Icon = type.icon
                        return (
                          <button
                            key={type.value}
                            onClick={() => setFastForm({ ...fastForm, fast_type: type.value })}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              fastForm.fast_type === type.value
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`h-5 w-5 mb-2 ${fastForm.fast_type === type.value ? 'text-orange-500' : 'text-gray-400'}`} />
                            <p className={`font-medium text-sm ${fastForm.fast_type === type.value ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'}`}>
                              {type.label}
                            </p>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>Prayer Focus</Label>
                    <Textarea
                      placeholder="What are you praying for during this fast?"
                      value={fastForm.prayer_focus}
                      onChange={(e) => setFastForm({ ...fastForm, prayer_focus: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Reflections</Label>
                    <Textarea
                      placeholder="What is God speaking to you?"
                      value={fastForm.reflections}
                      onChange={(e) => setFastForm({ ...fastForm, reflections: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Breakthroughs</Label>
                    <Textarea
                      placeholder="Any breakthroughs or answered prayers?"
                      value={fastForm.breakthroughs}
                      onChange={(e) => setFastForm({ ...fastForm, breakthroughs: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={logFast} disabled={fastSubmitting} className="flex-1 bg-orange-500 hover:bg-orange-600">
                      {fastSubmitting ? 'Saving...' : 'Log Fast'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowFastForm(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fasting History */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Fasting History</h3>
              {fastingLogs.length === 0 ? (
                <Card className="bg-white/80 dark:bg-slate-800/80 border-0">
                  <CardContent className="py-12 text-center">
                    <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Fasting History</h3>
                    <p className="text-gray-500">Start logging your fasts to track your journey</p>
                  </CardContent>
                </Card>
              ) : (
                fastingLogs.map((log) => {
                  const info = getFastTypeInfo(log.fast_type)
                  const Icon = info.icon
                  return (
                    <Card key={log.id} className="bg-white/80 dark:bg-slate-800/80 border-0">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-navy dark:text-white">{info.label}</p>
                              <span className="text-sm text-gray-500">{new Date(log.fast_date).toLocaleDateString()}</span>
                            </div>
                            {log.prayer_focus && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <strong>Prayer:</strong> {log.prayer_focus}
                              </p>
                            )}
                            {log.breakthroughs && (
                              <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded text-sm text-green-700 dark:text-green-400">
                                <Sparkles className="h-3 w-3 inline mr-1" />
                                {log.breakthroughs}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Encouragement Card */}
        <Card className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">The Power of Agreement</h3>
                <p className="text-blue-100 text-sm">
                  "Again, truly I tell you that if two of you on earth agree about anything they ask for, it will be done for them by my Father in heaven." — Matthew 18:19
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

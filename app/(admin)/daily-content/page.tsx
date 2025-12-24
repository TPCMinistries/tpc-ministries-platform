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
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Sun,
  Loader2,
  Search,
  Eye,
  EyeOff,
  Users,
  Star,
  BarChart3,
  Sparkles
} from 'lucide-react'

// Types
interface DailyScripture {
  id: string
  scripture_date: string
  scripture_reference: string
  scripture_text: string
  reflection: string | null
  prayer: string | null
  theme: string | null
  audio_url: string | null
  created_at: string
}

interface Devotional {
  id: string
  date: string
  title: string
  scripture_reference: string
  scripture_text: string
  content: string
  prayer: string
  reflection_questions: string[]
  author: string
  series: string
  is_published: boolean
  created_at: string
}

interface ReadingPlan {
  id: string
  title: string
  description: string
  duration_days: number
  category: string
  difficulty: string
  cover_image_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  total_participants?: number
}

interface PlanDay {
  id?: string
  plan_id: string
  day_number: number
  title: string
  scripture_reference: string
  scripture_text: string
  reflection: string
}

export default function DailyContentPage() {
  const [activeTab, setActiveTab] = useState('scripture')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Scripture state
  const [scriptures, setScriptures] = useState<DailyScripture[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showScriptureModal, setShowScriptureModal] = useState(false)
  const [selectedScripture, setSelectedScripture] = useState<DailyScripture | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [scriptureFormData, setScriptureFormData] = useState({
    scripture_date: new Date().toISOString().split('T')[0],
    scripture_reference: '',
    scripture_text: '',
    reflection: '',
    prayer: '',
    theme: '',
    audio_url: '',
  })

  // Devotionals state
  const [devotionals, setDevotionals] = useState<Devotional[]>([])
  const [showDevotionalModal, setShowDevotionalModal] = useState(false)
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null)
  const [devotionalFormData, setDevotionalFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    scripture_reference: '',
    scripture_text: '',
    content: '',
    prayer: '',
    reflection_questions: '',
    author: 'TPC Ministries',
    series: 'Streams of Grace',
    is_published: true
  })

  // Reading Plans state
  const [plans, setPlans] = useState<ReadingPlan[]>([])
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showDaysModal, setShowDaysModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null)
  const [planDays, setPlanDays] = useState<PlanDay[]>([])
  const [filterCategory, setFilterCategory] = useState('all')
  const [planFormData, setPlanFormData] = useState({
    title: '',
    description: '',
    duration_days: 7,
    category: 'general',
    difficulty: 'beginner',
    cover_image_url: '',
    is_featured: false,
    is_active: true,
  })

  const categories = ['general', 'gospel', 'epistles', 'psalms', 'proverbs', 'prophets', 'topical', 'seasonal']
  const difficulties = ['beginner', 'intermediate', 'advanced']

  // Stats
  const [stats, setStats] = useState({
    totalScriptures: 0,
    totalDevotionals: 0,
    totalPlans: 0,
    missingDays: 0,
  })

  useEffect(() => {
    fetchAllData()
  }, [currentMonth])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchScriptures(),
      fetchDevotionals(),
      fetchPlans(),
    ])
    setLoading(false)
  }

  // ============ SCRIPTURE FUNCTIONS ============
  const fetchScriptures = async () => {
    const supabase = createClient()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('daily_scriptures')
      .select('*')
      .gte('scripture_date', startOfMonth)
      .lte('scripture_date', endOfMonth)
      .order('scripture_date', { ascending: true })

    if (data) {
      setScriptures(data)
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
      setStats(prev => ({
        ...prev,
        totalScriptures: data.length,
        missingDays: daysInMonth - data.length
      }))
    }
  }

  const handleScriptureSubmit = async () => {
    const supabase = createClient()
    const payload = {
      ...scriptureFormData,
      reflection: scriptureFormData.reflection || null,
      prayer: scriptureFormData.prayer || null,
      theme: scriptureFormData.theme || null,
      audio_url: scriptureFormData.audio_url || null,
    }

    if (selectedScripture) {
      await supabase.from('daily_scriptures').update(payload).eq('id', selectedScripture.id)
    } else {
      await supabase.from('daily_scriptures').insert([payload])
    }

    fetchScriptures()
    closeScriptureModal()
  }

  const handleScriptureDelete = async (id: string) => {
    if (!confirm('Delete this daily scripture?')) return
    const supabase = createClient()
    await supabase.from('daily_scriptures').delete().eq('id', id)
    fetchScriptures()
  }

  const openScriptureEditModal = (scripture: DailyScripture) => {
    setSelectedScripture(scripture)
    setScriptureFormData({
      scripture_date: scripture.scripture_date,
      scripture_reference: scripture.scripture_reference,
      scripture_text: scripture.scripture_text,
      reflection: scripture.reflection || '',
      prayer: scripture.prayer || '',
      theme: scripture.theme || '',
      audio_url: scripture.audio_url || '',
    })
    setShowScriptureModal(true)
  }

  const openScriptureCreateModal = (date?: string) => {
    setSelectedScripture(null)
    setScriptureFormData({
      scripture_date: date || new Date().toISOString().split('T')[0],
      scripture_reference: '',
      scripture_text: '',
      reflection: '',
      prayer: '',
      theme: '',
      audio_url: '',
    })
    setShowScriptureModal(true)
  }

  const closeScriptureModal = () => {
    setShowScriptureModal(false)
    setSelectedScripture(null)
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1))
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getScriptureForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return scriptures.find(s => s.scripture_date === dateStr)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // ============ DEVOTIONALS FUNCTIONS ============
  const fetchDevotionals = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('devotionals')
      .select('*')
      .order('date', { ascending: false })
      .limit(50)

    if (data) {
      setDevotionals(data)
      setStats(prev => ({ ...prev, totalDevotionals: data.length }))
    }
  }

  const handleDevotionalSubmit = async () => {
    const supabase = createClient()
    const devotionalData = {
      date: devotionalFormData.date,
      title: devotionalFormData.title,
      scripture_reference: devotionalFormData.scripture_reference,
      scripture_text: devotionalFormData.scripture_text,
      content: devotionalFormData.content,
      prayer: devotionalFormData.prayer,
      reflection_questions: devotionalFormData.reflection_questions
        .split('\n')
        .map(q => q.trim())
        .filter(q => q),
      author: devotionalFormData.author,
      series: devotionalFormData.series,
      is_published: devotionalFormData.is_published
    }

    if (selectedDevotional) {
      await supabase.from('devotionals').update(devotionalData).eq('id', selectedDevotional.id)
    } else {
      await supabase.from('devotionals').insert(devotionalData)
    }

    setShowDevotionalModal(false)
    fetchDevotionals()
  }

  const handleDevotionalDelete = async (id: string) => {
    if (!confirm('Delete this devotional?')) return
    const supabase = createClient()
    await supabase.from('devotionals').delete().eq('id', id)
    fetchDevotionals()
  }

  const toggleDevotionalPublished = async (devotional: Devotional) => {
    const supabase = createClient()
    await supabase.from('devotionals').update({ is_published: !devotional.is_published }).eq('id', devotional.id)
    fetchDevotionals()
  }

  const openDevotionalEditModal = (devotional: Devotional) => {
    setSelectedDevotional(devotional)
    setDevotionalFormData({
      date: devotional.date,
      title: devotional.title,
      scripture_reference: devotional.scripture_reference,
      scripture_text: devotional.scripture_text,
      content: devotional.content,
      prayer: devotional.prayer || '',
      reflection_questions: devotional.reflection_questions?.join('\n') || '',
      author: devotional.author,
      series: devotional.series,
      is_published: devotional.is_published
    })
    setShowDevotionalModal(true)
  }

  const openDevotionalCreateModal = () => {
    setSelectedDevotional(null)
    setDevotionalFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      scripture_reference: '',
      scripture_text: '',
      content: '',
      prayer: '',
      reflection_questions: '',
      author: 'TPC Ministries',
      series: 'Streams of Grace',
      is_published: true
    })
    setShowDevotionalModal(true)
  }

  // ============ READING PLANS FUNCTIONS ============
  const fetchPlans = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reading_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setPlans(data)
      setStats(prev => ({ ...prev, totalPlans: data.length }))
    }
  }

  const handlePlanSubmit = async () => {
    const supabase = createClient()

    if (selectedPlan) {
      await supabase.from('reading_plans').update(planFormData).eq('id', selectedPlan.id)
      fetchPlans()
      setShowPlanModal(false)
      setSelectedPlan(null)
    } else {
      const { data } = await supabase
        .from('reading_plans')
        .insert([planFormData])
        .select()
        .single()

      if (data) {
        setPlans([data, ...plans])
        setShowPlanModal(false)
        setSelectedPlan(data)
        setShowDaysModal(true)
      }
    }
    resetPlanForm()
  }

  const handlePlanDelete = async (id: string) => {
    if (!confirm('Delete this reading plan?')) return
    const supabase = createClient()
    await supabase.from('reading_plans').delete().eq('id', id)
    fetchPlans()
  }

  const handleToggleFeatured = async (plan: ReadingPlan) => {
    const supabase = createClient()
    await supabase.from('reading_plans').update({ is_featured: !plan.is_featured }).eq('id', plan.id)
    fetchPlans()
  }

  const handleToggleActive = async (plan: ReadingPlan) => {
    const supabase = createClient()
    await supabase.from('reading_plans').update({ is_active: !plan.is_active }).eq('id', plan.id)
    fetchPlans()
  }

  const fetchPlanDays = async (planId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reading_plan_days')
      .select('*')
      .eq('plan_id', planId)
      .order('day_number')

    if (data) {
      setPlanDays(data)
    }
  }

  const handleSaveDays = async () => {
    if (!selectedPlan) return
    const supabase = createClient()

    await supabase.from('reading_plan_days').delete().eq('plan_id', selectedPlan.id)

    const daysToInsert = planDays.map(day => ({
      plan_id: selectedPlan.id,
      day_number: day.day_number,
      title: day.title,
      scripture_reference: day.scripture_reference,
      scripture_text: day.scripture_text,
      reflection: day.reflection,
    }))

    await supabase.from('reading_plan_days').insert(daysToInsert)
    setShowDaysModal(false)
    setSelectedPlan(null)
    setPlanDays([])
  }

  const resetPlanForm = () => {
    setPlanFormData({
      title: '',
      description: '',
      duration_days: 7,
      category: 'general',
      difficulty: 'beginner',
      cover_image_url: '',
      is_featured: false,
      is_active: true,
    })
  }

  const openPlanEditModal = (plan: ReadingPlan) => {
    setSelectedPlan(plan)
    setPlanFormData({
      title: plan.title,
      description: plan.description,
      duration_days: plan.duration_days,
      category: plan.category,
      difficulty: plan.difficulty,
      cover_image_url: plan.cover_image_url || '',
      is_featured: plan.is_featured,
      is_active: plan.is_active,
    })
    setShowPlanModal(true)
  }

  const openDaysModal = (plan: ReadingPlan) => {
    setSelectedPlan(plan)
    fetchPlanDays(plan.id)

    if (planDays.length === 0) {
      const newDays: PlanDay[] = Array.from({ length: plan.duration_days }, (_, i) => ({
        plan_id: plan.id,
        day_number: i + 1,
        title: `Day ${i + 1}`,
        scripture_reference: '',
        scripture_text: '',
        reflection: '',
      }))
      setPlanDays(newDays)
    }

    setShowDaysModal(true)
  }

  // Filters
  const filteredDevotionals = devotionals.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.scripture_reference.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || plan.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
              <Sun className="h-10 w-10 text-amber-500" />
              Daily Content
            </h1>
            <p className="text-gray-600 mt-1">
              Scriptures, devotionals, and reading plans
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scriptures This Month</p>
                  <p className="text-3xl font-bold text-navy">{stats.totalScriptures}</p>
                </div>
                <BookOpen className="h-10 w-10 text-navy/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Missing Days</p>
                  <p className="text-3xl font-bold text-red-600">{stats.missingDays}</p>
                </div>
                <Calendar className="h-10 w-10 text-red-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Devotionals</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.totalDevotionals}</p>
                </div>
                <Sun className="h-10 w-10 text-amber-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reading Plans</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalPlans}</p>
                </div>
                <BarChart3 className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="scripture" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Scripture
            </TabsTrigger>
            <TabsTrigger value="devotionals" className="gap-2">
              <Sun className="h-4 w-4" />
              Devotionals
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <Calendar className="h-4 w-4" />
              Plans
            </TabsTrigger>
          </TabsList>

          {/* ============ SCRIPTURE TAB ============ */}
          <TabsContent value="scripture" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => openScriptureCreateModal()} className="bg-navy hover:bg-navy/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Scripture
              </Button>
            </div>

            {/* Calendar View */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  {getDaysInMonth().map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="h-20" />
                    }

                    const scripture = getScriptureForDate(date)
                    const today = isToday(date)
                    const past = isPast(date)

                    return (
                      <div
                        key={date.toISOString()}
                        className={`h-20 border rounded-lg p-2 cursor-pointer transition-colors ${
                          today ? 'border-navy border-2 bg-navy/5' :
                          scripture ? 'bg-green-50 border-green-200' :
                          past ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => scripture ? openScriptureEditModal(scripture) : openScriptureCreateModal(date.toISOString().split('T')[0])}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${today ? 'text-navy' : ''}`}>
                            {date.getDate()}
                          </span>
                          {scripture && <BookOpen className="h-3 w-3 text-green-600" />}
                        </div>
                        {scripture && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {scripture.scripture_reference}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Scriptures */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Scriptures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scriptures.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No scriptures for this month</p>
                    </div>
                  ) : (
                    scriptures.slice(0, 5).map((scripture) => (
                      <div key={scripture.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {new Date(scripture.scripture_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                              </span>
                              {scripture.theme && (
                                <span className="bg-navy/10 text-navy px-2 py-0.5 rounded text-xs">
                                  {scripture.theme}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-navy">{scripture.scripture_reference}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(scripture.scripture_text, scripture.id)}
                            >
                              {copiedId === scripture.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openScriptureEditModal(scripture)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleScriptureDelete(scripture.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm italic">"{scripture.scripture_text}"</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ DEVOTIONALS TAB ============ */}
          <TabsContent value="devotionals" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devotionals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={openDevotionalCreateModal} className="bg-navy hover:bg-navy/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Devotional
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Scripture</TableHead>
                      <TableHead>Series</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDevotionals.map((devotional) => (
                      <TableRow key={devotional.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(devotional.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{devotional.title}</TableCell>
                        <TableCell>{devotional.scripture_reference}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{devotional.series}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={devotional.is_published ? 'default' : 'secondary'}>
                            {devotional.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDevotionalPublished(devotional)}
                            >
                              {devotional.is_published ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDevotionalEditModal(devotional)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDevotionalDelete(devotional.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ READING PLANS TAB ============ */}
          <TabsContent value="plans" className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reading plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
              <Button onClick={() => { resetPlanForm(); setSelectedPlan(null); setShowPlanModal(true) }} className="bg-navy hover:bg-navy/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredPlans.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reading plans found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPlans.map((plan) => (
                  <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        {plan.cover_image_url ? (
                          <img src={plan.cover_image_url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                        ) : (
                          <div className="w-20 h-20 bg-navy/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-navy/40" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-navy">{plan.title}</h3>
                            {plan.is_featured && (
                              <span className="bg-gold/20 text-gold px-2 py-0.5 rounded text-xs font-medium">Featured</span>
                            )}
                            {!plan.is_active && (
                              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">Inactive</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-1">{plan.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {plan.duration_days} days
                            </span>
                            <span className="capitalize">{plan.category}</span>
                            <span className="capitalize">{plan.difficulty}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(plan)}
                            className={plan.is_featured ? 'text-gold' : 'text-gray-400'}
                          >
                            <Star className="h-4 w-4" fill={plan.is_featured ? 'currentColor' : 'none'} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDaysModal(plan)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPlanEditModal(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(plan)}
                          >
                            <Eye className={`h-4 w-4 ${plan.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlanDelete(plan.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* ============ MODALS ============ */}

        {/* Scripture Modal */}
        {showScriptureModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedScripture ? 'Edit Daily Scripture' : 'Add Daily Scripture'}
                </h2>
                <button onClick={closeScriptureModal}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={scriptureFormData.scripture_date}
                      onChange={(e) => setScriptureFormData({ ...scriptureFormData, scripture_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Theme</Label>
                    <Input
                      value={scriptureFormData.theme}
                      onChange={(e) => setScriptureFormData({ ...scriptureFormData, theme: e.target.value })}
                      placeholder="e.g., Faith, Hope, Love"
                    />
                  </div>
                </div>

                <div>
                  <Label>Scripture Reference *</Label>
                  <Input
                    value={scriptureFormData.scripture_reference}
                    onChange={(e) => setScriptureFormData({ ...scriptureFormData, scripture_reference: e.target.value })}
                    placeholder="e.g., John 3:16-17"
                  />
                </div>

                <div>
                  <Label>Scripture Text *</Label>
                  <Textarea
                    value={scriptureFormData.scripture_text}
                    onChange={(e) => setScriptureFormData({ ...scriptureFormData, scripture_text: e.target.value })}
                    rows={4}
                    placeholder="Enter the scripture passage..."
                  />
                </div>

                <div>
                  <Label>Reflection</Label>
                  <Textarea
                    value={scriptureFormData.reflection}
                    onChange={(e) => setScriptureFormData({ ...scriptureFormData, reflection: e.target.value })}
                    rows={3}
                    placeholder="Add a reflection..."
                  />
                </div>

                <div>
                  <Label>Prayer</Label>
                  <Textarea
                    value={scriptureFormData.prayer}
                    onChange={(e) => setScriptureFormData({ ...scriptureFormData, prayer: e.target.value })}
                    rows={2}
                    placeholder="Add a prayer..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleScriptureSubmit} className="flex-1 bg-navy hover:bg-navy/90">
                    <Save className="mr-2 h-4 w-4" />
                    {selectedScripture ? 'Update Scripture' : 'Add Scripture'}
                  </Button>
                  <Button variant="outline" onClick={closeScriptureModal}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Devotional Modal */}
        {showDevotionalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedDevotional ? 'Edit Devotional' : 'Create Devotional'}
                </h2>
                <button onClick={() => setShowDevotionalModal(false)}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={devotionalFormData.date}
                      onChange={(e) => setDevotionalFormData({ ...devotionalFormData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Series</Label>
                    <Input
                      value={devotionalFormData.series}
                      onChange={(e) => setDevotionalFormData({ ...devotionalFormData, series: e.target.value })}
                      placeholder="Streams of Grace"
                    />
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={devotionalFormData.title}
                    onChange={(e) => setDevotionalFormData({ ...devotionalFormData, title: e.target.value })}
                    placeholder="Walking in Divine Purpose"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Scripture Reference</Label>
                    <Input
                      value={devotionalFormData.scripture_reference}
                      onChange={(e) => setDevotionalFormData({ ...devotionalFormData, scripture_reference: e.target.value })}
                      placeholder="Jeremiah 29:11"
                    />
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input
                      value={devotionalFormData.author}
                      onChange={(e) => setDevotionalFormData({ ...devotionalFormData, author: e.target.value })}
                      placeholder="TPC Ministries"
                    />
                  </div>
                </div>

                <div>
                  <Label>Scripture Text</Label>
                  <Textarea
                    value={devotionalFormData.scripture_text}
                    onChange={(e) => setDevotionalFormData({ ...devotionalFormData, scripture_text: e.target.value })}
                    placeholder="For I know the plans I have for you..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={devotionalFormData.content}
                    onChange={(e) => setDevotionalFormData({ ...devotionalFormData, content: e.target.value })}
                    placeholder="Main devotional content..."
                    rows={6}
                  />
                </div>

                <div>
                  <Label>Prayer</Label>
                  <Textarea
                    value={devotionalFormData.prayer}
                    onChange={(e) => setDevotionalFormData({ ...devotionalFormData, prayer: e.target.value })}
                    placeholder="Closing prayer..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Reflection Questions (one per line)</Label>
                  <Textarea
                    value={devotionalFormData.reflection_questions}
                    onChange={(e) => setDevotionalFormData({ ...devotionalFormData, reflection_questions: e.target.value })}
                    placeholder="What is God teaching you today?"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={devotionalFormData.is_published}
                    onChange={(e) => setDevotionalFormData({ ...devotionalFormData, is_published: e.target.checked })}
                  />
                  <Label htmlFor="is_published">Publish immediately</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleDevotionalSubmit} className="flex-1 bg-navy hover:bg-navy/90">
                    <Save className="mr-2 h-4 w-4" />
                    Save Devotional
                  </Button>
                  <Button variant="outline" onClick={() => setShowDevotionalModal(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Modal */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedPlan ? 'Edit Reading Plan' : 'Create Reading Plan'}
                </h2>
                <button onClick={() => setShowPlanModal(false)}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={planFormData.title}
                    onChange={(e) => setPlanFormData({ ...planFormData, title: e.target.value })}
                    placeholder="e.g., 21 Days of Prayer"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={planFormData.description}
                    onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                    placeholder="Describe this reading plan..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Duration (Days)</Label>
                    <Input
                      type="number"
                      value={planFormData.duration_days}
                      onChange={(e) => setPlanFormData({ ...planFormData, duration_days: parseInt(e.target.value) || 7 })}
                      min={1}
                      max={365}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      value={planFormData.category}
                      onChange={(e) => setPlanFormData({ ...planFormData, category: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <select
                      value={planFormData.difficulty}
                      onChange={(e) => setPlanFormData({ ...planFormData, difficulty: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planFormData.is_featured}
                      onChange={(e) => setPlanFormData({ ...planFormData, is_featured: e.target.checked })}
                    />
                    <span className="text-sm">Featured Plan</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planFormData.is_active}
                      onChange={(e) => setPlanFormData({ ...planFormData, is_active: e.target.checked })}
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handlePlanSubmit} className="flex-1 bg-navy hover:bg-navy/90">
                    <Save className="mr-2 h-4 w-4" />
                    {selectedPlan ? 'Update Plan' : 'Create & Add Days'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowPlanModal(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Days Editor Modal */}
        {showDaysModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-navy">Edit Plan Days</h2>
                  <p className="text-gray-600">{selectedPlan.title} - {selectedPlan.duration_days} days</p>
                </div>
                <button onClick={() => { setShowDaysModal(false); setPlanDays([]) }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {Array.from({ length: selectedPlan.duration_days }, (_, i) => i).map((index) => {
                  const day = planDays[index] || {
                    plan_id: selectedPlan.id,
                    day_number: index + 1,
                    title: `Day ${index + 1}`,
                    scripture_reference: '',
                    scripture_text: '',
                    reflection: '',
                  }

                  return (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Day {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={day.title}
                              onChange={(e) => {
                                const updated = [...planDays]
                                if (!updated[index]) {
                                  updated[index] = { ...day }
                                }
                                updated[index].title = e.target.value
                                setPlanDays(updated)
                              }}
                              placeholder="Day title..."
                            />
                          </div>
                          <div>
                            <Label>Scripture Reference</Label>
                            <Input
                              value={day.scripture_reference}
                              onChange={(e) => {
                                const updated = [...planDays]
                                if (!updated[index]) {
                                  updated[index] = { ...day }
                                }
                                updated[index].scripture_reference = e.target.value
                                setPlanDays(updated)
                              }}
                              placeholder="e.g., John 3:16-21"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Scripture Text</Label>
                          <Textarea
                            value={day.scripture_text}
                            onChange={(e) => {
                              const updated = [...planDays]
                              if (!updated[index]) {
                                updated[index] = { ...day }
                              }
                              updated[index].scripture_text = e.target.value
                              setPlanDays(updated)
                            }}
                            placeholder="Enter the scripture passage..."
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Reflection</Label>
                          <Textarea
                            value={day.reflection}
                            onChange={(e) => {
                              const updated = [...planDays]
                              if (!updated[index]) {
                                updated[index] = { ...day }
                              }
                              updated[index].reflection = e.target.value
                              setPlanDays(updated)
                            }}
                            placeholder="Add a reflection..."
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex gap-3 pt-6 sticky bottom-0 bg-white py-4 border-t mt-6">
                <Button onClick={handleSaveDays} className="flex-1 bg-navy hover:bg-navy/90">
                  <Save className="mr-2 h-4 w-4" />
                  Save All Days
                </Button>
                <Button variant="outline" onClick={() => { setShowDaysModal(false); setPlanDays([]) }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

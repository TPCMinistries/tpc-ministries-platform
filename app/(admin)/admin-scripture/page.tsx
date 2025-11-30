'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
} from 'lucide-react'

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

export default function AdminScripturePage() {
  const [scriptures, setScriptures] = useState<DailyScripture[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedScripture, setSelectedScripture] = useState<DailyScripture | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalScriptures: 0,
    thisMonth: 0,
    missingDays: 0,
  })

  const [formData, setFormData] = useState({
    scripture_date: new Date().toISOString().split('T')[0],
    scripture_reference: '',
    scripture_text: '',
    reflection: '',
    prayer: '',
    theme: '',
    audio_url: '',
  })

  useEffect(() => {
    fetchScriptures()
    fetchStats()
  }, [currentMonth])

  const fetchScriptures = async () => {
    const supabase = createClient()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_scriptures')
      .select('*')
      .gte('scripture_date', startOfMonth)
      .lte('scripture_date', endOfMonth)
      .order('scripture_date', { ascending: true })

    if (!error && data) {
      setScriptures(data)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const supabase = createClient()
    const { count: totalScriptures } = await supabase
      .from('daily_scriptures')
      .select('*', { count: 'exact', head: true })

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0]

    const { count: thisMonth } = await supabase
      .from('daily_scriptures')
      .select('*', { count: 'exact', head: true })
      .gte('scripture_date', startOfMonth)
      .lte('scripture_date', endOfMonth)

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

    setStats({
      totalScriptures: totalScriptures || 0,
      thisMonth: thisMonth || 0,
      missingDays: daysInMonth - (thisMonth || 0),
    })
  }

  const handleSubmit = async () => {
    const supabase = createClient()
    const payload = {
      ...formData,
      reflection: formData.reflection || null,
      prayer: formData.prayer || null,
      theme: formData.theme || null,
      audio_url: formData.audio_url || null,
    }

    if (selectedScripture) {
      await supabase.from('daily_scriptures').update(payload).eq('id', selectedScripture.id)
    } else {
      await supabase.from('daily_scriptures').insert([payload])
    }

    fetchScriptures()
    fetchStats()
    closeModal()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this daily scripture?')) return
    const supabase = createClient()
    await supabase.from('daily_scriptures').delete().eq('id', id)
    fetchScriptures()
    fetchStats()
  }

  const openEditModal = (scripture: DailyScripture) => {
    setSelectedScripture(scripture)
    setFormData({
      scripture_date: scripture.scripture_date,
      scripture_reference: scripture.scripture_reference,
      scripture_text: scripture.scripture_text,
      reflection: scripture.reflection || '',
      prayer: scripture.prayer || '',
      theme: scripture.theme || '',
      audio_url: scripture.audio_url || '',
    })
    setShowModal(true)
  }

  const openCreateModal = (date?: string) => {
    setSelectedScripture(null)
    setFormData({
      scripture_date: date || new Date().toISOString().split('T')[0],
      scripture_reference: '',
      scripture_text: '',
      reflection: '',
      prayer: '',
      theme: '',
      audio_url: '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedScripture(null)
    setFormData({
      scripture_date: new Date().toISOString().split('T')[0],
      scripture_reference: '',
      scripture_text: '',
      reflection: '',
      prayer: '',
      theme: '',
      audio_url: '',
    })
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
    // Add empty slots for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    // Add all days of the month
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

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Daily Scripture</h1>
            <p className="text-gray-600">Manage daily scriptures for member devotions</p>
          </div>
          <Button onClick={() => openCreateModal()} className="bg-navy hover:bg-navy/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Scripture
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Scriptures</p>
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
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-green-600">{stats.thisMonth}</p>
                </div>
                <Calendar className="h-10 w-10 text-green-600/20" />
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
        </div>

        {/* Calendar View */}
        <Card className="mb-8">
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
                  return <div key={`empty-${index}`} className="h-24" />
                }

                const scripture = getScriptureForDate(date)
                const today = isToday(date)
                const past = isPast(date)

                return (
                  <div
                    key={date.toISOString()}
                    className={`h-24 border rounded-lg p-2 cursor-pointer transition-colors ${
                      today ? 'border-navy border-2 bg-navy/5' :
                      scripture ? 'bg-green-50 border-green-200' :
                      past ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => scripture ? openEditModal(scripture) : openCreateModal(date.toISOString().split('T')[0])}
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

        {/* Recent Scriptures List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Scriptures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : scriptures.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No scriptures for this month</p>
                </div>
              ) : (
                scriptures.map((scripture) => (
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
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(scripture)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(scripture.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm italic mb-2">"{scripture.scripture_text}"</p>
                    {scripture.reflection && (
                      <p className="text-gray-600 text-sm">{scripture.reflection}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedScripture ? 'Edit Daily Scripture' : 'Add Daily Scripture'}
                </h2>
                <button onClick={closeModal}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.scripture_date}
                      onChange={(e) => setFormData({ ...formData, scripture_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Theme</Label>
                    <Input
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      placeholder="e.g., Faith, Hope, Love"
                    />
                  </div>
                </div>

                <div>
                  <Label>Scripture Reference *</Label>
                  <Input
                    value={formData.scripture_reference}
                    onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })}
                    placeholder="e.g., John 3:16-17"
                  />
                </div>

                <div>
                  <Label>Scripture Text *</Label>
                  <Textarea
                    value={formData.scripture_text}
                    onChange={(e) => setFormData({ ...formData, scripture_text: e.target.value })}
                    rows={4}
                    placeholder="Enter the scripture passage..."
                  />
                </div>

                <div>
                  <Label>Reflection / Devotional Thought</Label>
                  <Textarea
                    value={formData.reflection}
                    onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                    rows={3}
                    placeholder="Add a reflection or devotional thought..."
                  />
                </div>

                <div>
                  <Label>Prayer</Label>
                  <Textarea
                    value={formData.prayer}
                    onChange={(e) => setFormData({ ...formData, prayer: e.target.value })}
                    rows={2}
                    placeholder="Add a suggested prayer..."
                  />
                </div>

                <div>
                  <Label>Audio URL (optional)</Label>
                  <Input
                    value={formData.audio_url}
                    onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} className="flex-1 bg-navy hover:bg-navy/90">
                    <Save className="mr-2 h-4 w-4" />
                    {selectedScripture ? 'Update Scripture' : 'Add Scripture'}
                  </Button>
                  <Button variant="outline" onClick={closeModal}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

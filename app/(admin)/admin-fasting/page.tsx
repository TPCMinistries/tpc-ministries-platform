'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Utensils,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  Clock,
  Target,
  Flame,
  Save,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'

interface FastingEvent {
  id: string
  title: string
  description: string
  fast_type: string
  start_date: string
  end_date: string
  goal: string | null
  prayer_focus: string | null
  is_active: boolean
  participant_count?: number
  created_at: string
}

export default function AdminFastingPage() {
  const [events, setEvents] = useState<FastingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<FastingEvent | null>(null)
  const [stats, setStats] = useState({
    activeEvents: 0,
    totalParticipants: 0,
    completedFasts: 0,
    avgDuration: 0,
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fast_type: 'full',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    goal: '',
    prayer_focus: '',
    is_active: true,
  })

  const fastTypes = [
    { value: 'full', label: 'Full Fast (No Food)', description: 'Complete abstinence from food' },
    { value: 'partial', label: 'Partial Fast', description: 'Limited food intake (e.g., one meal)' },
    { value: 'daniel', label: 'Daniel Fast', description: 'Vegetables, fruits, and water only' },
    { value: 'media', label: 'Media Fast', description: 'Abstinence from social media/entertainment' },
    { value: 'custom', label: 'Custom Fast', description: 'Personalized fasting guidelines' },
  ]

  useEffect(() => {
    fetchEvents()
    fetchStats()
  }, [])

  const fetchEvents = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('fasting_events')
      .select('*')
      .order('start_date', { ascending: false })

    if (!error && data) {
      setEvents(data)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const supabase = createClient()

    const today = new Date().toISOString().split('T')[0]
    const { count: activeEvents } = await supabase
      .from('fasting_events')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today)

    const { count: totalParticipants } = await supabase
      .from('fasting_logs')
      .select('member_id', { count: 'exact', head: true })

    const { count: completedFasts } = await supabase
      .from('fasting_logs')
      .select('*', { count: 'exact', head: true })
      .eq('completed', true)

    setStats({
      activeEvents: activeEvents || 0,
      totalParticipants: totalParticipants || 0,
      completedFasts: completedFasts || 0,
      avgDuration: 3,
    })
  }

  const handleSubmit = async () => {
    const supabase = createClient()
    const payload = {
      ...formData,
      goal: formData.goal || null,
      prayer_focus: formData.prayer_focus || null,
    }

    if (selectedEvent) {
      await supabase.from('fasting_events').update(payload).eq('id', selectedEvent.id)
    } else {
      await supabase.from('fasting_events').insert([payload])
    }

    fetchEvents()
    fetchStats()
    closeModal()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fasting event?')) return
    const supabase = createClient()
    await supabase.from('fasting_events').delete().eq('id', id)
    fetchEvents()
    fetchStats()
  }

  const handleToggleActive = async (event: FastingEvent) => {
    const supabase = createClient()
    await supabase.from('fasting_events').update({ is_active: !event.is_active }).eq('id', event.id)
    fetchEvents()
  }

  const openEditModal = (event: FastingEvent) => {
    setSelectedEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      fast_type: event.fast_type,
      start_date: event.start_date,
      end_date: event.end_date,
      goal: event.goal || '',
      prayer_focus: event.prayer_focus || '',
      is_active: event.is_active,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
    setFormData({
      title: '',
      description: '',
      fast_type: 'full',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      goal: '',
      prayer_focus: '',
      is_active: true,
    })
  }

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const getEventStatus = (event: FastingEvent) => {
    const today = new Date().toISOString().split('T')[0]
    if (event.start_date > today) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
    if (event.end_date < today) return { label: 'Completed', color: 'bg-gray-100 text-gray-800' }
    return { label: 'In Progress', color: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Fasting Events</h1>
            <p className="text-gray-600">Create and manage church-wide fasting events</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-navy hover:bg-navy/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Fast
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Fasts</p>
                  <p className="text-3xl font-bold text-navy">{stats.activeEvents}</p>
                </div>
                <Flame className="h-10 w-10 text-navy/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalParticipants}</p>
                </div>
                <Users className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Fasts</p>
                  <p className="text-3xl font-bold text-gold">{stats.completedFasts}</p>
                </div>
                <Target className="h-10 w-10 text-gold/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Duration</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.avgDuration} days</p>
                </div>
                <Clock className="h-10 w-10 text-purple-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No fasting events yet</p>
                <Button onClick={() => setShowModal(true)} className="mt-4">
                  Create Your First Fast
                </Button>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => {
              const status = getEventStatus(event)
              const duration = getDuration(event.start_date, event.end_date)
              const fastType = fastTypes.find(t => t.value === event.fast_type)

              return (
                <Card key={event.id} className={!event.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-navy/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Flame className="h-8 w-8 text-navy" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-navy">{event.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          {!event.is_active && (
                            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">Hidden</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-4 w-4" />
                            {duration} days
                          </span>
                          <span className="bg-navy/10 text-navy px-2 py-1 rounded text-xs">
                            {fastType?.label || event.fast_type}
                          </span>
                        </div>
                        {event.prayer_focus && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Prayer Focus:</strong> {event.prayer_focus}
                          </p>
                        )}
                        {event.goal && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Goal:</strong> {event.goal}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleToggleActive(event)}>
                          {event.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedEvent ? 'Edit Fasting Event' : 'Create Fasting Event'}
                </h2>
                <button onClick={closeModal}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Event Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., 21 Days of Prayer & Fasting"
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe the purpose and expectations..."
                  />
                </div>

                <div>
                  <Label>Fast Type</Label>
                  <select
                    value={formData.fast_type}
                    onChange={(e) => setFormData({ ...formData, fast_type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {fastTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {fastTypes.find(t => t.value === formData.fast_type)?.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Prayer Focus</Label>
                  <Input
                    value={formData.prayer_focus}
                    onChange={(e) => setFormData({ ...formData, prayer_focus: e.target.value })}
                    placeholder="e.g., Revival, Family, Church Growth"
                  />
                </div>

                <div>
                  <Label>Goal/Outcome</Label>
                  <Input
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    placeholder="What we're believing God for..."
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="text-sm">Visible to members</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} className="flex-1 bg-navy hover:bg-navy/90">
                    <Save className="mr-2 h-4 w-4" />
                    {selectedEvent ? 'Update Event' : 'Create Event'}
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

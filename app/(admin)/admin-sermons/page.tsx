'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Video,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Calendar,
  User,
  Clock,
  Play,
  Upload,
  Save,
  X,
  BookOpen,
  MessageSquare,
} from 'lucide-react'

interface Sermon {
  id: string
  title: string
  speaker: string
  description: string
  video_url: string
  thumbnail_url: string | null
  duration_minutes: number | null
  scripture_reference: string | null
  sermon_date: string
  series_name: string | null
  is_published: boolean
  view_count: number
  notes_count: number
  created_at: string
}

export default function AdminSermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSeries, setFilterSeries] = useState('all')
  const [series, setSeries] = useState<string[]>([])
  const [stats, setStats] = useState({
    totalSermons: 0,
    publishedSermons: 0,
    totalViews: 0,
    totalNotes: 0,
  })

  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration_minutes: '',
    scripture_reference: '',
    sermon_date: new Date().toISOString().split('T')[0],
    series_name: '',
    is_published: true,
  })

  useEffect(() => {
    fetchSermons()
    fetchStats()
  }, [])

  const fetchSermons = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('sermon_date', { ascending: false })

    if (!error && data) {
      setSermons(data)
      const uniqueSeries = [...new Set(data.filter(s => s.series_name).map(s => s.series_name))] as string[]
      setSeries(uniqueSeries)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    const supabase = createClient()

    const { count: totalSermons } = await supabase
      .from('sermons')
      .select('*', { count: 'exact', head: true })

    const { count: publishedSermons } = await supabase
      .from('sermons')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    const { data: viewData } = await supabase
      .from('sermons')
      .select('view_count')

    const totalViews = viewData?.reduce((sum, s) => sum + (s.view_count || 0), 0) || 0

    const { count: totalNotes } = await supabase
      .from('sermon_notes')
      .select('*', { count: 'exact', head: true })

    setStats({
      totalSermons: totalSermons || 0,
      publishedSermons: publishedSermons || 0,
      totalViews,
      totalNotes: totalNotes || 0,
    })
  }

  const handleSubmit = async () => {
    const supabase = createClient()
    const payload = {
      ...formData,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      thumbnail_url: formData.thumbnail_url || null,
      scripture_reference: formData.scripture_reference || null,
      series_name: formData.series_name || null,
    }

    if (selectedSermon) {
      await supabase.from('sermons').update(payload).eq('id', selectedSermon.id)
    } else {
      await supabase.from('sermons').insert([payload])
    }

    fetchSermons()
    fetchStats()
    closeModal()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sermon?')) return
    const supabase = createClient()
    await supabase.from('sermons').delete().eq('id', id)
    fetchSermons()
    fetchStats()
  }

  const handleTogglePublish = async (sermon: Sermon) => {
    const supabase = createClient()
    await supabase.from('sermons').update({ is_published: !sermon.is_published }).eq('id', sermon.id)
    fetchSermons()
  }

  const openEditModal = (sermon: Sermon) => {
    setSelectedSermon(sermon)
    setFormData({
      title: sermon.title,
      speaker: sermon.speaker,
      description: sermon.description,
      video_url: sermon.video_url,
      thumbnail_url: sermon.thumbnail_url || '',
      duration_minutes: sermon.duration_minutes?.toString() || '',
      scripture_reference: sermon.scripture_reference || '',
      sermon_date: sermon.sermon_date,
      series_name: sermon.series_name || '',
      is_published: sermon.is_published,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedSermon(null)
    setFormData({
      title: '',
      speaker: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration_minutes: '',
      scripture_reference: '',
      sermon_date: new Date().toISOString().split('T')[0],
      series_name: '',
      is_published: true,
    })
  }

  const getVideoThumbnail = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('/').pop()
        : url.split('v=')[1]?.split('&')[0]
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    }
    return null
  }

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeries = filterSeries === 'all' || sermon.series_name === filterSeries
    return matchesSearch && matchesSeries
  })

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Sermons</h1>
            <p className="text-gray-600">Upload and manage sermon videos</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-navy hover:bg-navy/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Sermon
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sermons</p>
                  <p className="text-3xl font-bold text-navy">{stats.totalSermons}</p>
                </div>
                <Video className="h-10 w-10 text-navy/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-3xl font-bold text-green-600">{stats.publishedSermons}</p>
                </div>
                <Eye className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-gold">{stats.totalViews.toLocaleString()}</p>
                </div>
                <Play className="h-10 w-10 text-gold/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Notes Taken</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalNotes}</p>
                </div>
                <MessageSquare className="h-10 w-10 text-purple-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sermons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterSeries}
            onChange={(e) => setFilterSeries(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Series</option>
            {series.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Sermons Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">Loading sermons...</div>
          ) : filteredSermons.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-gray-500">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sermons found</p>
              </CardContent>
            </Card>
          ) : (
            filteredSermons.map((sermon) => {
              const thumbnail = sermon.thumbnail_url || getVideoThumbnail(sermon.video_url)
              return (
                <Card key={sermon.id} className={!sermon.is_published ? 'opacity-60' : ''}>
                  <div className="relative aspect-video bg-gray-100">
                    {thumbnail ? (
                      <img src={thumbnail} alt="" className="w-full h-full object-cover rounded-t-lg" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    {sermon.duration_minutes && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {sermon.duration_minutes} min
                      </span>
                    )}
                    {!sermon.is_published && (
                      <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-navy line-clamp-1 mb-1">{sermon.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <User className="h-3 w-3" />
                      <span>{sermon.speaker}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(sermon.sermon_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {sermon.view_count || 0}
                      </span>
                    </div>
                    {sermon.series_name && (
                      <span className="inline-block bg-navy/10 text-navy text-xs px-2 py-1 rounded mb-3">
                        {sermon.series_name}
                      </span>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(sermon)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePublish(sermon)}
                      >
                        {sermon.is_published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(sermon.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedSermon ? 'Edit Sermon' : 'Add New Sermon'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Sermon title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Speaker *</Label>
                    <Input
                      value={formData.speaker}
                      onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      placeholder="Pastor name"
                    />
                  </div>
                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.sermon_date}
                      onChange={(e) => setFormData({ ...formData, sermon_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Video URL * (YouTube, Vimeo, or direct link)</Label>
                  <Input
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the sermon..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Scripture Reference</Label>
                    <Input
                      value={formData.scripture_reference}
                      onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })}
                      placeholder="e.g., John 3:16"
                    />
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                      placeholder="45"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Series Name</Label>
                    <Input
                      value={formData.series_name}
                      onChange={(e) => setFormData({ ...formData, series_name: e.target.value })}
                      placeholder="e.g., Faith Series"
                      list="series-list"
                    />
                    <datalist id="series-list">
                      {series.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  <div>
                    <Label>Thumbnail URL (optional)</Label>
                    <Input
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="Auto-detected for YouTube"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Publish immediately</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} className="flex-1 bg-navy hover:bg-navy/90">
                    <Save className="mr-2 h-4 w-4" />
                    {selectedSermon ? 'Update Sermon' : 'Add Sermon'}
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

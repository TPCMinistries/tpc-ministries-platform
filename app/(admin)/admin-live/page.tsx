'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import {
  Radio,
  Plus,
  Edit,
  Trash2,
  Play,
  Square,
  Calendar,
  Users,
  Eye,
  X,
  Video,
  Link as LinkIcon,
  Clock
} from 'lucide-react'

interface LiveStream {
  id: string
  title: string
  description?: string
  stream_type: string
  stream_url?: string
  stream_platform?: string
  thumbnail_url?: string
  scheduled_start: string
  scheduled_end?: string
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
  viewer_count: number
  peak_viewers: number
  chat_enabled: boolean
  is_public: boolean
  required_tier?: string
  recording_url?: string
  created_at: string
}

const streamTypes = [
  { value: 'service', label: 'Worship Service' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'worship', label: 'Worship Night' },
  { value: 'prayer', label: 'Prayer Service' },
  { value: 'special', label: 'Special Event' }
]

const platforms = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'custom', label: 'Custom/Other' }
]

export default function AdminLivePage() {
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStream, setEditingStream] = useState<LiveStream | null>(null)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'live' | 'ended'>('all')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stream_type: 'service',
    stream_url: '',
    stream_platform: 'youtube',
    thumbnail_url: '',
    scheduled_start: '',
    scheduled_end: '',
    chat_enabled: true,
    is_public: true,
    required_tier: '',
    recording_url: ''
  })

  useEffect(() => {
    fetchStreams()
  }, [filter])

  const fetchStreams = async () => {
    const supabase = createClient()
    setLoading(true)

    let query = supabase
      .from('live_streams')
      .select('*')
      .order('scheduled_start', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (!error && data) {
      setStreams(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    const streamData = {
      title: formData.title,
      description: formData.description || null,
      stream_type: formData.stream_type,
      stream_url: formData.stream_url || null,
      stream_platform: formData.stream_platform,
      thumbnail_url: formData.thumbnail_url || null,
      scheduled_start: formData.scheduled_start,
      scheduled_end: formData.scheduled_end || null,
      chat_enabled: formData.chat_enabled,
      is_public: formData.is_public,
      required_tier: formData.required_tier || null,
      recording_url: formData.recording_url || null,
      created_by: member?.id
    }

    if (editingStream) {
      await supabase
        .from('live_streams')
        .update(streamData)
        .eq('id', editingStream.id)
    } else {
      await supabase.from('live_streams').insert({
        ...streamData,
        status: 'scheduled'
      })
    }

    resetForm()
    fetchStreams()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      stream_type: 'service',
      stream_url: '',
      stream_platform: 'youtube',
      thumbnail_url: '',
      scheduled_start: '',
      scheduled_end: '',
      chat_enabled: true,
      is_public: true,
      required_tier: '',
      recording_url: ''
    })
    setEditingStream(null)
    setShowForm(false)
  }

  const handleEdit = (stream: LiveStream) => {
    setEditingStream(stream)
    setFormData({
      title: stream.title,
      description: stream.description || '',
      stream_type: stream.stream_type,
      stream_url: stream.stream_url || '',
      stream_platform: stream.stream_platform || 'youtube',
      thumbnail_url: stream.thumbnail_url || '',
      scheduled_start: stream.scheduled_start.slice(0, 16),
      scheduled_end: stream.scheduled_end?.slice(0, 16) || '',
      chat_enabled: stream.chat_enabled,
      is_public: stream.is_public,
      required_tier: stream.required_tier || '',
      recording_url: stream.recording_url || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stream?')) return

    const supabase = createClient()
    await supabase.from('live_streams').delete().eq('id', id)
    fetchStreams()
  }

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = createClient()

    const updates: any = { status }

    if (status === 'live') {
      updates.actual_start = new Date().toISOString()
    } else if (status === 'ended') {
      updates.actual_end = new Date().toISOString()
    }

    await supabase.from('live_streams').update(updates).eq('id', id)
    fetchStreams()
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      live: 'bg-red-100 text-red-800',
      ended: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-amber-100 text-amber-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const liveStream = streams.find(s => s.status === 'live')

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Radio className="h-6 w-6 text-red-500" />
            Live Streams
          </h1>
          <p className="text-gray-500">Manage live streaming events</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold/90 text-navy">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Stream
        </Button>
      </div>

      {/* Live Now Alert */}
      {liveStream && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <div>
                  <p className="font-semibold text-red-800">Live Now: {liveStream.title}</p>
                  <p className="text-sm text-red-600">{liveStream.viewer_count} viewers</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600"
                  onClick={() => handleStatusChange(liveStream.id, 'ended')}
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Stream
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer" onClick={() => setFilter('scheduled')}>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">
              {streams.filter(s => s.status === 'scheduled').length}
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter('live')}>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Live Now</p>
            <p className="text-2xl font-bold text-red-600">
              {streams.filter(s => s.status === 'live').length}
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter('ended')}>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Past Streams</p>
            <p className="text-2xl font-bold text-gray-600">
              {streams.filter(s => s.status === 'ended').length}
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter('all')}>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Viewers (All Time)</p>
            <p className="text-2xl font-bold text-navy">
              {streams.reduce((sum, s) => sum + (s.peak_viewers || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'scheduled', 'live', 'ended'].map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f as any)}
            className={filter === f ? 'bg-navy' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Streams Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stream</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Viewers</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : streams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No streams found
                  </TableCell>
                </TableRow>
              ) : (
                streams.map(stream => (
                  <TableRow key={stream.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {stream.thumbnail_url ? (
                            <img src={stream.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-navy">{stream.title}</p>
                          {stream.stream_url && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <LinkIcon className="h-3 w-3" />
                              {stream.stream_platform}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {streamTypes.find(t => t.value === stream.stream_type)?.label || stream.stream_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(stream.scheduled_start).toLocaleDateString()}</p>
                        <p className="text-gray-500">
                          {new Date(stream.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(stream.status)}>
                        {stream.status === 'live' && (
                          <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse inline-block"></span>
                        )}
                        {stream.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {stream.viewer_count}
                        {stream.peak_viewers > 0 && (
                          <span className="text-xs text-gray-400">(peak: {stream.peak_viewers})</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {stream.status === 'scheduled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleStatusChange(stream.id, 'live')}
                            title="Go Live"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {stream.status === 'live' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleStatusChange(stream.id, 'ended')}
                            title="End Stream"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(stream)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(stream.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{editingStream ? 'Edit Stream' : 'Schedule New Stream'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Sunday Worship Service"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Stream Type</label>
                    <select
                      value={formData.stream_type}
                      onChange={(e) => setFormData({ ...formData, stream_type: e.target.value })}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      {streamTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Platform</label>
                    <select
                      value={formData.stream_platform}
                      onChange={(e) => setFormData({ ...formData, stream_platform: e.target.value })}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      {platforms.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stream URL</label>
                  <Input
                    value={formData.stream_url}
                    onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Scheduled Start</label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_start}
                      onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Scheduled End (Optional)</label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_end}
                      onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                {editingStream?.status === 'ended' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Recording URL</label>
                    <Input
                      value={formData.recording_url}
                      onChange={(e) => setFormData({ ...formData, recording_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                )}

                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.chat_enabled}
                      onChange={(e) => setFormData({ ...formData, chat_enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Enable Live Chat</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Public (Free Access)</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-navy hover:bg-navy/90">
                    {editingStream ? 'Update Stream' : 'Schedule Stream'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

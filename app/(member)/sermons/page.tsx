'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import {
  Video,
  FileText,
  Calendar,
  Clock,
  Play,
  Bookmark,
  Edit3,
  Save,
  X,
  Plus,
  ChevronRight,
  Search,
  User
} from 'lucide-react'
import Link from 'next/link'

interface Sermon {
  id: string
  title: string
  speaker: string
  sermon_date: string
  series_name?: string
  description?: string
  scripture_references?: string[]
  video_url?: string
  audio_url?: string
  thumbnail_url?: string
  duration_minutes?: number
  view_count: number
}

interface SermonNote {
  id: string
  sermon_id: string
  notes_content: string
  key_scriptures: string[]
  key_points: string[]
  action_items: string[]
  personal_application: string
  sermon: Sermon
}

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [myNotes, setMyNotes] = useState<SermonNote[]>([])
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null)
  const [editingNote, setEditingNote] = useState<SermonNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)

  const [noteForm, setNoteForm] = useState({
    notes_content: '',
    key_scriptures: [''],
    key_points: [''],
    action_items: [''],
    personal_application: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (member) {
      setMemberId(member.id)

      // Fetch my notes with sermon details
      const { data: notes } = await supabase
        .from('sermon_notes')
        .select(`
          *,
          sermon:sermons(*)
        `)
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })

      if (notes) {
        setMyNotes(notes as any)
      }
    }

    // Fetch all sermons
    const { data: sermonsData } = await supabase
      .from('sermons')
      .select('*')
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })

    if (sermonsData) {
      setSermons(sermonsData)
    }

    setLoading(false)
  }

  const startNoteForSermon = (sermon: Sermon) => {
    setSelectedSermon(sermon)
    setNoteForm({
      notes_content: '',
      key_scriptures: [''],
      key_points: [''],
      action_items: [''],
      personal_application: ''
    })
  }

  const saveNote = async () => {
    if (!memberId || !selectedSermon) return

    setSaving(true)
    const supabase = createClient()

    const noteData = {
      member_id: memberId,
      sermon_id: selectedSermon.id,
      notes_content: noteForm.notes_content,
      key_scriptures: noteForm.key_scriptures.filter(s => s.trim()),
      key_points: noteForm.key_points.filter(p => p.trim()),
      action_items: noteForm.action_items.filter(a => a.trim()),
      personal_application: noteForm.personal_application
    }

    if (editingNote) {
      await supabase
        .from('sermon_notes')
        .update(noteData)
        .eq('id', editingNote.id)
    } else {
      await supabase.from('sermon_notes').insert(noteData)
    }

    setSaving(false)
    setSelectedSermon(null)
    setEditingNote(null)
    fetchData()
  }

  const editNote = (note: SermonNote) => {
    setSelectedSermon(note.sermon)
    setEditingNote(note)
    setNoteForm({
      notes_content: note.notes_content || '',
      key_scriptures: note.key_scriptures?.length ? note.key_scriptures : [''],
      key_points: note.key_points?.length ? note.key_points : [''],
      action_items: note.action_items?.length ? note.action_items : [''],
      personal_application: note.personal_application || ''
    })
  }

  const addArrayItem = (field: 'key_scriptures' | 'key_points' | 'action_items') => {
    setNoteForm({
      ...noteForm,
      [field]: [...noteForm[field], '']
    })
  }

  const updateArrayItem = (field: 'key_scriptures' | 'key_points' | 'action_items', index: number, value: string) => {
    const newArray = [...noteForm[field]]
    newArray[index] = value
    setNoteForm({ ...noteForm, [field]: newArray })
  }

  const filteredSermons = sermons.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.series_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  // Note taking view
  if (selectedSermon) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => { setSelectedSermon(null); setEditingNote(null); }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={saveNote}
              disabled={saving}
              className="bg-navy hover:bg-navy/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>

          {/* Sermon Info */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-navy mb-2">{selectedSermon.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {selectedSermon.speaker}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedSermon.sermon_date).toLocaleDateString()}
                </span>
                {selectedSermon.series_name && (
                  <Badge variant="outline">{selectedSermon.series_name}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Note Form */}
          <div className="space-y-6">
            {/* Main Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-navy" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write your notes here..."
                  value={noteForm.notes_content}
                  onChange={(e) => setNoteForm({ ...noteForm, notes_content: e.target.value })}
                  rows={8}
                  className="font-serif"
                />
              </CardContent>
            </Card>

            {/* Key Scriptures */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Scriptures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {noteForm.key_scriptures.map((scripture, idx) => (
                  <Input
                    key={idx}
                    placeholder="e.g., John 3:16"
                    value={scripture}
                    onChange={(e) => updateArrayItem('key_scriptures', idx, e.target.value)}
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('key_scriptures')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Scripture
                </Button>
              </CardContent>
            </Card>

            {/* Key Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {noteForm.key_points.map((point, idx) => (
                  <Input
                    key={idx}
                    placeholder="What stood out to you?"
                    value={point}
                    onChange={(e) => updateArrayItem('key_points', idx, e.target.value)}
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('key_points')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Point
                </Button>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Action Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {noteForm.action_items.map((item, idx) => (
                  <Input
                    key={idx}
                    placeholder="What will you do this week?"
                    value={item}
                    onChange={(e) => updateArrayItem('action_items', idx, e.target.value)}
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('action_items')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Action
                </Button>
              </CardContent>
            </Card>

            {/* Personal Application */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Application</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="How does this apply to your life?"
                  value={noteForm.personal_application}
                  onChange={(e) => setNoteForm({ ...noteForm, personal_application: e.target.value })}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Video className="h-8 w-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Sermons & Notes</h1>
          </div>
          <p className="text-gray-600">
            Watch sermons and take notes to deepen your understanding
          </p>
        </div>

        <Tabs defaultValue="sermons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sermons">
              <Video className="h-4 w-4 mr-2" />
              Sermons
            </TabsTrigger>
            <TabsTrigger value="my-notes">
              <FileText className="h-4 w-4 mr-2" />
              My Notes ({myNotes.length})
            </TabsTrigger>
          </TabsList>

          {/* Sermons List */}
          <TabsContent value="sermons">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sermons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSermons.map((sermon) => {
                const hasNote = myNotes.some(n => n.sermon_id === sermon.id)

                return (
                  <Card key={sermon.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-navy to-navy/70 relative">
                      {sermon.thumbnail_url ? (
                        <img
                          src={sermon.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Video className="h-12 w-12 text-white/50" />
                        </div>
                      )}
                      {sermon.video_url && (
                        <a
                          href={sermon.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="h-8 w-8 text-navy ml-1" />
                          </div>
                        </a>
                      )}
                      {hasNote && (
                        <Badge className="absolute top-3 right-3 bg-green-500">
                          <Bookmark className="h-3 w-3 mr-1" />
                          Notes
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-navy line-clamp-2 mb-2">
                        {sermon.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span>{sermon.speaker}</span>
                        <span>•</span>
                        <span>{new Date(sermon.sermon_date).toLocaleDateString()}</span>
                      </div>
                      {sermon.series_name && (
                        <Badge variant="outline" className="mb-3">
                          {sermon.series_name}
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        {sermon.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {sermon.duration_minutes} min
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => startNoteForSermon(sermon)}
                        className="w-full bg-navy hover:bg-navy/90"
                        size="sm"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {hasNote ? 'View/Edit Notes' : 'Take Notes'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* My Notes */}
          <TabsContent value="my-notes">
            {myNotes.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Notes Yet
                  </h3>
                  <p className="text-gray-500">
                    Start taking notes on sermons to remember key insights
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-navy mb-2">
                        {note.sermon.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <span>{note.sermon.speaker}</span>
                        <span>•</span>
                        <span>{new Date(note.sermon.sermon_date).toLocaleDateString()}</span>
                      </div>

                      {note.notes_content && (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                          {note.notes_content}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        {note.key_points?.length > 0 && (
                          <span>{note.key_points.length} key points</span>
                        )}
                        {note.action_items?.length > 0 && (
                          <span>{note.action_items.length} actions</span>
                        )}
                      </div>

                      <Button
                        onClick={() => editNote(note)}
                        variant="outline"
                        className="w-full"
                      >
                        View Notes
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

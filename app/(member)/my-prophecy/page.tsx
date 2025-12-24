'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calendar,
  Tag,
  Headphones,
  Edit3,
  CheckCircle,
  Clock,
  Search,
  Filter,
  BookOpen,
  Sparkles,
  Loader2,
  Video,
  FileText,
  Mic,
  Play,
  ScrollText,
  HandHeart,
  MessageSquare,
  Radio,
} from 'lucide-react'
import Link from 'next/link'
import AIWritingAssistant from '@/components/member/ai-writing-assistant'
import VoicePlayer from '@/components/voice/VoicePlayer'

interface Prophecy {
  id: string
  date: string
  delivery_method: string
  title: string
  themes: string[]
  transcript: string
  audio_url?: string
  video_url?: string
  duration?: string
  member_journal?: string
  fulfillment_status: 'unfolding' | 'manifested'
  manifested_date?: string
  manifested_testimony?: string
  member_tags?: string[]
  created_at: string
}

interface VoiceMessage {
  id: string
  title: string
  description: string
  message_type: string
  audio_url: string
  audio_duration_seconds: number
  transcription: string
  is_read: boolean
  created_at: string
  sender?: {
    first_name: string
    last_name: string
  }
}

const messageTypeIcons: Record<string, any> = {
  prophetic_word: ScrollText,
  prayer: HandHeart,
  sermon: Radio,
  encouragement: Sparkles,
  message: MessageSquare,
}

const messageTypeColors: Record<string, string> = {
  prophetic_word: 'bg-purple-100 text-purple-700',
  prayer: 'bg-blue-100 text-blue-700',
  sermon: 'bg-amber-100 text-amber-700',
  encouragement: 'bg-green-100 text-green-700',
  message: 'bg-gray-100 text-gray-700',
}

export default function ProphecyVaultPage() {
  const [prophecies, setProphecies] = useState<Prophecy[]>([])
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedProphecy, setSelectedProphecy] = useState<Prophecy | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'voice' | 'written'>('voice')

  const [editFormData, setEditFormData] = useState({
    journal: '',
    fulfillmentStatus: 'unfolding' as 'unfolding' | 'manifested',
    manifestedDate: '',
    manifestedTestimony: '',
    memberTags: '',
  })

  useEffect(() => {
    fetchProphecies()
    fetchVoiceMessages()
  }, [selectedTheme, selectedStatus, searchQuery])

  const fetchVoiceMessages = async () => {
    try {
      const res = await fetch('/api/voice/admin-message')
      if (res.ok) {
        const data = await res.json()
        setVoiceMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching voice messages:', error)
    }
  }

  const markVoiceMessageRead = async (messageId: string) => {
    try {
      await fetch('/api/voice/admin-message', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action: 'markRead' })
      })
    } catch (error) {
      console.error('Error marking message read:', error)
    }
  }

  const fetchProphecies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedTheme !== 'all') params.set('theme', selectedTheme)
      if (selectedStatus !== 'all') params.set('status', selectedStatus)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/prophecy/member?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProphecies(data.prophecies || [])
      }
    } catch (error) {
      console.error('Error fetching prophecies:', error)
    } finally {
      setLoading(false)
    }
  }

  // Extract all unique themes from prophecies
  const allThemes = Array.from(
    new Set(prophecies.flatMap((p) => p.themes || []))
  ).sort()

  const allMemberTags = Array.from(
    new Set(prophecies.flatMap((p) => p.member_tags || []))
  )

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'unfolding', label: 'Unfolding' },
    { value: 'manifested', label: 'Manifested' },
  ]

  const handleEdit = (prophecy: Prophecy) => {
    setSelectedProphecy(prophecy)
    setEditFormData({
      journal: prophecy.member_journal || '',
      fulfillmentStatus: prophecy.fulfillment_status || 'unfolding',
      manifestedDate: prophecy.manifested_date || '',
      manifestedTestimony: prophecy.manifested_testimony || '',
      memberTags: prophecy.member_tags?.join(', ') || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedProphecy) return

    setSaving(true)
    try {
      const response = await fetch('/api/prophecy/tracking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prophecy_id: selectedProphecy.id,
          member_journal: editFormData.journal,
          fulfillment_status: editFormData.fulfillmentStatus,
          manifested_date: editFormData.manifestedDate || null,
          manifested_testimony: editFormData.manifestedTestimony,
          member_tags: editFormData.memberTags,
        })
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        fetchProphecies() // Refresh the list
      } else {
        console.error('Failed to save prophecy tracking')
      }
    } catch (error) {
      console.error('Error saving prophecy tracking:', error)
    } finally {
      setSaving(false)
    }
  }

  const stats = {
    total: prophecies.length,
    unfolding: prophecies.filter((p) => p.fulfillment_status === 'unfolding').length,
    manifested: prophecies.filter((p) => p.fulfillment_status === 'manifested').length,
    voiceMessages: voiceMessages.length,
    unreadVoice: voiceMessages.filter((v) => !v.is_read).length,
  }

  if (loading && prophecies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-gold" />
          <h1 className="text-3xl font-bold text-navy">My Prophecy Vault</h1>
        </div>
        <p className="text-muted-foreground">
          Your personal collection of prophetic words and their fulfillment journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{stats.voiceMessages}</div>
            {stats.unreadVoice > 0 && (
              <p className="text-xs text-purple-600 mt-1">{stats.unreadVoice} new</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Written Prophecies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unfolding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">{stats.unfolding}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Manifested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.manifested}</div>
            <p className="text-xs text-muted-foreground mt-1">Fulfilled</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'voice'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mic className="h-4 w-4" />
          Voice Messages
          {stats.unreadVoice > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
              {stats.unreadVoice}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('written')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'written'
              ? 'border-navy text-navy'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="h-4 w-4" />
          Written Prophecies
        </button>
      </div>

      {/* Voice Messages Tab */}
      {activeTab === 'voice' && (
        <div className="space-y-4">
          {voiceMessages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Mic className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No voice messages yet</p>
                <p className="text-muted-foreground">
                  When Prophet Lorenzo sends you a personal message, it will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            voiceMessages.map((message) => {
              const Icon = messageTypeIcons[message.message_type] || MessageSquare
              const colorClass = messageTypeColors[message.message_type] || 'bg-gray-100 text-gray-700'

              return (
                <Card
                  key={message.id}
                  className={`overflow-hidden transition-all ${
                    !message.is_read ? 'ring-2 ring-purple-400 bg-purple-50/30' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                            {message.message_type.replace('_', ' ')}
                          </span>
                          {!message.is_read && (
                            <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs">
                              New
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {message.title && (
                          <h3 className="text-lg font-semibold text-navy mb-2">{message.title}</h3>
                        )}

                        {message.description && (
                          <p className="text-muted-foreground text-sm mb-4">{message.description}</p>
                        )}

                        <VoicePlayer
                          audioUrl={message.audio_url}
                          duration={message.audio_duration_seconds}
                          onPlay={() => {
                            if (!message.is_read) {
                              markVoiceMessageRead(message.id)
                              setVoiceMessages(prev =>
                                prev.map(m => m.id === message.id ? { ...m, is_read: true } : m)
                              )
                            }
                          }}
                        />

                        {message.transcription && (
                          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-navy" />
                              <h4 className="text-sm font-semibold text-navy">Transcript</h4>
                            </div>
                            <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">
                              {message.transcription}
                            </p>
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
      )}

      {/* Written Prophecies Tab */}
      {activeTab === 'written' && (
        <>
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search prophecies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <select
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                  >
                    <option value="all">All Themes</option>
                    {allThemes.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:w-48">
                  <select
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tag Cloud */}
              {allMemberTags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {allMemberTags.map((tag) => (
                      <button
                        key={tag}
                        className="px-3 py-1 bg-gold/20 text-gold rounded-full text-xs font-medium hover:bg-gold/30 transition-colors"
                        onClick={() => setSearchQuery(tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Writing Assistant */}
          <AIWritingAssistant
            mode="reflection"
            placeholder="Reflect on a prophetic word..."
          />

          {/* Prophecies Timeline */}
          {prophecies.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No prophecies yet</p>
                <p className="text-muted-foreground mb-4">
                  When you receive personal prophetic words, they will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {prophecies.map((prophecy) => (
                <Card key={prophecy.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-navy/5 to-gold/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              prophecy.fulfillment_status === 'manifested'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gold/20 text-gold'
                            }`}
                          >
                            {prophecy.fulfillment_status === 'manifested' ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Manifested
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Unfolding
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(prophecy.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          {prophecy.delivery_method && (
                            <span className="text-sm text-muted-foreground">
                              via {prophecy.delivery_method}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-xl text-navy">{prophecy.title}</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(prophecy)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-4">
                    {/* Media */}
                    {prophecy.video_url && (
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <iframe
                          src={prophecy.video_url}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}
                    {prophecy.audio_url && !prophecy.video_url && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Headphones className="h-4 w-4 text-navy" />
                          <span className="text-sm font-medium">Audio Recording</span>
                          {prophecy.duration && (
                            <span className="text-xs text-muted-foreground">({prophecy.duration})</span>
                          )}
                        </div>
                        <audio controls className="w-full">
                          <source src={prophecy.audio_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    {/* Transcript */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-4 w-4 text-navy" />
                        <h4 className="font-semibold text-navy">Transcript</h4>
                      </div>
                      <p className="text-muted-foreground leading-relaxed italic whitespace-pre-wrap">
                        {prophecy.transcript}
                      </p>
                    </div>

                    {/* Themes */}
                    {prophecy.themes && prophecy.themes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Themes</h4>
                        <div className="flex flex-wrap gap-2">
                          {prophecy.themes.map((theme) => (
                            <span
                              key={theme}
                              className="px-2 py-1 bg-navy/10 text-navy rounded text-xs"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Member Tags */}
                    {prophecy.member_tags && prophecy.member_tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">My Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {prophecy.member_tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gold/20 text-gold rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Journal */}
                    {prophecy.member_journal && (
                      <div className="bg-gold/5 p-4 rounded-lg border-l-4 border-gold">
                        <h4 className="text-sm font-semibold text-navy mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          My Journal
                        </h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{prophecy.member_journal}</p>
                      </div>
                    )}

                    {/* Manifestation Testimony */}
                    {prophecy.fulfillment_status === 'manifested' && prophecy.manifested_testimony && (
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Manifestation Testimony
                        </h4>
                        <p className="text-muted-foreground mb-2 whitespace-pre-wrap">
                          {prophecy.manifested_testimony}
                        </p>
                        {prophecy.manifested_date && (
                          <p className="text-sm text-green-600">
                            Manifested on{' '}
                            {new Date(prophecy.manifested_date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Journal Link */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/journal?prophecy=${prophecy.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="h-4 w-4" />
                          Journal About This
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-navy">Edit Prophecy Tracking</DialogTitle>
            <DialogDescription>
              Update your journal, fulfillment status, and personal tags
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Journal */}
            <div className="space-y-2">
              <Label htmlFor="journal">My Journal</Label>
              <textarea
                id="journal"
                className="w-full min-h-[120px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Record your thoughts, prayers, and observations about this prophecy..."
                value={editFormData.journal}
                onChange={(e) => setEditFormData({ ...editFormData, journal: e.target.value })}
              />
            </div>

            {/* Fulfillment Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Fulfillment Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={editFormData.fulfillmentStatus}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    fulfillmentStatus: e.target.value as 'unfolding' | 'manifested'
                  })
                }
              >
                <option value="unfolding">Unfolding</option>
                <option value="manifested">Manifested</option>
              </select>
            </div>

            {/* Manifested Fields */}
            {editFormData.fulfillmentStatus === 'manifested' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="manifestedDate">Manifestation Date</Label>
                  <Input
                    id="manifestedDate"
                    type="date"
                    value={editFormData.manifestedDate}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, manifestedDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testimony">Manifestation Testimony</Label>
                  <textarea
                    id="testimony"
                    className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Share how this prophecy was fulfilled..."
                    value={editFormData.manifestedTestimony}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, manifestedTestimony: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            {/* Member Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">My Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="business, breakthrough, healing"
                value={editFormData.memberTags}
                onChange={(e) => setEditFormData({ ...editFormData, memberTags: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Add personal tags to help you find and organize your prophecies
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

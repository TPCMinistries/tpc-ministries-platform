'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  BookOpen,
  Sparkles,
  Loader2,
  Video,
  FileText,
  Mic,
  ScrollText,
  HandHeart,
  MessageSquare,
  Radio,
  ChevronRight,
  Star,
  Quote,
  Volume2,
  Play,
  Pause,
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

const messageTypeGradients: Record<string, string> = {
  prophetic_word: 'from-purple-500 to-indigo-600',
  prayer: 'from-blue-500 to-cyan-600',
  sermon: 'from-amber-500 to-orange-600',
  encouragement: 'from-emerald-500 to-teal-600',
  message: 'from-gray-500 to-slate-600',
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
  const [expandedVoiceMessage, setExpandedVoiceMessage] = useState<string | null>(null)

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

  const allThemes = Array.from(
    new Set(prophecies.flatMap((p) => p.themes || []))
  ).sort()

  const allMemberTags = Array.from(
    new Set(prophecies.flatMap((p) => p.member_tags || []))
  )

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
        fetchProphecies()
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return formatDate(dateString)
  }

  if (loading && prophecies.length === 0 && voiceMessages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your prophecy vault...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-purple-200">Your Sacred Collection</p>
                    <h1 className="text-3xl font-bold">My Prophecy Vault</h1>
                  </div>
                </div>
                <p className="text-purple-200 mt-2 max-w-md">
                  Personal prophetic words spoken over your life and their fulfillment journey.
                </p>
              </div>

              {stats.unreadVoice > 0 && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Mic className="h-5 w-5 text-purple-900" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-200">New Messages</p>
                    <p className="text-2xl font-bold">{stats.unreadVoice}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Voice Messages</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.voiceMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Written Words</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unfolding</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unfolding}</p>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manifested</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.manifested}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Mic className="h-4 w-4" />
            Voice Messages
            {stats.unreadVoice > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'voice' ? 'bg-white/20' : 'bg-purple-600 text-white'
              }`}>
                {stats.unreadVoice}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('written')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'written'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
              <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 mx-auto mb-6 flex items-center justify-center">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Voice Messages Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    When Prophet Lorenzo sends you a personal voice message, it will appear here for you to listen and revisit.
                  </p>
                </CardContent>
              </Card>
            ) : (
              voiceMessages.map((message) => {
                const Icon = messageTypeIcons[message.message_type] || MessageSquare
                const gradient = messageTypeGradients[message.message_type] || 'from-gray-500 to-slate-600'
                const isExpanded = expandedVoiceMessage === message.id

                return (
                  <Card
                    key={message.id}
                    className={`bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm hover:shadow-lg transition-all ${
                      !message.is_read ? 'ring-2 ring-purple-400 ring-offset-2' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center flex-shrink-0 ${
                          !message.is_read ? 'animate-pulse' : ''
                        }`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className={`bg-gradient-to-r ${gradient} text-white border-0`}>
                              {message.message_type.replace('_', ' ')}
                            </Badge>
                            {!message.is_read && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0">
                                New
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {getTimeAgo(message.created_at)}
                            </span>
                          </div>

                          {message.title && (
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {message.title}
                            </h3>
                          )}

                          {message.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                              {message.description}
                            </p>
                          )}

                          <div className="mb-4">
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
                          </div>

                          {message.transcription && (
                            <button
                              onClick={() => setExpandedVoiceMessage(isExpanded ? null : message.id)}
                              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              {isExpanded ? 'Hide Transcript' : 'Show Transcript'}
                              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          )}

                          {isExpanded && message.transcription && (
                            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                              <Quote className="h-6 w-6 text-purple-300 dark:text-purple-700 mb-2" />
                              <p className="text-gray-700 dark:text-gray-300 italic whitespace-pre-wrap">
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
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search prophecies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/80 dark:bg-slate-700/80 border-0"
                    />
                  </div>
                  <select
                    className="px-3 py-2 bg-white/80 dark:bg-slate-700/80 border-0 rounded-md shadow-sm"
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                  >
                    <option value="all">All Themes</option>
                    {allThemes.map((theme) => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 bg-white/80 dark:bg-slate-700/80 border-0 rounded-md shadow-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="unfolding">Unfolding</option>
                    <option value="manifested">Manifested</option>
                  </select>
                </div>

                {allMemberTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Your Tags:</span>
                    {allMemberTags.map((tag) => (
                      <button
                        key={tag}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                        onClick={() => setSearchQuery(tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Writing Assistant */}
            <AIWritingAssistant
              mode="reflection"
              placeholder="Reflect on a prophetic word..."
            />

            {/* Prophecies List */}
            {prophecies.length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto mb-6 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Written Prophecies Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    When you receive personal prophetic words, they will appear here for you to track and journal about.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {prophecies.map((prophecy) => (
                  <Card key={prophecy.id} className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          prophecy.fulfillment_status === 'manifested'
                            ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                            : 'bg-gradient-to-r from-amber-400 to-orange-500'
                        }`}>
                          {prophecy.fulfillment_status === 'manifested' ? (
                            <CheckCircle className="h-6 w-6 text-white" />
                          ) : (
                            <Clock className="h-6 w-6 text-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge className={
                                  prophecy.fulfillment_status === 'manifested'
                                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white border-0'
                                    : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0'
                                }>
                                  {prophecy.fulfillment_status === 'manifested' ? 'Manifested' : 'Unfolding'}
                                </Badge>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(prophecy.date)}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {prophecy.title}
                              </h3>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(prophecy)}
                              className="gap-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </Button>
                          </div>

                          {/* Media */}
                          {prophecy.audio_url && !prophecy.video_url && (
                            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-xl mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Volume2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Audio Recording</span>
                              </div>
                              <audio controls className="w-full">
                                <source src={prophecy.audio_url} type="audio/mpeg" />
                              </audio>
                            </div>
                          )}

                          {/* Transcript Preview */}
                          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl mb-4">
                            <Quote className="h-5 w-5 text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-gray-700 dark:text-gray-300 italic line-clamp-3">
                              {prophecy.transcript}
                            </p>
                          </div>

                          {/* Themes */}
                          {prophecy.themes && prophecy.themes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {prophecy.themes.map((theme) => (
                                <Badge key={theme} variant="outline" className="text-xs">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Member Journal Preview */}
                          {prophecy.member_journal && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-400 p-4 rounded-r-xl mb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">My Journal</span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                                {prophecy.member_journal}
                              </p>
                            </div>
                          )}

                          {/* Manifestation Testimony */}
                          {prophecy.fulfillment_status === 'manifested' && prophecy.manifested_testimony && (
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-400 p-4 rounded-r-xl mb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Testimony</span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                                {prophecy.manifested_testimony}
                              </p>
                              {prophecy.manifested_date && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                  Manifested on {formatDate(prophecy.manifested_date)}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <Link href={`/journal?prophecy=${prophecy.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50">
                              <FileText className="h-4 w-4" />
                              Journal About This
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900 dark:text-white">Edit Prophecy Tracking</DialogTitle>
              <DialogDescription>
                Update your journal, fulfillment status, and personal tags
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="journal">My Journal</Label>
                <textarea
                  id="journal"
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none dark:bg-slate-800 dark:border-slate-700"
                  placeholder="Record your thoughts, prayers, and observations about this prophecy..."
                  value={editFormData.journal}
                  onChange={(e) => setEditFormData({ ...editFormData, journal: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Fulfillment Status</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-700"
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
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testimony">Manifestation Testimony</Label>
                    <textarea
                      id="testimony"
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none dark:bg-slate-800 dark:border-slate-700"
                      placeholder="Share how this prophecy was fulfilled..."
                      value={editFormData.manifestedTestimony}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, manifestedTestimony: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="tags">My Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="business, breakthrough, healing"
                  value={editFormData.memberTags}
                  onChange={(e) => setEditFormData({ ...editFormData, memberTags: e.target.value })}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add personal tags to help you find and organize your prophecies
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={saving}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
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
    </div>
  )
}

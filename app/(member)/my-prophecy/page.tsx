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
} from 'lucide-react'
import Link from 'next/link'
import AIWritingAssistant from '@/components/member/ai-writing-assistant'

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

export default function ProphecyVaultPage() {
  const [prophecies, setProphecies] = useState<Prophecy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedProphecy, setSelectedProphecy] = useState<Prophecy | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editFormData, setEditFormData] = useState({
    journal: '',
    fulfillmentStatus: 'unfolding' as 'unfolding' | 'manifested',
    manifestedDate: '',
    manifestedTestimony: '',
    memberTags: '',
  })

  useEffect(() => {
    fetchProphecies()
  }, [selectedTheme, selectedStatus, searchQuery])

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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Prophecies
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

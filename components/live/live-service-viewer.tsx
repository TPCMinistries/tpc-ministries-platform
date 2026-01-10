'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Play,
  Users,
  MessageSquare,
  FileText,
  Heart,
  Send,
  Clock,
  Radio,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface LiveService {
  id: string
  title: string
  description?: string
  service_type: string
  scheduled_start: string
  stream_url?: string
  chat_enabled: boolean
  notes_enabled: boolean
  giving_prompt_enabled: boolean
  poll_enabled: boolean
  status: 'scheduled' | 'live' | 'ended'
  current_attendees?: number
  user_attending?: boolean
  active_poll?: {
    id: string
    question: string
    options: string[]
  }
}

interface ServiceNote {
  id: string
  content: string
  timestamp_seconds?: number
  created_at: string
}

export function LiveServiceViewer() {
  const [service, setService] = useState<LiveService | null>(null)
  const [notes, setNotes] = useState<ServiceNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notesExpanded, setNotesExpanded] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchService = useCallback(async () => {
    try {
      const res = await fetch('/api/live/service')
      const data = await res.json()
      setService(data.service)
      setIsJoined(data.service?.user_attending || false)
    } catch (error) {
      console.error('Error fetching service:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchNotes = useCallback(async () => {
    if (!service?.id) return
    try {
      const res = await fetch(`/api/live/notes?service_id=${service.id}`)
      const data = await res.json()
      setNotes(data.notes || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }, [service?.id])

  useEffect(() => {
    fetchService()
    // Refresh service info every 30 seconds
    const interval = setInterval(fetchService, 30000)
    return () => clearInterval(interval)
  }, [fetchService])

  useEffect(() => {
    if (service?.id) {
      fetchNotes()
    }
  }, [service?.id, fetchNotes])

  const handleJoinLeave = async () => {
    if (!service) return

    try {
      const res = await fetch('/api/live/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          action: isJoined ? 'leave' : 'join',
          device_type: 'web'
        })
      })

      if (res.ok) {
        setIsJoined(!isJoined)
        fetchService()
      }
    } catch (error) {
      console.error('Error joining/leaving:', error)
    }
  }

  const handleSaveNote = async () => {
    if (!service || !newNote.trim()) return

    setSaving(true)
    try {
      const res = await fetch('/api/live/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          content: newNote
        })
      })

      if (res.ok) {
        setNewNote('')
        fetchNotes()
      }
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Radio className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Live Service</h3>
          <p className="text-muted-foreground text-center">
            There are no live or upcoming services at this time.
            Check back later!
          </p>
        </CardContent>
      </Card>
    )
  }

  const isLive = service.status === 'live'
  const isScheduled = service.status === 'scheduled'
  const scheduledDate = new Date(service.scheduled_start)

  return (
    <div className="space-y-4">
      {/* Service Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isLive ? (
                  <Badge variant="destructive" className="animate-pulse">
                    <Radio className="h-3 w-3 mr-1" /> LIVE
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" /> Upcoming
                  </Badge>
                )}
                <Badge variant="outline">{service.service_type}</Badge>
              </div>
              <CardTitle>{service.title}</CardTitle>
              <CardDescription>
                {isScheduled
                  ? `Starts ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : service.description
                }
              </CardDescription>
            </div>
            <Button
              onClick={handleJoinLeave}
              variant={isJoined ? "outline" : "default"}
            >
              {isJoined ? 'Leave' : 'Join Service'}
            </Button>
          </div>
        </CardHeader>

        {isLive && (
          <CardContent>
            {/* Video Player Placeholder */}
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
              {service.stream_url ? (
                <iframe
                  src={service.stream_url}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              ) : (
                <div className="text-white text-center">
                  <Play className="h-16 w-16 mx-auto mb-2 opacity-50" />
                  <p className="opacity-50">Stream loading...</p>
                </div>
              )}
            </div>

            {/* Live Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {service.current_attendees || 0} watching
                </span>
                {service.chat_enabled && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Chat enabled
                  </span>
                )}
              </div>
              {service.giving_prompt_enabled && (
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Give Now
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notes Section */}
      {service.notes_enabled && isJoined && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setNotesExpanded(!notesExpanded)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sermon Notes
              </CardTitle>
              {notesExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </CardHeader>

          {notesExpanded && (
            <CardContent className="space-y-4">
              {/* New Note Input */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Take notes during the service..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleSaveNote}
                  disabled={!newNote.trim() || saving}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Note'}
                </Button>
              </div>

              {/* Previous Notes */}
              {notes.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Your Notes ({notes.length})
                  </h4>
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-muted rounded-lg text-sm"
                    >
                      <p className="whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(note.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Active Poll */}
      {service.active_poll && isJoined && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Poll</CardTitle>
            <CardDescription>{service.active_poll.question}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {service.active_poll.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

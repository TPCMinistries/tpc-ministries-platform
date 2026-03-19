'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageSquare, Plus, Megaphone, ClipboardList, Send } from 'lucide-react'
import type { Announcement } from '../../_components/types'

interface ActionItem {
  id: string
  trip_id: string
  label: string
  category: string
  assigned_to: string | null
  status: string
  due_date: string | null
  notes: string | null
  created_at: string
}

interface TabCommsProps {
  announcements: Announcement[]
  actionItems: ActionItem[]
  track: string
  createAnnouncement: (title: string, content: string, priority: string) => Promise<boolean>
}

export function TabComms({ announcements, actionItems, track, createAnnouncement }: TabCommsProps) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState('normal')
  const [submitting, setSubmitting] = useState(false)

  // Filter announcements relevant to this track
  const relevantAnnouncements = announcements.filter(
    a => a.target_audience === 'all' || a.target_audience === track || a.target_audience === 'delegates'
  )

  // Filter action items relevant to this track
  const relevantActions = actionItems.filter(
    a => !a.assigned_to || a.assigned_to === track || a.assigned_to === 'all'
  )

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return

    setSubmitting(true)
    const success = await createAnnouncement(title.trim(), content.trim(), priority)
    if (success) {
      setTitle('')
      setContent('')
      setPriority('normal')
      setShowForm(false)
    }
    setSubmitting(false)
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'important': return 'bg-amber-100 text-amber-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Announcement */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-navy flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Track Announcements
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? 'outline' : 'default'}
            >
              <Plus className="h-4 w-4 mr-1" />
              {showForm ? 'Cancel' : 'New Announcement'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-500">
                This announcement will be visible to {track} track delegates.
              </p>
              <Input
                placeholder="Announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Announcement content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
              <div className="flex items-center gap-3">
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim() || !content.trim()}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {submitting ? 'Posting...' : 'Post Announcement'}
                </Button>
              </div>
            </div>
          )}

          {/* Announcements List */}
          {relevantAnnouncements.length === 0 ? (
            <p className="text-sm text-gray-500">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {relevantAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-lg border ${
                    ann.is_pinned ? 'bg-amber-50 border-amber-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-navy text-sm">{ann.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(ann.priority)}`}>
                        {ann.priority}
                      </Badge>
                      {ann.is_pinned && (
                        <Badge className="bg-amber-100 text-amber-800 text-xs">Pinned</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {ann.target_audience === 'all' ? 'Everyone' : ann.target_audience}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(ann.publish_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Items (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-navy flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Action Items
            <Badge variant="outline" className="text-xs">Read Only</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relevantActions.length === 0 ? (
            <p className="text-sm text-gray-500">No action items assigned.</p>
          ) : (
            <div className="space-y-2">
              {relevantActions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.category && (
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      )}
                      {item.due_date && (
                        <span className="text-xs text-gray-500">
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                    )}
                  </div>
                  <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                    {item.status?.replace('_', ' ') || 'pending'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

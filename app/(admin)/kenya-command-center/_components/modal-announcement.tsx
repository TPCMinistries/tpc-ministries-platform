'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'
import { serviceTracks } from './constants'

interface ModalAnnouncementProps {
  show: boolean
  onClose: () => void
  newAnnouncement: {
    title: string
    content: string
    priority: string
    target_audience: string
  }
  setNewAnnouncement: (ann: ModalAnnouncementProps['newAnnouncement']) => void
  onSubmit: () => void
}

export function ModalAnnouncement({
  show, onClose, newAnnouncement, setNewAnnouncement, onSubmit,
}: ModalAnnouncementProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-navy">New Announcement</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              placeholder="Announcement title"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              placeholder="Write your announcement..."
              rows={4}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 mt-1"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <Label>Audience</Label>
              <select
                value={newAnnouncement.target_audience}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target_audience: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 mt-1"
              >
                <option value="all">All Team</option>
                <option value="leaders">Leaders Only</option>
                {serviceTracks.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-navy hover:bg-navy/90" onClick={onSubmit}>
              Post Announcement
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

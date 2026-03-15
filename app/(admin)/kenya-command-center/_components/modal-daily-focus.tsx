'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'

interface ModalDailyFocusProps {
  show: boolean
  onClose: () => void
  newDailyFocus: {
    focus_date: string
    phase: string
    theme: string
    scripture_reference: string
    scripture_text: string
    prayer_focus: string
    leadership_notes: string
  }
  setNewDailyFocus: (df: ModalDailyFocusProps['newDailyFocus']) => void
  onSubmit: () => void
}

export function ModalDailyFocus({
  show, onClose, newDailyFocus, setNewDailyFocus, onSubmit,
}: ModalDailyFocusProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-navy">Add Prayer Focus Day</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newDailyFocus.focus_date}
                onChange={(e) => setNewDailyFocus({ ...newDailyFocus, focus_date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phase</Label>
              <select
                value={newDailyFocus.phase}
                onChange={(e) => setNewDailyFocus({ ...newDailyFocus, phase: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 mt-1"
              >
                <option value="pre_trip">Pre-Trip</option>
                <option value="during_trip">During Trip</option>
                <option value="post_trip">Post-Trip</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Theme</Label>
            <Input
              value={newDailyFocus.theme}
              onChange={(e) => setNewDailyFocus({ ...newDailyFocus, theme: e.target.value })}
              placeholder="e.g., Unity, Boldness, Healing"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Scripture Reference</Label>
            <Input
              value={newDailyFocus.scripture_reference}
              onChange={(e) => setNewDailyFocus({ ...newDailyFocus, scripture_reference: e.target.value })}
              placeholder="e.g., Philippians 4:13"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Scripture Text</Label>
            <Textarea
              value={newDailyFocus.scripture_text}
              onChange={(e) => setNewDailyFocus({ ...newDailyFocus, scripture_text: e.target.value })}
              placeholder="The verse text..."
              rows={2}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Prayer Focus</Label>
            <Textarea
              value={newDailyFocus.prayer_focus}
              onChange={(e) => setNewDailyFocus({ ...newDailyFocus, prayer_focus: e.target.value })}
              placeholder="What to pray for today..."
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Leadership Notes (optional)</Label>
            <Textarea
              value={newDailyFocus.leadership_notes}
              onChange={(e) => setNewDailyFocus({ ...newDailyFocus, leadership_notes: e.target.value })}
              placeholder="Notes for team leaders..."
              rows={2}
              className="mt-1"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-navy hover:bg-navy/90" onClick={onSubmit}>
              Add Focus Day
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

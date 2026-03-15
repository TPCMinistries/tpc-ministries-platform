'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  UserPlus, Plus, Trash2, ArrowRight, X
} from 'lucide-react'
import type { WaitingListEntry } from './types'

interface TabPipelineProps {
  waitingList: WaitingListEntry[]
  addWaitingListEntry: (entry: Omit<WaitingListEntry, 'id' | 'trip_id' | 'created_at' | 'promoted_to_participant_id'>) => void
  updateWaitingListEntry: (id: string, updates: Partial<WaitingListEntry>) => void
  deleteWaitingListEntry: (id: string) => void
  promoteToDelegate: (entry: WaitingListEntry) => void
}

export function TabPipeline({
  waitingList, addWaitingListEntry, updateWaitingListEntry,
  deleteWaitingListEntry, promoteToDelegate,
}: TabPipelineProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: 'website',
    interest_level: 'medium',
    status: 'new',
    follow_up_date: '',
    follow_up_notes: '',
    notes: '',
  })

  const handleAdd = () => {
    if (!newEntry.first_name || !newEntry.last_name || !newEntry.email) return
    addWaitingListEntry(newEntry)
    setNewEntry({
      first_name: '', last_name: '', email: '', phone: '',
      source: 'website', interest_level: 'medium', status: 'new',
      follow_up_date: '', follow_up_notes: '', notes: '',
    })
    setShowAddForm(false)
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    interested: 'bg-purple-100 text-purple-800',
    committed: 'bg-green-100 text-green-800',
    promoted: 'bg-gold/20 text-gold-dark',
    declined: 'bg-red-100 text-red-800',
  }

  const interestColors: Record<string, string> = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
  }

  const isOverdue = (date: string | null) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  // Pipeline stats
  const pipelineStats = [
    { status: 'new', label: 'New', count: waitingList.filter(w => w.status === 'new').length },
    { status: 'contacted', label: 'Contacted', count: waitingList.filter(w => w.status === 'contacted').length },
    { status: 'interested', label: 'Interested', count: waitingList.filter(w => w.status === 'interested').length },
    { status: 'committed', label: 'Committed', count: waitingList.filter(w => w.status === 'committed').length },
    { status: 'promoted', label: 'Promoted', count: waitingList.filter(w => w.status === 'promoted').length },
  ]

  return (
    <div className="space-y-6">
      {/* Pipeline Funnel */}
      <div className="grid grid-cols-5 gap-3">
        {pipelineStats.map((s, idx) => (
          <Card key={s.status}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-3xl font-bold text-navy">{s.count}</p>
              <p className="text-xs text-gray-600">{s.label}</p>
              {idx < pipelineStats.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-300 absolute right-[-14px] top-1/2 -translate-y-1/2 hidden md:block" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prospects Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Prospect Pipeline
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Prospect
          </Button>
        </CardHeader>
        <CardContent>
          {waitingList.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No prospects in pipeline yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Name</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Email</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Source</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Interest</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Status</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Follow-up</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingList.map(entry => (
                    <tr key={entry.id} className={`border-b hover:bg-gray-50 ${
                      isOverdue(entry.follow_up_date) && entry.status !== 'promoted' && entry.status !== 'declined'
                        ? 'bg-red-50/50' : ''
                    }`}>
                      <td className="p-3 text-sm font-medium">{entry.first_name} {entry.last_name}</td>
                      <td className="p-3 text-sm text-gray-600">{entry.email}</td>
                      <td className="p-3 text-sm capitalize">{entry.source}</td>
                      <td className="p-3">
                        <Badge className={`text-xs ${interestColors[entry.interest_level] || ''}`}>
                          {entry.interest_level}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <select
                          value={entry.status}
                          onChange={(e) => updateWaitingListEntry(entry.id, { status: e.target.value })}
                          className="border rounded px-2 py-1 text-xs"
                          disabled={entry.status === 'promoted'}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="interested">Interested</option>
                          <option value="committed">Committed</option>
                          <option value="promoted">Promoted</option>
                          <option value="declined">Declined</option>
                        </select>
                      </td>
                      <td className="p-3 text-sm">
                        {entry.follow_up_date ? (
                          <span className={isOverdue(entry.follow_up_date) && entry.status !== 'promoted' && entry.status !== 'declined' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {new Date(entry.follow_up_date).toLocaleDateString()}
                            {isOverdue(entry.follow_up_date) && entry.status !== 'promoted' && entry.status !== 'declined' && ' (overdue)'}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {entry.status === 'committed' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-xs h-7"
                              onClick={() => promoteToDelegate(entry)}
                            >
                              Promote
                            </Button>
                          )}
                          {entry.status !== 'promoted' && (
                            <Button
                              size="sm" variant="ghost" className="text-red-500 h-7 w-7 p-0"
                              onClick={() => deleteWaitingListEntry(entry.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Prospect Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-navy">Add Prospect</h2>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={newEntry.first_name}
                    onChange={(e) => setNewEntry({ ...newEntry, first_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={newEntry.last_name}
                    onChange={(e) => setNewEntry({ ...newEntry, last_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newEntry.email}
                    onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newEntry.phone}
                    onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Source</Label>
                  <select
                    value={newEntry.source}
                    onChange={(e) => setNewEntry({ ...newEntry, source: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="church">Church</option>
                    <option value="social_media">Social Media</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Interest Level</Label>
                  <select
                    value={newEntry.interest_level}
                    onChange={(e) => setNewEntry({ ...newEntry, interest_level: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <Label>Follow-up Date</Label>
                  <Input
                    type="date"
                    value={newEntry.follow_up_date}
                    onChange={(e) => setNewEntry({ ...newEntry, follow_up_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button className="flex-1 bg-navy hover:bg-navy/90" onClick={handleAdd}>Add Prospect</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

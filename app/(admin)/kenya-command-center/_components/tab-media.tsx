'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Camera, Plus, Trash2, CheckCircle, X
} from 'lucide-react'
import type { Trip, MediaCalendarItem, MediaAssignment, ShotListItem } from './types'

interface TabMediaProps {
  trip: Trip
  mediaCalendar: MediaCalendarItem[]
  mediaAssignments: MediaAssignment[]
  shotList: ShotListItem[]
  addMediaCalendarItem: (item: Omit<MediaCalendarItem, 'id' | 'trip_id'>) => void
  updateMediaCalendarItem: (id: string, updates: Partial<MediaCalendarItem>) => void
  deleteMediaCalendarItem: (id: string) => void
  addMediaAssignment: (assignment: Omit<MediaAssignment, 'id' | 'trip_id'>) => void
  deleteMediaAssignment: (id: string) => void
  addShotListItem: (item: Omit<ShotListItem, 'id' | 'trip_id' | 'is_captured'>) => void
  toggleShotCaptured: (id: string, currentlyCaptured: boolean) => void
  deleteShotListItem: (id: string) => void
}

export function TabMedia({
  mediaCalendar, mediaAssignments, shotList,
  addMediaCalendarItem, updateMediaCalendarItem, deleteMediaCalendarItem,
  addShotListItem, toggleShotCaptured, deleteShotListItem,
}: TabMediaProps) {
  const [showCalendarForm, setShowCalendarForm] = useState(false)
  const [showShotForm, setShowShotForm] = useState(false)
  const [platformFilter, setPlatformFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const [newCalendarItem, setNewCalendarItem] = useState({
    post_date: '',
    platform: 'instagram',
    content_type: 'photo',
    title: '',
    description: '',
    assigned_to: '',
    status: 'planned',
    asset_url: '',
  })

  const [newShot, setNewShot] = useState({
    description: '',
    location: '',
    priority: 'medium',
    captured_by: '',
    asset_url: '',
    notes: '',
  })

  const filteredCalendar = mediaCalendar.filter(item => {
    if (platformFilter !== 'all' && item.platform !== platformFilter) return false
    return true
  })

  const filteredShots = shotList.filter(shot => {
    if (priorityFilter !== 'all' && shot.priority !== priorityFilter) return false
    return true
  })

  const handleAddCalendarItem = () => {
    if (!newCalendarItem.title || !newCalendarItem.post_date) return
    addMediaCalendarItem(newCalendarItem)
    setNewCalendarItem({
      post_date: '', platform: 'instagram', content_type: 'photo',
      title: '', description: '', assigned_to: '', status: 'planned', asset_url: '',
    })
    setShowCalendarForm(false)
  }

  const handleAddShot = () => {
    if (!newShot.description) return
    addShotListItem(newShot)
    setNewShot({ description: '', location: '', priority: 'medium', captured_by: '', asset_url: '', notes: '' })
    setShowShotForm(false)
  }

  const platformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-pink-100 text-pink-800',
      facebook: 'bg-blue-100 text-blue-800',
      youtube: 'bg-red-100 text-red-800',
      tiktok: 'bg-gray-900 text-white',
      twitter: 'bg-sky-100 text-sky-800',
      website: 'bg-green-100 text-green-800',
    }
    return colors[platform] || 'bg-gray-100 text-gray-800'
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      planned: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      ready: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      needs_review: 'bg-amber-100 text-amber-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const statusSelectClass = (status: string) => {
    const base = 'border-0 rounded-full px-3 py-1 text-xs font-medium cursor-pointer appearance-none pr-6'
    return `${base} ${statusBadge(status)}`
  }

  return (
    <div className="space-y-8">
      {/* Daily Content Drop Zone */}
      <Card className="border-pink-200 bg-pink-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <span className="text-3xl">📸</span>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-pink-900 mb-1">Daily Content Drop</h3>
              <p className="text-sm text-pink-800 mb-3">
                Delegates: upload your photos, videos, and reels daily so the media team can curate and post.
                Use the shared folder or WhatsApp group below.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://drive.google.com/drive/folders/1L1-XFFcbx8OwD2aYaDusUYduuzAXs5jO?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-pink-300 text-pink-800 rounded-lg hover:bg-pink-100 transition-colors"
                >
                  📁 Google Drive Folder
                </a>
                {(() => {
                  const whatsappUrl = 'https://chat.whatsapp.com/DENfNwB3zHs0ZmrNwT6dgH'
                  return whatsappUrl.includes('REPLACE') ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 border border-gray-200 rounded-lg">
                      💬 WhatsApp Media Group <span className="text-[11px] italic">(link pending)</span>
                    </span>
                  ) : (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-green-300 text-green-800 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      💬 WhatsApp Media Group
                    </a>
                  )
                })()}
              </div>
              <p className="text-[11px] text-pink-600 mt-2">
                Delegates can add files but cannot delete. WhatsApp link — update when group is created.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" /> Content Calendar
            </CardTitle>
            {mediaCalendar.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {mediaCalendar.length} items, {mediaCalendar.filter(i => i.status === 'published').length} published, {mediaCalendar.filter(i => i.status === 'in_progress').length} in progress
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter/X</option>
              <option value="website">Website</option>
            </select>
            <Button size="sm" onClick={() => setShowCalendarForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCalendar.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No content items yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Date</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Platform</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Type</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Title</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Assigned</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-600">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalendar.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{new Date(item.post_date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <Badge className={`text-xs ${platformBadge(item.platform)}`}>{item.platform}</Badge>
                      </td>
                      <td className="p-3 text-sm capitalize">{item.content_type}</td>
                      <td className="p-3 text-sm font-medium">{item.title}</td>
                      <td className="p-3 text-sm text-gray-600">{item.assigned_to || '-'}</td>
                      <td className="p-3">
                        <select
                          value={item.status}
                          onChange={(e) => updateMediaCalendarItem(item.id, { status: e.target.value })}
                          className={statusSelectClass(item.status)}
                        >
                          <option value="planned">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="ready">Ready</option>
                          <option value="published">Published</option>
                          <option value="needs_review">Needs Review</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm" variant="ghost" className="text-red-500 h-7 w-7 p-0"
                          onClick={() => deleteMediaCalendarItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shot List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shot List</CardTitle>
          <div className="flex gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button size="sm" onClick={() => setShowShotForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Shot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shotList.length > 0 && (() => {
            const captured = shotList.filter(s => s.is_captured).length
            const total = shotList.length
            const pct = Math.round((captured / total) * 100)
            return (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{captured} of {total} shots captured ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })()}
          {filteredShots.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No shots in list yet</p>
          ) : (
            <div className="space-y-2">
              {filteredShots.map(shot => (
                <div
                  key={shot.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    shot.is_captured ? 'bg-green-50 border-green-200' : 'bg-white'
                  }`}
                >
                  <button onClick={() => toggleShotCaptured(shot.id, shot.is_captured)}>
                    {shot.is_captured ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${shot.is_captured ? 'line-through text-gray-500' : ''}`}>
                      {shot.description}
                    </p>
                    {shot.location && (
                      <p className="text-xs text-gray-500">{shot.location}</p>
                    )}
                  </div>
                  <Badge className={`text-xs ${
                    shot.priority === 'high' ? 'bg-red-100 text-red-800' :
                    shot.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {shot.priority}
                  </Badge>
                  <Button
                    size="sm" variant="ghost" className="text-red-500 h-7 w-7 p-0"
                    onClick={() => deleteShotListItem(shot.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Assignments */}
      {mediaAssignments.length > 0 && (() => {
        const grouped = mediaAssignments.reduce<Record<string, MediaAssignment[]>>((acc, a) => {
          const key = a.day_date
          if (!acc[key]) acc[key] = []
          acc[key].push(a)
          return acc
        }, {})
        const sortedDays = Object.keys(grouped).sort()
        return (
          <Card>
            <CardHeader>
              <CardTitle>Media Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedDays.map(day => (
                <div key={day}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {grouped[day].map(a => (
                      <div key={a.id} className="flex items-center gap-1.5 bg-white border rounded-lg px-3 py-1.5">
                        <span className="text-sm font-medium">{a.assigned_to}</span>
                        <Badge className="text-[10px] bg-purple-100 text-purple-800">{a.track}</Badge>
                        {a.role && <span className="text-[10px] text-gray-500">({a.role})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })()}

      {/* Add Calendar Item Modal */}
      {showCalendarForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-navy">Add Content Item</h2>
              <button onClick={() => setShowCalendarForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Post Date</Label>
                  <Input
                    type="date"
                    value={newCalendarItem.post_date}
                    onChange={(e) => setNewCalendarItem({ ...newCalendarItem, post_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Platform</Label>
                  <select
                    value={newCalendarItem.platform}
                    onChange={(e) => setNewCalendarItem({ ...newCalendarItem, platform: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="website">Website</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Content Type</Label>
                  <select
                    value={newCalendarItem.content_type}
                    onChange={(e) => setNewCalendarItem({ ...newCalendarItem, content_type: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                    <option value="reel">Reel</option>
                    <option value="story">Story</option>
                    <option value="carousel">Carousel</option>
                    <option value="blog">Blog Post</option>
                    <option value="live">Live Stream</option>
                  </select>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <Input
                    value={newCalendarItem.assigned_to}
                    onChange={(e) => setNewCalendarItem({ ...newCalendarItem, assigned_to: e.target.value })}
                    placeholder="Team member"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={newCalendarItem.title}
                  onChange={(e) => setNewCalendarItem({ ...newCalendarItem, title: e.target.value })}
                  placeholder="Content title/caption"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCalendarForm(false)}>Cancel</Button>
                <Button className="flex-1 bg-navy hover:bg-navy/90" onClick={handleAddCalendarItem}>Add Item</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Shot Modal */}
      {showShotForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-navy">Add Shot</h2>
              <button onClick={() => setShowShotForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Description</Label>
                <Input
                  value={newShot.description}
                  onChange={(e) => setNewShot({ ...newShot, description: e.target.value })}
                  placeholder="What to capture"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={newShot.location}
                    onChange={(e) => setNewShot({ ...newShot, location: e.target.value })}
                    placeholder="Where"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <select
                    value={newShot.priority}
                    onChange={(e) => setNewShot({ ...newShot, priority: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowShotForm(false)}>Cancel</Button>
                <Button className="flex-1 bg-navy hover:bg-navy/90" onClick={handleAddShot}>Add Shot</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

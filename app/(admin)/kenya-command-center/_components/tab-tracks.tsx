'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Users, FileText, Phone, Save, Check, Calendar } from 'lucide-react'
import type { Participant, Contact, ConferenceSession, TrackDetail, TrackMaterial, SupportRole, ItineraryItem } from './types'

interface TabTracksProps {
  participants: Participant[]
  contacts: Contact[]
  conferenceSessions: ConferenceSession[]
  trackDetails: TrackDetail[]
  trackMaterials: TrackMaterial[]
  supportRoles: SupportRole[]
  itinerary: ItineraryItem[]
  updateTrackDetailField: (id: string, field: string, value: string) => void
  addTrackMaterial: (trackDetailId: string, itemName: string) => void
  toggleTrackMaterial: (id: string, currentlyChecked: boolean) => void
  deleteTrackMaterial: (id: string) => void
  addSupportRole: (roleName: string) => void
  updateSupportRoleField: (id: string, field: string, value: string) => void
  deleteSupportRole: (id: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

const tracks = [
  { value: 'ministry', label: 'Ministry', activeBg: 'bg-purple-500 text-white', inactiveBg: 'bg-purple-100 text-purple-800', itineraryKey: 'ministry' },
  { value: 'medical', label: 'Medical', activeBg: 'bg-green-500 text-white', inactiveBg: 'bg-green-100 text-green-800', itineraryKey: 'healthcare' },
  { value: 'education', label: 'Education', activeBg: 'bg-blue-500 text-white', inactiveBg: 'bg-blue-100 text-blue-800', itineraryKey: 'education' },
  { value: 'business', label: 'Business', activeBg: 'bg-yellow-500 text-white', inactiveBg: 'bg-yellow-100 text-yellow-800', itineraryKey: 'business' },
  { value: 'media', label: 'Media', activeBg: 'bg-pink-500 text-white', inactiveBg: 'bg-pink-100 text-pink-800', itineraryKey: 'media' },
] as const

/** Map participant service_track values to the canonical track */
function matchesTrack(serviceTrack: string | null, activeTrack: string): boolean {
  if (!serviceTrack) return false
  const lower = serviceTrack.toLowerCase()
  switch (activeTrack) {
    case 'ministry':
      return lower === 'ministry' || lower === 'evangelism' || lower === 'worship'
    case 'medical':
      return lower === 'healthcare' || lower === 'medical'
    case 'business':
      return lower === 'business'
    case 'education':
      return lower === 'education'
    case 'media':
      return lower === 'media'
    default:
      return lower === activeTrack
  }
}

/** Map itinerary category to the canonical track for filtering */
function itineraryMatchesTrack(category: string | null, itineraryKey: string): boolean {
  if (!category) return false
  const lower = category.toLowerCase()
  if (lower === 'all') return true // "all" items show on every track
  return lower === itineraryKey
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function formatTime12(time24: string): string {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

const ROLE_STATUS_OPTIONS = ['unassigned', 'assigned', 'confirmed'] as const

const roleInputClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"

export function TabTracks({
  participants,
  contacts,
  conferenceSessions,
  trackDetails,
  trackMaterials,
  supportRoles,
  itinerary,
  updateTrackDetailField,
  addTrackMaterial,
  toggleTrackMaterial,
  deleteTrackMaterial,
  addSupportRole,
  updateSupportRoleField,
  deleteSupportRole,
  saveStatus,
}: TabTracksProps) {
  const [activeTrack, setActiveTrack] = useState('ministry')
  const [newMaterialItem, setNewMaterialItem] = useState('')
  const [showAddRole, setShowAddRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')

  const activeTrackDef = tracks.find(t => t.value === activeTrack) || tracks[0]
  const detail = trackDetails.find(t => t.track === activeTrack)
  const filteredSessions = conferenceSessions.filter(
    s => s.track === activeTrack || s.track === activeTrackDef.itineraryKey || s.track === 'all' || !s.track
  )
  const filteredParticipants = participants.filter(
    p => p.application_status === 'approved' && matchesTrack(p.service_track, activeTrack)
  )
  const filteredMaterials = detail
    ? trackMaterials.filter(m => m.track_detail_id === detail.id)
    : []

  // Day-by-day schedule: itinerary items for this track + "all" items, grouped by date
  const dayByDay = useMemo(() => {
    const itineraryKey = activeTrackDef.itineraryKey
    const trackItems = itinerary.filter(item => itineraryMatchesTrack(item.category, itineraryKey))
    const sorted = [...trackItems].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.start_time || '').localeCompare(b.start_time || '')
    })

    const groups: { date: string; dayNumber: number; location: string; items: ItineraryItem[] }[] = []
    for (const item of sorted) {
      let group = groups.find(g => g.date === item.date)
      if (!group) {
        group = { date: item.date, dayNumber: item.day_number, location: item.location || '', items: [] }
        groups.push(group)
      }
      group.items.push(item)
      if (item.location && !group.location) group.location = item.location
    }
    return groups
  }, [itinerary, activeTrackDef.itineraryKey])

  // Conference sessions grouped by date for the day-by-day view
  const sessionsByDate = useMemo(() => {
    const map: Record<string, ConferenceSession[]> = {}
    for (const s of filteredSessions) {
      if (!map[s.conference_date]) map[s.conference_date] = []
      map[s.conference_date].push(s)
    }
    return map
  }, [filteredSessions])

  const handleAddMaterial = () => {
    if (!newMaterialItem.trim() || !detail) return
    addTrackMaterial(detail.id, newMaterialItem.trim())
    setNewMaterialItem('')
  }

  const handleAddRole = () => {
    if (!newRoleName.trim()) return
    addSupportRole(newRoleName.trim())
    setNewRoleName('')
    setShowAddRole(false)
  }

  return (
    <div className="space-y-6">
      {/* Track Pill Buttons + Save Indicator */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {tracks.map(track => (
            <button
              key={track.value}
              onClick={() => setActiveTrack(track.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTrack === track.value ? track.activeBg : track.inactiveBg
              }`}
            >
              {track.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          {saveStatus === 'saving' && (
            <>
              <Save className="h-3.5 w-3.5 animate-pulse" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" />
              <span className="text-green-600">Saved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600">Save failed</span>
          )}
        </div>
      </div>

      {/* ====== DAY-BY-DAY SCHEDULE (derived from itinerary) ====== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {activeTrackDef.label} Track — Day-by-Day Schedule
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">
            Auto-synced from Master Itinerary. Edit there to update here.
          </p>
        </CardHeader>
        <CardContent>
          {dayByDay.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              No itinerary items tagged for this track yet. Tag items in the Itinerary tab.
            </p>
          ) : (
            <div className="space-y-5">
              {dayByDay.map(day => {
                const dateObj = new Date(day.date + 'T00:00:00')
                const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                const city = day.location?.toUpperCase() || ''
                const daySessions = sessionsByDate[day.date] || []

                return (
                  <div key={day.date}>
                    {/* Day header */}
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-100">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${activeTrackDef.activeBg}`}>
                        DAY {day.dayNumber}
                      </span>
                      <span className="text-sm font-semibold text-navy">{dayLabel}</span>
                      {city && <span className="text-xs text-gray-500">— {city}</span>}
                    </div>

                    {/* Itinerary items for this day */}
                    <div className="space-y-1 ml-1">
                      {day.items.map(item => (
                        <div key={item.id} className="flex items-start gap-3 py-1">
                          <span className="text-[12px] text-gray-400 font-mono w-[65px] flex-shrink-0 text-right pt-0.5">
                            {item.start_time ? formatTime12(item.start_time) : ''}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-navy font-medium">{item.title}</p>
                            {item.description && item.description !== item.title && (
                              <p className="text-[12px] text-gray-500">{item.description}</p>
                            )}
                          </div>
                          {item.category !== 'all' && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      ))}

                      {/* Conference sessions for this day (if any) */}
                      {daySessions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Conference Sessions
                          </p>
                          {daySessions.map(s => (
                            <div key={s.id} className="flex items-start gap-3 py-1">
                              <span className="text-[12px] text-gray-400 font-mono w-[65px] flex-shrink-0 text-right pt-0.5">
                                {s.start_time?.slice(0, 5)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-navy font-medium">{s.title}</p>
                                {s.speaker && (
                                  <p className="text-[12px] text-gray-500">{s.speaker}</p>
                                )}
                              </div>
                              <Badge variant="secondary" className="text-[10px] shrink-0">
                                {s.session_type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2-column layout: details + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Objectives & Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Objectives &amp; Scope
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detail ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Objectives
                    </label>
                    <textarea
                      rows={4}
                      defaultValue={detail.objectives}
                      onBlur={(e) => updateTrackDetailField(detail.id, 'objectives', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-navy focus:ring-1 focus:ring-navy resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scope
                    </label>
                    <textarea
                      rows={3}
                      defaultValue={detail.scope}
                      onBlur={(e) => updateTrackDetailField(detail.id, 'scope', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-navy focus:ring-1 focus:ring-navy resize-y"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No track details configured
                </p>
              )}
            </CardContent>
          </Card>

          {/* Track Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Track Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {detail ? (
                <textarea
                  rows={4}
                  defaultValue={detail.notes || ''}
                  onBlur={(e) => updateTrackDetailField(detail.id, 'notes', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-navy focus:ring-1 focus:ring-navy resize-y"
                  placeholder="Add notes for this track..."
                />
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No track details configured
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Team Roster */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Roster ({filteredParticipants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredParticipants.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No team members assigned to this track
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredParticipants.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="h-8 w-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-medium shrink-0">
                        {getInitials(p.first_name, p.last_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {p.first_name} {p.last_name}
                        </p>
                        {p.ministry_role && (
                          <p className="text-xs text-gray-500 truncate">{p.ministry_role}</p>
                        )}
                      </div>
                      {p.team_leader && (
                        <Badge className="bg-gold text-white text-xs shrink-0">Lead</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Materials Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Materials Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              {!detail ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No track details configured
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredMaterials.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No materials added yet
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {filteredMaterials.map(material => (
                        <div
                          key={material.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 group"
                        >
                          <input
                            type="checkbox"
                            checked={material.is_checked}
                            onChange={() => toggleTrackMaterial(material.id, material.is_checked)}
                            className="h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy shrink-0"
                          />
                          <span
                            className={`flex-1 text-sm ${
                              material.is_checked ? 'line-through text-gray-400' : ''
                            }`}
                          >
                            {material.item_name}
                          </span>
                          <button
                            onClick={() => deleteTrackMaterial(material.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      value={newMaterialItem}
                      onChange={(e) => setNewMaterialItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddMaterial()
                      }}
                      placeholder="Add item..."
                      className="h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 shrink-0"
                      onClick={handleAddMaterial}
                      disabled={!newMaterialItem.trim()}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partner Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Partner Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No partner contacts
                </p>
              ) : (
                <div className="space-y-3">
                  {contacts.map(contact => (
                    <div key={contact.id} className="p-2 rounded-lg hover:bg-gray-50">
                      <p className="text-sm font-medium">{contact.name}</p>
                      {contact.role && (
                        <p className="text-xs text-gray-500">{contact.role}</p>
                      )}
                      {contact.organization && (
                        <p className="text-xs text-gray-500">{contact.organization}</p>
                      )}
                      {contact.phone && (
                        <p className="text-xs text-gray-400 mt-0.5">{contact.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ====== SUPPORT ROLES NEEDED ====== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Support Roles Needed ({supportRoles.length})</CardTitle>
          <Button size="sm" onClick={() => setShowAddRole(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Role
          </Button>
        </CardHeader>
        <CardContent>
          {showAddRole && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <Input
                placeholder="Role name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
                className="w-[250px] h-8 text-sm"
                autoFocus
              />
              <Button size="sm" className="h-8" onClick={handleAddRole}>Add</Button>
              <Button size="sm" variant="outline" className="h-8" onClick={() => { setShowAddRole(false); setNewRoleName('') }}>Cancel</Button>
            </div>
          )}

          {supportRoles.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No support roles added yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Role</th>
                    <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">When / Where</th>
                    <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Assigned To</th>
                    <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Notes</th>
                    <th className="p-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {supportRoles.map((role) => (
                    <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="p-2.5 font-medium">{role.role_name}</td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          defaultValue={role.when_where || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (role.when_where || ''))
                              updateSupportRoleField(role.id, 'when_where', e.target.value)
                          }}
                          className={`w-[180px] ${roleInputClasses}`}
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          defaultValue={role.assigned_to || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (role.assigned_to || ''))
                              updateSupportRoleField(role.id, 'assigned_to', e.target.value)
                          }}
                          placeholder="Unassigned"
                          className={`w-[140px] ${roleInputClasses}`}
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          defaultValue={role.status || 'unassigned'}
                          onChange={(e) => updateSupportRoleField(role.id, 'status', e.target.value)}
                          className={`${roleInputClasses} cursor-pointer`}
                        >
                          {ROLE_STATUS_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          defaultValue={role.notes || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (role.notes || ''))
                              updateSupportRoleField(role.id, 'notes', e.target.value)
                          }}
                          className={`w-[200px] ${roleInputClasses}`}
                        />
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => deleteSupportRole(role.id)}
                          className="text-red-400 hover:text-red-600 text-lg leading-none transition-colors"
                          title="Remove role"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

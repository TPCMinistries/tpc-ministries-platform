'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Users, FileText, Phone, Save, Check } from 'lucide-react'
import type { Participant, Contact, ConferenceSession, TrackDetail, TrackMaterial } from './types'

interface TabTracksProps {
  participants: Participant[]
  contacts: Contact[]
  conferenceSessions: ConferenceSession[]
  trackDetails: TrackDetail[]
  trackMaterials: TrackMaterial[]
  updateTrackDetailField: (id: string, field: string, value: string) => void
  addTrackMaterial: (trackDetailId: string, itemName: string) => void
  toggleTrackMaterial: (id: string, currentlyChecked: boolean) => void
  deleteTrackMaterial: (id: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

const tracks = [
  { value: 'ministry', label: 'Ministry', activeBg: 'bg-purple-500 text-white', inactiveBg: 'bg-purple-100 text-purple-800' },
  { value: 'healthcare', label: 'Healthcare', activeBg: 'bg-green-500 text-white', inactiveBg: 'bg-green-100 text-green-800' },
  { value: 'business', label: 'Business', activeBg: 'bg-yellow-500 text-white', inactiveBg: 'bg-yellow-100 text-yellow-800' },
  { value: 'education', label: 'Education', activeBg: 'bg-blue-500 text-white', inactiveBg: 'bg-blue-100 text-blue-800' },
  { value: 'media', label: 'Media', activeBg: 'bg-pink-500 text-white', inactiveBg: 'bg-pink-100 text-pink-800' },
] as const

/** Map track names to the service_track values that belong under them */
function matchesTrack(serviceTrack: string | null, activeTrack: string): boolean {
  if (!serviceTrack) return false
  const lower = serviceTrack.toLowerCase()
  switch (activeTrack) {
    case 'ministry':
      return lower === 'ministry' || lower === 'evangelism' || lower === 'worship'
    case 'healthcare':
      return lower === 'healthcare' || lower === 'medical'
    case 'business':
      return lower === 'business' || lower === 'construction'
    case 'education':
      return lower === 'education'
    case 'media':
      return lower === 'media'
    default:
      return lower === activeTrack
  }
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function TabTracks({
  participants,
  contacts,
  conferenceSessions,
  trackDetails,
  trackMaterials,
  updateTrackDetailField,
  addTrackMaterial,
  toggleTrackMaterial,
  deleteTrackMaterial,
  saveStatus,
}: TabTracksProps) {
  const [activeTrack, setActiveTrack] = useState('ministry')
  const [newMaterialItem, setNewMaterialItem] = useState('')

  const detail = trackDetails.find(t => t.track === activeTrack)
  const filteredSessions = conferenceSessions.filter(
    s => s.track === activeTrack || s.track === 'all' || !s.track
  )
  const filteredParticipants = participants.filter(
    p => p.application_status === 'approved' && matchesTrack(p.service_track, activeTrack)
  )
  const filteredMaterials = detail
    ? trackMaterials.filter(m => m.track_detail_id === detail.id)
    : []

  const handleAddMaterial = () => {
    if (!newMaterialItem.trim() || !detail) return
    addTrackMaterial(detail.id, newMaterialItem.trim())
    setNewMaterialItem('')
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

      {/* 2-column layout */}
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

          {/* Track Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Track Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSessions.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No sessions scheduled for this track
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-2 pr-3 font-medium">Time</th>
                        <th className="py-2 pr-3 font-medium">Title</th>
                        <th className="py-2 pr-3 font-medium">Speaker</th>
                        <th className="py-2 pr-3 font-medium">Type</th>
                        <th className="py-2 font-medium">Conference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.map(session => (
                        <tr key={session.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2 pr-3 whitespace-nowrap text-gray-600">
                            {session.start_time} - {session.end_time}
                          </td>
                          <td className="py-2 pr-3 font-medium">{session.title}</td>
                          <td className="py-2 pr-3 text-gray-600">{session.speaker || '--'}</td>
                          <td className="py-2 pr-3">
                            <Badge variant="secondary" className="text-xs">
                              {session.session_type}
                            </Badge>
                          </td>
                          <td className="py-2 text-gray-600">{session.conference_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                Team Roster
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
    </div>
  )
}

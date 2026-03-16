'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Truck, Plus, Trash2, Copy, X
} from 'lucide-react'
import type { Trip, ItineraryItem, ConferenceSession, LogisticsMatrix } from './types'
import { logisticsTracks } from './constants'

interface TabLogisticsProps {
  trip: Trip
  itinerary: ItineraryItem[]
  conferenceSessions: ConferenceSession[]
  logisticsMatrix: LogisticsMatrix[]
  upsertLogisticsCell: (dayDate: string, track: string, content: string) => void
  addConferenceSession: (session: Omit<ConferenceSession, 'id' | 'trip_id' | 'sort_order'>) => void
  deleteConferenceSession: (id: string) => void
  copyFromItinerary: (dayDate: string) => void
}

export function TabLogistics({
  trip, itinerary, conferenceSessions, logisticsMatrix,
  upsertLogisticsCell, addConferenceSession, deleteConferenceSession, copyFromItinerary,
}: TabLogisticsProps) {
  const startDate = new Date(trip.start_date)
  const endDate = new Date(trip.end_date)
  const tripDays: string[] = []
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    tripDays.push(d.toISOString().split('T')[0])
  }

  const [selectedDay, setSelectedDay] = useState(tripDays[0] || '')
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [sessionConference, setSessionConference] = useState<'nairobi' | 'mombasa'>('nairobi')
  const [newSession, setNewSession] = useState({
    conference_name: 'Nairobi Conference',
    conference_date: '2026-04-24',
    start_time: '',
    end_time: '',
    session_type: 'session',
    title: '',
    speaker: '',
    track: '',
    materials_url: '',
    notes: '',
  })

  const getCell = (dayDate: string, track: string) => {
    return logisticsMatrix.find(m => m.day_date === dayDate && m.track === track)?.content || ''
  }

  const handleCellBlur = (dayDate: string, track: string, content: string) => {
    const existing = getCell(dayDate, track)
    if (content !== existing) {
      upsertLogisticsCell(dayDate, track, content)
    }
  }

  const nairobiSessions = conferenceSessions.filter(s => s.conference_date === '2026-04-24')
  const mombasaSessions = conferenceSessions.filter(s => s.conference_date === '2026-05-03')

  const handleAddSession = () => {
    if (!newSession.title || !newSession.start_time) return
    addConferenceSession(newSession)
    setNewSession({
      ...newSession,
      start_time: '',
      end_time: '',
      title: '',
      speaker: '',
      track: '',
      materials_url: '',
      notes: '',
    })
    setShowSessionForm(false)
  }

  // Derive city label for each day from itinerary data
  const getCityLabel = (dayDate: string): string => {
    const dayItems = itinerary.filter(i => i.date === dayDate)
    if (dayItems.length === 0) return ''
    const cities = [...new Set(dayItems.map(i => i.location).filter(Boolean))]
    if (cities.length === 0) return ''
    if (cities.length === 1) return cities[0].toUpperCase()
    // Travel day: show origin -> destination
    return cities.map(c => c.toUpperCase()).join(' → ')
  }

  const sessionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      keynote: 'bg-purple-100 text-purple-800',
      session: 'bg-blue-100 text-blue-800',
      workshop: 'bg-green-100 text-green-800',
      panel: 'bg-yellow-100 text-yellow-800',
      break: 'bg-gray-100 text-gray-800',
      worship: 'bg-pink-100 text-pink-800',
      meal: 'bg-orange-100 text-orange-800',
      setup: 'bg-slate-100 text-slate-800',
      registration: 'bg-cyan-100 text-cyan-800',
      reception: 'bg-amber-100 text-amber-800',
      showcase: 'bg-indigo-100 text-indigo-800',
      commitment: 'bg-rose-100 text-rose-800',
      debrief: 'bg-teal-100 text-teal-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-8">
      {/* Multi-Track Matrix */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" /> Daily Logistics Matrix
          </CardTitle>
          {selectedDay && (
            <Button size="sm" variant="outline" onClick={() => copyFromItinerary(selectedDay)}>
              <Copy className="h-4 w-4 mr-1" /> Copy from Itinerary
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Day selector */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
            {tripDays.map((day, idx) => {
              const date = new Date(day)
              const cityLabel = getCityLabel(day)
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedDay === day
                      ? 'bg-navy text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {cityLabel && (
                    <>
                      <br />
                      <span className={`text-[10px] ${selectedDay === day ? 'text-white/80' : 'text-gray-500'}`}>
                        {cityLabel}
                      </span>
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {/* Track grid */}
          {selectedDay && (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {logisticsTracks.map(track => (
                <div key={track} className="space-y-1">
                  <p className="text-xs font-semibold text-navy capitalize text-center">{track}</p>
                  <textarea
                    className="w-full border rounded p-2 text-xs min-h-[120px] resize-y focus:ring-2 focus:ring-navy/20 focus:border-navy"
                    defaultValue={getCell(selectedDay, track)}
                    onBlur={(e) => handleCellBlur(selectedDay, track, e.target.value)}
                    placeholder={`${track} activities...`}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conference Schedules */}
      {['nairobi', 'mombasa'].map(conf => {
        const isNairobi = conf === 'nairobi'
        const sessions = isNairobi ? nairobiSessions : mombasaSessions
        const title = isNairobi ? 'Nairobi Conference (Apr 24)' : 'Mombasa Conference (May 3)'
        const confDate = isNairobi ? '2026-04-24' : '2026-05-03'
        const confName = isNairobi ? 'Nairobi Conference' : 'Mombasa Conference'

        return (
          <Card key={conf}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{title}</CardTitle>
              <Button size="sm" onClick={() => {
                setSessionConference(conf as 'nairobi' | 'mombasa')
                setNewSession({
                  ...newSession,
                  conference_name: confName,
                  conference_date: confDate,
                })
                setShowSessionForm(true)
              }}>
                <Plus className="h-4 w-4 mr-1" /> Add Session
              </Button>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sessions added yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-gray-600">Time</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-600">Type</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-600">Title</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-600">Speaker</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-600">Track</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-600">Materials</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map(s => (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm whitespace-nowrap">
                            {s.start_time?.slice(0, 5)}{s.end_time ? ` - ${s.end_time.slice(0, 5)}` : ''}
                          </td>
                          <td className="p-3">
                            <Badge className={`text-xs ${sessionTypeBadge(s.session_type)}`}>
                              {s.session_type}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm font-medium">{s.title}</td>
                          <td className="p-3 text-sm text-gray-600">{s.speaker || '-'}</td>
                          <td className="p-3 text-sm capitalize">{s.track || '-'}</td>
                          <td className="p-3 text-sm">
                            {s.materials_url ? (
                              <a href={s.materials_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                            ) : '-'}
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 h-7 w-7 p-0"
                              onClick={() => deleteConferenceSession(s.id)}
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
        )
      })}

      {/* Add Session Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-navy">Add Conference Session</h2>
              <button onClick={() => setShowSessionForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={newSession.start_time}
                    onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={newSession.end_time}
                    onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <select
                    value={newSession.session_type}
                    onChange={(e) => setNewSession({ ...newSession, session_type: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="keynote">Keynote</option>
                    <option value="session">Session</option>
                    <option value="workshop">Workshop</option>
                    <option value="panel">Panel</option>
                    <option value="break">Break</option>
                    <option value="worship">Worship</option>
                    <option value="meal">Meal</option>
                    <option value="setup">Setup</option>
                    <option value="registration">Registration</option>
                    <option value="reception">Reception</option>
                    <option value="showcase">Showcase</option>
                    <option value="commitment">Commitment</option>
                    <option value="debrief">Debrief</option>
                  </select>
                </div>
                <div>
                  <Label>Track</Label>
                  <select
                    value={newSession.track}
                    onChange={(e) => setNewSession({ ...newSession, track: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="">All Tracks</option>
                    <option value="ministry">Ministry</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="Session title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Speaker</Label>
                <Input
                  value={newSession.speaker}
                  onChange={(e) => setNewSession({ ...newSession, speaker: e.target.value })}
                  placeholder="Speaker name"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowSessionForm(false)}>Cancel</Button>
                <Button className="flex-1 bg-navy hover:bg-navy/90" onClick={handleAddSession}>Add Session</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

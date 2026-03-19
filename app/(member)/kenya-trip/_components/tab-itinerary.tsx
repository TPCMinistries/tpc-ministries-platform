'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Home, Phone } from 'lucide-react'
import type { DelegateData } from './use-delegate-data'

interface TabItineraryProps {
  data: DelegateData
}

function formatTime(time: string): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export function TabItinerary({ data }: TabItineraryProps) {
  const { participant, itinerary, conferenceSessions, lodging, contacts } = data
  const [selectedTrack, setSelectedTrack] = useState('')

  const trackOptions = [
    { value: 'ministry', label: 'Ministry', itinKey: 'ministry', bg: 'bg-purple-500', bgLight: 'bg-purple-100 text-purple-800' },
    { value: 'medical', label: 'Medical', itinKey: 'healthcare', bg: 'bg-green-500', bgLight: 'bg-green-100 text-green-800' },
    { value: 'education', label: 'Education', itinKey: 'education', bg: 'bg-blue-500', bgLight: 'bg-blue-100 text-blue-800' },
    { value: 'business', label: 'Business', itinKey: 'business', bg: 'bg-yellow-500', bgLight: 'bg-yellow-100 text-yellow-800' },
    { value: 'media', label: 'Media', itinKey: 'media', bg: 'bg-pink-500', bgLight: 'bg-pink-100 text-pink-800' },
  ]

  // Master itinerary grouped by date
  const grouped: Record<string, typeof itinerary> = {}
  for (const item of itinerary) {
    if (!grouped[item.date]) grouped[item.date] = []
    grouped[item.date].push(item)
  }
  const sortedDates = Object.keys(grouped).sort()

  // Track-specific view
  const myTrack = (participant?.service_track || '').toLowerCase()
  const trackMap: Record<string, string> = { 'Ministry': 'ministry', 'Medical': 'medical', 'Healthcare': 'medical', 'Education': 'education', 'Business': 'business', 'Media': 'media' }
  const mappedTrack = participant?.service_track ? (trackMap[participant.service_track] || participant.service_track.toLowerCase()) : 'ministry'
  const activeTrack = selectedTrack || mappedTrack || 'ministry'
  const activeDef = trackOptions.find(t => t.value === activeTrack) || trackOptions[0]

  // Conference sessions by date for the track
  const trackSessions = conferenceSessions.filter(s => {
    const st = (s.track || '').toLowerCase()
    return !st || st === 'all' || st === activeDef.itinKey || st === activeTrack
  })
  const sessionsByDate: Record<string, typeof conferenceSessions> = {}
  for (const s of trackSessions) {
    if (!sessionsByDate[s.conference_date]) sessionsByDate[s.conference_date] = []
    sessionsByDate[s.conference_date].push(s)
  }

  return (
    <div className="space-y-6">
      {/* Master Itinerary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Master Itinerary
          </CardTitle>
          <p className="text-sm text-gray-500">Your 16-day journey across Kenya</p>
        </CardHeader>
        <CardContent>
          {sortedDates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Itinerary will be available soon.</p>
          ) : (
            <div className="space-y-6">
              {sortedDates.map(date => {
                const items = grouped[date]
                const dateObj = new Date(date + 'T00:00:00')
                const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                const city = items[0]?.location?.toUpperCase() || ''
                const dayNum = items[0]?.day_number

                return (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                      <span className="text-xs font-bold bg-navy text-white px-2 py-0.5 rounded">
                        DAY {dayNum}
                      </span>
                      <span className="text-sm font-semibold text-navy">{dayLabel}</span>
                      {city && <span className="text-xs text-gray-500">&mdash; {city}</span>}
                    </div>
                    <div className="space-y-2 ml-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 py-1">
                          <span className="text-xs text-gray-400 font-mono w-[60px] text-right flex-shrink-0 pt-0.5">
                            {item.start_time ? formatTime(item.start_time) : ''}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-navy">{item.title}</p>
                            {item.description && item.description !== item.title && (
                              <p className="text-xs text-gray-500">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Track-Specific Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Track Schedule</CardTitle>
          <p className="text-sm text-gray-500">Conference sessions for your track. Your track is highlighted.</p>
        </CardHeader>
        <CardContent>
          {/* Track pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {trackOptions.map(track => (
              <button
                key={track.value}
                onClick={() => setSelectedTrack(track.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTrack === track.value
                    ? `${track.bg} text-white`
                    : track.bgLight
                } ${track.value === mappedTrack ? 'ring-2 ring-offset-1 ring-navy' : ''}`}
              >
                {track.label}
                {track.value === mappedTrack && ' (You)'}
              </button>
            ))}
          </div>

          {/* Sessions by date */}
          {Object.keys(sessionsByDate).length === 0 ? (
            <p className="text-gray-500 text-center py-6">No conference sessions found for this track.</p>
          ) : (
            <div className="space-y-4">
              {Object.keys(sessionsByDate).sort().map(date => {
                const sessions = sessionsByDate[date]
                const dateObj = new Date(date + 'T00:00:00')
                const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

                return (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b">
                      <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${activeDef.bg}`}>
                        {dayLabel}
                      </span>
                    </div>
                    <div className="space-y-1 ml-2">
                      {sessions.map(s => (
                        <div key={s.id} className="flex items-start gap-3 py-1">
                          <span className="text-xs text-gray-400 font-mono w-[60px] text-right flex-shrink-0 pt-0.5">
                            {s.start_time ? formatTime(s.start_time) : ''}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-navy">{s.title}</p>
                            {s.speaker && <p className="text-xs text-gray-500">{s.speaker}</p>}
                            {s.notes && <p className="text-xs text-gray-400 mt-0.5">{s.notes}</p>}
                          </div>
                          {s.track && s.track !== 'all' && (
                            <Badge variant="outline" className="text-[10px]">{s.track}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lodging Summary */}
      {lodging.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Accommodations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lodging.map(l => (
                <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-navy">{l.city}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(l.check_in_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &mdash;{' '}
                      {new Date(l.check_out_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{l.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Contacts */}
      {contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Key Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contacts.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.role} &mdash; {c.city}</p>
                  </div>
                  <div className="text-right">
                    {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                    {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

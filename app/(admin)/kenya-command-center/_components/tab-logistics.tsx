'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Truck, Plus, Trash2, Copy, X, ChevronDown, ChevronRight,
  Plane, Home, MapPin, Phone, Hotel, Utensils, Shield, Stethoscope,
  DollarSign, Radio, StickyNote, Save, Check
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Trip, ItineraryItem, ConferenceSession, LogisticsMatrix, Flight, Lodging, Contact } from './types'

interface TabLogisticsProps {
  trip: Trip
  itinerary: ItineraryItem[]
  conferenceSessions: ConferenceSession[]
  logisticsMatrix: LogisticsMatrix[]
  flights: Flight[]
  lodging: Lodging[]
  contacts: Contact[]
  upsertLogisticsCell: (dayDate: string, track: string, content: string) => void
  addConferenceSession: (session: Omit<ConferenceSession, 'id' | 'trip_id' | 'sort_order'>) => void
  deleteConferenceSession: (id: string) => void
  copyFromItinerary: (dayDate: string) => void
  updateLodgingField: (id: string, field: string, value: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

// City → border color mapping
const CITY_COLORS: Record<string, string> = {
  nairobi: 'border-l-blue-500',
  kakamega: 'border-l-green-500',
  mombasa: 'border-l-amber-500',
}
const TRAVEL_BORDER = 'border-l-red-400 border-dashed'

// City phase timeline data
const CITY_PHASES = [
  { city: 'Nairobi', dates: 'Apr 21–23', color: 'bg-blue-500' },
  { city: 'Kakamega', dates: 'Apr 24–29', color: 'bg-green-500' },
  { city: 'Mombasa', dates: 'Apr 30–May 4', color: 'bg-amber-500' },
  { city: 'Nairobi', dates: 'May 5–6', color: 'bg-blue-500' },
]

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

export function TabLogistics({
  trip, itinerary, conferenceSessions, logisticsMatrix, flights, lodging, contacts,
  upsertLogisticsCell, addConferenceSession, deleteConferenceSession, copyFromItinerary,
  updateLodgingField, saveStatus,
}: TabLogisticsProps) {
  // Generate all trip days
  const tripDays = useMemo(() => {
    const days: string[] = []
    const start = new Date(trip.start_date + 'T00:00:00')
    const end = new Date(trip.end_date + 'T00:00:00')
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0])
    }
    return days
  }, [trip.start_date, trip.end_date])

  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [showSessionForm, setShowSessionForm] = useState(false)
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

  // Helpers
  const getCell = (dayDate: string, track: string) => {
    return logisticsMatrix.find(m => m.day_date === dayDate && m.track === track)?.content || ''
  }

  const handleCellBlur = (dayDate: string, track: string, content: string) => {
    const existing = getCell(dayDate, track)
    if (content !== existing) {
      upsertLogisticsCell(dayDate, track, content)
    }
  }

  const toggleDay = (day: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  const expandAll = () => setExpandedDays(new Set(tripDays))
  const collapseAll = () => setExpandedDays(new Set())

  // Derive city for each day from itinerary
  const getCityForDay = (dayDate: string): string => {
    const dayItems = itinerary.filter(i => i.date === dayDate)
    if (dayItems.length === 0) return ''
    const cities = [...new Set(dayItems.map(i => i.location).filter(Boolean))]
    if (cities.length === 0) return ''
    return cities[0] // primary city
  }

  const getCityLabel = (dayDate: string): string => {
    const dayItems = itinerary.filter(i => i.date === dayDate)
    if (dayItems.length === 0) return ''
    const cities = [...new Set(dayItems.map(i => i.location).filter(Boolean))]
    if (cities.length === 0) return ''
    if (cities.length === 1) return cities[0].toUpperCase()
    return cities.map(c => c.toUpperCase()).join(' → ')
  }

  const isTravelDay = (dayDate: string): boolean => {
    const dayItems = itinerary.filter(i => i.date === dayDate)
    const cities = [...new Set(dayItems.map(i => i.location).filter(Boolean))]
    return cities.length > 1
  }

  const getBorderClass = (dayDate: string): string => {
    if (isTravelDay(dayDate)) return TRAVEL_BORDER
    const city = getCityForDay(dayDate).toLowerCase()
    return CITY_COLORS[city] || 'border-l-gray-300'
  }

  // Match lodging to a specific day (by date range)
  const getLodgingForDay = (dayDate: string): Lodging | undefined => {
    return lodging.find(l => {
      return dayDate >= l.check_in_date && dayDate < l.check_out_date
    })
  }

  // Match flights to a specific day
  const getFlightsForDay = (dayDate: string): Flight[] => {
    return flights.filter(f => f.departure_datetime?.startsWith(dayDate))
  }

  // Conference sessions for a specific day
  const getSessionsForDay = (dayDate: string): ConferenceSession[] => {
    return conferenceSessions
      .filter(s => s.conference_date === dayDate)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  }

  // Conference dates (for "Add Session" form)
  const conferenceDates = ['2026-04-24', '2026-05-03']

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

  // Meal tracks for structured editing
  const mealRows = ['Breakfast', 'Lunch', 'Dinner']

  // Notes tracks (combined)
  const notesTracks = ['comms', 'medical', 'security', 'finance', 'admin']

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Main Column — Day Briefing Cards */}
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Daily Logistics Briefings
            </h2>
            <p className="text-[13px] text-gray-500 mt-1">
              Click a day card to expand. Edit fields inline — saves on blur.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Save className="h-3 w-3 animate-pulse" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
            <Button size="sm" variant="outline" onClick={expandAll}>
              Expand All
            </Button>
            <Button size="sm" variant="outline" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>

        {/* Day Cards */}
        <div className="space-y-3">
          {tripDays.map((day, idx) => {
            const dateObj = new Date(day + 'T00:00:00')
            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
            const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
            const dayNum = idx + 1
            const cityLabel = getCityLabel(day)
            const borderClass = getBorderClass(day)
            const isExpanded = expandedDays.has(day)
            const dayLodging = getLodgingForDay(day)
            const dayFlights = getFlightsForDay(day)
            const daySessions = getSessionsForDay(day)
            const transportContent = getCell(day, 'transport')
            const mealsContent = getCell(day, 'meals')

            // One-liner summary for collapsed state
            const summaryParts: string[] = []
            if (dayLodging) summaryParts.push(dayLodging.name)
            if (transportContent) summaryParts.push(transportContent.split('\n')[0])
            else if (dayFlights.length > 0) summaryParts.push(`${dayFlights.length} flight${dayFlights.length > 1 ? 's' : ''}`)
            const summaryText = summaryParts.join(' · ') || 'No logistics entered'

            return (
              <Card
                key={day}
                className={`border-l-4 ${borderClass} overflow-hidden`}
              >
                {/* Card Header — always visible */}
                <button
                  onClick={() => toggleDay(day)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-navy">
                          DAY {dayNum} · {dayOfWeek} {monthDay}
                        </span>
                        {cityLabel && (
                          <span className="text-[13px] font-bold text-navy/60">
                            — {cityLabel}
                          </span>
                        )}
                      </div>
                      {!isExpanded && (
                        <p className="text-[12px] text-gray-400 mt-0.5 truncate max-w-[500px]">
                          {summaryText}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dayLodging && (
                      <Badge variant="outline" className="text-[10px] py-0 h-5">
                        <Hotel className="h-3 w-3 mr-1" />
                        {dayLodging.name}
                      </Badge>
                    )}
                    {dayFlights.length > 0 && (
                      <Badge variant="outline" className="text-[10px] py-0 h-5 border-sky-200 text-sky-700">
                        <Plane className="h-3 w-3 mr-1" />
                        {dayFlights.length} flight{dayFlights.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {daySessions.length > 0 && (
                      <Badge className="text-[10px] py-0 h-5 bg-purple-100 text-purple-700">
                        {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <CardContent className="pt-0 pb-4 px-4 space-y-4 border-t">
                    {/* Copy from Itinerary button */}
                    <div className="flex justify-end pt-2">
                      <Button size="sm" variant="outline" onClick={() => copyFromItinerary(day)} className="text-xs">
                        <Copy className="h-3 w-3 mr-1" /> Copy from Itinerary
                      </Button>
                    </div>

                    {/* Lodging Section */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-navy uppercase tracking-wider flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5" /> Lodging
                      </h4>
                      {dayLodging ? (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-navy">{dayLodging.name}</span>
                            {dayLodging.booking_status && (
                              <Badge variant="outline" className="text-[10px] py-0 h-5">
                                {dayLodging.booking_status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> {dayLodging.city}
                          </p>
                          {dayLodging.notes && (
                            <p className="text-[12px] text-gray-400 mt-1">{dayLodging.notes}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[12px] text-gray-400 italic">No lodging assigned for this date</p>
                      )}
                    </div>

                    {/* Transport Section */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-navy uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" /> Transport
                      </h4>
                      {/* Flight cards */}
                      {dayFlights.length > 0 && (
                        <div className="space-y-2">
                          {dayFlights.map(f => (
                            <div key={f.id} className="p-2.5 bg-sky-50 rounded-lg border border-sky-100">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-medium text-[13px] text-navy">
                                  <Plane className="h-3.5 w-3.5 inline mr-1" />
                                  {f.airline} {f.flight_number}
                                </span>
                                <Badge variant="outline" className="text-[10px] py-0 h-5">{f.direction}</Badge>
                              </div>
                              <p className="text-[12px] text-gray-600">
                                {f.departure_airport} → {f.arrival_airport}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {new Date(f.departure_datetime).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                {f.arrival_datetime && (
                                  <> → {new Date(f.arrival_datetime).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}</>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Ground transport notes */}
                      <textarea
                        className="w-full border rounded-lg p-2.5 text-[13px] min-h-[60px] resize-y focus:ring-2 focus:ring-navy/20 focus:border-navy"
                        defaultValue={transportContent}
                        onBlur={(e) => handleCellBlur(day, 'transport', e.target.value)}
                        placeholder="Ground transport, drivers, vehicles..."
                      />
                    </div>

                    {/* Meals Section */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-navy uppercase tracking-wider flex items-center gap-1.5">
                        <Utensils className="h-3.5 w-3.5" /> Meals
                      </h4>
                      <textarea
                        className="w-full border rounded-lg p-2.5 text-[13px] min-h-[60px] resize-y focus:ring-2 focus:ring-navy/20 focus:border-navy"
                        defaultValue={mealsContent}
                        onBlur={(e) => handleCellBlur(day, 'meals', e.target.value)}
                        placeholder="Breakfast / Lunch / Dinner plans..."
                      />
                    </div>

                    {/* Conference Sessions (only on conference days) */}
                    {daySessions.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-navy uppercase tracking-wider">
                            Conference Sessions
                          </h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => {
                              const isNairobi = day === '2026-04-24'
                              setNewSession({
                                ...newSession,
                                conference_name: isNairobi ? 'Nairobi Conference' : 'Mombasa Conference',
                                conference_date: day,
                              })
                              setShowSessionForm(true)
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add
                          </Button>
                        </div>
                        <div className="space-y-1.5">
                          {daySessions.map(s => (
                            <div key={s.id} className="flex items-start gap-2 p-2 bg-purple-50/50 rounded-lg group">
                              <span className="text-[12px] text-gray-500 font-mono w-[90px] flex-shrink-0 pt-0.5">
                                {s.start_time?.slice(0, 5)}{s.end_time ? `–${s.end_time.slice(0, 5)}` : ''}
                              </span>
                              <Badge className={`text-[10px] flex-shrink-0 ${sessionTypeBadge(s.session_type)}`}>
                                {s.session_type}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-navy truncate">{s.title}</p>
                                {s.speaker && (
                                  <p className="text-[11px] text-gray-500">{s.speaker}</p>
                                )}
                              </div>
                              <button
                                onClick={() => deleteConferenceSession(s.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 flex-shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Session button for conference days without sessions yet */}
                    {conferenceDates.includes(day) && daySessions.length === 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-navy uppercase tracking-wider">
                          Conference Sessions
                        </h4>
                        <div className="text-center py-4 border border-dashed rounded-lg">
                          <p className="text-[12px] text-gray-400 mb-2">No sessions added yet</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const isNairobi = day === '2026-04-24'
                              setNewSession({
                                ...newSession,
                                conference_name: isNairobi ? 'Nairobi Conference' : 'Mombasa Conference',
                                conference_date: day,
                              })
                              setShowSessionForm(true)
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Session
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Notes Section (combined tracks) */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-navy uppercase tracking-wider flex items-center gap-1.5">
                        <StickyNote className="h-3.5 w-3.5" /> Notes
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {notesTracks.map(track => {
                          const trackIcon: Record<string, typeof Radio> = {
                            comms: Radio,
                            medical: Stethoscope,
                            security: Shield,
                            finance: DollarSign,
                            admin: StickyNote,
                          }
                          const Icon = trackIcon[track] || StickyNote
                          return (
                            <div key={track}>
                              <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Icon className="h-3 w-3" /> {track}
                              </label>
                              <textarea
                                className="w-full border rounded p-2 text-[12px] min-h-[50px] resize-y focus:ring-1 focus:ring-navy/20 focus:border-navy"
                                defaultValue={getCell(day, track)}
                                onBlur={(e) => handleCellBlur(day, track, e.target.value)}
                                placeholder={`${track}...`}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Remaining logistics tracks (all, ministry, healthcare, business, education, media) */}
                    <details className="group">
                      <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors py-1">
                        Track-Specific Logistics ▸
                      </summary>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {['all', 'ministry', 'healthcare', 'business', 'education', 'media'].map(track => (
                          <div key={track}>
                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 block capitalize">
                              {track}
                            </label>
                            <textarea
                              className="w-full border rounded p-2 text-[12px] min-h-[50px] resize-y focus:ring-1 focus:ring-navy/20 focus:border-navy"
                              defaultValue={getCell(day, track)}
                              onBlur={(e) => handleCellBlur(day, track, e.target.value)}
                              placeholder={`${track} logistics...`}
                            />
                          </div>
                        ))}
                      </div>
                    </details>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        {/* City Phases */}
        <Card className="border-gray-100">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
              <MapPin className="h-4 w-4" /> City Phases
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-1.5">
              {CITY_PHASES.map((phase, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${phase.color} flex-shrink-0`} />
                  <div className="flex-1 flex items-baseline justify-between">
                    <span className="text-[13px] font-medium text-navy">{phase.city}</span>
                    <span className="text-[11px] text-gray-400">{phase.dates}</span>
                  </div>
                  {i < CITY_PHASES.length - 1 && (
                    <div className="absolute ml-[5px] mt-6 w-px h-3 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lodging Overview */}
        <Card className="border-gray-100">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
              <Home className="h-4 w-4" /> Lodging Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {lodging.length === 0 ? (
              <p className="text-gray-400 text-[12px]">No lodging added yet</p>
            ) : (
              <div className="space-y-2.5">
                {lodging.map(l => (
                  <div key={l.id} className="p-2.5 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-medium text-[13px] text-navy">{l.name}</p>
                      {l.booking_status && (
                        <Badge variant="outline" className="text-[10px] py-0 h-5">
                          {l.booking_status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[12px] text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {l.city}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(l.check_in_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
                      {new Date(l.check_out_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {l.rate_per_night && (
                      <p className="text-[11px] text-gray-400">${l.rate_per_night}/night</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flights */}
        <Card className="border-gray-100">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
              <Plane className="h-4 w-4" /> Flights
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {flights.length === 0 ? (
              <p className="text-gray-400 text-[12px]">No flights added yet</p>
            ) : (
              <div className="space-y-2.5">
                {flights.map(f => (
                  <div key={f.id} className="p-2.5 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-[13px] text-navy">{f.airline} {f.flight_number}</span>
                      <Badge variant="outline" className="text-[10px] py-0 h-5">{f.direction}</Badge>
                    </div>
                    <p className="text-[12px] text-gray-600">
                      {f.departure_airport} → {f.arrival_airport}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(f.departure_datetime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Contacts */}
        {contacts.length > 0 && (
          <Card className="border-gray-100">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
                <Phone className="h-4 w-4" /> Key Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="space-y-2">
                {contacts.map(c => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-navy">{c.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-navy truncate">{c.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{c.role} · {c.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
                  <Label>Conference</Label>
                  <select
                    value={newSession.conference_date}
                    onChange={(e) => {
                      const date = e.target.value
                      setNewSession({
                        ...newSession,
                        conference_date: date,
                        conference_name: date === '2026-04-24' ? 'Nairobi Conference' : 'Mombasa Conference',
                      })
                    }}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="2026-04-24">Nairobi (Apr 24)</option>
                    <option value="2026-05-03">Mombasa (May 3)</option>
                  </select>
                </div>
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
              </div>
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
                <div className="col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    placeholder="Session title"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Speaker</Label>
                  <Input
                    value={newSession.speaker}
                    onChange={(e) => setNewSession({ ...newSession, speaker: e.target.value })}
                    placeholder="Speaker name"
                    className="mt-1"
                  />
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

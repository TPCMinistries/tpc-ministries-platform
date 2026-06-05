'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Plane, Home, MapPin, Trash2, Save, Check } from 'lucide-react'
import type { Trip, ItineraryItem, Flight, Lodging, Contact } from './types'

interface TabItineraryProps {
  trip: Trip
  itinerary: ItineraryItem[]
  flights: Flight[]
  lodging: Lodging[]
  contacts: Contact[]
  addItineraryItem: (item: { date: string; day_number: number; title: string; description: string; start_time: string; category: string; location: string }) => void
  updateItineraryField: (id: string, field: string, value: string) => void
  deleteItineraryItem: (id: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

const TRACK_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  all:        { bg: 'bg-gray-100',    text: 'text-gray-700',   label: 'ALL' },
  ministry:   { bg: 'bg-blue-100',    text: 'text-blue-700',   label: 'MINISTRY' },
  healthcare: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'HEALTH' },
  business:   { bg: 'bg-amber-100',   text: 'text-amber-700',  label: 'BUSINESS' },
  education:  { bg: 'bg-purple-100',  text: 'text-purple-700', label: 'EDUCATION' },
  media:      { bg: 'bg-orange-100',  text: 'text-orange-700', label: 'MEDIA' },
  meals:      { bg: 'bg-yellow-100',  text: 'text-yellow-700', label: 'MEALS' },
  transport:  { bg: 'bg-sky-100',     text: 'text-sky-700',    label: 'TRANSPORT' },
  admin:      { bg: 'bg-rose-100',    text: 'text-rose-700',   label: 'ADMIN' },
  spiritual:  { bg: 'bg-indigo-100',  text: 'text-indigo-700', label: 'SPIRITUAL' },
  cultural:   { bg: 'bg-teal-100',    text: 'text-teal-700',   label: 'CULTURAL' },
  free:       { bg: 'bg-lime-100',    text: 'text-lime-700',   label: 'FREE TIME' },
}

// Fallback for custom categories not in TRACK_COLORS
function getTrackStyle(cat: string) {
  return TRACK_COLORS[cat] || { bg: 'bg-gray-100', text: 'text-gray-700', label: cat.toUpperCase() }
}

const DEFAULT_CATEGORIES = ['all', 'ministry', 'healthcare', 'business', 'education', 'media', 'meals', 'transport', 'admin', 'spiritual', 'cultural', 'free']

function generateDateOptions(startDate: string, endDate: string): { value: string; label: string }[] {
  const dates: { value: string; label: string }[] = []
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const current = new Date(start)
  while (current <= end) {
    const iso = current.toISOString().split('T')[0]
    const label = current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    dates.push({ value: iso, label })
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function extractCity(items: ItineraryItem[]): string {
  // Try location field first, then title
  for (const item of items) {
    if (item.location) return item.location.toUpperCase()
  }
  return ''
}

export function TabItinerary({
  trip,
  itinerary,
  flights,
  lodging,
  contacts,
  addItineraryItem,
  updateItineraryField,
  deleteItineraryItem,
  saveStatus,
}: TabItineraryProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    date: trip.start_date || '2026-04-21',
    title: '',
    description: '',
    start_time: '',
    category: 'all',
    location: '',
  })

  const dateOptions = useMemo(
    () => generateDateOptions(trip.start_date || '2026-04-21', trip.end_date || '2026-05-06'),
    [trip.start_date, trip.end_date]
  )

  // Group itinerary by date, sorted
  const groupedByDate = useMemo(() => {
    const groups: Record<string, ItineraryItem[]> = {}
    const sorted = [...itinerary].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.start_time || '').localeCompare(b.start_time || '')
    })
    for (const item of sorted) {
      if (!groups[item.date]) groups[item.date] = []
      groups[item.date].push(item)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [itinerary])

  function handleAdd() {
    const startDate = new Date(trip.start_date + 'T00:00:00')
    const itemDate = new Date(newItem.date + 'T00:00:00')
    const dayNumber = Math.floor((itemDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    addItineraryItem({
      date: newItem.date,
      day_number: dayNumber,
      title: newItem.title,
      description: newItem.description,
      start_time: newItem.start_time,
      category: newItem.category,
      location: newItem.location,
    })

    setNewItem({ date: trip.start_date || '2026-04-21', title: '', description: '', start_time: '', category: 'all', location: '' })
    setShowAddForm(false)
  }

  const startFormatted = new Date((trip.start_date || '2026-04-21') + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endFormatted = new Date((trip.end_date || '2026-05-06') + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const inputClasses = 'bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors'

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Main Timeline */}
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Master Itinerary — {startFormatted} to {endFormatted}
            </h2>
            <p className="text-[13px] text-gray-500 mt-1">
              Click any text to edit inline. Items marked with a question mark need confirmation.
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
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-navy hover:bg-navy/90 text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Day Item
            </Button>
          </div>
        </div>

        {/* Inline Add Form */}
        {showAddForm && (
          <Card className="mb-6 border-navy/20">
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Date</label>
                  <select
                    value={newItem.date}
                    onChange={e => setNewItem(prev => ({ ...prev, date: e.target.value }))}
                    className={inputClasses + ' w-full'}
                  >
                    {dateOptions.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 4:00 PM"
                    value={newItem.start_time}
                    onChange={e => setNewItem(prev => ({ ...prev, start_time: e.target.value }))}
                    className={inputClasses + ' w-full'}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Track</label>
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className={inputClasses + ' w-full'}
                  >
                    {DEFAULT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{getTrackStyle(c).label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Title</label>
                  <input
                    type="text"
                    placeholder="Activity title"
                    value={newItem.title}
                    onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    className={inputClasses + ' w-full'}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                  <input
                    type="text"
                    placeholder="Description or notes"
                    value={newItem.description}
                    onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    className={inputClasses + ' w-full'}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Location</label>
                  <input
                    type="text"
                    placeholder="City or venue"
                    value={newItem.location}
                    onChange={e => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    className={inputClasses + ' w-full'}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={handleAdd} className="bg-navy hover:bg-navy/90 text-white">
                  Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {itinerary.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="h-14 w-14 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-[15px]">No itinerary items yet.</p>
            <p className="text-gray-400 text-[13px] mt-1">
              Add items to build your master itinerary, or the data will be seeded automatically.
            </p>
          </div>
        ) : (
          /* Timeline */
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gray-200" />

            <div className="space-y-8">
              {groupedByDate.map(([date, items]) => {
                const dateObj = new Date(date + 'T00:00:00')
                const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
                const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
                const city = extractCity(items)
                const dayNum = items[0]?.day_number

                return (
                  <div key={date} className="relative">
                    {/* Date header with timeline dot */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative z-10 w-[23px] h-[23px] rounded-full border-2 border-amber-400 bg-white flex items-center justify-center flex-shrink-0">
                        <div className="w-[9px] h-[9px] rounded-full bg-amber-400" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13px] font-bold text-amber-600 tracking-wide">
                          DAY {dayNum} &middot; {dayOfWeek} {monthDay}
                        </span>
                        {city && (
                          <span className="text-[13px] font-bold text-amber-600/70">
                            — {city}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items for this date */}
                    <div className="ml-[11px] pl-6 border-l border-transparent space-y-1.5">
                      {items.map(item => {
                        const track = getTrackStyle(item.category)

                        return (
                          <div
                            key={item.id}
                            className="group flex items-start gap-2.5 py-1.5 px-2 rounded hover:bg-gray-50 transition-colors"
                          >
                            {/* Editable Time */}
                            <input
                              type="time"
                              defaultValue={item.start_time || ''}
                              onChange={e => updateItineraryField(item.id, 'start_time', e.target.value)}
                              className="text-[12px] text-gray-400 font-mono w-[72px] flex-shrink-0 bg-transparent border border-transparent hover:border-gray-200 focus:border-navy/30 rounded px-1 py-0.5 outline-none transition-colors"
                            />

                            {/* Editable Track badge */}
                            <select
                              defaultValue={item.category || 'all'}
                              onChange={e => updateItineraryField(item.id, 'category', e.target.value)}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider flex-shrink-0 cursor-pointer border-0 outline-none ${track.bg} ${track.text}`}
                            >
                              {DEFAULT_CATEGORIES.map(c => (
                                <option key={c} value={c}>{getTrackStyle(c).label}</option>
                              ))}
                            </select>

                            {/* Editable title/description/location */}
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                defaultValue={item.title}
                                onBlur={e => {
                                  if (e.target.value !== item.title) {
                                    updateItineraryField(item.id, 'title', e.target.value)
                                  }
                                }}
                                className="w-full bg-transparent text-[13px] text-navy font-medium outline-none focus:bg-white focus:border focus:border-navy/30 focus:rounded focus:px-1.5 focus:py-0.5 transition-all truncate"
                                title={item.title}
                              />
                              <input
                                type="text"
                                defaultValue={item.description || ''}
                                onBlur={e => {
                                  if (e.target.value !== (item.description || '')) {
                                    updateItineraryField(item.id, 'description', e.target.value)
                                  }
                                }}
                                placeholder="Description..."
                                className="w-full bg-transparent text-[12px] text-gray-500 outline-none focus:bg-white focus:border focus:border-navy/30 focus:rounded focus:px-1.5 focus:py-0.5 transition-all mt-0.5"
                                title={item.description || ''}
                              />
                              {/* Editable location + date (move to different day) */}
                              <div className="flex items-center gap-2 mt-0.5">
                                <input
                                  type="text"
                                  defaultValue={item.location || ''}
                                  onBlur={e => {
                                    if (e.target.value !== (item.location || '')) {
                                      updateItineraryField(item.id, 'location', e.target.value)
                                    }
                                  }}
                                  placeholder="Location..."
                                  className="bg-transparent text-[11px] text-gray-400 outline-none focus:bg-white focus:border focus:border-navy/30 focus:rounded focus:px-1.5 focus:py-0.5 transition-all w-[100px]"
                                />
                                <select
                                  defaultValue={item.date}
                                  onChange={e => {
                                    const newDate = e.target.value
                                    if (newDate !== item.date) {
                                      const startDate = new Date(trip.start_date + 'T00:00:00')
                                      const itemDate = new Date(newDate + 'T00:00:00')
                                      const newDayNum = Math.floor((itemDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                                      updateItineraryField(item.id, 'date', newDate)
                                      updateItineraryField(item.id, 'day_number', String(newDayNum))
                                    }
                                  }}
                                  className="bg-transparent text-[11px] text-gray-400 outline-none focus:bg-white focus:border focus:border-navy/30 focus:rounded focus:px-1 focus:py-0.5 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                                >
                                  {dateOptions.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Delete button (visible on hover) */}
                            <button
                              onClick={() => deleteItineraryItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 flex-shrink-0"
                              title="Delete item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar — Flights, Lodging, Contacts */}
      <div className="space-y-4">
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

        {/* Lodging */}
        <Card className="border-gray-100">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
              <Home className="h-4 w-4" /> Lodging
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {lodging.length === 0 ? (
              <p className="text-gray-400 text-[12px]">No lodging added yet</p>
            ) : (
              <div className="space-y-2.5">
                {lodging.map(l => (
                  <div key={l.id} className="p-2.5 bg-gray-50 rounded-lg">
                    <p className="font-medium text-[13px] text-navy">{l.name}</p>
                    <p className="text-[12px] text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {l.city}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(l.check_in_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
                      {new Date(l.check_out_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {l.booking_status && (
                      <Badge variant="outline" className="text-[10px] py-0 h-5 mt-1">
                        {l.booking_status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Contacts (compact) */}
        {contacts.length > 0 && (
          <Card className="border-gray-100">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold text-navy">Key Contacts</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="space-y-2">
                {contacts.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-navy">{c.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-navy truncate">{c.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{c.role} &middot; {c.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Track Legend */}
        <Card className="border-gray-100">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-navy">Track Legend</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TRACK_COLORS).map(([key, val]) => (
                <span key={key} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${val.bg} ${val.text}`}>
                  {val.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

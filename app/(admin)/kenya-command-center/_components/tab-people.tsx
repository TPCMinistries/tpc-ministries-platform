'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Users, Save, Check } from 'lucide-react'
import type { Trip, Participant, Lodging, Contact } from './types'
import { serviceTracks, emojiStatuses, delegationTracks } from './constants'

interface TabPeopleProps {
  trip: Trip
  filteredParticipants: Participant[]
  participants: Participant[]
  lodging: Lodging[]
  contacts: Contact[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterTrack: string
  setFilterTrack: (t: string) => void
  filterStatus: string
  setFilterStatus: (s: string) => void
  setSelectedParticipant: (p: Participant) => void
  updateParticipantStatus: (id: string, status: string) => void
  updateParticipantField: (id: string, field: string, value: string) => void
  updateLodgingField: (id: string, field: string, value: string | number) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

// Build deduplicated track options from delegationTracks + serviceTracks
const allTrackOptions = (() => {
  const seen = new Set<string>()
  const options: { value: string; label: string }[] = []
  for (const t of delegationTracks) {
    if (!seen.has(t.value)) {
      seen.add(t.value)
      options.push({ value: t.value, label: t.label })
    }
  }
  for (const t of serviceTracks) {
    if (!seen.has(t.value)) {
      seen.add(t.value)
      options.push({ value: t.value, label: t.label })
    }
  }
  return options
})()

// Shared inline-edit input class
const inlineInputClass =
  'w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none transition-colors'

const inlineSelectClass =
  'w-full bg-transparent border border-transparent rounded px-1 py-1 text-sm hover:border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none transition-colors cursor-pointer appearance-none'

function formatRoute(departure?: string, arrival?: string): string {
  const dep = departure || ''
  const arr = arrival || ''
  if (!dep && !arr) return ''
  return `${dep} → ${arr}`
}

function parseRoute(raw: string): { departure: string; arrival: string } {
  // Support both → and ->
  const parts = raw.split(/→|->/).map((s) => s.trim().toUpperCase())
  return {
    departure: parts[0] || '',
    arrival: parts[1] || '',
  }
}

function computeNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  const diff = d2.getTime() - d1.getTime()
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
}

function formatDateRange(checkIn: string, checkOut: string): string {
  const fmt = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return `${fmt(checkIn)} - ${fmt(checkOut)}`
}

export function TabPeople({
  trip,
  filteredParticipants,
  participants,
  lodging,
  contacts,
  searchQuery,
  setSearchQuery,
  filterTrack,
  setFilterTrack,
  filterStatus,
  setFilterStatus,
  setSelectedParticipant,
  updateParticipantStatus,
  updateParticipantField,
  updateLodgingField,
  saveStatus,
}: TabPeopleProps) {
  // Memoize filter options from delegation + service tracks
  const filterTrackOptions = useMemo(() => allTrackOptions, [])

  return (
    <div className="space-y-8">
      {/* Save Status Indicator */}
      <div className="flex justify-end">
        {saveStatus === 'saving' && (
          <span className="flex items-center gap-1.5 text-sm text-gray-500 animate-pulse">
            <Save className="h-3.5 w-3.5" />
            Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-red-600">Save failed</span>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterTrack}
          onChange={(e) => setFilterTrack(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="all">All Tracks</option>
          {filterTrackOptions.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Delegation Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-white border-b">
                <tr>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                    Name
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                    Role
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                    Track
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                    Booking
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                    Route
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                    Flight
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                    Hotel
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                    Passport
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                    Visa
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p) => (
                  <ParticipantRow
                    key={p.id}
                    participant={p}
                    updateParticipantField={updateParticipantField}
                    setSelectedParticipant={setSelectedParticipant}
                  />
                ))}
              </tbody>
            </table>
            {filteredParticipants.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No participants found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* In-Country Partners */}
      {contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">In-Country Partners</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Name</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Role</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Organization</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">City</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Phone</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium">{c.name}</td>
                      <td className="py-2 px-3 text-gray-600">{c.role || '-'}</td>
                      <td className="py-2 px-3 text-gray-600">{c.organization || '-'}</td>
                      <td className="py-2 px-3 text-gray-600">{c.city || '-'}</td>
                      <td className="py-2 px-3 text-gray-600">{c.phone || '-'}</td>
                      <td className="py-2 px-3 text-gray-600">{c.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotel Blocks */}
      {lodging.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hotel Blocks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">City</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Dates</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Nights</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Property</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Rooms</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">$/Night</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {lodging.map((l) => (
                    <LodgingRow
                      key={l.id}
                      lodging={l}
                      updateLodgingField={updateLodgingField}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Participant Row (uses defaultValue + onBlur for perf) ──────────────

interface ParticipantRowProps {
  participant: Participant
  updateParticipantField: (id: string, field: string, value: string) => void
  setSelectedParticipant: (p: Participant) => void
}

function ParticipantRow({
  participant: p,
  updateParticipantField,
  setSelectedParticipant,
}: ParticipantRowProps) {
  const initials = `${(p.first_name?.[0] || '').toUpperCase()}${(p.last_name?.[0] || '').toUpperCase()}`
  const routeDefault = formatRoute(p.departure_airport, p.return_airport)

  const handleRouteBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { departure, arrival } = parseRoute(e.target.value)
    const prevDeparture = (p.departure_airport || '').toUpperCase()
    const prevArrival = (p.return_airport || '').toUpperCase()
    if (departure !== prevDeparture) {
      updateParticipantField(p.id, 'departure_airport', departure)
    }
    if (arrival !== prevArrival) {
      updateParticipantField(p.id, 'return_airport', arrival)
    }
  }

  const handleTextBlur = (field: string, prev: string | undefined | null) => {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val !== (prev || '')) {
        updateParticipantField(p.id, field, val)
      }
    }
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      {/* Name */}
      <td className="py-2 px-3">
        <button
          type="button"
          className="flex items-center gap-2 text-left group"
          onClick={() => setSelectedParticipant(p)}
        >
          <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-navy text-xs font-medium">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-navy group-hover:underline flex items-center gap-1.5 truncate">
              {p.first_name} {p.last_name}
              {p.team_leader && (
                <Badge className="bg-gold/20 text-gold-dark text-[10px] px-1.5 py-0">
                  Leader
                </Badge>
              )}
            </p>
            <p className="text-xs text-gray-500 truncate">{p.email}</p>
          </div>
        </button>
      </td>

      {/* Role */}
      <td className="py-2 px-3">
        <input
          type="text"
          className={inlineInputClass}
          defaultValue={p.ministry_role || ''}
          onBlur={handleTextBlur('ministry_role', p.ministry_role)}
          placeholder="—"
        />
      </td>

      {/* Track */}
      <td className="py-2 px-3">
        <select
          className={inlineSelectClass}
          defaultValue={p.service_track || ''}
          onChange={(e) => updateParticipantField(p.id, 'service_track', e.target.value)}
        >
          <option value="">—</option>
          {allTrackOptions.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </td>

      {/* Booking */}
      <td className="py-2 px-3">
        <select
          className={inlineSelectClass}
          defaultValue={p.booking_type || ''}
          onChange={(e) => updateParticipantField(p.id, 'booking_type', e.target.value)}
        >
          <option value="">—</option>
          <option value="Group">Group</option>
          <option value="Individual">Individual</option>
          <option value="TBD">TBD</option>
        </select>
      </td>

      {/* Route */}
      <td className="py-2 px-3">
        <input
          type="text"
          className={`${inlineInputClass} min-w-[120px]`}
          defaultValue={routeDefault}
          onBlur={handleRouteBlur}
          placeholder="JFK → NBO"
        />
      </td>

      {/* Flight */}
      <td className="py-2 px-3">
        <select
          className={inlineSelectClass}
          defaultValue={p.flight_status || ''}
          onChange={(e) => updateParticipantField(p.id, 'flight_status', e.target.value)}
        >
          <option value="">—</option>
          {emojiStatuses.booking.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>

      {/* Hotel */}
      <td className="py-2 px-3">
        <select
          className={inlineSelectClass}
          defaultValue={p.hotel_status || ''}
          onChange={(e) => updateParticipantField(p.id, 'hotel_status', e.target.value)}
        >
          <option value="">—</option>
          {emojiStatuses.booking.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>

      {/* Passport */}
      <td className="py-2 px-3">
        <select
          className={inlineSelectClass}
          defaultValue={p.passport_status || ''}
          onChange={(e) => updateParticipantField(p.id, 'passport_status', e.target.value)}
        >
          <option value="">—</option>
          {emojiStatuses.passport.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>

      {/* Visa */}
      <td className="py-2 px-3">
        <select
          className={inlineSelectClass}
          defaultValue={p.visa_status || ''}
          onChange={(e) => updateParticipantField(p.id, 'visa_status', e.target.value)}
        >
          <option value="">—</option>
          {emojiStatuses.visa.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>

      {/* Notes */}
      <td className="py-2 px-3">
        <input
          type="text"
          className={`${inlineInputClass} min-w-[140px]`}
          defaultValue={p.travel_notes || ''}
          onBlur={handleTextBlur('travel_notes', p.travel_notes)}
          placeholder="—"
        />
      </td>
    </tr>
  )
}

// ── Lodging Row ────────────────────────────────────────────────────────

interface LodgingRowProps {
  lodging: Lodging
  updateLodgingField: (id: string, field: string, value: string | number) => void
}

function LodgingRow({ lodging: l, updateLodgingField }: LodgingRowProps) {
  const nights = computeNights(l.check_in_date, l.check_out_date)
  const dateRange = formatDateRange(l.check_in_date, l.check_out_date)

  const handleRateBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value)
    if (!isNaN(parsed) && parsed !== (l.rate_per_night ?? 0)) {
      updateLodgingField(l.id, 'rate_per_night', parsed)
    }
  }

  const handleNotesBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val !== (l.notes || '')) {
      updateLodgingField(l.id, 'notes', val)
    }
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-2 px-3 font-medium">{l.city}</td>
      <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{dateRange}</td>
      <td className="py-2 px-3 text-gray-600">{nights}</td>
      <td className="py-2 px-3 text-gray-600">{l.name}</td>
      <td className="py-2 px-3 text-gray-600">{l.total_rooms}</td>
      <td className="py-2 px-3">
        <input
          type="text"
          className={`${inlineInputClass} w-20`}
          defaultValue={l.rate_per_night != null ? String(l.rate_per_night) : ''}
          onBlur={handleRateBlur}
          placeholder="0.00"
        />
      </td>
      <td className="py-2 px-3">
        <select
          className={inlineSelectClass}
          defaultValue={l.booking_status || ''}
          onChange={(e) => updateLodgingField(l.id, 'booking_status', e.target.value)}
        >
          <option value="">—</option>
          {emojiStatuses.lodging.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 px-3">
        <input
          type="text"
          className={`${inlineInputClass} min-w-[120px]`}
          defaultValue={l.notes || ''}
          onBlur={handleNotesBlur}
          placeholder="—"
        />
      </td>
    </tr>
  )
}

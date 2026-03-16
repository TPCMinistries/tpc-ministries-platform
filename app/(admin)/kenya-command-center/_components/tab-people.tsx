'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Save, Check } from 'lucide-react'
import type { Trip, Participant, Lodging, Contact } from './types'

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

// Exactly matching the HTML dashboard's column widths and emoji options
const FLIGHT_OPTIONS = ['⬜ Not booked', '❓ Confirm', '🔄 Searching', '✅ Booked']
const HOTEL_OPTIONS = ['⬜ Not booked', '❓ Confirm', '🔄 Searching', '✅ Confirmed']
const PASSPORT_OPTIONS = ['❓ Unknown', '⬜ Need', '🔄 Renewing', '✅ Valid']
const VISA_OPTIONS = ['❓ Unknown', '⬜ Need', '🔄 Renewing', '✅ Valid']
const TRACK_OPTIONS = ['Ministry', 'Healthcare', 'Business', 'Education', 'Media', 'Flex']
const BOOKING_OPTIONS = ['Group', 'Individual', 'TBD']
const HOTEL_BLOCK_STATUS_OPTIONS = ['⬜ Not started', '❓ Researching', '🔄 In progress', '✅ Confirmed']

function computeNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

function formatDateRange(checkIn: string, checkOut: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
  return (
    <div className="space-y-6">
      {/* Save Status */}
      <div className="flex justify-end min-h-[24px]">
        {saveStatus === 'saving' && (
          <span className="flex items-center gap-1.5 text-sm text-gray-500 animate-pulse">
            <Save className="h-3.5 w-3.5" /> Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-red-600">Save failed</span>
        )}
      </div>

      {/* ====== US DELEGATION ====== */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-base font-semibold text-navy mb-4">
            👥 US Delegation ({filteredParticipants.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Track</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Booking Type</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Route</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Flight</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Hotel</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Passport</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Visa</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    {/* Name — static, clickable */}
                    <td className="p-2.5 whitespace-nowrap">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-left group"
                        onClick={() => setSelectedParticipant(p)}
                      >
                        <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-navy text-xs font-medium">
                            {p.first_name?.[0]}{p.last_name?.[0]}
                          </span>
                        </div>
                        <span className="font-medium text-navy group-hover:underline">
                          {p.first_name} {p.last_name}
                        </span>
                        {p.team_leader && (
                          <Badge className="bg-gold/20 text-gold-dark text-[10px] px-1.5 py-0">Leader</Badge>
                        )}
                      </button>
                    </td>

                    {/* Role — input */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={p.ministry_role || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (p.ministry_role || ''))
                            updateParticipantField(p.id, 'ministry_role', e.target.value)
                        }}
                        className="w-[100px] bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                      />
                    </td>

                    {/* Track — select */}
                    <td className="p-2.5">
                      <select
                        defaultValue={p.service_track || 'Flex'}
                        onChange={(e) => updateParticipantField(p.id, 'service_track', e.target.value)}
                        className="bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
                      >
                        {TRACK_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>

                    {/* Booking Type — select */}
                    <td className="p-2.5">
                      <select
                        defaultValue={p.booking_type || 'TBD'}
                        onChange={(e) => updateParticipantField(p.id, 'booking_type', e.target.value)}
                        className="bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
                      >
                        {BOOKING_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </td>

                    {/* Route — input */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={
                          p.departure_airport || p.return_airport
                            ? `${p.departure_airport || 'TBD'} → ${p.return_airport || 'NBO'}`
                            : ''
                        }
                        onBlur={(e) => {
                          const parts = e.target.value.split(/→|->/).map(s => s.trim())
                          const dep = parts[0] || ''
                          const arr = parts[1] || ''
                          if (dep !== (p.departure_airport || '')) updateParticipantField(p.id, 'departure_airport', dep)
                          if (arr !== (p.return_airport || '')) updateParticipantField(p.id, 'return_airport', arr)
                        }}
                        placeholder="JFK → NBO"
                        className="w-[110px] bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                      />
                    </td>

                    {/* Flight — emoji select */}
                    <td className="p-2.5">
                      <select
                        defaultValue={p.flight_status || '⬜ Not booked'}
                        onChange={(e) => updateParticipantField(p.id, 'flight_status', e.target.value)}
                        className="bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
                      >
                        {FLIGHT_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </td>

                    {/* Hotel — emoji select */}
                    <td className="p-2.5">
                      <select
                        defaultValue={p.hotel_status || '⬜ Not booked'}
                        onChange={(e) => updateParticipantField(p.id, 'hotel_status', e.target.value)}
                        className="bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
                      >
                        {HOTEL_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </td>

                    {/* Passport — emoji select */}
                    <td className="p-2.5">
                      <select
                        defaultValue={p.passport_status || '❓ Unknown'}
                        onChange={(e) => updateParticipantField(p.id, 'passport_status', e.target.value)}
                        className="bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
                      >
                        {PASSPORT_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </td>

                    {/* Visa — emoji select */}
                    <td className="p-2.5">
                      <select
                        defaultValue={p.visa_status || '❓ Unknown'}
                        onChange={(e) => updateParticipantField(p.id, 'visa_status', e.target.value)}
                        className="bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
                      >
                        {VISA_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </td>

                    {/* Notes — input */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={p.travel_notes || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (p.travel_notes || ''))
                            updateParticipantField(p.id, 'travel_notes', e.target.value)
                        }}
                        className="w-[180px] bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                      />
                    </td>
                  </tr>
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

      {/* ====== IN-COUNTRY PARTNERS ====== */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-base font-semibold text-navy mb-4">
            🤝 In-Country Partners ({contacts.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Organization</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">City</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Phone</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Notes</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="p-2.5 font-medium">{c.name}</td>
                    <td className="p-2.5 text-gray-600">{c.role || '—'}</td>
                    <td className="p-2.5 text-gray-600">{c.organization || '—'}</td>
                    <td className="p-2.5 text-gray-600">{c.city || '—'}</td>
                    <td className="p-2.5 text-gray-600">{c.phone || '—'}</td>
                    <td className="p-2.5 text-gray-600">{c.email || '—'}</td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-400">No partners added yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ====== HOTEL BLOCKS ====== */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-base font-semibold text-navy mb-4">
            🏨 Hotel Blocks
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">City</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Dates</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Nights</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Property</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Rooms</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">$/Night</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Notes</th>
                </tr>
              </thead>
              <tbody>
                {lodging.map((l) => {
                  const nights = computeNights(l.check_in_date, l.check_out_date)
                  const dateRange = formatDateRange(l.check_in_date, l.check_out_date)
                  return (
                    <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="p-2.5">
                        <input
                          type="text"
                          defaultValue={l.city || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (l.city || ''))
                              updateLodgingField(l.id, 'city', e.target.value)
                          }}
                          className="w-[100px] bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">{dateRange}</td>
                      <td className="p-2.5 text-gray-600 text-center">{nights}</td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          defaultValue={l.name || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (l.name || ''))
                              updateLodgingField(l.id, 'name', e.target.value)
                          }}
                          className="w-[180px] bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          defaultValue={l.total_rooms || ''}
                          onBlur={(e) => {
                            const v = parseInt(e.target.value)
                            if (!isNaN(v) && v !== l.total_rooms)
                              updateLodgingField(l.id, 'total_rooms', v)
                          }}
                          className="w-[60px] bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          defaultValue={l.rate_per_night != null ? String(l.rate_per_night) : ''}
                          onBlur={(e) => {
                            const parsed = parseFloat(e.target.value)
                            if (!isNaN(parsed)) updateLodgingField(l.id, 'rate_per_night', parsed)
                          }}
                          placeholder="~$80-120"
                          className="w-[90px] bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          defaultValue={l.booking_status || '⬜ Not started'}
                          onChange={(e) => updateLodgingField(l.id, 'booking_status', e.target.value)}
                          className="bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
                        >
                          {HOTEL_BLOCK_STATUS_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          defaultValue={l.notes || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (l.notes || ''))
                              updateLodgingField(l.id, 'notes', e.target.value)
                          }}
                          className="w-[180px] bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                        />
                      </td>
                    </tr>
                  )
                })}
                {lodging.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-400">No hotel blocks added yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

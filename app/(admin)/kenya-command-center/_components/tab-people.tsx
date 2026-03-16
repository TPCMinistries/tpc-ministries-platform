'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Save, Check } from 'lucide-react'
import type { Trip, Participant, Lodging, Contact, WaitingListEntry } from './types'

interface TabPeopleProps {
  trip: Trip
  filteredParticipants: Participant[]
  participants: Participant[]
  lodging: Lodging[]
  contacts: Contact[]
  waitingList: WaitingListEntry[]
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
  updateContactField: (id: string, field: string, value: string) => void
  addParticipantDirect: (firstName: string, lastName: string) => void
  deleteParticipant: (id: string) => void
  addContact: (name: string) => void
  deleteContact: (id: string) => void
  addWaitingListEntry: (entry: any) => void
  updateWaitingListEntry: (id: string, updates: any) => void
  deleteWaitingListEntry: (id: string) => void
  promoteToDelegate: (entry: WaitingListEntry) => void
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
const WAITING_STATUS_OPTIONS = ['🔄 In conversation', '❓ Waiting', '⬜ Not contacted']

function computeNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

function formatDateRange(checkIn: string, checkOut: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(checkIn)} - ${fmt(checkOut)}`
}

const inputClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
const selectClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
const thClasses = "text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide"

export function TabPeople({
  trip,
  filteredParticipants,
  participants,
  lodging,
  contacts,
  waitingList,
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
  updateContactField,
  addParticipantDirect,
  deleteParticipant,
  addContact,
  deleteContact,
  addWaitingListEntry,
  updateWaitingListEntry,
  deleteWaitingListEntry,
  promoteToDelegate,
  saveStatus,
}: TabPeopleProps) {
  // Add Delegate inline form state
  const [showAddDelegate, setShowAddDelegate] = useState(false)
  const [newDelegateFirst, setNewDelegateFirst] = useState('')
  const [newDelegateLast, setNewDelegateLast] = useState('')

  // Add Partner inline form state
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [newPartnerName, setNewPartnerName] = useState('')

  // Add Waiting List inline form state
  const [showAddWaiting, setShowAddWaiting] = useState(false)
  const [newWaitingName, setNewWaitingName] = useState('')

  const handleAddDelegate = () => {
    if (newDelegateFirst.trim() && newDelegateLast.trim()) {
      addParticipantDirect(newDelegateFirst.trim(), newDelegateLast.trim())
      setNewDelegateFirst('')
      setNewDelegateLast('')
      setShowAddDelegate(false)
    }
  }

  const handleAddPartner = () => {
    if (newPartnerName.trim()) {
      addContact(newPartnerName.trim())
      setNewPartnerName('')
      setShowAddPartner(false)
    }
  }

  const handleAddWaiting = () => {
    if (newWaitingName.trim()) {
      const parts = newWaitingName.trim().split(/\s+/)
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || ''
      addWaitingListEntry({
        first_name: firstName,
        last_name: lastName,
        email: '',
        source: '',
        interest_level: 'Flex',
        status: '🔄',
        notes: '',
      })
      setNewWaitingName('')
      setShowAddWaiting(false)
    }
  }

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-navy">
              👥 US Delegation ({filteredParticipants.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddDelegate(true)}
              className="px-3 py-1.5 text-[13px] font-medium bg-navy text-white rounded hover:bg-navy/90 transition-colors"
            >
              + Add Delegate
            </button>
          </div>

          {/* Add Delegate Inline Form */}
          {showAddDelegate && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <input
                type="text"
                placeholder="First Name"
                value={newDelegateFirst}
                onChange={(e) => setNewDelegateFirst(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDelegate()}
                className={`w-[140px] ${inputClasses}`}
                autoFocus
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newDelegateLast}
                onChange={(e) => setNewDelegateLast(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDelegate()}
                className={`w-[140px] ${inputClasses}`}
              />
              <button
                type="button"
                onClick={handleAddDelegate}
                className="px-3 py-1.5 text-[13px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowAddDelegate(false); setNewDelegateFirst(''); setNewDelegateLast('') }}
                className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className={thClasses}>Name</th>
                  <th className={thClasses}>Role</th>
                  <th className={thClasses}>Track</th>
                  <th className={thClasses}>Booking Type</th>
                  <th className={thClasses}>Route</th>
                  <th className={thClasses}>Flight</th>
                  <th className={thClasses}>Hotel</th>
                  <th className={thClasses}>Passport</th>
                  <th className={thClasses}>Visa</th>
                  <th className={thClasses}>Notes</th>
                  <th className={thClasses}></th>
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
                        className={`w-[100px] ${inputClasses}`}
                      />
                    </td>

                    {/* Track — select */}
                    <td className="p-2.5">
                      <select
                        defaultValue={p.service_track || 'Flex'}
                        onChange={(e) => updateParticipantField(p.id, 'service_track', e.target.value)}
                        className={selectClasses}
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
                        className={selectClasses}
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
                        className={`w-[110px] ${inputClasses}`}
                      />
                    </td>

                    {/* Flight — emoji select */}
                    <td className="p-2.5">
                      <select
                        defaultValue={p.flight_status || '⬜ Not booked'}
                        onChange={(e) => updateParticipantField(p.id, 'flight_status', e.target.value)}
                        className={selectClasses}
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
                        className={selectClasses}
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
                        className={selectClasses}
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
                        className={selectClasses}
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
                        className={`w-[180px] ${inputClasses}`}
                      />
                    </td>

                    {/* Delete */}
                    <td className="p-2.5">
                      <button
                        type="button"
                        onClick={() => deleteParticipant(p.id)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none transition-colors"
                        title="Remove delegate"
                      >
                        ✕
                      </button>
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
                  <th className={thClasses}>Name</th>
                  <th className={thClasses}>Track/Role</th>
                  <th className={thClasses}>Location</th>
                  <th className={thClasses}>Organization</th>
                  <th className={thClasses}>Notes</th>
                  <th className={thClasses}></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    {/* Name — editable input */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={c.name || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (c.name || ''))
                            updateContactField(c.id, 'name', e.target.value)
                        }}
                        className={`w-[140px] ${inputClasses} font-medium`}
                      />
                    </td>
                    {/* Track/Role — editable input */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={c.role || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (c.role || ''))
                            updateContactField(c.id, 'role', e.target.value)
                        }}
                        className={`w-[120px] ${inputClasses}`}
                      />
                    </td>
                    {/* Location — editable input */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={c.city || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (c.city || ''))
                            updateContactField(c.id, 'city', e.target.value)
                        }}
                        className={`w-[120px] ${inputClasses}`}
                      />
                    </td>
                    {/* Organization — editable input */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={c.organization || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (c.organization || ''))
                            updateContactField(c.id, 'organization', e.target.value)
                        }}
                        className={`w-[140px] ${inputClasses}`}
                      />
                    </td>
                    {/* Notes — editable input (reusing email field like HTML dashboard) */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={c.email || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (c.email || ''))
                            updateContactField(c.id, 'email', e.target.value)
                        }}
                        className={`w-[180px] ${inputClasses}`}
                      />
                    </td>
                    {/* Delete */}
                    <td className="p-2.5">
                      <button
                        type="button"
                        onClick={() => deleteContact(c.id)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none transition-colors"
                        title="Remove partner"
                      >
                        ✕
                      </button>
                    </td>
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

          {/* Add Partner Button / Inline Form */}
          <div className="mt-4">
            {showAddPartner ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
                <input
                  type="text"
                  placeholder="Partner Name"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()}
                  className={`w-[200px] ${inputClasses}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddPartner}
                  className="px-3 py-1.5 text-[13px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddPartner(false); setNewPartnerName('') }}
                  className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddPartner(true)}
                className="px-3 py-1.5 text-[13px] font-medium bg-navy text-white rounded hover:bg-navy/90 transition-colors"
              >
                + Add Partner
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ====== WAITING TO HEAR ====== */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-base font-semibold text-navy mb-1">
            ⏳ Waiting to Hear ({waitingList.length})
          </h3>
          <p className="text-[13px] text-gray-500 mb-4">
            Click ✅ Promote to add to delegation, ✕ to remove.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className={thClasses}>Name</th>
                  <th className={thClasses}>Role</th>
                  <th className={thClasses}>Track</th>
                  <th className={thClasses}>Status</th>
                  <th className={thClasses}>Notes</th>
                  <th className={thClasses}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitingList.map((w) => (
                  <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    {/* Name — display only */}
                    <td className="p-2.5 font-medium whitespace-nowrap">
                      {w.first_name} {w.last_name}
                    </td>
                    {/* Role — static from source */}
                    <td className="p-2.5 text-gray-600">
                      {w.source || '—'}
                    </td>
                    {/* Track — static from interest_level */}
                    <td className="p-2.5 text-gray-600">
                      {w.interest_level || '—'}
                    </td>
                    {/* Status — emoji select */}
                    <td className="p-2.5">
                      <select
                        defaultValue={w.status || '❓ Waiting'}
                        onChange={(e) => updateWaitingListEntry(w.id, { status: e.target.value })}
                        className={selectClasses}
                      >
                        {WAITING_STATUS_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </td>
                    {/* Notes — editable input */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={w.notes || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (w.notes || ''))
                            updateWaitingListEntry(w.id, { notes: e.target.value })
                        }}
                        className={`w-[180px] ${inputClasses}`}
                      />
                    </td>
                    {/* Actions — Promote + Delete */}
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => promoteToDelegate(w)}
                          className="px-2 py-1 text-[12px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                          title="Promote to delegation"
                        >
                          ✅ Promote
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteWaitingListEntry(w.id)}
                          className="text-red-400 hover:text-red-600 text-lg leading-none transition-colors"
                          title="Remove from waiting list"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {waitingList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-400">No one on the waiting list</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Waiting List Entry */}
          <div className="mt-4">
            {showAddWaiting ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
                <input
                  type="text"
                  placeholder="First Last"
                  value={newWaitingName}
                  onChange={(e) => setNewWaitingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWaiting()}
                  className={`w-[200px] ${inputClasses}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddWaiting}
                  className="px-3 py-1.5 text-[13px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddWaiting(false); setNewWaitingName('') }}
                  className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddWaiting(true)}
                className="px-3 py-1.5 text-[13px] font-medium bg-navy text-white rounded hover:bg-navy/90 transition-colors"
              >
                + Add
              </button>
            )}
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
                  <th className={thClasses}>City</th>
                  <th className={thClasses}>Dates</th>
                  <th className={thClasses}>Nights</th>
                  <th className={thClasses}>Property</th>
                  <th className={thClasses}>Rooms</th>
                  <th className={thClasses}>$/Night</th>
                  <th className={thClasses}>Status</th>
                  <th className={thClasses}>Notes</th>
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
                          className={`w-[100px] ${inputClasses}`}
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
                          className={`w-[180px] ${inputClasses}`}
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
                          className={`w-[60px] ${inputClasses}`}
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
                          className={`w-[90px] ${inputClasses}`}
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          defaultValue={l.booking_status || '⬜ Not started'}
                          onChange={(e) => updateLodgingField(l.id, 'booking_status', e.target.value)}
                          className={selectClasses}
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
                          className={`w-[180px] ${inputClasses}`}
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

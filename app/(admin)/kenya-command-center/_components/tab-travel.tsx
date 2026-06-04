'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plane, Download, Search, Check, X, ChevronDown, ChevronRight,
  Users, UserX, Save,
} from 'lucide-react'
import type { Participant } from './types'

type TravelParticipant = Participant & {
  gender?: string | null
  preferred_name?: string | null
}

interface TabTravelProps {
  participants: TravelParticipant[]
  updateParticipantField: (id: string, field: string, value: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

type SortField = 'name' | 'travel_needed' | 'travel_booked' | 'travel_form' | 'departure_airport' | 'gender' | 'service_track'
type SortDir = 'asc' | 'desc'

export function TabTravel({ participants, updateParticipantField, saveStatus }: TabTravelProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [showNonTraveling, setShowNonTraveling] = useState(true)
  const [filterTrack, setFilterTrack] = useState('all')

  // Only show approved / active participants (not removed)
  const active = useMemo(() =>
    participants.filter(p => p.application_status !== 'removed'),
    [participants]
  )

  const traveling = useMemo(() =>
    active.filter(p => p.travel_needed !== false),
    [active]
  )

  const nonTraveling = useMemo(() =>
    active.filter(p => p.travel_needed === false),
    [active]
  )

  // Stats
  const totalTravelers = traveling.length
  const booked = traveling.filter(p => p.travel_booked).length
  const formsDone = traveling.filter(p => p.travel_form_completed_at).length
  const needsAttention = traveling.filter(p => !p.travel_booked && p.travel_needed !== false).length

  // Sort + filter
  const sortAndFilter = useCallback((list: TravelParticipant[]) => {
    let filtered = list
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
        (p.legal_full_name || '').toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
      )
    }
    if (filterTrack !== 'all') {
      filtered = filtered.filter(p => p.service_track === filterTrack)
    }
    return filtered.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'name':
          cmp = `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
          break
        case 'travel_needed':
          cmp = (a.travel_needed === false ? 1 : 0) - (b.travel_needed === false ? 1 : 0)
          break
        case 'travel_booked':
          cmp = (a.travel_booked ? 1 : 0) - (b.travel_booked ? 1 : 0)
          break
        case 'travel_form':
          cmp = (a.travel_form_completed_at ? 1 : 0) - (b.travel_form_completed_at ? 1 : 0)
          break
        case 'departure_airport':
          cmp = (a.departure_airport || '').localeCompare(b.departure_airport || '')
          break
        case 'gender':
          cmp = (a.gender || '').localeCompare(b.gender || '')
          break
        case 'service_track':
          cmp = (a.service_track || '').localeCompare(b.service_track || '')
          break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [search, filterTrack, sortField, sortDir])

  const sortedTraveling = useMemo(() => sortAndFilter(traveling), [sortAndFilter, traveling])
  const sortedNonTraveling = useMemo(() => sortAndFilter(nonTraveling), [sortAndFilter, nonTraveling])

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-[10px] text-gray-400">
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </span>
  )

  // CSV export matching the spreadsheet columns
  const exportTravelCSV = () => {
    const headers = [
      'Travel Needed', 'Travel Booked', 'Full Name (as shown on ID)', 'Email Address',
      'Preferred Name for Name Tag', 'Contact Phone Number', 'Date of Birth', 'Gender',
      'Service Track', 'Type of Travel Required', 'Date In', 'Date Out',
      'Preferred Departure City Airport', 'Preferred Return City Airport',
      'Wheelchair / Special Assistance', 'Additional Accommodation Requests',
      'Date of Completion', 'Administration', 'Team Accommodation Notes',
    ]
    const rows = active.map(p => [
      p.travel_needed === false ? 'No' : 'Yes',
      p.travel_booked ? 'Yes' : 'No',
      p.legal_full_name || `${p.first_name} ${p.last_name}`,
      p.email,
      p.preferred_name || '',
      p.phone || '',
      p.date_of_birth || '',
      p.gender || '',
      p.service_track || '',
      p.travel_accommodation_type || '',
      p.travel_date_in || '',
      p.travel_date_out || '',
      p.departure_airport || '',
      p.return_airport || '',
      p.special_assistance || '',
      p.travel_notes || '',
      p.travel_form_completed_at ? new Date(p.travel_form_completed_at).toLocaleDateString() : '',
      p.admin_travel_notes || '',
      p.team_accommodation_notes || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`))

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kenya-travel-roster-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Inline cell helpers
  const toggleBool = (id: string, field: string, current: boolean | undefined) => {
    updateParticipantField(id, field, current ? 'false' : 'true')
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-100">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">Travelers</p>
                <p className="text-2xl font-bold text-navy">{totalTravelers}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">Booked</p>
                <p className="text-2xl font-bold text-green-600">{booked}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">Needs Booking</p>
                <p className="text-2xl font-bold text-amber-600">{needsAttention}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Plane className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">Forms Done</p>
                <p className="text-2xl font-bold text-navy">{formsDone}/{totalTravelers}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Plane className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <select
          value={filterTrack}
          onChange={(e) => setFilterTrack(e.target.value)}
          className="h-9 border rounded-lg px-3 text-sm text-gray-700"
        >
          <option value="all">All Tracks</option>
          <option value="Ministry">Ministry</option>
          <option value="Medical">Medical</option>
          <option value="Education">Education</option>
          <option value="Business">Business</option>
          <option value="Media">Media</option>
          <option value="Flex">Flex</option>
        </select>
        <div className="flex items-center gap-2 ml-auto">
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
          <Button size="sm" variant="outline" onClick={exportTravelCSV}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Traveling Delegation Table */}
      <Card className="border-gray-100 overflow-hidden">
        <CardHeader className="py-3 px-4 bg-blue-50/50 border-b">
          <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Traveling Delegation ({sortedTraveling.length})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap sticky left-0 bg-gray-50 z-10 min-w-[40px]">
                  <button onClick={() => toggleSort('travel_needed')} className="flex items-center hover:text-navy">
                    Need<SortIcon field="travel_needed" />
                  </button>
                </th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[50px]">
                  <button onClick={() => toggleSort('travel_booked')} className="flex items-center hover:text-navy">
                    Booked<SortIcon field="travel_booked" />
                  </button>
                </th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[160px]">
                  <button onClick={() => toggleSort('name')} className="flex items-center hover:text-navy">
                    Full Name (ID)<SortIcon field="name" />
                  </button>
                </th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[180px]">Email</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[120px]">Preferred Name</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[120px]">Phone</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[100px]">DOB</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[70px]">
                  <button onClick={() => toggleSort('gender')} className="flex items-center hover:text-navy">
                    Gender<SortIcon field="gender" />
                  </button>
                </th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[80px]">
                  <button onClick={() => toggleSort('service_track')} className="flex items-center hover:text-navy">
                    Track<SortIcon field="service_track" />
                  </button>
                </th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[110px]">Travel Type</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[100px]">Date In</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[100px]">Date Out</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[140px]">
                  <button onClick={() => toggleSort('departure_airport')} className="flex items-center hover:text-navy">
                    Depart Airport<SortIcon field="departure_airport" />
                  </button>
                </th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[140px]">Return Airport</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[140px]">Special Assist.</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[160px]">Accommodation Req.</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[100px]">
                  <button onClick={() => toggleSort('travel_form')} className="flex items-center hover:text-navy">
                    Form Done<SortIcon field="travel_form" />
                  </button>
                </th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[160px]">Administration</th>
                <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[160px]">Team Accomm. Notes</th>
              </tr>
            </thead>
            <tbody>
              {sortedTraveling.length === 0 ? (
                <tr><td colSpan={19} className="text-center py-8 text-gray-400">No travelers found</td></tr>
              ) : (
                sortedTraveling.map(p => (
                  <TravelRow key={p.id} p={p} updateField={updateParticipantField} toggleBool={toggleBool} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Non-Traveling Staff */}
      <Card className="border-gray-100 overflow-hidden">
        <button
          onClick={() => setShowNonTraveling(!showNonTraveling)}
          className="w-full flex items-center gap-2 py-3 px-4 bg-gray-50/80 border-b hover:bg-gray-100 transition-colors text-left"
        >
          {showNonTraveling ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          <UserX className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-600">
            Local / Non-Traveling Staff ({nonTraveling.length})
          </span>
          <span className="text-[11px] text-gray-400 ml-2">
            Staff and coordinators not requiring travel
          </span>
        </button>
        {showNonTraveling && (
          <div className="overflow-x-auto">
            {sortedNonTraveling.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No non-traveling staff. Toggle &quot;Travel Needed&quot; to move someone here.
              </div>
            ) : (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[40px]">Need</th>
                    <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[160px]">Full Name (ID)</th>
                    <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[180px]">Email</th>
                    <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[120px]">Preferred Name</th>
                    <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[120px]">Phone</th>
                    <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[80px]">Track</th>
                    <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[160px]">Administration</th>
                    <th className="px-2 py-2 font-semibold text-gray-600 whitespace-nowrap min-w-[160px]">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedNonTraveling.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50/50 transition-colors">
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => toggleBool(p.id, 'travel_needed', p.travel_needed)}
                          className="w-6 h-6 rounded border flex items-center justify-center hover:bg-green-50 transition-colors border-gray-300 bg-gray-50"
                          title="Click to mark as needing travel"
                        >
                          <X className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                      </td>
                      <td className="px-2 py-1.5 font-medium text-gray-900 whitespace-nowrap">
                        {p.legal_full_name || `${p.first_name} ${p.last_name}`}
                      </td>
                      <td className="px-2 py-1.5 text-gray-600">{p.email}</td>
                      <td className="px-2 py-1.5">
                        <EditableCell value={p.preferred_name || ''} onSave={(v) => updateParticipantField(p.id, 'preferred_name', v)} placeholder="Name tag..." />
                      </td>
                      <td className="px-2 py-1.5 text-gray-600">{p.phone || '—'}</td>
                      <td className="px-2 py-1.5">
                        {p.service_track && (
                          <Badge variant="outline" className="text-[10px] py-0 h-5">{p.service_track}</Badge>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <EditableCell value={p.admin_travel_notes || ''} onSave={(v) => updateParticipantField(p.id, 'admin_travel_notes', v)} placeholder="Admin notes..." />
                      </td>
                      <td className="px-2 py-1.5">
                        <EditableCell value={p.team_accommodation_notes || ''} onSave={(v) => updateParticipantField(p.id, 'team_accommodation_notes', v)} placeholder="Notes..." />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

// ============ Editable Cell ============

function EditableCell({ value, onSave, placeholder, type = 'text' }: {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  type?: 'text' | 'date' | 'select'
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const save = () => {
    if (draft !== value) onSave(draft)
    setEditing(false)
  }

  if (!editing) {
    return (
      <span
        onClick={() => { setDraft(value); setEditing(true) }}
        className={`cursor-pointer block truncate max-w-[200px] ${value ? 'text-gray-900' : 'text-gray-300 italic'}`}
        title={value || placeholder}
      >
        {value || placeholder || '—'}
      </span>
    )
  }

  return (
    <input
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
      autoFocus
      className="w-full border rounded px-1.5 py-0.5 text-[12px] focus:ring-1 focus:ring-navy/30 focus:border-navy"
      placeholder={placeholder}
    />
  )
}

// ============ Travel Row ============

function TravelRow({ p, updateField, toggleBool }: {
  p: TravelParticipant
  updateField: (id: string, field: string, value: string) => void
  toggleBool: (id: string, field: string, current: boolean | undefined) => void
}) {
  return (
    <tr className={`border-b hover:bg-blue-50/30 transition-colors ${!p.travel_booked ? 'bg-amber-50/20' : ''}`}>
      {/* Travel Needed */}
      <td className="px-2 py-1.5 sticky left-0 bg-white z-10">
        <button
          onClick={() => toggleBool(p.id, 'travel_needed', p.travel_needed)}
          className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
            p.travel_needed !== false
              ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
              : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
          }`}
          title={p.travel_needed !== false ? 'Needs travel — click to remove' : 'No travel needed — click to add'}
        >
          {p.travel_needed !== false ? <Check className="h-3.5 w-3.5 text-blue-600" /> : <X className="h-3.5 w-3.5 text-gray-400" />}
        </button>
      </td>
      {/* Travel Booked */}
      <td className="px-2 py-1.5">
        <button
          onClick={() => toggleBool(p.id, 'travel_booked', p.travel_booked)}
          className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
            p.travel_booked
              ? 'bg-green-50 border-green-400 hover:bg-green-100'
              : 'bg-white border-gray-300 hover:bg-amber-50'
          }`}
          title={p.travel_booked ? 'Booked — click to unmark' : 'Not booked — click to mark booked'}
        >
          {p.travel_booked ? <Check className="h-3.5 w-3.5 text-green-600" /> : <span className="w-3.5 h-3.5" />}
        </button>
      </td>
      {/* Full Name (as shown on ID) */}
      <td className="px-2 py-1.5 whitespace-nowrap">
        <EditableCell
          value={p.legal_full_name || `${p.first_name} ${p.last_name}`}
          onSave={(v) => updateField(p.id, 'legal_full_name', v)}
          placeholder="Legal name..."
        />
      </td>
      {/* Email */}
      <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{p.email}</td>
      {/* Preferred Name */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.preferred_name || ''} onSave={(v) => updateField(p.id, 'preferred_name', v)} placeholder="Name tag..." />
      </td>
      {/* Phone */}
      <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{p.phone || '—'}</td>
      {/* DOB */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.date_of_birth || ''} onSave={(v) => updateField(p.id, 'date_of_birth', v)} type="date" placeholder="DOB..." />
      </td>
      {/* Gender */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.gender || ''} onSave={(v) => updateField(p.id, 'gender', v)} placeholder="—" />
      </td>
      {/* Track */}
      <td className="px-2 py-1.5">
        {p.service_track && (
          <Badge variant="outline" className="text-[10px] py-0 h-5">{p.service_track}</Badge>
        )}
      </td>
      {/* Travel Type */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.travel_accommodation_type || ''} onSave={(v) => updateField(p.id, 'travel_accommodation_type', v)} placeholder="Air / Ground..." />
      </td>
      {/* Date In */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.travel_date_in || ''} onSave={(v) => updateField(p.id, 'travel_date_in', v)} type="date" />
      </td>
      {/* Date Out */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.travel_date_out || ''} onSave={(v) => updateField(p.id, 'travel_date_out', v)} type="date" />
      </td>
      {/* Departure Airport */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.departure_airport || ''} onSave={(v) => updateField(p.id, 'departure_airport', v)} placeholder="e.g. JFK" />
      </td>
      {/* Return Airport */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.return_airport || ''} onSave={(v) => updateField(p.id, 'return_airport', v)} placeholder="e.g. JFK" />
      </td>
      {/* Special Assistance */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.special_assistance || ''} onSave={(v) => updateField(p.id, 'special_assistance', v)} placeholder="None" />
      </td>
      {/* Additional Accommodation Requests */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.travel_notes || ''} onSave={(v) => updateField(p.id, 'travel_notes', v)} placeholder="Requests..." />
      </td>
      {/* Date of Completion */}
      <td className="px-2 py-1.5 whitespace-nowrap">
        {p.travel_form_completed_at ? (
          <Badge className="bg-green-100 text-green-700 text-[10px] py-0 h-5">
            {new Date(p.travel_form_completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] py-0 h-5 text-gray-400">Pending</Badge>
        )}
      </td>
      {/* Administration */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.admin_travel_notes || ''} onSave={(v) => updateField(p.id, 'admin_travel_notes', v)} placeholder="Admin notes..." />
      </td>
      {/* Team Accommodation Notes */}
      <td className="px-2 py-1.5">
        <EditableCell value={p.team_accommodation_notes || ''} onSave={(v) => updateField(p.id, 'team_accommodation_notes', v)} placeholder="Accomm. notes..." />
      </td>
    </tr>
  )
}

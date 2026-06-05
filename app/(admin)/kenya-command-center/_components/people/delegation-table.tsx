'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Send } from 'lucide-react'
import type { Participant } from '../types'

const FLIGHT_OPTIONS = ['⬜ Not booked', '❓ Confirm', '🔄 Searching', '✅ Booked']
const HOTEL_OPTIONS = ['⬜ Not booked', '❓ Confirm', '🔄 Searching', '✅ Confirmed']
const PASSPORT_OPTIONS = ['❓ Unknown', '⬜ Need', '🔄 Renewing', '✅ Valid']
const VISA_OPTIONS = ['❓ Unknown', '⬜ Need', '🔄 Renewing', '✅ Valid']
const TRACK_OPTIONS = ['Ministry', 'Medical', 'Education', 'Business', 'Media', 'Flex']
const BOOKING_OPTIONS = ['Group', 'Individual', 'TBD']

const inputClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
const selectClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
const thClasses = "text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide"

interface KenyaInviteResult {
  success?: boolean
  emailSent?: boolean
  emailError?: string
  error?: string
}

interface ParticipantWithRole extends Participant {
  role?: string
}

export interface DelegationTableProps {
  filteredParticipants: Participant[]
  setSelectedParticipant: (p: Participant) => void
  updateParticipantField: (id: string, field: string, value: string) => void
  deleteParticipant: (id: string) => void
  addParticipantDirect: (firstName: string, lastName: string) => void
  sendKenyaInvite: (invite: { firstName: string; lastName: string; email: string; track: string; role: string; sendEmail: boolean }) => Promise<KenyaInviteResult>
  onOpenInviteModal?: () => void
}

export function DelegationTable({
  filteredParticipants,
  setSelectedParticipant,
  updateParticipantField,
  deleteParticipant,
  addParticipantDirect,
  sendKenyaInvite,
  onOpenInviteModal,
}: DelegationTableProps) {
  const [showAddDelegate, setShowAddDelegate] = useState(false)
  const [newDelegateFirst, setNewDelegateFirst] = useState('')
  const [newDelegateLast, setNewDelegateLast] = useState('')
  const [newDelegateEmail, setNewDelegateEmail] = useState('')
  const [newDelegateTrack, setNewDelegateTrack] = useState('Flex')
  const [addingDelegate, setAddingDelegate] = useState(false)
  const [addDelegateResult, setAddDelegateResult] = useState<{ success: boolean; message: string } | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleAddDelegate = async () => {
    if (!newDelegateFirst.trim()) return
    setAddingDelegate(true)
    setAddDelegateResult(null)
    try {
      if (newDelegateEmail.trim()) {
        // Has email — use invite flow (adds participant + sends email)
        const data = await sendKenyaInvite({
          firstName: newDelegateFirst.trim(),
          lastName: newDelegateLast.trim(),
          email: newDelegateEmail.trim(),
          track: newDelegateTrack,
          role: 'member',
          sendEmail: true,
        })
        if (data.success) {
          const msg = data.emailSent
            ? `Added & invite sent to ${newDelegateEmail.trim()}`
            : `Added but email failed${data.emailError ? ': ' + data.emailError : ''}`
          setAddDelegateResult({ success: Boolean(data.emailSent), message: msg })
          setNewDelegateFirst('')
          setNewDelegateLast('')
          setNewDelegateEmail('')
          setNewDelegateTrack('Flex')
        } else {
          setAddDelegateResult({ success: false, message: data.error || 'Failed to add delegate' })
        }
      } else {
        // No email — just add participant (no invite sent)
        addParticipantDirect(newDelegateFirst.trim(), newDelegateLast.trim())
        setAddDelegateResult({ success: true, message: 'Added (no email — no invite sent)' })
        setNewDelegateFirst('')
        setNewDelegateLast('')
        setNewDelegateTrack('Flex')
      }
    } catch (err: unknown) {
      setAddDelegateResult({ success: false, message: err instanceof Error ? err.message : 'Failed' })
    } finally {
      setAddingDelegate(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-navy">
            👥 US Delegation ({filteredParticipants.length})
          </h3>
          <div className="flex gap-2">
            {onOpenInviteModal && (
              <button
                type="button"
                onClick={onOpenInviteModal}
                className="px-3 py-1.5 text-[13px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                Invite Delegate
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAddDelegate(true)}
              className="px-3 py-1.5 text-[13px] font-medium bg-navy text-white rounded hover:bg-navy/90 transition-colors"
            >
              + Add Delegate
            </button>
          </div>
        </div>

        {/* Add Delegate Inline Form */}
        {showAddDelegate && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            {addDelegateResult && (
              <div className={`p-2 rounded text-[13px] font-medium ${addDelegateResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {addDelegateResult.message}
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="First Name *"
                value={newDelegateFirst}
                onChange={(e) => setNewDelegateFirst(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDelegate()}
                className={`w-[130px] ${inputClasses}`}
                autoFocus
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newDelegateLast}
                onChange={(e) => setNewDelegateLast(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDelegate()}
                className={`w-[130px] ${inputClasses}`}
              />
              <input
                type="email"
                placeholder="Email (sends invite)"
                value={newDelegateEmail}
                onChange={(e) => setNewDelegateEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDelegate()}
                className={`w-[200px] ${inputClasses}`}
              />
              <select
                value={newDelegateTrack}
                onChange={(e) => setNewDelegateTrack(e.target.value)}
                className={`w-[100px] ${inputClasses}`}
              >
                <option value="Flex">Flex</option>
                <option value="Ministry">Ministry</option>
                <option value="Medical">Medical</option>
                <option value="Education">Education</option>
                <option value="Business">Business</option>
                <option value="Media">Media</option>
              </select>
              <button
                type="button"
                onClick={handleAddDelegate}
                disabled={addingDelegate || !newDelegateFirst.trim()}
                className="px-3 py-1.5 text-[13px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {addingDelegate ? 'Adding...' : newDelegateEmail.trim() ? '+ Add & Send Invite' : '+ Add'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddDelegate(false); setNewDelegateFirst(''); setNewDelegateLast(''); setNewDelegateEmail(''); setNewDelegateTrack('Flex'); setAddDelegateResult(null) }}
                className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-gray-500">Add email to auto-send the Kenya trip invitation. Leave blank to add without emailing.</p>
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
                <th className={thClasses}>Email</th>
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

                  {/* Role — select */}
                  <td className="p-2.5">
                    <select
                      defaultValue={(p as ParticipantWithRole).role || 'delegate'}
                      onChange={(e) => updateParticipantField(p.id, 'role', e.target.value)}
                      className={`w-[110px] ${inputClasses}`}
                    >
                      <option value="delegate">Delegate</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="admin">Admin</option>
                      <option value="leader">Leader</option>
                    </select>
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

                  {/* Email — editable */}
                  <td className="p-2.5">
                    <input
                      type="email"
                      defaultValue={p.email || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (p.email || ''))
                          updateParticipantField(p.id, 'email', e.target.value)
                      }}
                      placeholder="Add email..."
                      className={`w-[180px] ${inputClasses} ${!p.email ? 'text-gray-400 italic' : ''}`}
                    />
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

                  {/* Delete — with confirmation */}
                  <td className="p-2.5">
                    {confirmDeleteId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => { deleteParticipant(p.id); setConfirmDeleteId(null) }}
                          className="px-2 py-0.5 text-[11px] font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Archive
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 text-[11px] font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none transition-colors"
                        title="Remove delegate"
                      >
                        ✕
                      </button>
                    )}
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
  )
}

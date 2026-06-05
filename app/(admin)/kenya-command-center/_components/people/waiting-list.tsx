'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { WaitingListEntry } from '../types'

const WAITING_STATUS_OPTIONS = ['🔄 In conversation', '❓ Waiting', '⬜ Not contacted', '📧 Contacted', '✅ Promoted', '❌ Declined']
const TRACK_OPTIONS = ['Flex', 'Ministry', 'Medical', 'Education', 'Business', 'Media']

const inputClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
const selectClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
const thClasses = "text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide"

type WaitingListCreateInput = Omit<WaitingListEntry, 'id' | 'trip_id' | 'created_at' | 'promoted_to_participant_id'>
type WaitingListUpdateInput = Partial<Pick<WaitingListEntry, 'email' | 'phone' | 'source' | 'interest_level' | 'status' | 'notes'>>

interface WaitingListEmailResult {
  success?: boolean
}

export interface WaitingListProps {
  waitingList: WaitingListEntry[]
  addWaitingListEntry: (entry: WaitingListCreateInput) => void
  updateWaitingListEntry: (id: string, updates: WaitingListUpdateInput) => void
  deleteWaitingListEntry: (id: string) => void
  promoteToDelegate: (entry: WaitingListEntry) => void
  sendWaitingListEmail: (waitingListId: string, action: 'entice' | 'welcome' | 'decline') => Promise<WaitingListEmailResult>
}

export function WaitingList({
  waitingList,
  addWaitingListEntry,
  updateWaitingListEntry,
  deleteWaitingListEntry,
  promoteToDelegate,
  sendWaitingListEmail,
}: WaitingListProps) {
  const [showAddWaiting, setShowAddWaiting] = useState(false)
  const [newEntry, setNewEntry] = useState({ firstName: '', lastName: '', email: '', phone: '', source: '', track: 'Flex' })
  const [sendingEmail, setSendingEmail] = useState<{ id: string; action: string } | null>(null)
  const [emailResult, setEmailResult] = useState<{ id: string; action: string; success: boolean } | null>(null)

  const handleAddWaiting = () => {
    if (newEntry.firstName.trim()) {
      addWaitingListEntry({
        first_name: newEntry.firstName.trim(),
        last_name: newEntry.lastName.trim(),
        email: newEntry.email.trim(),
        phone: newEntry.phone.trim(),
        source: newEntry.source.trim(),
        interest_level: newEntry.track,
        status: '🔄',
        follow_up_date: null,
        follow_up_notes: null,
        notes: '',
      })
      setNewEntry({ firstName: '', lastName: '', email: '', phone: '', source: '', track: 'Flex' })
      setShowAddWaiting(false)
    }
  }

  const handleSendEmail = async (entry: WaitingListEntry, action: 'entice' | 'welcome' | 'decline') => {
    setSendingEmail({ id: entry.id, action })
    setEmailResult(null)
    try {
      if (action === 'welcome') {
        // Promote first, then send welcome email
        promoteToDelegate(entry)
      }
      const result = await sendWaitingListEmail(entry.id, action)
      setEmailResult({ id: entry.id, action, success: result?.success ?? false })
    } catch {
      setEmailResult({ id: entry.id, action, success: false })
    } finally {
      setSendingEmail(null)
      setTimeout(() => setEmailResult(null), 3000)
    }
  }

  const isPromoted = (w: WaitingListEntry) => w.status === '✅ Promoted' || w.status === 'promoted'
  const isDeclined = (w: WaitingListEntry) => w.status === '❌ Declined'

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-base font-semibold text-navy mb-1">
          ⏳ Waiting to Hear ({waitingList.length})
        </h3>
        <p className="text-[13px] text-gray-500 mb-4">
          Send trip info, promote to delegation, or handle declines with email workflows.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className={thClasses}>Name</th>
                <th className={thClasses}>Email</th>
                <th className={thClasses}>Phone</th>
                <th className={thClasses}>Source</th>
                <th className={thClasses}>Track</th>
                <th className={thClasses}>Status</th>
                <th className={thClasses}>Notes</th>
                <th className={thClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {waitingList.map((w) => (
                <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  {/* Name */}
                  <td className="p-2.5 font-medium whitespace-nowrap">
                    {w.first_name} {w.last_name}
                  </td>
                  {/* Email */}
                  <td className="p-2.5">
                    <input
                      type="email"
                      defaultValue={w.email || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (w.email || ''))
                          updateWaitingListEntry(w.id, { email: e.target.value })
                      }}
                      className={`w-[160px] ${inputClasses}`}
                      placeholder="email@example.com"
                    />
                  </td>
                  {/* Phone */}
                  <td className="p-2.5">
                    <input
                      type="text"
                      defaultValue={w.phone || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (w.phone || ''))
                          updateWaitingListEntry(w.id, { phone: e.target.value })
                      }}
                      className={`w-[110px] ${inputClasses}`}
                    />
                  </td>
                  {/* Source */}
                  <td className="p-2.5 text-gray-600">
                    <input
                      type="text"
                      defaultValue={w.source || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (w.source || ''))
                          updateWaitingListEntry(w.id, { source: e.target.value })
                      }}
                      className={`w-[100px] ${inputClasses}`}
                      placeholder="How we know them"
                    />
                  </td>
                  {/* Track */}
                  <td className="p-2.5">
                    <select
                      defaultValue={w.interest_level || 'Flex'}
                      onChange={(e) => updateWaitingListEntry(w.id, { interest_level: e.target.value })}
                      className={`w-[90px] ${selectClasses}`}
                    >
                      {TRACK_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  {/* Status */}
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
                  {/* Notes */}
                  <td className="p-2.5">
                    <input
                      type="text"
                      defaultValue={w.notes || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (w.notes || ''))
                          updateWaitingListEntry(w.id, { notes: e.target.value })
                      }}
                      className={`w-[140px] ${inputClasses}`}
                    />
                  </td>
                  {/* Actions */}
                  <td className="p-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Send Trip Info — only if has email and not already promoted/declined */}
                      {w.email && !isPromoted(w) && !isDeclined(w) && (
                        <button
                          type="button"
                          onClick={() => handleSendEmail(w, 'entice')}
                          disabled={sendingEmail?.id === w.id}
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                            emailResult?.id === w.id && emailResult.action === 'entice'
                              ? emailResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                          title="Send trip info email"
                        >
                          {sendingEmail?.id === w.id && sendingEmail.action === 'entice'
                            ? '⏳...'
                            : emailResult?.id === w.id && emailResult.action === 'entice'
                              ? emailResult.success ? '✓ Sent' : '✗ Fail'
                              : '✉️ Trip Info'}
                        </button>
                      )}
                      {/* Promote — only if not already promoted/declined */}
                      {!isPromoted(w) && !isDeclined(w) && (
                        <button
                          type="button"
                          onClick={() => handleSendEmail(w, 'welcome')}
                          disabled={sendingEmail?.id === w.id}
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                            emailResult?.id === w.id && emailResult.action === 'welcome'
                              ? emailResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                          title="Promote to delegation + send welcome email"
                        >
                          {sendingEmail?.id === w.id && sendingEmail.action === 'welcome'
                            ? '⏳...'
                            : emailResult?.id === w.id && emailResult.action === 'welcome'
                              ? emailResult.success ? '✓ Promoted' : '✗ Fail'
                              : '✅ Promote'}
                        </button>
                      )}
                      {/* Can't Attend — only if has email and not already promoted/declined */}
                      {w.email && !isPromoted(w) && !isDeclined(w) && (
                        <button
                          type="button"
                          onClick={() => handleSendEmail(w, 'decline')}
                          disabled={sendingEmail?.id === w.id}
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                            emailResult?.id === w.id && emailResult.action === 'decline'
                              ? emailResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title="Mark as can't attend + send decline email"
                        >
                          {sendingEmail?.id === w.id && sendingEmail.action === 'decline'
                            ? '⏳...'
                            : emailResult?.id === w.id && emailResult.action === 'decline'
                              ? emailResult.success ? '✓ Done' : '✗ Fail'
                              : "🚫 Can't Attend"}
                        </button>
                      )}
                      {/* Status badges for promoted/declined */}
                      {isPromoted(w) && (
                        <span className="px-2 py-1 text-[11px] font-medium bg-green-100 text-green-700 rounded">Promoted</span>
                      )}
                      {isDeclined(w) && (
                        <span className="px-2 py-1 text-[11px] font-medium bg-gray-100 text-gray-500 rounded">Declined</span>
                      )}
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
                  <td colSpan={8} className="p-6 text-center text-gray-400">No one on the waiting list</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Waiting List Entry */}
        <div className="mt-4">
          {showAddWaiting ? (
            <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={newEntry.firstName}
                  onChange={(e) => setNewEntry(p => ({ ...p, firstName: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWaiting()}
                  className={`w-[130px] ${inputClasses}`}
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newEntry.lastName}
                  onChange={(e) => setNewEntry(p => ({ ...p, lastName: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWaiting()}
                  className={`w-[130px] ${inputClasses}`}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newEntry.email}
                  onChange={(e) => setNewEntry(p => ({ ...p, email: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWaiting()}
                  className={`w-[170px] ${inputClasses}`}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Phone"
                  value={newEntry.phone}
                  onChange={(e) => setNewEntry(p => ({ ...p, phone: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWaiting()}
                  className={`w-[130px] ${inputClasses}`}
                />
                <input
                  type="text"
                  placeholder="Source (how we know them)"
                  value={newEntry.source}
                  onChange={(e) => setNewEntry(p => ({ ...p, source: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWaiting()}
                  className={`w-[170px] ${inputClasses}`}
                />
                <select
                  value={newEntry.track}
                  onChange={(e) => setNewEntry(p => ({ ...p, track: e.target.value }))}
                  className={`w-[100px] ${selectClasses}`}
                >
                  {TRACK_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddWaiting}
                  className="px-3 py-1.5 text-[13px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddWaiting(false); setNewEntry({ firstName: '', lastName: '', email: '', phone: '', source: '', track: 'Flex' }) }}
                  className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
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
  )
}

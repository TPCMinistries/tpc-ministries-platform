'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { WaitingListEntry } from '../types'

const WAITING_STATUS_OPTIONS = ['🔄 In conversation', '❓ Waiting', '⬜ Not contacted']

const inputClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
const selectClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
const thClasses = "text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide"

export interface WaitingListProps {
  waitingList: WaitingListEntry[]
  addWaitingListEntry: (entry: any) => void
  updateWaitingListEntry: (id: string, updates: any) => void
  deleteWaitingListEntry: (id: string) => void
  promoteToDelegate: (entry: WaitingListEntry) => void
}

export function WaitingList({
  waitingList,
  addWaitingListEntry,
  updateWaitingListEntry,
  deleteWaitingListEntry,
  promoteToDelegate,
}: WaitingListProps) {
  const [showAddWaiting, setShowAddWaiting] = useState(false)
  const [newWaitingName, setNewWaitingName] = useState('')

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
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { Contact } from '../types'

const inputClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
const thClasses = "text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide"

export interface PartnersTableProps {
  contacts: Contact[]
  updateContactField: (id: string, field: string, value: string) => void
  addContact: (name: string) => void
  deleteContact: (id: string) => void
}

export function PartnersTable({
  contacts,
  updateContactField,
  addContact,
  deleteContact,
}: PartnersTableProps) {
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [newPartnerName, setNewPartnerName] = useState('')

  const handleAddPartner = () => {
    if (newPartnerName.trim()) {
      addContact(newPartnerName.trim())
      setNewPartnerName('')
      setShowAddPartner(false)
    }
  }

  return (
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
  )
}

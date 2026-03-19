'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { Contact } from '../types'

const ROLE_OPTIONS = ['host', 'translator', 'driver', 'pastor', 'coordinator', 'medical', 'security', 'other']

const inputClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
const selectClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
const thClasses = "text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide"

export interface PartnersTableProps {
  contacts: Contact[]
  updateContactField: (id: string, field: string, value: string) => void
  addContact: (name: string, fields?: { email?: string; phone?: string; organization?: string; role?: string; city?: string }) => void
  deleteContact: (id: string) => void
  sendPartnerInfoRequest: (contactId: string) => Promise<any>
}

export function PartnersTable({
  contacts,
  updateContactField,
  addContact,
  deleteContact,
  sendPartnerInfoRequest,
}: PartnersTableProps) {
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [newPartner, setNewPartner] = useState({ name: '', email: '', phone: '', organization: '', role: '', city: '' })
  const [sendingInfoRequest, setSendingInfoRequest] = useState<string | null>(null)
  const [infoRequestResult, setInfoRequestResult] = useState<{ id: string; success: boolean } | null>(null)

  const handleAddPartner = () => {
    if (newPartner.name.trim()) {
      addContact(newPartner.name.trim(), {
        email: newPartner.email.trim() || undefined,
        phone: newPartner.phone.trim() || undefined,
        organization: newPartner.organization.trim() || undefined,
        role: newPartner.role || undefined,
        city: newPartner.city.trim() || undefined,
      })
      setNewPartner({ name: '', email: '', phone: '', organization: '', role: '', city: '' })
      setShowAddPartner(false)
    }
  }

  const handleSendInfoRequest = async (contactId: string) => {
    setSendingInfoRequest(contactId)
    setInfoRequestResult(null)
    try {
      const result = await sendPartnerInfoRequest(contactId)
      setInfoRequestResult({ id: contactId, success: result?.success ?? false })
    } catch {
      setInfoRequestResult({ id: contactId, success: false })
    } finally {
      setSendingInfoRequest(null)
      setTimeout(() => setInfoRequestResult(null), 3000)
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
                <th className={thClasses}>Email</th>
                <th className={thClasses}>Phone</th>
                <th className={thClasses}>Role</th>
                <th className={thClasses}>Organization</th>
                <th className={thClasses}>City</th>
                <th className={thClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  {/* Name */}
                  <td className="p-2.5">
                    <input
                      type="text"
                      defaultValue={c.name || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (c.name || ''))
                          updateContactField(c.id, 'name', e.target.value)
                      }}
                      className={`w-[130px] ${inputClasses} font-medium`}
                    />
                  </td>
                  {/* Email */}
                  <td className="p-2.5">
                    <input
                      type="email"
                      defaultValue={c.email || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (c.email || ''))
                          updateContactField(c.id, 'email', e.target.value)
                      }}
                      className={`w-[160px] ${inputClasses}`}
                      placeholder="email@example.com"
                    />
                  </td>
                  {/* Phone */}
                  <td className="p-2.5">
                    <input
                      type="text"
                      defaultValue={c.phone || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (c.phone || ''))
                          updateContactField(c.id, 'phone', e.target.value)
                      }}
                      className={`w-[120px] ${inputClasses}`}
                      placeholder="+254..."
                    />
                  </td>
                  {/* Role */}
                  <td className="p-2.5">
                    <select
                      defaultValue={c.role || ''}
                      onChange={(e) => updateContactField(c.id, 'role', e.target.value)}
                      className={`w-[110px] ${selectClasses}`}
                    >
                      <option value="">—</option>
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  {/* Organization */}
                  <td className="p-2.5">
                    <input
                      type="text"
                      defaultValue={c.organization || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (c.organization || ''))
                          updateContactField(c.id, 'organization', e.target.value)
                      }}
                      className={`w-[130px] ${inputClasses}`}
                    />
                  </td>
                  {/* City */}
                  <td className="p-2.5">
                    <input
                      type="text"
                      defaultValue={c.city || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (c.city || ''))
                          updateContactField(c.id, 'city', e.target.value)
                      }}
                      className={`w-[100px] ${inputClasses}`}
                    />
                  </td>
                  {/* Actions */}
                  <td className="p-2.5">
                    <div className="flex items-center gap-2">
                      {c.email && (
                        <button
                          type="button"
                          onClick={() => handleSendInfoRequest(c.id)}
                          disabled={sendingInfoRequest === c.id}
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                            infoRequestResult?.id === c.id
                              ? infoRequestResult.success
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                          title="Send info request form link"
                        >
                          {sendingInfoRequest === c.id
                            ? '⏳ Sending...'
                            : infoRequestResult?.id === c.id
                              ? infoRequestResult.success ? '✓ Sent' : '✗ Failed'
                              : '📧 Request Info'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteContact(c.id)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none transition-colors"
                        title="Remove partner"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">No partners added yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Partner Button / Inline Form */}
        <div className="mt-4">
          {showAddPartner ? (
            <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Name *"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()}
                  className={`w-[150px] ${inputClasses}`}
                  autoFocus
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner(p => ({ ...p, email: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()}
                  className={`w-[170px] ${inputClasses}`}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newPartner.phone}
                  onChange={(e) => setNewPartner(p => ({ ...p, phone: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()}
                  className={`w-[130px] ${inputClasses}`}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Organization"
                  value={newPartner.organization}
                  onChange={(e) => setNewPartner(p => ({ ...p, organization: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()}
                  className={`w-[150px] ${inputClasses}`}
                />
                <select
                  value={newPartner.role}
                  onChange={(e) => setNewPartner(p => ({ ...p, role: e.target.value }))}
                  className={`w-[130px] ${selectClasses}`}
                >
                  <option value="">Role...</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="City"
                  value={newPartner.city}
                  onChange={(e) => setNewPartner(p => ({ ...p, city: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()}
                  className={`w-[120px] ${inputClasses}`}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddPartner}
                  className="px-3 py-1.5 text-[13px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Add Partner
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddPartner(false); setNewPartner({ name: '', email: '', phone: '', organization: '', role: '', city: '' }) }}
                  className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
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

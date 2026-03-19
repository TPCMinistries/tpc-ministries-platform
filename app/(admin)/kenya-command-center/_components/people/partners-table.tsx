'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { Contact } from '../types'

const ROLE_OPTIONS = ['leader', 'host', 'translator', 'driver', 'pastor', 'coordinator', 'medical', 'security', 'educator', 'government', 'other']

const inputClasses = "bg-transparent border border-gray-200 rounded px-2 py-1.5 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none w-full"
const selectClasses = "bg-transparent border border-gray-200 rounded px-2 py-1.5 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer w-full"
const labelClasses = "text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1 block"
const btnClasses = "px-2.5 py-1.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap"

export interface PartnersTableProps {
  contacts: Contact[]
  updateContactField: (id: string, field: string, value: string) => void
  addContact: (name: string, fields?: { email?: string; phone?: string; organization?: string; role?: string; city?: string }) => void
  deleteContact: (id: string) => void
  sendPartnerInfoRequest: (contactId: string) => Promise<any>
  sendPartnerAction: (contactId: string, action: string, payload?: { subject?: string; message?: string }) => Promise<any>
}

export function PartnersTable({
  contacts,
  updateContactField,
  addContact,
  deleteContact,
  sendPartnerInfoRequest,
  sendPartnerAction,
}: PartnersTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [newPartner, setNewPartner] = useState({ name: '', email: '', phone: '', organization: '', role: '', city: '' })

  // Email compose state
  const [composeForId, setComposeForId] = useState<string | null>(null)
  const [composeSubject, setComposeSubject] = useState('')
  const [composeMessage, setComposeMessage] = useState('')

  // Action feedback
  const [actionStatus, setActionStatus] = useState<Record<string, { action: string; success: boolean } | null>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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

  const handleAction = async (contactId: string, action: string, payload?: { subject?: string; message?: string }) => {
    setActionLoading(`${contactId}-${action}`)
    setActionStatus(prev => ({ ...prev, [contactId]: null }))
    try {
      const result = await sendPartnerAction(contactId, action, payload)
      setActionStatus(prev => ({ ...prev, [contactId]: { action, success: result?.success ?? false } }))
      if (action === 'custom_email' && result?.success) {
        setComposeForId(null)
        setComposeSubject('')
        setComposeMessage('')
      }
    } catch {
      setActionStatus(prev => ({ ...prev, [contactId]: { action, success: false } }))
    } finally {
      setActionLoading(null)
      setTimeout(() => setActionStatus(prev => ({ ...prev, [contactId]: null })), 3000)
    }
  }

  const handleLegacyInfoRequest = async (contactId: string) => {
    setActionLoading(`${contactId}-info_request`)
    try {
      const result = await sendPartnerInfoRequest(contactId)
      setActionStatus(prev => ({ ...prev, [contactId]: { action: 'info_request', success: result?.success ?? false } }))
    } catch {
      setActionStatus(prev => ({ ...prev, [contactId]: { action: 'info_request', success: false } }))
    } finally {
      setActionLoading(null)
      setTimeout(() => setActionStatus(prev => ({ ...prev, [contactId]: null })), 3000)
    }
  }

  const getStatusBadge = (contactId: string) => {
    const s = actionStatus[contactId]
    if (!s) return null
    return (
      <span className={`ml-2 px-2 py-0.5 text-[10px] font-semibold rounded ${s.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {s.success ? '✓ Sent' : '✗ Failed'}
      </span>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-navy">
            🤝 In-Country Partners ({contacts.length})
          </h3>
          <p className="text-[11px] text-gray-400">Click a partner to expand details</p>
        </div>

        {/* Partner Cards */}
        <div className="space-y-2">
          {contacts.map((c) => {
            const isExpanded = expandedId === c.id
            const isComposing = composeForId === c.id
            const hasEmail = !!c.email
            const isLoading = actionLoading?.startsWith(c.id)

            return (
              <div key={c.id} className={`border rounded-lg transition-all ${isExpanded ? 'border-navy/30 bg-gray-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                {/* Collapsed Row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(c.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  {/* Summary Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 truncate">{c.name || 'Unnamed'}</span>
                      {c.role && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded">{c.role}</span>}
                      {c.is_primary && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gold/20 text-gold-700 rounded">Primary</span>}
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-gray-500 mt-0.5">
                      {c.organization && <span>{c.organization}</span>}
                      {c.city && <span>📍 {c.city}</span>}
                      {c.email && <span>✉ {c.email}</span>}
                      {c.phone && <span>📱 {c.phone}</span>}
                      {!c.email && !c.phone && <span className="text-amber-500 italic">No contact info</span>}
                    </div>
                  </div>

                  {/* Quick Actions (always visible) */}
                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {hasEmail && (
                      <button
                        type="button"
                        onClick={() => { setComposeForId(isComposing ? null : c.id); setExpandedId(c.id) }}
                        className={`${btnClasses} ${isComposing ? 'bg-navy text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                      >
                        ✉ Email
                      </button>
                    )}
                    {hasEmail && (
                      <button
                        type="button"
                        onClick={() => handleAction(c.id, 'team_signup_link')}
                        disabled={!!isLoading}
                        className={`${btnClasses} bg-green-50 text-green-700 hover:bg-green-100`}
                      >
                        {actionLoading === `${c.id}-team_signup_link` ? '⏳' : '📋'} Signup Link
                      </button>
                    )}
                    {getStatusBadge(c.id)}
                    <button
                      type="button"
                      onClick={() => deleteContact(c.id)}
                      className="text-red-300 hover:text-red-600 text-sm leading-none transition-colors ml-1"
                      title="Remove partner"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Expand indicator */}
                  <span className={`text-gray-400 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
                    {/* Compose Email Panel */}
                    {isComposing && (
                      <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-2">
                        <p className="text-xs font-semibold text-blue-800 mb-1">Compose Email to {c.name}</p>
                        <input
                          type="text"
                          placeholder="Subject"
                          value={composeSubject}
                          onChange={(e) => setComposeSubject(e.target.value)}
                          className={`${inputClasses} border-blue-200 focus:border-blue-500`}
                        />
                        <textarea
                          placeholder="Message..."
                          value={composeMessage}
                          onChange={(e) => setComposeMessage(e.target.value)}
                          rows={4}
                          className={`${inputClasses} border-blue-200 focus:border-blue-500 resize-y`}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAction(c.id, 'custom_email', { subject: composeSubject, message: composeMessage })}
                            disabled={!composeSubject.trim() || !composeMessage.trim() || actionLoading === `${c.id}-custom_email`}
                            className={`${btnClasses} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50`}
                          >
                            {actionLoading === `${c.id}-custom_email` ? '⏳ Sending...' : '📨 Send Email'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setComposeForId(null); setComposeSubject(''); setComposeMessage('') }}
                            className={`${btnClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Editable Fields Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className={labelClasses}>Name</label>
                        <input type="text" defaultValue={c.name || ''} onBlur={(e) => { if (e.target.value !== (c.name || '')) updateContactField(c.id, 'name', e.target.value) }} className={`${inputClasses} font-medium`} />
                      </div>
                      <div>
                        <label className={labelClasses}>Email</label>
                        <input type="email" defaultValue={c.email || ''} onBlur={(e) => { if (e.target.value !== (c.email || '')) updateContactField(c.id, 'email', e.target.value) }} className={inputClasses} placeholder="email@example.com" />
                      </div>
                      <div>
                        <label className={labelClasses}>Phone</label>
                        <input type="text" defaultValue={c.phone || ''} onBlur={(e) => { if (e.target.value !== (c.phone || '')) updateContactField(c.id, 'phone', e.target.value) }} className={inputClasses} placeholder="+254..." />
                      </div>
                      <div>
                        <label className={labelClasses}>WhatsApp</label>
                        <input type="text" defaultValue={c.whatsapp || ''} onBlur={(e) => { if (e.target.value !== (c.whatsapp || '')) updateContactField(c.id, 'whatsapp', e.target.value) }} className={inputClasses} placeholder="+254..." />
                      </div>
                      <div>
                        <label className={labelClasses}>Role</label>
                        <select defaultValue={c.role || ''} onChange={(e) => updateContactField(c.id, 'role', e.target.value)} className={selectClasses}>
                          <option value="">—</option>
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClasses}>Organization</label>
                        <input type="text" defaultValue={c.organization || ''} onBlur={(e) => { if (e.target.value !== (c.organization || '')) updateContactField(c.id, 'organization', e.target.value) }} className={inputClasses} placeholder="Church, hospital, NGO..." />
                      </div>
                      <div>
                        <label className={labelClasses}>City</label>
                        <input type="text" defaultValue={c.city || ''} onBlur={(e) => { if (e.target.value !== (c.city || '')) updateContactField(c.id, 'city', e.target.value) }} className={inputClasses} placeholder="Nairobi, Kakamega..." />
                      </div>
                      <div>
                        <label className={labelClasses}>Region</label>
                        <input type="text" defaultValue={c.region || ''} onBlur={(e) => { if (e.target.value !== (c.region || '')) updateContactField(c.id, 'region', e.target.value) }} className={inputClasses} placeholder="County / region" />
                      </div>
                      <div>
                        <label className={labelClasses}>Primary Contact</label>
                        <select defaultValue={c.is_primary ? 'true' : 'false'} onChange={(e) => updateContactField(c.id, 'is_primary', e.target.value)} className={selectClasses}>
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </div>
                    </div>

                    {/* Description & Services — full width */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClasses}>What They Do</label>
                        <textarea defaultValue={c.description || ''} onBlur={(e) => { if (e.target.value !== (c.description || '')) updateContactField(c.id, 'description', e.target.value) }} className={`${inputClasses} resize-y`} rows={2} placeholder="Brief description of the organization..." />
                      </div>
                      <div>
                        <label className={labelClasses}>Services / Capabilities</label>
                        <textarea defaultValue={c.services || ''} onBlur={(e) => { if (e.target.value !== (c.services || '')) updateContactField(c.id, 'services', e.target.value) }} className={`${inputClasses} resize-y`} rows={2} placeholder="What they're providing for the trip..." />
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>Notes</label>
                      <textarea defaultValue={c.notes || ''} onBlur={(e) => { if (e.target.value !== (c.notes || '')) updateContactField(c.id, 'notes', e.target.value) }} className={`${inputClasses} resize-y`} rows={2} placeholder="Internal notes..." />
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      {hasEmail && (
                        <button
                          type="button"
                          onClick={() => handleLegacyInfoRequest(c.id)}
                          disabled={actionLoading === `${c.id}-info_request`}
                          className={`${btnClasses} bg-amber-50 text-amber-700 hover:bg-amber-100`}
                        >
                          {actionLoading === `${c.id}-info_request` ? '⏳ Sending...' : '📧 Request Info Form'}
                        </button>
                      )}
                      {hasEmail && (
                        <button
                          type="button"
                          onClick={() => handleAction(c.id, 'team_signup_link')}
                          disabled={actionLoading === `${c.id}-team_signup_link`}
                          className={`${btnClasses} bg-green-50 text-green-700 hover:bg-green-100`}
                        >
                          {actionLoading === `${c.id}-team_signup_link` ? '⏳ Sending...' : '📋 Send Team Signup Link'}
                        </button>
                      )}
                      {!hasEmail && (
                        <p className="text-[11px] text-amber-600 italic">Add an email address to enable sending</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {contacts.length === 0 && (
            <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
              No partners added yet. Click &quot;+ Add Partner&quot; to get started.
            </div>
          )}
        </div>

        {/* Add Partner Button / Inline Form */}
        <div className="mt-4">
          {showAddPartner ? (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <input type="text" placeholder="Name *" value={newPartner.name} onChange={(e) => setNewPartner(p => ({ ...p, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()} className={`w-[150px] ${inputClasses}`} autoFocus />
                <input type="email" placeholder="Email" value={newPartner.email} onChange={(e) => setNewPartner(p => ({ ...p, email: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()} className={`w-[180px] ${inputClasses}`} />
                <input type="text" placeholder="Phone (+254...)" value={newPartner.phone} onChange={(e) => setNewPartner(p => ({ ...p, phone: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()} className={`w-[140px] ${inputClasses}`} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input type="text" placeholder="Organization" value={newPartner.organization} onChange={(e) => setNewPartner(p => ({ ...p, organization: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()} className={`w-[160px] ${inputClasses}`} />
                <select value={newPartner.role} onChange={(e) => setNewPartner(p => ({ ...p, role: e.target.value }))} className={`w-[130px] ${selectClasses}`}>
                  <option value="">Role...</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
                <input type="text" placeholder="City" value={newPartner.city} onChange={(e) => setNewPartner(p => ({ ...p, city: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()} className={`w-[120px] ${inputClasses}`} />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button type="button" onClick={handleAddPartner} className="px-3 py-1.5 text-[13px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                  Add Partner
                </button>
                <button type="button" onClick={() => { setShowAddPartner(false); setNewPartner({ name: '', email: '', phone: '', organization: '', role: '', city: '' }) }} className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowAddPartner(true)} className="px-3 py-1.5 text-[13px] font-medium bg-navy text-white rounded hover:bg-navy/90 transition-colors">
              + Add Partner
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  X, CheckCircle, Clock, XCircle, Send, Mail, Phone,
  Shield, Stethoscope, Users, MapPin, Briefcase, FileText,
  Loader2, AlertTriangle, Pencil, Save, ChevronDown, ChevronRight,
} from 'lucide-react'
import type { Participant } from './types'

interface ModalParticipantDetailProps {
  participant: Participant | null
  onClose: () => void
  onUpdateStatus?: (id: string, status: string) => void
  onUpdateField?: (id: string, field: string, value: string) => void
  onRequestMoreInfo?: (id: string, email: string, name: string, message: string) => Promise<any>
  onSendInvite?: (invite: { firstName: string; lastName: string; email: string; track: string; role: string; sendEmail: boolean }) => Promise<any>
  onSendFormLink?: (participantId: string, formType: string) => Promise<any>
}

// Compact editable field
function Field({ label, value, field, onSave, type = 'text', options, placeholder }: {
  label: string; value: string; field: string; onSave: (field: string, value: string) => void
  type?: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea'
  options?: { value: string; label: string }[]; placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')
  useEffect(() => { setDraft(value || '') }, [value])

  const save = () => {
    if (draft !== (value || '')) onSave(field, draft)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="group cursor-pointer" onClick={() => setEditing(true)}>
        <p className="text-gray-500 text-[11px] uppercase tracking-wide">{label}</p>
        <p className={`text-sm mt-0.5 ${value ? 'font-medium text-gray-900' : 'text-gray-400 italic'}`}>
          {value || placeholder || '—'}
        </p>
      </div>
    )
  }

  if (type === 'select' && options) {
    return (
      <div>
        <p className="text-gray-500 text-[11px] uppercase tracking-wide">{label}</p>
        <select value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save} autoFocus
          className="text-sm border rounded px-2 py-1 w-full max-w-[180px] mt-0.5">
          <option value="">—</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div className="col-span-2">
        <p className="text-gray-500 text-[11px] uppercase tracking-wide">{label}</p>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save}
          autoFocus rows={3} placeholder={placeholder}
          className="text-sm border rounded px-2 py-1 w-full resize-none mt-0.5" />
      </div>
    )
  }

  return (
    <div>
      <p className="text-gray-500 text-[11px] uppercase tracking-wide">{label}</p>
      <input type={type} value={draft} onChange={(e) => setDraft(e.target.value)}
        onBlur={save} onKeyDown={(e) => e.key === 'Enter' && save()}
        autoFocus placeholder={placeholder}
        className="text-sm border rounded px-2 py-1 w-full max-w-[200px] mt-0.5" />
    </div>
  )
}

// Collapsible section
function Section({ title, icon: Icon, badge, defaultOpen = true, children }: {
  title: string; icon: any; badge?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy">
          <Icon className="h-4 w-4" /> {title} {badge}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

const TRACK_OPTIONS = [
  { value: 'Flex', label: 'Flex' }, { value: 'Ministry', label: 'Ministry' },
  { value: 'Medical', label: 'Medical' }, { value: 'Education', label: 'Education' },
  { value: 'Business', label: 'Business' }, { value: 'Media', label: 'Media' },
]
const ROLE_OPTIONS = [
  { value: 'delegate', label: 'Delegate' }, { value: 'coordinator', label: 'Coordinator' },
  { value: 'admin', label: 'Admin' }, { value: 'leader', label: 'Team Leader' },
]

export function ModalParticipantDetail({
  participant, onClose, onUpdateStatus, onUpdateField, onRequestMoreInfo, onSendInvite, onSendFormLink,
}: ModalParticipantDetailProps) {
  const [showCompose, setShowCompose] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showInvitePanel, setShowInvitePanel] = useState(false)
  const [inviteTrack, setInviteTrack] = useState('')
  const [inviteRole, setInviteRole] = useState('')
  const [sendingForm, setSendingForm] = useState<string | null>(null)
  const [formSendResult, setFormSendResult] = useState<{ form: string; success: boolean } | null>(null)
  const [emailDraft, setEmailDraft] = useState('')
  const [addingEmail, setAddingEmail] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  if (!participant) return null
  const p = participant as any
  const hasEmail = !!p.email
  const isPending = p.application_status === 'pending'

  const handleSave = (field: string, value: string) => {
    if (onUpdateField) onUpdateField(p.id, field, value)
  }

  const handleAddEmail = () => {
    if (emailDraft.trim() && emailDraft.includes('@')) {
      handleSave('email', emailDraft.trim())
      setAddingEmail(false)
      setEmailDraft('')
    }
  }

  const handleSendInvite = async () => {
    if (!onSendInvite || !p.email) return
    const selectedTrack = inviteTrack || p.service_track || 'Flex'
    const selectedRole = inviteRole || p.role || 'delegate'

    // Save track and role to participant before sending
    if (selectedTrack !== (p.service_track || 'Flex')) handleSave('service_track', selectedTrack)
    if (selectedRole !== (p.role || 'delegate')) handleSave('role', selectedRole)

    setSendingInvite(true)
    setInviteResult(null)
    try {
      const data = await onSendInvite({
        firstName: p.first_name, lastName: p.last_name || '', email: p.email,
        track: selectedTrack, role: 'member', sendEmail: true,
      })
      setInviteResult({
        success: data.success && data.emailSent,
        message: data.emailSent ? `Invite sent to ${p.email} (${selectedTrack} track)` : data.error || 'Email failed',
      })
      if (data.success) setShowInvitePanel(false)
    } catch {
      setInviteResult({ success: false, message: 'Failed to send' })
    } finally {
      setSendingInvite(false)
    }
  }

  const handleSendFormLink = async (formType: string) => {
    if (!onSendFormLink) return
    setSendingForm(formType)
    setFormSendResult(null)
    try {
      const result = await onSendFormLink(p.id, formType)
      setFormSendResult({ form: formType, success: result?.success && result?.emailSent })
    } catch {
      setFormSendResult({ form: formType, success: false })
    } finally {
      setSendingForm(null)
      setTimeout(() => setFormSendResult(null), 3000)
    }
  }

  const handleRequestInfo = async () => {
    if (!onRequestMoreInfo || !requestMessage.trim()) return
    setSendingRequest(true)
    const result = await onRequestMoreInfo(p.id, p.email, `${p.first_name} ${p.last_name}`, requestMessage)
    if (result?.success) { setRequestSent(true); setRequestMessage(''); setTimeout(() => setRequestSent(false), 3000) }
    setSendingRequest(false)
  }

  const handleDecision = async (status: string) => {
    if (!onUpdateStatus) return
    setProcessing(true)
    onUpdateStatus(p.id, status)
    setProcessing(false)
    onClose()
  }

  const forms = [
    { key: 'interest', label: 'Interest Form', done: !!p.interest_form_completed_at },
    { key: 'travel', label: 'Travel Form', done: !!p.travel_form_completed_at },
    { key: 'health_safety', label: 'Health & Safety', done: !!p.health_safety_form_completed_at },
    { key: 'medical', label: 'Medical Form', done: !!p.medical_form_completed_at },
    { key: 'waiver', label: 'Waiver', done: !!p.waiver_signed_at },
  ]
  const formsCompleted = forms.filter(f => f.done).length
  const formsIncomplete = forms.filter(f => !f.done)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b flex-shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-navy">{p.first_name} {p.last_name}</h2>
              <Badge className={p.application_status === 'approved' ? 'bg-green-100 text-green-800' : p.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                {p.application_status?.replace('_', ' ')}
              </Badge>
              {p.team_leader && <Badge className="bg-gold/20 text-gold-dark">Leader</Badge>}
            </div>
            {hasEmail ? (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {p.email}
                {p.phone && <><span className="text-gray-300">|</span><Phone className="h-3.5 w-3.5" /> {p.phone}</>}
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-1 italic">No email on file</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>Track: <strong className="text-navy">{p.service_track || 'Flex'}</strong></span>
              <span>Role: <strong className="text-navy">{p.role || 'delegate'}</strong></span>
              {p.application_date && <span>Added {new Date(p.application_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg -mt-1 -mr-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">

          {/* === NO EMAIL STATE — Prominent CTA === */}
          {!hasEmail && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 text-center">
              <Mail className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <h3 className="font-bold text-amber-900 text-lg">Add Email to Get Started</h3>
              <p className="text-sm text-amber-700 mt-1 mb-4">
                Once you add their email, you can send them the trip invitation, form links, and communicate directly.
              </p>
              {addingEmail ? (
                <div className="flex items-center gap-2 max-w-sm mx-auto">
                  <input type="email" value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                    placeholder="email@example.com" autoFocus
                    className="flex-1 border-2 border-amber-300 rounded-lg px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none" />
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={handleAddEmail}
                    disabled={!emailDraft.includes('@')}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              ) : (
                <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setAddingEmail(true)}>
                  <Mail className="h-4 w-4 mr-2" /> Add Email Address
                </Button>
              )}
            </div>
          )}

          {/* === HAS EMAIL — Action Buttons === */}
          {hasEmail && (
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { setInviteTrack(p.service_track || 'Flex'); setInviteRole(p.role || 'delegate'); setShowInvitePanel(!showInvitePanel) }}>
                <Send className="mr-1.5 h-3.5 w-3.5" /> Send Trip Invite
              </Button>
              {formsIncomplete.length > 0 && onSendFormLink && (
                <Button size="sm" variant="outline" onClick={() => handleSendFormLink('all_incomplete')} disabled={sendingForm === 'all_incomplete'}>
                  {sendingForm === 'all_incomplete' ? '⏳ Sending...' : formSendResult?.form === 'all_incomplete' ? (formSendResult.success ? '✓ Sent!' : '✗ Failed') : `📬 Send ${formsIncomplete.length} Missing Form${formsIncomplete.length > 1 ? 's' : ''}`}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setShowCompose(!showCompose)}>
                <Mail className="mr-1.5 h-3.5 w-3.5" /> Email
              </Button>
            </div>
          )}

          {/* Send Invite Panel — assign track + role before sending */}
          {showInvitePanel && hasEmail && (
            <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50 space-y-3">
              <p className="text-sm font-semibold text-green-900">Send invitation to {p.email}</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-green-800 uppercase tracking-wide">Service Track</label>
                  <select value={inviteTrack} onChange={(e) => setInviteTrack(e.target.value)}
                    className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
                    {TRACK_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-green-800 uppercase tracking-wide">Trip Role</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleSendInvite} disabled={sendingInvite}>
                  {sendingInvite ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Sending...</> : <><Send className="mr-1.5 h-3.5 w-3.5" />Send Invite as {inviteTrack}</>}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowInvitePanel(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {inviteResult && (
            <div className={`p-2.5 rounded-lg text-sm font-medium ${inviteResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {inviteResult.success ? <CheckCircle className="h-4 w-4 inline mr-1.5" /> : <XCircle className="h-4 w-4 inline mr-1.5" />}
              {inviteResult.message}
            </div>
          )}

          {/* Compose email inline */}
          {showCompose && hasEmail && onRequestMoreInfo && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
              <p className="text-xs font-medium text-blue-800">Compose email to {p.first_name} ({p.email})</p>
              <Textarea value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={`Hi ${p.first_name},\n\n`} rows={5} className="text-sm bg-white" />
              {requestSent && <p className="text-sm text-green-600 font-medium flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Sent!</p>}
              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleRequestInfo}
                  disabled={sendingRequest || !requestMessage.trim()}>
                  {sendingRequest ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Sending...</> : <><Send className="mr-1.5 h-3.5 w-3.5" />Send</>}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCompose(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* === FORMS PROGRESS === */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Forms ({formsCompleted}/{forms.length})</h4>
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(formsCompleted / forms.length) * 100}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {forms.map(form => (
                <div key={form.key} className={`text-center p-2 rounded-lg ${form.done ? 'bg-green-100' : 'bg-white border border-gray-200'}`}>
                  <div className={`text-lg ${form.done ? 'text-green-600' : 'text-gray-300'}`}>{form.done ? '✓' : '○'}</div>
                  <p className={`text-[10px] mt-0.5 leading-tight ${form.done ? 'text-green-700 font-medium' : 'text-gray-500'}`}>{form.label}</p>
                  {!form.done && hasEmail && onSendFormLink && (
                    <button onClick={() => handleSendFormLink(form.key)} disabled={sendingForm === form.key}
                      className={`mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded transition-colors ${
                        formSendResult?.form === form.key
                          ? formSendResult.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}>
                      {sendingForm === form.key ? '...' : formSendResult?.form === form.key ? (formSendResult.success ? 'Sent!' : 'Fail') : 'Send'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* === ESSENTIAL INFO (always visible) === */}
          <Section title="Contact & Role" icon={Users} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="First Name" value={p.first_name} field="first_name" onSave={handleSave} />
              <Field label="Last Name" value={p.last_name} field="last_name" onSave={handleSave} />
              <Field label="Email" value={p.email} field="email" onSave={handleSave} type="email" placeholder="Add email" />
              <Field label="Phone" value={p.phone} field="phone" onSave={handleSave} type="tel" placeholder="Add phone" />
              <Field label="Service Track" value={p.service_track} field="service_track" onSave={handleSave} type="select" options={TRACK_OPTIONS} />
              <Field label="Trip Role" value={p.role || 'delegate'} field="role" onSave={handleSave} type="select" options={ROLE_OPTIONS} />
              <Field label="Team Leader" value={p.team_leader ? 'true' : 'false'} field="team_leader" onSave={handleSave} type="select"
                options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]} />
              <Field label="Location" value={p.location} field="location" onSave={handleSave} placeholder="City, State" />
            </div>
          </Section>

          {/* Notes */}
          <Section title="Notes" icon={FileText} defaultOpen={!!p.notes}>
            <Field label="Admin Notes" value={p.notes} field="notes" onSave={handleSave} type="textarea" placeholder="Add notes about this delegate..." />
          </Section>

          {/* Travel */}
          <Section title="Travel Details" icon={MapPin}
            badge={p.travel_form_completed_at ? <Badge className="bg-green-100 text-green-700 text-[10px] ml-1">Form Done</Badge> : undefined}
            defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Legal Full Name" value={p.legal_full_name} field="legal_full_name" onSave={handleSave} placeholder="As on passport" />
              <Field label="Booking Type" value={p.booking_type} field="booking_type" onSave={handleSave} type="select"
                options={[{ value: 'TBD', label: 'TBD' }, { value: 'Group', label: 'Group' }, { value: 'Individual', label: 'Individual' }, { value: 'Self', label: 'Self-Arranged' }]} />
              <Field label="Departure Airport" value={p.departure_airport} field="departure_airport" onSave={handleSave} placeholder="e.g. JFK" />
              <Field label="Return Airport" value={p.return_airport} field="return_airport" onSave={handleSave} placeholder="e.g. NBO" />
              <Field label="Travel Date In" value={p.travel_date_in?.split('T')[0] || ''} field="travel_date_in" onSave={handleSave} type="date" />
              <Field label="Travel Date Out" value={p.travel_date_out?.split('T')[0] || ''} field="travel_date_out" onSave={handleSave} type="date" />
              <Field label="Roommate Preference" value={p.roommate_preference} field="roommate_preference" onSave={handleSave} placeholder="Who they want to room with" />
              <Field label="Flight Confirmation" value={p.flight_confirmation_number} field="flight_confirmation_number" onSave={handleSave} placeholder="Booking ref" />
              <Field label="Arrival Flight" value={p.arrival_flight_info} field="arrival_flight_info" onSave={handleSave} placeholder="KQ100 Apr 22 7:30pm" />
              <Field label="Departure Flight" value={p.departure_flight_info} field="departure_flight_info" onSave={handleSave} placeholder="KQ101 May 7 11pm" />
            </div>
          </Section>

          {/* Documents */}
          <Section title="Travel Documents" icon={Shield} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Passport Status" value={p.passport_status} field="passport_status" onSave={handleSave} type="select"
                options={[{ value: 'pending', label: 'Pending' }, { value: 'submitted', label: 'Submitted' }, { value: 'verified', label: 'Verified' }, { value: 'expired', label: 'Expired' }]} />
              <Field label="Passport Expiry" value={p.passport_expiry?.split('T')[0] || ''} field="passport_expiry" onSave={handleSave} type="date" />
              <Field label="Kenya eTA" value={p.eta_status} field="eta_status" onSave={handleSave} type="select"
                options={[{ value: 'not_started', label: 'Not Started' }, { value: 'applied', label: 'Applied' }, { value: 'approved', label: 'Approved' }]} />
              <Field label="Passport Number" value={p.passport_number} field="passport_number" onSave={handleSave} placeholder="Passport #" />
            </div>
          </Section>

          {/* Health */}
          <Section title="Health & Medical" icon={Stethoscope} defaultOpen={false}
            badge={p.yellow_fever_status === 'need_to_schedule' ? <Badge className="bg-red-100 text-red-800 text-[10px] ml-1">Yellow Fever Needed</Badge> : undefined}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Yellow Fever" value={p.yellow_fever_status} field="yellow_fever_status" onSave={handleSave} type="select"
                options={[{ value: 'unknown', label: 'Unknown' }, { value: 'vaccinated', label: 'Vaccinated' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'need_to_schedule', label: 'Needs to Schedule' }]} />
              <Field label="Malaria Meds" value={p.malaria_prophylaxis} field="malaria_prophylaxis" onSave={handleSave} type="select"
                options={[{ value: 'malarone', label: 'Malarone' }, { value: 'doxycycline', label: 'Doxycycline' }, { value: 'not_yet', label: 'Undecided' }, { value: 'none', label: 'None' }]} />
              <Field label="Allergies" value={p.allergies} field="allergies" onSave={handleSave} placeholder="None" />
              <Field label="Medications" value={p.medications} field="medications" onSave={handleSave} placeholder="None" />
              <Field label="Dietary Restrictions" value={p.dietary_restrictions} field="dietary_restrictions" onSave={handleSave} placeholder="None" />
              <Field label="Blood Type" value={p.blood_type} field="blood_type" onSave={handleSave} type="select"
                options={[{ value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' }, { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' }, { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }, { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' }]} />
            </div>
          </Section>

          {/* Emergency Contact */}
          <Section title="Emergency Contact" icon={Phone} defaultOpen={false}
            badge={!p.emergency_contact_name ? <Badge className="bg-amber-100 text-amber-700 text-[10px] ml-1">Missing</Badge> : undefined}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Contact Name" value={p.emergency_contact_name} field="emergency_contact_name" onSave={handleSave} placeholder="Full name" />
              <Field label="Contact Phone" value={p.emergency_contact_phone} field="emergency_contact_phone" onSave={handleSave} type="tel" placeholder="Phone" />
              <Field label="Relationship" value={p.emergency_contact_relationship} field="emergency_contact_relationship" onSave={handleSave} placeholder="e.g. Spouse" />
            </div>
          </Section>

          {/* Financial */}
          <Section title="Financial" icon={Briefcase} defaultOpen={false}>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Field label="Trip Cost" value={String(p.trip_cost || p.fundraising_goal || 3500)} field="fundraising_goal" onSave={handleSave} />
              <div>
                <p className="text-gray-500 text-[11px] uppercase tracking-wide">Amount Paid</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">${p.amount_paid || 0}</p>
              </div>
              <Field label="Payment Status" value={p.payment_status} field="payment_status" onSave={handleSave} type="select"
                options={[{ value: 'pending', label: 'Pending' }, { value: 'partial', label: 'Partial' }, { value: 'paid', label: 'Paid' }]} />
            </div>
          </Section>

          {/* Personal Extras */}
          <Section title="Personal Details" icon={Users} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Organization" value={p.organization} field="organization" onSave={handleSave} placeholder="Church, company" />
              <Field label="Title" value={p.org_title} field="org_title" onSave={handleSave} placeholder="Role in org" />
              <Field label="Gender" value={p.gender} field="gender" onSave={handleSave} type="select"
                options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
              <Field label="Preferred Name" value={p.preferred_name} field="preferred_name" onSave={handleSave} placeholder="For ID badge" />
              <Field label="T-Shirt Size" value={p.t_shirt_size} field="t_shirt_size" onSave={handleSave} type="select"
                options={[{ value: 'S', label: 'S' }, { value: 'M', label: 'M' }, { value: 'L', label: 'L' }, { value: 'XL', label: 'XL' }, { value: '2XL', label: '2XL' }, { value: '3XL', label: '3XL' }]} />
              <Field label="Languages" value={p.languages_spoken} field="languages_spoken" onSave={handleSave} placeholder="English, Swahili..." />
              <Field label="Date of Birth" value={p.date_of_birth?.split('T')[0] || ''} field="date_of_birth" onSave={handleSave} type="date" />
              <Field label="Mission Experience" value={p.prior_mission_experience} field="prior_mission_experience" onSave={handleSave} type="select"
                options={[{ value: 'first_time', label: 'First trip' }, { value: '1-2_trips', label: '1-2 trips' }, { value: '3-5_trips', label: '3-5 trips' }, { value: 'veteran', label: '6+ trips' }]} />
            </div>
          </Section>

          {/* Review Notes — only for pending */}
          {isPending && onUpdateStatus && (
            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Application Review</h4>
              <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add review notes..." rows={3} className="text-sm bg-white" />
            </div>
          )}
        </div>

        {/* Footer — actions */}
        {isPending && onUpdateStatus && (
          <div className="flex gap-3 p-5 border-t flex-shrink-0 bg-white rounded-b-xl">
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleDecision('approved')} disabled={processing}>
              <CheckCircle className="h-4 w-4 mr-2" /> Approve
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleDecision('waitlisted')} disabled={processing}>
              <Clock className="h-4 w-4 mr-2" /> Waitlist
            </Button>
            <Button variant="outline" className="flex-1 text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleDecision('declined')} disabled={processing}>
              <XCircle className="h-4 w-4 mr-2" /> Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

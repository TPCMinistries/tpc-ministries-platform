'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  X, CheckCircle, Clock, XCircle, Send, Mail, Phone,
  Shield, Stethoscope, Users, MapPin, Briefcase, FileText,
  Loader2, AlertTriangle, Pencil, Save, ExternalLink,
  Shirt, Heart, Plane, Globe
} from 'lucide-react'
import type { Participant } from './types'

interface ModalParticipantDetailProps {
  participant: Participant | null
  onClose: () => void
  onUpdateStatus?: (id: string, status: string) => void
  onUpdateField?: (id: string, field: string, value: string) => void
  onRequestMoreInfo?: (id: string, email: string, name: string, message: string) => Promise<any>
  onSendInvite?: (invite: { firstName: string; lastName: string; email: string; track: string; role: string; sendEmail: boolean }) => Promise<any>
}

// Editable field component
function EditableField({ label, value, field, onSave, type = 'text', options, placeholder }: {
  label: string
  value: string
  field: string
  onSave: (field: string, value: string) => void
  type?: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea'
  options?: { value: string; label: string }[]
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')

  useEffect(() => { setDraft(value || '') }, [value])

  const save = () => {
    if (draft !== (value || '')) onSave(field, draft)
    setEditing(false)
  }

  const labelClasses = "text-gray-500 text-xs uppercase tracking-wide"
  const valueClasses = "font-medium text-gray-900 mt-0.5"

  if (!editing) {
    return (
      <div className="group">
        <p className={labelClasses}>{label}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className={`${valueClasses} ${!value ? 'text-gray-400 italic' : ''}`}>
            {value || placeholder || 'Not provided'}
          </p>
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-opacity"
            title={`Edit ${label.toLowerCase()}`}
          >
            <Pencil className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </div>
    )
  }

  if (type === 'select' && options) {
    return (
      <div>
        <p className={labelClasses}>{label}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            autoFocus
            className="text-sm border rounded px-2 py-1 w-full max-w-[200px]"
          >
            {options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div className="col-span-2">
        <p className={labelClasses}>{label}</p>
        <div className="flex items-start gap-1.5 mt-0.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            autoFocus
            rows={3}
            placeholder={placeholder}
            className="text-sm border rounded px-2 py-1 w-full resize-none"
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className={labelClasses}>{label}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          autoFocus
          placeholder={placeholder}
          className="text-sm border rounded px-2 py-1 w-full max-w-[200px]"
        />
      </div>
    </div>
  )
}

export function ModalParticipantDetail({
  participant, onClose, onUpdateStatus, onUpdateField, onRequestMoreInfo, onSendInvite,
}: ModalParticipantDetailProps) {
  const [reviewNotes, setReviewNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showRequestInfo, setShowRequestInfo] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!participant) return null

  const p = participant as any
  const isPending = p.application_status === 'pending'
  const hasInterestForm = !!p.interest_form_completed_at
  const hasTravelForm = !!p.travel_form_completed_at
  const hasMedicalForm = !!p.medical_form_completed_at
  const hasWaiver = !!p.waiver_signed_at
  const hasHealthSafety = !!p.health_safety_form_completed_at
  const hasEmail = !!p.email

  const handleSave = (field: string, value: string) => {
    if (onUpdateField) onUpdateField(p.id, field, value)
  }

  const handleDecision = async (status: string) => {
    if (!onUpdateStatus) return
    setProcessing(true)
    onUpdateStatus(p.id, status)
    setProcessing(false)
    onClose()
  }

  const handleRequestInfo = async () => {
    if (!onRequestMoreInfo || !requestMessage.trim()) return
    setSendingRequest(true)
    const result = await onRequestMoreInfo(p.id, p.email, `${p.first_name} ${p.last_name}`, requestMessage)
    if (result?.success) {
      setRequestSent(true)
      setRequestMessage('')
      setTimeout(() => setRequestSent(false), 3000)
    }
    setSendingRequest(false)
  }

  const handleSendInvite = async () => {
    if (!onSendInvite || !p.email) return
    setSendingInvite(true)
    setInviteResult(null)
    try {
      const data = await onSendInvite({
        firstName: p.first_name,
        lastName: p.last_name || '',
        email: p.email,
        track: p.service_track || 'Flex',
        role: 'member',
        sendEmail: true,
      })
      if (data.success) {
        setInviteResult({
          success: data.emailSent,
          message: data.emailSent ? `Invite sent to ${p.email}` : `Invite created but email failed`,
        })
      } else {
        setInviteResult({ success: false, message: data.error || 'Failed' })
      }
    } catch {
      setInviteResult({ success: false, message: 'Failed to send invite' })
    } finally {
      setSendingInvite(false)
    }
  }

  const sectionClasses = "bg-gray-50 p-4 rounded-lg"
  const labelClasses = "text-gray-500 text-xs uppercase tracking-wide"
  const valueClasses = "font-medium text-gray-900 mt-0.5"

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      waitlisted: 'bg-blue-100 text-blue-800',
      declined: 'bg-red-100 text-red-800',
      submitted: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      not_started: 'bg-gray-100 text-gray-600',
      not_required: 'bg-gray-100 text-gray-600',
      in_progress: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
    }
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status?.replace('_', ' ') || 'unknown'}</Badge>
  }

  const trackOptions = [
    { value: 'Flex', label: 'Flex' },
    { value: 'Ministry', label: 'Ministry' },
    { value: 'Medical', label: 'Medical' },
    { value: 'Education', label: 'Education' },
    { value: 'Business', label: 'Business' },
    { value: 'Media', label: 'Media' },
  ]

  const passportOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'verified', label: 'Verified' },
    { value: 'expired', label: 'Expired' },
    { value: 'not_required', label: 'Not Required' },
  ]

  const visaOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' },
    { value: 'not_required', label: 'Not Required' },
  ]

  const paymentOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
    { value: 'refunded', label: 'Refunded' },
  ]

  const bookingOptions = [
    { value: 'TBD', label: 'TBD' },
    { value: 'Group', label: 'Group' },
    { value: 'Individual', label: 'Individual' },
    { value: 'Self', label: 'Self-Arranged' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-navy">
                {p.first_name} {p.last_name}
              </h2>
              {statusBadge(p.application_status)}
              {p.team_leader && <Badge className="bg-gold/20 text-gold-dark">Leader</Badge>}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Added {p.application_date ? new Date(p.application_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Form Completion Status */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={hasInterestForm ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
              {hasInterestForm ? '✓' : '○'} Interest Form
            </Badge>
            <Badge className={hasTravelForm ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
              {hasTravelForm ? '✓' : '○'} Travel Form
            </Badge>
            <Badge className={hasHealthSafety ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
              {hasHealthSafety ? '✓' : '○'} Health & Safety
            </Badge>
            <Badge className={hasMedicalForm ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
              {hasMedicalForm ? '✓' : '○'} Medical Form
            </Badge>
            <Badge className={hasWaiver ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
              {hasWaiver ? '✓' : '○'} Waiver
            </Badge>
          </div>

          {/* Send Invite Button — prominent when email exists but no invite sent */}
          {hasEmail && onSendInvite && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Send className="h-4 w-4" />
                <span>Send the Kenya trip invitation email to {p.email}</span>
              </div>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSendInvite}
                disabled={sendingInvite}
              >
                {sendingInvite ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Sending...</> : 'Send Invite'}
              </Button>
            </div>
          )}
          {inviteResult && (
            <div className={`p-2 rounded text-sm font-medium ${inviteResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {inviteResult.message}
            </div>
          )}

          {/* Travel Form Link — when email exists but travel form not completed */}
          {hasEmail && !hasTravelForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <FileText className="h-4 w-4" />
                <span>Travel form not yet completed</span>
              </div>
              <a
                href={`/kenya/travel`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                View Form <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Contact & Personal — EDITABLE */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" /> Contact & Personal
            </h3>
            <div className={sectionClasses}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <EditableField label="First Name" value={p.first_name} field="first_name" onSave={handleSave} placeholder="First name" />
                <EditableField label="Last Name" value={p.last_name} field="last_name" onSave={handleSave} placeholder="Last name" />
                <EditableField label="Email" value={p.email} field="email" onSave={handleSave} type="email" placeholder="Add email to send invite" />
                <EditableField label="Phone" value={p.phone} field="phone" onSave={handleSave} type="tel" placeholder="Phone number" />
                <EditableField label="Location" value={p.location} field="location" onSave={handleSave} placeholder="City, State" />
                <EditableField label="Service Track" value={p.service_track} field="service_track" onSave={handleSave} type="select" options={trackOptions} />
                <EditableField label="Organization" value={p.organization} field="organization" onSave={handleSave} placeholder="Church, company, etc." />
                <EditableField label="Role/Title" value={p.org_title} field="org_title" onSave={handleSave} placeholder="Title within org" />
                <EditableField label="Date of Birth" value={p.date_of_birth?.split('T')[0] || ''} field="date_of_birth" onSave={handleSave} type="date" />
                <EditableField label="Ministry Role" value={p.ministry_role} field="ministry_role" onSave={handleSave} placeholder="Role in ministry" />
                <EditableField label="Gender" value={p.gender} field="gender" onSave={handleSave} type="select" options={[
                  { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Prefer not to say' },
                ]} />
                <EditableField label="Preferred Name" value={p.preferred_name} field="preferred_name" onSave={handleSave} placeholder="For ID badge" />
                <EditableField label="T-Shirt Size" value={p.t_shirt_size} field="t_shirt_size" onSave={handleSave} type="select" options={[
                  { value: 'XS', label: 'XS' }, { value: 'S', label: 'S' }, { value: 'M', label: 'M' }, { value: 'L', label: 'L' },
                  { value: 'XL', label: 'XL' }, { value: '2XL', label: '2XL' }, { value: '3XL', label: '3XL' },
                ]} />
                <EditableField label="Languages" value={p.languages_spoken} field="languages_spoken" onSave={handleSave} placeholder="English, Swahili..." />
                <EditableField label="Mission Experience" value={p.prior_mission_experience} field="prior_mission_experience" onSave={handleSave} type="select" options={[
                  { value: 'first_time', label: 'First trip' }, { value: '1-2_trips', label: '1-2 trips' },
                  { value: '3-5_trips', label: '3-5 trips' }, { value: 'veteran', label: '6+ trips' },
                ]} />
              </div>
            </div>
          </div>

          {/* Notes — EDITABLE */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" /> Notes
            </h3>
            <div className={sectionClasses}>
              <EditableField label="Admin Notes" value={p.notes} field="notes" onSave={handleSave} type="textarea" placeholder="Add notes about this delegate..." />
            </div>
          </div>

          {/* Travel Details — show always, editable */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" /> Travel Details
              {hasTravelForm && <Badge className="bg-green-100 text-green-800 text-[10px]">Form Completed</Badge>}
            </h3>
            <div className={sectionClasses}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <EditableField label="Legal Full Name" value={p.legal_full_name} field="legal_full_name" onSave={handleSave} placeholder="As shown on passport" />
                <EditableField label="Booking Type" value={p.booking_type} field="booking_type" onSave={handleSave} type="select" options={bookingOptions} />
                <EditableField label="Departure Airport" value={p.departure_airport} field="departure_airport" onSave={handleSave} placeholder="e.g. JFK" />
                <EditableField label="Return Airport" value={p.return_airport} field="return_airport" onSave={handleSave} placeholder="e.g. NBO" />
                <EditableField label="Travel Date In" value={p.travel_date_in?.split('T')[0] || ''} field="travel_date_in" onSave={handleSave} type="date" />
                <EditableField label="Travel Date Out" value={p.travel_date_out?.split('T')[0] || ''} field="travel_date_out" onSave={handleSave} type="date" />
                <EditableField label="Accommodation" value={p.travel_accommodation_type} field="travel_accommodation_type" onSave={handleSave} placeholder="Group, self-arrange, etc." />
                <EditableField label="Roommate Preference" value={p.roommate_preference} field="roommate_preference" onSave={handleSave} placeholder="Who they want to room with" />
                <EditableField label="Flight Confirmation #" value={p.flight_confirmation_number} field="flight_confirmation_number" onSave={handleSave} placeholder="Booking reference" />
                <EditableField label="Arrival Flight" value={p.arrival_flight_info} field="arrival_flight_info" onSave={handleSave} placeholder="e.g., KQ100 Apr 22 7:30pm" />
                <EditableField label="Departure Flight" value={p.departure_flight_info} field="departure_flight_info" onSave={handleSave} placeholder="e.g., KQ101 May 7 11pm" />
                <EditableField label="Luggage Count" value={String(p.luggage_count || '')} field="luggage_count" onSave={handleSave} placeholder="# of bags" />
                <EditableField label="Special Assistance" value={p.special_assistance} field="special_assistance" onSave={handleSave} placeholder="None" />
                <EditableField label="Travel Notes" value={p.travel_notes} field="travel_notes" onSave={handleSave} type="textarea" placeholder="Any travel notes..." />
              </div>
            </div>
          </div>

          {/* Travel Documents — EDITABLE */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" /> Travel Documents
            </h3>
            <div className={sectionClasses}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <EditableField label="Passport Status" value={p.passport_status} field="passport_status" onSave={handleSave} type="select" options={passportOptions} />
                <EditableField label="Passport Expiry" value={p.passport_expiry?.split('T')[0] || ''} field="passport_expiry" onSave={handleSave} type="date" />
                <EditableField label="Passport Valid Until" value={p.passport_valid_until?.split('T')[0] || ''} field="passport_valid_until" onSave={handleSave} type="date" />
                <EditableField label="Kenya eTA" value={p.eta_status} field="eta_status" onSave={handleSave} type="select" options={[
                  { value: 'not_started', label: 'Not Started' }, { value: 'applied', label: 'Applied' },
                  { value: 'approved', label: 'Approved' }, { value: 'denied', label: 'Denied' },
                ]} />
                <EditableField label="eTA Applied Date" value={p.eta_application_date?.split('T')[0] || ''} field="eta_application_date" onSave={handleSave} type="date" />
                <EditableField label="Passport Number" value={p.passport_number} field="passport_number" onSave={handleSave} placeholder="Passport #" />
              </div>
            </div>
          </div>

          {/* Vaccinations & Insurance — EDITABLE */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4" /> Vaccinations & Insurance
              {p.yellow_fever_status === 'need_to_schedule' && (
                <Badge className="bg-red-100 text-red-800 text-[10px]">Yellow Fever Needed!</Badge>
              )}
            </h3>
            <div className={sectionClasses}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <EditableField label="Yellow Fever" value={p.yellow_fever_status} field="yellow_fever_status" onSave={handleSave} type="select" options={[
                  { value: 'unknown', label: 'Unknown' }, { value: 'vaccinated', label: 'Vaccinated' },
                  { value: 'scheduled', label: 'Scheduled' }, { value: 'need_to_schedule', label: 'Needs to Schedule' },
                  { value: 'exempt', label: 'Exempt' },
                ]} />
                <EditableField label="Yellow Fever Date" value={p.yellow_fever_date?.split('T')[0] || ''} field="yellow_fever_date" onSave={handleSave} type="date" />
                <EditableField label="Malaria Medication" value={p.malaria_prophylaxis} field="malaria_prophylaxis" onSave={handleSave} type="select" options={[
                  { value: 'malarone', label: 'Malarone' }, { value: 'doxycycline', label: 'Doxycycline' },
                  { value: 'mefloquine', label: 'Mefloquine' }, { value: 'not_yet', label: 'Undecided' }, { value: 'none', label: 'None' },
                ]} />
                <EditableField label="Travel Insurance" value={p.travel_insurance_status} field="travel_insurance_status" onSave={handleSave} type="select" options={[
                  { value: 'unknown', label: 'Unknown' }, { value: 'have_policy', label: 'Has Policy' },
                  { value: 'purchasing', label: 'Purchasing' }, { value: 'need_help', label: 'Needs Help' }, { value: 'none', label: 'None' },
                ]} />
                <EditableField label="Insurance Provider" value={p.travel_insurance_provider} field="travel_insurance_provider" onSave={handleSave} placeholder="Company + policy #" />
                <EditableField label="Background Check" value={p.background_check_status} field="background_check_status" onSave={handleSave} type="select" options={[
                  { value: 'not_required', label: 'Not Required' }, { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' }, { value: 'failed', label: 'Failed' },
                ]} />
              </div>
            </div>
          </div>

          {/* Medical — EDITABLE */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4" /> Medical
            </h3>
            <div className={sectionClasses}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <EditableField label="Blood Type" value={p.blood_type} field="blood_type" onSave={handleSave} type="select" options={[
                  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' }, { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' }, { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
                  { value: 'unknown', label: "Don't know" },
                ]} />
                <EditableField label="Allergies" value={p.allergies} field="allergies" onSave={handleSave} placeholder="None" />
                <EditableField label="Medications" value={p.medications} field="medications" onSave={handleSave} placeholder="None" />
                <EditableField label="Medical Conditions" value={p.medical_conditions} field="medical_conditions" onSave={handleSave} placeholder="None" />
                <EditableField label="Dietary Restrictions" value={p.dietary_restrictions} field="dietary_restrictions" onSave={handleSave} placeholder="None" />
              </div>
            </div>
          </div>

          {/* Emergency Contact — EDITABLE */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" /> Emergency Contact
            </h3>
            <div className={sectionClasses}>
              {!p.emergency_contact_name && !onUpdateField && (
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Not yet provided
                </p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <EditableField label="Contact Name" value={p.emergency_contact_name} field="emergency_contact_name" onSave={handleSave} placeholder="Full name" />
                <EditableField label="Contact Phone" value={p.emergency_contact_phone} field="emergency_contact_phone" onSave={handleSave} type="tel" placeholder="Phone number" />
                <EditableField label="Relationship" value={p.emergency_contact_relationship} field="emergency_contact_relationship" onSave={handleSave} placeholder="e.g. Spouse, Parent" />
              </div>
            </div>
          </div>

          {/* Financial — EDITABLE */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4" /> Financial
            </h3>
            <div className={sectionClasses}>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <EditableField label="Trip Cost" value={String(p.trip_cost || p.fundraising_goal || 3500)} field="fundraising_goal" onSave={handleSave} />
                <div>
                  <p className={labelClasses}>Amount Paid</p>
                  <p className={valueClasses}>${p.amount_paid || 0}</p>
                </div>
                <EditableField label="Payment Status" value={p.payment_status} field="payment_status" onSave={handleSave} type="select" options={paymentOptions} />
              </div>
            </div>
          </div>

          {/* Request More Info */}
          {p.email && onRequestMoreInfo && (
            <div>
              <button
                onClick={() => setShowRequestInfo(!showRequestInfo)}
                className="text-sm font-medium text-navy hover:underline flex items-center gap-1.5"
              >
                <Mail className="h-4 w-4" />
                {showRequestInfo ? 'Hide' : 'Request More Information'}
              </button>
              {showRequestInfo && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <p className="text-xs text-blue-700">
                    Send a follow-up email to {p.first_name} requesting additional information.
                  </p>
                  <Textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder={`Hi ${p.first_name},\n\nThank you for your interest in the Kenya Kingdom Impact Trip! We have a few follow-up questions:\n\n- \n\nLooking forward to hearing from you!\n\nTPC Ministries Team`}
                    rows={6}
                    className="text-sm"
                  />
                  {requestSent && (
                    <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Email sent to {p.email}
                    </p>
                  )}
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleRequestInfo}
                    disabled={sendingRequest || !requestMessage.trim()}
                  >
                    {sendingRequest ? (
                      <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Sending...</>
                    ) : (
                      <><Send className="mr-2 h-3.5 w-3.5" />Send Follow-Up Email</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Review Notes (for pending applications) */}
          {isPending && onUpdateStatus && (
            <div>
              <h3 className="font-semibold text-navy mb-3 text-sm">Review Notes</h3>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add internal notes about this application..."
                rows={3}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Action Buttons (sticky footer) */}
        {isPending && onUpdateStatus && (
          <div className="flex gap-3 p-6 border-t flex-shrink-0 bg-white rounded-b-xl">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleDecision('approved')}
              disabled={processing}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleDecision('waitlisted')}
              disabled={processing}
            >
              <Clock className="h-4 w-4 mr-2" />
              Waitlist
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => handleDecision('declined')}
              disabled={processing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

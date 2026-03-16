'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  X, CheckCircle, Clock, XCircle, Send, Mail, Phone,
  Shield, Stethoscope, Users, MapPin, Briefcase, FileText,
  Loader2, AlertTriangle, Calendar
} from 'lucide-react'
import type { Participant } from './types'

interface ModalParticipantDetailProps {
  participant: Participant | null
  onClose: () => void
  onUpdateStatus?: (id: string, status: string) => void
  onRequestMoreInfo?: (id: string, email: string, name: string, message: string) => Promise<any>
}

export function ModalParticipantDetail({
  participant, onClose, onUpdateStatus, onRequestMoreInfo,
}: ModalParticipantDetailProps) {
  const [reviewNotes, setReviewNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showRequestInfo, setShowRequestInfo] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)

  if (!participant) return null

  const p = participant as any // Cast to access fields not in strict type

  const isPending = p.application_status === 'pending'
  const hasInterestForm = !!p.interest_form_completed_at
  const hasTravelForm = !!p.travel_form_completed_at
  const hasMedicalForm = !!p.medical_form_completed_at
  const hasWaiver = !!p.waiver_signed_at

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
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
    }
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status?.replace('_', ' ') || 'unknown'}</Badge>
  }

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
              Applied {p.application_date ? new Date(p.application_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
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
            <Badge className={hasMedicalForm ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
              {hasMedicalForm ? '✓' : '○'} Medical Form
            </Badge>
            <Badge className={hasWaiver ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
              {hasWaiver ? '✓' : '○'} Waiver
            </Badge>
          </div>

          {/* Contact & Personal */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" /> Contact & Personal
            </h3>
            <div className={sectionClasses}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={labelClasses}>Email</p>
                  <p className={valueClasses}>
                    <a href={`mailto:${p.email}`} className="text-navy hover:underline">{p.email}</a>
                  </p>
                </div>
                <div>
                  <p className={labelClasses}>Phone</p>
                  <p className={valueClasses}>{p.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className={labelClasses}>Location</p>
                  <p className={valueClasses}>{p.location || 'Not provided'}</p>
                </div>
                <div>
                  <p className={labelClasses}>Service Track</p>
                  <p className={valueClasses}>{p.service_track || 'Not selected'}</p>
                </div>
                {p.organization && (
                  <div>
                    <p className={labelClasses}>Organization</p>
                    <p className={valueClasses}>{p.organization}{p.org_title ? ` (${p.org_title})` : ''}</p>
                  </div>
                )}
                {p.date_of_birth && (
                  <div>
                    <p className={labelClasses}>Date of Birth</p>
                    <p className={valueClasses}>{new Date(p.date_of_birth).toLocaleDateString()}</p>
                  </div>
                )}
                {p.ministry_role && (
                  <div>
                    <p className={labelClasses}>Ministry Role</p>
                    <p className={valueClasses}>{p.ministry_role}</p>
                  </div>
                )}
                {p.scholarship_requested && (
                  <div className="col-span-2">
                    <Badge className="bg-amber-100 text-amber-800">Scholarship Requested</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Applicant Notes / Skills */}
          {p.notes && (
            <div>
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" /> Applicant Notes & Skills
              </h3>
              <div className={`${sectionClasses} border-l-4 border-navy`}>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.notes}</p>
              </div>
            </div>
          )}

          {/* Travel Info (if travel form completed) */}
          {hasTravelForm && (
            <div>
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" /> Travel Details
              </h3>
              <div className={sectionClasses}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {p.legal_full_name && (
                    <div>
                      <p className={labelClasses}>Legal Full Name</p>
                      <p className={valueClasses}>{p.legal_full_name}</p>
                    </div>
                  )}
                  {p.travel_accommodation_type && (
                    <div>
                      <p className={labelClasses}>Accommodation Type</p>
                      <p className={valueClasses}>{p.travel_accommodation_type}</p>
                    </div>
                  )}
                  {(p.travel_date_in || p.travel_date_out) && (
                    <>
                      <div>
                        <p className={labelClasses}>Travel Date In</p>
                        <p className={valueClasses}>{p.travel_date_in ? new Date(p.travel_date_in).toLocaleDateString() : 'TBD'}</p>
                      </div>
                      <div>
                        <p className={labelClasses}>Travel Date Out</p>
                        <p className={valueClasses}>{p.travel_date_out ? new Date(p.travel_date_out).toLocaleDateString() : 'TBD'}</p>
                      </div>
                    </>
                  )}
                  {(p.departure_airport || p.return_airport) && (
                    <div>
                      <p className={labelClasses}>Route</p>
                      <p className={valueClasses}>{p.departure_airport || 'TBD'} → {p.return_airport || 'NBO'}</p>
                    </div>
                  )}
                  {p.special_assistance && (
                    <div>
                      <p className={labelClasses}>Special Assistance</p>
                      <p className={valueClasses}>{p.special_assistance}</p>
                    </div>
                  )}
                  {p.travel_notes && (
                    <div className="col-span-2">
                      <p className={labelClasses}>Travel Notes</p>
                      <p className={valueClasses}>{p.travel_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Travel Documents */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" /> Travel Documents
            </h3>
            <div className={sectionClasses}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={labelClasses}>Passport</p>
                  <div className="mt-0.5">{statusBadge(p.passport_status)}</div>
                </div>
                <div>
                  <p className={labelClasses}>Passport Expiry</p>
                  <p className={valueClasses}>{p.passport_expiry ? new Date(p.passport_expiry).toLocaleDateString() : 'Not provided'}</p>
                </div>
                <div>
                  <p className={labelClasses}>Visa</p>
                  <div className="mt-0.5">{statusBadge(p.visa_status)}</div>
                </div>
                <div>
                  <p className={labelClasses}>Flight Status</p>
                  <p className={valueClasses}>{p.flight_status || 'Not booked'}</p>
                </div>
                <div>
                  <p className={labelClasses}>Hotel Status</p>
                  <p className={valueClasses}>{p.hotel_status || 'Not booked'}</p>
                </div>
                <div>
                  <p className={labelClasses}>Booking Type</p>
                  <p className={valueClasses}>{p.booking_type || 'TBD'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4" /> Medical
            </h3>
            <div className={sectionClasses}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={labelClasses}>Allergies</p>
                  <p className={valueClasses}>{p.allergies || 'None'}</p>
                </div>
                <div>
                  <p className={labelClasses}>Medications</p>
                  <p className={valueClasses}>{p.medications || 'None'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" /> Emergency Contact
            </h3>
            <div className={sectionClasses}>
              {p.emergency_contact_name ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={labelClasses}>Name</p>
                    <p className={valueClasses}>{p.emergency_contact_name}</p>
                  </div>
                  <div>
                    <p className={labelClasses}>Phone</p>
                    <p className={valueClasses}>{p.emergency_contact_phone}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Not yet provided
                </p>
              )}
            </div>
          </div>

          {/* Financial */}
          <div>
            <h3 className="font-semibold text-navy mb-3 flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4" /> Financial
            </h3>
            <div className={sectionClasses}>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className={labelClasses}>Trip Cost</p>
                  <p className={valueClasses}>${p.trip_cost || p.fundraising_goal || 3500}</p>
                </div>
                <div>
                  <p className={labelClasses}>Amount Paid</p>
                  <p className={valueClasses}>${p.amount_paid || 0}</p>
                </div>
                <div>
                  <p className={labelClasses}>Payment Status</p>
                  <div className="mt-0.5">{statusBadge(p.payment_status)}</div>
                </div>
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
                    Send a follow-up email to {p.first_name} requesting additional information before making a decision.
                  </p>
                  <Textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder={`Hi ${p.first_name},\n\nThank you for your interest in the Kenya Kingdom Impact Trip! Before we finalize your application, we'd love to learn a bit more:\n\n- How did you hear about the trip?\n- Do you have a connection to TPC Ministries or a referral?\n- What specific skills or experience would you bring to the ${p.service_track || 'ministry'} track?\n\nLooking forward to hearing from you!\n\nTPC Ministries Team`}
                    rows={8}
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

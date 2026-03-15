'use client'

import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Participant } from './types'

interface ModalParticipantDetailProps {
  participant: Participant | null
  onClose: () => void
}

export function ModalParticipantDetail({
  participant, onClose,
}: ModalParticipantDetailProps) {
  if (!participant) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-navy">Participant Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-navy mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Name:</span> {participant.first_name} {participant.last_name}</div>
              <div><span className="text-gray-500">Email:</span> {participant.email}</div>
              <div><span className="text-gray-500">Phone:</span> {participant.phone || '-'}</div>
              <div><span className="text-gray-500">Track:</span> {participant.service_track || '-'}</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-navy mb-3">Travel Documents</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Passport Status:</span>
                <Badge className="ml-2">{participant.passport_status}</Badge>
              </div>
              <div><span className="text-gray-500">Passport Expiry:</span> {participant.passport_expiry || '-'}</div>
              <div>
                <span className="text-gray-500">Visa Status:</span>
                <Badge className="ml-2">{participant.visa_status}</Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-navy mb-3">Medical Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Allergies:</span> {participant.allergies || 'None'}</div>
              <div><span className="text-gray-500">Medications:</span> {participant.medications || 'None'}</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-navy mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Name:</span> {participant.emergency_contact_name || '-'}</div>
              <div><span className="text-gray-500">Phone:</span> {participant.emergency_contact_phone || '-'}</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-navy mb-3">Financial</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Fundraising Goal:</span> ${participant.fundraising_goal}</div>
              <div><span className="text-gray-500">Amount Raised:</span> ${participant.amount_raised}</div>
              <div>
                <span className="text-gray-500">Payment Status:</span>
                <Badge className="ml-2">{participant.payment_status}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

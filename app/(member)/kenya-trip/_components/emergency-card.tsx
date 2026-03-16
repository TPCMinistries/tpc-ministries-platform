'use client'

import { useState } from 'react'
import { Phone, X, Shield } from 'lucide-react'

export function EmergencyCard() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        title="Emergency Contacts"
      >
        <Shield className="h-6 w-6" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-red-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Emergency Contacts
              </h2>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-red-700 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <ContactRow label="Trip Leader — Lorenzo" number="+1 (XXX) XXX-XXXX" note="Call/WhatsApp anytime" />
              <ContactRow label="Kenya Emergency" number="999 / 112" note="Police, fire, ambulance" />
              <ContactRow label="US Embassy Nairobi" number="+254-20-363-6000" note="After hours: +254-20-363-6170" />
              <ContactRow label="Prophet Caleb (Kakamega)" number="+254-XXX-XXX-XXX" note="Local partner — Western Kenya" />
              <ContactRow label="Dr. Shem (Nairobi)" number="+254-XXX-XXX-XXX" note="Local partner — Nairobi" />
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 font-medium mb-1">NEAREST HOSPITALS</p>
                <p className="text-xs text-gray-600">Nairobi: Nairobi Hospital — +254-20-284-5000</p>
                <p className="text-xs text-gray-600">Kakamega: Kakamega County Referral Hospital</p>
                <p className="text-xs text-gray-600">Mombasa: Aga Khan Hospital — +254-41-222-7710</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 font-medium mb-1">TRAVEL INSURANCE</p>
                <p className="text-xs text-gray-600">Policy details will be shared before departure</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ContactRow({ label, number, note }: { label: string; number: string; note: string }) {
  return (
    <a href={`tel:${number.replace(/[^+\d]/g, '')}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
        <Phone className="h-4 w-4 text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{note}</p>
      </div>
      <p className="text-sm font-mono text-navy shrink-0">{number}</p>
    </a>
  )
}

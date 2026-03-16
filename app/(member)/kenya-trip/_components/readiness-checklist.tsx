'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Circle, AlertTriangle } from 'lucide-react'

interface Participant {
  passport_status: string
  visa_status: string
  payment_status: string
  amount_paid?: number
  trip_cost?: number
  interest_form_completed_at?: string
  travel_form_completed_at?: string
  medical_form_completed_at?: string
  waiver_signed_at?: string
  flight_status?: string
}

export function ReadinessChecklist({ participant }: { participant: Participant }) {
  const items = [
    {
      label: 'Passport Valid',
      done: ['\u2705 Valid', 'verified'].some(s => (participant.passport_status || '').toLowerCase().includes(s.toLowerCase())),
      urgent: true,
    },
    {
      label: 'Visa Ready',
      done: ['\u2705 Valid', 'approved'].some(s => (participant.visa_status || '').toLowerCase().includes(s.toLowerCase())),
      urgent: true,
    },
    {
      label: 'Payment Complete',
      done: participant.payment_status === 'paid',
      urgent: true,
    },
    {
      label: 'Travel Form',
      done: !!participant.travel_form_completed_at,
      urgent: false,
    },
    {
      label: 'Medical Form',
      done: !!participant.medical_form_completed_at,
      urgent: false,
    },
    {
      label: 'Liability Waiver',
      done: !!participant.waiver_signed_at,
      urgent: false,
    },
    {
      label: 'Flight Booked',
      done: (participant.flight_status || '').includes('Booked'),
      urgent: true,
    },
  ]

  const completedCount = items.filter(i => i.done).length
  const percentage = Math.round((completedCount / items.length) * 100)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Pre-Trip Readiness</span>
          <span className={`text-sm font-bold ${percentage === 100 ? 'text-green-600' : percentage >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
            {completedCount}/{items.length}
          </span>
        </CardTitle>
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${percentage === 100 ? 'bg-green-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              {item.done ? (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              ) : item.urgent ? (
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300 shrink-0" />
              )}
              <span className={`text-sm ${item.done ? 'text-green-700 line-through' : item.urgent ? 'text-red-700 font-medium' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

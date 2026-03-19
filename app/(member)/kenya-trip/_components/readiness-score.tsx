'use client'

import type { Participant, PackingStatus, PackingItem } from './types'
import { DEADLINES } from './constants'

interface ReadinessScoreProps {
  participant: Participant
  packingItems: PackingItem[]
  packingStatus: PackingStatus[]
}

interface ReadinessItemResult {
  key: string
  label: string
  done: boolean
}

function computeReadinessItems(
  participant: Participant,
  packingItems: PackingItem[],
  packingStatus: PackingStatus[]
): ReadinessItemResult[] {
  const packedCount = packingStatus.filter(s => s.is_packed).length
  const totalPacking = packingItems.length

  return [
    {
      key: 'passport',
      label: 'Passport',
      done: !!participant.passport_document_url || ['verified', 'valid'].some(s => (participant.passport_status || '').toLowerCase().includes(s)),
    },
    {
      key: 'visa',
      label: 'Visa',
      done: !!participant.visa_document_url || (participant.visa_status || '').toLowerCase().includes('approved'),
    },
    {
      key: 'vaccinations',
      label: 'Vaccinations',
      done: !!participant.vaccination_document_url,
    },
    {
      key: 'payment',
      label: 'Payment',
      done: participant.payment_status === 'paid',
    },
    {
      key: 'forms',
      label: 'Forms',
      done: !!(participant.travel_form_completed_at && participant.medical_form_completed_at),
    },
    {
      key: 'packing',
      label: 'Packing',
      done: totalPacking > 0 && packedCount >= totalPacking,
    },
  ]
}

export function ReadinessScore({ participant, packingItems, packingStatus }: ReadinessScoreProps) {
  const items = computeReadinessItems(participant, packingItems, packingStatus)
  const doneCount = items.filter(i => i.done).length
  const total = items.length
  const percentage = Math.round((doneCount / total) * 100)

  // SVG ring
  const size = 120
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const color =
    percentage === 100 ? 'text-green-500' :
    percentage >= 60 ? 'text-gold' :
    'text-red-500'

  const strokeColor =
    percentage === 100 ? '#22c55e' :
    percentage >= 60 ? '#C4A052' :
    '#ef4444'

  return (
    <div className="flex items-center gap-6">
      {/* Circular progress ring */}
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{percentage}%</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Ready</span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {items.map(item => (
          <div key={item.key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={`text-sm ${item.done ? 'text-green-700 line-through' : 'text-gray-700'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { computeReadinessItems }

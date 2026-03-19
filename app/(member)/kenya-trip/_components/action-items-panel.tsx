'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, ChevronRight, CheckCircle } from 'lucide-react'
import { DEADLINES } from './constants'
import type { Participant, ActionItem, DelegateTabType } from './types'

interface ActionItemsPanelProps {
  participant: Participant
  onNavigate: (tab: DelegateTabType) => void
}

function getActionItems(participant: Participant): ActionItem[] {
  const items: ActionItem[] = []
  const today = new Date()

  function checkDeadline(
    id: string,
    label: string,
    done: boolean,
    deadlineStr: string,
    link: DelegateTabType
  ) {
    if (done) return
    const deadline = new Date(deadlineStr + 'T23:59:59')
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) {
      items.push({ id, label: `${label} (overdue!)`, type: 'overdue', dueDate: deadlineStr, link })
    } else if (daysUntil <= 7) {
      items.push({ id, label: `${label} (due ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`, type: 'urgent', dueDate: deadlineStr, link })
    } else {
      items.push({ id, label: `${label} (due ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`, type: 'upcoming', dueDate: deadlineStr, link })
    }
  }

  // Passport
  const hasPassport = !!participant.passport_document_url || ['verified', 'valid'].some(s => (participant.passport_status || '').toLowerCase().includes(s))
  checkDeadline('passport', 'Upload passport', hasPassport, DEADLINES.passport, 'prepare')

  // Visa
  const hasVisa = !!participant.visa_document_url || (participant.visa_status || '').toLowerCase().includes('approved')
  checkDeadline('visa', 'Upload visa', hasVisa, DEADLINES.visa, 'prepare')

  // Vaccinations
  checkDeadline('vaccination', 'Upload vaccination records', !!participant.vaccination_document_url, DEADLINES.vaccination, 'prepare')

  // Insurance
  checkDeadline('insurance', 'Upload travel insurance', !!participant.insurance_document_url, DEADLINES.insurance, 'prepare')

  // Travel form
  checkDeadline('travelForm', 'Complete travel form', !!participant.travel_form_completed_at, DEADLINES.travelForm, 'prepare')

  // Health form
  checkDeadline('healthForm', 'Complete health form', !!participant.medical_form_completed_at, DEADLINES.healthForm, 'prepare')

  // Payment
  if (participant.payment_status !== 'paid') {
    const nextAmount = participant.next_payment_amount || (participant.trip_cost ? participant.trip_cost - (participant.amount_paid || 0) : null)
    const amountStr = nextAmount ? ` $${nextAmount.toLocaleString()}` : ''
    checkDeadline('payment', `Next payment${amountStr}`, false, DEADLINES.finalPayment, 'finances')
  }

  // Sort: overdue first, then urgent, then upcoming
  const priority: Record<string, number> = { overdue: 0, urgent: 1, upcoming: 2, info: 3 }
  items.sort((a, b) => priority[a.type] - priority[b.type])

  return items
}

export function ActionItemsPanel({ participant, onNavigate }: ActionItemsPanelProps) {
  const items = getActionItems(participant)

  if (items.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">All caught up!</p>
            <p className="text-sm text-green-700">No pending action items. You are trip-ready.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-gold" />
          Action Items
          <Badge variant="outline" className="ml-auto">{items.length} pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {items.map(item => {
            const bgColor =
              item.type === 'overdue' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
              item.type === 'urgent' ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' :
              'bg-gray-50 border-gray-200 hover:bg-gray-100'

            const iconColor =
              item.type === 'overdue' ? 'text-red-600' :
              item.type === 'urgent' ? 'text-yellow-600' :
              'text-gray-400'

            return (
              <button
                key={item.id}
                onClick={() => item.link && onNavigate(item.link)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${bgColor}`}
              >
                {item.type === 'overdue' ? (
                  <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
                ) : (
                  <Clock className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
                )}
                <span className={`text-sm flex-1 ${item.type === 'overdue' ? 'text-red-800 font-medium' : item.type === 'urgent' ? 'text-yellow-800 font-medium' : 'text-gray-700'}`}>
                  {item.label}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

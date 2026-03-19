'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DollarSign, ExternalLink, Heart, CheckCircle2, Gift, CreditCard } from 'lucide-react'
import type { Participant, Donation } from './types'

interface PaymentTrackerProps {
  participant: Participant
  donations: Donation[]
}

export function PaymentTracker({ participant, donations }: PaymentTrackerProps) {
  const tripCost = participant.trip_cost || participant.fundraising_goal || 0
  const scholarship = (participant as Record<string, unknown>).scholarship_amount as number || 0
  const selfPayments = participant.amount_paid || 0
  const fundraising = participant.amount_raised || 0
  const adminCredits = (participant as Record<string, unknown>).admin_credits_total as number || 0
  const totalCovered = scholarship + selfPayments + fundraising + adminCredits
  const remaining = Math.max(0, tripCost - totalCovered)
  const surplus = tripCost - totalCovered < 0 ? Math.abs(tripCost - totalCovered) : 0
  const paymentPercent = tripCost > 0 ? Math.min(100, Math.round((totalCovered / tripCost) * 100)) : 0
  const isFullyFunded = remaining === 0

  const statusColor =
    participant.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
    participant.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-gold" />
          Payment Tracker
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge className={statusColor}>{participant.payment_status || 'pending'}</Badge>
          {participant.booking_type && (
            <Badge variant="outline">{participant.booking_type}</Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Payment Progress</span>
            <span className="text-sm font-medium">{paymentPercent}%</span>
          </div>
          <Progress value={paymentPercent} className="h-3" />
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-2xl font-bold text-navy">${totalCovered.toLocaleString()}</span>
            <span className="text-gray-500">of ${tripCost.toLocaleString()}</span>
          </div>
          {isFullyFunded ? (
            <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Fully Funded!
                {surplus > 0 && <> ${surplus.toLocaleString()} surplus going to the mission</>}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              ${remaining.toLocaleString()} remaining
              {participant.next_payment_due_date && (
                <> &mdash; next due {new Date(participant.next_payment_due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
              )}
            </p>
          )}
        </div>

        {/* Breakdown */}
        <div className="border-t pt-3 space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Breakdown</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-600">Trip Cost</span>
            </div>
            <span className="text-right font-medium text-navy">${tripCost.toLocaleString()}</span>

            {scholarship > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Gift className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-gray-600">Scholarship</span>
                </div>
                <span className="text-right font-medium text-amber-600">-${scholarship.toLocaleString()}</span>
              </>
            )}

            {selfPayments > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-gray-600">Self-Payments</span>
                </div>
                <span className="text-right font-medium text-blue-600">-${selfPayments.toLocaleString()}</span>
              </>
            )}

            {fundraising > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-gray-600">Fundraising</span>
                </div>
                <span className="text-right font-medium text-green-600">-${fundraising.toLocaleString()}</span>
              </>
            )}

            {adminCredits > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-gray-600">Sponsorship/Credits</span>
                </div>
                <span className="text-right font-medium text-purple-600">-${adminCredits.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Payment button */}
        {participant.payment_status !== 'paid' && (
          <a href="/kenya/donate" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-gold hover:bg-gold/90 text-white gap-2">
              <DollarSign className="h-4 w-4" />
              Make a Payment
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        )}

        {/* Payment history */}
        {donations.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-navy mb-3">Payment History</h4>
            <div className="space-y-2">
              {donations.slice(0, 5).map(donation => (
                <div key={donation.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    donation.is_manual_entry ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <Heart className={`h-4 w-4 ${donation.is_manual_entry ? 'text-blue-600' : 'text-green-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">${donation.net_amount.toLocaleString()}</p>
                    {donation.is_manual_entry && (
                      <Badge variant="outline" className="text-[10px]">Offline</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

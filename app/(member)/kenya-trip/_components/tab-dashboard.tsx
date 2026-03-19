'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  Sun,
  Bell,
  Sparkles,
  Gift,
  ExternalLink,
} from 'lucide-react'
import { DailyDevotional } from './daily-devotional'
import { DailyCheckin } from './daily-checkin'
import { ReadinessScore } from './readiness-score'
import { ActionItemsPanel } from './action-items-panel'
import type { DelegateData } from './use-delegate-data'
import type { DelegateTabType } from './types'

interface TabDashboardProps {
  data: DelegateData
  onNavigate: (tab: DelegateTabType) => void
}

export function TabDashboard({ data, onNavigate }: TabDashboardProps) {
  const { trip, participant, member, announcements, dailyFocus, packingItems, packingStatus, donations } = data

  if (!trip || !participant) return null

  const today = new Date().toISOString().split('T')[0]
  const todaysFocus = dailyFocus.find(df => df.focus_date === today)
  const unreadAnnouncements = announcements.length
  const fundraisingPercent = participant.fundraising_goal > 0
    ? Math.min(100, Math.round((participant.amount_raised / participant.fundraising_goal) * 100))
    : 0
  const tripCost = participant.trip_cost || participant.fundraising_goal || 0
  const scholarship = (participant as Record<string, unknown>).scholarship_amount as number || 0
  const selfPayments = participant.amount_paid || 0
  const fundraisingAmount = participant.amount_raised || 0
  const adminCredits = (participant as Record<string, unknown>).admin_credits_total as number || 0
  const totalCovered = scholarship + selfPayments + fundraisingAmount + adminCredits
  const paymentPercent = tripCost > 0 ? Math.min(100, Math.round((totalCovered / tripCost) * 100)) : 0

  return (
    <div className="grid gap-6">
      {/* Readiness Score + Action Items (side by side on desktop) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Readiness Score */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-navy mb-4">Trip Readiness</h3>
            <ReadinessScore
              participant={participant}
              packingItems={packingItems}
              packingStatus={packingStatus}
            />
          </CardContent>
        </Card>

        {/* Action Items */}
        <ActionItemsPanel
          participant={participant}
          onNavigate={onNavigate}
        />
      </div>

      {/* Payment Mini-bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <DollarSign className="h-5 w-5 text-gold flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-navy">
                  ${totalCovered.toLocaleString()} covered
                </span>
                <span className="text-xs text-gray-500">
                  of ${tripCost.toLocaleString()}
                </span>
              </div>
              <Progress value={paymentPercent} className="h-2" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('finances')}
              className="flex-shrink-0"
            >
              Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {/* Today's prayer focus teaser */}
        {todaysFocus && (
          <button
            onClick={() => onNavigate('prayer')}
            className="p-4 bg-gradient-to-br from-gold/10 to-amber-50 rounded-lg border border-gold/20 text-left hover:bg-gold/15 transition-colors"
          >
            <Sun className="h-5 w-5 text-gold mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">Today&apos;s Focus</p>
            <p className="text-sm font-medium text-navy mt-1 line-clamp-2">{todaysFocus.theme}</p>
          </button>
        )}

        {/* Unread announcements */}
        <button
          onClick={() => onNavigate('community')}
          className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 transition-colors"
        >
          <Bell className="h-5 w-5 text-blue-600 mb-2" />
          <p className="text-xs text-gray-500 uppercase tracking-wider">Announcements</p>
          <p className="text-sm font-medium text-navy mt-1">{unreadAnnouncements} update{unreadAnnouncements !== 1 ? 's' : ''}</p>
        </button>

        {/* Fundraising teaser */}
        <button
          onClick={() => onNavigate('finances')}
          className="p-4 bg-green-50 rounded-lg border border-green-100 text-left hover:bg-green-100 transition-colors"
        >
          <Gift className="h-5 w-5 text-green-600 mb-2" />
          <p className="text-xs text-gray-500 uppercase tracking-wider">Fundraising</p>
          <p className="text-sm font-medium text-navy mt-1">{fundraisingPercent}% of goal</p>
        </button>

        {/* Track Lead Dashboard link */}
        {participant.team_leader && (
          <a
            href="/kenya-trip/track-lead"
            className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-left hover:bg-purple-100 transition-colors"
          >
            <Sparkles className="h-5 w-5 text-purple-600 mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">Track Lead</p>
            <p className="text-sm font-medium text-navy mt-1 flex items-center gap-1">
              Dashboard <ExternalLink className="h-3 w-3" />
            </p>
          </a>
        )}
      </div>

      {/* Daily Devotional */}
      <DailyDevotional tripId={trip.id} />

      {/* Daily Check-in */}
      <DailyCheckin tripId={trip.id} participantId={participant.id} />
    </div>
  )
}

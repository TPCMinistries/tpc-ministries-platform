'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, CheckCircle, AlertTriangle, FileText, Shield, Plane, CreditCard } from 'lucide-react'
import { DEADLINES, TRACK_COLORS } from '../../_components/constants'
import type { Trip, Announcement, TrackDetail, TrackMaterial } from '../../_components/types'

interface TrackParticipant {
  id: string
  first_name: string
  last_name: string
  email: string
  passport_status: string
  visa_status: string
  payment_status: string
  service_track: string | null
  interest_form_completed_at: string | null
  travel_form_completed_at: string | null
  medical_form_completed_at: string | null
  waiver_signed_at: string | null
  flight_status: string | null
  application_status: string
}

interface TabOverviewProps {
  trip: Trip
  participant: {
    service_track: string | null
    first_name: string
    last_name: string
  }
  trackParticipants: TrackParticipant[]
  trackDetails: TrackDetail[]
  trackMaterials: TrackMaterial[]
  announcements: Announcement[]
}

export function TabOverview({
  trip,
  participant,
  trackParticipants,
  trackDetails,
  trackMaterials,
  announcements,
}: TabOverviewProps) {
  const track = participant.service_track || 'Unknown'
  const colors = TRACK_COLORS[track] || { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' }
  const now = new Date()

  // Calculate readiness stats
  const total = trackParticipants.length
  const approved = trackParticipants.filter(p => p.application_status === 'approved').length

  const passportReady = trackParticipants.filter(p =>
    p.passport_status === 'valid' || p.passport_status === 'verified'
  ).length

  const visaReady = trackParticipants.filter(p =>
    p.visa_status === 'approved' || p.visa_status === 'received'
  ).length

  const paymentDone = trackParticipants.filter(p =>
    p.payment_status === 'paid' || p.payment_status === 'completed'
  ).length

  const formsComplete = trackParticipants.filter(p =>
    p.interest_form_completed_at &&
    p.travel_form_completed_at &&
    p.medical_form_completed_at &&
    p.waiver_signed_at
  ).length

  const flightBooked = trackParticipants.filter(p =>
    p.flight_status === 'booked' || p.flight_status === 'confirmed'
  ).length

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0

  // Overdue items — delegates missing critical items past deadline
  const overdueItems: { name: string; issue: string }[] = []
  const passportDeadline = new Date(DEADLINES.passport)
  const visaDeadline = new Date(DEADLINES.visa)
  const formDeadline = new Date(DEADLINES.travelForm)

  if (now > passportDeadline) {
    trackParticipants
      .filter(p => p.passport_status !== 'valid' && p.passport_status !== 'verified')
      .forEach(p => overdueItems.push({ name: `${p.first_name} ${p.last_name}`, issue: 'Passport not verified' }))
  }

  if (now > visaDeadline) {
    trackParticipants
      .filter(p => p.visa_status !== 'approved' && p.visa_status !== 'received')
      .forEach(p => overdueItems.push({ name: `${p.first_name} ${p.last_name}`, issue: 'Visa not approved' }))
  }

  if (now > formDeadline) {
    trackParticipants
      .filter(p => !p.travel_form_completed_at)
      .forEach(p => overdueItems.push({ name: `${p.first_name} ${p.last_name}`, issue: 'Travel form incomplete' }))
    trackParticipants
      .filter(p => !p.medical_form_completed_at)
      .forEach(p => overdueItems.push({ name: `${p.first_name} ${p.last_name}`, issue: 'Medical form incomplete' }))
  }

  // Track materials progress
  const totalMaterials = trackMaterials.length
  const checkedMaterials = trackMaterials.filter(m => m.is_checked).length
  const materialsPct = totalMaterials > 0 ? Math.round((checkedMaterials / totalMaterials) * 100) : 0

  // Recent announcements (top 3)
  const recentAnnouncements = announcements
    .filter(a => a.target_audience === 'all' || a.target_audience === track)
    .slice(0, 3)

  const statCards = [
    { label: 'Total Delegates', value: total, icon: Users, color: 'text-blue-600' },
    { label: 'Passport Ready', value: `${pct(passportReady)}%`, icon: FileText, color: 'text-green-600' },
    { label: 'Visa Ready', value: `${pct(visaReady)}%`, icon: Shield, color: 'text-purple-600' },
    { label: 'Payment Done', value: `${pct(paymentDone)}%`, icon: CreditCard, color: 'text-amber-600' },
    { label: 'Forms Complete', value: `${pct(formsComplete)}%`, icon: CheckCircle, color: 'text-teal-600' },
    { label: 'Flights Booked', value: `${pct(flightBooked)}%`, icon: Plane, color: 'text-indigo-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-navy">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Readiness Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-navy">Readiness Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Passport', done: passportReady, color: pct(passportReady) >= 80 ? 'bg-green-100 border-green-300' : pct(passportReady) >= 50 ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300' },
              { label: 'Visa', done: visaReady, color: pct(visaReady) >= 80 ? 'bg-green-100 border-green-300' : pct(visaReady) >= 50 ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300' },
              { label: 'Payment', done: paymentDone, color: pct(paymentDone) >= 80 ? 'bg-green-100 border-green-300' : pct(paymentDone) >= 50 ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300' },
              { label: 'Forms', done: formsComplete, color: pct(formsComplete) >= 80 ? 'bg-green-100 border-green-300' : pct(formsComplete) >= 50 ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300' },
              { label: 'Flights', done: flightBooked, color: pct(flightBooked) >= 80 ? 'bg-green-100 border-green-300' : pct(flightBooked) >= 50 ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300' },
              { label: 'Materials', done: checkedMaterials, total: totalMaterials, color: materialsPct >= 80 ? 'bg-green-100 border-green-300' : materialsPct >= 50 ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300' },
            ].map((item) => (
              <div key={item.label} className={`p-4 rounded-lg border ${item.color}`}>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-xl font-bold text-navy">
                  {item.done}/{item.total ?? total}
                </p>
                <p className="text-xs text-gray-500">
                  {item.total !== undefined
                    ? `${totalMaterials > 0 ? materialsPct : 0}% checked`
                    : `${pct(item.done)}% ready`
                  }
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-navy flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Overdue Items ({overdueItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueItems.length === 0 ? (
              <p className="text-sm text-gray-500">No overdue items. Your track is on track!</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {overdueItems.slice(0, 20).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded text-sm">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-red-600 text-xs">{item.issue}</span>
                  </div>
                ))}
                {overdueItems.length > 20 && (
                  <p className="text-xs text-gray-400 text-center">
                    + {overdueItems.length - 20} more items
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-navy">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length === 0 ? (
              <p className="text-sm text-gray-500">No announcements yet.</p>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.map((ann) => (
                  <div key={ann.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-navy">{ann.title}</span>
                      {ann.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                      {ann.priority === 'important' && (
                        <Badge className="bg-amber-100 text-amber-800 text-xs">Important</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ann.publish_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Track Objectives Summary */}
      {trackDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-navy">Track Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackDetails.map((detail) => (
                <div key={detail.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${colors.light} ${colors.text}`}>{detail.track}</Badge>
                  </div>
                  {detail.objectives && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Objectives</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.objectives}</p>
                    </div>
                  )}
                  {detail.scope && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Scope</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.scope}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

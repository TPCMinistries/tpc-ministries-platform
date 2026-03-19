'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users, MapPin, Building2, Clock, Megaphone, Handshake, CalendarDays
} from 'lucide-react'
import type { PartnerData } from './use-partner-data'

const PARTNER_TYPE_LABELS: Record<string, string> = {
  host: 'Host',
  coordinator: 'Coordinator',
  volunteer: 'Volunteer',
  staff: 'Staff',
  venue_contact: 'Venue Contact',
  translator: 'Translator',
  driver: 'Driver',
  medical: 'Medical',
  security: 'Security',
}

interface TabOverviewProps {
  data: PartnerData
}

export function TabOverview({ data }: TabOverviewProps) {
  const { partner, trip, delegates, lodging, contacts, announcements, proposals, allPartners } = data

  // Trip countdown
  const daysUntilTrip = trip
    ? Math.ceil((new Date(trip.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const pendingProposals = proposals.filter(p => p.status === 'pending')
  const recentAnnouncements = announcements.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Countdown + Role */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trip Countdown */}
        <Card className="border-[#006B3F]/30 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#006B3F]/10 flex items-center justify-center">
                <CalendarDays className="h-8 w-8 text-[#006B3F]" />
              </div>
              <div>
                {daysUntilTrip > 0 ? (
                  <>
                    <p className="text-3xl font-bold text-[#006B3F]">{daysUntilTrip}</p>
                    <p className="text-sm text-gray-600">days until the delegation arrives</p>
                  </>
                ) : daysUntilTrip === 0 ? (
                  <>
                    <p className="text-2xl font-bold text-[#006B3F]">Today!</p>
                    <p className="text-sm text-gray-600">The delegation arrives today</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-navy">Trip in progress</p>
                    <p className="text-sm text-gray-600">Day {Math.abs(daysUntilTrip) + 1} of the trip</p>
                  </>
                )}
                {trip && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                    {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Role Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#006B3F]/10 flex items-center justify-center">
                <Handshake className="h-5 w-5 text-[#006B3F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy text-lg">
                  {PARTNER_TYPE_LABELS[partner?.partner_type || ''] || partner?.partner_type}
                </p>
                {partner?.organization && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {partner.organization}
                  </p>
                )}
                {partner?.city && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {partner.city}, Kenya
                  </p>
                )}
                {partner?.responsibilities && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{partner.responsibilities}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold text-navy">{delegates.length}</p>
            <p className="text-xs text-gray-500">Delegates Incoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-1 text-amber-600" />
            <p className="text-2xl font-bold text-navy">{lodging.length}</p>
            <p className="text-xs text-gray-500">Lodging Locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Handshake className="h-6 w-6 mx-auto mb-1 text-[#006B3F]" />
            <p className="text-2xl font-bold text-navy">{allPartners.length}</p>
            <p className="text-xs text-gray-500">Partner Team</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-6 w-6 mx-auto mb-1 text-purple-600" />
            <p className="text-2xl font-bold text-navy">{contacts.length}</p>
            <p className="text-xs text-gray-500">Key Contacts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      {recentAnnouncements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-navy">
              <Megaphone className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAnnouncements.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-navy text-sm">{a.title}</p>
                    {a.priority === 'urgent' && (
                      <Badge className="bg-red-100 text-red-800 text-xs">Urgent</Badge>
                    )}
                    {a.is_pinned && (
                      <Badge className="bg-amber-100 text-amber-800 text-xs">Pinned</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(a.publish_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Proposals */}
      {pendingProposals.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-navy">
              <Clock className="h-5 w-5 text-amber-600" />
              Your Pending Proposals
              <Badge className="bg-amber-100 text-amber-800">{pendingProposals.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingProposals.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-navy">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.proposal_type.replace('_', ' ')}</p>
                </div>
                <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Partner Team */}
      {allPartners.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-navy">
              <Handshake className="h-5 w-5 text-[#006B3F]" />
              Partner Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {allPartners.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-[#006B3F]/10 flex items-center justify-center text-[#006B3F] font-semibold text-sm">
                    {p.first_name?.[0]}{p.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-navy truncate">
                      {p.first_name} {p.last_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {PARTNER_TYPE_LABELS[p.partner_type] || p.partner_type}
                      </Badge>
                      {p.city && <span>{p.city}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

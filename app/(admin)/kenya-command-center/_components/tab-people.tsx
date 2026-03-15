'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search, Users, Eye, CheckCircle, XCircle
} from 'lucide-react'
import type { Trip, Participant } from './types'
import { serviceTracks } from './constants'

interface TabPeopleProps {
  trip: Trip
  filteredParticipants: Participant[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterTrack: string
  setFilterTrack: (t: string) => void
  filterStatus: string
  setFilterStatus: (s: string) => void
  setSelectedParticipant: (p: Participant) => void
  updateParticipantStatus: (id: string, status: string) => void
}

export function TabPeople({
  trip, filteredParticipants, searchQuery, setSearchQuery,
  filterTrack, setFilterTrack, filterStatus, setFilterStatus,
  setSelectedParticipant, updateParticipantStatus,
}: TabPeopleProps) {
  return (
    <>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterTrack}
          onChange={(e) => setFilterTrack(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Tracks</option>
          {serviceTracks.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Participants Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Track</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Passport</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Visa</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Fundraising</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Payment</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Forms</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((p) => {
                const passportAlert = p.passport_expiry && (() => {
                  const expiry = new Date(p.passport_expiry!)
                  const tripEnd = new Date(trip.end_date)
                  tripEnd.setMonth(tripEnd.getMonth() + 6)
                  return expiry < tripEnd
                })()
                const fundraisingPercent = p.fundraising_goal > 0
                  ? Math.round((p.amount_raised / p.fundraising_goal) * 100)
                  : 0

                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center">
                          <span className="text-navy font-medium">
                            {p.first_name[0]}{p.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-navy flex items-center gap-2">
                            {p.first_name} {p.last_name}
                            {p.team_leader && (
                              <Badge className="bg-gold/20 text-gold-dark text-xs">Leader</Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm capitalize">{p.service_track || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        p.passport_status === 'verified' ? 'bg-green-100 text-green-800' :
                        passportAlert ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {p.passport_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        p.visa_status === 'approved' ? 'bg-green-100 text-green-800' :
                        p.visa_status === 'denied' ? 'bg-red-100 text-red-800' :
                        p.visa_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {p.visa_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="w-20">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{fundraisingPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              fundraisingPercent >= 100 ? 'bg-green-500' :
                              fundraisingPercent >= 50 ? 'bg-gold' :
                              'bg-red-400'
                            }`}
                            style={{ width: `${Math.min(fundraisingPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        p.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        p.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {[
                          { key: 'interest_form_completed_at', label: 'I' },
                          { key: 'travel_form_completed_at', label: 'T' },
                          { key: 'medical_form_completed_at', label: 'M' },
                          { key: 'waiver_signed_at', label: 'W' },
                        ].map(f => {
                          const done = !!(p as unknown as Record<string, unknown>)[f.key]
                          return (
                            <span
                              key={f.key}
                              title={`${f.label === 'I' ? 'Interest' : f.label === 'T' ? 'Travel' : f.label === 'M' ? 'Medical' : 'Waiver'} Form`}
                              className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {f.label}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        p.application_status === 'approved' ? 'bg-green-100 text-green-800' :
                        p.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        p.application_status === 'waitlisted' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {p.application_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedParticipant(p)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {p.application_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600"
                              onClick={() => updateParticipantStatus(p.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => updateParticipantStatus(p.id, 'declined')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredParticipants.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No participants found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

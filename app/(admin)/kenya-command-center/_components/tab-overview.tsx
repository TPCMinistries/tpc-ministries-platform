'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle, CheckCircle, XCircle, Receipt, Plus, Star
} from 'lucide-react'
import type { Trip, Participant, Expense, Announcement, Stats } from './types'
import { serviceTracks } from './constants'

interface CheckinData {
  participant_id: string
  checkin_date: string
}

interface TabOverviewProps {
  trip: Trip
  participants: Participant[]
  expenses: Expense[]
  announcements: Announcement[]
  stats: Stats
  todayCheckins: CheckinData[]
  setActiveTab: (tab: string) => void
  setShowAnnouncementModal: (show: boolean) => void
}

export function TabOverview({
  trip, participants, expenses, announcements, stats,
  todayCheckins,
  setActiveTab, setShowAnnouncementModal,
}: TabOverviewProps) {
  const approvedParticipants = participants.filter(p => p.application_status === 'approved')
  const checkedInIds = new Set(todayCheckins.map(c => c.participant_id))
  const checkedInCount = approvedParticipants.filter(p => checkedInIds.has(p.id)).length
  const notCheckedIn = approvedParticipants.filter(p => !checkedInIds.has(p.id))

  // Only show during/after trip start
  const tripStarted = new Date(trip.start_date) <= new Date()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Daily Check-In Dashboard */}
      {tripStarted && approvedParticipants.length > 0 && (
        <Card className="md:col-span-2 border-navy/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Daily Check-In — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <span className={`text-lg font-bold ${checkedInCount === approvedParticipants.length ? 'text-green-600' : 'text-amber-600'}`}>
                {checkedInCount}/{approvedParticipants.length}
              </span>
            </CardTitle>
            {/* Progress bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${checkedInCount === approvedParticipants.length ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${approvedParticipants.length > 0 ? (checkedInCount / approvedParticipants.length * 100) : 0}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {notCheckedIn.length === 0 ? (
              <p className="text-sm text-green-600 font-medium">All delegates checked in today!</p>
            ) : (
              <div>
                <p className="text-sm text-red-600 font-medium mb-2">
                  Not yet checked in ({notCheckedIn.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {notCheckedIn.map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-xs text-red-800">
                      <XCircle className="h-3 w-3" />
                      {p.first_name} {p.last_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { status: 'pending', label: 'Pending Review', color: 'bg-yellow-500' },
              { status: 'approved', label: 'Approved', color: 'bg-green-500' },
              { status: 'waitlisted', label: 'Waitlisted', color: 'bg-blue-500' },
              { status: 'declined', label: 'Declined', color: 'bg-red-500' },
            ].map(({ status, label, color }) => {
              const count = participants.filter(p => p.application_status === status).length
              const percent = stats.totalParticipants > 0 ? (count / stats.totalParticipants * 100) : 0
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fundraising Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Fundraising Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-navy">${stats.totalRaised.toLocaleString()}</p>
            <p className="text-gray-600">of ${stats.fundraisingGoal.toLocaleString()} goal</p>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
              style={{ width: `${Math.min((stats.totalRaised / stats.fundraisingGoal) * 100, 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-navy">{stats.fullyPaid}</p>
              <p className="text-gray-600">Fully Paid</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-yellow-600">{participants.filter(p => p.payment_status === 'partial').length}</p>
              <p className="text-gray-600">Partial</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-red-600">{participants.filter(p => p.payment_status === 'pending').length}</p>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Tracks */}
      <Card>
        <CardHeader>
          <CardTitle>Service Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {serviceTracks.map(track => {
              const count = participants.filter(p => p.service_track === track.value && p.application_status === 'approved').length
              return (
                <div key={track.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <track.icon className="h-5 w-5 text-navy" />
                  <span className="flex-1">{track.label}</span>
                  <span className="font-bold text-navy">{count}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.pendingApplications > 0 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="flex-1 text-sm">{stats.pendingApplications} applications need review</span>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('people')}>Review</Button>
            </div>
          )}
          {participants.filter(p => {
            if (!p.passport_expiry) return false
            const expiry = new Date(p.passport_expiry)
            const tripEnd = new Date(trip.end_date)
            tripEnd.setMonth(tripEnd.getMonth() + 6)
            return expiry < tripEnd
          }).length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="flex-1 text-sm">Passport expiry issues detected</span>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('people')}>View</Button>
            </div>
          )}
          {expenses.filter(e => e.status === 'pending').length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Receipt className="h-5 w-5 text-blue-600" />
              <span className="flex-1 text-sm">{expenses.filter(e => e.status === 'pending').length} expenses pending approval</span>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('budget')}>Review</Button>
            </div>
          )}
          {stats.pendingApplications === 0 && expenses.filter(e => e.status === 'pending').length === 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="flex-1 text-sm">All caught up! No pending items.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Announcements</CardTitle>
          <Button size="sm" onClick={() => setShowAnnouncementModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 3).map(ann => (
                <div key={ann.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    ann.priority === 'urgent' ? 'bg-red-500' :
                    ann.priority === 'high' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-navy">{ann.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ann.publish_at).toLocaleDateString()} • {ann.target_audience}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

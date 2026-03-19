'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, ShieldAlert, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { TrackLeadTabType } from '../_components/types'
import { trackLeadTabs, TRACK_COLORS } from '../_components/constants'
import { useTrackLeadData } from './_components/use-track-lead-data'
import { TabOverview } from './_components/tab-overview'
import { TabRoster } from './_components/tab-roster'
import { TabSchedule } from './_components/tab-schedule'
import { TabPrep } from './_components/tab-prep'
import { TabComms } from './_components/tab-comms'
import { TabPlan } from './_components/tab-plan'

export default function TrackLeadDashboard() {
  const [activeTab, setActiveTab] = useState<TrackLeadTabType>('overview')
  const data = useTrackLeadData()

  // Loading state
  if (data.loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-navy mx-auto mb-3" />
          <p className="text-gray-500">Loading track lead dashboard...</p>
        </div>
      </div>
    )
  }

  // Access denied — not a track lead
  if (data.error || !data.participant) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <ShieldAlert className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            {data.error || 'You must be a designated track lead to access this dashboard.'}
          </p>
          <Link href="/kenya-trip">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Portal
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const track = data.participant.service_track || 'Unknown'
  const colors = TRACK_COLORS[track] || { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' }

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-navy">
                {track} Track
              </h1>
              <Badge className={`${colors.light} ${colors.text} text-sm`}>
                Track Lead
              </Badge>
            </div>
            <p className="text-gray-500 text-sm">
              {data.participant.first_name} {data.participant.last_name} — {data.trackParticipants.length} delegate{data.trackParticipants.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={data.refetch}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Link href="/kenya-trip">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                My Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Track color accent bar */}
        <div className={`h-1 rounded-full ${colors.bg} mb-6`} />

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 border-b overflow-x-auto pb-px">
          {trackLeadTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && data.trip && (
          <TabOverview
            trip={data.trip}
            participant={data.participant}
            trackParticipants={data.trackParticipants}
            trackDetails={data.trackDetails}
            trackMaterials={data.trackMaterials}
            announcements={data.announcements}
          />
        )}

        {activeTab === 'roster' && (
          <TabRoster
            trackParticipants={data.trackParticipants}
            trackLeadNotes={data.trackLeadNotes}
            saveNote={data.saveNote}
          />
        )}

        {activeTab === 'schedule' && (
          <TabSchedule
            logisticsMatrix={data.logisticsMatrix}
            conferenceSessions={data.conferenceSessions}
            track={track}
          />
        )}

        {activeTab === 'prep' && (
          <TabPrep
            trackDetails={data.trackDetails}
            trackMaterials={data.trackMaterials}
            track={track}
            addMaterial={data.addMaterial}
            toggleMaterial={data.toggleMaterial}
            deleteMaterial={data.deleteMaterial}
          />
        )}

        {activeTab === 'comms' && (
          <TabComms
            announcements={data.announcements}
            actionItems={data.actionItems}
            track={track}
            createAnnouncement={data.createAnnouncement}
          />
        )}

        {activeTab === 'plan' && (
          <TabPlan
            trackPlans={data.trackPlans}
            createPlan={data.createPlan}
            updatePlan={data.updatePlan}
            deletePlan={data.deletePlan}
          />
        )}
      </div>
    </div>
  )
}

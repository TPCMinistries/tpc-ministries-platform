'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plane,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { useDelegateData } from './_components/use-delegate-data'
import { delegateTabs } from './_components/constants'
import { CountdownHero } from './_components/countdown-hero'
import { EmergencyCard } from './_components/emergency-card'
import { ApplicationForm } from './_components/application-form'
import { TabDashboard } from './_components/tab-dashboard'
import { TabPrepare } from './_components/tab-prepare'
import { TabFinances } from './_components/tab-finances'
import { TabItinerary } from './_components/tab-itinerary'
import { TabCommunity } from './_components/tab-community'
import { TabPrayer } from './_components/tab-prayer'
import { TabResources } from './_components/tab-resources'
import { TabJournal } from './_components/tab-journal'
import type { DelegateTabType } from './_components/types'

export default function KenyaTripPage() {
  const [activeTab, setActiveTab] = useState<DelegateTabType>('dashboard')
  const data = useDelegateData()

  // Loading state
  if (data.loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  // No trip found
  if (!data.trip) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <Plane className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-navy mb-2">No Upcoming Trip</h2>
          <p className="text-gray-600">Check back soon for information about our next mission trip!</p>
        </div>
      </div>
    )
  }

  // No participant record — show the application form
  if (!data.participant) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <CountdownHero trip={data.trip} participant={null} />
          <ApplicationForm
            trip={data.trip}
            member={data.member}
            onSubmit={data.submitApplication}
          />
        </div>
      </div>
    )
  }

  // Participant exists but not yet approved — show pending status
  if (data.participant.application_status !== 'approved') {
    return (
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <CountdownHero trip={data.trip} participant={data.participant} />
          <Card className={`mb-6 ${
            data.participant.application_status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
            data.participant.application_status === 'waitlisted' ? 'border-blue-500 bg-blue-50' :
            'border-red-500 bg-red-50'
          }`}>
            <CardContent className="p-6 flex items-center gap-4">
              {data.participant.application_status === 'pending' ? (
                <Clock className="h-10 w-10 text-yellow-600" />
              ) : data.participant.application_status === 'waitlisted' ? (
                <Clock className="h-10 w-10 text-blue-600" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-red-600" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-navy text-lg">
                  {data.participant.application_status === 'pending' && 'Application Under Review'}
                  {data.participant.application_status === 'waitlisted' && "You're on the Waitlist"}
                  {data.participant.application_status === 'declined' && 'Application Not Accepted'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {data.participant.application_status === 'pending' && "We'll notify you once your application has been reviewed. This typically takes 48 hours."}
                  {data.participant.application_status === 'waitlisted' && "We'll contact you if a spot opens up. Keep praying!"}
                  {data.participant.application_status === 'declined' && 'Please contact info@tpcmin.org for more information.'}
                </p>
                <div className="flex items-center gap-3 mt-3 text-sm">
                  <span className="text-gray-500">
                    Applied: {new Date(data.participant.application_date).toLocaleDateString()}
                  </span>
                  <Badge className={`${
                    data.participant.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    data.participant.application_status === 'waitlisted' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {data.participant.application_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Still show prayer tab content for pending/waitlisted participants */}
          <TabPrayer data={data} />
        </div>
      </div>
    )
  }

  // ─── Approved participant — full delegate portal ───────────────────────

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <TabDashboard data={data} onNavigate={setActiveTab} />
      case 'prepare':
        return <TabPrepare data={data} />
      case 'finances':
        return <TabFinances data={data} />
      case 'itinerary':
        return <TabItinerary data={data} />
      case 'community':
        return <TabCommunity data={data} />
      case 'prayer':
        return <TabPrayer data={data} />
      case 'resources':
        return <TabResources data={data} />
      case 'journal':
        return <TabJournal data={data} />
      default:
        return <TabDashboard data={data} onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero with countdown */}
        <CountdownHero trip={data.trip} participant={data.participant} />

        {/* Application Status Banner */}
        <Card className="mb-6 border-green-500 bg-green-50">
          <CardContent className="p-4 flex items-center gap-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="flex-1">
              <p className="font-semibold text-navy">You&apos;re going to Kenya!</p>
              <p className="text-sm text-gray-600">Complete your requirements below to prepare for the trip.</p>
            </div>
            {data.participant.team_leader && (
              <a
                href="/kenya-trip/track-lead"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                Track Lead Dashboard
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </CardContent>
        </Card>

        {/* Emergency Card */}
        <EmergencyCard />

        {/* Tab Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg min-w-max">
            {delegateTabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-gray-600 hover:text-navy hover:bg-white/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Tab Content */}
        {renderActiveTab()}
      </div>
    </div>
  )
}

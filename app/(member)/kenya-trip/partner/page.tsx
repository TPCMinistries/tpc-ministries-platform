'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, ShieldAlert, ArrowLeft, MapPin, Building2 } from 'lucide-react'
import Link from 'next/link'
import type { PartnerTabType } from '../_components/types'
import { partnerTabs } from '../_components/constants'
import { usePartnerData } from './_components/use-partner-data'
import { TabOverview } from './_components/tab-overview'
import { TabDelegation } from './_components/tab-delegation'
import { TabSchedule } from './_components/tab-schedule'
import { TabLogistics } from './_components/tab-logistics'
import { TabCoordination } from './_components/tab-coordination'
import { TabResources } from './_components/tab-resources'

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

export default function PartnerPortal() {
  const [activeTab, setActiveTab] = useState<PartnerTabType>('overview')
  const data = usePartnerData()

  // Loading state
  if (data.loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#006B3F] mx-auto mb-3" />
          <p className="text-gray-500">Loading partner portal...</p>
        </div>
      </div>
    )
  }

  // Access denied — not a partner
  if (data.error || !data.partner) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <ShieldAlert className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            {data.error || 'You must be a designated Kenya partner to access this portal.'}
          </p>
          <Link href="/kenya-trip">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Delegate Portal
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const partner = data.partner
  const partnerTypeLabel = PARTNER_TYPE_LABELS[partner.partner_type] || partner.partner_type

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-navy">
                {data.member?.first_name} {data.member?.last_name}
              </h1>
              <Badge className="bg-[#006B3F]/10 text-[#006B3F] border border-[#006B3F]/20">
                Kenya Partner
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Badge variant="outline" className="text-xs">
                {partnerTypeLabel}
              </Badge>
              {partner.organization && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {partner.organization}
                </span>
              )}
              {partner.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {partner.city}
                </span>
              )}
            </div>
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

        {/* Kenya green accent bar */}
        <div className="h-1 rounded-full bg-[#006B3F] mb-6" />

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 border-b overflow-x-auto pb-px">
          {partnerTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-[#006B3F] text-[#006B3F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <TabOverview data={data} />}
        {activeTab === 'delegation' && <TabDelegation data={data} />}
        {activeTab === 'schedule' && <TabSchedule data={data} />}
        {activeTab === 'logistics' && <TabLogistics data={data} />}
        {activeTab === 'coordination' && <TabCoordination data={data} />}
        {activeTab === 'resources' && <TabResources data={data} />}
      </div>
    </div>
  )
}

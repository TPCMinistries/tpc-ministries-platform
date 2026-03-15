'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Users, Clock, DollarSign, Shield, FileText, CreditCard
} from 'lucide-react'
import type { Trip, Stats } from './types'

interface StatsHeaderProps {
  trip: Trip
  stats: Stats
}

export function StatsHeader({ trip, stats }: StatsHeaderProps) {
  return (
    <div className="grid gap-6 md:grid-cols-6 mb-8">
      <Card className="bg-gradient-to-br from-navy to-navy-800 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Team Size</p>
              <p className="text-3xl font-bold">{stats.approvedParticipants}</p>
              <p className="text-xs text-white/50">of {trip.participant_goal} goal</p>
            </div>
            <Users className="h-10 w-10 text-white/20" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600/20" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fundraising</p>
              <p className="text-3xl font-bold text-gold">${(stats.totalRaised / 1000).toFixed(0)}k</p>
              <p className="text-xs text-gray-500">{((stats.totalRaised / stats.fundraisingGoal) * 100).toFixed(0)}% of goal</p>
            </div>
            <DollarSign className="h-10 w-10 text-gold/20" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Passports</p>
              <p className="text-3xl font-bold text-green-600">{stats.passportsVerified}</p>
              <p className="text-xs text-gray-500">verified</p>
            </div>
            <Shield className="h-10 w-10 text-green-600/20" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visas</p>
              <p className="text-3xl font-bold text-blue-600">{stats.visasApproved}</p>
              <p className="text-xs text-gray-500">approved</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600/20" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fully Paid</p>
              <p className="text-3xl font-bold text-purple-600">{stats.fullyPaid}</p>
            </div>
            <CreditCard className="h-10 w-10 text-purple-600/20" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

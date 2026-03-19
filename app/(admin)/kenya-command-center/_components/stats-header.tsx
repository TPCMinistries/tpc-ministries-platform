'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Users, Clock, DollarSign, Shield, FileText, CreditCard, TrendingUp
} from 'lucide-react'
import type { Trip, Stats } from './types'

interface StatsHeaderProps {
  trip: Trip
  stats: Stats
  waitingListCount?: number
  hideFinancials?: boolean
}

function formatK(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return `$${n.toLocaleString()}`
}

export function StatsHeader({ trip, stats, waitingListCount = 0, hideFinancials = false }: StatsHeaderProps) {
  const raisedPercent = stats.fundraisingGoal > 0
    ? Math.min(100, Math.round((stats.totalRaised / stats.fundraisingGoal) * 100))
    : 0

  return (
    <div className="space-y-6 mb-8">
      {/* Top row: core stats */}
      <div className={`grid gap-4 ${hideFinancials ? 'md:grid-cols-4' : 'md:grid-cols-6'}`}>
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
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications + waitingListCount}</p>
                {waitingListCount > 0 && (
                  <p className="text-xs text-gray-500">{stats.pendingApplications} apps + {waitingListCount} waiting</p>
                )}
              </div>
              <Clock className="h-10 w-10 text-yellow-600/20" />
            </div>
          </CardContent>
        </Card>
        {!hideFinancials && (
        <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Raised</p>
                <p className="text-3xl font-bold text-gold">{formatK(stats.totalRaised)}</p>
                <p className="text-xs text-gray-500">of {formatK(stats.fundraisingGoal)} goal</p>
              </div>
              <DollarSign className="h-10 w-10 text-gold/20" />
            </div>
          </CardContent>
        </Card>
        )}
        {!hideFinancials && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deployed</p>
                <p className="text-3xl font-bold text-purple-600">{formatK(stats.totalAdminCredits)}</p>
                <p className="text-xs text-gray-500">credits applied</p>
              </div>
              <CreditCard className="h-10 w-10 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>
        )}
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
      </div>

      {/* Financial progress bar — only when financials visible */}
      {!hideFinancials && stats.fundraisingGoal > 0 && (
        <Card className="border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-gold flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-navy">
                    We&apos;ve raised {formatK(stats.totalRaised)} of {formatK(stats.fundraisingGoal)}
                  </span>
                  <span className="text-sm text-gray-500">{raisedPercent}%</span>
                </div>
                <Progress value={raisedPercent} className="h-2.5" />
                <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500">
                  <span>{formatK(stats.totalAdminCredits)} deployed</span>
                  <span>{formatK(stats.totalOutstanding)} still needed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

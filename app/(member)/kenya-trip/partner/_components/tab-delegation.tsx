'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, Search, LayoutList, LayoutGrid, Shield } from 'lucide-react'
import type { PartnerData } from './use-partner-data'

const TRACK_COLORS: Record<string, string> = {
  Ministry: 'bg-purple-100 text-purple-800',
  Medical: 'bg-green-100 text-green-800',
  Healthcare: 'bg-green-100 text-green-800',
  Education: 'bg-blue-100 text-blue-800',
  Business: 'bg-yellow-100 text-yellow-800',
  Media: 'bg-pink-100 text-pink-800',
  Flex: 'bg-gray-100 text-gray-800',
}

interface TabDelegationProps {
  data: PartnerData
}

export function TabDelegation({ data }: TabDelegationProps) {
  const { delegates } = data
  const [search, setSearch] = useState('')
  const [filterTrack, setFilterTrack] = useState('all')
  const [groupByTrack, setGroupByTrack] = useState(false)

  // Get unique tracks
  const tracks = useMemo(() => {
    const trackSet = new Set(delegates.map(d => d.service_track).filter(Boolean) as string[])
    return Array.from(trackSet).sort()
  }, [delegates])

  // Filter delegates
  const filteredDelegates = useMemo(() => {
    return delegates.filter(d => {
      const matchesSearch = `${d.first_name} ${d.last_name}`.toLowerCase().includes(search.toLowerCase())
      const matchesTrack = filterTrack === 'all' || d.service_track === filterTrack
      return matchesSearch && matchesTrack
    })
  }, [delegates, search, filterTrack])

  // Group by track
  const groupedDelegates = useMemo(() => {
    if (!groupByTrack) return null
    const groups: Record<string, typeof filteredDelegates> = {}
    for (const d of filteredDelegates) {
      const track = d.service_track || 'Unassigned'
      if (!groups[track]) groups[track] = []
      groups[track].push(d)
    }
    return groups
  }, [filteredDelegates, groupByTrack])

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="border-[#006B3F]/20 bg-emerald-50/50">
        <CardContent className="p-4 flex items-center gap-3">
          <Users className="h-6 w-6 text-[#006B3F]" />
          <div>
            <p className="font-semibold text-navy">
              {delegates.length} delegate{delegates.length !== 1 ? 's' : ''} across {tracks.length} track{tracks.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-500">
              Approved participants joining the mission trip
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search delegates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterTrack}
          onChange={(e) => setFilterTrack(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Tracks</option>
          {tracks.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGroupByTrack(!groupByTrack)}
          className="whitespace-nowrap"
        >
          {groupByTrack ? <LayoutList className="h-4 w-4 mr-1" /> : <LayoutGrid className="h-4 w-4 mr-1" />}
          {groupByTrack ? 'List View' : 'Group by Track'}
        </Button>
      </div>

      {/* Delegate List */}
      {groupByTrack && groupedDelegates ? (
        <div className="space-y-4">
          {Object.entries(groupedDelegates).sort(([a], [b]) => a.localeCompare(b)).map(([track, trackDelegates]) => (
            <Card key={track}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className={TRACK_COLORS[track] || 'bg-gray-100 text-gray-800'}>
                    {track}
                  </Badge>
                  <span className="text-sm text-gray-500">{trackDelegates.length} delegate{trackDelegates.length !== 1 ? 's' : ''}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {trackDelegates.map((d) => (
                    <DelegateRow key={d.id} delegate={d} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
              <span>Name</span>
              <span className="hidden sm:block">Service Track</span>
              <span className="hidden md:block">Ministry Role</span>
              <span className="text-center">Lead</span>
            </div>
            <div className="divide-y">
              {filteredDelegates.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  {search || filterTrack !== 'all' ? 'No delegates match your filters.' : 'No delegates yet.'}
                </div>
              ) : (
                filteredDelegates.map((d) => (
                  <DelegateRow key={d.id} delegate={d} showGrid />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DelegateRow({ delegate: d, showGrid }: {
  delegate: {
    id: string
    first_name: string
    last_name: string
    service_track: string | null
    ministry_role: string | null
    team_leader: boolean
  }
  showGrid?: boolean
}) {
  if (showGrid) {
    return (
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold text-xs flex-shrink-0">
            {d.first_name[0]}{d.last_name[0]}
          </div>
          <span className="font-medium text-sm text-navy truncate">
            {d.first_name} {d.last_name}
          </span>
        </div>
        <span className="hidden sm:block">
          {d.service_track && (
            <Badge className={`${TRACK_COLORS[d.service_track] || 'bg-gray-100 text-gray-800'} text-xs`}>
              {d.service_track}
            </Badge>
          )}
        </span>
        <span className="hidden md:block text-sm text-gray-600 truncate max-w-[150px]">
          {d.ministry_role || '-'}
        </span>
        <span className="text-center">
          {d.team_leader && (
            <Shield className="h-4 w-4 text-purple-600 mx-auto" />
          )}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-1">
      <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold text-xs flex-shrink-0">
        {d.first_name[0]}{d.last_name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-navy truncate">
          {d.first_name} {d.last_name}
        </p>
        <p className="text-xs text-gray-500">
          {d.ministry_role || d.service_track || 'No role assigned'}
        </p>
      </div>
      {d.team_leader && (
        <Badge className="bg-purple-100 text-purple-800 text-xs">Lead</Badge>
      )}
    </div>
  )
}

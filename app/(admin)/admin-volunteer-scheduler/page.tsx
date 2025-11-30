'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  UserPlus,
  Loader2,
  ChevronRight,
  Building,
  AlertCircle,
  Zap
} from 'lucide-react'

interface Team {
  id: string
  name: string
  description: string
  memberCount: number
  requiredCount: number
  scheduledThisMonth: number
  availableMembers: number
}

interface ScheduleSuggestion {
  event: {
    id: string
    title: string
    date: string
    location: string
    positionsNeeded: number
  }
  dayOfWeek: string
  availableVolunteers: Array<{
    memberId: string
    memberName: string
    teamId: string
    teamName: string
    role: string
  }>
  currentlyScheduled: number
  gapToFill: number
}

export default function AdminVolunteerSchedulerPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<ScheduleSuggestion[]>([])
  const [totalVolunteers, setTotalVolunteers] = useState(0)
  const [totalScheduled, setTotalScheduled] = useState(0)
  const [loading, setLoading] = useState(true)
  const [autoScheduling, setAutoScheduling] = useState<string | null>(null)
  const [scheduling, setScheduling] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'events' | 'teams'>('events')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/volunteer-scheduler')
      if (res.ok) {
        const data = await res.json()
        setTeams(data.teams || [])
        setUpcomingEvents(data.upcomingEvents || [])
        setTotalVolunteers(data.totalVolunteers || 0)
        setTotalScheduled(data.totalScheduledThisMonth || 0)
      }
    } catch (error) {
      console.error('Error fetching volunteer data:', error)
    }
    setLoading(false)
  }

  const handleAutoSchedule = async (eventId: string) => {
    setAutoScheduling(eventId)
    try {
      const res = await fetch('/api/admin/volunteer-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_schedule', eventId })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Successfully scheduled ${data.scheduledCount} volunteers!`)
        fetchData()
      }
    } catch (error) {
      console.error('Error auto-scheduling:', error)
    }
    setAutoScheduling(null)
  }

  const handleScheduleVolunteer = async (eventId: string, memberId: string, teamId?: string) => {
    setScheduling(memberId)
    try {
      const res = await fetch('/api/admin/volunteer-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule_volunteer',
          eventId,
          memberId,
          teamId
        })
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error scheduling volunteer:', error)
    }
    setScheduling(null)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-gray-500">Loading volunteer data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-gold" />
              AI Volunteer Scheduler
            </h1>
            <p className="text-gray-600">Intelligently schedule volunteers based on availability</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Volunteers</p>
                  <p className="text-3xl font-bold text-navy">{totalVolunteers}</p>
                </div>
                <Users className="h-10 w-10 text-navy/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Teams</p>
                  <p className="text-3xl font-bold text-green-600">{teams.length}</p>
                </div>
                <Building className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Events</p>
                  <p className="text-3xl font-bold text-gold">{upcomingEvents.length}</p>
                </div>
                <Calendar className="h-10 w-10 text-gold/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled This Month</p>
                  <p className="text-3xl font-bold text-purple-600">{totalScheduled}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-purple-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(['events', 'teams'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'events' ? 'Upcoming Events' : 'Volunteer Teams'}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming events need volunteers</p>
                </CardContent>
              </Card>
            ) : (
              upcomingEvents.map(suggestion => (
                <Card key={suggestion.event.id} className={suggestion.gapToFill > 0 ? 'border-amber-200' : 'border-green-200'}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="text-center bg-navy/10 rounded-lg p-3">
                          <p className="text-2xl font-bold text-navy">
                            {new Date(suggestion.event.date).getDate()}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(suggestion.event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{suggestion.dayOfWeek}</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-navy">{suggestion.event.title}</h3>
                          <p className="text-gray-600">{suggestion.event.location}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant={suggestion.gapToFill > 0 ? 'destructive' : 'default'} className={suggestion.gapToFill === 0 ? 'bg-green-500' : ''}>
                              {suggestion.currentlyScheduled}/{suggestion.event.positionsNeeded} Filled
                            </Badge>
                            {suggestion.gapToFill > 0 && (
                              <span className="text-sm text-amber-600 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {suggestion.gapToFill} more needed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAutoSchedule(suggestion.event.id)}
                        disabled={autoScheduling === suggestion.event.id || suggestion.gapToFill === 0}
                        className="bg-navy hover:bg-navy/90"
                      >
                        {autoScheduling === suggestion.event.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Auto-Schedule
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <Progress
                        value={(suggestion.currentlyScheduled / suggestion.event.positionsNeeded) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* Available Volunteers */}
                    {suggestion.availableVolunteers.length > 0 && suggestion.gapToFill > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Available Volunteers ({suggestion.availableVolunteers.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.availableVolunteers.slice(0, 10).map(volunteer => (
                            <div
                              key={volunteer.memberId}
                              className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 pr-3"
                            >
                              <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center text-xs font-medium text-navy">
                                {volunteer.memberName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{volunteer.memberName}</p>
                                <p className="text-xs text-gray-500">{volunteer.teamName}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-2 h-7 w-7 p-0"
                                onClick={() => handleScheduleVolunteer(suggestion.event.id, volunteer.memberId, volunteer.teamId)}
                                disabled={scheduling === volunteer.memberId}
                              >
                                {scheduling === volunteer.memberId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserPlus className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                            </div>
                          ))}
                          {suggestion.availableVolunteers.length > 10 && (
                            <div className="flex items-center text-sm text-gray-500">
                              +{suggestion.availableVolunteers.length - 10} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {suggestion.gapToFill === 0 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Fully staffed!</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No volunteer teams created yet</p>
                </CardContent>
              </Card>
            ) : (
              teams.map(team => (
                <Card key={team.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-navy" />
                      </div>
                      <Badge variant="outline">
                        {team.memberCount}/{team.requiredCount} members
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-navy mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Team Capacity</span>
                        <span className="font-medium">{Math.round((team.memberCount / team.requiredCount) * 100)}%</span>
                      </div>
                      <Progress value={(team.memberCount / team.requiredCount) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{team.availableMembers} available now</span>
                        <span>{team.scheduledThisMonth} scheduled this month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar, Clock, MapPin, ChevronDown, ChevronRight, Plus, X, Send
} from 'lucide-react'
import type { PartnerData } from './use-partner-data'

interface TabScheduleProps {
  data: PartnerData
}

export function TabSchedule({ data }: TabScheduleProps) {
  const { itinerary, conferenceSessions, partner, submitProposal } = data
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [cityFilter, setCityFilter] = useState('')
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Group itinerary by date
  const itineraryByDate = useMemo(() => {
    const groups: Record<string, typeof itinerary> = {}
    for (const item of itinerary) {
      if (cityFilter && item.location && !item.location.toLowerCase().includes(cityFilter.toLowerCase())) {
        continue
      }
      if (!groups[item.date]) groups[item.date] = []
      groups[item.date].push(item)
    }
    return groups
  }, [itinerary, cityFilter])

  // Group conference sessions by date
  const sessionsByDate = useMemo(() => {
    const groups: Record<string, typeof conferenceSessions> = {}
    for (const session of conferenceSessions) {
      if (!groups[session.conference_date]) groups[session.conference_date] = []
      groups[session.conference_date].push(session)
    }
    return groups
  }, [conferenceSessions])

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  const handleSubmitProposal = async () => {
    if (!proposalTitle.trim() || !proposalDescription.trim()) return
    setSubmitting(true)
    const success = await submitProposal('schedule_change', proposalTitle.trim(), proposalDescription.trim())
    if (success) {
      setProposalTitle('')
      setProposalDescription('')
      setShowProposalForm(false)
    }
    setSubmitting(false)
  }

  const allDates = useMemo(() => {
    const dates = new Set([
      ...Object.keys(itineraryByDate),
      ...Object.keys(sessionsByDate),
    ])
    return Array.from(dates).sort()
  }, [itineraryByDate, sessionsByDate])

  return (
    <div className="space-y-4">
      {/* Header with filter and propose button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          {partner?.city && (
            <Button
              variant={cityFilter === partner.city ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCityFilter(cityFilter === partner.city ? '' : (partner.city || ''))}
            >
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {cityFilter === partner.city ? `Showing: ${partner.city}` : `Filter: ${partner.city}`}
            </Button>
          )}
          {cityFilter && (
            <Button variant="ghost" size="sm" onClick={() => setCityFilter('')}>
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => setShowProposalForm(!showProposalForm)}
          className="bg-[#006B3F] hover:bg-[#005533]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Propose Schedule Change
        </Button>
      </div>

      {/* Proposal Form */}
      {showProposalForm && (
        <Card className="border-[#006B3F]/30 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-navy">Propose a Schedule Change</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Proposal title (e.g., 'Move Kakamega visit to April 28')"
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
            />
            <Textarea
              placeholder="Describe the proposed change and why..."
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowProposalForm(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitProposal}
                disabled={submitting || !proposalTitle.trim() || !proposalDescription.trim()}
                className="bg-[#006B3F] hover:bg-[#005533]"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1" /> Submit Proposal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day-by-Day Itinerary */}
      {allDates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No schedule items yet.</p>
          </CardContent>
        </Card>
      ) : (
        allDates.map(date => {
          const dayItems = itineraryByDate[date] || []
          const daySessions = sessionsByDate[date] || []
          const isExpanded = expandedDays.has(date) || allDates.length <= 5
          const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })

          return (
            <Card key={date}>
              <button
                onClick={() => toggleDay(date)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#006B3F]" />
                  <div>
                    <p className="font-semibold text-navy">{dayLabel}</p>
                    <p className="text-xs text-gray-500">
                      {dayItems.length} activit{dayItems.length !== 1 ? 'ies' : 'y'}
                      {daySessions.length > 0 && ` + ${daySessions.length} session${daySessions.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <CardContent className="pt-0 pb-4 space-y-2">
                  {dayItems.map(item => (
                    <div key={item.id} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="w-16 flex-shrink-0 text-right">
                        <span className="text-sm font-mono text-gray-500">
                          {item.start_time?.slice(0, 5) || '--:--'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-navy">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        )}
                        {item.location && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {item.location}
                          </p>
                        )}
                      </div>
                      {item.category && (
                        <Badge variant="outline" className="text-xs h-fit">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  ))}

                  {daySessions.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Conference Sessions</p>
                      {daySessions.map(session => (
                        <div key={session.id} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                          <div className="w-16 flex-shrink-0 text-right">
                            <span className="text-sm font-mono text-gray-500">
                              {session.start_time?.slice(0, 5) || '--:--'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-navy">{session.title}</p>
                            {session.speaker && (
                              <p className="text-xs text-gray-500">Speaker: {session.speaker}</p>
                            )}
                            {session.track && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {session.track}
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs h-fit">
                            {session.session_type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}

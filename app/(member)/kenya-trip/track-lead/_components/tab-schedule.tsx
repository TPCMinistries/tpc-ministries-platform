'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import type { ConferenceSession, LogisticsMatrix } from '../../_components/types'

interface TabScheduleProps {
  logisticsMatrix: LogisticsMatrix[]
  conferenceSessions: ConferenceSession[]
  track: string
}

export function TabSchedule({ logisticsMatrix, conferenceSessions, track }: TabScheduleProps) {
  // Group logistics by date
  const logisticsByDate = logisticsMatrix.reduce((acc, item) => {
    const date = item.day_date
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {} as Record<string, LogisticsMatrix[]>)

  const sortedDates = Object.keys(logisticsByDate).sort()

  // Group sessions by date
  const sessionsByDate = conferenceSessions.reduce((acc, session) => {
    const date = session.conference_date
    if (!acc[date]) acc[date] = []
    acc[date].push(session)
    return acc
  }, {} as Record<string, ConferenceSession[]>)

  const sessionDates = Object.keys(sessionsByDate).sort()

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${m} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Logistics Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-navy flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Day-by-Day Logistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDates.length === 0 ? (
            <p className="text-sm text-gray-500">No logistics scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {sortedDates.map((date) => (
                <div key={date} className="border rounded-lg overflow-hidden">
                  <div className="bg-navy/5 px-4 py-2 border-b">
                    <h3 className="font-semibold text-navy text-sm">{formatDate(date)}</h3>
                  </div>
                  <div className="divide-y">
                    {logisticsByDate[date].map((item) => (
                      <div key={item.id} className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {item.track === 'all' ? 'All Tracks' : item.track}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">{item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conference Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-navy flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Conference Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionDates.length === 0 ? (
            <p className="text-sm text-gray-500">No conference sessions scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {sessionDates.map((date) => (
                <div key={date}>
                  <h3 className="font-semibold text-navy text-sm mb-2">{formatDate(date)}</h3>
                  <div className="space-y-2">
                    {sessionsByDate[date]
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map((session) => (
                        <div key={session.id} className="p-3 bg-gray-50 rounded-lg border">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm text-navy">{session.title}</p>
                                {session.track && (
                                  <Badge variant="outline" className="text-xs">
                                    {session.track === track ? 'Your Track' : session.track}
                                  </Badge>
                                )}
                                {!session.track && (
                                  <Badge variant="outline" className="text-xs bg-blue-50">
                                    All Tracks
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                </span>
                                {session.speaker && (
                                  <span>Speaker: {session.speaker}</span>
                                )}
                                <span className="capitalize">{session.session_type}</span>
                              </div>
                            </div>
                            {session.materials_url && (
                              <a
                                href={session.materials_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                              >
                                Materials
                              </a>
                            )}
                          </div>
                          {session.notes && (
                            <p className="text-xs text-gray-500 mt-2">{session.notes}</p>
                          )}
                        </div>
                      ))}
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

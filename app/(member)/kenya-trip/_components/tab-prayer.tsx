'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart } from 'lucide-react'
import { DailyDevotional } from './daily-devotional'
import type { DelegateData } from './use-delegate-data'

interface TabPrayerProps {
  data: DelegateData
}

export function TabPrayer({ data }: TabPrayerProps) {
  const { trip, dailyFocus } = data

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="grid gap-6">
      {/* Daily Devotional */}
      {trip && <DailyDevotional tripId={trip.id} />}

      {/* Prayer Focus Cards */}
      {dailyFocus.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Prayer focus content coming soon</p>
          </CardContent>
        </Card>
      ) : (
        dailyFocus.slice(0, 14).map(df => {
          const isToday = df.focus_date === today
          const isPast = df.focus_date < today
          const isFuture = df.focus_date > today

          return (
            <Card
              key={df.id}
              className={`${isToday ? 'border-gold ring-2 ring-gold/20' : ''} ${isPast ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`${
                    df.phase === 'pre_trip' ? 'bg-blue-100 text-blue-800' :
                    df.phase === 'during_trip' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {df.phase.replace('_', '-')}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(df.focus_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                  {isToday && (
                    <Badge className="bg-gold text-white">Today</Badge>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-navy mb-3">{df.theme}</h3>

                {/* Scripture */}
                {df.scripture_reference && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gold mb-3">
                    <p className="font-medium text-gold-dark">{df.scripture_reference}</p>
                    {df.scripture_text && (
                      <p className="text-gray-700 italic mt-1">&ldquo;{df.scripture_text}&rdquo;</p>
                    )}
                  </div>
                )}

                {/* Prayer Focus */}
                {df.prayer_focus && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Prayer Focus</p>
                    <p className="text-gray-600">{df.prayer_focus}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

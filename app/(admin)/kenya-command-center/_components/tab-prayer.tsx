'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Heart, Plus, Clock, Sun, Moon, Star
} from 'lucide-react'
import type { Participant, DailyFocus } from './types'

interface TabPrayerProps {
  participants: Participant[]
  dailyFocus: DailyFocus[]
  setShowDailyFocusModal: (show: boolean) => void
}

export function TabPrayer({
  participants, dailyFocus, setShowDailyFocusModal,
}: TabPrayerProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daily Prayer Focus</CardTitle>
          <Button size="sm" onClick={() => setShowDailyFocusModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Day
          </Button>
        </CardHeader>
        <CardContent>
          {dailyFocus.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No prayer focus days added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyFocus.map(df => (
                <div key={df.id} className="border rounded-lg overflow-hidden">
                  <div className={`px-4 py-2 font-medium flex items-center gap-2 ${
                    df.phase === 'pre_trip' ? 'bg-blue-50 text-blue-800' :
                    df.phase === 'during_trip' ? 'bg-green-50 text-green-800' :
                    'bg-purple-50 text-purple-800'
                  }`}>
                    {df.phase === 'pre_trip' ? <Clock className="h-4 w-4" /> :
                     df.phase === 'during_trip' ? <Sun className="h-4 w-4" /> :
                     <Moon className="h-4 w-4" />}
                    {new Date(df.focus_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-semibold text-navy text-lg">{df.theme}</h4>
                    </div>
                    {df.scripture_reference && (
                      <div className="bg-gold/10 p-3 rounded-lg border-l-4 border-gold">
                        <p className="font-medium text-gold-dark">{df.scripture_reference}</p>
                        {df.scripture_text && (
                          <p className="text-sm text-gray-700 mt-1 italic">&quot;{df.scripture_text}&quot;</p>
                        )}
                      </div>
                    )}
                    {df.prayer_focus && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Prayer Focus:</p>
                        <p className="text-gray-700">{df.prayer_focus}</p>
                      </div>
                    )}
                    {df.leadership_notes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-1">Leadership Notes:</p>
                        <p className="text-sm text-gray-600">{df.leadership_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Prayer Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm">Pre-Trip Days</span>
                <span className="font-bold text-blue-800">
                  {dailyFocus.filter(d => d.phase === 'pre_trip').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm">During Trip Days</span>
                <span className="font-bold text-green-800">
                  {dailyFocus.filter(d => d.phase === 'during_trip').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm">Post-Trip Days</span>
                <span className="font-bold text-purple-800">
                  {dailyFocus.filter(d => d.phase === 'post_trip').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            {participants.filter(p => p.team_leader).length === 0 ? (
              <p className="text-gray-500 text-sm">No team leaders assigned</p>
            ) : (
              <div className="space-y-3">
                {participants.filter(p => p.team_leader).map(leader => (
                  <div key={leader.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium">{leader.first_name} {leader.last_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{leader.service_track}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

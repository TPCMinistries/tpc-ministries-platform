'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Shield } from 'lucide-react'

export function DailyCheckin({ tripId, participantId }: { tripId: string; participantId: string }) {
  const [checkedIn, setCheckedIn] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('kenya_trip_checkins')
        .select('id')
        .eq('participant_id', participantId)
        .eq('checkin_date', today)
        .limit(1)
        .maybeSingle()
      if (data) setCheckedIn(true)
    }
    check()
  }, [participantId])

  const handleCheckin = async () => {
    if (checkedIn || loading) return
    setLoading(true)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('kenya_trip_checkins').upsert({
      trip_id: tripId,
      participant_id: participantId,
      checkin_date: today,
      checkin_type: 'daily',
      status: 'checked_in',
      mood: 'good',
    }, { onConflict: 'participant_id,checkin_date' })
    if (!error) setCheckedIn(true)
    setLoading(false)
  }

  return (
    <Card className={`border ${checkedIn ? 'border-green-200 bg-green-50/50' : 'border-navy/20 bg-navy/5'}`}>
      <CardContent className="p-4 flex items-center gap-4">
        {checkedIn ? (
          <>
            <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">You&apos;re checked in for today!</p>
              <p className="text-xs text-green-600">Your team leader can see you&apos;re safe.</p>
            </div>
          </>
        ) : (
          <>
            <Shield className="h-8 w-8 text-navy shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy">Daily Safety Check-In</p>
              <p className="text-xs text-gray-500">Let the team know you&apos;re safe today.</p>
            </div>
            <button
              onClick={handleCheckin}
              disabled={loading}
              className="px-5 py-2.5 bg-navy text-white font-semibold rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {loading ? 'Checking in...' : "I'm Safe \u2713"}
            </button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

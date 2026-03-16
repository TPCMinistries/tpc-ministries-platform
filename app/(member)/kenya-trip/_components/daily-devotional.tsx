'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, ExternalLink } from 'lucide-react'

interface DailyFocusData {
  id: string
  focus_date: string
  theme: string
  scripture_reference: string
  scripture_text: string
  prayer_focus: string
}

export function DailyDevotional({ tripId }: { tripId: string }) {
  const [focus, setFocus] = useState<DailyFocusData | null>(null)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('kenya_trip_daily_focus')
        .select('id, focus_date, theme, scripture_reference, scripture_text, prayer_focus')
        .eq('trip_id', tripId)
        .eq('focus_date', today)
        .limit(1)
        .maybeSingle()
      setFocus(data)
    }
    fetch()
  }, [tripId])

  if (!focus) return null

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Today&apos;s Devotional</p>
            <h3 className="text-lg font-bold text-navy mb-1">{focus.theme}</h3>
            <p className="text-sm text-amber-800 italic mb-2">
              &ldquo;{focus.scripture_text}&rdquo;
            </p>
            <p className="text-xs text-gray-500 mb-3">&mdash; {focus.scripture_reference}</p>
            {focus.prayer_focus && (
              <div className="p-3 bg-amber-50 rounded-lg mb-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Prayer Focus</p>
                <p className="text-sm text-amber-900">{focus.prayer_focus}</p>
              </div>
            )}
            <a
              href="https://www.streamsofgrace.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-900 font-medium"
            >
              More devotionals on Streams of Grace
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

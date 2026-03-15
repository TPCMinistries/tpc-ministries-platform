'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import type { Trip } from './types'

interface CountdownTimerProps {
  trip: Trip
}

export function CountdownTimer({ trip }: CountdownTimerProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const startDate = new Date(trip.start_date)
  const endDate = new Date(trip.end_date)

  // After trip
  if (now > endDate) {
    return (
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-3">
            <Clock className="h-5 w-5" />
            <span className="text-lg font-bold">Trip Complete - Glory to God!</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // During trip
  if (now >= startDate && now <= endDate) {
    const dayNumber = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return (
      <Card className="bg-gradient-to-r from-gold to-gold-light text-navy mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-3">
            <Clock className="h-5 w-5" />
            <span className="text-lg font-bold">Day {dayNumber} of {totalDays} - Kenya Kingdom Impact Trip</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Before trip - countdown
  const diff = startDate.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return (
    <Card className="bg-gradient-to-r from-navy to-navy-800 text-white mb-6">
      <CardContent className="py-4">
        <div className="flex items-center justify-center gap-6">
          <Clock className="h-5 w-5 text-gold" />
          <span className="text-sm text-white/70">Trip Countdown:</span>
          <div className="flex gap-4">
            {[
              { value: days, label: 'Days' },
              { value: hours, label: 'Hrs' },
              { value: minutes, label: 'Min' },
              { value: seconds, label: 'Sec' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold font-mono">{String(value).padStart(2, '0')}</p>
                <p className="text-xs text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

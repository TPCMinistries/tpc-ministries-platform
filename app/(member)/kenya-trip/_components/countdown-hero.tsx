'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock } from 'lucide-react'
import type { Trip, Participant } from './types'

interface CountdownHeroProps {
  trip: Trip
  participant: Participant | null
}

export function CountdownHero({ trip, participant }: CountdownHeroProps) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000) // update every minute
    return () => clearInterval(interval)
  }, [])

  const tripStart = new Date(trip.start_date).getTime()
  const diff = tripStart - now
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)))
  const tripDuration = Math.ceil(
    (new Date(trip.end_date).getTime() - tripStart) / (1000 * 60 * 60 * 24)
  )

  const statusBadge = participant
    ? participant.application_status === 'approved'
      ? { label: 'Approved', color: 'bg-green-500 text-white' }
      : participant.application_status === 'pending'
        ? { label: 'Pending Review', color: 'bg-yellow-500 text-white' }
        : participant.application_status === 'waitlisted'
          ? { label: 'Waitlisted', color: 'bg-blue-500 text-white' }
          : { label: participant.application_status, color: 'bg-gray-500 text-white' }
    : null

  return (
    <div className="bg-gradient-to-br from-navy to-navy-800 rounded-2xl p-6 md:p-8 text-white mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-gold text-navy">Mission Trip 2026</Badge>
            {statusBadge && (
              <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{trip.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
              {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Kenya, East Africa
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {tripDuration} days
            </span>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-gold">{days}</p>
            <p className="text-xs text-white/60 uppercase tracking-wider">days</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-gold/80">{hours}</p>
            <p className="text-xs text-white/60 uppercase tracking-wider">hours</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-gold/60">{minutes}</p>
            <p className="text-xs text-white/60 uppercase tracking-wider">min</p>
          </div>
        </div>
      </div>
    </div>
  )
}

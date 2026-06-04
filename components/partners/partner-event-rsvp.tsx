'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, Video, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type AttendanceType = 'in-person' | 'virtual'

interface PartnerEventRsvpProps {
  eventId: string
  initialRegistered: boolean
  initialAttendanceType?: AttendanceType | null
  eventType?: string | null
  virtualLink?: string | null
}

export function PartnerEventRsvp({
  eventId,
  initialRegistered,
  initialAttendanceType,
  eventType,
  virtualLink,
}: PartnerEventRsvpProps) {
  const [registered, setRegistered] = useState(initialRegistered)
  const [attendanceType, setAttendanceType] = useState<AttendanceType>(
    initialAttendanceType || (eventType === 'online' ? 'virtual' : 'in-person')
  )
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isHybrid = eventType === 'hybrid'

  const toggleRegistration = () => {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch(`/api/partner/events/${eventId}/registration`, {
        method: registered ? 'DELETE' : 'POST',
        headers: registered ? undefined : { 'Content-Type': 'application/json' },
        body: registered ? undefined : JSON.stringify({ attendanceType }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setMessage(payload.error || 'Unable to update RSVP')
        return
      }

      setRegistered(!registered)
      setMessage(registered ? 'RSVP cancelled.' : 'You are registered for this gathering.')
    })
  }

  return (
    <div className="space-y-3">
      {isHybrid && !registered && (
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Choose attendance type">
          <Button
            type="button"
            variant={attendanceType === 'in-person' ? 'gold' : 'outline'}
            size="sm"
            onClick={() => setAttendanceType('in-person')}
            disabled={isPending}
            className="w-full"
          >
            In Person
          </Button>
          <Button
            type="button"
            variant={attendanceType === 'virtual' ? 'gold' : 'outline'}
            size="sm"
            onClick={() => setAttendanceType('virtual')}
            disabled={isPending}
            className="w-full"
          >
            Online
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={toggleRegistration}
          disabled={isPending}
          variant={registered ? 'outline' : 'gold'}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : registered ? (
            <XCircle className="mr-2 h-4 w-4" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          {registered ? 'Cancel RSVP' : 'RSVP for Gathering'}
        </Button>

        {registered && virtualLink && (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={virtualLink} target="_blank">
              <Video className="mr-2 h-4 w-4" />
              Join Online
            </Link>
          </Button>
        )}
      </div>

      <div aria-live="polite" className="min-h-6">
        {registered && !message && (
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 capitalize">
            Registered {attendanceType === 'virtual' ? 'Online' : 'In Person'}
          </Badge>
        )}
        {message && (
          <p className={`text-sm ${message.includes('Unable') ? 'text-red-600' : 'text-emerald-700'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

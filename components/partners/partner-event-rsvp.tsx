'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, Video, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PartnerEventRsvpProps {
  eventId: string
  initialRegistered: boolean
  virtualLink?: string | null
}

export function PartnerEventRsvp({ eventId, initialRegistered, virtualLink }: PartnerEventRsvpProps) {
  const [registered, setRegistered] = useState(initialRegistered)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const toggleRegistration = () => {
    setMessage(null)
    startTransition(async () => {
      const response = await fetch(`/api/partner/events/${eventId}/registration`, {
        method: registered ? 'DELETE' : 'POST',
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
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            Registered
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

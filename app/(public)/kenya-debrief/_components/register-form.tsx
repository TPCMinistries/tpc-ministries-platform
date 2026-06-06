'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarPlus, CheckCircle2, Loader2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KENYA_DEBRIEF, googleCalendarUrl } from '@/lib/kenya-debrief'

const TIME_OPTIONS = [
  { value: '9am_pt', label: '9:00 AM Pacific' },
  { value: '12pm_et', label: '12:00 PM Eastern' },
  { value: '7pm_eat', label: '7:00 PM East Africa' },
]

export function DebriefRegisterForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [preferredTime, setPreferredTime] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch('/api/kenya/debrief-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.get('fullName'),
          email: data.get('email'),
          phone: data.get('phone'),
          preferredTime,
          howHeard: data.get('howHeard'),
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(json.error || 'Something went wrong. Please try again.')
        return
      }

      setStatus('success')
      setMessage(json.message || "You're registered.")
      form.reset()
      setPreferredTime('')
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-gold/40 bg-gold/10 p-8 text-center backdrop-blur-sm"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
        <h3 className="mt-4 font-serif text-2xl font-bold text-white">You&apos;re in.</h3>
        <p className="mt-2 text-white/80">{message}</p>
        <p className="mt-3 text-sm text-white/60">
          We just emailed your confirmation and Zoom link. Save the date below &mdash; can&apos;t
          make it live? Stay registered and we&apos;ll send the recording.
        </p>

        <a href={KENYA_DEBRIEF.zoomUrl} target="_blank" rel="noopener noreferrer">
          <Button
            size="lg"
            className="mt-5 h-12 w-full bg-gold font-bold text-navy-950 hover:bg-gold-300"
          >
            <Video className="mr-2 h-4 w-4" />
            Join on Zoom
          </Button>
        </a>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <a
            href={googleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-gold/40 hover:text-white"
          >
            <CalendarPlus className="h-4 w-4 text-gold" />
            Google Calendar
          </a>
          <a
            href={KENYA_DEBRIEF.icsUrl}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-gold/40 hover:text-white"
          >
            <CalendarPlus className="h-4 w-4 text-gold" />
            Apple / Outlook
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-white/80">
            Full name <span className="text-gold">*</span>
          </label>
          <Input
            id="fullName"
            name="fullName"
            required
            placeholder="Your name"
            className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-gold"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/80">
            Email <span className="text-gold">*</span>
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-gold"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-white/80">
            Phone <span className="text-white/40">(optional)</span>
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="For a text reminder"
            className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-gold"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-white/80">
            Which time works best? <span className="text-white/40">(optional)</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            {TIME_OPTIONS.map((opt) => {
              const active = preferredTime === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPreferredTime(active ? '' : opt.value)}
                  className={`rounded-lg border px-2 py-2.5 text-center text-xs font-medium transition-all ${
                    active
                      ? 'border-gold bg-gold/20 text-gold'
                      : 'border-white/15 bg-white/5 text-white/70 hover:border-gold/40 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="howHeard" className="mb-1.5 block text-sm font-medium text-white/80">
            How did you hear about this? <span className="text-white/40">(optional)</span>
          </label>
          <Input
            id="howHeard"
            name="howHeard"
            placeholder="A friend, social media, our newsletter…"
            className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-gold"
          />
        </div>
      </div>

      {status === 'error' && (
        <p className="mt-4 text-sm text-red-300">{message}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === 'loading'}
        className="mt-6 h-12 w-full bg-gold font-bold text-navy-950 hover:bg-gold-300 disabled:opacity-70"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Reserving your spot…
          </>
        ) : (
          <>
            Register Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <p className="mt-3 text-center text-xs text-white/50">
        Free to attend. Register and we&apos;ll send the recording.
      </p>
    </form>
  )
}

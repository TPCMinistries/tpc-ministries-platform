'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarPlus, CheckCircle2, Loader2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KENYA_DEBRIEF, googleCalendarUrl } from '@/lib/kenya-debrief'

const TIME_ZONES = [
  'Pacific Time',
  'Mountain Time',
  'Central Time',
  'Eastern Time',
  'East Africa Time',
  'Other / outside the US',
]

export function DebriefRegisterForm() {
  const [step, setStep] = useState<'register' | 'details' | 'done'>('register')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [timeZone, setTimeZone] = useState('')

  // Step 1 — name + email. Creates the registration and sends the confirmation.
  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const data = new FormData(e.currentTarget)
    const enteredEmail = String(data.get('email') || '')

    try {
      const res = await fetch('/api/kenya/debrief-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.get('fullName'),
          email: enteredEmail,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(json.error || 'Something went wrong. Please try again.')
        return
      }

      setEmail(enteredEmail.trim().toLowerCase())
      setStatus('idle')
      setStep('details')
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  // Step 2 — optional phone / how-heard / time zone. Appends to the record.
  async function handleDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const data = new FormData(e.currentTarget)

    try {
      await fetch('/api/kenya/debrief-register', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone: data.get('phone'),
          howHeard: data.get('howHeard'),
          timeZone,
        }),
      })
    } catch {
      // Non-blocking — they're already registered; details are a bonus.
    }
    setStatus('idle')
    setStep('done')
  }

  // ---- Done: confirmation + Zoom + calendar ----
  if (step === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-gold/40 bg-gold/10 p-8 text-center backdrop-blur-sm"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
        <h3 className="mt-4 font-serif text-2xl font-bold text-white">You&apos;re in.</h3>
        <p className="mt-2 text-white/80">
          We just emailed your confirmation and Zoom link.
        </p>
        <p className="mt-3 text-sm text-white/60">
          Save the date below &mdash; can&apos;t make it live? Stay registered and we&apos;ll send
          the recording.
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

  // ---- Step 2: optional details ----
  if (step === 'details') {
    return (
      <motion.form
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleDetails}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Step 2 of 2</p>
        <h3 className="mt-2 font-serif text-xl font-bold text-white">You&apos;re registered.</h3>
        <p className="mt-1 text-sm text-white/60">
          A couple of optional details so we can serve you better. Check your inbox for the Zoom link.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-white/80">
              Phone <span className="text-white/40">(for a text reminder)</span>
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(555) 555-5555"
              className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-gold"
            />
          </div>

          <div>
            <label htmlFor="timeZone" className="mb-1.5 block text-sm font-medium text-white/80">
              Your time zone <span className="text-white/40">(optional)</span>
            </label>
            <select
              id="timeZone"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <option value="" className="bg-navy-950">
                Select your time zone…
              </option>
              {TIME_ZONES.map((tz) => (
                <option key={tz} value={tz} className="bg-navy-950">
                  {tz}
                </option>
              ))}
            </select>
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

        <Button
          type="submit"
          size="lg"
          disabled={status === 'loading'}
          className="mt-6 h-12 w-full bg-gold font-bold text-navy-950 hover:bg-gold-300 disabled:opacity-70"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              Finish
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={() => setStep('done')}
          className="mt-3 w-full text-center text-xs text-white/50 underline-offset-4 transition hover:text-white/80 hover:underline"
        >
          Skip — I&apos;m all set
        </button>
      </motion.form>
    )
  }

  // ---- Step 1: name + email ----
  return (
    <form
      onSubmit={handleRegister}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
    >
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-gold">Step 1 of 2</p>
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
      </div>

      {status === 'error' && <p className="mt-4 text-sm text-red-300">{message}</p>}

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
        Free to attend. We&apos;ll email your Zoom link right away.
      </p>
    </form>
  )
}

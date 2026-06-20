'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollReveal } from '@/components/motion/scroll-reveal'
import {
  ArrowRight,
  CheckCircle,
  HeartHandshake,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'

// The three intents, in the order TPC wants people to consider them.
const interestOptions = [
  {
    id: 'newcomer',
    label: "I'm new — add me to the list",
    description: 'Get updates, devotionals, and ways to connect online.',
  },
  {
    id: 'serve',
    label: 'I want to serve / volunteer',
    description: "Let us know you'd like to help when teams open up.",
  },
  {
    id: 'missions',
    label: 'Future mission trips',
    description: 'Signal interest in upcoming trips like Kenya.',
  },
  {
    id: 'october-gathering',
    label: 'The October gathering',
    description: "Save your spot for what we're doing in October.",
  },
]

export default function GetInvolvedPage() {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [selected, setSelected] = useState<string[]>(['newcomer'])

  const toggleInterest = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/public/get-involved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, interests: selected }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-navy-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-32 pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <span className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-sm font-medium text-gold">
              Get Involved
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Find your place at TPC
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
              However you want to take a step — connecting, becoming a member, or
              partnering with the ministry — start here and tell us what you&apos;re
              looking for.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Three paths */}
      <section className="px-6 pb-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {/* 1. Participate */}
          <ScrollReveal>
            <div className="flex h-full flex-col rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent p-7">
              <UserPlus className="mb-4 h-9 w-9 text-gold" />
              <h2 className="text-xl font-semibold">Participate</h2>
              <p className="mt-2 flex-1 text-sm text-white/70">
                New here, want to serve, or interested in missions and the October
                gathering? Tell us what you&apos;re into and we&apos;ll keep you in the loop.
              </p>
              <Button
                variant="gold"
                className="mt-5 w-full"
                onClick={() => {
                  setShowForm(true)
                  // smooth-scroll to the form below
                  requestAnimationFrame(() =>
                    document
                      .getElementById('participate-form')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  )
                }}
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </ScrollReveal>

          {/* 2. Become a Member */}
          <ScrollReveal delay={0.05}>
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <Users className="mb-4 h-9 w-9 text-gold" />
              <h2 className="text-xl font-semibold">Become a Member</h2>
              <p className="mt-2 flex-1 text-sm text-white/70">
                Create a free account for the full member experience — devotionals,
                teachings, prayer, journaling, assessments, and your dashboard.
              </p>
              <Link href="/auth/signup" className="mt-5">
                <Button variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10">
                  Create free account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          {/* 3. Become a Partner */}
          <ScrollReveal delay={0.1}>
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <HeartHandshake className="mb-4 h-9 w-9 text-gold" />
              <h2 className="text-xl font-semibold">Become a Partner</h2>
              <p className="mt-2 flex-1 text-sm text-white/70">
                Sustain prophetic ministry, discipleship, and missions as a Covenant
                Partner — with monthly gatherings, teachings, and resources.
              </p>
              <Link href="/partners" className="mt-5">
                <Button variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10">
                  Explore partnership <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Participate capture form */}
      {showForm && (
        <section id="participate-form" className="px-6 py-12 scroll-mt-24">
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            {submitted ? (
              <div className="py-6 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gold" />
                <h3 className="text-2xl font-semibold">You&apos;re in!</h3>
                <p className="mt-3 text-white/70">
                  Thanks, {form.name.split(' ')[0]}. We&apos;ve got your interests and
                  we&apos;ll be in touch. Check your inbox for a confirmation.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/auth/signup">
                    <Button variant="gold">Create a free account</Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                      Back to home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-semibold">Tell us what you&apos;re into</h3>
                <p className="mt-2 text-sm text-white/60">
                  Pick anything that applies — you can change your mind later.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div className="space-y-3">
                    {interestOptions.map((opt) => (
                      <label
                        key={opt.id}
                        htmlFor={opt.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-gold/40"
                      >
                        <Checkbox
                          id={opt.id}
                          checked={selected.includes(opt.id)}
                          onCheckedChange={() => toggleInterest(opt.id)}
                          className="mt-0.5 border-white/30 data-[state=checked]:bg-gold data-[state=checked]:text-navy-950"
                        />
                        <span>
                          <span className="block font-medium">{opt.label}</span>
                          <span className="block text-sm text-white/60">{opt.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
                      placeholder="For texts about gatherings"
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <Button
                    type="submit"
                    variant="gold"
                    className="w-full"
                    disabled={submitting || (!form.name || !form.email)}
                  >
                    {submitting ? 'Submitting…' : 'Count me in'}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </Button>
                  <p className="text-center text-xs text-white/40">
                    Prefer a full account?{' '}
                    <Link href="/auth/signup" className="text-gold hover:underline">
                      Sign up as a member
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

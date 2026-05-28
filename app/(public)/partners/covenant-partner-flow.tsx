'use client'

import { useState } from 'react'
import { ArrowRight, Check, CircleDollarSign, HeartHandshake, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type PartnershipLevel = {
  name: string
  amount: number | null
  description: string
  featured?: boolean
}

const partnershipLevels: PartnershipLevel[] = [
  {
    name: 'Builder',
    amount: 25,
    description: 'Help sustain the ongoing work of teaching, prayer, and encouragement.',
  },
  {
    name: 'Steward',
    amount: 50,
    description: 'Support discipleship resources and monthly partner gatherings.',
  },
  {
    name: 'Kingdom Partner',
    amount: 100,
    description: 'Help expand ministry, media, and leadership development.',
    featured: true,
  },
  {
    name: 'Vision Partner',
    amount: 250,
    description: 'Strengthen missions, events, and broader kingdom initiatives.',
  },
  {
    name: 'Legacy Partner',
    amount: null,
    description: 'Make a larger monthly commitment to help build long-term impact.',
  },
]

export function CovenantPartnerFlow() {
  const [selectedLevel, setSelectedLevel] = useState<PartnershipLevel>(partnershipLevels[2])
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedAmount = selectedLevel.amount ?? Number(customAmount)
  const hasValidAmount = Number.isFinite(selectedAmount) && selectedAmount >= 1

  const handleCheckout = async () => {
    if (!hasValidAmount) {
      setError('Please enter a monthly partnership amount of at least $1.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedAmount,
          type: 'general',
          frequency: 'monthly',
          donorName: donorName.trim() || undefined,
          donorEmail: donorEmail.trim() || undefined,
          campaign: 'covenant-partners',
        }),
      })

      const data: { url?: string; error?: string; details?: string } = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Unable to begin checkout.')
      }

      if (!data.url) {
        throw new Error('No secure checkout URL was returned.')
      }

      window.location.href = data.url
    } catch (checkoutError) {
      const message = checkoutError instanceof Error ? checkoutError.message : 'Something went wrong.'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <section id="start-partnership" className="bg-navy-950 px-4 py-section-sm text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.18em] text-gold">
              Start Your Partnership
            </p>
            <h2 className="mt-3 font-display text-display-md text-white">Choose a monthly rhythm</h2>
            <p className="mt-5 text-body-lg text-navy-200">
              This is a Covenant Partner pathway, not a general giving detour. Choose a monthly level,
              confirm your details, and continue to secure checkout.
            </p>
            <div className="mt-6 rounded-lg border border-gold/30 bg-gold/10 p-5 text-body-sm text-gold-100">
              <strong className="text-gold">Prophetic ministry is never for sale.</strong> Partnership
              helps sustain ministry, discipleship, missions, and practical equipping.
            </div>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/8 p-5 shadow-2xl">
            <div className="grid gap-3 sm:grid-cols-2">
              {partnershipLevels.map((level) => {
                const isSelected = selectedLevel.name === level.name
                return (
                  <button
                    key={level.name}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(level)
                      setError(null)
                    }}
                    className={`rounded-lg border p-4 text-left transition ${
                      isSelected
                        ? 'border-gold bg-gold text-navy-950 shadow-[0_0_24px_rgba(212,184,131,0.2)]'
                        : 'border-white/15 bg-white/8 hover:border-gold/60'
                    } ${level.featured && !isSelected ? 'ring-1 ring-gold/40' : ''}`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-body-xl">{level.name}</span>
                      {isSelected ? (
                        <Check className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <CircleDollarSign className="h-5 w-5 flex-shrink-0 text-gold" />
                      )}
                    </div>
                    <p className="mt-4 font-display text-display-xs">
                      {level.amount ? `$${level.amount}` : 'Custom'}
                      {level.amount && <span className="text-body-sm font-normal opacity-75">/month</span>}
                    </p>
                    <p className={`mt-3 text-body-sm ${isSelected ? 'text-navy-900' : 'text-navy-200'}`}>
                      {level.description}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 rounded-lg border border-white/15 bg-navy-950/70 p-5">
              <div className="flex items-center gap-3">
                <HeartHandshake className="h-6 w-6 text-gold" />
                <div>
                  <p className="font-display text-body-xl text-white">{selectedLevel.name}</p>
                  <p className="text-body-sm text-navy-200">
                    {selectedLevel.amount ? `$${selectedLevel.amount}/month` : 'Choose your monthly gift'}
                  </p>
                </div>
              </div>

              {!selectedLevel.amount && (
                <div className="mt-5">
                  <Label htmlFor="custom-partner-amount" className="text-navy-100">
                    Monthly amount
                  </Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300">$</span>
                    <Input
                      id="custom-partner-amount"
                      type="number"
                      min="1"
                      inputMode="decimal"
                      value={customAmount}
                      onChange={(event) => setCustomAmount(event.target.value)}
                      className="border-white/20 bg-white/10 pl-7 text-white placeholder:text-navy-300"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="partner-name" className="text-navy-100">
                    Name
                  </Label>
                  <Input
                    id="partner-name"
                    value={donorName}
                    onChange={(event) => setDonorName(event.target.value)}
                    className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-navy-300"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="partner-email" className="text-navy-100">
                    Email
                  </Label>
                  <Input
                    id="partner-email"
                    type="email"
                    value={donorEmail}
                    onChange={(event) => setDonorEmail(event.target.value)}
                    className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-navy-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-lg border border-red-300/40 bg-red-500/10 p-3 text-body-sm text-red-100">
                  {error}
                </div>
              )}

              <Button
                type="button"
                size="xl"
                variant="gold"
                className="mt-6 w-full"
                onClick={handleCheckout}
                disabled={loading || !hasValidAmount}
              >
                {loading ? 'Opening Secure Checkout...' : 'Continue to Secure Monthly Checkout'}
                <ArrowRight className="h-5 w-5" />
              </Button>

              <div className="mt-4 flex flex-col gap-3 text-body-sm text-navy-200 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gold" />
                  Secure checkout powered by Stripe.
                </span>
                <a className="font-medium text-gold underline-offset-4 hover:underline" href="/giving">
                  Prefer a one-time gift?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

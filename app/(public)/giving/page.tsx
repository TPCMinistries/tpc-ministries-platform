'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Globe, Users, DollarSign, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function GivingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <GivingPageInner />
    </Suspense>
  )
}

function GivingPageInner() {
  const searchParams = useSearchParams()
  const [selectedAmount, setSelectedAmount] = useState<string>('50')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [givingType, setGivingType] = useState<'ministry' | 'missions' | 'leadership'>('ministry')
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const campaign = searchParams.get('campaign') || undefined

  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam === 'ministry' || typeParam === 'missions' || typeParam === 'leadership') {
      setGivingType(typeParam)
    }
    const freqParam = searchParams.get('frequency')
    if (freqParam === 'once' || freqParam === 'monthly') {
      setFrequency(freqParam)
    }
    const amountParam = searchParams.get('amount')
    if (amountParam && !isNaN(Number(amountParam)) && Number(amountParam) > 0) {
      setSelectedAmount(amountParam)
      setCustomAmount('')
    }
  }, [searchParams])

  const quickAmounts = ['25', '50', '100', '250', '500', '1000']

  const handleAmountClick = (amount: string) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount('')
  }

  const getCurrentAmount = () => {
    return customAmount || selectedAmount
  }

  const handleSubmit = async () => {
    const amount = parseFloat(getCurrentAmount())

    if (!amount || amount < 1) {
      setError('Please enter a valid amount')
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
          amount,
          type: givingType === 'ministry' ? 'general' : givingType,
          frequency,
          ...(campaign ? { campaign } : {}),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Checkout session error:', data)
        throw new Error(data.error || data.details || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received from server')
      }
    } catch (err: any) {
      console.error('Donation submission error:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[50vh] md:min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,184,131,0.06),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-20 md:py-32 text-center">
          <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Partner With Us
          </p>
          <h1 className="mb-6 font-display text-display-md sm:text-display-lg md:text-display-xl lg:text-display-2xl text-white">
            Give with Purpose
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            Your generosity empowers lives, transforms communities, and advances God&apos;s kingdom across the globe.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <p className="mt-8 text-body-lg italic text-gold/70">
            &ldquo;Give, and it will be given to you... pressed down, shaken together and running over.&rdquo;
            <span className="mt-1 block text-body-md not-italic text-white/40">&mdash; Luke 6:38</span>
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Mission Fields */}
      <section className="border-y border-border bg-secondary/50 px-4 py-10 md:py-section-sm">
        <div className="container mx-auto max-w-4xl">
          <p className="mb-6 text-center text-body-md font-medium text-navy dark:text-white">Your giving reaches</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
            {[
              { flag: '\u{1F1F0}\u{1F1EA}', country: 'Kenya', region: 'East Africa' },
              { flag: '\u{1F1FF}\u{1F1E6}', country: 'South Africa', region: 'Southern Africa' },
              { flag: '\u{1F1EC}\u{1F1E9}', country: 'Grenada', region: 'Caribbean' },
            ].map((item) => (
              <div
                key={item.country}
                className="rounded-2xl border border-border bg-card p-4 text-center transition-all duration-200 hover:border-gold/30 hover:shadow-lg"
              >
                <div className="mb-2 text-4xl md:text-5xl">{item.flag}</div>
                <p className="font-display text-body-lg font-semibold text-navy dark:text-white">{item.country}</p>
                <p className="text-body-sm text-muted-foreground">{item.region}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Giving Section */}
      <section className="px-4 py-12 md:py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Giving Options */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
                <h2 className="mb-2 font-display text-display-xs text-navy dark:text-white">Choose Your Impact</h2>
                <p className="mb-8 text-body-md text-muted-foreground">Select where you&apos;d like to direct your gift</p>

                {/* Giving Type Selection */}
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                  <button
                    onClick={() => setGivingType('ministry')}
                    className={`rounded-2xl border-2 p-6 transition-all duration-200 ${
                      givingType === 'ministry'
                        ? 'border-navy bg-navy/5 shadow-md dark:border-gold dark:bg-gold/5'
                        : 'border-border hover:border-gold/30'
                    }`}
                  >
                    <Heart className={`mx-auto mb-3 h-8 w-8 ${givingType === 'ministry' ? 'text-navy dark:text-gold' : 'text-muted-foreground'}`} />
                    <h3 className="mb-2 font-display text-body-lg font-semibold text-navy dark:text-white">General Ministry</h3>
                    <p className="text-body-sm text-muted-foreground">Support our overall mission and operations</p>
                  </button>

                  <button
                    onClick={() => setGivingType('missions')}
                    className={`rounded-2xl border-2 p-6 transition-all duration-200 ${
                      givingType === 'missions'
                        ? 'border-gold bg-gold/5 shadow-md'
                        : 'border-border hover:border-gold/30'
                    }`}
                  >
                    <Globe className={`mx-auto mb-3 h-8 w-8 ${givingType === 'missions' ? 'text-gold' : 'text-muted-foreground'}`} />
                    <h3 className="mb-2 font-display text-body-lg font-semibold text-navy dark:text-white">Global Missions</h3>
                    <p className="text-body-sm text-muted-foreground">Fund mission trips and international outreach</p>
                  </button>

                  <button
                    onClick={() => setGivingType('leadership')}
                    className={`rounded-2xl border-2 p-6 transition-all duration-200 ${
                      givingType === 'leadership'
                        ? 'border-navy bg-navy/5 shadow-md dark:border-gold dark:bg-gold/5'
                        : 'border-border hover:border-gold/30'
                    }`}
                  >
                    <Users className={`mx-auto mb-3 h-8 w-8 ${givingType === 'leadership' ? 'text-navy dark:text-gold' : 'text-muted-foreground'}`} />
                    <h3 className="mb-2 font-display text-body-lg font-semibold text-navy dark:text-white">Leadership Support</h3>
                    <p className="text-body-sm text-muted-foreground">Honor and support our ministry leaders</p>
                  </button>
                </div>

                {/* Frequency Selection */}
                <div className="mb-8">
                  <Label className="mb-3 block font-display text-body-md font-medium text-navy dark:text-white">Giving Frequency</Label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFrequency('once')}
                      className={`flex-1 rounded-xl border-2 px-6 py-3 font-medium transition-all duration-200 ${
                        frequency === 'once'
                          ? 'border-navy bg-navy text-white dark:border-gold dark:bg-gold dark:text-navy-950'
                          : 'border-border text-foreground hover:border-gold/30'
                      }`}
                    >
                      One-Time Gift
                    </button>
                    <button
                      onClick={() => setFrequency('monthly')}
                      className={`flex-1 rounded-xl border-2 px-6 py-3 font-medium transition-all duration-200 ${
                        frequency === 'monthly'
                          ? 'border-navy bg-navy text-white dark:border-gold dark:bg-gold dark:text-navy-950'
                          : 'border-border text-foreground hover:border-gold/30'
                      }`}
                    >
                      Monthly Partner
                    </button>
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="mb-8">
                  <Label className="mb-3 block font-display text-body-md font-medium text-navy dark:text-white">Select Amount</Label>
                  <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountClick(amount)}
                        className={`rounded-xl border-2 px-4 py-3 font-semibold transition-all duration-200 ${
                          selectedAmount === amount && !customAmount
                            ? 'border-gold bg-gold text-navy-950 shadow-md'
                            : 'border-border text-foreground hover:border-gold/30'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="custom-amount" className="mb-2 block text-body-sm text-muted-foreground">
                      Or enter a custom amount
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="custom-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="h-12 pl-10 text-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-body-sm text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  variant="glow"
                  size="xl"
                  className="w-full text-lg font-bold"
                  disabled={!getCurrentAmount() || loading}
                  onClick={handleSubmit}
                >
                  {loading ? 'Processing...' : (frequency === 'monthly' ? 'Become a Monthly Partner' : 'Give')} ${getCurrentAmount() || '0'}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>

                <p className="mt-4 text-center text-body-sm text-muted-foreground">
                  Secure payment &bull; Tax-deductible &bull; 100% goes to your selected fund
                </p>
              </div>
            </div>

            {/* Impact Sidebar */}
            <div className="space-y-6">
              {/* Current Selection Impact */}
              <div className="rounded-3xl border border-gold/30 bg-card p-8">
                <h3 className="mb-6 flex items-center gap-2 font-display text-display-xs text-navy dark:text-white">
                  <Sparkles className="h-5 w-5 text-gold" />
                  Your Impact
                </h3>
                <div className="space-y-4">
                  {givingType === 'ministry' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy dark:text-gold" />
                        <p className="text-body-sm text-muted-foreground">Fund transformative teachings and resources</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy dark:text-gold" />
                        <p className="text-body-sm text-muted-foreground">Support community programs and events</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy dark:text-gold" />
                        <p className="text-body-sm text-muted-foreground">Expand digital ministry platforms</p>
                      </div>
                    </>
                  )}
                  {givingType === 'missions' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                        <p className="text-body-sm text-muted-foreground">Support mission teams in Kenya, South Africa &amp; Grenada</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                        <p className="text-body-sm text-muted-foreground">Provide resources to local communities</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                        <p className="text-body-sm text-muted-foreground">Build sustainable ministry partnerships</p>
                      </div>
                    </>
                  )}
                  {givingType === 'leadership' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy dark:text-gold" />
                        <p className="text-body-sm text-muted-foreground">Bless and honor our ministry leaders</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy dark:text-gold" />
                        <p className="text-body-sm text-muted-foreground">Support leadership development</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy dark:text-gold" />
                        <p className="text-body-sm text-muted-foreground">Enable greater ministry capacity</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tax Info */}
              <div className="rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:border-gold/30 hover:shadow-xl">
                <h3 className="mb-3 font-display text-display-xs text-navy dark:text-white">Tax Deductible</h3>
                <p className="text-body-sm text-muted-foreground">
                  Your donation is tax-deductible to the full extent allowed by law. A receipt will be emailed to you.
                </p>
              </div>

              {/* Other Ways to Give */}
              <div className="rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:border-gold/30 hover:shadow-xl">
                <h3 className="mb-3 font-display text-display-xs text-navy dark:text-white">Other Ways to Give</h3>
                <p className="text-body-sm text-muted-foreground">
                  For check, wire transfer, or stock donations, email{' '}
                  <a href="mailto:info@tpcmin.org" className="font-medium text-gold hover:underline">
                    info@tpcmin.org
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture Section */}
      <section className="bg-navy dark:bg-navy-950 px-4 py-12 md:py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 md:mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Scripture
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-white">
              The Heart of Giving
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-gold/30 hover:bg-white/10">
              <p className="mb-4 text-body-lg italic leading-relaxed text-white/70">
                &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
              </p>
              <p className="font-display text-body-md font-semibold text-gold">2 Corinthians 9:7</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-gold/30 hover:bg-white/10">
              <p className="mb-4 text-body-lg italic leading-relaxed text-white/70">
                &ldquo;Honor the Lord with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing.&rdquo;
              </p>
              <p className="font-display text-body-md font-semibold text-gold">Proverbs 3:9-10</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-16 md:py-section-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />

        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Thank You
          </p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
            Every Gift Makes a Difference
          </h2>
          <p className="mb-10 text-body-xl text-white/50">
            Whether large or small, your generosity is multiplied to reach lives and transform communities.
          </p>
          <p className="text-body-lg italic text-gold/60">
            Thank you for partnering with us in advancing God&apos;s Kingdom.
          </p>
        </div>
      </section>
    </div>
  )
}

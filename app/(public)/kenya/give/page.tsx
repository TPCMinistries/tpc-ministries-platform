'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  DollarSign,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Package,
  Users,
  Target,
  Globe2,
  Loader2,
  Shield,
  Download,
  FileText,
  Sparkles,
} from 'lucide-react'

type GivingType = 'team' | 'supplies' | 'general'

const givingOptions = {
  team: {
    title: 'Send a Team Member',
    icon: Users,
    description: 'Help cover flights, lodging, meals, and program costs for mission participants',
    suggestedAmounts: ['100', '250', '500', '1000', '1750', '3500'],
    impact: [
      { amount: '$100', description: 'Covers meals for 3 days' },
      { amount: '$250', description: 'Covers ground transportation' },
      { amount: '$500', description: 'Covers meals for the entire trip' },
      { amount: '$1,000', description: 'Covers lodging for one participant' },
      { amount: '$1,750', description: 'Covers half a participant\'s trip' },
      { amount: '$3,500', description: 'Fully sponsors one team member' },
    ],
  },
  supplies: {
    title: 'Fund Ministry Supplies',
    icon: Package,
    description: 'Provide resources that stay in Kenya - medical supplies, school materials, farming equipment',
    suggestedAmounts: ['25', '50', '100', '250', '500', '1000'],
    impact: [
      { amount: '$25', description: 'School supplies for 5 children' },
      { amount: '$50', description: 'Hygiene kits for a family' },
      { amount: '$100', description: 'Medical supplies for a clinic day' },
      { amount: '$250', description: 'Bibles and ministry materials' },
      { amount: '$500', description: 'Educational resources for a school' },
      { amount: '$1,000', description: 'Equips a community garden project' },
    ],
  },
  general: {
    title: 'Greatest Need',
    icon: Heart,
    description: 'Flexible giving that goes where it\'s needed most - scholarships, emergencies, or logistics',
    suggestedAmounts: ['50', '100', '250', '500', '1000', '2500'],
    impact: [
      { amount: '$50', description: 'Helps with unexpected trip needs' },
      { amount: '$100', description: 'Contributes to participant scholarships' },
      { amount: '$250', description: 'Supports local ministry partners' },
      { amount: '$500', description: 'Funds emergency medical supplies' },
      { amount: '$1,000', description: 'Provides significant scholarship aid' },
      { amount: '$2,500', description: 'Major impact across multiple areas' },
    ],
  },
}

const impactStats = [
  { value: '3', label: 'Cities Served' },
  { value: '4', label: 'Service Tracks' },
  { value: '16', label: 'Days of Service' },
  { value: '20+', label: 'Delegates' },
]

export default function KenyaGivingPage() {
  const [selectedType, setSelectedType] = useState<GivingType>('team')
  const [selectedAmount, setSelectedAmount] = useState<string>('500')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentOption = givingOptions[selectedType]

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
          type: `kenya-${selectedType}`,
          frequency,
          metadata: {
            campaign: 'Kenya Kingdom Impact Trip 2026',
            designation: currentOption.title,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Checkout session error:', data)
        throw new Error(data.error || data.details || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received from server')
      }
    } catch (err: unknown) {
      console.error('Donation submission error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  // Mock progress - in production, fetch from database
  const fundraisingGoal = 50000
  const currentRaised = 12750
  const progressPercent = Math.min((currentRaised / fundraisingGoal) * 100, 100)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-5xl px-4 py-32">
          <Link
            href="/kenya"
            className="mb-6 inline-flex items-center gap-2 text-body-sm text-gold transition-colors hover:text-gold-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kenya Trip
          </Link>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-body-sm font-medium text-gold">
                <Globe2 className="h-4 w-4" />
                Kenya Kingdom Impact Trip 2026
              </div>
              <h1 className="mb-4 font-display text-display-xl text-white md:text-display-2xl">
                Your Gift Changes Lives
              </h1>
              <p className="mb-8 text-body-xl text-white/50">
                Every dollar you give sends teams, equips communities, and creates lasting Kingdom impact in Kenya.
              </p>

              {/* Fundraising Progress */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-gold" />
                    <span className="font-semibold text-white">2026 Mission Goal</span>
                  </div>
                  <span className="text-white">
                    <span className="font-bold text-gold">${currentRaised.toLocaleString()}</span>
                    <span className="text-white/40"> / ${fundraisingGoal.toLocaleString()}</span>
                  </span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-navy-950">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold-300 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-body-sm text-white/40">
                  {Math.round(progressPercent)}% raised - Help us reach our goal
                </p>
              </div>
            </div>

            {/* Impact Stats */}
            <div className="hidden grid-cols-2 gap-4 lg:grid">
              {impactStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
                  <div className="mb-1 font-display text-display-sm text-gold">{stat.value}</div>
                  <div className="text-body-sm text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Main Giving Section */}
      <section className="bg-secondary px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          {/* Giving Type Selection */}
          <div className="mb-10 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Make an Impact</p>
            <h2 className="mb-3 font-display text-display-md text-foreground">
              Choose How to Give
            </h2>
            <p className="text-body-md text-muted-foreground">
              Select where you want your gift to make the biggest impact
            </p>
            <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="mb-10 grid gap-4 md:grid-cols-3">
            {(Object.entries(givingOptions) as [GivingType, typeof givingOptions.team][]).map(([key, option]) => {
              const Icon = option.icon
              const isSelected = selectedType === key
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedType(key)
                    setSelectedAmount(option.suggestedAmounts[2] || '100')
                    setCustomAmount('')
                  }}
                  className={`rounded-2xl border-2 p-6 text-left transition-all ${
                    isSelected
                      ? 'border-gold bg-gold/5 shadow-lg'
                      : 'border-border bg-card hover:border-gold hover:shadow-md'
                  }`}
                >
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${
                    isSelected ? 'bg-gold' : 'bg-muted'
                  }`}>
                    <Icon className={`h-7 w-7 ${isSelected ? 'text-navy' : 'text-muted-foreground'}`} />
                  </div>
                  <h3 className={`mb-2 text-body-lg font-bold ${isSelected ? 'text-gold-600' : 'text-foreground'}`}>
                    {option.title}
                  </h3>
                  <p className="text-body-sm text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Giving Form Card */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
            <div className="grid lg:grid-cols-5">
              {/* Left Side - Form */}
              <div className="p-8 md:p-10 lg:col-span-3">
                {/* Frequency Toggle */}
                <div className="mb-8">
                  <Label className="mb-3 block text-body-sm font-semibold text-muted-foreground">Giving Frequency</Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFrequency('once')}
                      className={`flex-1 rounded-xl border-2 px-6 py-3 font-semibold transition-all ${
                        frequency === 'once'
                          ? 'border-gold bg-gold text-navy'
                          : 'border-border bg-card text-muted-foreground hover:border-gold'
                      }`}
                    >
                      One-Time
                    </button>
                    <button
                      onClick={() => setFrequency('monthly')}
                      className={`flex-1 rounded-xl border-2 px-6 py-3 font-semibold transition-all ${
                        frequency === 'monthly'
                          ? 'border-gold bg-gold text-navy'
                          : 'border-border bg-card text-muted-foreground hover:border-gold'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="mb-8">
                  <Label className="mb-3 block text-body-sm font-semibold text-muted-foreground">Select Amount</Label>
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    {currentOption.suggestedAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountClick(amount)}
                        className={`rounded-xl border-2 px-4 py-4 text-body-lg font-bold transition-all ${
                          selectedAmount === amount && !customAmount
                            ? 'border-gold bg-gold text-navy'
                            : 'border-border bg-card text-muted-foreground hover:border-gold'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Other amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="h-14 rounded-xl border-border bg-card pl-11 text-body-lg focus:border-gold focus:ring-gold"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-body-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  size="lg"
                  className="h-16 w-full rounded-xl bg-gold text-display-xs font-bold text-navy shadow-lg shadow-gold/25 hover:bg-gold-300"
                  disabled={!getCurrentAmount() || loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Give ${getCurrentAmount() || '0'}{frequency === 'monthly' ? '/month' : ''}
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </>
                  )}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-body-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Secure - Tax-deductible - 100% goes to Kenya mission
                </div>
              </div>

              {/* Right Side - Impact */}
              <div className="border-l border-border bg-gradient-to-br from-gold/5 to-secondary p-8 md:p-10 lg:col-span-2">
                <div className="mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold-600" />
                  <h3 className="font-bold text-foreground">Your Impact</h3>
                </div>
                <div className="space-y-4">
                  {currentOption.impact.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-16 flex-shrink-0">
                        <span className="text-body-sm font-bold text-gold-600">{item.amount}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                          <p className="text-body-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <p className="text-body-sm leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">TPC Ministries</strong> is a registered 501(c)(3). Your donation is tax-deductible and you will receive a receipt via email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trip Info Section */}
      <section className="border-t border-border bg-background px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">About the Trip</p>
              <h2 className="mb-4 font-display text-display-md text-foreground">
                About the Kenya Trip
              </h2>
              <p className="mb-6 text-body-md leading-relaxed text-muted-foreground">
                The Kenya Global Impact Delegation brings together leaders, professionals, and ministry partners for a 14-day multi-sector initiative in Nairobi, Kakamega, and Mombasa. Teams serve across four tracks: ministry, health and wellness, education and technology, and business and economic empowerment.
              </p>
              <div className="mb-8 space-y-3">
                {[
                  'April 23 – May 6, 2026',
                  'Four service tracks based on your skills',
                  'Cultural immersion and safari experience',
                  'Scholarships available for qualified applicants',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                    <span className="text-body-md text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/kenya#apply">
                  <Button className="h-12 rounded-xl bg-navy px-6 font-semibold text-white hover:bg-navy-800">
                    Apply for the Trip
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href="/images/kenya/Kenya-Kingdom-Impact-Trip-2026.pdf"
                  download
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-border px-6 font-semibold text-muted-foreground transition-colors hover:border-gold hover:bg-gold/5"
                >
                  <Download className="h-4 w-4" />
                  Download Trip Guide
                </a>
              </div>
            </div>

            {/* Trip Flier */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-gold/10 to-transparent blur-xl" />
              <div className="relative rounded-2xl border border-border bg-secondary p-4">
                <Image
                  src="/images/kenya/kenya-flier.png"
                  alt="Kenya Kingdom Impact Trip 2026"
                  width={400}
                  height={500}
                  className="w-full rounded-xl shadow-lg"
                />
                <a
                  href="/images/kenya/kenya-flier.png"
                  download="Kenya-Trip-2026-Flier.png"
                  className="mt-4 flex items-center justify-center gap-2 text-body-sm font-medium text-gold-600 transition-colors hover:text-gold-500"
                >
                  <Download className="h-4 w-4" />
                  Download Flier
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Ways to Give */}
      <section className="border-t border-border bg-secondary px-4 py-section-sm">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="mb-4 font-display text-display-xs text-foreground">Other Ways to Give</h3>
          <p className="mb-6 text-body-md text-muted-foreground">
            For check, wire transfer, or stock donations, or to sponsor a specific team member, contact us:
          </p>
          <a
            href="mailto:info@tpcmin.org?subject=Kenya%20Mission%20Giving"
            className="inline-flex items-center gap-2 text-body-lg font-semibold text-gold-600 hover:text-gold-500"
          >
            info@tpcmin.org
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative bg-navy-950 px-4 py-section-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Give Generously</p>
          <h2 className="mb-3 font-display text-display-md text-white">
            Every Gift Makes a Difference
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-body-lg text-white/50">
            Whether you give $25 or $2,500, your generosity sends teams, equips communities, and transforms lives in Kenya.
          </p>
          <div className="mx-auto mb-6 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <p className="font-serif italic text-white/40">
            &ldquo;Truly I tell you, whatever you did for one of the least of these brothers and sisters of mine, you did for me.&rdquo; — Matthew 25:40
          </p>
        </div>
      </section>
    </div>
  )
}

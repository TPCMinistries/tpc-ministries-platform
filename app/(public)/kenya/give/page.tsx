'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Heart,
  Users,
  DollarSign,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Package,
  Plane,
  Target,
  Globe2,
  Loader2,
  Shield,
} from 'lucide-react'

type GivingType = 'sponsor' | 'supplies' | 'scholarship'

const givingOptions = {
  sponsor: {
    title: 'Sponsor a Participant',
    icon: Plane,
    description: 'Cover travel, lodging, and program costs for a mission team member',
    color: 'amber',
    suggestedAmounts: ['250', '500', '1000', '1750', '2500', '3500'],
    impact: [
      '$250 covers ground transportation for one participant',
      '$500 covers meals for one participant for the entire trip',
      '$1,000 covers lodging for one participant',
      '$1,750 covers half of a participant\'s trip cost',
      '$3,500 covers a full participant sponsorship',
    ],
  },
  supplies: {
    title: 'Fund Supplies & Resources',
    icon: Package,
    description: 'Provide medical supplies, educational materials, and ministry resources',
    color: 'emerald',
    suggestedAmounts: ['25', '50', '100', '250', '500', '1000'],
    impact: [
      '$25 provides school supplies for 5 children',
      '$50 provides a hygiene kit for a family',
      '$100 provides medical supplies for a clinic day',
      '$250 provides Bibles and ministry materials',
      '$500 funds educational resources for a school',
      '$1,000 equips a community garden project',
    ],
  },
  scholarship: {
    title: 'Scholarship Fund',
    icon: GraduationCap,
    description: 'Help participants who cannot afford the full trip cost join the mission',
    color: 'blue',
    suggestedAmounts: ['100', '250', '500', '1000', '1750', '3500'],
    impact: [
      '$100 contributes to a participant\'s scholarship',
      '$250 covers a significant portion of travel costs',
      '$500 provides a partial scholarship',
      '$1,000 provides a half scholarship',
      '$1,750 provides a significant scholarship',
      '$3,500 provides a full trip scholarship',
    ],
  },
}

export default function KenyaGivingPage() {
  const [selectedType, setSelectedType] = useState<GivingType>('sponsor')
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
    <div className="flex min-h-screen flex-col bg-stone-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 px-4 py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
        <div className="container relative mx-auto max-w-6xl">
          <Link
            href="/kenya"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kenya Trip
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Globe2 className="h-4 w-4" />
              Kenya Kingdom Impact Trip 2026
            </div>
            <h1 className="mb-6 font-serif text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Support the Mission
            </h1>
            <p className="text-xl text-stone-300 max-w-3xl mx-auto">
              Your generosity makes it possible for mission teams to serve, for supplies to reach communities, and for those called to go to answer that call.
            </p>
          </div>
        </div>
      </section>

      {/* Fundraising Progress */}
      <section className="px-4 py-8 bg-white border-b border-stone-200">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-stone-900">Fundraising Goal</span>
            </div>
            <span className="text-stone-600">
              <span className="font-bold text-amber-600">${currentRaised.toLocaleString()}</span>
              {' '}of ${fundraisingGoal.toLocaleString()}
            </span>
          </div>
          <div className="h-4 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-stone-500 mt-2 text-center">
            {Math.round(progressPercent)}% of our goal reached
          </p>
        </div>
      </section>

      {/* Main Giving Section */}
      <section className="px-4 py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Giving Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Giving Type Selection */}
              <Card className="border-stone-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-stone-900">Choose Your Impact</CardTitle>
                  <p className="text-stone-600">Select how you would like to support the Kenya mission</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    {(Object.entries(givingOptions) as [GivingType, typeof givingOptions.sponsor][]).map(([key, option]) => {
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
                          className={`p-5 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 shadow-md'
                              : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                            isSelected ? 'bg-amber-500' : 'bg-stone-100'
                          }`}>
                            <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-stone-500'}`} />
                          </div>
                          <h3 className={`font-semibold mb-1 ${isSelected ? 'text-amber-700' : 'text-stone-900'}`}>
                            {option.title}
                          </h3>
                          <p className="text-sm text-stone-600 leading-relaxed">
                            {option.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>

                  {/* Frequency Selection */}
                  <div>
                    <Label className="text-base mb-3 block text-stone-700">Giving Frequency</Label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setFrequency('once')}
                        className={`flex-1 py-3 px-6 rounded-xl border-2 font-medium transition-all ${
                          frequency === 'once'
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-stone-200 text-stone-700 hover:border-amber-300'
                        }`}
                      >
                        One-Time Gift
                      </button>
                      <button
                        onClick={() => setFrequency('monthly')}
                        className={`flex-1 py-3 px-6 rounded-xl border-2 font-medium transition-all ${
                          frequency === 'monthly'
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-stone-200 text-stone-700 hover:border-amber-300'
                        }`}
                      >
                        Monthly Gift
                      </button>
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <Label className="text-base mb-3 block text-stone-700">Select Amount</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      {currentOption.suggestedAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleAmountClick(amount)}
                          className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                            selectedAmount === amount && !customAmount
                              ? 'border-amber-500 bg-amber-500 text-white'
                              : 'border-stone-200 text-stone-700 hover:border-amber-300'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                    <div>
                      <Label htmlFor="custom-amount" className="text-sm text-stone-600 mb-2 block">
                        Or enter a custom amount
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                        <Input
                          id="custom-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="pl-10 h-12 text-lg bg-white border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    size="lg"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-14 text-lg rounded-xl"
                    disabled={!getCurrentAmount() || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {frequency === 'monthly' ? 'Give Monthly' : 'Give'} ${getCurrentAmount() || '0'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                    <Shield className="h-4 w-4" />
                    Secure payment processing • Tax-deductible • 100% goes to Kenya mission
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Impact Sidebar */}
            <div className="space-y-6">
              {/* Selected Option Impact */}
              <Card className="border-2 border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Your Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentOption.impact.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-stone-700">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Why Give */}
              <Card className="border-stone-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-stone-900">Why Your Gift Matters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-stone-600">
                  <p>
                    The Kenya Kingdom Impact Trip brings together believers from across America to serve alongside Kenyan communities in meaningful, lasting ways.
                  </p>
                  <p>
                    Your gift directly supports mission participants, provides resources to underserved communities, and enables those who feel called but face financial barriers.
                  </p>
                  <p className="font-medium text-stone-700">
                    Every dollar makes a difference.
                  </p>
                </CardContent>
              </Card>

              {/* Tax Info */}
              <Card className="border-stone-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-stone-900">Tax Deductible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-600">
                    TPC Ministries is a 501(c)(3) nonprofit organization. Your donation is tax-deductible to the full extent allowed by law. A receipt will be emailed to you for your records.
                  </p>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card className="border-stone-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-stone-900">Questions?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-stone-600 mb-3">
                    For questions about giving or to discuss sponsoring a participant, contact us:
                  </p>
                  <a
                    href="mailto:info@tpcmin.org"
                    className="text-amber-600 hover:text-amber-700 font-medium hover:underline"
                  >
                    info@tpcmin.org
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture Section */}
      <section className="px-4 py-12 bg-white border-t border-stone-200">
        <div className="container mx-auto max-w-4xl text-center">
          <blockquote className="text-xl md:text-2xl text-stone-700 italic mb-4">
            "Truly I tell you, whatever you did for one of the least of these brothers and sisters of mine, you did for me."
          </blockquote>
          <p className="text-amber-600 font-semibold">Matthew 25:40</p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-12 bg-gradient-to-br from-stone-900 to-amber-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Called to Go Instead of Give?
          </h2>
          <p className="text-lg text-stone-300 mb-6">
            Join us on the Kenya Kingdom Impact Trip and experience missions firsthand.
          </p>
          <Link href="/kenya#apply">
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 px-8 rounded-xl"
            >
              Apply for the Trip
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

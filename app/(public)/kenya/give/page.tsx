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
  { value: '6', label: 'Ministry Tracks' },
  { value: '17', label: 'Days of Service' },
  { value: "1000's", label: 'Lives Impacted' },
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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 px-4 py-16 md:py-20">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
        <div className="container relative mx-auto max-w-6xl">
          <Link
            href="/kenya"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Kenya Trip
          </Link>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Globe2 className="h-4 w-4" />
                Kenya Kingdom Impact Trip 2026
              </div>
              <h1 className="mb-4 font-serif text-4xl font-bold text-white md:text-5xl">
                Your Gift Changes Lives
              </h1>
              <p className="text-xl text-stone-300 mb-8">
                Every dollar you give sends teams, equips communities, and creates lasting Kingdom impact in Kenya.
              </p>

              {/* Fundraising Progress */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-400" />
                    <span className="font-semibold text-white">2026 Mission Goal</span>
                  </div>
                  <span className="text-white">
                    <span className="font-bold text-amber-400">${currentRaised.toLocaleString()}</span>
                    <span className="text-stone-400"> / ${fundraisingGoal.toLocaleString()}</span>
                  </span>
                </div>
                <div className="h-4 bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-sm text-stone-400 mt-2">
                  {Math.round(progressPercent)}% raised • Help us reach our goal
                </p>
              </div>
            </div>

            {/* Impact Stats */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {impactStats.map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                  <div className="text-3xl font-bold text-amber-400 mb-1">{stat.value}</div>
                  <div className="text-stone-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Giving Section */}
      <section className="px-4 py-12 md:py-16 bg-stone-50">
        <div className="container mx-auto max-w-5xl">
          {/* Giving Type Selection */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-3">
              Choose How to Give
            </h2>
            <p className="text-stone-600">
              Select where you want your gift to make the biggest impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
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
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-lg'
                      : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                    isSelected ? 'bg-amber-500' : 'bg-stone-100'
                  }`}>
                    <Icon className={`h-7 w-7 ${isSelected ? 'text-white' : 'text-stone-500'}`} />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isSelected ? 'text-amber-700' : 'text-stone-900'}`}>
                    {option.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {option.description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Giving Form Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="grid lg:grid-cols-5">
              {/* Left Side - Form */}
              <div className="lg:col-span-3 p-8 md:p-10">
                {/* Frequency Toggle */}
                <div className="mb-8">
                  <Label className="text-sm font-semibold text-stone-700 mb-3 block">Giving Frequency</Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFrequency('once')}
                      className={`flex-1 py-3 px-6 rounded-xl border-2 font-semibold transition-all ${
                        frequency === 'once'
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
                      }`}
                    >
                      One-Time
                    </button>
                    <button
                      onClick={() => setFrequency('monthly')}
                      className={`flex-1 py-3 px-6 rounded-xl border-2 font-semibold transition-all ${
                        frequency === 'monthly'
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Amount Selection */}
                <div className="mb-8">
                  <Label className="text-sm font-semibold text-stone-700 mb-3 block">Select Amount</Label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {currentOption.suggestedAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountClick(amount)}
                        className={`py-4 px-4 rounded-xl border-2 font-bold text-lg transition-all ${
                          selectedAmount === amount && !customAmount
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                    <Input
                      type="number"
                      placeholder="Other amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="pl-11 h-14 text-lg bg-white border-stone-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  size="lg"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-16 text-xl rounded-xl shadow-lg shadow-amber-500/25"
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

                <div className="flex items-center justify-center gap-2 text-sm text-stone-500 mt-4">
                  <Shield className="h-4 w-4" />
                  Secure • Tax-deductible • 100% goes to Kenya mission
                </div>
              </div>

              {/* Right Side - Impact */}
              <div className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-stone-50 p-8 md:p-10 border-l border-stone-200">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <h3 className="font-bold text-stone-900">Your Impact</h3>
                </div>
                <div className="space-y-4">
                  {currentOption.impact.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-16 flex-shrink-0">
                        <span className="text-amber-600 font-bold text-sm">{item.amount}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-stone-700">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-stone-200">
                  <p className="text-sm text-stone-600 leading-relaxed">
                    <strong className="text-stone-900">TPC Ministries</strong> is a registered 501(c)(3). Your donation is tax-deductible and you will receive a receipt via email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trip Info Section */}
      <section className="px-4 py-16 bg-white border-t border-stone-200">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">
                About the Kenya Trip
              </h2>
              <p className="text-stone-600 mb-6 leading-relaxed">
                The Kenya Kingdom Impact Trip brings together believers from across America for 17 days of meaningful service in Nairobi, Mombasa, and Kakamega. Teams serve in ministry, education, medical outreach, business development, and food security initiatives.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'April 22 – May 8, 2026',
                  'Multiple service tracks based on your skills',
                  'Cultural immersion and safari experience',
                  'Scholarships available for qualified applicants',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/kenya#apply">
                  <Button className="bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 h-12 rounded-xl">
                    Apply for the Trip
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href="/images/kenya/Kenya-Kingdom-Impact-Trip-2026.pdf"
                  download
                  className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl border-2 border-stone-200 text-stone-700 font-semibold hover:border-amber-300 hover:bg-amber-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Trip Guide
                </a>
              </div>
            </div>

            {/* Trip Flier */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 to-transparent rounded-3xl blur-xl"></div>
              <div className="relative bg-stone-100 rounded-2xl p-4 border border-stone-200">
                <Image
                  src="/images/kenya/kenya-flier.png"
                  alt="Kenya Kingdom Impact Trip 2026"
                  width={400}
                  height={500}
                  className="rounded-xl shadow-lg w-full"
                />
                <a
                  href="/images/kenya/kenya-flier.png"
                  download="Kenya-Trip-2026-Flier.png"
                  className="mt-4 flex items-center justify-center gap-2 text-amber-600 hover:text-amber-700 transition-colors text-sm font-medium"
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
      <section className="px-4 py-12 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto max-w-3xl text-center">
          <h3 className="text-xl font-bold text-stone-900 mb-4">Other Ways to Give</h3>
          <p className="text-stone-600 mb-6">
            For check, wire transfer, or stock donations, or to sponsor a specific team member, contact us:
          </p>
          <a
            href="mailto:info@tpcmin.org?subject=Kenya%20Mission%20Giving"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold text-lg"
          >
            info@tpcmin.org
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-12 bg-gradient-to-r from-amber-500 to-amber-400">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-3">
            Every Gift Makes a Difference
          </h2>
          <p className="text-lg text-stone-800/80 mb-6 max-w-2xl mx-auto">
            Whether you give $25 or $2,500, your generosity sends teams, equips communities, and transforms lives in Kenya.
          </p>
          <p className="text-stone-900/70 italic">
            "Truly I tell you, whatever you did for one of the least of these brothers and sisters of mine, you did for me." — Matthew 25:40
          </p>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Globe, Users, DollarSign, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function GivingPage() {
  const [selectedAmount, setSelectedAmount] = useState<string>('50')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [givingType, setGivingType] = useState<'ministry' | 'missions' | 'leadership'>('ministry')
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <section className="relative bg-gradient-to-br from-tpc-navy via-tpc-navy/95 to-tpc-navy/90 px-4 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Heart className="h-4 w-4 text-tpc-gold" />
            <span className="text-tpc-gold text-sm font-medium">Partner With Us</span>
          </div>
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Give with Purpose
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Your generosity empowers lives, transforms communities, and advances God's kingdom across the globe.
          </p>
          <p className="text-tpc-gold italic text-lg">
            "Give, and it will be given to you... pressed down, shaken together and running over."
            <span className="block text-white/60 text-base mt-1 not-italic">— Luke 6:38</span>
          </p>
        </div>
      </section>

      {/* Mission Fields */}
      <section className="px-4 py-12 bg-gradient-to-r from-tpc-gold/10 via-white to-tpc-gold/10">
        <div className="container mx-auto max-w-4xl">
          <p className="text-center text-tpc-navy font-medium mb-6">Your giving reaches</p>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center p-4 rounded-xl bg-white shadow-sm">
              <div className="text-4xl md:text-5xl mb-2">🇰🇪</div>
              <p className="text-tpc-navy font-semibold">Kenya</p>
              <p className="text-xs md:text-sm text-slate-500">East Africa</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white shadow-sm">
              <div className="text-4xl md:text-5xl mb-2">🇿🇦</div>
              <p className="text-tpc-navy font-semibold">South Africa</p>
              <p className="text-xs md:text-sm text-slate-500">Southern Africa</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white shadow-sm">
              <div className="text-4xl md:text-5xl mb-2">🇬🇩</div>
              <p className="text-tpc-navy font-semibold">Grenada</p>
              <p className="text-xs md:text-sm text-slate-500">Caribbean</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Giving Section */}
      <section className="px-4 py-16 bg-stone-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Giving Options */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-tpc-navy">Choose Your Impact</CardTitle>
                  <CardDescription>Select where you'd like to direct your gift</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Giving Type Selection */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setGivingType('ministry')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        givingType === 'ministry'
                          ? 'border-tpc-navy bg-tpc-navy/5 shadow-md'
                          : 'border-stone-200 hover:border-tpc-navy/30'
                      }`}
                    >
                      <Heart className={`h-8 w-8 mb-3 mx-auto ${givingType === 'ministry' ? 'text-tpc-navy' : 'text-stone-400'}`} />
                      <h3 className="font-semibold text-tpc-navy mb-2">General Ministry</h3>
                      <p className="text-sm text-stone-600">Support our overall mission and operations</p>
                    </button>

                    <button
                      onClick={() => setGivingType('missions')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        givingType === 'missions'
                          ? 'border-tpc-gold bg-tpc-gold/10 shadow-md'
                          : 'border-stone-200 hover:border-tpc-gold/30'
                      }`}
                    >
                      <Globe className={`h-8 w-8 mb-3 mx-auto ${givingType === 'missions' ? 'text-tpc-gold-accent' : 'text-stone-400'}`} />
                      <h3 className="font-semibold text-tpc-navy mb-2">Global Missions</h3>
                      <p className="text-sm text-stone-600">Fund mission trips and international outreach</p>
                    </button>

                    <button
                      onClick={() => setGivingType('leadership')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        givingType === 'leadership'
                          ? 'border-tpc-navy bg-tpc-navy/5 shadow-md'
                          : 'border-stone-200 hover:border-tpc-navy/30'
                      }`}
                    >
                      <Users className={`h-8 w-8 mb-3 mx-auto ${givingType === 'leadership' ? 'text-tpc-navy' : 'text-stone-400'}`} />
                      <h3 className="font-semibold text-tpc-navy mb-2">Leadership Support</h3>
                      <p className="text-sm text-stone-600">Honor and support our ministry leaders</p>
                    </button>
                  </div>

                  {/* Frequency Selection */}
                  <div>
                    <Label className="text-base mb-3 block text-tpc-navy font-medium">Giving Frequency</Label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setFrequency('once')}
                        className={`flex-1 py-3 px-6 rounded-lg border-2 font-medium transition-all ${
                          frequency === 'once'
                            ? 'border-tpc-navy bg-tpc-navy text-white'
                            : 'border-stone-200 text-stone-700 hover:border-tpc-navy/30'
                        }`}
                      >
                        One-Time Gift
                      </button>
                      <button
                        onClick={() => setFrequency('monthly')}
                        className={`flex-1 py-3 px-6 rounded-lg border-2 font-medium transition-all ${
                          frequency === 'monthly'
                            ? 'border-tpc-navy bg-tpc-navy text-white'
                            : 'border-stone-200 text-stone-700 hover:border-tpc-navy/30'
                        }`}
                      >
                        Monthly Partner
                      </button>
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <Label className="text-base mb-3 block text-tpc-navy font-medium">Select Amount</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleAmountClick(amount)}
                          className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                            selectedAmount === amount && !customAmount
                              ? 'border-tpc-gold-accent bg-tpc-gold-accent text-white'
                              : 'border-stone-200 text-stone-700 hover:border-tpc-gold/50'
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
                          className="pl-10 h-12 text-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    size="lg"
                    className="w-full bg-tpc-gold-accent hover:bg-tpc-gold-accent/90 text-white h-14 text-lg font-bold"
                    disabled={!getCurrentAmount() || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? 'Processing...' : (frequency === 'monthly' ? 'Become a Monthly Partner' : 'Give')} ${getCurrentAmount() || '0'}
                    {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>

                  <p className="text-center text-sm text-stone-500">
                    🔒 Secure payment • Tax-deductible • 100% goes to your selected fund
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Impact Sidebar */}
            <div className="space-y-6">
              {/* Current Selection Impact */}
              <Card className="border-2 border-tpc-gold/30 bg-gradient-to-br from-white to-tpc-gold/5">
                <CardHeader>
                  <CardTitle className="text-lg text-tpc-navy flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-tpc-gold" />
                    Your Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {givingType === 'ministry' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-tpc-navy mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-stone-700">Fund transformative teachings and resources</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-tpc-navy mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-stone-700">Support community programs and events</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-tpc-navy mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-stone-700">Expand digital ministry platforms</p>
                      </div>
                    </>
                  )}
                  {givingType === 'missions' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-tpc-gold-accent mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-stone-700">Support mission teams in Kenya, South Africa & Grenada</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-tpc-gold-accent mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-stone-700">Provide resources to local communities</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-tpc-gold-accent mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-stone-700">Build sustainable ministry partnerships</p>
                      </div>
                    </>
                  )}
                  {givingType === 'leadership' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-tpc-navy mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-stone-700">Bless and honor our ministry leaders</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-tpc-navy mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-stone-700">Support leadership development</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-tpc-navy mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-stone-700">Enable greater ministry capacity</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Tax Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-tpc-navy">Tax Deductible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-600">
                    Your donation is tax-deductible to the full extent allowed by law. A receipt will be emailed to you.
                  </p>
                </CardContent>
              </Card>

              {/* Other Ways to Give */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-tpc-navy">Other Ways to Give</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-stone-600">
                    For check, wire transfer, or stock donations, email{' '}
                    <a href="mailto:info@tpcmin.org" className="text-tpc-gold-accent hover:underline font-medium">
                      info@tpcmin.org
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture Section */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-tpc-navy mb-8">The Heart of Giving</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="text-left border-l-4 border-l-tpc-gold">
              <CardContent className="pt-6">
                <p className="text-stone-700 italic mb-4">
                  "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                </p>
                <p className="text-tpc-navy font-semibold">2 Corinthians 9:7</p>
              </CardContent>
            </Card>
            <Card className="text-left border-l-4 border-l-tpc-gold">
              <CardContent className="pt-6">
                <p className="text-stone-700 italic mb-4">
                  "Honor the Lord with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing."
                </p>
                <p className="text-tpc-navy font-semibold">Proverbs 3:9-10</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-tpc-gold to-tpc-gold-accent">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-tpc-navy mb-4">
            Every Gift Makes a Difference
          </h2>
          <p className="text-xl text-tpc-navy/80 mb-6">
            Whether large or small, your generosity is multiplied to reach lives and transform communities.
          </p>
          <p className="text-lg text-tpc-navy/70 italic">
            Thank you for partnering with us in advancing God's Kingdom.
          </p>
        </div>
      </section>
    </div>
  )
}

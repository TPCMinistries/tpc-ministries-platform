'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Globe, Users, DollarSign, CheckCircle, ArrowRight } from 'lucide-react'

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
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Give with Purpose
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your generosity empowers lives, transforms communities, and advances God's kingdom across the globe
          </p>
        </div>
      </section>

      {/* Mission Fields */}
      <section className="px-4 py-12 bg-white border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl mb-2">🇰🇪</div>
              <p className="text-gray-600 font-semibold">Kenya</p>
              <p className="text-sm text-gray-500">East Africa Missions</p>
            </div>
            <div>
              <div className="text-5xl mb-2">🇿🇦</div>
              <p className="text-gray-600 font-semibold">South Africa</p>
              <p className="text-sm text-gray-500">Southern Africa Missions</p>
            </div>
            <div>
              <div className="text-5xl mb-2">🇬🇩</div>
              <p className="text-gray-600 font-semibold">Grenada</p>
              <p className="text-sm text-gray-500">Caribbean Missions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Giving Section */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Giving Options */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-navy">Choose Your Impact</CardTitle>
                  <CardDescription>Select where you'd like to direct your gift</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Giving Type Selection */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setGivingType('ministry')}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        givingType === 'ministry'
                          ? 'border-navy bg-navy/5'
                          : 'border-gray-200 hover:border-navy/30'
                      }`}
                    >
                      <Heart className={`h-8 w-8 mb-3 mx-auto ${givingType === 'ministry' ? 'text-navy' : 'text-gray-400'}`} />
                      <h3 className="font-semibold text-navy mb-2">General Ministry</h3>
                      <p className="text-sm text-gray-600">Support our overall mission and operations</p>
                    </button>

                    <button
                      onClick={() => setGivingType('missions')}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        givingType === 'missions'
                          ? 'border-gold bg-gold/5'
                          : 'border-gray-200 hover:border-gold/30'
                      }`}
                    >
                      <Globe className={`h-8 w-8 mb-3 mx-auto ${givingType === 'missions' ? 'text-gold' : 'text-gray-400'}`} />
                      <h3 className="font-semibold text-navy mb-2">Global Missions</h3>
                      <p className="text-sm text-gray-600">Fund mission trips and international outreach</p>
                    </button>

                    <button
                      onClick={() => setGivingType('leadership')}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        givingType === 'leadership'
                          ? 'border-navy bg-navy/5'
                          : 'border-gray-200 hover:border-navy/30'
                      }`}
                    >
                      <Users className={`h-8 w-8 mb-3 mx-auto ${givingType === 'leadership' ? 'text-navy' : 'text-gray-400'}`} />
                      <h3 className="font-semibold text-navy mb-2">Leadership Support</h3>
                      <p className="text-sm text-gray-600">Honor and support our ministry leaders</p>
                    </button>
                  </div>

                  {/* Frequency Selection */}
                  <div>
                    <Label className="text-base mb-3 block">Giving Frequency</Label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setFrequency('once')}
                        className={`flex-1 py-3 px-6 rounded-lg border-2 font-medium transition-all ${
                          frequency === 'once'
                            ? 'border-navy bg-navy text-white'
                            : 'border-gray-200 text-gray-700 hover:border-navy/30'
                        }`}
                      >
                        One-Time Gift
                      </button>
                      <button
                        onClick={() => setFrequency('monthly')}
                        className={`flex-1 py-3 px-6 rounded-lg border-2 font-medium transition-all ${
                          frequency === 'monthly'
                            ? 'border-navy bg-navy text-white'
                            : 'border-gray-200 text-gray-700 hover:border-navy/30'
                        }`}
                      >
                        Monthly Gift
                      </button>
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <Label className="text-base mb-3 block">Select Amount</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleAmountClick(amount)}
                          className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                            selectedAmount === amount && !customAmount
                              ? 'border-gold bg-gold text-white'
                              : 'border-gray-200 text-gray-700 hover:border-gold/30'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                    <div>
                      <Label htmlFor="custom-amount" className="text-sm text-gray-600 mb-2 block">
                        Or enter a custom amount
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                    className="w-full bg-navy hover:bg-navy/90 h-14 text-lg"
                    disabled={!getCurrentAmount() || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? 'Processing...' : (frequency === 'monthly' ? 'Set Up Monthly Gift' : 'Give')} ${getCurrentAmount() || '0'}
                    {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>

                  <p className="text-center text-sm text-gray-500">
                    🔒 Secure payment processing • Tax-deductible • 100% goes to your selected fund
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Impact Sidebar */}
            <div className="space-y-6">
              {/* Current Selection Impact */}
              <Card className="border-2 border-gold/20">
                <CardHeader>
                  <CardTitle className="text-lg">Your Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {givingType === 'ministry' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-navy mt-0.5" />
                        <p className="text-sm text-gray-700">Fund transformative teachings and resources</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-navy mt-0.5" />
                        <p className="text-sm text-gray-700">Support community programs and events</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-navy mt-0.5" />
                        <p className="text-sm text-gray-700">Expand digital ministry platforms</p>
                      </div>
                    </>
                  )}
                  {givingType === 'missions' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-gold mt-0.5" />
                        <p className="text-sm text-gray-700">Support mission teams in Kenya, South Africa, and Grenada</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-gold mt-0.5" />
                        <p className="text-sm text-gray-700">Provide resources to local communities</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-gold mt-0.5" />
                        <p className="text-sm text-gray-700">Build sustainable ministry partnerships</p>
                      </div>
                    </>
                  )}
                  {givingType === 'leadership' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-navy mt-0.5" />
                        <p className="text-sm text-gray-700">Bless and honor our ministry leaders</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-navy mt-0.5" />
                        <p className="text-sm text-gray-700">Support leadership development and training</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-navy mt-0.5" />
                        <p className="text-sm text-gray-700">Enable greater ministry capacity</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Tax Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tax Deductible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    TPC Ministries is a 501(c)(3) non-profit organization. Your donation is tax-deductible to the full extent allowed by law. Tax ID: XX-XXXXXXX
                  </p>
                </CardContent>
              </Card>

              {/* Other Ways to Give */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Other Ways to Give</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-navy mb-1">By Check</p>
                    <p className="text-gray-600">Mail to: TPC Ministries<br />PO Box [Address]<br />City, State ZIP</p>
                  </div>
                  <div>
                    <p className="font-medium text-navy mb-1">Bank Transfer</p>
                    <p className="text-gray-600">Contact us for wire transfer details</p>
                  </div>
                  <div>
                    <p className="font-medium text-navy mb-1">Stock Donations</p>
                    <p className="text-gray-600">Gift appreciated securities tax-efficiently</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-navy mb-12 text-center">Stories of Impact</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-navy">MK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">Mary K.</p>
                    <p className="text-sm text-gray-600">Kenya Mission Partner</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Because of your generosity, we were able to build a clean water well that now serves over 500 families in our village. This ministry is truly changing lives."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gold">JT</span>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">James T.</p>
                    <p className="text-sm text-gray-600">Monthly Partner</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Giving monthly allows me to be part of something bigger. It's amazing to see how consistent support multiplies impact across communities."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-navy to-navy-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Every Gift Makes a Difference
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Whether large or small, your generosity is multiplied to reach lives and transform communities
          </p>
          <p className="text-lg text-gold font-medium">
            "Give, and it will be given to you... For with the measure you use, it will be measured to you." - Luke 6:38
          </p>
        </div>
      </section>
    </div>
  )
}

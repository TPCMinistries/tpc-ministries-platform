'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Heart, Globe, Users, DollarSign, CheckCircle, ArrowRight, MapPin } from 'lucide-react'

function MissionsSupportContent() {
  const searchParams = useSearchParams()
  const regionParam = searchParams.get('region')

  const [selectedAmount, setSelectedAmount] = useState<string>('100')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'kenya' | 'south-africa' | 'grenada'>('all')
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')

  // Pre-select region from URL parameter
  useEffect(() => {
    if (regionParam && ['all', 'kenya', 'south-africa', 'grenada'].includes(regionParam)) {
      setSelectedRegion(regionParam as 'all' | 'kenya' | 'south-africa' | 'grenada')
    }
  }, [regionParam])

  const quickAmounts = ['50', '100', '250', '500', '1000', '2500']

  const regions = [
    { value: 'all', label: 'All Missions', flag: '🌍', description: 'Support all mission fields' },
    { value: 'kenya', label: 'Kenya', flag: '🇰🇪', description: 'East Africa outreach' },
    { value: 'south-africa', label: 'South Africa', flag: '🇿🇦', description: 'Southern Africa impact' },
    { value: 'grenada', label: 'Grenada', flag: '🇬🇩', description: 'Caribbean missions' },
  ]

  const handleAmountClick = (amount: string) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount('')
  }

  const getCurrentAmount = () => customAmount || selectedAmount

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Support Global Missions
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your partnership brings hope, healing, and transformation to communities across Kenya, South Africa, and Grenada
          </p>
        </div>
      </section>

      {/* Mission Fields */}
      <section className="px-4 py-12 bg-white border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-navy mb-2">🇰🇪</div>
              <p className="text-gray-600 font-semibold">Kenya</p>
              <p className="text-sm text-gray-500">East Africa</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gold mb-2">🇿🇦</div>
              <p className="text-gray-600 font-semibold">South Africa</p>
              <p className="text-sm text-gray-500">Southern Africa</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-navy mb-2">🇬🇩</div>
              <p className="text-gray-600 font-semibold">Grenada</p>
              <p className="text-sm text-gray-500">Caribbean</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Giving Section */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Giving Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-navy">Choose Your Mission Impact</CardTitle>
                  <CardDescription>Select which region(s) to support</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Region Selection */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {regions.map((region) => (
                      <button
                        key={region.value}
                        onClick={() => setSelectedRegion(region.value as any)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedRegion === region.value
                            ? 'border-navy bg-navy/5'
                            : 'border-gray-200 hover:border-navy/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{region.flag}</span>
                          <h3 className="font-semibold text-navy">{region.label}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{region.description}</p>
                      </button>
                    ))}
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
                        Monthly Partner
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
                  <Link href="/giving">
                    <Button
                      size="lg"
                      className="w-full bg-navy hover:bg-navy/90 h-14 text-lg"
                      disabled={!getCurrentAmount()}
                    >
                      {frequency === 'monthly' ? 'Become a Monthly Partner' : 'Support Missions'} ${getCurrentAmount() || '0'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <p className="text-center text-sm text-gray-500">
                    🔒 Secure payment • Tax-deductible • 100% goes to missions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Impact Sidebar */}
            <div className="space-y-6">
              {/* Your Impact */}
              <Card className="border-2 border-gold/20">
                <CardHeader>
                  <CardTitle className="text-lg">Your Mission Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-navy mt-0.5" />
                    <p className="text-sm text-gray-700">Provide clean water and essential resources</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-navy mt-0.5" />
                    <p className="text-sm text-gray-700">Support local church leaders and training</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-navy mt-0.5" />
                    <p className="text-sm text-gray-700">Fund community development projects</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-navy mt-0.5" />
                    <p className="text-sm text-gray-700">Enable mission trips and outreach</p>
                  </div>
                </CardContent>
              </Card>

              {/* Partnership Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Partnership with GDI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Your support partners with The Global Development Institute and Enterprise to create sustainable, long-term impact.
                  </p>
                  <Link href="/missions">
                    <Button variant="outline" size="sm" className="w-full">
                      Learn About Our Missions
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Monthly Partner Benefits */}
              <Card className="bg-navy text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Partner Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <p>Exclusive mission field updates</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <p>Impact reports and stories</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <p>Prayer requests from the field</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold">✓</span>
                    <p>Invitation to special events</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-navy to-navy-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Transform Lives Across Nations
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Your generosity brings the Gospel, hope, and practical help to communities in need
          </p>
          <p className="text-lg text-gold font-medium">
            "The harvest is plentiful, but the workers are few..." - Matthew 9:37
          </p>
        </div>
      </section>
    </div>
  )
}

export default function MissionsSupportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MissionsSupportContent />
    </Suspense>
  )
}

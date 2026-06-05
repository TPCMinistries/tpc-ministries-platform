'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { DollarSign, CheckCircle, ArrowRight } from 'lucide-react'

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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Give Generously</p>
          <h1 className="mb-6 font-display text-display-xl text-white md:text-display-2xl">
            Support Global Missions
          </h1>
          <p className="mx-auto max-w-3xl text-body-xl text-white/65">
            Your partnership funds US digital ministry, on-the-ground missions in Kenya, South Africa, and Grenada, and the global online community we&rsquo;re building.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Mission Fields */}
      <section className="border-b border-border bg-background px-4 py-section-sm">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold text-foreground">🇰🇪</div>
              <p className="font-semibold text-foreground">Kenya</p>
              <p className="text-body-sm text-muted-foreground">East Africa</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-gold">🇿🇦</div>
              <p className="font-semibold text-foreground">South Africa</p>
              <p className="text-body-sm text-muted-foreground">Southern Africa</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-foreground">🇬🇩</div>
              <p className="font-semibold text-foreground">Grenada</p>
              <p className="text-body-sm text-muted-foreground">Caribbean</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Giving Section */}
      <section className="bg-secondary px-4 py-section">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Giving Form */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-3xl border border-border bg-card p-8">
                <div className="mb-6">
                  <p className="mb-2 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">Designate Your Gift</p>
                  <h2 className="font-display text-display-sm text-foreground">Choose Your Mission Impact</h2>
                  <p className="mt-2 text-body-md text-muted-foreground">Select which region(s) to support</p>
                </div>

                <div className="space-y-6">
                  {/* Region Selection */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {regions.map((region) => (
                      <button
                        key={region.value}
                        onClick={() => setSelectedRegion(region.value as typeof selectedRegion)}
                        className={`rounded-2xl border-2 p-4 text-left transition-all ${
                          selectedRegion === region.value
                            ? 'border-gold bg-gold/5'
                            : 'border-border hover:border-gold/30'
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-3">
                          <span className="text-3xl">{region.flag}</span>
                          <h3 className="font-semibold text-foreground">{region.label}</h3>
                        </div>
                        <p className="text-body-sm text-muted-foreground">{region.description}</p>
                      </button>
                    ))}
                  </div>

                  {/* Frequency Selection */}
                  <div>
                    <Label className="mb-3 block text-body-md font-semibold text-foreground">Giving Frequency</Label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setFrequency('once')}
                        className={`flex-1 rounded-xl border-2 px-6 py-3 font-medium transition-all ${
                          frequency === 'once'
                            ? 'border-gold bg-gold text-navy'
                            : 'border-border text-muted-foreground hover:border-gold/30'
                        }`}
                      >
                        One-Time Gift
                      </button>
                      <button
                        onClick={() => setFrequency('monthly')}
                        className={`flex-1 rounded-xl border-2 px-6 py-3 font-medium transition-all ${
                          frequency === 'monthly'
                            ? 'border-gold bg-gold text-navy'
                            : 'border-border text-muted-foreground hover:border-gold/30'
                        }`}
                      >
                        Monthly Partner
                      </button>
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <Label className="mb-3 block text-body-md font-semibold text-foreground">Select Amount</Label>
                    <div className="mb-4 grid grid-cols-3 gap-3 md:grid-cols-6">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleAmountClick(amount)}
                          className={`rounded-xl border-2 px-4 py-3 font-semibold transition-all ${
                            selectedAmount === amount && !customAmount
                              ? 'border-gold bg-gold text-navy'
                              : 'border-border text-muted-foreground hover:border-gold/30'
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
                          className="h-12 rounded-xl border-border pl-10 text-body-lg focus:border-gold focus:ring-gold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Link href="/giving">
                    <Button
                      size="lg"
                      className="h-14 w-full bg-gold text-body-lg font-bold text-navy hover:bg-gold-300"
                      disabled={!getCurrentAmount()}
                    >
                      {frequency === 'monthly' ? 'Become a Monthly Partner' : 'Support Missions'} ${getCurrentAmount() || '0'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <p className="text-center text-body-sm text-muted-foreground">
                    Secure payment - Tax-deductible - 100% goes to missions
                  </p>
                </div>
              </div>
            </div>

            {/* Impact Sidebar */}
            <div className="space-y-6">
              {/* Your Impact */}
              <div className="rounded-2xl border-2 border-gold/20 bg-card p-6">
                <h3 className="mb-4 font-display text-display-xs text-foreground">Your Mission Impact</h3>
                <div className="space-y-4">
                  {[
                    'Provide clean water and essential resources',
                    'Support local church leaders and training',
                    'Fund community development projects',
                    'Enable mission trips and outreach',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 text-gold" />
                      <p className="text-body-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partnership Info */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 font-display text-display-xs text-foreground">Partnership with GDI</h3>
                <p className="mb-3 text-body-sm text-muted-foreground">
                  Your support partners with The Global Development Institute and Enterprise to create sustainable, long-term impact.
                </p>
                <Link href="/missions">
                  <Button variant="outline" size="sm" className="w-full border-border">
                    Learn About Our Missions
                  </Button>
                </Link>
              </div>

              {/* Monthly Partner Benefits */}
              <div className="rounded-2xl border border-white/10 bg-navy p-6 text-white dark:bg-navy-950">
                <h3 className="mb-4 font-display text-display-xs text-white">Monthly Partner Benefits</h3>
                <div className="space-y-3 text-body-sm">
                  {[
                    'Exclusive mission field updates',
                    'Impact reports and stories',
                    'Prayer requests from the field',
                    'Invitation to special events',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-gold" />
                      <p className="text-white/80">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-navy-950 px-4 py-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Eternal Impact</p>
          <h2 className="mb-4 font-display text-display-md text-white md:text-display-lg">
            Transform Lives Across Nations
          </h2>
          <p className="mb-8 text-body-xl text-white/50">
            Your generosity brings the Gospel, hope, and practical help to communities in need
          </p>
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          <p className="font-serif text-body-lg italic text-gold/60">
            &ldquo;The harvest is plentiful, but the workers are few...&rdquo; - Matthew 9:37
          </p>
        </div>
      </section>
    </div>
  )
}

export default function MissionsSupportPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <MissionsSupportContent />
    </Suspense>
  )
}

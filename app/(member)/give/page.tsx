'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Heart,
  DollarSign,
  Calendar,
  CreditCard,
  TrendingUp,
  Gift,
  Users,
  BookOpen,
  Home as HomeIcon
} from 'lucide-react'

export default function GivePage() {
  const [amount, setAmount] = useState('')
  const [selectedFund, setSelectedFund] = useState<'general' | 'missions' | 'leadership'>('general')
  const [selectedFrequency, setSelectedFrequency] = useState<'once' | 'monthly' | 'yearly'>('once')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quickAmounts = [25, 50, 100, 250, 500, 1000]

  const givingHistory = [
    { id: 1, amount: 100, date: '2024-01-15', type: 'Monthly', fund: 'General' },
    { id: 2, amount: 250, date: '2024-01-01', type: 'One-time', fund: 'Missions' },
    { id: 3, amount: 100, date: '2023-12-15', type: 'Monthly', fund: 'General' },
  ]

  const impactStats = {
    total_given: 1250,
    months_giving: 6,
    lives_impacted: 45,
    content_supported: 12
  }

  const funds = [
    {
      id: 'general',
      name: 'General Fund',
      description: 'Support all aspects of our ministry',
      icon: HomeIcon,
      color: 'text-navy'
    },
    {
      id: 'missions',
      name: 'Missions & Outreach',
      description: 'Fund global missions and local outreach',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 'content',
      name: 'Content Creation',
      description: 'Support new teachings and resources',
      icon: BookOpen,
      color: 'text-purple-600'
    },
    {
      id: 'building',
      name: 'Building Fund',
      description: 'Invest in facilities and infrastructure',
      icon: HomeIcon,
      color: 'text-green-600'
    },
  ]

  const handleGive = async () => {
    const donationAmount = parseFloat(amount)

    if (!donationAmount || donationAmount < 1) {
      setError('Please enter a valid amount (minimum $1)')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Map yearly to monthly for Stripe (yearly isn't supported in current API)
      const frequency = selectedFrequency === 'yearly' ? 'once' : selectedFrequency

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: donationAmount,
          type: selectedFund,
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
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Donation error:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy mb-2">Give</h1>
        <p className="text-gray-600">Support the ministry through your generosity</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Giving Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Make a Donation
              </CardTitle>
              <CardDescription>Your generosity makes a difference</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Frequency Selection */}
              <div>
                <Label className="mb-3 block">Giving Frequency</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={selectedFrequency === 'once' ? 'default' : 'outline'}
                    onClick={() => setSelectedFrequency('once')}
                    className="w-full"
                  >
                    One-Time
                  </Button>
                  <Button
                    variant={selectedFrequency === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setSelectedFrequency('monthly')}
                    className="w-full"
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={selectedFrequency === 'yearly' ? 'default' : 'outline'}
                    onClick={() => setSelectedFrequency('yearly')}
                    className="w-full"
                  >
                    Yearly
                  </Button>
                </div>
              </div>

              {/* Quick Amount Selection */}
              <div>
                <Label className="mb-3 block">Select Amount</Label>
                <div className="grid grid-cols-3 gap-3">
                  {quickAmounts.map((amt) => (
                    <Button
                      key={amt}
                      variant={amount === amt.toString() ? 'default' : 'outline'}
                      onClick={() => setAmount(amt.toString())}
                      className="w-full"
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <Label htmlFor="amount">Or Enter Custom Amount</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Fund Selection */}
              <div>
                <Label className="mb-3 block">Select Fund</Label>
                <div className="grid gap-3">
                  {funds.map((fund) => (
                    <div
                      key={fund.id}
                      onClick={() => setSelectedFund(fund.id as 'general' | 'missions' | 'leadership')}
                      className={`flex items-start gap-3 p-4 border rounded-lg hover:border-navy cursor-pointer transition-colors ${selectedFund === fund.id ? 'border-navy bg-navy/5' : ''}`}
                    >
                      <fund.icon className={`h-5 w-5 ${fund.color} mt-0.5`} />
                      <div className="flex-1">
                        <p className="font-semibold text-navy">{fund.name}</p>
                        <p className="text-sm text-gray-600">{fund.description}</p>
                      </div>
                      <input type="radio" name="fund" checked={selectedFund === fund.id} readOnly />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="mb-3 block">Payment Method</Label>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Credit/Debit Card
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGive}
                disabled={!amount || loading}
                className="w-full bg-navy hover:bg-navy/90"
                size="lg"
              >
                {loading ? 'Processing...' : `Give $${amount || '0'} ${selectedFrequency === 'once' ? '' : selectedFrequency}`}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Your donation is tax-deductible. You will receive a receipt via email.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Impact Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Your Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Given</span>
                <span className="text-lg font-bold text-navy">${impactStats.total_given.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Months Giving</span>
                <Badge variant="outline">{impactStats.months_giving}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lives Impacted</span>
                <Badge variant="outline">{impactStats.lives_impacted}+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Content Supported</span>
                <Badge variant="outline">{impactStats.content_supported}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Become a Partner */}
          <Card className="bg-gradient-to-br from-navy to-blue-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="h-5 w-5" />
                Become a Partner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-100">
                Join our partnership program for exclusive benefits and deeper involvement in ministry.
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => window.location.href = '/partner'}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Giving History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-navy" />
            Giving History
          </CardTitle>
          <CardDescription>Your recent donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Fund</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {givingHistory.map((donation) => (
                  <tr key={donation.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{new Date(donation.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-navy">${donation.amount}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{donation.type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{donation.fund}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">Download</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

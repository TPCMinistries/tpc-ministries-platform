'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, Heart, Globe, Users, TrendingUp, Download, Calendar } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface GivingHistory {
  id: string
  amount: number
  type: 'general' | 'missions' | 'leadership'
  date: string
  recurring: boolean
}

export default function GivingPage() {
  const [givingHistory, setGivingHistory] = useState<GivingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAmount, setSelectedAmount] = useState<string>('50')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [givingType, setGivingType] = useState<'general' | 'missions' | 'leadership'>('general')
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')

  useEffect(() => {
    fetchGivingHistory()
  }, [])

  const fetchGivingHistory = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching giving history:', error)
      } else if (data) {
        setGivingHistory(
          data.map((donation: any) => ({
            id: donation.id,
            amount: Number(donation.amount),
            type: donation.type,
            date: donation.created_at,
            recurring: donation.frequency === 'monthly',
          }))
        )
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = ['25', '50', '100', '250', '500']

  const handleAmountClick = (amount: string) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount('')
  }

  const getCurrentAmount = () => customAmount || selectedAmount

  const totalGiven = givingHistory.reduce((sum, item) => sum + item.amount, 0)
  const thisYearGiven = givingHistory.filter(item => {
    const itemDate = new Date(item.date)
    const currentYear = new Date().getFullYear()
    return itemDate.getFullYear() === currentYear
  }).reduce((sum, item) => sum + item.amount, 0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'general':
        return 'General Ministry'
      case 'missions':
        return 'Global Missions'
      case 'leadership':
        return 'Leadership Support'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy">Giving</h1>
        <p className="text-gray-600 mt-1">Support the ministry and track your giving history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">${totalGiven.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${thisYearGiven.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{givingHistory.length}</div>
            <p className="text-xs text-gray-600 mt-1">completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="give" className="space-y-6">
        <TabsList>
          <TabsTrigger value="give">Give Now</TabsTrigger>
          <TabsTrigger value="history">Giving History</TabsTrigger>
        </TabsList>

        <TabsContent value="give" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-navy">Make a Contribution</CardTitle>
                  <CardDescription>Select where you'd like to direct your gift</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Giving Type Selection */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setGivingType('general')}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        givingType === 'general'
                          ? 'border-navy bg-navy/5'
                          : 'border-gray-200 hover:border-navy/30'
                      }`}
                    >
                      <Heart className={`h-8 w-8 mb-3 mx-auto ${givingType === 'general' ? 'text-navy' : 'text-gray-400'}`} />
                      <h3 className="font-semibold text-navy mb-2">General Ministry</h3>
                      <p className="text-sm text-gray-600">Support overall mission</p>
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
                      <p className="text-sm text-gray-600">Fund international outreach</p>
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
                      <p className="text-sm text-gray-600">Honor ministry leaders</p>
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
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
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
                  <Button
                    size="lg"
                    className="w-full bg-navy hover:bg-navy/90 h-14 text-lg"
                    disabled={!getCurrentAmount()}
                  >
                    {frequency === 'monthly' ? 'Set Up Monthly Gift' : 'Give'} ${getCurrentAmount() || '0'}
                  </Button>

                  <p className="text-center text-sm text-gray-500">
                    🔒 Secure payment • Tax-deductible • 100% goes to selected fund
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Impact Sidebar */}
            <div className="space-y-6">
              <Card className="border-2 border-gold/20">
                <CardHeader>
                  <CardTitle className="text-lg">Impact of Your Giving</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">
                    Your generous support enables us to:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-navy">•</span>
                      Spread the Gospel globally
                    </li>
                    <li className="flex gap-2">
                      <span className="text-navy">•</span>
                      Provide transformative teachings
                    </li>
                    <li className="flex gap-2">
                      <span className="text-navy">•</span>
                      Support community programs
                    </li>
                    <li className="flex gap-2">
                      <span className="text-navy">•</span>
                      Expand digital ministry
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tax Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    TPC Ministries is a 501(c)(3) non-profit. Your donation is tax-deductible to the full extent allowed by law.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {givingHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center mb-4">No giving history yet.</p>
                <Button onClick={() => {}} className="bg-navy hover:bg-navy/90">
                  Make Your First Gift
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-navy">Your Giving History</h2>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Statement
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {givingHistory.map((gift) => (
                      <div key={gift.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-navy">{getTypeLabel(gift.type)}</p>
                              {gift.recurring && (
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Recurring
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{formatDate(gift.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-navy">${gift.amount}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DollarSign,
  Heart,
  Globe,
  Users,
  TrendingUp,
  Download,
  Calendar,
  Target,
  Gift,
  Repeat,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ChevronRight,
  PieChart,
  BarChart3,
  Sparkles,
  Award
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface GivingHistory {
  id: string
  amount: number
  fund_id?: string
  fund_name?: string
  date: string
  recurring: boolean
  status: string
}

interface GivingFund {
  id: string
  name: string
  description: string
  goal_amount?: number
  current_amount: number
  category: string
  is_featured: boolean
}

interface RecurringGift {
  id: string
  fund_id: string
  fund_name: string
  amount: number
  frequency: string
  next_date: string
  status: string
}

interface GivingPledge {
  id: string
  fund_id: string
  fund_name: string
  pledge_amount: number
  amount_fulfilled: number
  start_date: string
  end_date: string
  status: string
}

interface GivingGoal {
  id: string
  year: number
  monthly_goal: number
  annual_goal: number
}

export default function EnhancedGivingPage() {
  const [givingHistory, setGivingHistory] = useState<GivingHistory[]>([])
  const [funds, setFunds] = useState<GivingFund[]>([])
  const [recurringGifts, setRecurringGifts] = useState<RecurringGift[]>([])
  const [pledges, setPledges] = useState<GivingPledge[]>([])
  const [givingGoal, setGivingGoal] = useState<GivingGoal | null>(null)
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)

  // Form state
  const [selectedAmount, setSelectedAmount] = useState<string>('50')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [selectedFund, setSelectedFund] = useState<string>('')
  const [frequency, setFrequency] = useState<'once' | 'weekly' | 'biweekly' | 'monthly'>('once')
  const [showGoalEditor, setShowGoalEditor] = useState(false)
  const [newMonthlyGoal, setNewMonthlyGoal] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get member
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (member) {
        setMemberId(member.id)

        // Fetch donations
        const { data: donations } = await supabase
          .from('donations')
          .select(`
            *,
            fund:giving_funds(name)
          `)
          .eq('member_id', member.id)
          .order('created_at', { ascending: false })

        if (donations) {
          setGivingHistory(
            donations.map((d: any) => ({
              id: d.id,
              amount: Number(d.amount),
              fund_id: d.fund_id,
              fund_name: d.fund?.name || 'General',
              date: d.created_at,
              recurring: d.is_recurring,
              status: d.status
            }))
          )
        }

        // Fetch recurring gifts
        const { data: recurring } = await supabase
          .from('recurring_donations')
          .select(`
            *,
            fund:giving_funds(name)
          `)
          .eq('member_id', member.id)
          .eq('status', 'active')

        if (recurring) {
          setRecurringGifts(
            recurring.map((r: any) => ({
              id: r.id,
              fund_id: r.fund_id,
              fund_name: r.fund?.name || 'General',
              amount: Number(r.amount),
              frequency: r.frequency,
              next_date: r.next_charge_date,
              status: r.status
            }))
          )
        }

        // Fetch pledges
        const { data: pledgeData } = await supabase
          .from('giving_pledges')
          .select(`
            *,
            fund:giving_funds(name)
          `)
          .eq('member_id', member.id)
          .in('status', ['active', 'on_track'])

        if (pledgeData) {
          setPledges(
            pledgeData.map((p: any) => ({
              id: p.id,
              fund_id: p.fund_id,
              fund_name: p.fund?.name || 'General',
              pledge_amount: Number(p.pledge_amount),
              amount_fulfilled: Number(p.amount_fulfilled),
              start_date: p.start_date,
              end_date: p.end_date,
              status: p.status
            }))
          )
        }

        // Fetch giving goal
        const currentYear = new Date().getFullYear()
        const { data: goal } = await supabase
          .from('giving_goals')
          .select('*')
          .eq('member_id', member.id)
          .eq('year', currentYear)
          .single()

        if (goal) {
          setGivingGoal({
            id: goal.id,
            year: goal.year,
            monthly_goal: Number(goal.monthly_goal),
            annual_goal: Number(goal.annual_goal)
          })
        }
      }

      // Fetch funds
      const { data: fundsData } = await supabase
        .from('giving_funds')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })

      if (fundsData) {
        setFunds(fundsData as any)
        if (fundsData.length > 0 && !selectedFund) {
          setSelectedFund(fundsData[0].id)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveGoal = async () => {
    if (!memberId || !newMonthlyGoal) return

    const supabase = createClient()
    const currentYear = new Date().getFullYear()
    const monthlyAmount = parseFloat(newMonthlyGoal)
    const annualAmount = monthlyAmount * 12

    if (givingGoal) {
      await supabase
        .from('giving_goals')
        .update({
          monthly_goal: monthlyAmount,
          annual_goal: annualAmount
        })
        .eq('id', givingGoal.id)
    } else {
      await supabase
        .from('giving_goals')
        .insert({
          member_id: memberId,
          year: currentYear,
          monthly_goal: monthlyAmount,
          annual_goal: annualAmount
        })
    }

    setShowGoalEditor(false)
    fetchData()
  }

  const cancelRecurring = async (id: string) => {
    const supabase = createClient()
    await supabase
      .from('recurring_donations')
      .update({ status: 'cancelled' })
      .eq('id', id)
    fetchData()
  }

  const quickAmounts = ['25', '50', '100', '250', '500', '1000']

  const handleAmountClick = (amount: string) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const getCurrentAmount = () => customAmount || selectedAmount

  // Calculate stats
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const thisYearGiving = givingHistory
    .filter(g => new Date(g.date).getFullYear() === currentYear)
    .reduce((sum, g) => sum + g.amount, 0)

  const thisMonthGiving = givingHistory
    .filter(g => {
      const d = new Date(g.date)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    })
    .reduce((sum, g) => sum + g.amount, 0)

  const monthlyRecurringTotal = recurringGifts
    .filter(r => r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.amount, 0)

  const totalGiven = givingHistory.reduce((sum, g) => sum + g.amount, 0)

  // Progress calculations
  const annualGoalProgress = givingGoal
    ? Math.min(100, (thisYearGiving / givingGoal.annual_goal) * 100)
    : 0

  const monthlyGoalProgress = givingGoal
    ? Math.min(100, (thisMonthGiving / givingGoal.monthly_goal) * 100)
    : 0

  // Giving by fund
  const givingByFund = givingHistory.reduce((acc: Record<string, number>, g) => {
    const fundName = g.fund_name || 'General'
    acc[fundName] = (acc[fundName] || 0) + g.amount
    return acc
  }, {})

  // Monthly giving trend (last 6 months)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const month = d.getMonth()
    const year = d.getFullYear()

    const total = givingHistory
      .filter(g => {
        const gd = new Date(g.date)
        return gd.getMonth() === month && gd.getFullYear() === year
      })
      .reduce((sum, g) => sum + g.amount, 0)

    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      amount: total
    }
  })

  const maxTrend = Math.max(...monthlyTrend.map(t => t.amount), 1)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="h-8 w-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">My Giving</h1>
          </div>
          <p className="text-gray-600">
            Track your generosity and manage your giving to TPC Ministries
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-navy to-navy/80 text-white">
            <CardContent className="p-4">
              <DollarSign className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">${thisYearGiving.toLocaleString()}</p>
              <p className="text-xs opacity-80">This Year</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gold to-amber-500 text-navy">
            <CardContent className="p-4">
              <Calendar className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">${thisMonthGiving.toLocaleString()}</p>
              <p className="text-xs opacity-80">This Month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <Repeat className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">${monthlyRecurringTotal.toLocaleString()}</p>
              <p className="text-xs opacity-80">Monthly Recurring</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <Award className="h-6 w-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">${totalGiven.toLocaleString()}</p>
              <p className="text-xs opacity-80">Lifetime Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress */}
        {(givingGoal || showGoalEditor) && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-navy" />
                  {currentYear} Giving Goals
                </CardTitle>
                {!showGoalEditor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNewMonthlyGoal(givingGoal?.monthly_goal.toString() || '')
                      setShowGoalEditor(true)
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showGoalEditor ? (
                <div className="space-y-4">
                  <div>
                    <Label>Monthly Giving Goal</Label>
                    <div className="flex gap-2 mt-1">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="Enter monthly goal"
                          value={newMonthlyGoal}
                          onChange={(e) => setNewMonthlyGoal(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Button onClick={saveGoal} className="bg-navy hover:bg-navy/90">
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setShowGoalEditor(false)}>
                        Cancel
                      </Button>
                    </div>
                    {newMonthlyGoal && (
                      <p className="text-sm text-gray-500 mt-1">
                        Annual goal: ${(parseFloat(newMonthlyGoal) * 12).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : givingGoal ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Monthly Progress</span>
                      <span className="font-medium">
                        ${thisMonthGiving.toLocaleString()} / ${givingGoal.monthly_goal.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={monthlyGoalProgress} className="h-3" />
                    {monthlyGoalProgress >= 100 && (
                      <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Monthly goal reached!
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Annual Progress</span>
                      <span className="font-medium">
                        ${thisYearGiving.toLocaleString()} / ${givingGoal.annual_goal.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={annualGoalProgress} className="h-3" />
                    {annualGoalProgress >= 100 && (
                      <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Annual goal reached!
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {!givingGoal && !showGoalEditor && (
          <Card className="mb-8 bg-gradient-to-r from-navy/5 to-gold/5 border-dashed">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-navy mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-navy mb-2">Set a Giving Goal</h3>
              <p className="text-gray-600 mb-4">
                Track your generosity by setting a monthly giving goal
              </p>
              <Button
                onClick={() => setShowGoalEditor(true)}
                className="bg-navy hover:bg-navy/90"
              >
                Set Goal
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="give" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="give">Give</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="pledges">Pledges</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Give Now */}
          <TabsContent value="give">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Make a Gift</CardTitle>
                    <CardDescription>Choose a fund and amount</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Fund Selection */}
                    <div>
                      <Label className="mb-3 block">Select Fund</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {funds.map((fund) => (
                          <button
                            key={fund.id}
                            onClick={() => setSelectedFund(fund.id)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              selectedFund === fund.id
                                ? 'border-navy bg-navy/5'
                                : 'border-gray-200 hover:border-navy/30'
                            }`}
                          >
                            <p className={`font-semibold text-sm ${selectedFund === fund.id ? 'text-navy' : 'text-gray-700'}`}>
                              {fund.name}
                            </p>
                            {fund.is_featured && (
                              <Badge className="mt-1 bg-gold/20 text-gold-dark text-xs">
                                Featured
                              </Badge>
                            )}
                            {fund.goal_amount && (
                              <div className="mt-2">
                                <Progress
                                  value={(fund.current_amount / fund.goal_amount) * 100}
                                  className="h-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  ${fund.current_amount.toLocaleString()} / ${fund.goal_amount.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frequency */}
                    <div>
                      <Label className="mb-3 block">Frequency</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'once', label: 'One-time' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'biweekly', label: 'Bi-weekly' },
                          { value: 'monthly', label: 'Monthly' }
                        ].map((f) => (
                          <button
                            key={f.value}
                            onClick={() => setFrequency(f.value as any)}
                            className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              frequency === f.value
                                ? 'border-navy bg-navy text-white'
                                : 'border-gray-200 text-gray-700 hover:border-navy/30'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Selection */}
                    <div>
                      <Label className="mb-3 block">Amount</Label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
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
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="Custom amount"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value)
                            setSelectedAmount('')
                          }}
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-navy hover:bg-navy/90 h-14 text-lg"
                      disabled={!getCurrentAmount() || !selectedFund}
                    >
                      {frequency === 'once' ? 'Give' : `Start ${frequency} gift of`} ${getCurrentAmount() || '0'}
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                      Secure payment • Tax-deductible • 501(c)(3) organization
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Impact Sidebar */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-gold/10 to-amber-50 border-gold/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-gold" />
                      Your Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">
                      Your generosity makes a difference:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        Spreading the Gospel globally
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        Providing transformative teachings
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        Supporting community programs
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        Expanding digital ministry
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tax Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      TPC Ministries is a 501(c)(3) non-profit organization.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download {currentYear - 1} Statement
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Recurring Gifts */}
          <TabsContent value="recurring">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-navy" />
                  Recurring Gifts
                </CardTitle>
                <CardDescription>
                  Manage your ongoing commitments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recurringGifts.length === 0 ? (
                  <div className="text-center py-8">
                    <Repeat className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No recurring gifts set up</p>
                    <p className="text-sm text-gray-500">
                      Set up a recurring gift to make giving easier
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recurringGifts.map((gift) => (
                      <div
                        key={gift.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Repeat className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-navy">{gift.fund_name}</p>
                            <p className="text-sm text-gray-500 capitalize">{gift.frequency}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-navy">${gift.amount}</p>
                          <p className="text-xs text-gray-500">
                            Next: {formatDate(gift.next_date)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelRecurring(gift.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pledges */}
          <TabsContent value="pledges">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-navy" />
                  My Pledges
                </CardTitle>
                <CardDescription>
                  Track your giving commitments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pledges.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No active pledges</p>
                    <p className="text-sm text-gray-500">
                      Contact the church office to make a giving pledge
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pledges.map((pledge) => {
                      const progress = (pledge.amount_fulfilled / pledge.pledge_amount) * 100
                      return (
                        <div key={pledge.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-navy">{pledge.fund_name}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(pledge.start_date)} - {formatDate(pledge.end_date)}
                              </p>
                            </div>
                            <Badge className={
                              pledge.status === 'on_track'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {pledge.status === 'on_track' ? 'On Track' : 'Active'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">
                                ${pledge.amount_fulfilled.toLocaleString()} / ${pledge.pledge_amount.toLocaleString()}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-gray-500 text-right">
                              ${(pledge.pledge_amount - pledge.amount_fulfilled).toLocaleString()} remaining
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Giving History</CardTitle>
                    <CardDescription>All your contributions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {givingHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No giving history yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {givingHistory.map((gift) => (
                      <div key={gift.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-navy" />
                          </div>
                          <div>
                            <p className="font-medium text-navy">{gift.fund_name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{formatDate(gift.date)}</span>
                              {gift.recurring && (
                                <Badge variant="outline" className="text-xs">
                                  <Repeat className="h-3 w-3 mr-1" />
                                  Recurring
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-navy">${gift.amount.toLocaleString()}</p>
                          <Badge className={
                            gift.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {gift.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-navy" />
                    Monthly Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-40">
                    {monthlyTrend.map((month, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-navy rounded-t"
                          style={{ height: `${(month.amount / maxTrend) * 100}%`, minHeight: '4px' }}
                        />
                        <p className="text-xs text-gray-500 mt-2">{month.month}</p>
                        <p className="text-xs font-medium text-navy">${month.amount}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Giving by Fund */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-navy" />
                    Giving by Fund
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(givingByFund).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(givingByFund).map(([fund, amount]) => (
                        <div key={fund} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{fund}</span>
                          <span className="font-semibold text-navy">${(amount as number).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Year Over Year */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-navy" />
                    Year Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-navy">{givingHistory.length}</p>
                      <p className="text-sm text-gray-500">Total Gifts</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-navy">
                        ${Math.round(thisYearGiving / Math.max(1, currentMonth + 1)).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Avg Monthly</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-navy">
                        ${Math.max(...givingHistory.map(g => g.amount), 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Largest Gift</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-navy">
                        {Object.keys(givingByFund).length}
                      </p>
                      <p className="text-sm text-gray-500">Funds Supported</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

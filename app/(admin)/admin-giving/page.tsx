'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Calendar,
  RefreshCw,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Plus,
  X,
  User,
  Banknote,
  Building2,
  Smartphone,
  Receipt,
} from 'lucide-react'

interface GivingStats {
  totalThisMonth: number
  totalLastMonth: number
  totalThisYear: number
  recurringTotal: number
  pledgesTotal: number
  pledgesFulfilled: number
  averageGift: number
  totalDonors: number
}

interface Donation {
  id: string
  member_id: string
  member_name?: string
  amount: number
  category: string
  payment_method: string
  transaction_id: string | null
  status: string
  created_at: string
}

interface RecurringDonation {
  id: string
  member_id: string
  member_name?: string
  amount: number
  frequency: string
  category: string
  start_date: string
  next_charge_date: string | null
  status: string
}

interface Pledge {
  id: string
  member_id: string
  member_name?: string
  campaign_name: string
  pledge_amount: number
  amount_fulfilled: number
  start_date: string
  end_date: string | null
  status: string
}

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface MemberGivingHistory {
  member: Member
  donations: Donation[]
  totalGiven: number
  donationCount: number
}

const paymentMethods = [
  { value: 'zelle', label: 'Zelle', icon: Smartphone },
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'check', label: 'Check', icon: Receipt },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'other', label: 'Other', icon: DollarSign },
]

export default function AdminGivingPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [recurringDonations, setRecurringDonations] = useState<RecurringDonation[]>([])
  const [pledges, setPledges] = useState<Pledge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'recurring' | 'pledges'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [dateRange, setDateRange] = useState('month')
  const [stats, setStats] = useState<GivingStats>({
    totalThisMonth: 0,
    totalLastMonth: 0,
    totalThisYear: 0,
    recurringTotal: 0,
    pledgesTotal: 0,
    pledgesFulfilled: 0,
    averageGift: 0,
    totalDonors: 0,
  })

  // Add Donation Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [addingDonation, setAddingDonation] = useState(false)
  const [newDonation, setNewDonation] = useState({
    member_id: '',
    amount: '',
    category: 'tithe',
    payment_method: 'zelle',
    notes: '',
    donor_name: '',
    donor_email: '',
    is_anonymous: false,
  })

  // Member Giving History Modal State
  const [showMemberHistory, setShowMemberHistory] = useState(false)
  const [memberHistory, setMemberHistory] = useState<MemberGivingHistory | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const categories = ['tithe', 'offering', 'missions', 'building', 'benevolence', 'special', 'other']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchStats(),
      fetchDonations(),
      fetchRecurringDonations(),
      fetchPledges(),
      fetchMembers(),
    ])
    setLoading(false)
  }

  const fetchMembers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('members')
      .select('id, first_name, last_name, email')
      .order('first_name')

    if (data) {
      setMembers(data)
    }
  }

  const fetchStats = async () => {
    const supabase = createClient()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()

    // This month's total
    const { data: thisMonthData } = await supabase
      .from('donations')
      .select('amount')
      .gte('created_at', startOfMonth)
      .eq('status', 'completed')

    const totalThisMonth = thisMonthData?.reduce((sum, d) => sum + d.amount, 0) || 0

    // Last month's total
    const { data: lastMonthData } = await supabase
      .from('donations')
      .select('amount')
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth)
      .eq('status', 'completed')

    const totalLastMonth = lastMonthData?.reduce((sum, d) => sum + d.amount, 0) || 0

    // This year's total
    const { data: yearData } = await supabase
      .from('donations')
      .select('amount')
      .gte('created_at', startOfYear)
      .eq('status', 'completed')

    const totalThisYear = yearData?.reduce((sum, d) => sum + d.amount, 0) || 0

    // Recurring total
    const { data: recurringData } = await supabase
      .from('recurring_donations')
      .select('amount')
      .eq('status', 'active')

    const recurringTotal = recurringData?.reduce((sum, d) => sum + d.amount, 0) || 0

    // Pledges
    const { data: pledgesData } = await supabase
      .from('giving_pledges')
      .select('pledge_amount, amount_fulfilled')

    const pledgesTotal = pledgesData?.reduce((sum, p) => sum + p.pledge_amount, 0) || 0
    const pledgesFulfilled = pledgesData?.reduce((sum, p) => sum + p.amount_fulfilled, 0) || 0

    // Unique donors
    const { count: totalDonors } = await supabase
      .from('donations')
      .select('member_id', { count: 'exact', head: true })
      .eq('status', 'completed')

    const averageGift = thisMonthData && thisMonthData.length > 0
      ? totalThisMonth / thisMonthData.length
      : 0

    setStats({
      totalThisMonth,
      totalLastMonth,
      totalThisYear,
      recurringTotal,
      pledgesTotal,
      pledgesFulfilled,
      averageGift,
      totalDonors: totalDonors || 0,
    })
  }

  const fetchDonations = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('donations')
      .select(`
        *,
        members(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      setDonations(data.map(d => ({
        ...d,
        member_name: d.members ? `${d.members.first_name} ${d.members.last_name}` : 'Anonymous'
      })))
    }
  }

  const fetchRecurringDonations = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('recurring_donations')
      .select(`
        *,
        members(first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    if (data) {
      setRecurringDonations(data.map(d => ({
        ...d,
        member_name: d.members ? `${d.members.first_name} ${d.members.last_name}` : 'Unknown'
      })))
    }
  }

  const fetchPledges = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('giving_pledges')
      .select(`
        *,
        members(first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    if (data) {
      setPledges(data.map(p => ({
        ...p,
        member_name: p.members ? `${p.members.first_name} ${p.members.last_name}` : 'Unknown'
      })))
    }
  }

  const getChangePercent = () => {
    if (stats.totalLastMonth === 0) return stats.totalThisMonth > 0 ? 100 : 0
    return ((stats.totalThisMonth - stats.totalLastMonth) / stats.totalLastMonth * 100).toFixed(1)
  }

  const isPositiveChange = () => stats.totalThisMonth >= stats.totalLastMonth

  // Add manual donation
  const handleAddDonation = async () => {
    if (!newDonation.amount || parseFloat(newDonation.amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (!newDonation.member_id && !newDonation.donor_name) {
      alert('Please select a member or enter a donor name')
      return
    }

    setAddingDonation(true)
    const supabase = createClient()

    try {
      const donationData: any = {
        amount: parseFloat(newDonation.amount),
        category: newDonation.category,
        payment_method: newDonation.payment_method,
        status: 'completed',
        notes: newDonation.notes || null,
        is_anonymous: newDonation.is_anonymous,
      }

      if (newDonation.member_id) {
        donationData.member_id = newDonation.member_id
        const member = members.find(m => m.id === newDonation.member_id)
        if (member) {
          donationData.donor_name = `${member.first_name} ${member.last_name}`
          donationData.donor_email = member.email
        }
      } else {
        donationData.donor_name = newDonation.donor_name
        donationData.donor_email = newDonation.donor_email || null
      }

      const { error } = await supabase
        .from('donations')
        .insert(donationData)

      if (error) throw error

      // Reset form and close modal
      setNewDonation({
        member_id: '',
        amount: '',
        category: 'tithe',
        payment_method: 'zelle',
        notes: '',
        donor_name: '',
        donor_email: '',
        is_anonymous: false,
      })
      setShowAddModal(false)
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error adding donation:', error)
      alert('Failed to add donation. Please try again.')
    } finally {
      setAddingDonation(false)
    }
  }

  // View member giving history
  const viewMemberHistory = async (memberId: string, memberName: string) => {
    setLoadingHistory(true)
    setShowMemberHistory(true)

    const supabase = createClient()

    try {
      // Get member details
      const { data: memberData } = await supabase
        .from('members')
        .select('id, first_name, last_name, email')
        .eq('id', memberId)
        .single()

      // Get all donations for this member
      const { data: donationsData } = await supabase
        .from('donations')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })

      if (memberData && donationsData) {
        const totalGiven = donationsData.reduce((sum, d) => sum + (d.amount || 0), 0)
        setMemberHistory({
          member: memberData,
          donations: donationsData,
          totalGiven,
          donationCount: donationsData.length,
        })
      }
    } catch (error) {
      console.error('Error fetching member history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const filteredDonations = donations.filter(d => {
    const matchesSearch = d.member_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || d.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Giving Management</h1>
            <p className="text-gray-600">Track donations, recurring gifts, and pledges</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button className="bg-navy hover:bg-navy/90" onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Donation
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-navy to-navy-800 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">This Month</p>
                  <p className="text-3xl font-bold">${stats.totalThisMonth.toLocaleString()}</p>
                  <div className={`flex items-center text-sm mt-1 ${isPositiveChange() ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositiveChange() ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {getChangePercent()}% vs last month
                  </div>
                </div>
                <DollarSign className="h-12 w-12 text-white/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Year</p>
                  <p className="text-3xl font-bold text-navy">${stats.totalThisYear.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recurring Monthly</p>
                  <p className="text-3xl font-bold text-gold">${stats.recurringTotal.toLocaleString()}</p>
                </div>
                <RefreshCw className="h-10 w-10 text-gold/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pledges Fulfilled</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.pledgesTotal > 0
                      ? Math.round(stats.pledgesFulfilled / stats.pledgesTotal * 100)
                      : 0}%
                  </p>
                </div>
                <Target className="h-10 w-10 text-purple-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(['overview', 'donations', 'recurring', 'pledges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Giving by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((cat) => {
                    const catTotal = donations
                      .filter(d => d.category === cat)
                      .reduce((sum, d) => sum + d.amount, 0)
                    const percent = stats.totalThisMonth > 0
                      ? (catTotal / stats.totalThisMonth * 100).toFixed(0)
                      : 0
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{cat}</span>
                          <span className="font-medium">${catTotal.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-navy rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Donors</span>
                    <span className="text-xl font-bold text-navy">{stats.totalDonors}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Average Gift</span>
                    <span className="text-xl font-bold text-navy">${stats.averageGift.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Active Recurring</span>
                    <span className="text-xl font-bold text-navy">
                      {recurringDonations.filter(r => r.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Active Pledges</span>
                    <span className="text-xl font-bold text-navy">
                      {pledges.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Donor</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Category</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Method</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((donation) => (
                      <tr key={donation.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {donation.member_id ? (
                            <button
                              onClick={() => viewMemberHistory(donation.member_id, donation.member_name || 'Unknown')}
                              className="text-navy hover:text-gold hover:underline flex items-center gap-1"
                            >
                              <User className="h-3 w-3" />
                              {donation.member_name}
                            </button>
                          ) : (
                            <span className="text-gray-500">{donation.member_name || 'Anonymous'}</span>
                          )}
                        </td>
                        <td className="p-4 text-sm font-bold text-navy">
                          ${donation.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-sm capitalize">{donation.category}</td>
                        <td className="p-4 text-sm capitalize">{donation.payment_method || 'card'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            donation.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : donation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {donation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Recurring Tab */}
        {activeTab === 'recurring' && (
          <div className="grid gap-4">
            {recurringDonations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recurring donations yet</p>
                </CardContent>
              </Card>
            ) : (
              recurringDonations.map((rd) => (
                <Card key={rd.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 text-gold" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-navy">{rd.member_name}</h3>
                        <p className="text-sm text-gray-600">
                          ${rd.amount}/mo to {rd.category} • {rd.frequency}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          rd.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rd.status}
                        </span>
                        {rd.next_charge_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Next: {new Date(rd.next_charge_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Pledges Tab */}
        {activeTab === 'pledges' && (
          <div className="grid gap-4">
            {pledges.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pledges yet</p>
                </CardContent>
              </Card>
            ) : (
              pledges.map((pledge) => {
                const progress = pledge.pledge_amount > 0
                  ? (pledge.amount_fulfilled / pledge.pledge_amount * 100)
                  : 0
                return (
                  <Card key={pledge.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-navy">{pledge.member_name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              pledge.status === 'active' ? 'bg-green-100 text-green-800' :
                              pledge.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {pledge.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{pledge.campaign_name}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-navy">
                              ${pledge.amount_fulfilled.toLocaleString()} / ${pledge.pledge_amount.toLocaleString()}
                            </span>
                            <span className="text-gray-500">
                              ({progress.toFixed(0)}% complete)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-purple-600 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Add Donation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-navy">Add Manual Donation</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Member Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Donor</Label>
                <select
                  value={newDonation.member_id}
                  onChange={(e) => setNewDonation({ ...newDonation, member_id: e.target.value, donor_name: '', donor_email: '' })}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">-- Select a member or enter manually --</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Manual donor name if no member selected */}
              {!newDonation.member_id && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Donor Name</Label>
                    <Input
                      placeholder="Enter donor name"
                      value={newDonation.donor_name}
                      onChange={(e) => setNewDonation({ ...newDonation, donor_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Donor Email (optional)</Label>
                    <Input
                      type="email"
                      placeholder="Enter donor email"
                      value={newDonation.donor_email}
                      onChange={(e) => setNewDonation({ ...newDonation, donor_email: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newDonation.amount}
                    onChange={(e) => setNewDonation({ ...newDonation, amount: e.target.value })}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Category</Label>
                <select
                  value={newDonation.category}
                  onChange={(e) => setNewDonation({ ...newDonation, category: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setNewDonation({ ...newDonation, payment_method: method.value })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                          newDonation.payment_method === method.value
                            ? 'border-navy bg-navy/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${newDonation.payment_method === method.value ? 'text-navy' : 'text-gray-500'}`} />
                        <span className={`text-xs font-medium ${newDonation.payment_method === method.value ? 'text-navy' : 'text-gray-600'}`}>
                          {method.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Notes (optional)</Label>
                <textarea
                  placeholder="Add any notes about this donation..."
                  value={newDonation.notes}
                  onChange={(e) => setNewDonation({ ...newDonation, notes: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 min-h-[80px] resize-none"
                />
              </div>

              {/* Anonymous checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newDonation.is_anonymous}
                  onChange={(e) => setNewDonation({ ...newDonation, is_anonymous: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Mark as anonymous donation</span>
              </label>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-navy hover:bg-navy/90"
                onClick={handleAddDonation}
                disabled={addingDonation}
              >
                {addingDonation ? 'Adding...' : 'Add Donation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Member Giving History Modal */}
      {showMemberHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-navy">Member Giving History</h2>
                {memberHistory && (
                  <p className="text-gray-600">
                    {memberHistory.member.first_name} {memberHistory.member.last_name}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowMemberHistory(false)
                  setMemberHistory(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <RefreshCw className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : memberHistory ? (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-navy">${memberHistory.totalGiven.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Total Given</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold">{memberHistory.donationCount}</p>
                    <p className="text-xs text-gray-600">Donations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${memberHistory.donationCount > 0
                        ? Math.round(memberHistory.totalGiven / memberHistory.donationCount).toLocaleString()
                        : 0}
                    </p>
                    <p className="text-xs text-gray-600">Average Gift</p>
                  </div>
                </div>

                {/* Donations List */}
                <div className="flex-1 overflow-y-auto p-6">
                  {memberHistory.donations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No donations found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {memberHistory.donations.map((donation) => (
                        <div
                          key={donation.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-navy" />
                            </div>
                            <div>
                              <p className="font-medium text-navy capitalize">{donation.category}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(donation.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                                {donation.payment_method && ` • ${donation.payment_method}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-navy">${donation.amount.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              donation.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {donation.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowMemberHistory(false)
                      setMemberHistory(null)
                    }}
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-gray-500">
                Failed to load member history
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

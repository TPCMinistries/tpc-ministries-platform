'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign, Search, Loader2, Calendar, User, TrendingUp, Repeat } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Donation {
  id: string
  user_id?: string
  amount: number
  type: 'general' | 'missions' | 'leadership' | 'tithe' | 'offering'
  frequency: 'once' | 'monthly' | 'yearly'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  donor_name?: string
  donor_email?: string
  payment_method?: string
  created_at: string
  member?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'general' | 'missions' | 'leadership' | 'tithe' | 'offering'>('all')
  const [filterFrequency, setFilterFrequency] = useState<'all' | 'once' | 'monthly' | 'yearly'>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          member:members(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching donations:', error)
        toast({
          title: 'Error',
          description: 'Failed to load donations',
          variant: 'destructive',
        })
      } else {
        setDonations(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.donor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donor_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.member?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.member?.last_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || donation.type === filterType
    const matchesFrequency = filterFrequency === 'all' || donation.frequency === filterFrequency

    return matchesSearch && matchesType && matchesFrequency
  })

  const completedDonations = donations.filter(d => d.status === 'completed')
  const totalDonations = completedDonations.reduce((sum, d) => sum + Number(d.amount), 0)
  const recurringDonations = completedDonations.filter(d => d.frequency === 'monthly')
  const monthlyRecurring = recurringDonations.reduce((sum, d) => sum + Number(d.amount), 0)

  // This month's donations
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)
  const thisMonthDonations = completedDonations.filter(d =>
    new Date(d.created_at) >= firstDayOfMonth
  )
  const thisMonthTotal = thisMonthDonations.reduce((sum, d) => sum + Number(d.amount), 0)

  const stats = {
    total: totalDonations,
    thisMonth: thisMonthTotal,
    recurring: monthlyRecurring,
    count: completedDonations.length,
    recurringCount: recurringDonations.length,
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      general: 'General Ministry',
      missions: 'Global Missions',
      leadership: 'Leadership Support',
      tithe: 'Tithe',
      offering: 'Offering',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-700',
      missions: 'bg-gold/20 text-gold',
      leadership: 'bg-purple-100 text-purple-700',
      tithe: 'bg-green-100 text-green-700',
      offering: 'bg-orange-100 text-orange-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-8 w-8 text-gold" />
            <h1 className="text-4xl font-bold text-navy">Donations</h1>
          </div>
          <p className="text-gray-600">View and manage all donations and giving</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{formatCurrency(stats.total)}</div>
              <p className="text-xs text-gray-600 mt-1">{stats.count} donations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.thisMonth)}</div>
              <p className="text-xs text-gray-600 mt-1">{thisMonthDonations.length} donations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Recurring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">{formatCurrency(stats.recurring)}</div>
              <p className="text-xs text-gray-600 mt-1">{stats.recurringCount} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Average Donation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(stats.count > 0 ? stats.total / stats.count : 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">per donation</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search by donor name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General Ministry</SelectItem>
                    <SelectItem value="missions">Missions</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="tithe">Tithe</SelectItem>
                    <SelectItem value="offering">Offering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-48">
                <Select value={filterFrequency} onValueChange={(value: any) => setFilterFrequency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequencies</SelectItem>
                    <SelectItem value="once">One-Time</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-navy">All Donations</CardTitle>
            <CardDescription>{filteredDonations.length} donations</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDonations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No donations found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Donor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Frequency</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((donation) => (
                      <tr key={donation.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-navy">
                                {donation.member
                                  ? `${donation.member.first_name} ${donation.member.last_name}`
                                  : donation.donor_name || 'Anonymous'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {donation.member?.email || donation.donor_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-navy">
                            {formatCurrency(Number(donation.amount))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(donation.type)}`}>
                            {getTypeLabel(donation.type)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {donation.frequency === 'monthly' && (
                              <Repeat className="h-3 w-3 text-gold" />
                            )}
                            <span className="capitalize">{donation.frequency}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(donation.created_at)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              donation.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : donation.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : donation.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

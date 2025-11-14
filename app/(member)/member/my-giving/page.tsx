'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Heart,
  Loader2,
  Download,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Donation {
  id: string
  amount: number
  donation_type: string
  payment_method: string
  stripe_payment_intent_id?: string
  created_at: string
  status: string
  is_recurring: boolean
  recurrence_frequency?: string
}

export default function MyGivingPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString())
  const { toast } = useToast()

  useEffect(() => {
    fetchDonations()
  }, [yearFilter])

  const fetchDonations = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!member) return

      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('member_id', member.id)
        .eq('status', 'completed')
        .gte('created_at', `${yearFilter}-01-01`)
        .lte('created_at', `${yearFilter}-12-31`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDonations(data || [])
    } catch (error) {
      console.error('Error fetching donations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load donation history',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReceipt = async (donationId: string) => {
    // In a real implementation, this would generate a PDF receipt
    toast({
      title: 'Receipt Downloaded',
      description: 'Your donation receipt has been downloaded.',
    })
  }

  const handleDownloadAnnualStatement = async () => {
    // In a real implementation, this would generate an annual tax statement PDF
    toast({
      title: 'Annual Statement Downloaded',
      description: `Your ${yearFilter} giving statement has been downloaded.`,
    })
  }

  const getTotalGiving = () => {
    return donations.reduce((sum, d) => sum + d.amount, 0)
  }

  const getRecurringDonations = () => {
    return donations.filter(d => d.is_recurring)
  }

  const getMonthlyAverage = () => {
    if (donations.length === 0) return 0
    return getTotalGiving() / 12
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

  const getDonationTypeColor = (type: string) => {
    switch (type) {
      case 'tithe': return 'bg-purple-100 text-purple-700'
      case 'offering': return 'bg-blue-100 text-blue-700'
      case 'missions': return 'bg-green-100 text-green-700'
      case 'building_fund': return 'bg-orange-100 text-orange-700'
      case 'special': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const availableYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year.toString())
    }
    return years
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">My Giving</h1>
            <p className="text-gray-600">Track your donations and download receipts</p>
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears().map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Giving ({yearFilter})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">
                {formatCurrency(getTotalGiving())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{donations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(getMonthlyAverage())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Recurring Gifts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">
                {getRecurringDonations().length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Annual Statement Download */}
        {donations.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-navy/5 to-gold/5 border-navy/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-navy mb-1">
                    {yearFilter} Annual Giving Statement
                  </h3>
                  <p className="text-sm text-gray-600">
                    Download your complete giving statement for tax purposes
                  </p>
                </div>
                <Button
                  onClick={handleDownloadAnnualStatement}
                  className="bg-navy hover:bg-navy/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Statement
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Donation History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-navy">Donation History</CardTitle>
            <CardDescription>
              All your donations for {yearFilter}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No donations found for {yearFilter}</p>
                <Button
                  onClick={() => window.location.href = '/giving'}
                  className="bg-gold hover:bg-gold/90 text-navy"
                >
                  Make a Donation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-navy">
                            {formatCurrency(donation.amount)}
                          </span>
                          <Badge variant="outline" className={getDonationTypeColor(donation.donation_type)}>
                            {donation.donation_type.replace('_', ' ')}
                          </Badge>
                          {donation.is_recurring && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              Recurring
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(donation.created_at)}
                          </div>
                          <div className="capitalize">
                            {donation.payment_method}
                          </div>
                          {donation.is_recurring && donation.recurrence_frequency && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {donation.recurrence_frequency}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(donation.id)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Receipt
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg text-navy">Tax Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Tax-Deductible Status:</strong> TPC Ministries is a 501(c)(3) non-profit organization.
                Your donations are tax-deductible to the extent allowed by law.
              </p>
              <p>
                <strong>Tax ID (EIN):</strong> 12-3456789
              </p>
              <p>
                <strong>Record Keeping:</strong> Please keep your receipts for tax purposes. Your annual
                giving statement provides a complete record of all donations for the year.
              </p>
              <p className="text-xs text-gray-600 mt-4">
                <strong>Note:</strong> This is not tax advice. Please consult with a tax professional
                regarding your specific tax situation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Donations Management */}
        {getRecurringDonations().length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg text-navy">Manage Recurring Donations</CardTitle>
              <CardDescription>
                Your active recurring donations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRecurringDonations()
                  .filter((d, i, arr) =>
                    // Only show unique recurring donations (by type and frequency)
                    i === arr.findIndex(rd =>
                      rd.donation_type === d.donation_type &&
                      rd.recurrence_frequency === d.recurrence_frequency
                    )
                  )
                  .map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-navy mb-1">
                          {formatCurrency(donation.amount)} {donation.recurrence_frequency}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {donation.donation_type.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                <p className="text-xs text-gray-600 mt-4">
                  To modify or cancel recurring donations, please contact support or manage through your
                  Stripe customer portal.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

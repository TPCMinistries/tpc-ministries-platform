'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ChevronLeft,
  Crown,
  Sparkles,
  User,
  Mail,
  Calendar,
  DollarSign,
  CreditCard,
  ExternalLink,
  ArrowUpCircle,
  Gift,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [isCoachingClient, setIsCoachingClient] = useState(false)

  // Mock data - will be replaced with API calls
  const memberData = {
    id: params.id,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    tier: 'partner', // 'free', 'partner', 'covenant'
    tierName: 'Partner',
    subscriptionStatus: 'active',
    memberSince: '2023-06-15',
    lastActivity: '2024-01-20',
    nextPaymentDate: '2024-02-15',
    nextPaymentAmount: 50,
    paymentMethod: '•••• 4242',
    stripeCustomerId: 'cus_abc123',
    totalGiving: 650,
    coachingPackage: null,
  }

  const subscriptionHistory = [
    {
      id: '1',
      date: '2024-01-15',
      tier: 'partner',
      amount: 50,
      status: 'succeeded',
    },
    {
      id: '2',
      date: '2023-12-15',
      tier: 'partner',
      amount: 50,
      status: 'succeeded',
    },
    {
      id: '3',
      date: '2023-11-15',
      tier: 'partner',
      amount: 50,
      status: 'succeeded',
    },
  ]

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'covenant':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy/20 text-navy rounded-full text-sm font-medium">
            <Crown className="h-4 w-4" />
            Covenant Partner
          </span>
        )
      case 'partner':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Partner
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            Free Member
          </span>
        )
    }
  }

  const handleManualUpgrade = () => {
    // TODO: API call to manually upgrade member (comp access)
    console.log('Manually upgrading member...')
    setShowUpgradeDialog(false)
    alert('Member upgraded successfully')
  }

  const handleViewInStripe = () => {
    // TODO: Open Stripe dashboard for this customer
    window.open(`https://dashboard.stripe.com/customers/${memberData.stripeCustomerId}`, '_blank')
  }

  const handleToggleCoaching = () => {
    // TODO: API call to toggle coaching client status
    setIsCoachingClient(!isCoachingClient)
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/admin/members"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Members
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-navy/10 flex items-center justify-center">
              <User className="h-8 w-8 text-navy" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy mb-1">{memberData.name}</h1>
              <p className="text-gray-600">{memberData.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => alert('Email member')}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            {memberData.stripeCustomerId && (
              <Button variant="outline" onClick={handleViewInStripe}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View in Stripe
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Membership Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-navy">Membership</CardTitle>
                    <CardDescription>Current tier and subscription details</CardDescription>
                  </div>
                  {getTierBadge(memberData.tier)}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Subscription Status */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium capitalize">
                      {memberData.subscriptionStatus}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Member Since</p>
                    <p className="font-medium text-navy">
                      {new Date(memberData.memberSince).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {memberData.tier !== 'free' && (
                    <>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Next Payment</p>
                          <p className="font-medium text-navy">
                            {new Date(memberData.nextPaymentDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-medium text-navy">${memberData.nextPaymentAmount}/month</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-medium text-navy">{memberData.paymentMethod}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t flex gap-3">
                  <Button
                    onClick={() => setShowUpgradeDialog(true)}
                    className="bg-gold hover:bg-gold-dark"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Manually Upgrade
                  </Button>
                  {memberData.tier !== 'covenant' && (
                    <Button variant="outline">
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      Send Upgrade Offer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscription History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-navy">Subscription History</CardTitle>
                <CardDescription>Payment and tier change history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subscriptionHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-navy">
                            {record.tier.charAt(0).toUpperCase() + record.tier.slice(1)} - $
                            {record.amount}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium capitalize">
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-navy">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Giving</p>
                  <p className="text-2xl font-bold text-navy">${memberData.totalGiving}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Activity</p>
                  <p className="font-medium text-navy">
                    {new Date(memberData.lastActivity).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Coaching Client */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-navy">Coaching Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="coaching-toggle">Coaching Client</Label>
                  <button
                    id="coaching-toggle"
                    onClick={handleToggleCoaching}
                    className="relative"
                  >
                    {isCoachingClient ? (
                      <ToggleRight className="h-8 w-8 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-gray-400" />
                    )}
                  </button>
                </div>

                {isCoachingClient && (
                  <div className="pt-3 border-t space-y-3">
                    <div>
                      <Label htmlFor="package">Package</Label>
                      <select
                        id="package"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
                      >
                        <option>Executive Coaching - 6 months</option>
                        <option>Leadership Development - 3 months</option>
                        <option>Business Transformation - 12 months</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="sessions">Sessions Remaining</Label>
                      <Input id="sessions" type="number" defaultValue={8} className="mt-1" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-navy">Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                  placeholder="Private admin notes about this member..."
                  defaultValue=""
                />
                <Button size="sm" className="mt-3 w-full">
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Manual Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-navy">Manually Upgrade Member</DialogTitle>
            <DialogDescription>
              Grant complimentary access to a higher tier without payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="upgrade-tier">Select Tier</Label>
              <select
                id="upgrade-tier"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
              >
                {memberData.tier !== 'partner' && <option value="partner">Partner ($50/mo)</option>}
                {memberData.tier !== 'covenant' && (
                  <option value="covenant">Covenant Partner ($150/mo)</option>
                )}
              </select>
            </div>

            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <textarea
                id="reason"
                className="w-full mt-1 min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                placeholder="e.g., Ministry staff, special circumstances, scholarship..."
              />
            </div>

            <div className="bg-gold/10 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                This will grant free access to the selected tier. The member will not be charged.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualUpgrade} className="bg-gold hover:bg-gold-dark">
              Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

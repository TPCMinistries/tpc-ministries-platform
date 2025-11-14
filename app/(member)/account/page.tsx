'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Check,
  Crown,
  Sparkles,
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  ArrowUpCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

export default function AccountPage() {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false)

  // Mock data - will be replaced with API calls
  const memberData = {
    tier: 'partner', // 'free', 'partner', 'covenant'
    tierName: 'Partner',
    nextPaymentDate: '2024-02-15',
    nextPaymentAmount: 50,
    paymentMethod: '•••• 4242',
    subscriptionStatus: 'active', // 'active', 'past_due', 'canceled'
    memberSince: '2023-06-15',
  }

  const givingHistory = [
    {
      id: '1',
      date: '2024-01-15',
      amount: 50,
      designation: 'Monthly Partnership',
      status: 'completed',
    },
    {
      id: '2',
      date: '2023-12-15',
      amount: 50,
      designation: 'Monthly Partnership',
      status: 'completed',
    },
    {
      id: '3',
      date: '2023-12-25',
      amount: 100,
      designation: 'Christmas Offering',
      status: 'completed',
    },
    {
      id: '4',
      date: '2023-11-15',
      amount: 50,
      designation: 'Monthly Partnership',
      status: 'completed',
    },
  ]

  const totalGivingThisYear = givingHistory
    .filter((gift) => new Date(gift.date).getFullYear() === 2024)
    .reduce((sum, gift) => sum + gift.amount, 0)

  const tierBenefits = {
    free: [
      'Access all teachings & content library',
      'Submit prayer requests',
      'Public prophetic word library',
      'Join 8am daily prayer call',
      'Community participation',
      'Season journey system',
    ],
    partner: [
      'All Free Member benefits',
      'Monthly partner-only teaching/Q&A',
      'Partner-exclusive prophetic words',
      'Priority prayer requests',
      'Monthly personal email update',
      'Early access to new content',
      'Partner community network',
    ],
    covenant: [
      'All Partner benefits',
      'Quarterly 1-on-1 check-in (30 min)',
      'Personal prophetic word annually',
      'Direct message access',
      'Exclusive event invitations',
      'Input on ministry direction',
      'Priority coaching booking',
    ],
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'covenant':
        return Crown
      case 'partner':
        return Sparkles
      default:
        return Check
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'covenant':
        return 'navy'
      case 'partner':
        return 'gold'
      default:
        return 'gray'
    }
  }

  const handleManageSubscription = () => {
    // TODO: Open Stripe Customer Portal
    alert('Opening Stripe Customer Portal...')
  }

  const handleCancelSubscription = () => {
    // TODO: API call to cancel subscription
    console.log('Canceling subscription...')
    setShowCancelDialog(false)
    alert('Subscription canceled')
  }

  const handleDowngrade = () => {
    // TODO: API call to downgrade tier
    console.log('Downgrading tier...')
    setShowDowngradeDialog(false)
    alert('Tier downgraded')
  }

  const TierIcon = getTierIcon(memberData.tier)
  const tierColor = getTierColor(memberData.tier)

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy mb-2">My Account</h1>
          <p className="text-gray-600">Manage your membership, billing, and giving history</p>
        </div>

        <Tabs defaultValue="membership" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="giving">Giving History</TabsTrigger>
          </TabsList>

          {/* Membership Tab */}
          <TabsContent value="membership" className="space-y-6">
            {/* Current Tier Card */}
            <Card className={`border-2 border-${tierColor}`}>
              <CardHeader className={`bg-${tierColor}/5`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-16 w-16 rounded-full bg-${tierColor}/20 flex items-center justify-center`}>
                      <TierIcon className={`h-8 w-8 text-${tierColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-navy mb-1">
                        You are a {memberData.tierName}
                      </CardTitle>
                      <CardDescription className="text-base">
                        Thank you for your partnership with TPC Ministries!
                      </CardDescription>
                    </div>
                  </div>
                  {memberData.tier !== 'covenant' && (
                    <Link href={`/partner/upgrade?tier=${memberData.tier === 'free' ? 'partner' : 'covenant'}`}>
                      <Button className="bg-gold hover:bg-gold-dark">
                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                        Upgrade
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Benefits */}
                <div>
                  <h3 className="font-semibold text-navy mb-4">Your Benefits:</h3>
                  <ul className="grid gap-3 md:grid-cols-2">
                    {tierBenefits[memberData.tier as keyof typeof tierBenefits].map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Member Since */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Member since{' '}
                    {new Date(memberData.memberSince).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Billing Card */}
            {memberData.tier !== 'free' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Billing Information</CardTitle>
                  <CardDescription>Manage your subscription and payment details</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Subscription Status */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        memberData.subscriptionStatus === 'active'
                          ? 'bg-green-500'
                          : memberData.subscriptionStatus === 'past_due'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <span className="font-medium text-navy">
                      Status:{' '}
                      <span className="capitalize">{memberData.subscriptionStatus.replace('_', ' ')}</span>
                    </span>
                  </div>

                  {/* Next Payment */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Next Payment</p>
                        <p className="font-medium text-navy">
                          {new Date(memberData.nextPaymentDate).toLocaleDateString('en-US', {
                            month: 'long',
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
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={handleManageSubscription}
                    >
                      <span>Manage Subscription</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-3">
                      {memberData.tier === 'covenant' && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowDowngradeDialog(true)}
                        >
                          Downgrade to Partner
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setShowCancelDialog(true)}
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Free Tier Upgrade CTA */}
            {memberData.tier === 'free' && (
              <Card className="border-2 border-gold">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-navy mb-2">
                        Unlock More with Partnership
                      </h3>
                      <p className="text-gray-700 mb-4">
                        Get exclusive content, priority support, and deeper engagement with our ministry
                        through Partner or Covenant Partner tiers.
                      </p>
                      <div className="flex gap-3">
                        <Link href="/partner/upgrade?tier=partner">
                          <Button className="bg-gold hover:bg-gold-dark">
                            Become a Partner - $50/mo
                          </Button>
                        </Link>
                        <Link href="/partner">
                          <Button variant="outline">View All Tiers</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Giving History Tab */}
          <TabsContent value="giving" className="space-y-6">
            {/* Stats Card */}
            <Card className="bg-gradient-to-br from-navy to-navy-800 text-white">
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-gray-300 mb-1">Total Giving This Year</p>
                    <p className="text-4xl font-bold">${totalGivingThisYear.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 mb-1">Total Gifts</p>
                    <p className="text-4xl font-bold">{givingHistory.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Giving History Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-navy">Giving History</CardTitle>
                    <CardDescription>All your contributions to TPC Ministries</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Tax Receipts
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Designation
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Status
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                          Receipt
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {givingHistory.map((gift) => (
                        <tr key={gift.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-navy">
                            {new Date(gift.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 text-gray-700">{gift.designation}</td>
                          <td className="py-3 px-4 text-right font-medium text-navy">
                            ${gift.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              {gift.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-navy flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your partnership? You will lose access to:
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 py-4">
            <li className="flex items-center gap-2 text-gray-700">
              <Check className="h-4 w-4 text-gray-400" />
              Partner-exclusive content and teachings
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <Check className="h-4 w-4 text-gray-400" />
              Priority prayer requests
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <Check className="h-4 w-4 text-gray-400" />
              Partner community network
            </li>
          </ul>

          <p className="text-sm text-gray-600">
            Your access will continue until {new Date(memberData.nextPaymentDate).toLocaleDateString()}, then you'll be downgraded to Free Member.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep My Partnership
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade Dialog */}
      <Dialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-navy">Downgrade to Partner?</DialogTitle>
            <DialogDescription>
              You will lose access to Covenant Partner benefits:
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 py-4">
            <li className="flex items-center gap-2 text-gray-700">
              <Check className="h-4 w-4 text-gray-400" />
              Quarterly 1-on-1 check-ins
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <Check className="h-4 w-4 text-gray-400" />
              Annual personal prophetic word
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <Check className="h-4 w-4 text-gray-400" />
              Direct message access
            </li>
          </ul>

          <p className="text-sm text-gray-600">
            Your new rate will be $50/month starting on your next billing date.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDowngradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDowngrade}>Confirm Downgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

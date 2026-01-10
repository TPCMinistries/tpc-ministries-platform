'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  User,
  Camera,
  Save,
  Loader2,
  Mail,
  Phone,
  Award,
  CheckCircle2,
  XCircle,
  Bell,
  Shield,
  Trash2,
  Key,
  AlertTriangle,
  Settings,
  Palette,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  type: 'success' | 'error'
  message: string
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Profile state
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    avatar_url: '',
    tier: 'free',
    created_at: '',
  })

  // Settings state
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    weekly_digest: true,
  })

  // Mock member data for billing
  const memberData = {
    tier: profile.tier,
    tierName: profile.tier === 'covenant' ? 'Covenant Partner' : profile.tier === 'partner' ? 'Partner' : 'Free Member',
    nextPaymentDate: '2024-02-15',
    nextPaymentAmount: profile.tier === 'covenant' ? 100 : 50,
    paymentMethod: '•••• 4242',
    subscriptionStatus: 'active',
    memberSince: profile.created_at,
  }

  const givingHistory = [
    { id: '1', date: '2024-01-15', amount: 50, designation: 'Monthly Partnership', status: 'completed' },
    { id: '2', date: '2023-12-15', amount: 50, designation: 'Monthly Partnership', status: 'completed' },
    { id: '3', date: '2023-12-25', amount: 100, designation: 'Christmas Offering', status: 'completed' },
    { id: '4', date: '2023-11-15', amount: 50, designation: 'Monthly Partnership', status: 'completed' },
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
    ],
    partner: [
      'All Free Member benefits',
      'Monthly partner-only teaching/Q&A',
      'Partner-exclusive prophetic words',
      'Priority prayer requests',
      'Early access to new content',
    ],
    covenant: [
      'All Partner benefits',
      'Quarterly 1-on-1 check-in (30 min)',
      'Personal prophetic word annually',
      'Direct message access',
      'Exclusive event invitations',
    ],
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (member) {
        setProfile({
          first_name: member.first_name || '',
          last_name: member.last_name || '',
          email: member.email || '',
          phone_number: member.phone_number || '',
          avatar_url: member.avatar_url || '',
          tier: member.tier || 'free',
          created_at: member.created_at,
        })

        setSettings({
          email_notifications: member.email_notifications ?? true,
          sms_notifications: member.sms_notifications ?? false,
          marketing_emails: true,
          weekly_digest: true,
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('members')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number,
        })
        .eq('user_id', user.id)

      if (!error) {
        setNotification({ type: 'success', message: 'Profile updated successfully!' })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setNotification({ type: 'error', message: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSettings = async (key: string, value: boolean) => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const updates: any = {}
      updates[key] = value

      await supabase
        .from('members')
        .update(updates)
        .eq('user_id', user.id)

      setSettings({ ...settings, [key]: value })
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const response = await fetch('/api/member/delete-account', { method: 'DELETE' })

      if (response.ok) {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/'
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('An error occurred while deleting your account')
    } finally {
      setDeleting(false)
    }
  }

  const handleManageSubscription = () => {
    alert('Opening Stripe Customer Portal...')
  }

  const handleCancelSubscription = () => {
    setShowCancelDialog(false)
    alert('Subscription canceled')
  }

  const handleDowngrade = () => {
    setShowDowngradeDialog(false)
    alert('Tier downgraded')
  }

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'covenant': return Crown
      case 'partner': return Sparkles
      default: return Check
    }
  }

  const TierIcon = getTierIcon(profile.tier)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 animate-in slide-in-from-top-2 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 text-gray-400 hover:text-gray-600">
              &times;
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile, settings, membership, and giving</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="membership" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Membership
            </TabsTrigger>
            <TabsTrigger value="giving" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Giving
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Profile Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="h-32 w-32 rounded-full bg-navy text-white flex items-center justify-center text-4xl font-bold">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </div>
                    <Button size="sm" className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="text-xl font-bold text-navy">{profile.first_name} {profile.last_name}</h3>
                  <Badge className="mt-2" variant={profile.tier === 'covenant' ? 'default' : 'outline'}>
                    {memberData.tierName}
                  </Badge>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>

              {/* Edit Profile Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profile.first_name}
                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profile.last_name}
                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <Input id="email" type="email" value={profile.email} disabled className="flex-1" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone_number}
                        onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Spiritual Profile */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gold" />
                  Your Spiritual Profile
                </CardTitle>
                <CardDescription>View your assessment results and spiritual gifts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Top Spiritual Gift</p>
                    <p className="text-lg font-semibold text-navy">Teaching</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Current Season</p>
                    <p className="text-lg font-semibold text-navy">Growth Season</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Assessments Taken</p>
                    <p className="text-lg font-semibold text-navy">3 of 6</p>
                  </div>
                </div>
                <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/my-assessments'}>
                  View Full Assessment Results
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-8 max-w-4xl">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive updates about new content and events</p>
                    </div>
                    <Switch
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => handleUpdateSettings('email_notifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Get text messages for important updates</p>
                    </div>
                    <Switch
                      checked={settings.sms_notifications}
                      onCheckedChange={(checked) => handleUpdateSettings('sms_notifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-gray-500">Receive updates about new features and offers</p>
                    </div>
                    <Switch
                      checked={settings.marketing_emails}
                      onCheckedChange={(checked) => setSettings({ ...settings, marketing_emails: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-gray-500">Get a weekly summary of your activity</p>
                    </div>
                    <Switch
                      checked={settings.weekly_digest}
                      onCheckedChange={(checked) => setSettings({ ...settings, weekly_digest: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize how the app looks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ThemeToggle />
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="mr-2 h-4 w-4" />
                    Update Email Address
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible account actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deleting}
                        >
                          {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Membership Tab */}
          <TabsContent value="membership" className="space-y-6">
            {/* Current Tier Card */}
            <Card className="border-2 border-gold/30">
              <CardHeader className="bg-gold/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gold/20 flex items-center justify-center">
                      <TierIcon className="h-8 w-8 text-gold" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-navy mb-1">
                        You are a {memberData.tierName}
                      </CardTitle>
                      <CardDescription className="text-base">
                        Thank you for being part of TPC Ministries!
                      </CardDescription>
                    </div>
                  </div>
                  {profile.tier !== 'covenant' && (
                    <Link href={`/partner/upgrade?tier=${profile.tier === 'free' ? 'partner' : 'covenant'}`}>
                      <Button className="bg-gold hover:bg-gold-dark">
                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                        Upgrade
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-navy mb-4">Your Benefits:</h3>
                  <ul className="grid gap-3 md:grid-cols-2">
                    {(tierBenefits[profile.tier as keyof typeof tierBenefits] || tierBenefits.free).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Member since {new Date(memberData.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Billing Card */}
            {profile.tier !== 'free' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Billing Information</CardTitle>
                  <CardDescription>Manage your subscription and payment details</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="font-medium text-navy">Status: <span className="capitalize">Active</span></span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Next Payment</p>
                        <p className="font-medium text-navy">
                          {new Date(memberData.nextPaymentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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

                  <div className="pt-4 border-t space-y-3">
                    <Button variant="outline" className="w-full justify-between" onClick={handleManageSubscription}>
                      <span>Manage Subscription</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-3">
                      {profile.tier === 'covenant' && (
                        <Button variant="outline" className="flex-1" onClick={() => setShowDowngradeDialog(true)}>
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
            {profile.tier === 'free' && (
              <Card className="border-2 border-gold">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-navy mb-2">Unlock More with Partnership</h3>
                      <p className="text-gray-700 mb-4">
                        Get exclusive content, priority support, and deeper engagement with our ministry.
                      </p>
                      <div className="flex gap-3">
                        <Link href="/partner/upgrade?tier=partner">
                          <Button className="bg-gold hover:bg-gold-dark">Become a Partner - $50/mo</Button>
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Designation</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {givingHistory.map((gift) => (
                        <tr key={gift.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-navy">
                            {new Date(gift.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-4 text-gray-700">{gift.designation}</td>
                          <td className="py-3 px-4 text-right font-medium text-navy">${gift.amount.toFixed(2)}</td>
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
              Are you sure you want to cancel your partnership? You will lose access to partner benefits.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep My Partnership</Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>Yes, Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downgrade Dialog */}
      <Dialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-navy">Downgrade to Partner?</DialogTitle>
            <DialogDescription>
              You will lose access to Covenant Partner benefits. Your new rate will be $50/month.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDowngradeDialog(false)}>Cancel</Button>
            <Button onClick={handleDowngrade}>Confirm Downgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

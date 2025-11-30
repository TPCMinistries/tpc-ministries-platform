'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell, Mail, Shield, Trash2, Key, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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

export default function MemberSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    weekly_digest: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('email_notifications, sms_notifications')
        .eq('user_id', user.id)
        .single()

      if (member) {
        setSettings({
          email_notifications: member.email_notifications ?? true,
          sms_notifications: member.sms_notifications ?? false,
          marketing_emails: true,
          weekly_digest: true,
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
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

  const [deleting, setDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const response = await fetch('/api/member/delete-account', {
        method: 'DELETE',
      })

      if (response.ok) {
        // Sign out and redirect to home
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

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

        {/* Subscription & Billing */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription & Billing</CardTitle>
            <CardDescription>Manage your membership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-navy">Current Plan</p>
                <p className="text-sm text-gray-600">Free Member</p>
              </div>
              <Button onClick={() => window.location.href = '/partner'}>Upgrade</Button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/account'}>
              View Billing History
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
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers, including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your profile and personal information</li>
                      <li>All assessment results</li>
                      <li>Content progress and bookmarks</li>
                      <li>Prayer requests and history</li>
                    </ul>
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
    </div>
  )
}

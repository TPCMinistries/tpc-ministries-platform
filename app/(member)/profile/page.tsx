'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Camera, Save, Loader2, Calendar, Mail, Phone, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function MemberProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    avatar_url: '',
    tier: 'free',
    created_at: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
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
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
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
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
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
        <h1 className="text-3xl font-bold text-navy mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

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
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="text-xl font-bold text-navy">{profile.first_name} {profile.last_name}</h3>
            <Badge className="mt-2" variant={profile.tier === 'covenant' ? 'default' : 'outline'}>
              {profile.tier === 'covenant' ? 'Covenant Partner' : profile.tier === 'partner' ? 'Partner' : 'Free Member'}
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
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="flex-1"
                />
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

            <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
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

      {/* Assessment Results Summary */}
      <Card>
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
          <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/member/assessments'}>
            View Full Assessment Results
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

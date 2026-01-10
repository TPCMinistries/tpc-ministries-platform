'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  User,
  Camera,
  ClipboardList,
  Users,
  Bell,
  Sunrise,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Circle,
  Home,
  Loader2,
  SkipForward,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

interface OnboardingData {
  progress: number
  profile_completed: boolean
  assessment_taken: boolean
  group_joined: boolean
  notifications_configured: boolean
  first_checkin_completed: boolean
  onboarding_completed: boolean
}

interface Assessment {
  id: string
  type: string
  name: string
  description: string
}

interface Group {
  id: string
  name: string
  description: string
  image_url?: string
  member_count: number
}

export default function WelcomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [memberId, setMemberId] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  // Profile form state
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bio, setBio] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Notification preferences
  const [notifyPrayer, setNotifyPrayer] = useState(true)
  const [notifyStreak, setNotifyStreak] = useState(true)
  const [notifyGroup, setNotifyGroup] = useState(true)
  const [notifyNewContent, setNotifyNewContent] = useState(true)

  useEffect(() => {
    fetchOnboardingData()
  }, [])

  const fetchOnboardingData = async () => {
    try {
      const res = await fetch('/api/member/onboarding')
      if (res.ok) {
        const data = await res.json()
        setOnboarding(data.onboarding)
        setMemberName(data.member?.first_name || 'Friend')
        setMemberId(data.member?.id || '')
        setAssessments(data.availableAssessments || [])
        setGroups(data.suggestedGroups || [])

        // Determine which step to show based on progress
        if (!data.onboarding?.profile_completed) {
          setCurrentStep(1)
        } else if (!data.onboarding?.assessment_taken) {
          setCurrentStep(2)
        } else if (!data.onboarding?.group_joined) {
          setCurrentStep(3)
        } else if (!data.onboarding?.notifications_configured) {
          setCurrentStep(4)
        } else if (!data.onboarding?.first_checkin_completed) {
          setCurrentStep(5)
        } else {
          setCurrentStep(6) // Complete
        }
      }
    } catch (error) {
      console.error('Error fetching onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Get started',
      icon: <Sparkles className="h-5 w-5" />,
      completed: true
    },
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add your photo and bio',
      icon: <User className="h-5 w-5" />,
      completed: onboarding?.profile_completed || false
    },
    {
      id: 'assessment',
      title: 'Take Assessment',
      description: 'Discover your gifts',
      icon: <ClipboardList className="h-5 w-5" />,
      completed: onboarding?.assessment_taken || false
    },
    {
      id: 'group',
      title: 'Join a Group',
      description: 'Connect with others',
      icon: <Users className="h-5 w-5" />,
      completed: onboarding?.group_joined || false
    },
    {
      id: 'notifications',
      title: 'Set Notifications',
      description: 'Stay updated',
      icon: <Bell className="h-5 w-5" />,
      completed: onboarding?.notifications_configured || false
    },
    {
      id: 'checkin',
      title: 'First Check-in',
      description: 'Start your streak',
      icon: <Sunrise className="h-5 w-5" />,
      completed: onboarding?.first_checkin_completed || false
    }
  ]

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${memberId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setAvatarUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from('members')
          .update({
            avatar_url: avatarUrl || undefined,
            bio: bio || undefined
          })
          .eq('user_id', user.id)

        // Move to next step
        setCurrentStep(2)
        fetchOnboardingData()
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const skipStep = async (stepName: string) => {
    try {
      await fetch('/api/member/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skip_step: stepName })
      })
      setCurrentStep(currentStep + 1)
      fetchOnboardingData()
    } catch (error) {
      console.error('Error skipping step:', error)
    }
  }

  const saveNotifications = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Save notification preferences
        await supabase
          .from('notification_preferences')
          .upsert({
            user_id: user.id,
            prayer_updates: notifyPrayer,
            streak_reminders: notifyStreak,
            group_updates: notifyGroup,
            new_content: notifyNewContent
          }, { onConflict: 'user_id' })

        // Mark notifications as configured
        await fetch('/api/member/onboarding', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notifications_configured: true })
        })

        setCurrentStep(5)
        fetchOnboardingData()
      }
    } catch (error) {
      console.error('Error saving notifications:', error)
    } finally {
      setSaving(false)
    }
  }

  const progress = onboarding?.progress || 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-navy dark:text-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Progress Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Getting Started
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {progress}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => index <= currentStep && setCurrentStep(index)}
                className={`flex flex-col items-center ${index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                disabled={index > currentStep}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-navy dark:bg-gold text-white dark:text-navy'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-36 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="text-center space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-gold" />
                </div>
                <h1 className="text-4xl font-bold text-navy dark:text-white">
                  Welcome, {memberName}!
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                  Let's set up your account so you can get the most out of your TPC experience.
                </p>
              </div>

              <Card className="text-left dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                    Here's what we'll do:
                  </h3>
                  <div className="space-y-3">
                    {steps.slice(1).map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
                          {step.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{step.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline">Skip for Now</Button>
                </Link>
                <Button
                  className="bg-navy hover:bg-navy/90 dark:bg-gold dark:text-navy dark:hover:bg-gold/90"
                  onClick={() => setCurrentStep(1)}
                >
                  Let's Go
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-navy dark:text-white">
                  Complete Your Profile
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Help others in the community get to know you
                </p>
              </div>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6 space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-navy text-white text-2xl">
                        {memberName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                      <Button variant="outline" size="sm" disabled={uploadingAvatar} asChild>
                        <span>
                          {uploadingAvatar ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4 mr-2" />
                          )}
                          Upload Photo
                        </span>
                      </Button>
                    </label>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Tell us about yourself</Label>
                    <Textarea
                      id="bio"
                      placeholder="Share a bit about your faith journey, interests, or how you'd like to grow..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      maxLength={500}
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                    <p className="text-xs text-gray-500 text-right">{bio.length}/500</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => skipStep('profile')}>
                    <SkipForward className="mr-2 h-4 w-4" />
                    Skip
                  </Button>
                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-navy hover:bg-navy/90 dark:bg-gold dark:text-navy"
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Assessment */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-navy dark:text-white">
                  Discover Your Gifts
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Take an assessment to learn more about yourself
                </p>
              </div>

              <div className="grid gap-4">
                {assessments.slice(0, 4).map((assessment) => (
                  <Link key={assessment.id} href={`/my-assessments?start=${assessment.type}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-navy dark:text-white">
                              {assessment.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {assessment.description}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                We recommend starting with the Spiritual Gifts assessment
              </p>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="ghost" onClick={() => skipStep('assessment')}>
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip for Now
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Join Group */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-navy dark:text-white">
                  Join a Group
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect with others on similar journeys
                </p>
              </div>

              {groups.length > 0 ? (
                <div className="grid gap-4">
                  {groups.map((group) => (
                    <Link key={group.id} href={`/groups/${group.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-navy/10 dark:bg-gold/20 flex items-center justify-center">
                              <Users className="h-6 w-6 text-navy dark:text-gold" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-navy dark:text-white">
                                {group.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                {group.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {group.member_count} members
                              </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Check out all available groups
                    </p>
                    <Link href="/groups">
                      <Button className="mt-4 bg-navy hover:bg-navy/90">
                        Browse Groups
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="ghost" onClick={() => skipStep('group')}>
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip for Now
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Notifications */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-navy dark:text-white">
                  Stay Connected
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose what updates you'd like to receive
                </p>
              </div>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Prayer Updates</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified when someone prays for you
                      </p>
                    </div>
                    <Switch checked={notifyPrayer} onCheckedChange={setNotifyPrayer} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Streak Reminders</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Don't lose your daily streak
                      </p>
                    </div>
                    <Switch checked={notifyStreak} onCheckedChange={setNotifyStreak} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Group Updates</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Activity from your groups
                      </p>
                    </div>
                    <Switch checked={notifyGroup} onCheckedChange={setNotifyGroup} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">New Content</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        New teachings and resources
                      </p>
                    </div>
                    <Switch checked={notifyNewContent} onCheckedChange={setNotifyNewContent} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={saveNotifications}
                  disabled={saving}
                  className="bg-navy hover:bg-navy/90 dark:bg-gold dark:text-navy"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: First Check-in */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-navy dark:text-white">
                  Start Your Streak
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete your first daily check-in
                </p>
              </div>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gold/20 to-orange-100 dark:from-gold/30 dark:to-orange-900/30 flex items-center justify-center mx-auto mb-6">
                    <Sunrise className="h-10 w-10 text-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy dark:text-white mb-2">
                    Daily Check-in
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start each day by checking in, setting your prayer focus, and tracking your spiritual journey.
                  </p>
                  <Link href="/daily-checkin">
                    <Button className="bg-gold hover:bg-gold/90 text-navy">
                      <Sunrise className="mr-2 h-5 w-5" />
                      Go to Daily Check-in
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="ghost" onClick={() => skipStep('checkin')}>
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip for Now
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Complete */}
          {currentStep === 6 && (
            <div className="text-center space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-navy dark:text-white">
                  You're All Set!
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                  Your account is ready. Welcome to the TPC family!
                </p>
              </div>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                      <Sparkles className="h-6 w-6 text-gold" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-navy dark:text-white">
                        Pro Tip: Ask Prophet Lorenzo
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Have a spiritual question? Our AI assistant can help guide you.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Link href="/dashboard">
                <Button size="lg" className="bg-navy hover:bg-navy/90 dark:bg-gold dark:text-navy">
                  <Home className="mr-2 h-5 w-5" />
                  Go to My Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

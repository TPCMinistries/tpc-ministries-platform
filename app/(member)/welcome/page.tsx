'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Calendar,
  Heart,
  MessageSquare,
  DollarSign,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Play,
  ChevronRight,
  Home,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  color: string
}

const features: Feature[] = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Daily Scripture',
    description: 'Start each day with God\'s Word and guided devotionals',
    href: '/devotional',
    color: 'bg-blue-500',
  },
  {
    icon: <Play className="h-6 w-6" />,
    title: 'Teachings & Sermons',
    description: 'Watch and listen to powerful messages',
    href: '/content',
    color: 'bg-purple-500',
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Prayer Requests',
    description: 'Submit prayer needs and pray for others',
    href: '/my-prayers',
    color: 'bg-red-500',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Ask Prophet Lorenzo',
    description: 'Get AI-powered spiritual guidance',
    href: '/ask-prophet-lorenzo',
    color: 'bg-gold',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Community Groups',
    description: 'Connect with like-minded believers',
    href: '/groups',
    color: 'bg-green-500',
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: 'Events',
    description: 'Join services, conferences, and gatherings',
    href: '/events',
    color: 'bg-orange-500',
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: 'Give',
    description: 'Support the ministry with tithes and offerings',
    href: '/give',
    color: 'bg-emerald-500',
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'Messages',
    description: 'Stay connected with ministry updates',
    href: '/messages',
    color: 'bg-indigo-500',
  },
]

export default function WelcomePage() {
  const router = useRouter()
  const [memberName, setMemberName] = useState('')
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMember = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: member } = await supabase
          .from('members')
          .select('first_name')
          .eq('user_id', user.id)
          .single()

        if (member) {
          setMemberName(member.first_name || 'Friend')
        }
      }
      setLoading(false)
    }

    fetchMember()
  }, [])

  const totalSteps = 3
  const progress = ((step + 1) / totalSteps) * 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-navy">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Getting Started</span>
            <span className="text-sm text-gray-600">{step + 1} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-gold" />
                </div>
                <h1 className="text-4xl font-bold text-navy">
                  Welcome to TPC Ministries, {memberName}!
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  We're so glad you're here. Let's take a quick tour of everything
                  available to help you grow in your faith.
                </p>
              </div>

              <Card className="max-w-lg mx-auto">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-gray-700">Account created successfully</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-gray-700">Email verified</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <ArrowRight className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Explore your new home</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="bg-navy hover:bg-navy/90"
                onClick={() => setStep(1)}
              >
                Let's Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 1: Features Tour */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-navy">
                  Everything You Need for Your Journey
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Here's what's available to you as a TPC Ministries member
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => {}}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`${feature.color} text-white p-3 rounded-lg shrink-0`}>
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-navy group-hover:text-gold transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {feature.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-navy transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  className="bg-navy hover:bg-navy/90"
                  onClick={() => setStep(2)}
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Quick Actions */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-navy">
                  You're All Set!
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Your account is ready. Here are some things you can do right now:
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
                <Link href="/devotional">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer text-center p-6">
                    <BookOpen className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-navy">Read Today's Scripture</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Start your day with God's Word
                    </p>
                  </Card>
                </Link>

                <Link href="/account">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer text-center p-6">
                    <Users className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-navy">Complete Your Profile</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Add your photo and info
                    </p>
                  </Card>
                </Link>

                <Link href="/content">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer text-center p-6">
                    <Play className="h-10 w-10 text-gold mx-auto mb-3" />
                    <h3 className="font-semibold text-navy">Watch a Teaching</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Browse our content library
                    </p>
                  </Card>
                </Link>
              </div>

              <Card className="max-w-2xl mx-auto bg-navy text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                      <Sparkles className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Pro Tip: Ask Prophet Lorenzo</h3>
                      <p className="text-gray-300 text-sm">
                        Have a spiritual question? Our AI assistant is trained on biblical wisdom
                        and can help guide you anytime.
                      </p>
                    </div>
                    <Link href="/ask-prophet-lorenzo">
                      <Button variant="secondary" size="sm">
                        Try It
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Link href="/dashboard">
                  <Button className="bg-gold hover:bg-gold/90 text-navy">
                    <Home className="mr-2 h-5 w-5" />
                    Go to My Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

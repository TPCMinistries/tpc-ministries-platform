'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen,
  Calendar,
  Flame,
  Play,
  CheckCircle2,
  Clock,
  ChevronRight,
  Star,
  Trophy
} from 'lucide-react'
import Link from 'next/link'

interface ReadingPlan {
  id: string
  title: string
  description: string
  duration_days: number
  plan_type: string
  cover_image_url?: string
  is_featured: boolean
}

interface MyPlan {
  id: string
  plan_id: string
  current_day: number
  started_at: string
  streak_days: number
  last_read_at?: string
  plan: ReadingPlan
}

export default function ReadingPlansPage() {
  const [availablePlans, setAvailablePlans] = useState<ReadingPlan[]>([])
  const [myPlans, setMyPlans] = useState<MyPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (member) {
      setMemberId(member.id)

      // Fetch my active plans
      const { data: progress } = await supabase
        .from('member_reading_progress')
        .select(`
          *,
          plan:reading_plans(*)
        `)
        .eq('member_id', member.id)
        .eq('is_active', true)

      if (progress) {
        setMyPlans(progress as any)
      }
    }

    // Fetch all available plans
    const { data: plans } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })

    if (plans) {
      setAvailablePlans(plans)
    }

    setLoading(false)
  }

  const startPlan = async (planId: string) => {
    if (!memberId) return

    const supabase = createClient()

    await supabase.from('member_reading_progress').insert({
      member_id: memberId,
      plan_id: planId,
      current_day: 1,
      streak_days: 0
    })

    fetchData()
  }

  const getPlanTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      bible: 'bg-blue-100 text-blue-800',
      topical: 'bg-purple-100 text-purple-800',
      devotional: 'bg-gold/20 text-amber-800',
      book: 'bg-green-100 text-green-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getProgressPercent = (current: number, total: number) => {
    return Math.round((current / total) * 100)
  }

  const isToday = (dateStr?: string) => {
    if (!dateStr) return false
    const date = new Date(dateStr)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Reading Plans</h1>
          </div>
          <p className="text-gray-600">
            Grow deeper in God's Word with structured daily readings
          </p>
        </div>

        <Tabs defaultValue={myPlans.length > 0 ? "my-plans" : "discover"} className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-plans" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              My Plans {myPlans.length > 0 && `(${myPlans.length})`}
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Discover
            </TabsTrigger>
          </TabsList>

          {/* My Active Plans */}
          <TabsContent value="my-plans">
            {myPlans.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Active Plans
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start a reading plan to build a daily habit of Scripture reading
                  </p>
                  <Button
                    onClick={() => document.querySelector('[value="discover"]')?.dispatchEvent(new Event('click'))}
                    className="bg-navy hover:bg-navy/90"
                  >
                    Browse Plans
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {myPlans.map((myPlan) => (
                  <Card key={myPlan.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-32 bg-gradient-to-br from-navy to-navy/70 relative">
                      {myPlan.plan.cover_image_url && (
                        <img
                          src={myPlan.plan.cover_image_url}
                          alt=""
                          className="w-full h-full object-cover opacity-50"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <p className="text-sm opacity-80">Day</p>
                          <p className="text-4xl font-bold">{myPlan.current_day}</p>
                          <p className="text-sm opacity-80">of {myPlan.plan.duration_days}</p>
                        </div>
                      </div>

                      {/* Streak Badge */}
                      {myPlan.streak_days > 0 && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-orange-500 text-white">
                            <Flame className="h-3 w-3 mr-1" />
                            {myPlan.streak_days} day streak
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-navy mb-2">
                        {myPlan.plan.title}
                      </h3>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{getProgressPercent(myPlan.current_day, myPlan.plan.duration_days)}%</span>
                        </div>
                        <Progress
                          value={getProgressPercent(myPlan.current_day, myPlan.plan.duration_days)}
                          className="h-2"
                        />
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        {isToday(myPlan.last_read_at) ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed Today
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Today's Reading Waiting
                          </Badge>
                        )}

                        <Link href={`/reading-plans/${myPlan.plan_id}`}>
                          <Button size="sm" className="bg-gold hover:bg-gold/90 text-navy">
                            Continue
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Discover Plans */}
          <TabsContent value="discover">
            {/* Featured Plans */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-gold" />
                Featured Plans
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availablePlans.filter(p => p.is_featured).map((plan) => {
                  const isActive = myPlans.some(mp => mp.plan_id === plan.id)

                  return (
                    <Card key={plan.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-40 bg-gradient-to-br from-navy to-navy/70 relative">
                        {plan.cover_image_url && (
                          <img
                            src={plan.cover_image_url}
                            alt=""
                            className="w-full h-full object-cover opacity-50"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60">
                          <h3 className="font-bold text-lg text-white">{plan.title}</h3>
                        </div>
                        <Badge className="absolute top-3 right-3 bg-gold text-navy">
                          Featured
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {plan.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getPlanTypeColor(plan.plan_type)}>
                              {plan.plan_type}
                            </Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {plan.duration_days} days
                            </span>
                          </div>

                          {isActive ? (
                            <Link href={`/reading-plans/${plan.id}`}>
                              <Button size="sm" variant="outline">
                                Continue
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => startPlan(plan.id)}
                              className="bg-navy hover:bg-navy/90"
                            >
                              Start Plan
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* All Plans */}
            <div>
              <h2 className="text-xl font-bold text-navy mb-4">All Plans</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availablePlans.filter(p => !p.is_featured).map((plan) => {
                  const isActive = myPlans.some(mp => mp.plan_id === plan.id)

                  return (
                    <Card key={plan.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-navy">{plan.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {plan.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getPlanTypeColor(plan.plan_type)}>
                              {plan.plan_type}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {plan.duration_days} days
                            </span>
                          </div>

                          {isActive ? (
                            <Link href={`/reading-plans/${plan.id}`}>
                              <Button size="sm" variant="outline">
                                Continue
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => startPlan(plan.id)}
                              className="bg-navy hover:bg-navy/90"
                            >
                              Start
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

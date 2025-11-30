'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import {
  Utensils,
  Calendar,
  Flame,
  Target,
  Clock,
  CheckCircle2,
  Plus,
  Sparkles,
  Heart,
  BookOpen,
  Users
} from 'lucide-react'

interface FastingEvent {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  fast_type: string
  prayer_focus?: string
}

interface FastingLog {
  id: string
  fast_date: string
  fast_type: string
  completed: boolean
  prayer_focus?: string
  reflections?: string
  breakthroughs?: string
  event_id?: string
}

export default function FastingPage() {
  const [events, setEvents] = useState<FastingEvent[]>([])
  const [myLogs, setMyLogs] = useState<FastingLog[]>([])
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [showLogForm, setShowLogForm] = useState(false)
  const [logForm, setLogForm] = useState({
    fast_type: 'partial',
    prayer_focus: '',
    reflections: '',
    breakthroughs: ''
  })
  const [submitting, setSubmitting] = useState(false)

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

      // Fetch my fasting logs
      const { data: logs } = await supabase
        .from('fasting_logs')
        .select('*')
        .eq('member_id', member.id)
        .order('fast_date', { ascending: false })
        .limit(30)

      if (logs) {
        setMyLogs(logs)
      }
    }

    // Fetch active fasting events
    const today = new Date().toISOString().split('T')[0]
    const { data: eventsData } = await supabase
      .from('fasting_events')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', today)
      .order('start_date')

    if (eventsData) {
      setEvents(eventsData)
    }

    setLoading(false)
  }

  const logFast = async () => {
    if (!memberId) return

    setSubmitting(true)
    const supabase = createClient()

    await supabase.from('fasting_logs').insert({
      member_id: memberId,
      fast_date: new Date().toISOString().split('T')[0],
      fast_type: logForm.fast_type,
      prayer_focus: logForm.prayer_focus,
      reflections: logForm.reflections,
      breakthroughs: logForm.breakthroughs,
      completed: true
    })

    setSubmitting(false)
    setShowLogForm(false)
    setLogForm({ fast_type: 'partial', prayer_focus: '', reflections: '', breakthroughs: '' })
    fetchData()
  }

  const getFastTypeInfo = (type: string) => {
    const types: Record<string, { label: string; description: string; icon: any }> = {
      full: { label: 'Full Fast', description: 'No food, water only', icon: Target },
      partial: { label: 'Partial Fast', description: 'Specific foods or meals', icon: Utensils },
      daniel: { label: 'Daniel Fast', description: 'Fruits, vegetables, water', icon: Heart },
      social_media: { label: 'Social Media Fast', description: 'No social media', icon: Users },
      custom: { label: 'Custom Fast', description: 'Your own commitment', icon: Sparkles }
    }
    return types[type] || types.custom
  }

  const todayLogged = myLogs.some(
    log => log.fast_date === new Date().toISOString().split('T')[0]
  )

  const currentStreak = () => {
    let streak = 0
    const today = new Date()

    for (let i = 0; i < myLogs.length; i++) {
      const logDate = new Date(myLogs[i].fast_date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (logDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }
    return streak
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Utensils className="h-8 w-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Fasting</h1>
          </div>
          <p className="text-gray-600">
            Draw closer to God through fasting and prayer
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{currentStreak()}</p>
              <p className="text-xs opacity-80">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-navy" />
              <p className="text-2xl font-bold text-navy">{myLogs.length}</p>
              <p className="text-xs text-gray-500">Total Fasts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold text-navy">
                {myLogs.filter(l => l.breakthroughs).length}
              </p>
              <p className="text-xs text-gray-500">Breakthroughs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {todayLogged ? (
                <>
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium text-green-600">Logged Today</p>
                </>
              ) : (
                <>
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-500">Not Logged</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Log Today's Fast Button */}
        {!todayLogged && !showLogForm && (
          <Card className="mb-8 bg-gradient-to-r from-navy to-navy/80 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Are you fasting today?</h3>
              <p className="opacity-80 mb-4">Log your fast to track your journey</p>
              <Button
                onClick={() => setShowLogForm(true)}
                className="bg-gold hover:bg-gold/90 text-navy"
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Today's Fast
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Log Form */}
        {showLogForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Log Your Fast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fast Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Type of Fast
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['full', 'partial', 'daniel', 'social_media', 'custom'].map((type) => {
                    const info = getFastTypeInfo(type)
                    const Icon = info.icon
                    return (
                      <button
                        key={type}
                        onClick={() => setLogForm({ ...logForm, fast_type: type })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          logForm.fast_type === type
                            ? 'border-navy bg-navy/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-2 ${logForm.fast_type === type ? 'text-navy' : 'text-gray-400'}`} />
                        <p className={`font-medium text-sm ${logForm.fast_type === type ? 'text-navy' : 'text-gray-700'}`}>
                          {info.label}
                        </p>
                        <p className="text-xs text-gray-500">{info.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Prayer Focus */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Prayer Focus
                </label>
                <Textarea
                  placeholder="What are you praying for during this fast?"
                  value={logForm.prayer_focus}
                  onChange={(e) => setLogForm({ ...logForm, prayer_focus: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Reflections */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Reflections
                </label>
                <Textarea
                  placeholder="What is God speaking to you? Any insights?"
                  value={logForm.reflections}
                  onChange={(e) => setLogForm({ ...logForm, reflections: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Breakthroughs */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Breakthroughs
                </label>
                <Textarea
                  placeholder="Any breakthroughs or answered prayers?"
                  value={logForm.breakthroughs}
                  onChange={(e) => setLogForm({ ...logForm, breakthroughs: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={logFast}
                  disabled={submitting}
                  className="flex-1 bg-navy hover:bg-navy/90"
                >
                  {submitting ? 'Saving...' : 'Log Fast'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLogForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">Church Fasts</TabsTrigger>
            <TabsTrigger value="history">My History</TabsTrigger>
          </TabsList>

          {/* Church Fasting Events */}
          <TabsContent value="events">
            {events.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Active Church Fasts
                  </h3>
                  <p className="text-gray-500">
                    Check back later for upcoming fasting events
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => {
                  const isActive = new Date(event.start_date) <= new Date() &&
                                   new Date(event.end_date) >= new Date()
                  const daysRemaining = Math.ceil(
                    (new Date(event.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )

                  return (
                    <Card key={event.id} className={isActive ? 'ring-2 ring-gold' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg text-navy">{event.title}</h3>
                              {isActive && (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              )}
                              <Badge className="bg-gray-100 text-gray-800">
                                {getFastTypeInfo(event.fast_type).label}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-gray-600 mb-3">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                              </span>
                              {isActive && (
                                <span className="text-green-600">
                                  {daysRemaining} days remaining
                                </span>
                              )}
                            </div>
                            {event.prayer_focus && (
                              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-800 flex items-center gap-2">
                                  <Heart className="h-4 w-4" />
                                  Prayer Focus: {event.prayer_focus}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* My Fasting History */}
          <TabsContent value="history">
            {myLogs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Fasting History
                  </h3>
                  <p className="text-gray-500">
                    Start logging your fasts to track your journey
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myLogs.map((log) => {
                  const info = getFastTypeInfo(log.fast_type)
                  const Icon = info.icon

                  return (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-navy">{info.label}</p>
                              <span className="text-sm text-gray-500">
                                {new Date(log.fast_date).toLocaleDateString()}
                              </span>
                            </div>
                            {log.prayer_focus && (
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Prayer:</strong> {log.prayer_focus}
                              </p>
                            )}
                            {log.breakthroughs && (
                              <div className="bg-green-50 p-2 rounded text-sm text-green-700">
                                <Sparkles className="h-3 w-3 inline mr-1" />
                                {log.breakthroughs}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

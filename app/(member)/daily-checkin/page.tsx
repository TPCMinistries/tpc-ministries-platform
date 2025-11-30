'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  Sun,
  Moon,
  Heart,
  BookOpen,
  Target,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Flame,
  Calendar,
  Star
} from 'lucide-react'

interface DailyScripture {
  id: string
  scripture_reference: string
  scripture_text: string
  reflection: string
  theme: string
}

interface CheckinData {
  gratitude_entry: string
  prayer_focus: string
  scripture_reflection: string
  goals_for_day: string[]
  mood_rating: number
  god_moments: string
  tomorrow_prayer: string
  day_rating: number
}

export default function DailyCheckinPage() {
  const [currentTime, setCurrentTime] = useState<'morning' | 'evening'>('morning')
  const [scripture, setScripture] = useState<DailyScripture | null>(null)
  const [checkinData, setCheckinData] = useState<CheckinData>({
    gratitude_entry: '',
    prayer_focus: '',
    scripture_reflection: '',
    goals_for_day: ['', '', ''],
    mood_rating: 3,
    god_moments: '',
    tomorrow_prayer: '',
    day_rating: 3
  })
  const [todayMorningDone, setTodayMorningDone] = useState(false)
  const [todayEveningDone, setTodayEveningDone] = useState(false)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)

  useEffect(() => {
    // Determine if morning or evening based on time
    const hour = new Date().getHours()
    setCurrentTime(hour < 17 ? 'morning' : 'evening')

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

      // Check if already completed today
      const today = new Date().toISOString().split('T')[0]

      const { data: morningCheckin } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('member_id', member.id)
        .eq('checkin_date', today)
        .eq('checkin_type', 'morning')
        .single()

      setTodayMorningDone(!!morningCheckin)

      const { data: eveningCheckin } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('member_id', member.id)
        .eq('checkin_date', today)
        .eq('checkin_type', 'evening')
        .single()

      setTodayEveningDone(!!eveningCheckin)

      // Calculate streak (simplified)
      const { count } = await supabase
        .from('daily_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', member.id)
        .gte('checkin_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      setStreak(count || 0)
    }

    // Fetch today's scripture
    const today = new Date().toISOString().split('T')[0]
    const { data: scriptureData } = await supabase
      .from('daily_scriptures')
      .select('*')
      .eq('scripture_date', today)
      .single()

    if (scriptureData) {
      setScripture(scriptureData)
    }

    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!memberId) return

    setSubmitting(true)
    const supabase = createClient()

    const today = new Date().toISOString().split('T')[0]

    const checkinRecord: any = {
      member_id: memberId,
      checkin_date: today,
      checkin_type: currentTime
    }

    if (currentTime === 'morning') {
      checkinRecord.gratitude_entry = checkinData.gratitude_entry
      checkinRecord.prayer_focus = checkinData.prayer_focus
      checkinRecord.scripture_reflection = checkinData.scripture_reflection
      checkinRecord.goals_for_day = checkinData.goals_for_day.filter(g => g.trim())
      checkinRecord.mood_rating = checkinData.mood_rating
    } else {
      checkinRecord.god_moments = checkinData.god_moments
      checkinRecord.tomorrow_prayer = checkinData.tomorrow_prayer
      checkinRecord.day_rating = checkinData.day_rating
    }

    await supabase.from('daily_checkins').insert(checkinRecord)

    if (currentTime === 'morning') {
      setTodayMorningDone(true)
    } else {
      setTodayEveningDone(true)
    }

    setSubmitting(false)
  }

  const renderMoodSelector = (field: 'mood_rating' | 'day_rating', label: string) => {
    const value = checkinData[field]
    const emojis = ['😔', '😕', '😐', '🙂', '😊']

    return (
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
        <div className="flex gap-2 justify-center">
          {emojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => setCheckinData({ ...checkinData, [field]: idx + 1 })}
              className={`text-3xl p-2 rounded-full transition-all ${
                value === idx + 1
                  ? 'bg-gold/20 scale-125 ring-2 ring-gold'
                  : 'hover:bg-gray-100'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  const isComplete = currentTime === 'morning' ? todayMorningDone : todayEveningDone

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy/5 to-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {currentTime === 'morning' ? (
              <Sun className="h-10 w-10 text-gold" />
            ) : (
              <Moon className="h-10 w-10 text-navy" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-navy mb-2">
            {currentTime === 'morning' ? 'Good Morning' : 'Good Evening'}
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>

          {/* Streak Badge */}
          {streak > 0 && (
            <Badge className="bg-orange-100 text-orange-700 mt-3">
              <Flame className="h-4 w-4 mr-1" />
              {streak} day check-in streak!
            </Badge>
          )}
        </div>

        {/* Time Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={currentTime === 'morning' ? 'default' : 'outline'}
            onClick={() => setCurrentTime('morning')}
            className={currentTime === 'morning' ? 'bg-gold text-navy' : ''}
          >
            <Sun className="h-4 w-4 mr-2" />
            Morning
            {todayMorningDone && <CheckCircle2 className="h-4 w-4 ml-2 text-green-600" />}
          </Button>
          <Button
            variant={currentTime === 'evening' ? 'default' : 'outline'}
            onClick={() => setCurrentTime('evening')}
            className={currentTime === 'evening' ? 'bg-navy' : ''}
          >
            <Moon className="h-4 w-4 mr-2" />
            Evening
            {todayEveningDone && <CheckCircle2 className="h-4 w-4 ml-2 text-green-600" />}
          </Button>
        </div>

        {isComplete ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-navy mb-2">
                {currentTime === 'morning' ? 'Morning' : 'Evening'} Check-in Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                Great job staying consistent in your spiritual rhythm.
              </p>
              {currentTime === 'morning' && !todayEveningDone && (
                <p className="text-sm text-gray-500">
                  Come back this evening for your reflection time.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Scripture of the Day */}
            {scripture && currentTime === 'morning' && (
              <Card className="bg-gradient-to-br from-gold/10 to-amber-50 border-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-navy">
                    <BookOpen className="h-5 w-5 text-gold" />
                    Scripture of the Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-lg italic text-navy mb-2">
                    "{scripture.scripture_text}"
                  </blockquote>
                  <p className="text-sm font-medium text-gray-700">
                    — {scripture.scripture_reference}
                  </p>
                  {scripture.reflection && (
                    <p className="text-sm text-gray-600 mt-4 border-t pt-4">
                      {scripture.reflection}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Morning Check-in Form */}
            {currentTime === 'morning' && (
              <>
                {/* Gratitude */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-navy text-lg">
                      <Heart className="h-5 w-5 text-red-500" />
                      Gratitude
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="What are you thankful for this morning?"
                      value={checkinData.gratitude_entry}
                      onChange={(e) => setCheckinData({ ...checkinData, gratitude_entry: e.target.value })}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Prayer Focus */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-navy text-lg">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Prayer Focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="What will you pray about today? Who needs prayer?"
                      value={checkinData.prayer_focus}
                      onChange={(e) => setCheckinData({ ...checkinData, prayer_focus: e.target.value })}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Scripture Reflection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-navy text-lg">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      Scripture Reflection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="What does today's scripture mean to you?"
                      value={checkinData.scripture_reflection}
                      onChange={(e) => setCheckinData({ ...checkinData, scripture_reflection: e.target.value })}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Goals for Today */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-navy text-lg">
                      <Target className="h-5 w-5 text-green-500" />
                      Goals for Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 w-6">{idx + 1}.</span>
                        <input
                          type="text"
                          placeholder={`Goal ${idx + 1}`}
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                          value={checkinData.goals_for_day[idx]}
                          onChange={(e) => {
                            const newGoals = [...checkinData.goals_for_day]
                            newGoals[idx] = e.target.value
                            setCheckinData({ ...checkinData, goals_for_day: newGoals })
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Mood */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy text-lg">How are you feeling?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderMoodSelector('mood_rating', '')}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Evening Check-in Form */}
            {currentTime === 'evening' && (
              <>
                {/* God Moments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-navy text-lg">
                      <Star className="h-5 w-5 text-gold" />
                      God Moments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Where did you see God move today? What prayers were answered?"
                      value={checkinData.god_moments}
                      onChange={(e) => setCheckinData({ ...checkinData, god_moments: e.target.value })}
                      rows={4}
                    />
                  </CardContent>
                </Card>

                {/* Prayer for Tomorrow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-navy text-lg">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Prayer for Tomorrow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="What do you want to lift up to God for tomorrow?"
                      value={checkinData.tomorrow_prayer}
                      onChange={(e) => setCheckinData({ ...checkinData, tomorrow_prayer: e.target.value })}
                      rows={3}
                    />
                  </CardContent>
                </Card>

                {/* Day Rating */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy text-lg">How was your day?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderMoodSelector('day_rating', '')}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-navy hover:bg-navy/90 text-white py-6 text-lg"
            >
              {submitting ? (
                'Saving...'
              ) : (
                <>
                  Complete {currentTime === 'morning' ? 'Morning' : 'Evening'} Check-in
                  <ChevronRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

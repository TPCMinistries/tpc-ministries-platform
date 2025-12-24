'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  ChevronLeft,
  Flame,
  Star,
  Quote,
  Loader2,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

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

const morningSteps = [
  { id: 'welcome', title: 'Welcome', icon: Sun },
  { id: 'scripture', title: 'Scripture', icon: BookOpen },
  { id: 'gratitude', title: 'Gratitude', icon: Heart },
  { id: 'prayer', title: 'Prayer', icon: Sparkles },
  { id: 'goals', title: 'Goals', icon: Target },
  { id: 'mood', title: 'How You Feel', icon: Star },
]

const eveningSteps = [
  { id: 'welcome', title: 'Welcome', icon: Moon },
  { id: 'god-moments', title: 'God Moments', icon: Star },
  { id: 'tomorrow', title: 'Tomorrow', icon: Sparkles },
  { id: 'rating', title: 'Reflection', icon: Heart },
]

export default function DailyCheckinPage() {
  const [currentTime, setCurrentTime] = useState<'morning' | 'evening'>('morning')
  const [currentStep, setCurrentStep] = useState(0)
  const [scripture, setScripture] = useState<DailyScripture | null>(null)
  const [memberName, setMemberName] = useState('')
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
  const [showCompletion, setShowCompletion] = useState(false)

  const steps = currentTime === 'morning' ? morningSteps : eveningSteps
  const totalSteps = steps.length

  useEffect(() => {
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
      .select('id, first_name')
      .eq('user_id', user.id)
      .single()

    if (member) {
      setMemberId(member.id)
      setMemberName(member.first_name || '')

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

      const { count } = await supabase
        .from('daily_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', member.id)
        .gte('checkin_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      setStreak(count || 0)
    }

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

    setShowCompletion(true)
    setSubmitting(false)
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderMoodSelector = (field: 'mood_rating' | 'day_rating') => {
    const value = checkinData[field]
    const moods = [
      { emoji: '😔', label: 'Struggling', color: 'from-gray-400 to-gray-500' },
      { emoji: '😕', label: 'Difficult', color: 'from-blue-400 to-blue-500' },
      { emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-yellow-500' },
      { emoji: '🙂', label: 'Good', color: 'from-green-400 to-green-500' },
      { emoji: '😊', label: 'Wonderful', color: 'from-gold to-amber-500' },
    ]

    return (
      <div className="grid grid-cols-5 gap-3">
        {moods.map((mood, idx) => (
          <button
            key={idx}
            onClick={() => setCheckinData({ ...checkinData, [field]: idx + 1 })}
            className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
              value === idx + 1
                ? `bg-gradient-to-br ${mood.color} text-white scale-105 shadow-lg`
                : 'bg-white/60 hover:bg-white/80 hover:scale-102'
            }`}
          >
            <span className="text-4xl mb-2">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        currentTime === 'morning'
          ? 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100'
          : 'bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100'
      }`}>
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  const isComplete = currentTime === 'morning' ? todayMorningDone : todayEveningDone

  // Background based on time
  const bgGradient = currentTime === 'morning'
    ? 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100'
    : 'bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100'

  // Completion screen
  if (showCompletion || isComplete) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-6`}>
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping">
              <div className="w-32 h-32 mx-auto rounded-full bg-green-400/30" />
            </div>
            <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl">
              <CheckCircle2 className="h-16 w-16 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-navy mb-3">
            Beautiful, {memberName || 'Beloved'}!
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Your {currentTime} check-in is complete.
          </p>

          {streak > 0 && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 rounded-full shadow-lg mb-8">
              <Flame className="h-6 w-6 text-orange-500" />
              <span className="text-lg font-semibold text-gray-800">
                {streak} day streak!
              </span>
            </div>
          )}

          <p className="text-gray-600 italic mb-8">
            {currentTime === 'morning'
              ? '"This is the day the Lord has made; let us rejoice and be glad in it." — Psalm 118:24'
              : '"In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety." — Psalm 4:8'}
          </p>

          {currentTime === 'morning' && !todayEveningDone && (
            <p className="text-sm text-gray-500 bg-white/50 rounded-lg p-4">
              Come back this evening for your reflection time
            </p>
          )}

          <Button
            onClick={() => {
              setShowCompletion(false)
              setCurrentStep(0)
              if (currentTime === 'morning' && !todayEveningDone) {
                setCurrentTime('evening')
              }
            }}
            variant="outline"
            className="mt-6"
          >
            {currentTime === 'morning' && !todayEveningDone ? 'Preview Evening Check-in' : 'View Again'}
          </Button>
        </div>
      </div>
    )
  }

  // Welcome step content
  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
        currentTime === 'morning'
          ? 'bg-gradient-to-br from-amber-400 to-orange-500'
          : 'bg-gradient-to-br from-indigo-500 to-purple-600'
      } shadow-2xl`}>
        {currentTime === 'morning' ? (
          <Sun className="h-12 w-12 text-white" />
        ) : (
          <Moon className="h-12 w-12 text-white" />
        )}
      </div>

      <div>
        <h1 className="text-4xl font-bold text-navy mb-2">
          Good {currentTime === 'morning' ? 'Morning' : 'Evening'}{memberName ? `, ${memberName}` : ''}
        </h1>
        <p className="text-xl text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {streak > 0 && (
        <Badge className="bg-orange-100 text-orange-700 text-base px-4 py-2">
          <Flame className="h-5 w-5 mr-2" />
          {streak} day streak!
        </Badge>
      )}

      <p className="text-gray-600 max-w-md mx-auto">
        {currentTime === 'morning'
          ? "Let's start your day with intention and gratitude. This will only take a few minutes."
          : "Let's reflect on your day and prepare your heart for rest."}
      </p>

      {/* Time toggle for switching */}
      <div className="flex justify-center gap-3 pt-4">
        <Button
          variant={currentTime === 'morning' ? 'default' : 'outline'}
          onClick={() => { setCurrentTime('morning'); setCurrentStep(0); }}
          className={currentTime === 'morning' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          size="sm"
        >
          <Sun className="h-4 w-4 mr-2" />
          Morning
          {todayMorningDone && <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />}
        </Button>
        <Button
          variant={currentTime === 'evening' ? 'default' : 'outline'}
          onClick={() => { setCurrentTime('evening'); setCurrentStep(0); }}
          className={currentTime === 'evening' ? 'bg-indigo-500 hover:bg-indigo-600' : ''}
          size="sm"
        >
          <Moon className="h-4 w-4 mr-2" />
          Evening
          {todayEveningDone && <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />}
        </Button>
      </div>
    </div>
  )

  // Scripture step
  const renderScriptureStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-lg mb-4">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-navy">Scripture of the Day</h2>
      </div>

      {scripture ? (
        <Card className="bg-white/80 backdrop-blur border-0 shadow-xl">
          <CardContent className="p-8">
            <Quote className="h-8 w-8 text-gold/40 mb-4" />
            <blockquote className="text-xl leading-relaxed text-navy mb-4 italic">
              "{scripture.scripture_text}"
            </blockquote>
            <p className="text-lg font-semibold text-gray-700 mb-6">
              — {scripture.scripture_reference}
            </p>
            {scripture.reflection && (
              <div className="border-t pt-4">
                <p className="text-gray-600">{scripture.reflection}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/80 backdrop-blur border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 italic">
              "Your word is a lamp for my feet, a light on my path." — Psalm 119:105
            </p>
          </CardContent>
        </Card>
      )}

      {/* Streams of Grace Devotional Link */}
      <Link href="/devotional">
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-navy">Streams of Grace</p>
                <p className="text-sm text-gray-600">Read today's devotional</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
      </Link>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          What does this scripture mean to you today?
        </label>
        <Textarea
          placeholder="Share your reflection..."
          value={checkinData.scripture_reflection}
          onChange={(e) => setCheckinData({ ...checkinData, scripture_reflection: e.target.value })}
          rows={4}
          className="bg-white/80 backdrop-blur border-0 shadow-lg resize-none"
        />
      </div>
    </div>
  )

  // Gratitude step
  const renderGratitudeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg mb-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-navy">Gratitude</h2>
        <p className="text-gray-600 mt-2">What fills your heart with thankfulness today?</p>
      </div>

      <Textarea
        placeholder="I'm thankful for..."
        value={checkinData.gratitude_entry}
        onChange={(e) => setCheckinData({ ...checkinData, gratitude_entry: e.target.value })}
        rows={6}
        className="bg-white/80 backdrop-blur border-0 shadow-lg resize-none text-lg"
      />

      <p className="text-sm text-gray-500 text-center italic">
        "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." — 1 Thessalonians 5:18
      </p>
    </div>
  )

  // Prayer step
  const renderPrayerStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-navy">Prayer Focus</h2>
        <p className="text-gray-600 mt-2">What will you lift up to God today?</p>
      </div>

      <Textarea
        placeholder="Today I'm praying for..."
        value={checkinData.prayer_focus}
        onChange={(e) => setCheckinData({ ...checkinData, prayer_focus: e.target.value })}
        rows={6}
        className="bg-white/80 backdrop-blur border-0 shadow-lg resize-none text-lg"
      />

      <p className="text-sm text-gray-500 text-center italic">
        "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." — Philippians 4:6
      </p>
    </div>
  )

  // Goals step
  const renderGoalsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg mb-4">
          <Target className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-navy">Today's Intentions</h2>
        <p className="text-gray-600 mt-2">What do you want to accomplish today?</p>
      </div>

      <div className="space-y-4">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-sm shadow">
              {idx + 1}
            </div>
            <input
              type="text"
              placeholder={`Intention ${idx + 1}`}
              className="flex-1 px-4 py-3 bg-white/80 backdrop-blur border-0 rounded-xl shadow-lg text-lg"
              value={checkinData.goals_for_day[idx]}
              onChange={(e) => {
                const newGoals = [...checkinData.goals_for_day]
                newGoals[idx] = e.target.value
                setCheckinData({ ...checkinData, goals_for_day: newGoals })
              }}
            />
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 text-center italic">
        "Commit to the Lord whatever you do, and he will establish your plans." — Proverbs 16:3
      </p>
    </div>
  )

  // Mood step
  const renderMoodStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-lg mb-4">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-navy">How Are You Feeling?</h2>
        <p className="text-gray-600 mt-2">Be honest with yourself and with God</p>
      </div>

      {renderMoodSelector('mood_rating')}

      <p className="text-sm text-gray-500 text-center italic mt-6">
        "Cast all your anxiety on him because he cares for you." — 1 Peter 5:7
      </p>
    </div>
  )

  // Evening: God Moments step
  const renderGodMomentsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-lg mb-4">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-navy">God Moments</h2>
        <p className="text-gray-600 mt-2">Where did you see God move today?</p>
      </div>

      <Textarea
        placeholder="Today I saw God's hand when..."
        value={checkinData.god_moments}
        onChange={(e) => setCheckinData({ ...checkinData, god_moments: e.target.value })}
        rows={6}
        className="bg-white/80 backdrop-blur border-0 shadow-lg resize-none text-lg"
      />

      <p className="text-sm text-gray-500 text-center italic">
        "The Lord has done great things for us, and we are filled with joy." — Psalm 126:3
      </p>
    </div>
  )

  // Evening: Tomorrow step
  const renderTomorrowStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-navy">Prayer for Tomorrow</h2>
        <p className="text-gray-600 mt-2">What do you want to lift up for the day ahead?</p>
      </div>

      <Textarea
        placeholder="Lord, tomorrow I ask for..."
        value={checkinData.tomorrow_prayer}
        onChange={(e) => setCheckinData({ ...checkinData, tomorrow_prayer: e.target.value })}
        rows={6}
        className="bg-white/80 backdrop-blur border-0 shadow-lg resize-none text-lg"
      />

      <p className="text-sm text-gray-500 text-center italic">
        "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning." — Lamentations 3:22-23
      </p>
    </div>
  )

  // Evening: Day Rating step
  const renderDayRatingStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg mb-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-navy">How Was Your Day?</h2>
        <p className="text-gray-600 mt-2">Reflect on the day that's ending</p>
      </div>

      {renderMoodSelector('day_rating')}

      <p className="text-sm text-gray-500 text-center italic mt-6">
        "In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety." — Psalm 4:8
      </p>
    </div>
  )

  // Render current step content
  const renderStepContent = () => {
    const stepId = steps[currentStep].id

    if (currentTime === 'morning') {
      switch (stepId) {
        case 'welcome': return renderWelcomeStep()
        case 'scripture': return renderScriptureStep()
        case 'gratitude': return renderGratitudeStep()
        case 'prayer': return renderPrayerStep()
        case 'goals': return renderGoalsStep()
        case 'mood': return renderMoodStep()
        default: return null
      }
    } else {
      switch (stepId) {
        case 'welcome': return renderWelcomeStep()
        case 'god-moments': return renderGodMomentsStep()
        case 'tomorrow': return renderTomorrowStep()
        case 'rating': return renderDayRatingStep()
        default: return null
      }
    }
  }

  const progressPercent = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className={`min-h-screen ${bgGradient} p-4 md:p-6`}>
      <div className="max-w-xl mx-auto">
        {/* Progress bar */}
        {currentStep > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{steps[currentStep].title}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Step content */}
        <div className="min-h-[60vh] flex flex-col justify-center py-8">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-white/30">
          {currentStep > 0 ? (
            <Button
              variant="ghost"
              onClick={prevStep}
              className="text-gray-600"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={nextStep}
            disabled={submitting}
            className={`px-8 py-6 text-lg rounded-xl shadow-lg ${
              currentTime === 'morning'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
            } text-white`}
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : currentStep === totalSteps - 1 ? (
              <>
                Complete
                <CheckCircle2 className="h-5 w-5 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

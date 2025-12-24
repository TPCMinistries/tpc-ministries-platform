'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Volume2,
  Play,
  Pause,
  Share2,
  Sparkles,
  HandHeart,
  Loader2,
  Clock,
  User,
  FileText,
  Mic,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import AIWritingAssistant from '@/components/member/ai-writing-assistant'
import VoiceRecorder from '@/components/voice/VoiceRecorder'
import VoicePlayer from '@/components/voice/VoicePlayer'

interface Devotional {
  id: string
  date: string
  title: string
  scripture_reference: string
  scripture_text: string
  content: string
  prayer: string
  reflection_questions: string[]
  author: string
  series: string
  audio_url?: string
  video_url?: string
}

interface PastDevotional {
  id: string
  date: string
  title: string
  scripture_reference: string
  series: string
  author: string
}

interface VoiceReflection {
  id: string
  audio_url: string
  audio_duration_seconds: number
  transcription?: string
  created_at: string
}

export default function DevotionalPage() {
  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [pastDevotionals, setPastDevotionals] = useState<PastDevotional[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPast, setShowPast] = useState(false)
  const [voiceReflection, setVoiceReflection] = useState<VoiceReflection | null>(null)
  const [uploadingVoice, setUploadingVoice] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)

  useEffect(() => {
    fetchDevotional(selectedDate)
    fetchPastDevotionals()
    setVoiceReflection(null) // Reset when changing date
    setShowVoiceRecorder(false)
  }, [selectedDate])

  // Fetch voice reflection after devotional is loaded
  useEffect(() => {
    if (devotional?.id) {
      fetchVoiceReflection(devotional.id)
    }
  }, [devotional?.id])

  const fetchVoiceReflection = async (devotionalId: string) => {
    try {
      const res = await fetch(`/api/devotional/voice-reflection?devotionalId=${devotionalId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.reflection) {
          setVoiceReflection(data.reflection)
        }
      }
    } catch (error) {
      console.error('Error fetching voice reflection:', error)
    }
  }

  const fetchDevotional = async (date: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/devotional?date=${date}`)
      if (res.ok) {
        const data = await res.json()
        setDevotional(data.devotional)
      }
    } catch (error) {
      console.error('Error fetching devotional:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPastDevotionals = async () => {
    try {
      const res = await fetch('/api/devotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 7 })
      })
      if (res.ok) {
        const data = await res.json()
        setPastDevotionals(data.devotionals || [])
      }
    } catch (error) {
      console.error('Error fetching past devotionals:', error)
    }
  }

  const handleVoiceRecordingComplete = async (audioBlob: Blob, duration: number) => {
    if (!devotional) return

    setUploadingVoice(true)
    try {
      // Upload the audio file
      const formData = new FormData()
      formData.append('audio', audioBlob, 'reflection.webm')
      formData.append('devotionalId', devotional.id)
      formData.append('type', 'devotional_reflection')

      const uploadRes = await fetch('/api/voice/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) throw new Error('Failed to upload audio')
      const { url } = await uploadRes.json()

      // Optionally transcribe
      let transcription = ''
      try {
        const transcribeFormData = new FormData()
        transcribeFormData.append('audio', audioBlob, 'reflection.webm')
        const transcribeRes = await fetch('/api/voice/transcribe', {
          method: 'POST',
          body: transcribeFormData
        })
        if (transcribeRes.ok) {
          const data = await transcribeRes.json()
          transcription = data.transcription || ''
        }
      } catch (e) {
        console.log('Transcription not available')
      }

      // Save the voice note
      const saveRes = await fetch('/api/devotional/voice-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devotionalId: devotional.id,
          audioUrl: url,
          audioDuration: duration,
          transcription
        })
      })

      if (saveRes.ok) {
        const data = await saveRes.json()
        setVoiceReflection(data.reflection)
        setShowVoiceRecorder(false)
      }
    } catch (error) {
      console.error('Error saving voice reflection:', error)
    } finally {
      setUploadingVoice(false)
    }
  }

  const navigateDate = (days: number) => {
    const current = new Date(selectedDate)
    current.setDate(current.getDate() + days)
    setSelectedDate(current.toISOString().split('T')[0])
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Daily Devotional</h1>
          <p className="text-muted-foreground">
            {devotional?.series || 'Streams of Grace'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isToday ? 'Today' : formatDate(selectedDate)}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate(1)}
            disabled={isToday}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!devotional ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Devotional Available</h3>
            <p className="text-muted-foreground mb-4">
              There's no devotional for this date yet. Check back soon!
            </p>
            <Button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
              Go to Today
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main Devotional Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-white/20 text-white mb-3">
                    {devotional.series}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {devotional.title}
                  </h2>
                  <p className="opacity-90 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    By {devotional.author}
                  </p>
                </div>
                {devotional.audio_url && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Scripture */}
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-amber-800 dark:text-amber-200">
                    {devotional.scripture_reference}
                  </span>
                </div>
                <blockquote className="text-lg font-serif italic text-amber-900 dark:text-amber-100 leading-relaxed">
                  "{devotional.scripture_text}"
                </blockquote>
              </div>

              {/* Main Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {devotional.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <Separator />

              {/* Reflection Questions */}
              {devotional.reflection_questions && devotional.reflection_questions.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-lg mb-4">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Reflection Questions
                  </h3>
                  <ul className="space-y-3">
                    {devotional.reflection_questions.map((question, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-sm flex items-center justify-center font-medium">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Voice Reflection */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <Mic className="h-5 w-5 text-gold" />
                  Voice Reflection
                </h3>

                {voiceReflection ? (
                  <div className="bg-gold/5 rounded-lg p-4 border border-gold/20">
                    <div className="flex items-center gap-2 mb-3 text-sm text-gold">
                      <CheckCircle className="h-4 w-4" />
                      Your voice reflection has been saved
                    </div>
                    <VoicePlayer
                      audioUrl={voiceReflection.audio_url}
                      duration={voiceReflection.audio_duration_seconds}
                      title="My Reflection"
                    />
                    {voiceReflection.transcription && (
                      <div className="mt-3 pt-3 border-t border-gold/20">
                        <p className="text-xs text-muted-foreground mb-1">Transcript:</p>
                        <p className="text-sm italic text-gray-600">{voiceReflection.transcription}</p>
                      </div>
                    )}
                  </div>
                ) : showVoiceRecorder ? (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Record your thoughts on today's devotional (max 2 minutes)
                    </p>
                    <VoiceRecorder
                      onRecordingComplete={handleVoiceRecordingComplete}
                      maxDurationSeconds={120}
                      disabled={uploadingVoice}
                    />
                    {uploadingVoice && (
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving your reflection...
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVoiceRecorder(false)}
                      className="mt-2"
                      disabled={uploadingVoice}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowVoiceRecorder(true)}
                    className="gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    Record Voice Reflection
                  </Button>
                )}
              </div>

              <Separator />

              {/* Prayer */}
              {devotional.prayer && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200">
                  <h3 className="flex items-center gap-2 font-semibold text-lg mb-3 text-blue-800 dark:text-blue-200">
                    <HandHeart className="h-5 w-5" />
                    Prayer
                  </h3>
                  <p className="text-blue-900 dark:text-blue-100 italic leading-relaxed">
                    {devotional.prayer}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Link href="/journal">
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Journal My Thoughts
                  </Button>
                </Link>
                <Button variant="outline" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Save to Favorites
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Writing Assistant */}
          <AIWritingAssistant
            mode="reflection"
            placeholder="Reflect on today's devotional..."
          />

          {/* Past Devotionals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Recent Devotionals
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPast(!showPast)}
                >
                  {showPast ? 'Hide' : 'Show All'}
                </Button>
              </div>
            </CardHeader>
            {showPast && (
              <CardContent>
                <div className="space-y-3">
                  {pastDevotionals.map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => setSelectedDate(dev.date)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        dev.date === selectedDate
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{dev.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {dev.scripture_reference} • {new Date(dev.date).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

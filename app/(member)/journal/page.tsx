'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  Sparkles,
  BookOpen,
  Heart,
  HandHeart,
  Flame,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  RefreshCw
} from 'lucide-react'

interface JournalEntry {
  id: string
  entry_type: string
  title: string
  content: string
  transcription?: string
  audio_url?: string
  ai_summary?: string
  ai_insights?: {
    themes?: string[]
    scriptures?: string[]
    reflectionPrompts?: string[]
    actionSteps?: string[]
  }
  scripture_references?: string[]
  mood?: string
  tags?: string[]
  is_answered?: boolean
  answered_testimony?: string
  created_at: string
}

interface JournalStreak {
  current_streak: number
  longest_streak: number
  total_entries: number
  last_entry_date: string
}

const MOODS = [
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'peaceful', label: 'Peaceful', emoji: '☮️' },
  { value: 'joyful', label: 'Joyful', emoji: '😊' },
  { value: 'hopeful', label: 'Hopeful', emoji: '🌟' },
  { value: 'struggling', label: 'Struggling', emoji: '😔' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'seeking', label: 'Seeking', emoji: '🔍' },
]

const ENTRY_TYPES = [
  { value: 'reflection', label: 'Reflection', icon: BookOpen, color: 'bg-blue-500' },
  { value: 'prayer', label: 'Prayer', icon: HandHeart, color: 'bg-purple-500' },
  { value: 'gratitude', label: 'Gratitude', icon: Heart, color: 'bg-pink-500' },
  { value: 'voice', label: 'Voice Note', icon: Mic, color: 'bg-green-500' },
]

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [streak, setStreak] = useState<JournalStreak | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // New entry form
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [entryType, setEntryType] = useState('reflection')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Voice recording
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)

  // AI features
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [aiPrayerSuggestion, setAiPrayerSuggestion] = useState('')
  const [isGeneratingPrayer, setIsGeneratingPrayer] = useState(false)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Expanded entries
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchEntries()
    fetchStreak()
  }, [activeTab])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const fetchEntries = async () => {
    try {
      const type = activeTab !== 'all' ? activeTab : undefined
      const url = type ? `/api/journal?type=${type}` : '/api/journal'
      const res = await fetch(url)
      const data = await res.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStreak = async () => {
    try {
      const res = await fetch('/api/journal/streak')
      if (res.ok) {
        const data = await res.json()
        setStreak(data.streak)
      }
    } catch (error) {
      console.error('Error fetching streak:', error)
    }
  }

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please allow microphone access.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime(t => t + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) clearInterval(timerRef.current)
      }
      setIsPaused(!isPaused)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const transcribeAudio = async () => {
    if (!audioBlob) return

    setIsTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('summarize', 'true')

      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setTranscription(data.transcription)
        setContent(data.transcription)
        if (data.summary) {
          setAiInsights(data.summary)
        }
      } else {
        throw new Error('Transcription failed')
      }
    } catch (error) {
      console.error('Error transcribing:', error)
      alert('Failed to transcribe audio. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // AI Features
  const generateInsights = async () => {
    if (!content || content.length < 20) {
      alert('Please write at least 20 characters before generating insights.')
      return
    }

    setIsGeneratingInsights(true)
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        const data = await res.json()
        setAiInsights(data.insights)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const generatePrayerHelp = async () => {
    if (!content) {
      alert('Please write something first.')
      return
    }

    setIsGeneratingPrayer(true)
    try {
      const res = await fetch('/api/ai/prayer-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: content,
          type: entryType === 'gratitude' ? 'gratitude' : 'petition'
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAiPrayerSuggestion(data.prayer)
      }
    } catch (error) {
      console.error('Error generating prayer:', error)
    } finally {
      setIsGeneratingPrayer(false)
    }
  }

  // Save Entry
  const saveEntry = async () => {
    if (!content && !transcription) {
      alert('Please add some content to your journal entry.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_type: entryType,
          title: title || `${ENTRY_TYPES.find(t => t.value === entryType)?.label} - ${new Date().toLocaleDateString()}`,
          content,
          transcription,
          ai_summary: aiInsights?.summary || aiPrayerSuggestion,
          ai_insights: aiInsights,
          mood,
          tags,
        }),
      })

      if (res.ok) {
        // Reset form
        setShowNewEntry(false)
        setTitle('')
        setContent('')
        setTranscription('')
        setMood('')
        setTags([])
        setAiInsights(null)
        setAiPrayerSuggestion('')
        setAudioBlob(null)
        setRecordingTime(0)
        setEntryType('reflection')

        // Refresh entries
        fetchEntries()
        fetchStreak()
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Delete Entry
  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const res = await fetch(`/api/journal?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchEntries()
        fetchStreak()
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedEntries(newExpanded)
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <div className="space-y-6">
      {/* Header with Streak */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Spiritual Journal</h1>
          <p className="text-muted-foreground">
            Record your thoughts, prayers, and spiritual insights
          </p>
        </div>

        <div className="flex items-center gap-4">
          {streak && (
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <Flame className="h-6 w-6" />
                <div>
                  <p className="text-xs opacity-90">Current Streak</p>
                  <p className="text-xl font-bold">{streak.current_streak} days</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={() => setShowNewEntry(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {streak && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Longest Streak</span>
              </div>
              <p className="text-2xl font-bold">{streak.longest_streak} days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">Total Entries</span>
              </div>
              <p className="text-2xl font-bold">{streak.total_entries}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Last Entry</span>
              </div>
              <p className="text-lg font-medium">
                {streak.last_entry_date
                  ? new Date(streak.last_entry_date).toLocaleDateString()
                  : 'Never'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Flame className="h-4 w-4" />
                <span className="text-sm">Current Streak</span>
              </div>
              <p className="text-2xl font-bold">{streak.current_streak} days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Entry Form */}
      {showNewEntry && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>New Journal Entry</span>
              <Button variant="ghost" size="sm" onClick={() => setShowNewEntry(false)}>
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Entry Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Entry Type</label>
              <div className="flex flex-wrap gap-2">
                {ENTRY_TYPES.map(type => (
                  <Button
                    key={type.value}
                    variant={entryType === type.value ? 'default' : 'outline'}
                    className="gap-2"
                    onClick={() => setEntryType(type.value)}
                  >
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Voice Recording Section */}
            {entryType === 'voice' && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-4xl font-mono">{formatTime(recordingTime)}</div>

                    <div className="flex items-center gap-3">
                      {!isRecording ? (
                        <Button
                          size="lg"
                          className="rounded-full h-16 w-16 bg-red-500 hover:bg-red-600"
                          onClick={startRecording}
                        >
                          <Mic className="h-6 w-6" />
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full h-12 w-12"
                            onClick={pauseRecording}
                          >
                            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                          </Button>
                          <Button
                            size="lg"
                            className="rounded-full h-16 w-16"
                            onClick={stopRecording}
                          >
                            <Square className="h-6 w-6" />
                          </Button>
                        </>
                      )}
                    </div>

                    {isRecording && (
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Recording... {isPaused ? '(Paused)' : ''}
                      </p>
                    )}

                    {audioBlob && !isRecording && (
                      <div className="w-full space-y-3">
                        <audio
                          controls
                          src={URL.createObjectURL(audioBlob)}
                          className="w-full"
                        />
                        <Button
                          onClick={transcribeAudio}
                          disabled={isTranscribing}
                          className="w-full gap-2"
                        >
                          {isTranscribing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Transcribing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Transcribe with AI
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">Title (optional)</label>
              <Input
                placeholder="Give your entry a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {entryType === 'voice' ? 'Transcription / Notes' : 'Your Thoughts'}
              </label>
              <Textarea
                placeholder={
                  entryType === 'prayer'
                    ? "Write your prayer or prayer request..."
                    : entryType === 'gratitude'
                    ? "What are you grateful for today?"
                    : "What's on your heart today?"
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>

            {/* AI Assistance Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={generateInsights}
                disabled={isGeneratingInsights || !content}
                className="gap-2"
              >
                {isGeneratingInsights ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Get AI Insights
              </Button>
              <Button
                variant="outline"
                onClick={generatePrayerHelp}
                disabled={isGeneratingPrayer || !content}
                className="gap-2"
              >
                {isGeneratingPrayer ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <HandHeart className="h-4 w-4" />
                )}
                Help Me Pray
              </Button>
            </div>

            {/* AI Insights Display */}
            {aiInsights && (
              <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {aiInsights.summary && (
                    <div>
                      <p className="font-medium text-purple-700 dark:text-purple-300">Summary</p>
                      <p>{aiInsights.summary}</p>
                    </div>
                  )}
                  {aiInsights.themes && aiInsights.themes.length > 0 && (
                    <div>
                      <p className="font-medium text-purple-700 dark:text-purple-300">Themes</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiInsights.themes.map((theme: string, i: number) => (
                          <Badge key={i} variant="secondary">{theme}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiInsights.scriptures && aiInsights.scriptures.length > 0 && (
                    <div>
                      <p className="font-medium text-purple-700 dark:text-purple-300">Related Scriptures</p>
                      <ul className="list-disc list-inside">
                        {aiInsights.scriptures.map((scripture: string, i: number) => (
                          <li key={i}>{scripture}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.reflectionPrompts && aiInsights.reflectionPrompts.length > 0 && (
                    <div>
                      <p className="font-medium text-purple-700 dark:text-purple-300">Reflection Questions</p>
                      <ul className="list-disc list-inside">
                        {aiInsights.reflectionPrompts.map((prompt: string, i: number) => (
                          <li key={i}>{prompt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.actionSteps && aiInsights.actionSteps.length > 0 && (
                    <div>
                      <p className="font-medium text-purple-700 dark:text-purple-300">Suggested Action Steps</p>
                      <ul className="list-disc list-inside">
                        {aiInsights.actionSteps.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Prayer Suggestion */}
            {aiPrayerSuggestion && (
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <HandHeart className="h-4 w-4 text-blue-500" />
                    Prayer Suggestion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{aiPrayerSuggestion}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setContent(prev => prev + '\n\n' + aiPrayerSuggestion)}
                  >
                    Add to Entry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Mood Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <Button
                    key={m.value}
                    variant={mood === m.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMood(m.value)}
                  >
                    {m.emoji} {m.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button variant="outline" onClick={addTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                Cancel
              </Button>
              <Button onClick={saveEntry} disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Save Entry
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entry Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="reflection">Reflections</TabsTrigger>
          <TabsTrigger value="prayer">Prayers</TabsTrigger>
          <TabsTrigger value="gratitude">Gratitude</TabsTrigger>
          <TabsTrigger value="voice">Voice Notes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No entries yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your spiritual journaling journey today
                </p>
                <Button onClick={() => setShowNewEntry(true)}>
                  Create Your First Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => {
                const isExpanded = expandedEntries.has(entry.id)
                const typeInfo = ENTRY_TYPES.find(t => t.value === entry.entry_type)
                const moodInfo = MOODS.find(m => m.value === entry.mood)

                return (
                  <Card key={entry.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {typeInfo && (
                            <Badge className={`${typeInfo.color} text-white`}>
                              <typeInfo.icon className="h-3 w-3 mr-1" />
                              {typeInfo.label}
                            </Badge>
                          )}
                          {moodInfo && (
                            <span className="text-lg">{moodInfo.emoji}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-muted-foreground ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {entry.content || entry.transcription}
                      </p>

                      {isExpanded && entry.ai_insights && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium flex items-center gap-1 mb-2">
                            <Sparkles className="h-3 w-3" /> AI Insights
                          </p>
                          {entry.ai_insights.themes && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {entry.ai_insights.themes.map((theme, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {entry.ai_insights.scriptures && (
                            <p className="text-xs text-muted-foreground">
                              Scriptures: {entry.ai_insights.scriptures.join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {entry.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(entry.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" /> Show More
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
  )
}

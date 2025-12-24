'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
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
  Calendar,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  PenLine,
  Feather,
  X,
  Search,
  Quote,
  Sunrise,
  Leaf,
  Star
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
  { value: 'grateful', label: 'Grateful', emoji: '🙏', color: 'from-amber-400 to-orange-500' },
  { value: 'peaceful', label: 'Peaceful', emoji: '☮️', color: 'from-teal-400 to-cyan-500' },
  { value: 'joyful', label: 'Joyful', emoji: '😊', color: 'from-yellow-400 to-amber-500' },
  { value: 'hopeful', label: 'Hopeful', emoji: '🌟', color: 'from-emerald-400 to-teal-500' },
  { value: 'struggling', label: 'Struggling', emoji: '😔', color: 'from-slate-400 to-slate-500' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'from-purple-400 to-indigo-500' },
  { value: 'seeking', label: 'Seeking', emoji: '🔍', color: 'from-blue-400 to-indigo-500' },
]

const ENTRY_TYPES = [
  { value: 'reflection', label: 'Reflection', icon: BookOpen, color: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-600' },
  { value: 'prayer', label: 'Prayer', icon: HandHeart, color: 'bg-purple-500', gradient: 'from-purple-500 to-pink-600' },
  { value: 'gratitude', label: 'Gratitude', icon: Heart, color: 'bg-rose-500', gradient: 'from-rose-500 to-orange-500' },
  { value: 'voice', label: 'Voice Note', icon: Mic, color: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
]

const WRITING_PROMPTS = [
  "What is God teaching you in this season?",
  "Describe a moment you felt God's presence today.",
  "What Scripture is speaking to you right now?",
  "Write about a prayer that was answered.",
  "What are you believing God for?",
  "Reflect on God's faithfulness in your life.",
  "What is the Holy Spirit revealing to you?",
  "Write about a challenge you're surrendering to God.",
]

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [streak, setStreak] = useState<JournalStreak | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [memberName, setMemberName] = useState('')

  // New entry form
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [entryType, setEntryType] = useState('reflection')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [currentPrompt, setCurrentPrompt] = useState('')

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
    fetchMemberInfo()
    fetchEntries()
    fetchStreak()
    // Set a random prompt
    setCurrentPrompt(WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)])
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [activeTab])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const fetchMemberInfo = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: member } = await supabase
          .from('members')
          .select('first_name')
          .eq('user_id', user.id)
          .single()
        if (member) setMemberName(member.first_name)
      }
    } catch (error) {
      console.error('Error fetching member:', error)
    }
  }

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
        closeNewEntry()
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

  const closeNewEntry = () => {
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

  const getNewPrompt = () => {
    let newPrompt = currentPrompt
    while (newPrompt === currentPrompt) {
      newPrompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)]
    }
    setCurrentPrompt(newPrompt)
  }

  const filteredEntries = entries.filter(entry =>
    entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Full-screen new entry view
  if (showNewEntry) {
    const selectedType = ENTRY_TYPES.find(t => t.value === entryType)

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className={`bg-gradient-to-r ${selectedType?.gradient || 'from-amber-500 to-orange-600'} text-white`}>
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Feather className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">New Journal Entry</h1>
                  <p className="text-sm opacity-90">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeNewEntry}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Entry Type Selection */}
          <div className="flex flex-wrap gap-3 justify-center">
            {ENTRY_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => setEntryType(type.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  entryType === type.value
                    ? `bg-gradient-to-r ${type.gradient} text-white shadow-lg scale-105`
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
                }`}
              >
                <type.icon className="h-4 w-4" />
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Voice Recording Section */}
          {entryType === 'voice' && (
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-5xl font-mono text-emerald-700 dark:text-emerald-300">{formatTime(recordingTime)}</div>

                  {/* Animated recording indicator */}
                  {isRecording && !isPaused && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm text-emerald-700 dark:text-emerald-300">Recording...</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
                      >
                        <Mic className="h-8 w-8" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={pauseRecording}
                          className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                        >
                          {isPaused ? <Play className="h-6 w-6 text-emerald-600" /> : <Pause className="h-6 w-6 text-emerald-600" />}
                        </button>
                        <button
                          onClick={stopRecording}
                          className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                        >
                          <Square className="h-8 w-8" />
                        </button>
                      </>
                    )}
                  </div>

                  {audioBlob && !isRecording && (
                    <div className="w-full max-w-md space-y-3">
                      <audio
                        controls
                        src={URL.createObjectURL(audioBlob)}
                        className="w-full"
                      />
                      <Button
                        onClick={transcribeAudio}
                        disabled={isTranscribing}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        {isTranscribing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Transcribing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
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

          {/* Writing Prompt */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/50 dark:border-amber-700/30">
            <div className="flex items-start gap-3">
              <Quote className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-800 dark:text-amber-200 italic">{currentPrompt}</p>
              </div>
              <button
                onClick={getNewPrompt}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                title="Get new prompt"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <Input
              placeholder="Give your entry a title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Main Content Area */}
          <div className="relative">
            <Textarea
              placeholder={
                entryType === 'prayer'
                  ? "Pour out your heart to God..."
                  : entryType === 'gratitude'
                  ? "What fills your heart with thankfulness today?"
                  : entryType === 'voice'
                  ? "Your transcription will appear here, or add notes..."
                  : "What's on your heart and mind today?"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="text-lg bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm focus:ring-2 focus:ring-amber-400 resize-none"
            />
            <div className="absolute bottom-3 right-3 text-sm text-gray-400">
              {content.length} characters
            </div>
          </div>

          {/* AI Assistance */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={generateInsights}
              disabled={isGeneratingInsights || content.length < 20}
              className="gap-2 bg-white/80 dark:bg-slate-800/80 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50"
            >
              {isGeneratingInsights ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-purple-500" />
              )}
              Get AI Insights
            </Button>
            <Button
              variant="outline"
              onClick={generatePrayerHelp}
              disabled={isGeneratingPrayer || !content}
              className="gap-2 bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            >
              {isGeneratingPrayer ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <HandHeart className="h-4 w-4 text-blue-500" />
              )}
              Help Me Pray
            </Button>
          </div>

          {/* AI Insights Display */}
          {aiInsights && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Sparkles className="h-4 w-4" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {aiInsights.summary && (
                  <div>
                    <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">Summary</p>
                    <p className="text-gray-700 dark:text-gray-300">{aiInsights.summary}</p>
                  </div>
                )}
                {aiInsights.themes && aiInsights.themes.length > 0 && (
                  <div>
                    <p className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {aiInsights.themes.map((theme: string, i: number) => (
                        <Badge key={i} className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {aiInsights.scriptures && aiInsights.scriptures.length > 0 && (
                  <div>
                    <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">Related Scriptures</p>
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                      {aiInsights.scriptures.map((scripture: string, i: number) => (
                        <li key={i}>{scripture}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.reflectionPrompts && aiInsights.reflectionPrompts.length > 0 && (
                  <div>
                    <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">Reflection Questions</p>
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                      {aiInsights.reflectionPrompts.map((prompt: string, i: number) => (
                        <li key={i}>{prompt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Prayer Suggestion */}
          {aiPrayerSuggestion && (
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <HandHeart className="h-4 w-4" />
                  Prayer Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic">{aiPrayerSuggestion}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-blue-600 dark:text-blue-400"
                  onClick={() => setContent(prev => prev + '\n\n' + aiPrayerSuggestion)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Entry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mood Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">How are you feeling?</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? '' : m.value)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    mood === m.value
                      ? `bg-gradient-to-r ${m.color} text-white shadow-md`
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:shadow-sm'
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Tags</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="bg-white/80 dark:bg-slate-800/80"
              />
              <Button variant="outline" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Save Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={closeNewEntry}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={saveEntry}
              disabled={saving || (!content && !transcription)}
              className={`flex-1 bg-gradient-to-r ${selectedType?.gradient || 'from-amber-500 to-orange-600'} hover:opacity-90`}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Save Entry
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Beautiful Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-8 text-white shadow-xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Feather className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-amber-100">{getTimeOfDayGreeting()}{memberName ? `, ${memberName}` : ''}</p>
                    <h1 className="text-3xl font-bold">Spiritual Journal</h1>
                  </div>
                </div>
                <p className="text-amber-100 mt-2 max-w-md">
                  A sacred space to record your thoughts, prayers, and encounters with God.
                </p>
              </div>

              <div className="flex items-center gap-4">
                {streak && streak.current_streak > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
                    <Flame className="h-8 w-8 text-yellow-300" />
                    <div>
                      <p className="text-xs text-amber-100">Streak</p>
                      <p className="text-2xl font-bold">{streak.current_streak} days</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setShowNewEntry(true)}
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-amber-50 shadow-lg gap-2"
                >
                  <PenLine className="h-5 w-5" />
                  New Entry
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {streak && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{streak.current_streak} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{streak.longest_streak} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Entries</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{streak.total_entries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Entry</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {streak.last_entry_date
                        ? new Date(streak.last_entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm"
            />
          </div>
        </div>

        {/* Entry Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-slate-800/80 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
            <TabsTrigger value="reflection" className="rounded-lg">
              <BookOpen className="h-4 w-4 mr-1.5" />
              Reflections
            </TabsTrigger>
            <TabsTrigger value="prayer" className="rounded-lg">
              <HandHeart className="h-4 w-4 mr-1.5" />
              Prayers
            </TabsTrigger>
            <TabsTrigger value="gratitude" className="rounded-lg">
              <Heart className="h-4 w-4 mr-1.5" />
              Gratitude
            </TabsTrigger>
            <TabsTrigger value="voice" className="rounded-lg">
              <Mic className="h-4 w-4 mr-1.5" />
              Voice
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mb-6 flex items-center justify-center">
                    <Feather className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Start Your Journal</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Begin your spiritual journaling journey. Record your prayers, reflections, and moments with God.
                  </p>
                  <Button
                    onClick={() => setShowNewEntry(true)}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 gap-2"
                  >
                    <PenLine className="h-4 w-4" />
                    Write Your First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredEntries.map(entry => {
                  const isExpanded = expandedEntries.has(entry.id)
                  const typeInfo = ENTRY_TYPES.find(t => t.value === entry.entry_type)
                  const moodInfo = MOODS.find(m => m.value === entry.mood)

                  return (
                    <Card
                      key={entry.id}
                      className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm hover:shadow-md transition-all"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {typeInfo && (
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${typeInfo.gradient} flex items-center justify-center`}>
                                <typeInfo.icon className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(entry.created_at).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                              <CardTitle className="text-base mt-0.5">{entry.title}</CardTitle>
                            </div>
                          </div>
                          {moodInfo && (
                            <span className="text-xl">{moodInfo.emoji}</span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-gray-600 dark:text-gray-300 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                          {entry.content || entry.transcription}
                        </p>

                        {isExpanded && entry.ai_insights && (
                          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                            <p className="text-sm font-medium flex items-center gap-1 mb-2 text-purple-700 dark:text-purple-300">
                              <Sparkles className="h-3 w-3" /> AI Insights
                            </p>
                            {entry.ai_insights.themes && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {entry.ai_insights.themes.map((theme, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/50">
                                    {theme}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {entry.ai_insights.scriptures && (
                              <p className="text-xs text-purple-600 dark:text-purple-400">
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

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(entry.id)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" /> Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" /> More
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500"
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
    </div>
  )
}

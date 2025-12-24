'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import VoiceRecorder from '@/components/voice/VoiceRecorder'
import VoicePlayer from '@/components/voice/VoicePlayer'
import {
  Mic,
  Send,
  Users,
  User,
  Search,
  X,
  Check,
  Loader2,
  ScrollText,
  HandHeart,
  MessageSquare,
  Sparkles,
  Radio,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  tier: string
}

interface VoiceMessage {
  id: string
  title: string
  description: string
  message_type: string
  audio_url: string
  audio_duration_seconds: number
  transcription: string
  recipient_type: string
  recipient_tier: string
  is_read: boolean
  created_at: string
  recipient?: {
    first_name: string
    last_name: string
  }
}

const messageTypes = [
  { value: 'prophetic_word', label: 'Prophetic Word', icon: ScrollText, color: 'bg-purple-100 text-purple-700' },
  { value: 'prayer', label: 'Prayer', icon: HandHeart, color: 'bg-blue-100 text-blue-700' },
  { value: 'sermon', label: 'Sermon/Message', icon: Radio, color: 'bg-amber-100 text-amber-700' },
  { value: 'encouragement', label: 'Encouragement', icon: Sparkles, color: 'bg-green-100 text-green-700' },
  { value: 'message', label: 'General Message', icon: MessageSquare, color: 'bg-gray-100 text-gray-700' },
]

export default function AdminVoiceMessagesPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [sentMessages, setSentMessages] = useState<VoiceMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'create' | 'sent'>('create')

  // Form state
  const [recipientType, setRecipientType] = useState<'individual' | 'group' | 'tier'>('individual')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedTier, setSelectedTier] = useState('all')
  const [messageType, setMessageType] = useState('prophetic_word')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcription, setTranscription] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    // Fetch members
    const { data: membersData } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, tier')
      .order('first_name')

    if (membersData) {
      setMembers(membersData)
    }

    // Fetch sent messages
    const response = await fetch('/api/voice/admin-message?type=sent')
    if (response.ok) {
      const data = await response.json()
      setSentMessages(data.messages || [])
    }

    setLoading(false)
  }

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    setAudioBlob(blob)
    setAudioDuration(duration)

    // Upload audio
    const formData = new FormData()
    formData.append('audio', blob, 'recording.webm')
    formData.append('context', 'admin-message')

    try {
      const response = await fetch('/api/voice/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setAudioUrl(data.url)

        // Auto-transcribe
        await transcribeAudio(blob)
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true)

    const formData = new FormData()
    formData.append('audio', blob, 'recording.webm')

    try {
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setTranscription(data.transcription)
      }
    } catch (error) {
      console.error('Transcription error:', error)
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleSend = async () => {
    if (!audioUrl) {
      alert('Please record a message first')
      return
    }

    if (recipientType === 'individual' && !selectedMember) {
      alert('Please select a recipient')
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/voice/admin-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedMember?.id,
          recipientType,
          recipientTier: selectedTier,
          title,
          description,
          messageType,
          audioUrl,
          audioDuration,
          transcription
        })
      })

      if (response.ok) {
        // Reset form
        setSelectedMember(null)
        setTitle('')
        setDescription('')
        setAudioBlob(null)
        setAudioUrl(null)
        setTranscription('')
        setAudioDuration(0)

        // Refresh sent messages
        fetchData()

        alert('Voice message sent successfully!')
      } else {
        throw new Error('Failed to send')
      }
    } catch (error) {
      console.error('Send error:', error)
      alert('Failed to send voice message')
    } finally {
      setSending(false)
    }
  }

  const filteredMembers = members.filter(m =>
    `${m.first_name} ${m.last_name} ${m.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const getMessageTypeInfo = (type: string) => {
    return messageTypes.find(t => t.value === type) || messageTypes[4]
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mic className="h-8 w-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Voice Messages</h1>
          </div>
          <p className="text-gray-600">
            Send prophetic words, prayers, and messages to members
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'create'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500'
            }`}
          >
            Create Message
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'sent'
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-500'
            }`}
          >
            Sent Messages ({sentMessages.length})
          </button>
        </div>

        {activeTab === 'create' ? (
          <div className="space-y-6">
            {/* Recipient Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Who is this for?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => setRecipientType('individual')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      recipientType === 'individual'
                        ? 'border-navy bg-navy/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className="h-6 w-6" />
                    <span className="text-sm font-medium">Individual</span>
                  </button>
                  <button
                    onClick={() => setRecipientType('tier')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      recipientType === 'tier'
                        ? 'border-navy bg-navy/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm font-medium">By Tier</span>
                  </button>
                  <button
                    onClick={() => setRecipientType('group')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      recipientType === 'group'
                        ? 'border-navy bg-navy/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm font-medium">Everyone</span>
                  </button>
                </div>

                {recipientType === 'individual' && (
                  <div>
                    {selectedMember ? (
                      <div className="flex items-center justify-between p-3 bg-navy/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center font-semibold">
                            {selectedMember.first_name[0]}{selectedMember.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium">{selectedMember.first_name} {selectedMember.last_name}</p>
                            <p className="text-sm text-gray-500">{selectedMember.email}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto border rounded-lg">
                          {filteredMembers.slice(0, 10).map((member) => (
                            <button
                              key={member.id}
                              onClick={() => {
                                setSelectedMember(member)
                                setSearchQuery('')
                              }}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-0"
                            >
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                                {member.first_name[0]}{member.last_name[0]}
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-medium">{member.first_name} {member.last_name}</p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {recipientType === 'tier' && (
                  <div className="grid grid-cols-4 gap-2">
                    {['all', 'free', 'partner', 'covenant'].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium capitalize ${
                          selectedTier === tier
                            ? 'border-navy bg-navy/5'
                            : 'border-gray-200'
                        }`}
                      >
                        {tier === 'all' ? 'Everyone' : tier}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Message Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {messageTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => setMessageType(type.value)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          messageType === type.value
                            ? 'border-navy bg-navy/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium text-center">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Title & Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Word for the Season"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    placeholder="Brief description of this message..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recording */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Record Your Message</CardTitle>
              </CardHeader>
              <CardContent>
                {!audioUrl ? (
                  <VoiceRecorder
                    onRecordingComplete={handleRecordingComplete}
                    showUpload={true}
                    onUpload={async (file) => {
                      // Handle file upload
                      const formData = new FormData()
                      formData.append('audio', file)
                      formData.append('context', 'admin-message')

                      const response = await fetch('/api/voice/upload', {
                        method: 'POST',
                        body: formData
                      })

                      if (response.ok) {
                        const data = await response.json()
                        setAudioUrl(data.url)
                        // Create audio element to get duration
                        const audio = new Audio(data.url)
                        audio.onloadedmetadata = () => {
                          setAudioDuration(Math.floor(audio.duration))
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    <VoicePlayer
                      audioUrl={audioUrl}
                      duration={audioDuration}
                      title="Your Recording"
                    />

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAudioUrl(null)
                          setAudioBlob(null)
                          setTranscription('')
                        }}
                      >
                        Record Again
                      </Button>
                    </div>

                    {/* Transcription */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Transcription</Label>
                        {isTranscribing && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Transcribing...
                          </div>
                        )}
                      </div>
                      <textarea
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                        placeholder="Transcription will appear here..."
                        className="w-full border rounded-lg px-3 py-2 min-h-[100px] text-sm"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!audioUrl || sending}
              className="w-full bg-navy hover:bg-navy/90 h-12 text-lg"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Voice Message
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Sent Messages Tab */
          <div className="space-y-4">
            {sentMessages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No voice messages sent yet</p>
                </CardContent>
              </Card>
            ) : (
              sentMessages.map((message) => {
                const typeInfo = getMessageTypeInfo(message.message_type)
                const Icon = typeInfo.icon
                return (
                  <Card key={message.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                            {message.recipient_type === 'individual' ? (
                              <span className="text-sm text-gray-500">
                                to {message.recipient?.first_name} {message.recipient?.last_name}
                              </span>
                            ) : message.recipient_type === 'tier' ? (
                              <span className="text-sm text-gray-500">
                                to {message.recipient_tier === 'all' ? 'Everyone' : `${message.recipient_tier} members`}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">to Everyone</span>
                            )}
                          </div>

                          {message.title && (
                            <h3 className="font-semibold text-navy">{message.title}</h3>
                          )}

                          <VoicePlayer
                            audioUrl={message.audio_url}
                            duration={message.audio_duration_seconds}
                            compact
                            className="mt-2"
                          />

                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(message.created_at).toLocaleDateString()}
                            </span>
                            {message.recipient_type === 'individual' && (
                              <span className="flex items-center gap-1">
                                {message.is_read ? (
                                  <>
                                    <Eye className="h-3 w-3 text-green-500" />
                                    Listened
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3 w-3" />
                                    Not listened
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import {
  Play,
  Users,
  MessageCircle,
  Send,
  Heart,
  Calendar,
  Clock,
  Radio,
  VideoIcon,
  ChevronRight,
  Bell,
  ExternalLink
} from 'lucide-react'

interface LiveStream {
  id: string
  title: string
  description?: string
  stream_type: string
  stream_url?: string
  stream_platform?: string
  thumbnail_url?: string
  scheduled_start: string
  scheduled_end?: string
  status: 'scheduled' | 'live' | 'ended'
  viewer_count: number
  chat_enabled: boolean
  is_public: boolean
  required_tier?: string
}

interface ChatMessage {
  id: string
  message: string
  message_type: string
  created_at: string
  member?: {
    first_name: string
    last_name: string
  }
}

export default function LiveStreamPage() {
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null)
  const [upcomingStreams, setUpcomingStreams] = useState<LiveStream[]>([])
  const [pastStreams, setPastStreams] = useState<LiveStream[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'recordings'>('live')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMember()
    fetchStreams()
  }, [])

  useEffect(() => {
    if (currentStream?.id) {
      fetchChat()
      // Poll for new messages
      const interval = setInterval(fetchChat, 5000)
      return () => clearInterval(interval)
    }
  }, [currentStream?.id])

  useEffect(() => {
    // Auto-scroll chat
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatMessages])

  const fetchMember = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (member) setMemberId(member.id)
    }
  }

  const fetchStreams = async () => {
    const supabase = createClient()
    setLoading(true)

    // Fetch live stream
    const { data: liveStream } = await supabase
      .from('live_streams')
      .select('*')
      .eq('status', 'live')
      .single()

    if (liveStream) {
      setCurrentStream(liveStream)
      setActiveTab('live')
    }

    // Fetch upcoming streams
    const { data: upcoming } = await supabase
      .from('live_streams')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_start', new Date().toISOString())
      .order('scheduled_start', { ascending: true })
      .limit(5)

    if (upcoming) setUpcomingStreams(upcoming)

    // Fetch past streams with recordings
    const { data: past } = await supabase
      .from('live_streams')
      .select('*')
      .eq('status', 'ended')
      .not('recording_url', 'is', null)
      .order('scheduled_start', { ascending: false })
      .limit(10)

    if (past) setPastStreams(past)

    setLoading(false)
  }

  const fetchChat = async () => {
    if (!currentStream) return

    const supabase = createClient()
    const { data } = await supabase
      .from('stream_chat')
      .select(`
        *,
        member:members(first_name, last_name)
      `)
      .eq('stream_id', currentStream.id)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true })
      .limit(100)

    if (data) setChatMessages(data)
  }

  const sendMessage = async () => {
    if (!memberId || !currentStream || !newMessage.trim()) return

    const supabase = createClient()
    await supabase.from('stream_chat').insert({
      stream_id: currentStream.id,
      member_id: memberId,
      message: newMessage.trim(),
      message_type: 'chat'
    })

    setNewMessage('')
    fetchChat()
  }

  const sendPrayerRequest = async () => {
    if (!memberId || !currentStream || !newMessage.trim()) return

    const supabase = createClient()
    await supabase.from('stream_chat').insert({
      stream_id: currentStream.id,
      member_id: memberId,
      message: newMessage.trim(),
      message_type: 'prayer_request'
    })

    setNewMessage('')
    fetchChat()
  }

  const getStreamTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      service: 'Worship Service',
      teaching: 'Teaching',
      worship: 'Worship Night',
      prayer: 'Prayer Service',
      special: 'Special Event'
    }
    return labels[type] || type
  }

  const getEmbedUrl = (stream: LiveStream) => {
    if (!stream.stream_url) return null

    if (stream.stream_platform === 'youtube') {
      // Extract video ID from YouTube URL
      const match = stream.stream_url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/)
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1`
      }
    }

    if (stream.stream_platform === 'vimeo') {
      const match = stream.stream_url.match(/vimeo\.com\/(\d+)/)
      if (match) {
        return `https://player.vimeo.com/video/${match[1]}?autoplay=1`
      }
    }

    return stream.stream_url
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-navy text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-6 w-6 text-red-500 animate-pulse" />
            <h1 className="text-xl font-bold">TPC Live</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'live' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('live')}
              className={activeTab === 'live' ? 'bg-gold text-navy' : 'text-white hover:bg-white/10'}
            >
              {currentStream ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                  Live Now
                </>
              ) : 'Live'}
            </Button>
            <Button
              variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('upcoming')}
              className={activeTab === 'upcoming' ? 'bg-gold text-navy' : 'text-white hover:bg-white/10'}
            >
              Upcoming
            </Button>
            <Button
              variant={activeTab === 'recordings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('recordings')}
              className={activeTab === 'recordings' ? 'bg-gold text-navy' : 'text-white hover:bg-white/10'}
            >
              Recordings
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'live' && currentStream && (
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {getEmbedUrl(currentStream) ? (
                  <iframe
                    src={getEmbedUrl(currentStream)!}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <p>Stream will appear here</p>
                  </div>
                )}
              </div>

              {/* Stream Info */}
              <div className="mt-4 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-red-600 text-white mb-2">
                      <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></span>
                      LIVE
                    </Badge>
                    <h2 className="text-2xl font-bold">{currentStream.title}</h2>
                    {currentStream.description && (
                      <p className="text-gray-400 mt-1">{currentStream.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{currentStream.viewer_count} watching</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat */}
            {currentStream.chat_enabled && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[400px]">
                  {/* Messages */}
                  <div
                    ref={chatRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                  >
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`text-sm ${msg.message_type === 'prayer_request' ? 'bg-purple-900/30 p-2 rounded' : ''}`}
                      >
                        {msg.message_type === 'prayer_request' && (
                          <Badge className="bg-purple-600 text-xs mb-1">Prayer Request</Badge>
                        )}
                        <p>
                          <span className="font-medium text-gold">
                            {msg.member?.first_name || 'Guest'}:
                          </span>{' '}
                          <span className="text-gray-300">{msg.message}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Send a message..."
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button
                        onClick={sendMessage}
                        className="bg-gold hover:bg-gold/90 text-navy"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300 mt-2 w-full"
                      onClick={sendPrayerRequest}
                      disabled={!newMessage.trim()}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Send as Prayer Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'live' && !currentStream && (
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="bg-gray-800 rounded-lg p-12">
            <VideoIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Live Stream Right Now</h2>
            <p className="text-gray-400 mb-6">Check out our upcoming streams or watch past recordings</p>

            {upcomingStreams.length > 0 && (
              <div className="text-left bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-gold font-semibold mb-3">Next Live Stream:</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{upcomingStreams[0].title}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(upcomingStreams[0].scheduled_start).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Button size="sm" className="bg-gold text-navy">
                    <Bell className="h-4 w-4 mr-2" />
                    Remind Me
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Streams</h2>

          {upcomingStreams.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No upcoming streams scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingStreams.map(stream => (
                <Card key={stream.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {stream.thumbnail_url ? (
                          <Image src={stream.thumbnail_url} alt={stream.title} fill className="object-cover" sizes="128px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="h-8 w-8 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="text-gold border-gold mb-2">
                          {getStreamTypeLabel(stream.stream_type)}
                        </Badge>
                        <h3 className="text-lg font-semibold text-white">{stream.title}</h3>
                        {stream.description && (
                          <p className="text-gray-400 text-sm mt-1">{stream.description}</p>
                        )}
                        <p className="text-gold text-sm mt-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(stream.scheduled_start).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="text-white border-gray-600">
                        <Bell className="h-4 w-4 mr-2" />
                        Remind Me
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recordings' && (
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Past Recordings</h2>

          {pastStreams.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 text-center py-12">
              <CardContent>
                <VideoIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No recordings available yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastStreams.map(stream => (
                <Card key={stream.id} className="bg-gray-800 border-gray-700 overflow-hidden group cursor-pointer">
                  <div className="aspect-video bg-gray-700 relative">
                    {stream.thumbnail_url ? (
                      <Image src={stream.thumbnail_url} alt={stream.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button className="bg-gold text-navy">
                        <Play className="h-5 w-5 mr-2" />
                        Watch Now
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="text-gray-400 border-gray-600 mb-2">
                      {getStreamTypeLabel(stream.stream_type)}
                    </Badge>
                    <h3 className="font-semibold text-white">{stream.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(stream.scheduled_start).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

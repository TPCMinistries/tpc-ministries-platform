'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  Inbox,
  Archive,
  Star,
  MoreVertical,
  CheckCheck,
  Clock,
  User,
  Mail,
  Phone,
  Mic,
  X,
  RefreshCw,
  Filter,
  ChevronLeft,
  AlertCircle,
  Volume2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'member' | 'admin'
  recipient_id?: string
  recipient_type: 'member' | 'admin'
  admin_id?: string
  admin_conversation_id?: string
  subject?: string
  message: string
  voice_url?: string
  voice_duration_seconds?: number
  voice_transcription?: string
  is_read: boolean
  read_at?: string
  created_at: string
  priority?: string
  sender?: {
    id: string
    first_name: string
    last_name: string
    email: string
    tier?: string
    profile_image_url?: string
  }
}

interface Conversation {
  id: string
  member_id: string
  admin_id: string
  subject?: string
  last_message_at: string
  last_message_preview?: string
  last_message_by?: string
  admin_unread_count: number
  member_unread_count: number
  is_archived: boolean
  is_closed: boolean
  priority: string
  category?: string
  created_at: string
  member?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    tier: string
    profile_image_url?: string
  }
}

interface GroupedConversation {
  conversation_id: string
  member: {
    id: string
    first_name: string
    last_name: string
    email: string
    tier: string
    profile_image_url?: string
  } | null
  subject: string
  last_message: string
  last_message_at: string
  last_sender_type: string
  unread_count: number
  is_starred: boolean
  priority: string
  messages: Message[]
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<GroupedConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<GroupedConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [adminMemberId, setAdminMemberId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    starred: 0,
    archived: 0
  })

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      if (selectedConversation.unread_count > 0) {
        markAsRead(selectedConversation.conversation_id)
      }
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      // Get current admin's member ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: adminMember } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (adminMember) {
        setAdminMemberId(adminMember.id)
      }

      // Fetch all messages sent TO admin (recipient_type = 'admin')
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:members!messages_sender_id_fkey(id, first_name, last_name, email, tier, profile_image_url)
        `)
        .or('recipient_type.eq.admin,sender_type.eq.admin')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        })
        return
      }

      // Group messages by conversation_id
      const conversationsMap = new Map<string, GroupedConversation>()

      messagesData?.forEach((msg: Message) => {
        const convId = msg.conversation_id
        if (!conversationsMap.has(convId)) {
          conversationsMap.set(convId, {
            conversation_id: convId,
            member: msg.sender_type === 'member' ? msg.sender || null : null,
            subject: msg.subject || 'No Subject',
            last_message: msg.message,
            last_message_at: msg.created_at,
            last_sender_type: msg.sender_type,
            unread_count: 0,
            is_starred: false,
            priority: msg.priority || 'normal',
            messages: []
          })
        }

        const conv = conversationsMap.get(convId)!
        conv.messages.push(msg)

        // Update last message
        if (new Date(msg.created_at) > new Date(conv.last_message_at)) {
          conv.last_message = msg.message || '[Voice Message]'
          conv.last_message_at = msg.created_at
          conv.last_sender_type = msg.sender_type
        }

        // Count unread messages sent to admin
        if (msg.recipient_type === 'admin' && !msg.is_read) {
          conv.unread_count++
        }

        // Get member info from any member message
        if (msg.sender_type === 'member' && msg.sender) {
          conv.member = msg.sender
        }
      })

      // Convert to array and sort by last message
      const conversationsArray = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())

      setConversations(conversationsArray)

      // Calculate stats
      const totalUnread = conversationsArray.reduce((sum, c) => sum + c.unread_count, 0)
      setStats({
        total: conversationsArray.length,
        unread: totalUnread,
        starred: conversationsArray.filter(c => c.is_starred).length,
        archived: 0
      })

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (conversationId: string) => {
    const supabase = createClient()

    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('recipient_type', 'admin')
        .eq('is_read', false)

      // Update local state
      setConversations(prev =>
        prev.map(c =>
          c.conversation_id === conversationId
            ? { ...c, unread_count: 0 }
            : c
        )
      )

      if (selectedConversation?.conversation_id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, unread_count: 0 } : null)
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedConversation || !adminMemberId) return

    const supabase = createClient()
    setSending(true)

    try {
      // Find the member ID from the conversation
      const memberId = selectedConversation.member?.id
      if (!memberId) {
        toast({
          title: 'Error',
          description: 'Could not find member to reply to',
          variant: 'destructive',
        })
        return
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.conversation_id,
          sender_id: adminMemberId,
          sender_type: 'admin',
          recipient_id: memberId,
          recipient_type: 'member',
          message: replyMessage,
          is_read: false,
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      const newMessage: Message = {
        ...data,
        sender: { id: adminMemberId, first_name: 'Admin', last_name: '', email: '', tier: 'admin' }
      }

      setSelectedConversation(prev => {
        if (!prev) return null
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          last_message: replyMessage,
          last_message_at: newMessage.created_at,
          last_sender_type: 'admin'
        }
      })

      setConversations(prev =>
        prev.map(c =>
          c.conversation_id === selectedConversation.conversation_id
            ? {
                ...c,
                messages: [...c.messages, newMessage],
                last_message: replyMessage,
                last_message_at: newMessage.created_at,
                last_sender_type: 'admin'
              }
            : c
        ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      )

      setReplyMessage('')

      toast({
        title: 'Sent',
        description: 'Your reply has been sent',
      })

    } catch (error) {
      console.error('Error sending reply:', error)
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'partner': return 'bg-gold/20 text-gold border-gold'
      case 'covenant': return 'bg-purple-100 text-purple-700 border-purple-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  // Filter conversations based on search and tab
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery ||
      conv.member?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.member?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.member?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'unread' && conv.unread_count > 0) ||
      (activeTab === 'starred' && conv.is_starred)

    return matchesSearch && matchesTab
  })

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-navy" />
            <div>
              <h1 className="text-2xl font-bold text-navy">Member Messages</h1>
              <p className="text-sm text-gray-600">View and respond to member conversations</p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchConversations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Inbox className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{stats.total}</span>
            <span className="text-gray-500">conversations</span>
          </div>
          {stats.unread > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="destructive" className="px-2 py-0.5">
                {stats.unread} unread
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full md:w-96 border-r bg-gray-50 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Search & Filter */}
          <div className="p-3 border-b bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-white">
            <button
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all' ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'unread' ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('unread')}
            >
              Unread {stats.unread > 0 && `(${stats.unread})`}
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'starred' ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('starred')}
            >
              Starred
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm">When members message you, they'll appear here</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.conversation_id}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedConversation?.conversation_id === conv.conversation_id
                      ? 'bg-navy/5 border-l-4 border-l-navy'
                      : 'hover:bg-gray-100'
                  } ${conv.unread_count > 0 ? 'bg-blue-50/50' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conv.member?.profile_image_url} />
                      <AvatarFallback className="bg-navy text-white">
                        {conv.member?.first_name?.[0]}{conv.member?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium truncate ${conv.unread_count > 0 ? 'text-navy' : 'text-gray-900'}`}>
                            {conv.member ? `${conv.member.first_name} ${conv.member.last_name}` : 'Unknown Member'}
                          </span>
                          {conv.member?.tier && (
                            <Badge variant="outline" className={`text-xs ${getTierColor(conv.member.tier)}`}>
                              {conv.member.tier}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(conv.last_message_at)}</span>
                      </div>
                      <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {conv.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.last_sender_type === 'admin' && <span className="text-navy">You: </span>}
                        {conv.last_message}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <Badge className="bg-navy text-white">{conv.unread_count}</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message View */}
        <div className={`flex-1 flex flex-col bg-white ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="border-b p-4 bg-white">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.member?.profile_image_url} />
                    <AvatarFallback className="bg-navy text-white">
                      {selectedConversation.member?.first_name?.[0]}{selectedConversation.member?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-navy">
                        {selectedConversation.member
                          ? `${selectedConversation.member.first_name} ${selectedConversation.member.last_name}`
                          : 'Unknown Member'}
                      </h2>
                      {selectedConversation.member?.tier && (
                        <Badge variant="outline" className={getTierColor(selectedConversation.member.tier)}>
                          {selectedConversation.member.tier}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{selectedConversation.member?.email}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Star Conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        View Member Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Subject: {selectedConversation.subject}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${msg.sender_type === 'admin' ? 'order-2' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          msg.sender_type === 'admin'
                            ? 'bg-navy text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        {msg.voice_url ? (
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            <audio controls className="h-8">
                              <source src={msg.voice_url} />
                            </audio>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        )}
                        {msg.voice_transcription && (
                          <p className="text-xs mt-1 opacity-75 italic">
                            "{msg.voice_transcription}"
                          </p>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${msg.sender_type === 'admin' ? 'justify-end' : ''}`}>
                        <span className="text-xs text-gray-500">
                          {formatFullDate(msg.created_at)}
                        </span>
                        {msg.sender_type === 'admin' && msg.is_read && (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendReply()
                        }
                      }}
                    />
                  </div>
                  <Button
                    className="bg-navy hover:bg-navy/90 h-12 px-6"
                    onClick={sendReply}
                    disabled={!replyMessage.trim() || sending}
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the list to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  User,
  Plus,
  X,
  RefreshCw,
  ChevronLeft,
  Volume2,
  Sparkles,
  Wand2,
  Copy,
  RotateCcw,
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
  subject?: string
  message: string
  voice_url?: string
  voice_duration_seconds?: number
  voice_transcription?: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    first_name: string
    last_name: string
    email: string
    tier?: string
    profile_image_url?: string
  }
}

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  tier: string
  profile_image_url?: string
}

interface GroupedConversation {
  conversation_id: string
  member: Member | null
  subject: string
  last_message: string
  last_message_at: string
  last_sender_type: string
  unread_count: number
  is_starred: boolean
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

  // New Message Dialog State
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [searchedMembers, setSearchedMembers] = useState<Member[]>([])
  const [searchingMembers, setSearchingMembers] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [newMessageSubject, setNewMessageSubject] = useState('')
  const [newMessageContent, setNewMessageContent] = useState('')
  const [messageCategory, setMessageCategory] = useState('general')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // AI Assistant State
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')

  // Stats
  const [stats, setStats] = useState({ total: 0, unread: 0, starred: 0 })

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

      // Fetch all messages
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
        return
      }

      // Group by conversation_id
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
            messages: []
          })
        }

        const conv = conversationsMap.get(convId)!
        conv.messages.push(msg)

        if (new Date(msg.created_at) > new Date(conv.last_message_at)) {
          conv.last_message = msg.message || '[Voice Message]'
          conv.last_message_at = msg.created_at
          conv.last_sender_type = msg.sender_type
        }

        if (msg.recipient_type === 'admin' && !msg.is_read) {
          conv.unread_count++
        }

        if (msg.sender_type === 'member' && msg.sender) {
          conv.member = msg.sender
        }
      })

      const conversationsArray = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())

      setConversations(conversationsArray)

      const totalUnread = conversationsArray.reduce((sum, c) => sum + c.unread_count, 0)
      setStats({
        total: conversationsArray.length,
        unread: totalUnread,
        starred: conversationsArray.filter(c => c.is_starred).length
      })

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Member Search with Debouncing
  const searchMembers = useCallback(async (query: string) => {
    const supabase = createClient()

    if (!query.trim()) {
      setSearchedMembers([])
      setSearchingMembers(false)
      return
    }

    setSearchingMembers(true)

    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone, tier, profile_image_url')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('first_name', { ascending: true })
        .limit(20)

      if (!error && data) {
        setSearchedMembers(data)
      }
    } catch (error) {
      console.error('Error searching members:', error)
    } finally {
      setSearchingMembers(false)
    }
  }, [])

  const handleMemberSearch = useCallback((query: string) => {
    setMemberSearchQuery(query)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchMembers(query)
    }, 300)
  }, [searchMembers])

  // AI Message Generation
  const generateAiMessage = async () => {
    if (!selectedMember && !aiPrompt.trim()) return

    setAiGenerating(true)
    setAiSuggestion('')

    try {
      const memberContext = selectedMember
        ? `Member: ${selectedMember.first_name} ${selectedMember.last_name} (${selectedMember.tier} member)`
        : 'General member'

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a pastoral assistant for TPC Ministries. Write a warm, caring message to a church member.

Context: ${memberContext}
Category: ${messageCategory}
${aiPrompt ? `User request: ${aiPrompt}` : ''}

Write a brief, heartfelt message (2-4 sentences) that is:
- Warm and personal
- Spiritually encouraging
- Appropriate for the category
- Uses their first name if known

Do not include greetings like "Dear" or sign-offs. Just the message body.`,
          max_tokens: 200
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestion(data.text || data.content || '')
      } else {
        // Fallback if API fails
        const templates: Record<string, string> = {
          general: `Hi ${selectedMember?.first_name || 'there'}, I hope this message finds you well. We've been thinking of you and wanted to reach out to see how you're doing. Please don't hesitate to let us know if there's anything we can do to support you.`,
          prayer: `${selectedMember?.first_name || 'Friend'}, I wanted you to know that you've been on my heart lately and I've been lifting you up in prayer. God sees you and loves you deeply. Is there anything specific you'd like me to pray for?`,
          encouragement: `${selectedMember?.first_name || 'Dear one'}, I felt led to send you a word of encouragement today. Remember that God is faithful and His plans for you are good. You are valued and appreciated in our church family!`,
          followup: `Hi ${selectedMember?.first_name || 'there'}, I wanted to follow up and see how things are going. We care about you and want to make sure you have the support you need. Please feel free to reach out anytime.`
        }
        setAiSuggestion(templates[messageCategory] || templates.general)
      }
    } catch (error) {
      console.error('AI generation error:', error)
      // Use template fallback
      setAiSuggestion(`Hi ${selectedMember?.first_name || 'there'}, I hope you're doing well. I wanted to reach out and let you know we're here for you. Please don't hesitate to reach out if you need anything.`)
    } finally {
      setAiGenerating(false)
    }
  }

  const useAiSuggestion = () => {
    setNewMessageContent(aiSuggestion)
    setShowAiAssistant(false)
    setAiSuggestion('')
    setAiPrompt('')
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

      setConversations(prev =>
        prev.map(c => c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c)
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
      const memberId = selectedConversation.member?.id
      if (!memberId) {
        toast({ title: 'Error', description: 'Could not find member', variant: 'destructive' })
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
            ? { ...c, messages: [...c.messages, newMessage], last_message: replyMessage, last_message_at: newMessage.created_at, last_sender_type: 'admin' }
            : c
        ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      )

      setReplyMessage('')
      toast({ title: 'Sent', description: 'Your reply has been sent' })

    } catch (error) {
      console.error('Error sending reply:', error)
      toast({ title: 'Error', description: 'Failed to send reply', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const sendNewMessage = async () => {
    if (!selectedMember || !newMessageContent.trim() || !adminMemberId) return

    const supabase = createClient()
    setSending(true)

    try {
      const conversationId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: adminMemberId,
          sender_type: 'admin',
          recipient_id: selectedMember.id,
          recipient_type: 'member',
          subject: newMessageSubject || `Message from TPC Ministries`,
          message: newMessageContent,
          is_read: false,
        })
        .select()
        .single()

      if (error) throw error

      // Add to conversations list
      const newConversation: GroupedConversation = {
        conversation_id: conversationId,
        member: selectedMember,
        subject: newMessageSubject || 'Message from TPC Ministries',
        last_message: newMessageContent,
        last_message_at: data.created_at,
        last_sender_type: 'admin',
        unread_count: 0,
        is_starred: false,
        messages: [{
          ...data,
          sender: { id: adminMemberId, first_name: 'Admin', last_name: '', email: '', tier: 'admin' }
        }]
      }

      setConversations(prev => [newConversation, ...prev])
      setSelectedConversation(newConversation)

      // Reset form
      setIsNewMessageDialogOpen(false)
      setSelectedMember(null)
      setNewMessageSubject('')
      setNewMessageContent('')
      setMemberSearchQuery('')
      setSearchedMembers([])

      toast({ title: 'Sent', description: `Message sent to ${selectedMember.first_name}` })

    } catch (error) {
      console.error('Error sending new message:', error)
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'partner': return 'bg-gold/20 text-gold border-gold'
      case 'covenant': return 'bg-purple-100 text-purple-700 border-purple-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchConversations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-navy hover:bg-navy/90" onClick={() => setIsNewMessageDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Inbox className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{stats.total}</span>
            <span className="text-gray-500">conversations</span>
          </div>
          {stats.unread > 0 && (
            <Badge variant="destructive" className="px-2 py-0.5">
              {stats.unread} unread
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full md:w-96 border-r bg-gray-50 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
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

          <div className="flex border-b bg-white">
            {['all', 'unread', 'starred'].map(tab => (
              <button
                key={tab}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'unread' && stats.unread > 0 && `(${stats.unread})`}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm mb-4">Start a conversation with a member</p>
                <Button size="sm" onClick={() => setIsNewMessageDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
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
                            {conv.member ? `${conv.member.first_name} ${conv.member.last_name}` : 'Unknown'}
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
              <div className="border-b p-4 bg-white">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedConversation(null)}>
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
                        {selectedConversation.member ? `${selectedConversation.member.first_name} ${selectedConversation.member.last_name}` : 'Unknown'}
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
                      <Button variant="ghost" size="sm"><MoreVertical className="h-5 w-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Star className="h-4 w-4 mr-2" />Star</DropdownMenuItem>
                      <DropdownMenuItem><Archive className="h-4 w-4 mr-2" />Archive</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><User className="h-4 w-4 mr-2" />View Profile</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Subject: {selectedConversation.subject}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%]`}>
                      <div className={`rounded-2xl px-4 py-2 ${
                        msg.sender_type === 'admin'
                          ? 'bg-navy text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}>
                        {msg.voice_url ? (
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            <audio controls className="h-8"><source src={msg.voice_url} /></audio>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${msg.sender_type === 'admin' ? 'justify-end' : ''}`}>
                        <span className="text-xs text-gray-500">{formatFullDate(msg.created_at)}</span>
                        {msg.sender_type === 'admin' && msg.is_read && <CheckCheck className="h-3 w-3 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-4 bg-gray-50">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-navy"
                      rows={2}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }}}
                    />
                  </div>
                  <Button className="bg-navy hover:bg-navy/90 h-12 px-6" onClick={sendReply} disabled={!replyMessage.trim() || sending}>
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600">Select a conversation</h3>
                <p className="text-sm mb-4">Or start a new message</p>
                <Button onClick={() => setIsNewMessageDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Dialog */}
      <Dialog open={isNewMessageDialogOpen} onOpenChange={setIsNewMessageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-navy" />
              New Message
            </DialogTitle>
            <DialogDescription>Send a message to a member</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Member Selection */}
            {!selectedMember ? (
              <div className="space-y-2">
                <Label>Select Member *</Label>
                <div className="relative">
                  {searchingMembers ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  )}
                  <Input
                    placeholder="Search by name or email..."
                    value={memberSearchQuery}
                    onChange={(e) => handleMemberSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  {searchingMembers ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Searching...
                    </div>
                  ) : searchedMembers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {memberSearchQuery ? 'No members found' : 'Type to search members'}
                    </div>
                  ) : (
                    searchedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 cursor-pointer border-b last:border-b-0 hover:bg-gray-50 flex items-center gap-3"
                        onClick={() => setSelectedMember(member)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.profile_image_url} />
                          <AvatarFallback className="bg-navy text-white text-xs">
                            {member.first_name[0]}{member.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{member.first_name} {member.last_name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                        <Badge variant="outline" className={getTierColor(member.tier)}>{member.tier}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-navy/5 border border-navy/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedMember.profile_image_url} />
                    <AvatarFallback className="bg-navy text-white">
                      {selectedMember.first_name[0]}{selectedMember.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedMember.first_name} {selectedMember.last_name}</div>
                    <div className="text-sm text-gray-500">{selectedMember.email}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={messageCategory} onValueChange={setMessageCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="prayer">Prayer Support</SelectItem>
                  <SelectItem value="encouragement">Encouragement</SelectItem>
                  <SelectItem value="followup">Follow Up</SelectItem>
                  <SelectItem value="prophetic">Prophetic Word</SelectItem>
                  <SelectItem value="counseling">Pastoral Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Message subject..."
                value={newMessageSubject}
                onChange={(e) => setNewMessageSubject(e.target.value)}
              />
            </div>

            {/* AI Assistant Toggle */}
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">AI Writing Assistant</p>
                  <p className="text-sm text-purple-700">Let AI help compose your message</p>
                </div>
              </div>
              <Button
                variant={showAiAssistant ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                className={showAiAssistant ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <Wand2 className="h-4 w-4 mr-1" />
                {showAiAssistant ? 'Hide' : 'Use AI'}
              </Button>
            </div>

            {/* AI Assistant Panel */}
            {showAiAssistant && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                <div className="space-y-2">
                  <Label className="text-purple-900">What would you like to say? (optional)</Label>
                  <Input
                    placeholder="e.g., Check in after their recent surgery, thank them for volunteering..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <Button
                  onClick={generateAiMessage}
                  disabled={aiGenerating || !selectedMember}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {aiGenerating ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" />Generate Message</>
                  )}
                </Button>

                {aiSuggestion && (
                  <div className="mt-3 p-3 bg-white rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-900">AI Suggestion</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={generateAiMessage}>
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(aiSuggestion)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiSuggestion}</p>
                    <Button size="sm" className="mt-2 bg-purple-600 hover:bg-purple-700" onClick={useAiSuggestion}>
                      Use This Message
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Message Content */}
            <div className="space-y-2">
              <Label>Message *</Label>
              <textarea
                className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                placeholder="Type your message..."
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMessageDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-navy hover:bg-navy/90"
              onClick={sendNewMessage}
              disabled={!selectedMember || !newMessageContent.trim() || sending}
            >
              {sending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><Send className="h-4 w-4 mr-2" />Send Message</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

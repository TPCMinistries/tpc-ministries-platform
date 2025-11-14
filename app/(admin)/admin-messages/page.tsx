'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Loader2, ArrowLeft, Search, User, Mail } from 'lucide-react'
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
  is_read: boolean
  read_at?: string
  created_at: string
  sender?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface Conversation {
  conversation_id: string
  member_id: string
  member_name: string
  member_email: string
  subject: string
  last_message: string
  last_message_at: string
  unread_count: number
  messages: Message[]
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [adminId, setAdminId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      markConversationAsRead(selectedConversation.conversation_id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setAdminId(user.id)

      // Fetch all messages where recipient_type is 'admin' or sender_type is 'admin'
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:members!messages_sender_id_fkey(first_name, last_name, email)
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
      const conversationMap = new Map<string, Message[]>()
      messagesData?.forEach((message) => {
        const convId = message.conversation_id
        if (!conversationMap.has(convId)) {
          conversationMap.set(convId, [])
        }
        conversationMap.get(convId)!.push(message)
      })

      // Build conversation objects
      const conversationList: Conversation[] = []
      conversationMap.forEach((messages, convId) => {
        const firstMessage = messages[0]
        const lastMessage = messages[messages.length - 1]

        // Get member info from first member message
        const memberMessage = messages.find((m) => m.sender_type === 'member')
        if (!memberMessage || !memberMessage.sender) return

        const unreadCount = messages.filter(
          (m) => m.recipient_type === 'admin' && !m.is_read
        ).length

        conversationList.push({
          conversation_id: convId,
          member_id: memberMessage.sender_id,
          member_name: `${memberMessage.sender.first_name} ${memberMessage.sender.last_name}`,
          member_email: memberMessage.sender.email,
          subject: firstMessage.subject || 'No Subject',
          last_message: lastMessage.message,
          last_message_at: lastMessage.created_at,
          unread_count: unreadCount,
          messages,
        })
      })

      // Sort by last message date
      conversationList.sort(
        (a, b) =>
          new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      )

      setConversations(conversationList)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const markConversationAsRead = async (conversationId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .eq('recipient_type', 'admin')
        .eq('is_read', false)

      if (!error) {
        // Update local state
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversation_id === conversationId
              ? { ...conv, unread_count: 0 }
              : conv
          )
        )
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyMessage.trim() || !selectedConversation) return

    const supabase = createClient()
    setSending(true)

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation.conversation_id,
        sender_id: adminId,
        sender_type: 'admin',
        recipient_id: selectedConversation.member_id,
        recipient_type: 'member',
        message: replyMessage,
      })

      if (error) {
        console.error('Error sending reply:', error)
        toast({
          title: 'Error',
          description: 'Failed to send reply',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Reply sent successfully',
        })
        setReplyMessage('')
        fetchConversations()
        // Refresh selected conversation
        const updatedConv = conversations.find(
          (c) => c.conversation_id === selectedConversation.conversation_id
        )
        if (updatedConv) {
          setTimeout(() => setSelectedConversation(updatedConv), 100)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.member_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0)

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  // Show conversation detail view
  if (selectedConversation) {
    return (
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="border-b bg-white p-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-navy">
                  {selectedConversation.subject}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{selectedConversation.member_name}</span>
                  <span className="text-gray-400">•</span>
                  <Mail className="h-3 w-3" />
                  <span>{selectedConversation.member_email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-5xl mx-auto space-y-4">
            {selectedConversation.messages.map((message) => {
              const isFromAdmin = message.sender_type === 'admin'
              return (
                <div
                  key={message.id}
                  className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      isFromAdmin
                        ? 'bg-gold text-navy'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    {!isFromAdmin && (
                      <div className="text-sm font-semibold text-navy mb-1">
                        {selectedConversation.member_name}
                      </div>
                    )}
                    {isFromAdmin && (
                      <div className="text-sm font-semibold mb-1">
                        TPC Leadership
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.message}</p>
                    <div
                      className={`text-xs mt-2 ${
                        isFromAdmin ? 'text-navy/70' : 'text-gray-500'
                      }`}
                    >
                      {formatDateTime(message.created_at)}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Reply Input */}
        <div className="border-t bg-white p-4">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSendReply} className="flex gap-3">
              <Textarea
                placeholder="Type your reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="min-h-[80px]"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={sending || !replyMessage.trim()}
                className="bg-gold hover:bg-gold/90 text-navy"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Show conversations list
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-8 w-8 text-gold" />
            <h1 className="text-4xl font-bold text-navy">Member Messages</h1>
            {totalUnread > 0 && (
              <Badge className="bg-red-600 text-white text-lg px-3 py-1">
                {totalUnread}
              </Badge>
            )}
          </div>
          <p className="text-gray-600">
            Messages from members and conversations
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">
                {conversations.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unread Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{totalUnread}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {
                  conversations.filter((conv) => {
                    const lastMessageDate = new Date(conv.last_message_at)
                    const today = new Date()
                    return lastMessageDate.toDateString() === today.toDateString()
                  }).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by member name, email, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-navy">All Conversations</CardTitle>
            <CardDescription>
              {filteredConversations.length} conversation
              {filteredConversations.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.conversation_id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      conversation.unread_count > 0
                        ? 'border-l-4 border-l-red-600 bg-red-50/30'
                        : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-navy" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`font-semibold text-navy truncate ${
                                  conversation.unread_count > 0 ? 'font-bold' : ''
                                }`}
                              >
                                {conversation.member_name}
                              </h3>
                              {conversation.unread_count > 0 && (
                                <Badge className="bg-red-600 text-white text-xs">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {conversation.member_email}
                            </div>
                          </div>
                        </div>
                        <div className="ml-13">
                          <p
                            className={`text-sm font-medium text-navy mb-1 ${
                              conversation.unread_count > 0 ? 'font-semibold' : ''
                            }`}
                          >
                            {conversation.subject}
                          </p>
                          <p
                            className={`text-sm text-gray-600 truncate ${
                              conversation.unread_count > 0 ? 'font-medium' : ''
                            }`}
                          >
                            {conversation.last_message}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(conversation.last_message_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

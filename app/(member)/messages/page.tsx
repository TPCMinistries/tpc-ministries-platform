'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Loader2, ArrowLeft, Plus } from 'lucide-react'
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
  subject: string
  last_message: string
  last_message_at: string
  unread_count: number
  messages: Message[]
}

export default function MemberMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [newMessageForm, setNewMessageForm] = useState({
    subject: '',
    message: '',
  })
  const [replyMessage, setReplyMessage] = useState('')
  const [userId, setUserId] = useState<string>('')
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

      setUserId(user.id)

      // Fetch all messages for this user
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:members!messages_sender_id_fkey(first_name, last_name, email)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
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
        const unreadCount = messages.filter(
          (m) => m.recipient_id === user.id && !m.is_read
        ).length

        conversationList.push({
          conversation_id: convId,
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
        .eq('recipient_id', userId)
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

  const handleSendNewMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessageForm.subject.trim() || !newMessageForm.message.trim()) {
      toast({
        title: 'Error',
        description: 'Subject and message are required',
        variant: 'destructive',
      })
      return
    }

    const supabase = createClient()
    setSending(true)

    try {
      const conversationId = crypto.randomUUID()

      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: userId,
        sender_type: 'member',
        recipient_type: 'admin',
        subject: newMessageForm.subject,
        message: newMessageForm.message,
      })

      if (error) {
        console.error('Error sending message:', error)
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Message sent to leadership',
        })
        setNewMessageForm({ subject: '', message: '' })
        setShowNewMessage(false)
        fetchConversations()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSending(false)
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
        sender_id: userId,
        sender_type: 'member',
        recipient_type: 'admin',
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
                <p className="text-sm text-gray-600">
                  Conversation with TPC Leadership
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-5xl mx-auto space-y-4">
            {selectedConversation.messages.map((message) => {
              const isFromMe = message.sender_id === userId
              return (
                <div
                  key={message.id}
                  className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      isFromMe
                        ? 'bg-navy text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    {!isFromMe && (
                      <div className="text-sm font-semibold text-gold mb-1">
                        TPC Leadership
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.message}</p>
                    <div
                      className={`text-xs mt-2 ${
                        isFromMe ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {formatDate(message.created_at)}
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
                className="bg-navy hover:bg-navy/90"
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

  // Show new message form
  if (showNewMessage) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewMessage(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Button>
            <h1 className="text-3xl font-bold text-navy">Message Leadership</h1>
            <p className="text-gray-600 mt-2">
              Send a message to TPC Leadership team
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSendNewMessage} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Subject *
                  </label>
                  <Input
                    placeholder="What is your message about?"
                    value={newMessageForm.subject}
                    onChange={(e) =>
                      setNewMessageForm({ ...newMessageForm, subject: e.target.value })
                    }
                    disabled={sending}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Message *
                  </label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={newMessageForm.message}
                    onChange={(e) =>
                      setNewMessageForm({ ...newMessageForm, message: e.target.value })
                    }
                    rows={8}
                    disabled={sending}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={sending}
                    className="bg-navy hover:bg-navy/90"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewMessage(false)}
                    disabled={sending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show conversations list
  return (
    <div className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-navy" />
              <h1 className="text-4xl font-bold text-navy">Messages</h1>
              {totalUnread > 0 && (
                <Badge className="bg-red-600 text-white">{totalUnread} new</Badge>
              )}
            </div>
            <Button
              onClick={() => setShowNewMessage(true)}
              className="bg-gold hover:bg-gold/90 text-navy"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
          <p className="text-gray-600">
            Your conversations with TPC Leadership
          </p>
        </div>

        {/* Conversations */}
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center mb-4">
                No messages yet
              </p>
              <Button
                onClick={() => setShowNewMessage(true)}
                className="bg-navy hover:bg-navy/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Start a Conversation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <Card
                key={conversation.conversation_id}
                className={`cursor-pointer hover:border-navy transition-colors ${
                  conversation.unread_count > 0 ? 'border-l-4 border-l-navy' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-semibold text-navy truncate ${
                            conversation.unread_count > 0 ? 'font-bold' : ''
                          }`}
                        >
                          {conversation.subject}
                        </h3>
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-red-600 text-white text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm text-gray-600 truncate ${
                          conversation.unread_count > 0 ? 'font-medium' : ''
                        }`}
                      >
                        {conversation.last_message}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(conversation.last_message_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

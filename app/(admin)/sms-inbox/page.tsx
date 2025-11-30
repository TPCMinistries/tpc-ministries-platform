'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageSquare,
  Send,
  Search,
  Archive,
  Trash2,
  User,
  Phone,
  ArrowLeft,
  Plus,
  ArchiveRestore,
  Check,
  CheckCheck,
} from 'lucide-react'
import Link from 'next/link'

interface SMSConversation {
  id: string
  phone_number: string
  member_id: string | null
  member: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
  } | null
  last_message_at: string
  message_count: number
  is_unread: boolean
  is_archived: boolean
  latestMessage?: {
    id: string
    body: string
    direction: string
    created_at: string
    status: string
  }
}

interface SMSMessage {
  id: string
  conversation_id: string
  direction: 'inbound' | 'outbound'
  from_number: string
  to_number: string
  body: string
  twilio_sid: string
  status: string
  created_at: string
  sender?: {
    id: string
    first_name: string
    last_name: string
  }
}

export default function SMSInboxPage() {
  const [conversations, setConversations] = useState<SMSConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<SMSConversation | null>(null)
  const [messages, setMessages] = useState<SMSMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composePhone, setComposePhone] = useState('')
  const [composeMessage, setComposeMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const params = new URLSearchParams({
        action: 'conversations',
        archived: showArchived.toString(),
      })
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/admin/sms?${params}`)
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true)
    try {
      const response = await fetch(
        `/api/admin/sms?action=messages&conversationId=${conversationId}`
      )
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data)

      // Update conversation in list to mark as read
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, is_unread: false } : c))
      )
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  // Send SMS
  const sendMessage = async (to: string, message: string, conversationId?: string) => {
    setSending(true)
    try {
      const response = await fetch('/api/admin/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          to,
          message,
          conversationId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to send message')
        return false
      }

      return data.conversationId
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
      return false
    } finally {
      setSending(false)
    }
  }

  // Handle sending reply
  const handleSendReply = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const success = await sendMessage(
      selectedConversation.phone_number,
      newMessage,
      selectedConversation.id
    )

    if (success) {
      setNewMessage('')
      fetchMessages(selectedConversation.id)
      fetchConversations()
    }
  }

  // Handle new compose
  const handleCompose = async () => {
    if (!composePhone.trim() || !composeMessage.trim()) return

    const convId = await sendMessage(composePhone, composeMessage)

    if (convId) {
      setComposeOpen(false)
      setComposePhone('')
      setComposeMessage('')
      await fetchConversations()

      // Select the new/existing conversation
      const conv = conversations.find((c) => c.id === convId)
      if (conv) {
        setSelectedConversation(conv)
        fetchMessages(convId)
      }
    }
  }

  // Archive conversation
  const archiveConversation = async (id: string, archive = true) => {
    try {
      await fetch('/api/admin/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archive',
          conversationId: id,
          archived: archive,
        }),
      })

      if (selectedConversation?.id === id) {
        setSelectedConversation(null)
        setMessages([])
      }
      fetchConversations()
    } catch (error) {
      console.error('Error archiving conversation:', error)
    }
  }

  // Delete conversation
  const deleteConversation = async (id: string) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return

    try {
      await fetch('/api/admin/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          conversationId: id,
        }),
      })

      if (selectedConversation?.id === id) {
        setSelectedConversation(null)
        setMessages([])
      }
      fetchConversations()
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial fetch
  useEffect(() => {
    fetchConversations()
  }, [showArchived, searchQuery])

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations()
      if (selectedConversation) {
        fetchMessages(selectedConversation.id)
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [selectedConversation])

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short' })
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'failed':
        return <span className="text-xs text-red-500">!</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SMS Inbox</h1>
          <p className="text-muted-foreground">Two-way text messaging with members</p>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New SMS Message</DialogTitle>
              <DialogDescription>Send a text message to any phone number</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  placeholder="(917) 555-1234"
                  value={composePhone}
                  onChange={(e) => setComposePhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your message..."
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {composeMessage.length}/160 characters
                </p>
              </div>
              <Button onClick={handleCompose} disabled={sending} className="w-full">
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={showArchived ? 'default' : 'outline'}
                size="icon"
                onClick={() => setShowArchived(!showArchived)}
                title={showArchived ? 'Show Active' : 'Show Archived'}
              >
                <Archive className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {showArchived ? 'No archived conversations' : 'No conversations yet'}
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-muted' : ''
                    } ${conv.is_unread ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                    onClick={() => {
                      setSelectedConversation(conv)
                      fetchMessages(conv.id)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {conv.member ? (
                          <span className="font-medium text-primary">
                            {conv.member.first_name[0]}
                            {conv.member.last_name[0]}
                          </span>
                        ) : (
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${conv.is_unread ? 'font-bold' : ''}`}>
                            {conv.member
                              ? `${conv.member.first_name} ${conv.member.last_name}`
                              : formatPhone(conv.phone_number)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {conv.latestMessage && formatTime(conv.latestMessage.created_at)}
                          </span>
                        </div>
                        {conv.member && (
                          <p className="text-xs text-muted-foreground">
                            {formatPhone(conv.phone_number)}
                          </p>
                        )}
                        {conv.latestMessage && (
                          <p
                            className={`text-sm truncate mt-1 ${
                              conv.is_unread ? 'font-medium text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {conv.latestMessage.direction === 'outbound' && 'You: '}
                            {conv.latestMessage.body}
                          </p>
                        )}
                      </div>
                      {conv.is_unread && (
                        <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages View */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {selectedConversation.member ? (
                        <span className="font-medium text-primary">
                          {selectedConversation.member.first_name[0]}
                          {selectedConversation.member.last_name[0]}
                        </span>
                      ) : (
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedConversation.member
                          ? `${selectedConversation.member.first_name} ${selectedConversation.member.last_name}`
                          : formatPhone(selectedConversation.phone_number)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatPhone(selectedConversation.phone_number)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConversation.member && (
                      <Link href={`/members/${selectedConversation.member.id}`}>
                        <Button variant="outline" size="sm">
                          <User className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                      </Link>
                    )}
                    {selectedConversation.is_archived ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => archiveConversation(selectedConversation.id, false)}
                        title="Restore"
                      >
                        <ArchiveRestore className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => archiveConversation(selectedConversation.id, true)}
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteConversation(selectedConversation.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-4">
                {messagesLoading ? (
                  <div className="text-center text-muted-foreground">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">No messages yet</div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            msg.direction === 'outbound'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs ${
                              msg.direction === 'outbound'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                            {msg.direction === 'outbound' && getStatusIcon(msg.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendReply()
                      }
                    }}
                  />
                  <Button onClick={handleSendReply} disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {newMessage.length}/160 characters
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
                <p className="text-sm mt-2">or</p>
                <Button variant="outline" className="mt-2" onClick={() => setComposeOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

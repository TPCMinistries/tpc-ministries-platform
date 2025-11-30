'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles,
  Send,
  Loader2,
  MessageCircle,
  History,
  Plus,
  User,
  Bot,
  BookOpen,
  Heart,
  Lightbulb,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface Conversation {
  id: string
  title: string
  message_count: number
  last_message_at: string
  created_at: string
}

const SUGGESTED_TOPICS = [
  { icon: Heart, label: 'Prayer guidance', prompt: 'Prophet Lorenzo, I need guidance on how to deepen my prayer life. What does the Lord say?' },
  { icon: Lightbulb, label: 'Discerning God\'s voice', prompt: 'How can I better discern God\'s voice and know when He is speaking to me?' },
  { icon: BookOpen, label: 'Understanding Scripture', prompt: 'Can you help me understand how to apply Scripture to my daily life?' },
  { icon: Sparkles, label: 'My spiritual gifts', prompt: 'Prophet Lorenzo, I want to understand my spiritual gifts better. What do you see in me?' },
]

export default function AskProphetLorenzoPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    initializeMember()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeMember = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id, first_name')
        .eq('user_id', user.id)
        .single()

      if (member) {
        setMemberId(member.id)
        fetchConversations(member.id)
      }
    } catch (error) {
      console.error('Error initializing:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const fetchConversations = async (memberId: string) => {
    try {
      const response = await fetch(`/api/ai/prophet-lorenzo?memberId=${memberId}`)
      const data = await response.json()
      if (data.conversations) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const loadConversation = async (conversationId: string) => {
    if (!memberId) return
    setLoading(true)

    try {
      const response = await fetch(
        `/api/ai/prophet-lorenzo?memberId=${memberId}&conversationId=${conversationId}`
      )
      const data = await response.json()

      if (data.messages) {
        setMessages(data.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          created_at: m.created_at
        })))
        setCurrentConversationId(conversationId)
        setShowHistory(false)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
    setShowHistory(false)
    setInput('')
  }

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || !memberId || loading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/prophet-lorenzo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          memberId,
          conversationId: currentConversationId
        })
      })

      const data = await response.json()

      if (data.response) {
        const aiMessage: Message = { role: 'assistant', content: data.response }
        setMessages(prev => [...prev, aiMessage])

        if (!currentConversationId && data.conversationId) {
          setCurrentConversationId(data.conversationId)
          fetchConversations(memberId)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, beloved. There seems to be a technical issue. Please try again, and know that God hears your heart even when technology fails us.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessageContent = (content: string) => {
    // Format scripture references in bold
    const formatted = content.replace(
      /(\d?\s?[A-Z][a-z]+\s+\d+:\d+(?:-\d+)?)/g,
      '**$1**'
    )
    return formatted
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Ask Prophet Lorenzo</h1>
            <p className="text-sm text-muted-foreground">Your personal spiritual guide</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={startNewConversation}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Conversation History Sidebar */}
        {showHistory && (
          <Card className="w-72 flex-shrink-0">
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm mb-3 text-navy">Past Conversations</h3>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-2">
                  {loadingHistory ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No conversations yet
                    </p>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className={cn(
                          'w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors',
                          currentConversationId === conv.id && 'bg-gold/10 border border-gold/30'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium line-clamp-2">{conv.title}</p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MessageCircle className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {conv.message_count} messages
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="flex-1 flex flex-col p-4 min-h-0">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gold/20 to-navy/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-10 w-10 text-gold" />
                  </div>
                  <h2 className="text-xl font-semibold text-navy mb-2">
                    Welcome, Beloved
                  </h2>
                  <p className="text-muted-foreground max-w-md mb-6">
                    I'm here to provide spiritual guidance, pray with you, and help you grow in your walk with God.
                    What's on your heart today?
                  </p>

                  {/* Suggested Topics */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                    {SUGGESTED_TOPICS.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(topic.prompt)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gold hover:bg-gold/5 transition-all text-left"
                      >
                        <topic.icon className="h-5 w-5 text-gold flex-shrink-0" />
                        <span className="text-sm font-medium">{topic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-3',
                          message.role === 'user'
                            ? 'bg-navy text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-gold" />
                          <span className="text-sm text-muted-foreground">
                            Prophet Lorenzo is typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-3">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message to Prophet Lorenzo..."
                  className="min-h-[60px] max-h-[120px] resize-none"
                  disabled={loading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="h-[60px] w-[60px] bg-gold hover:bg-gold-dark"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Prophet Lorenzo AI provides spiritual guidance based on biblical principles.
                For urgent matters, please contact us directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

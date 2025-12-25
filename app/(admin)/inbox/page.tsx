'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  Inbox,
  Send,
  Star,
  Trash2,
  Archive,
  Search,
  Loader2,
  Mail,
  MailOpen,
  Reply,
  MoreHorizontal,
  MoreVertical,
  RefreshCw,
  ChevronLeft,
  Clock,
  User,
  Plus,
  CheckCircle2,
  MessageSquare,
  Phone,
  ArrowLeft,
  ArchiveRestore,
  Check,
  CheckCheck,
  X,
  Volume2,
  Sparkles,
  Wand2,
  Copy,
  RotateCcw,
  Users,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// ============ EMAIL INTERFACES ============
interface Email {
  id: string
  from_email: string
  from_name?: string
  to_email: string
  subject: string
  body_text?: string
  body_html?: string
  is_read: boolean
  is_starred: boolean
  folder: string
  received_at: string
  thread_id?: string
  members?: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
  }
}

// ============ SMS INTERFACES ============
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

// ============ INTERNAL MESSAGE INTERFACES ============
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

export default function UnifiedInboxPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'sms' | 'messages'>('email')
  const { toast } = useToast()

  // ============ EMAIL STATE ============
  const [emails, setEmails] = useState<Email[]>([])
  const [emailLoading, setEmailLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [currentFolder, setCurrentFolder] = useState('inbox')
  const [emailSearchQuery, setEmailSearchQuery] = useState('')
  const [emailUnreadCount, setEmailUnreadCount] = useState(0)

  // Email compose
  const [showCompose, setShowCompose] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeMessage, setComposeMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState<Email | null>(null)
  const [emailSending, setEmailSending] = useState(false)

  // ============ SMS STATE ============
  const [smsConversations, setSmsConversations] = useState<SMSConversation[]>([])
  const [selectedSmsConversation, setSelectedSmsConversation] = useState<SMSConversation | null>(null)
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([])
  const [smsLoading, setSmsLoading] = useState(true)
  const [smsMessagesLoading, setSmsMessagesLoading] = useState(false)
  const [smsSearchQuery, setSmsSearchQuery] = useState('')
  const [showSmsArchived, setShowSmsArchived] = useState(false)
  const [newSmsMessage, setNewSmsMessage] = useState('')
  const [smsSending, setSmsSending] = useState(false)
  const [smsComposeOpen, setSmsComposeOpen] = useState(false)
  const [smsComposePhone, setSmsComposePhone] = useState('')
  const [smsComposeMessage, setSmsComposeMessage] = useState('')
  const smsMessagesEndRef = useRef<HTMLDivElement>(null)

  // ============ INTERNAL MESSAGES STATE ============
  const [msgConversations, setMsgConversations] = useState<GroupedConversation[]>([])
  const [selectedMsgConversation, setSelectedMsgConversation] = useState<GroupedConversation | null>(null)
  const [msgLoading, setMsgLoading] = useState(true)
  const [msgSending, setMsgSending] = useState(false)
  const [replyMsgMessage, setReplyMsgMessage] = useState('')
  const [msgSearchQuery, setMsgSearchQuery] = useState('')
  const [msgActiveFilter, setMsgActiveFilter] = useState('all')
  const [adminMemberId, setAdminMemberId] = useState<string>('')
  const msgMessagesEndRef = useRef<HTMLDivElement>(null)

  // New Message Dialog State
  const [isNewMsgDialogOpen, setIsNewMsgDialogOpen] = useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [searchedMembers, setSearchedMembers] = useState<Member[]>([])
  const [searchingMembers, setSearchingMembers] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [newMsgSubject, setNewMsgSubject] = useState('')
  const [newMsgContent, setNewMsgContent] = useState('')
  const [messageCategory, setMessageCategory] = useState('general')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // AI Assistant State
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')

  // Message Stats
  const [msgStats, setMsgStats] = useState({ total: 0, unread: 0, starred: 0 })

  // ============ EMAIL FUNCTIONS ============
  useEffect(() => {
    if (activeTab === 'email') {
      fetchEmails()
    }
  }, [currentFolder, activeTab])

  const fetchEmails = async () => {
    setEmailLoading(true)
    try {
      const res = await fetch(`/api/admin/inbox?folder=${currentFolder}&search=${emailSearchQuery}`)
      const data = await res.json()
      if (data.success) {
        setEmails(data.emails || [])
        setEmailUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
    } finally {
      setEmailLoading(false)
    }
  }

  const handleMarkAsRead = async (emailId: string, read: boolean) => {
    try {
      await fetch('/api/admin/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emailId, is_read: read })
      })
      fetchEmails()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update email', variant: 'destructive' })
    }
  }

  const handleStar = async (emailId: string, starred: boolean) => {
    try {
      await fetch('/api/admin/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emailId, is_starred: starred })
      })
      setEmails(prev => prev.map(e => e.id === emailId ? { ...e, is_starred: starred } : e))
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update email', variant: 'destructive' })
    }
  }

  const handleDeleteEmail = async (emailIds: string[]) => {
    try {
      await fetch(`/api/admin/inbox?ids=${emailIds.join(',')}`, { method: 'DELETE' })
      toast({ title: 'Success', description: 'Email(s) moved to trash' })
      setSelectedEmail(null)
      setSelectedEmails(new Set())
      fetchEmails()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete email', variant: 'destructive' })
    }
  }

  const handleArchiveEmail = async (emailIds: string[]) => {
    try {
      await fetch('/api/admin/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: emailIds, folder: 'archive' })
      })
      toast({ title: 'Success', description: 'Email(s) archived' })
      setSelectedEmail(null)
      setSelectedEmails(new Set())
      fetchEmails()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to archive email', variant: 'destructive' })
    }
  }

  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeMessage) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' })
      return
    }

    setEmailSending(true)
    try {
      const res = await fetch('/api/admin/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          html: `<div style="font-family: sans-serif; max-width: 600px;">
            <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">TPC Ministries</h1>
            </div>
            <div style="padding: 30px 20px; background: white;">
              ${composeMessage.replace(/\n/g, '<br>')}
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
              TPC Ministries | <a href="https://tpcmin.org" style="color: #c9a961;">tpcmin.org</a>
            </div>
          </div>`,
          replyToId: replyingTo?.id,
          threadId: replyingTo?.thread_id
        })
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Email sent successfully' })
        setShowCompose(false)
        resetEmailCompose()
        fetchEmails()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send email', variant: 'destructive' })
    } finally {
      setEmailSending(false)
    }
  }

  const resetEmailCompose = () => {
    setComposeTo('')
    setComposeSubject('')
    setComposeMessage('')
    setReplyingTo(null)
  }

  const handleReply = (email: Email) => {
    setReplyingTo(email)
    setComposeTo(email.from_email)
    setComposeSubject(`Re: ${email.subject}`)
    setComposeMessage(`\n\n---\nOn ${formatEmailDate(email.received_at)}, ${email.from_name || email.from_email} wrote:\n${email.body_text || ''}`)
    setShowCompose(true)
  }

  // ============ SMS FUNCTIONS ============
  useEffect(() => {
    if (activeTab === 'sms') {
      fetchSmsConversations()
    }
  }, [showSmsArchived, smsSearchQuery, activeTab])

  useEffect(() => {
    smsMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [smsMessages])

  const fetchSmsConversations = async () => {
    setSmsLoading(true)
    try {
      const params = new URLSearchParams({
        action: 'conversations',
        archived: showSmsArchived.toString(),
      })
      if (smsSearchQuery) params.set('search', smsSearchQuery)

      const response = await fetch(`/api/admin/sms?${params}`)
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      setSmsConversations(data)
    } catch (error) {
      console.error('Error fetching SMS conversations:', error)
    } finally {
      setSmsLoading(false)
    }
  }

  const fetchSmsMessages = async (conversationId: string) => {
    setSmsMessagesLoading(true)
    try {
      const response = await fetch(`/api/admin/sms?action=messages&conversationId=${conversationId}`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setSmsMessages(data)
      setSmsConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, is_unread: false } : c))
      )
    } catch (error) {
      console.error('Error fetching SMS messages:', error)
    } finally {
      setSmsMessagesLoading(false)
    }
  }

  const sendSms = async (to: string, message: string, conversationId?: string) => {
    setSmsSending(true)
    try {
      const response = await fetch('/api/admin/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', to, message, conversationId }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to send message', variant: 'destructive' })
        return false
      }
      return data.conversationId
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' })
      return false
    } finally {
      setSmsSending(false)
    }
  }

  const handleSendSmsReply = async () => {
    if (!newSmsMessage.trim() || !selectedSmsConversation) return
    const success = await sendSms(selectedSmsConversation.phone_number, newSmsMessage, selectedSmsConversation.id)
    if (success) {
      setNewSmsMessage('')
      fetchSmsMessages(selectedSmsConversation.id)
      fetchSmsConversations()
    }
  }

  const handleComposeSms = async () => {
    if (!smsComposePhone.trim() || !smsComposeMessage.trim()) return
    const convId = await sendSms(smsComposePhone, smsComposeMessage)
    if (convId) {
      setSmsComposeOpen(false)
      setSmsComposePhone('')
      setSmsComposeMessage('')
      await fetchSmsConversations()
    }
  }

  const archiveSmsConversation = async (id: string, archive = true) => {
    try {
      await fetch('/api/admin/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', conversationId: id, archived: archive }),
      })
      if (selectedSmsConversation?.id === id) {
        setSelectedSmsConversation(null)
        setSmsMessages([])
      }
      fetchSmsConversations()
    } catch (error) {
      console.error('Error archiving SMS conversation:', error)
    }
  }

  const deleteSmsConversation = async (id: string) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return
    try {
      await fetch('/api/admin/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', conversationId: id }),
      })
      if (selectedSmsConversation?.id === id) {
        setSelectedSmsConversation(null)
        setSmsMessages([])
      }
      fetchSmsConversations()
    } catch (error) {
      console.error('Error deleting SMS conversation:', error)
    }
  }

  // ============ INTERNAL MESSAGES FUNCTIONS ============
  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMsgConversations()
    }
  }, [activeTab])

  useEffect(() => {
    if (selectedMsgConversation) {
      msgMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      if (selectedMsgConversation.unread_count > 0) {
        markMsgAsRead(selectedMsgConversation.conversation_id)
      }
    }
  }, [selectedMsgConversation])

  const fetchMsgConversations = async () => {
    const supabase = createClient()
    setMsgLoading(true)

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

      setMsgConversations(conversationsArray)

      const totalUnread = conversationsArray.reduce((sum, c) => sum + c.unread_count, 0)
      setMsgStats({
        total: conversationsArray.length,
        unread: totalUnread,
        starred: conversationsArray.filter(c => c.is_starred).length
      })

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setMsgLoading(false)
    }
  }

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
      setAiSuggestion(`Hi ${selectedMember?.first_name || 'there'}, I hope you're doing well. I wanted to reach out and let you know we're here for you. Please don't hesitate to reach out if you need anything.`)
    } finally {
      setAiGenerating(false)
    }
  }

  const useAiSuggestion = () => {
    setNewMsgContent(aiSuggestion)
    setShowAiAssistant(false)
    setAiSuggestion('')
    setAiPrompt('')
  }

  const markMsgAsRead = async (conversationId: string) => {
    const supabase = createClient()

    try {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('recipient_type', 'admin')
        .eq('is_read', false)

      setMsgConversations(prev =>
        prev.map(c => c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c)
      )

      if (selectedMsgConversation?.conversation_id === conversationId) {
        setSelectedMsgConversation(prev => prev ? { ...prev, unread_count: 0 } : null)
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const sendMsgReply = async () => {
    if (!replyMsgMessage.trim() || !selectedMsgConversation || !adminMemberId) return

    const supabase = createClient()
    setMsgSending(true)

    try {
      const memberId = selectedMsgConversation.member?.id
      if (!memberId) {
        toast({ title: 'Error', description: 'Could not find member', variant: 'destructive' })
        return
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedMsgConversation.conversation_id,
          sender_id: adminMemberId,
          sender_type: 'admin',
          recipient_id: memberId,
          recipient_type: 'member',
          message: replyMsgMessage,
          is_read: false,
        })
        .select()
        .single()

      if (error) throw error

      const newMessage: Message = {
        ...data,
        sender: { id: adminMemberId, first_name: 'Admin', last_name: '', email: '', tier: 'admin' }
      }

      setSelectedMsgConversation(prev => {
        if (!prev) return null
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          last_message: replyMsgMessage,
          last_message_at: newMessage.created_at,
          last_sender_type: 'admin'
        }
      })

      setMsgConversations(prev =>
        prev.map(c =>
          c.conversation_id === selectedMsgConversation.conversation_id
            ? { ...c, messages: [...c.messages, newMessage], last_message: replyMsgMessage, last_message_at: newMessage.created_at, last_sender_type: 'admin' }
            : c
        ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      )

      setReplyMsgMessage('')
      toast({ title: 'Sent', description: 'Your reply has been sent' })

    } catch (error) {
      console.error('Error sending reply:', error)
      toast({ title: 'Error', description: 'Failed to send reply', variant: 'destructive' })
    } finally {
      setMsgSending(false)
    }
  }

  const sendNewMessage = async () => {
    if (!selectedMember || !newMsgContent.trim() || !adminMemberId) return

    const supabase = createClient()
    setMsgSending(true)

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
          subject: newMsgSubject || `Message from TPC Ministries`,
          message: newMsgContent,
          is_read: false,
        })
        .select()
        .single()

      if (error) throw error

      const newConversation: GroupedConversation = {
        conversation_id: conversationId,
        member: selectedMember,
        subject: newMsgSubject || 'Message from TPC Ministries',
        last_message: newMsgContent,
        last_message_at: data.created_at,
        last_sender_type: 'admin',
        unread_count: 0,
        is_starred: false,
        messages: [{
          ...data,
          sender: { id: adminMemberId, first_name: 'Admin', last_name: '', email: '', tier: 'admin' }
        }]
      }

      setMsgConversations(prev => [newConversation, ...prev])
      setSelectedMsgConversation(newConversation)

      setIsNewMsgDialogOpen(false)
      setSelectedMember(null)
      setNewMsgSubject('')
      setNewMsgContent('')
      setMemberSearchQuery('')
      setSearchedMembers([])

      toast({ title: 'Sent', description: `Message sent to ${selectedMember.first_name}` })

    } catch (error) {
      console.error('Error sending new message:', error)
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' })
    } finally {
      setMsgSending(false)
    }
  }

  // ============ HELPER FUNCTIONS ============
  const formatEmailDate = (dateString: string) => {
    const date = new Date(dateString)
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

  const getSmsStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'sent': return <Check className="h-3 w-3 text-gray-400" />
      case 'failed': return <span className="text-xs text-red-500">!</span>
      default: return null
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'partner': return 'bg-gold/20 text-gold border-gold'
      case 'covenant': return 'bg-purple-100 text-purple-700 border-purple-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const emailFolders = [
    { name: 'inbox', label: 'Inbox', icon: Inbox, count: emailUnreadCount },
    { name: 'sent', label: 'Sent', icon: Send },
    { name: 'starred', label: 'Starred', icon: Star },
    { name: 'archive', label: 'Archive', icon: Archive },
    { name: 'trash', label: 'Trash', icon: Trash2 },
  ]

  const smsUnreadCount = smsConversations.filter(c => c.is_unread).length
  const msgUnreadCount = msgStats.unread
  const totalUnreadCount = emailUnreadCount + smsUnreadCount + msgUnreadCount

  const filteredMsgConversations = msgConversations.filter(conv => {
    const matchesSearch = !msgSearchQuery ||
      conv.member?.first_name?.toLowerCase().includes(msgSearchQuery.toLowerCase()) ||
      conv.member?.last_name?.toLowerCase().includes(msgSearchQuery.toLowerCase()) ||
      conv.member?.email?.toLowerCase().includes(msgSearchQuery.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(msgSearchQuery.toLowerCase())

    const matchesTab = msgActiveFilter === 'all' ||
      (msgActiveFilter === 'unread' && conv.unread_count > 0) ||
      (msgActiveFilter === 'starred' && conv.is_starred)

    return matchesSearch && matchesTab
  })

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Communications</h1>
          <p className="text-gray-600">Manage all communications in one place</p>
        </div>
        {totalUnreadCount > 0 && (
          <Badge className="bg-red-500 text-white text-sm px-3 py-1">
            {totalUnreadCount} unread
          </Badge>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'email'
              ? 'bg-white shadow-sm text-navy font-medium'
              : 'text-gray-600 hover:text-navy'
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
          {emailUnreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs ml-1">{emailUnreadCount}</Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'sms'
              ? 'bg-white shadow-sm text-navy font-medium'
              : 'text-gray-600 hover:text-navy'
          }`}
        >
          <Phone className="h-4 w-4" />
          SMS
          {smsUnreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs ml-1">{smsUnreadCount}</Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'messages'
              ? 'bg-white shadow-sm text-navy font-medium'
              : 'text-gray-600 hover:text-navy'
          }`}
        >
          <Users className="h-4 w-4" />
          Messages
          {msgUnreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs ml-1">{msgUnreadCount}</Badge>
          )}
        </button>
      </div>

      {/* ============ EMAIL TAB ============ */}
      {activeTab === 'email' && (
        <div className="flex h-[calc(100vh-16rem)] rounded-lg border overflow-hidden bg-white">
          {/* Email Sidebar */}
          <div className="w-56 bg-gray-50 border-r p-4 flex flex-col">
            <Button
              onClick={() => { resetEmailCompose(); setShowCompose(true) }}
              className="w-full bg-navy hover:bg-navy/90 mb-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>

            <nav className="space-y-1">
              {emailFolders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => { setCurrentFolder(folder.name); setSelectedEmail(null) }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                    currentFolder === folder.name
                      ? 'bg-navy text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <folder.icon className="h-4 w-4" />
                  <span className="flex-1">{folder.label}</span>
                  {folder.count !== undefined && folder.count > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">{folder.count}</Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Email List */}
          <div className={`${selectedEmail ? 'w-80' : 'flex-1'} border-r flex flex-col`}>
            <div className="p-3 border-b bg-white">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search emails..."
                    value={emailSearchQuery}
                    onChange={(e) => setEmailSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchEmails()}
                    className="pl-10 h-9"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={fetchEmails}>
                  <RefreshCw className={`h-4 w-4 ${emailLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {emailLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-navy" />
                </div>
              ) : emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Mail className="h-12 w-12 mb-2 opacity-50" />
                  <p>No emails in {currentFolder}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => {
                        setSelectedEmail(email)
                        if (!email.is_read) handleMarkAsRead(email.id, true)
                      }}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                      } ${!email.is_read ? 'bg-white font-semibold' : 'bg-gray-50/50'}`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStar(email.id, !email.is_starred) }}
                        >
                          <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`truncate text-sm ${!email.is_read ? 'text-navy' : 'text-gray-700'}`}>
                              {email.from_name || email.from_email}
                            </span>
                            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                              {formatEmailDate(email.received_at)}
                            </span>
                          </div>
                          <div className={`text-sm truncate ${!email.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {email.subject || '(No Subject)'}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {email.body_text?.substring(0, 80) || ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email View */}
          {selectedEmail && (
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleReply(selectedEmail)}>
                    <Reply className="h-4 w-4 mr-1" /> Reply
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleArchiveEmail([selectedEmail.id])}>
                    <Archive className="h-4 w-4 mr-1" /> Archive
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteEmail([selectedEmail.id])}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>

                <h2 className="text-xl font-semibold text-navy mb-3">
                  {selectedEmail.subject || '(No Subject)'}
                </h2>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-navy" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedEmail.from_name || selectedEmail.from_email}</span>
                      {selectedEmail.members && <Badge variant="outline" className="text-xs">Member</Badge>}
                    </div>
                    <div className="text-sm text-gray-600">{selectedEmail.from_email}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(selectedEmail.received_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {selectedEmail.body_html ? (
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                ) : (
                  <div className="whitespace-pre-wrap text-gray-700">{selectedEmail.body_text || 'No content'}</div>
                )}
              </div>

              <div className="p-4 border-t bg-gray-50">
                <Button onClick={() => handleReply(selectedEmail)} className="bg-navy hover:bg-navy/90">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply to this email
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ SMS TAB ============ */}
      {activeTab === 'sms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
          {/* SMS Conversations List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button size="sm" onClick={() => setSmsComposeOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={smsSearchQuery}
                    onChange={(e) => setSmsSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Button
                  variant={showSmsArchived ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setShowSmsArchived(!showSmsArchived)}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              {smsLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : smsConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {showSmsArchived ? 'No archived conversations' : 'No conversations yet'}
                </div>
              ) : (
                <div className="divide-y">
                  {smsConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedSmsConversation?.id === conv.id ? 'bg-blue-50' : ''
                      } ${conv.is_unread ? 'bg-blue-50/50' : ''}`}
                      onClick={() => {
                        setSelectedSmsConversation(conv)
                        fetchSmsMessages(conv.id)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                          {conv.member ? (
                            <span className="font-medium text-navy text-sm">
                              {conv.member.first_name[0]}{conv.member.last_name[0]}
                            </span>
                          ) : (
                            <Phone className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${conv.is_unread ? 'font-bold' : 'font-medium'}`}>
                              {conv.member
                                ? `${conv.member.first_name} ${conv.member.last_name}`
                                : formatPhone(conv.phone_number)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {conv.latestMessage && formatEmailDate(conv.latestMessage.created_at)}
                            </span>
                          </div>
                          {conv.latestMessage && (
                            <p className={`text-xs truncate mt-0.5 ${conv.is_unread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                              {conv.latestMessage.direction === 'outbound' && 'You: '}
                              {conv.latestMessage.body}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS Messages View */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedSmsConversation ? (
              <>
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center">
                        {selectedSmsConversation.member ? (
                          <span className="font-medium text-navy">
                            {selectedSmsConversation.member.first_name[0]}{selectedSmsConversation.member.last_name[0]}
                          </span>
                        ) : (
                          <Phone className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedSmsConversation.member
                            ? `${selectedSmsConversation.member.first_name} ${selectedSmsConversation.member.last_name}`
                            : formatPhone(selectedSmsConversation.phone_number)}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{formatPhone(selectedSmsConversation.phone_number)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedSmsConversation.member && (
                        <Link href={`/members/${selectedSmsConversation.member.id}`}>
                          <Button variant="outline" size="sm">
                            <User className="h-4 w-4 mr-1" />
                            Profile
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => archiveSmsConversation(selectedSmsConversation.id, !selectedSmsConversation.is_archived)}
                      >
                        {selectedSmsConversation.is_archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteSmsConversation(selectedSmsConversation.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4">
                  {smsMessagesLoading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : smsMessages.length === 0 ? (
                    <div className="text-center text-gray-500">No messages yet</div>
                  ) : (
                    <div className="space-y-3">
                      {smsMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            msg.direction === 'outbound' ? 'bg-navy text-white' : 'bg-gray-100'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${
                              msg.direction === 'outbound' ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              <span>{new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                              {msg.direction === 'outbound' && getSmsStatusIcon(msg.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={smsMessagesEndRef} />
                    </div>
                  )}
                </CardContent>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newSmsMessage}
                      onChange={(e) => setNewSmsMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendSmsReply()
                        }
                      }}
                    />
                    <Button onClick={handleSendSmsReply} disabled={smsSending || !newSmsMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{newSmsMessage.length}/160 characters</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view messages</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSmsComposeOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ============ INTERNAL MESSAGES TAB ============ */}
      {activeTab === 'messages' && (
        <div className="flex h-[calc(100vh-16rem)] overflow-hidden rounded-lg border bg-white">
          {/* Messages List */}
          <div className={`w-full md:w-96 border-r bg-gray-50 flex flex-col ${selectedMsgConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{msgStats.total} conversations</span>
                  {msgStats.unread > 0 && (
                    <Badge variant="destructive" className="px-2 py-0.5 text-xs">
                      {msgStats.unread} unread
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchMsgConversations}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="bg-navy hover:bg-navy/90" onClick={() => setIsNewMsgDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={msgSearchQuery}
                  onChange={(e) => setMsgSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex border-b bg-white">
              {['all', 'unread', 'starred'].map(tab => (
                <button
                  key={tab}
                  className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                    msgActiveFilter === tab ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setMsgActiveFilter(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'unread' && msgStats.unread > 0 && `(${msgStats.unread})`}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {msgLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-navy" />
                </div>
              ) : filteredMsgConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm mb-4">Start a conversation with a member</p>
                  <Button size="sm" onClick={() => setIsNewMsgDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>
              ) : (
                filteredMsgConversations.map((conv) => (
                  <div
                    key={conv.conversation_id}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedMsgConversation?.conversation_id === conv.conversation_id
                        ? 'bg-navy/5 border-l-4 border-l-navy'
                        : 'hover:bg-gray-100'
                    } ${conv.unread_count > 0 ? 'bg-blue-50/50' : ''}`}
                    onClick={() => setSelectedMsgConversation(conv)}
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
                          <span className="text-xs text-gray-500">{formatEmailDate(conv.last_message_at)}</span>
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
          <div className={`flex-1 flex flex-col bg-white ${selectedMsgConversation ? 'flex' : 'hidden md:flex'}`}>
            {selectedMsgConversation ? (
              <>
                <div className="border-b p-4 bg-white">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedMsgConversation(null)}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedMsgConversation.member?.profile_image_url} />
                      <AvatarFallback className="bg-navy text-white">
                        {selectedMsgConversation.member?.first_name?.[0]}{selectedMsgConversation.member?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-navy">
                          {selectedMsgConversation.member ? `${selectedMsgConversation.member.first_name} ${selectedMsgConversation.member.last_name}` : 'Unknown'}
                        </h2>
                        {selectedMsgConversation.member?.tier && (
                          <Badge variant="outline" className={getTierColor(selectedMsgConversation.member.tier)}>
                            {selectedMsgConversation.member.tier}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{selectedMsgConversation.member?.email}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreVertical className="h-5 w-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Star className="h-4 w-4 mr-2" />Star</DropdownMenuItem>
                        <DropdownMenuItem><Archive className="h-4 w-4 mr-2" />Archive</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {selectedMsgConversation.member && (
                          <Link href={`/members/${selectedMsgConversation.member.id}`}>
                            <DropdownMenuItem><User className="h-4 w-4 mr-2" />View Profile</DropdownMenuItem>
                          </Link>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Subject: {selectedMsgConversation.subject}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedMsgConversation.messages.map((msg) => (
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
                  <div ref={msgMessagesEndRef} />
                </div>

                <div className="border-t p-4 bg-gray-50">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <textarea
                        value={replyMsgMessage}
                        onChange={(e) => setReplyMsgMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-navy"
                        rows={2}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsgReply() }}}
                      />
                    </div>
                    <Button className="bg-navy hover:bg-navy/90 h-12 px-6" onClick={sendMsgReply} disabled={!replyMsgMessage.trim() || msgSending}>
                      {msgSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
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
                  <Button onClick={() => setIsNewMsgDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Compose Modal */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{replyingTo ? 'Reply' : 'Compose Email'}</DialogTitle>
            <DialogDescription>Send an email from info@tpcmin.com</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="compose-to">To</Label>
              <Input
                id="compose-to"
                type="email"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <Label htmlFor="compose-subject">Subject</Label>
              <Input
                id="compose-subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div>
              <Label htmlFor="compose-message">Message</Label>
              <Textarea
                id="compose-message"
                className="min-h-[200px]"
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
                placeholder="Write your message..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCompose(false); resetEmailCompose() }}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={emailSending} className="bg-navy hover:bg-navy/90">
              {emailSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS Compose Modal */}
      <Dialog open={smsComposeOpen} onOpenChange={setSmsComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New SMS Message</DialogTitle>
            <DialogDescription>Send a text message to any phone number</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                placeholder="(917) 555-1234"
                value={smsComposePhone}
                onChange={(e) => setSmsComposePhone(e.target.value)}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message..."
                value={smsComposeMessage}
                onChange={(e) => setSmsComposeMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">{smsComposeMessage.length}/160 characters</p>
            </div>
            <Button onClick={handleComposeSms} disabled={smsSending} className="w-full">
              {smsSending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Internal Message Dialog */}
      <Dialog open={isNewMsgDialogOpen} onOpenChange={setIsNewMsgDialogOpen}>
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
                value={newMsgSubject}
                onChange={(e) => setNewMsgSubject(e.target.value)}
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
                value={newMsgContent}
                onChange={(e) => setNewMsgContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewMsgDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-navy hover:bg-navy/90"
              onClick={sendNewMessage}
              disabled={!selectedMember || !newMsgContent.trim() || msgSending}
            >
              {msgSending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><Send className="h-4 w-4 mr-2" />Send Message</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

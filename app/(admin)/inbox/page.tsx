'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
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

export default function UnifiedInboxPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email')
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
  const [conversations, setConversations] = useState<SMSConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<SMSConversation | null>(null)
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([])
  const [smsLoading, setSmsLoading] = useState(true)
  const [smsMessagesLoading, setSmsMessagesLoading] = useState(false)
  const [smsSearchQuery, setSmsSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [newSmsMessage, setNewSmsMessage] = useState('')
  const [smsSending, setSmsSending] = useState(false)
  const [smsComposeOpen, setSmsComposeOpen] = useState(false)
  const [smsComposePhone, setSmsComposePhone] = useState('')
  const [smsComposeMessage, setSmsComposeMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      fetchConversations()
    }
  }, [showArchived, smsSearchQuery, activeTab])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [smsMessages])

  const fetchConversations = async () => {
    setSmsLoading(true)
    try {
      const params = new URLSearchParams({
        action: 'conversations',
        archived: showArchived.toString(),
      })
      if (smsSearchQuery) params.set('search', smsSearchQuery)

      const response = await fetch(`/api/admin/sms?${params}`)
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
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
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, is_unread: false } : c))
      )
    } catch (error) {
      console.error('Error fetching messages:', error)
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
    if (!newSmsMessage.trim() || !selectedConversation) return
    const success = await sendSms(selectedConversation.phone_number, newSmsMessage, selectedConversation.id)
    if (success) {
      setNewSmsMessage('')
      fetchSmsMessages(selectedConversation.id)
      fetchConversations()
    }
  }

  const handleComposeSms = async () => {
    if (!smsComposePhone.trim() || !smsComposeMessage.trim()) return
    const convId = await sendSms(smsComposePhone, smsComposeMessage)
    if (convId) {
      setSmsComposeOpen(false)
      setSmsComposePhone('')
      setSmsComposeMessage('')
      await fetchConversations()
    }
  }

  const archiveSmsConversation = async (id: string, archive = true) => {
    try {
      await fetch('/api/admin/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', conversationId: id, archived: archive }),
      })
      if (selectedConversation?.id === id) {
        setSelectedConversation(null)
        setSmsMessages([])
      }
      fetchConversations()
    } catch (error) {
      console.error('Error archiving conversation:', error)
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
      if (selectedConversation?.id === id) {
        setSelectedConversation(null)
        setSmsMessages([])
      }
      fetchConversations()
    } catch (error) {
      console.error('Error deleting conversation:', error)
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
      case 'delivered': return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'sent': return <Check className="h-3 w-3 text-gray-400" />
      case 'failed': return <span className="text-xs text-red-500">!</span>
      default: return null
    }
  }

  const emailFolders = [
    { name: 'inbox', label: 'Inbox', icon: Inbox, count: emailUnreadCount },
    { name: 'sent', label: 'Sent', icon: Send },
    { name: 'starred', label: 'Starred', icon: Star },
    { name: 'archive', label: 'Archive', icon: Archive },
    { name: 'trash', label: 'Trash', icon: Trash2 },
  ]

  const smsUnreadCount = conversations.filter(c => c.is_unread).length

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Inbox</h1>
          <p className="text-gray-600">Manage all communications in one place</p>
        </div>
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
          <MessageSquare className="h-4 w-4" />
          SMS
          {smsUnreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs ml-1">{smsUnreadCount}</Badge>
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
          {/* Conversations List */}
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
                  variant={showArchived ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setShowArchived(!showArchived)}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              {smsLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {showArchived ? 'No archived conversations' : 'No conversations yet'}
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                      } ${conv.is_unread ? 'bg-blue-50/50' : ''}`}
                      onClick={() => {
                        setSelectedConversation(conv)
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

          {/* Messages View */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center">
                        {selectedConversation.member ? (
                          <span className="font-medium text-navy">
                            {selectedConversation.member.first_name[0]}{selectedConversation.member.last_name[0]}
                          </span>
                        ) : (
                          <Phone className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedConversation.member
                            ? `${selectedConversation.member.first_name} ${selectedConversation.member.last_name}`
                            : formatPhone(selectedConversation.phone_number)}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{formatPhone(selectedConversation.phone_number)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedConversation.member && (
                        <Link href={`/members/${selectedConversation.member.id}`}>
                          <Button variant="outline" size="sm">
                            <User className="h-4 w-4 mr-1" />
                            Profile
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => archiveSmsConversation(selectedConversation.id, !selectedConversation.is_archived)}
                      >
                        {selectedConversation.is_archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteSmsConversation(selectedConversation.id)}
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
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  Mail,
  Phone,
  Send,
  Search,
  Loader2,
  Plus,
  RefreshCw,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Users,
  FileText,
  Zap,
  Target,
  Sparkles,
  Clock,
  CheckCircle2,
  Filter,
  ChevronRight,
  User,
  Building,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

// ============ INTERFACES ============
interface Contact {
  id: string
  type: 'member' | 'lead'
  first_name: string
  last_name: string
  email: string
  phone?: string
  tier?: string
  avatar_url?: string
  last_message_at: string
  unread_count: number
  last_message_preview: string
  last_message_channel: 'email' | 'sms' | 'internal'
}

interface Message {
  id: string
  channel: 'email' | 'sms' | 'internal'
  direction: 'inbound' | 'outbound'
  subject?: string
  content: string
  created_at: string
  is_read: boolean
}

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  sent_count: number
  open_count: number
  created_at: string
}

interface Template {
  id: string
  name: string
  category: string
  subject_template: string
}

interface Lead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  status: string
  interest_level: string
  source: string
  created_at: string
}

// ============ MAIN COMPONENT ============
export default function CommunicationsPage() {
  const searchParams = useSearchParams()
  const urlTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'conversations' | 'campaigns' | 'automations' | 'templates' | 'leads'>('conversations')
  const { toast } = useToast()

  // Handle URL tab parameter
  useEffect(() => {
    if (urlTab === 'campaigns' || urlTab === 'automations' || urlTab === 'templates' || urlTab === 'leads' || urlTab === 'conversations') {
      setActiveTab(urlTab)
    }
  }, [urlTab])

  // Stats
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    totalCampaigns: 0,
    totalLeads: 0,
  })

  // Conversations state
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'sms' | 'internal'>('all')

  // Compose state
  const [showCompose, setShowCompose] = useState(false)
  const [replyChannel, setReplyChannel] = useState<'email' | 'sms'>('email')
  const [replyMessage, setReplyMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(true)

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(true)
  const [leadFilter, setLeadFilter] = useState<'all' | 'new' | 'hot' | 'converted'>('all')

  useEffect(() => {
    fetchConversations()
    fetchCampaigns()
    fetchTemplates()
    fetchLeads()
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const supabase = createClient()
    try {
      // Get unread emails
      const { count: unreadEmails } = await supabase
        .from('inbox_emails')
        .select('*', { count: 'exact', head: true })
        .eq('folder', 'inbox')
        .eq('is_read', false)

      // Get unread SMS
      const { count: unreadSms } = await supabase
        .from('sms_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('is_unread', true)

      // Get campaigns count
      const { count: campaignCount } = await supabase
        .from('email_campaigns')
        .select('*', { count: 'exact', head: true })

      // Get leads count
      const { count: leadCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalConversations: (unreadEmails || 0) + (unreadSms || 0),
        unreadMessages: (unreadEmails || 0) + (unreadSms || 0),
        totalCampaigns: campaignCount || 0,
        totalLeads: leadCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchConversations = async () => {
    setConversationsLoading(true)
    const supabase = createClient()

    try {
      // Fetch members with recent email/sms activity
      const { data: members } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone, tier, avatar_url')
        .order('updated_at', { ascending: false })
        .limit(50)

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('id, first_name, last_name, email, phone, status')
        .order('created_at', { ascending: false })
        .limit(20)

      // Combine into contacts
      const memberContacts: Contact[] = (members || []).map(m => ({
        id: m.id,
        type: 'member' as const,
        first_name: m.first_name,
        last_name: m.last_name,
        email: m.email,
        phone: m.phone,
        tier: m.tier,
        avatar_url: m.avatar_url,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        last_message_preview: 'Click to view conversation',
        last_message_channel: 'email' as const,
      }))

      const leadContacts: Contact[] = (leadsData || []).map(l => ({
        id: l.id,
        type: 'lead' as const,
        first_name: l.first_name || 'New',
        last_name: l.last_name || 'Lead',
        email: l.email,
        phone: l.phone,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        last_message_preview: `Lead - ${l.status}`,
        last_message_channel: 'email' as const,
      }))

      setContacts([...memberContacts, ...leadContacts])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setConversationsLoading(false)
    }
  }

  const fetchMessagesForContact = async (contact: Contact) => {
    setMessagesLoading(true)
    setSelectedContact(contact)
    const supabase = createClient()

    try {
      const allMessages: Message[] = []

      // Fetch emails for this contact
      const { data: emails } = await supabase
        .from('inbox_emails')
        .select('*')
        .eq('from_email', contact.email)
        .order('received_at', { ascending: false })
        .limit(20)

      // Fetch sent emails to this contact
      const { data: sentEmails } = await supabase
        .from('sent_emails')
        .select('*')
        .eq('to_email', contact.email)
        .order('sent_at', { ascending: false })
        .limit(20)

      // Fetch SMS if phone exists
      if (contact.phone) {
        const { data: smsData } = await supabase
          .from('sms_messages')
          .select('*')
          .or(`from_number.eq.${contact.phone},to_number.eq.${contact.phone}`)
          .order('created_at', { ascending: false })
          .limit(20)

        if (smsData) {
          smsData.forEach(sms => {
            allMessages.push({
              id: sms.id,
              channel: 'sms',
              direction: sms.direction || 'inbound',
              content: sms.body || sms.message,
              created_at: sms.created_at,
              is_read: true,
            })
          })
        }
      }

      // Add emails
      if (emails) {
        emails.forEach(email => {
          allMessages.push({
            id: email.id,
            channel: 'email',
            direction: 'inbound',
            subject: email.subject,
            content: email.body_text || email.body_html || '',
            created_at: email.received_at,
            is_read: email.is_read,
          })
        })
      }

      if (sentEmails) {
        sentEmails.forEach(email => {
          allMessages.push({
            id: email.id,
            channel: 'email',
            direction: 'outbound',
            subject: email.subject,
            content: email.body_text || '',
            created_at: email.sent_at,
            is_read: true,
          })
        })
      }

      // Sort by date
      allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setMessages(allMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    setCampaignsLoading(true)
    try {
      const res = await fetch('/api/email/campaigns')
      const data = await res.json()
      if (data.success) {
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setCampaignsLoading(false)
    }
  }

  const fetchTemplates = async () => {
    setTemplatesLoading(true)
    try {
      const res = await fetch('/api/email/templates')
      const data = await res.json()
      if (data.success) {
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setTemplatesLoading(false)
    }
  }

  const fetchLeads = async () => {
    setLeadsLoading(true)
    const supabase = createClient()
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (leadFilter === 'new') {
        query = query.eq('status', 'new')
      } else if (leadFilter === 'hot') {
        query = query.eq('interest_level', 'hot')
      } else if (leadFilter === 'converted') {
        query = query.eq('status', 'converted')
      }

      const { data, error } = await query.limit(50)

      if (!error && data) {
        setLeads(data)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLeadsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeads()
    }
  }, [leadFilter])

  const handleSendReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return

    setSending(true)
    try {
      if (replyChannel === 'email') {
        const response = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: selectedContact.email,
            subject: `Message from TPC Ministries`,
            message: replyMessage,
          }),
        })
        const data = await response.json()
        if (data.success) {
          toast({ title: 'Sent!', description: 'Email sent successfully' })
          setReplyMessage('')
          fetchMessagesForContact(selectedContact)
        } else {
          throw new Error(data.error)
        }
      } else {
        if (!selectedContact.phone) {
          toast({ title: 'Error', description: 'No phone number for this contact', variant: 'destructive' })
          return
        }
        const response = await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: selectedContact.phone,
            message: replyMessage,
          }),
        })
        const data = await response.json()
        if (data.success) {
          toast({ title: 'Sent!', description: 'SMS sent successfully' })
          setReplyMessage('')
          fetchMessagesForContact(selectedContact)
        } else {
          throw new Error(data.error)
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
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

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchQuery === '' ||
      `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Communications</h1>
          <p className="text-gray-600">Manage all conversations, campaigns, and outreach</p>
        </div>
        <Button className="bg-navy hover:bg-navy/90" onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('conversations')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unreadMessages}</p>
                <p className="text-sm text-gray-500">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('campaigns')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
                <p className="text-sm text-gray-500">Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('automations')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-500">Automations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('leads')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
                <p className="text-sm text-gray-500">Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'conversations', label: 'Conversations', icon: MessageSquare },
          { key: 'campaigns', label: 'Campaigns', icon: Send },
          { key: 'automations', label: 'Automations', icon: Zap },
          { key: 'templates', label: 'Templates', icon: FileText },
          { key: 'leads', label: 'Leads', icon: Target },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.key
                ? 'bg-white shadow-sm text-navy font-medium'
                : 'text-gray-600 hover:text-navy'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Contact List */}
          <Card className="lg:col-span-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search contacts..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={fetchConversations}>
                  <RefreshCw className={`h-4 w-4 ${conversationsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="flex gap-1 mt-2">
                {['all', 'email', 'sms'].map(filter => (
                  <Button
                    key={filter}
                    variant={channelFilter === filter ? 'default' : 'ghost'}
                    size="sm"
                    className={channelFilter === filter ? 'bg-navy' : ''}
                    onClick={() => setChannelFilter(filter as any)}
                  >
                    {filter === 'all' ? 'All' : filter === 'email' ? 'Email' : 'SMS'}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {conversationsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-navy" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                  <p>No conversations found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredContacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => fetchMessagesForContact(contact)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedContact?.id === contact.id ? 'bg-blue-50 border-l-4 border-navy' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={contact.type === 'lead' ? 'bg-orange-100 text-orange-700' : 'bg-navy text-white'}>
                            {getInitials(contact.first_name, contact.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {contact.first_name} {contact.last_name}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDate(contact.last_message_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {contact.type === 'lead' && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 bg-orange-50 text-orange-700 border-orange-200">
                                Lead
                              </Badge>
                            )}
                            {contact.tier && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {contact.tier}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {contact.last_message_preview}
                          </p>
                        </div>
                        {contact.unread_count > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {contact.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            {selectedContact ? (
              <>
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-navy text-white">
                          {getInitials(selectedContact.first_name, selectedContact.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {selectedContact.first_name} {selectedContact.last_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          {selectedContact.email}
                          {selectedContact.phone && (
                            <>
                              <span className="text-gray-300">|</span>
                              <Phone className="h-3 w-3" />
                              {selectedContact.phone}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          Star Conversation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-navy" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start a conversation below</p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.direction === 'outbound'
                              ? 'bg-navy text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.channel === 'email' && <Mail className="h-3 w-3" />}
                            {message.channel === 'sms' && <Phone className="h-3 w-3" />}
                            <span className="text-xs opacity-75">
                              {message.channel.toUpperCase()}
                            </span>
                          </div>
                          {message.subject && (
                            <p className="font-medium text-sm mb-1">{message.subject}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-75 mt-2">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                {/* Reply Box */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500">Reply via:</span>
                    <Button
                      variant={replyChannel === 'email' ? 'default' : 'outline'}
                      size="sm"
                      className={replyChannel === 'email' ? 'bg-navy' : ''}
                      onClick={() => setReplyChannel('email')}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                    <Button
                      variant={replyChannel === 'sms' ? 'default' : 'outline'}
                      size="sm"
                      className={replyChannel === 'sms' ? 'bg-navy' : ''}
                      onClick={() => setReplyChannel('sms')}
                      disabled={!selectedContact.phone}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      SMS
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={`Type your ${replyChannel} message...`}
                      className="flex-1 min-h-[80px]"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <Button
                      className="bg-navy hover:bg-navy/90"
                      onClick={handleSendReply}
                      disabled={sending || !replyMessage.trim()}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-sm">Choose a contact from the list to view messages</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>Create and manage email campaigns</CardDescription>
            </div>
            <Button className="bg-navy hover:bg-navy/90" asChild>
              <a href="/email-campaigns">
                Open Campaign Manager
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No campaigns yet</p>
                <Button className="mt-4" asChild>
                  <a href="/email-campaigns">Create Your First Campaign</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.slice(0, 5).map(campaign => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign.subject}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={
                        campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        'bg-blue-100 text-blue-700'
                      }>
                        {campaign.status}
                      </Badge>
                      {campaign.status === 'sent' && (
                        <span className="text-sm text-gray-500">
                          {campaign.sent_count} sent
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Automations Tab */}
      {activeTab === 'automations' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Automations
            </CardTitle>
            <CardDescription>Automated communication sequences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Welcome Sequence */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Welcome Sequence</h3>
                      <p className="text-sm text-gray-500">Onboard new members with 4 touchpoints</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline">Day 0: Welcome Email</Badge>
                  <Badge variant="outline">Day 1: SMS</Badge>
                  <Badge variant="outline">Day 3: Follow-up</Badge>
                  <Badge variant="outline">Day 7: Newsletter</Badge>
                </div>
              </div>

              {/* Lead Nurturing */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Target className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Lead Nurturing</h3>
                      <p className="text-sm text-gray-500">Convert leads to members</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline">Immediate: Confirmation</Badge>
                  <Badge variant="outline">Day 2: About Us</Badge>
                  <Badge variant="outline">Day 5: Event Invite</Badge>
                </div>
              </div>

              {/* Re-engagement */}
              <div className="p-4 border rounded-lg opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Re-engagement</h3>
                      <p className="text-sm text-gray-500">Bring back inactive members</p>
                    </div>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create New Automation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Reusable templates for campaigns and messages</CardDescription>
            </div>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No templates available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-navy/10 rounded-lg text-navy">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-mono truncate">
                        {template.subject_template}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Leads
              </CardTitle>
              <CardDescription>Track and nurture potential members</CardDescription>
            </div>
            <Button className="bg-navy hover:bg-navy/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </CardHeader>
          <CardContent>
            {/* Lead Filters */}
            <div className="flex gap-2 mb-4">
              {['all', 'new', 'hot', 'converted'].map(filter => (
                <Button
                  key={filter}
                  variant={leadFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  className={leadFilter === filter ? 'bg-navy' : ''}
                  onClick={() => setLeadFilter(filter as any)}
                >
                  {filter === 'all' ? 'All' :
                   filter === 'new' ? 'New' :
                   filter === 'hot' ? '🔥 Hot' :
                   'Converted'}
                </Button>
              ))}
            </div>

            {leadsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No leads found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leads.map(lead => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-orange-100 text-orange-700">
                          {getInitials(lead.first_name || 'N', lead.last_name || 'L')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {lead.first_name} {lead.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={
                        lead.interest_level === 'hot' ? 'bg-red-100 text-red-700' :
                        lead.interest_level === 'warm' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {lead.interest_level === 'hot' ? '🔥 Hot' :
                         lead.interest_level === 'warm' ? '⭐ Warm' :
                         'Cold'}
                      </Badge>
                      <Badge variant="outline">{lead.source}</Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </span>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Message Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>Send a message to a member or lead</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Input placeholder="Search for a contact..." />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select defaultValue="email">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Email subject..." />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Write your message..." className="min-h-[150px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            <Button className="bg-navy hover:bg-navy/90">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

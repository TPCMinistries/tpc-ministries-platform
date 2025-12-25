'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Mail,
  Send,
  Plus,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Wand2,
  Copy,
  RotateCcw,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  RefreshCw,
  BookOpen,
  Scroll,
  GraduationCap,
  Megaphone,
  Zap,
  MessageSquare,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  send_type: string
  sent_count: number
  open_count: number
  click_count: number
  scheduled_at?: string
  sent_at?: string
  created_at: string
  email_templates?: {
    name: string
    category: string
  }
}

interface Template {
  id: string
  name: string
  slug: string
  description?: string
  category: string
  subject_template: string
}

interface SubscriptionStats {
  [key: string]: {
    subscribed: number
    unsubscribed: number
  }
}

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  tier: 'free' | 'partner' | 'covenant'
}

function EmailCampaignsContent() {
  const searchParams = useSearchParams()
  const urlTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'subscribers' | 'quicksend'>('campaigns')
  const { toast } = useToast()

  // Error state
  const [pageError, setPageError] = useState<string | null>(null)

  // Handle URL tab parameter
  useEffect(() => {
    if (urlTab === 'quicksend' || urlTab === 'templates' || urlTab === 'subscribers' || urlTab === 'campaigns') {
      setActiveTab(urlTab)
    }
  }, [urlTab])

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)

  // Subscription stats
  const [subStats, setSubStats] = useState<SubscriptionStats>({})
  const [statsLoading, setStatsLoading] = useState(true)

  // Quick Send state
  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [quickSendType, setQuickSendType] = useState<'email' | 'sms'>('email')
  const [quickSendSubmitting, setQuickSendSubmitting] = useState(false)
  const [quickEmailForm, setQuickEmailForm] = useState({
    recipientType: 'all' as 'all' | 'tier',
    recipientTier: 'free' as 'free' | 'partner' | 'covenant',
    subject: '',
    message: '',
  })
  const [quickSmsForm, setQuickSmsForm] = useState({
    recipientType: 'all' as 'all' | 'tier',
    recipientTier: 'free' as 'free' | 'partner' | 'covenant',
    message: '',
  })

  // Create campaign dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    template_id: '',
    subject: '',
    content: { body: '', ctaText: '', ctaUrl: '' },
    send_type: 'immediate',
    target_audience: { all: true } as any,
  })

  // AI Assistant state
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiField, setAiField] = useState<'subject' | 'body'>('subject')

  // Test email state
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [testCampaignId, setTestCampaignId] = useState('')

  // Send campaign state
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [sendingCampaign, setSendingCampaign] = useState(false)
  const [campaignToSend, setCampaignToSend] = useState<Campaign | null>(null)

  useEffect(() => {
    fetchCampaigns()
    fetchTemplates()
    fetchSubscriptionStats()
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setMembersLoading(true)
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone, tier')
        .order('first_name', { ascending: true })

      if (!error && data) {
        setMembers(data)
      } else {
        console.error('Error fetching members:', error)
        setMembers([])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      setMembers([])
    } finally {
      setMembersLoading(false)
    }
  }

  const getQuickRecipientCount = (type: 'all' | 'tier', tier?: string) => {
    if (type === 'all') {
      return quickSendType === 'sms'
        ? members.filter(m => m.phone).length
        : members.length
    } else if (type === 'tier' && tier) {
      return quickSendType === 'sms'
        ? members.filter(m => m.tier === tier && m.phone).length
        : members.filter(m => m.tier === tier).length
    }
    return 0
  }

  const handleQuickSendEmail = async () => {
    if (!quickEmailForm.subject || !quickEmailForm.message) {
      toast({ title: 'Error', description: 'Subject and message are required', variant: 'destructive' })
      return
    }

    setQuickSendSubmitting(true)
    try {
      let recipients: string[] = []
      if (quickEmailForm.recipientType === 'all') {
        recipients = members.map(m => m.email)
      } else {
        recipients = members.filter(m => m.tier === quickEmailForm.recipientTier).map(m => m.email)
      }

      if (recipients.length === 0) {
        toast({ title: 'No Recipients', description: 'No members match your criteria', variant: 'destructive' })
        setQuickSendSubmitting(false)
        return
      }

      const response = await fetch('/api/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipients,
          subject: quickEmailForm.subject,
          message: quickEmailForm.message,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sent!', description: `Email sent to ${recipients.length} recipients` })
        setQuickEmailForm({ recipientType: 'all', recipientTier: 'free', subject: '', message: '' })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send email', variant: 'destructive' })
    } finally {
      setQuickSendSubmitting(false)
    }
  }

  const handleQuickSendSms = async () => {
    if (!quickSmsForm.message) {
      toast({ title: 'Error', description: 'Message is required', variant: 'destructive' })
      return
    }

    setQuickSendSubmitting(true)
    try {
      let recipients: string[] = []
      if (quickSmsForm.recipientType === 'all') {
        recipients = members.filter(m => m.phone).map(m => m.phone!)
      } else {
        recipients = members.filter(m => m.tier === quickSmsForm.recipientTier && m.phone).map(m => m.phone!)
      }

      if (recipients.length === 0) {
        toast({ title: 'No Recipients', description: 'No members with phone numbers match your criteria', variant: 'destructive' })
        setQuickSendSubmitting(false)
        return
      }

      const response = await fetch('/api/sms/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phones: recipients,
          message: quickSmsForm.message,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: 'Sent!', description: `SMS sent to ${recipients.length} recipients` })
        setQuickSmsForm({ recipientType: 'all', recipientTier: 'free', message: '' })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send SMS', variant: 'destructive' })
    } finally {
      setQuickSendSubmitting(false)
    }
  }

  const fetchCampaigns = async () => {
    setCampaignsLoading(true)
    try {
      const res = await fetch('/api/email/campaigns')
      if (!res.ok) {
        console.error('Campaigns API error:', res.status)
        setCampaigns([])
        return
      }
      const data = await res.json()
      if (data.success) {
        setCampaigns(data.campaigns || [])
      } else {
        console.error('Campaigns error:', data.error)
        setCampaigns([])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setCampaigns([])
    } finally {
      setCampaignsLoading(false)
    }
  }

  const fetchTemplates = async () => {
    setTemplatesLoading(true)
    try {
      const res = await fetch('/api/email/templates')
      if (!res.ok) {
        console.error('Templates API error:', res.status)
        setTemplates([])
        return
      }
      const data = await res.json()
      if (data.success) {
        setTemplates(data.templates || [])
      } else {
        setTemplates([])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setTemplates([])
    } finally {
      setTemplatesLoading(false)
    }
  }

  const fetchSubscriptionStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/email/subscriptions?stats=true')
      if (!res.ok) {
        console.error('Subscriptions API error:', res.status)
        setSubStats({})
        return
      }
      const data = await res.json()
      if (data.success) {
        setSubStats(data.stats || {})
      } else {
        setSubStats({})
      }
    } catch (error) {
      console.error('Error fetching subscription stats:', error)
      setSubStats({})
    } finally {
      setStatsLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject) {
      toast({ title: 'Error', description: 'Name and subject are required', variant: 'destructive' })
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign),
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Campaign created!' })
        setIsCreateOpen(false)
        setNewCampaign({
          name: '',
          template_id: '',
          subject: '',
          content: { body: '', ctaText: '', ctaUrl: '' },
          send_type: 'immediate',
          target_audience: { all: true },
        })
        fetchCampaigns()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create campaign', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return

    try {
      const res = await fetch(`/api/email/campaigns?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Deleted', description: 'Campaign deleted' })
        fetchCampaigns()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete campaign', variant: 'destructive' })
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmail || !testCampaignId) return

    setSendingTest(true)
    try {
      const res = await fetch('/api/email/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: testCampaignId, testEmail }),
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: 'Sent!', description: `Test email sent to ${testEmail}` })
        setTestEmailDialogOpen(false)
        setTestEmail('')
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send test email', variant: 'destructive' })
    } finally {
      setSendingTest(false)
    }
  }

  const handleSendCampaign = async () => {
    if (!campaignToSend) return

    setSendingCampaign(true)
    try {
      const res = await fetch('/api/email/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaignToSend.id }),
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Campaign Sent!',
          description: `Sent to ${data.stats.sent} recipients (${data.stats.failed} failed)`
        })
        setSendDialogOpen(false)
        setCampaignToSend(null)
        fetchCampaigns()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send campaign', variant: 'destructive' })
    } finally {
      setSendingCampaign(false)
    }
  }

  const generateAiContent = async (field: 'subject' | 'body') => {
    setAiField(field)
    setAiGenerating(true)
    setAiSuggestions([])

    try {
      const res = await fetch('/api/email/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: field === 'subject' ? 'subject_line' : 'email_body',
          context: {
            contentTitle: newCampaign.name,
            contentType: templates.find(t => t.id === newCampaign.template_id)?.category || 'general',
          },
          tone: 'warm',
          count: field === 'subject' ? 3 : 1,
        }),
      })

      const data = await res.json()
      if (data.success) {
        if (field === 'subject' && data.options) {
          setAiSuggestions(data.options)
        } else if (data.content) {
          setAiSuggestions([data.content])
        }
      } else if (data.fallback) {
        setAiSuggestions([data.fallback])
      }
    } catch (error) {
      console.error('AI generation error:', error)
      toast({ title: 'AI Error', description: 'Failed to generate content', variant: 'destructive' })
    } finally {
      setAiGenerating(false)
    }
  }

  const useAiSuggestion = (suggestion: string) => {
    if (aiField === 'subject') {
      setNewCampaign(prev => ({ ...prev, subject: suggestion }))
    } else {
      setNewCampaign(prev => ({
        ...prev,
        content: { ...prev.content, body: suggestion }
      }))
    }
    setAiSuggestions([])
    setShowAiPanel(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Sent</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>
      case 'sending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Sending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700"><FileText className="h-3 w-3 mr-1" />Draft</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'devotional':
        return <BookOpen className="h-4 w-4" />
      case 'newsletter':
        return <Mail className="h-4 w-4" />
      case 'prophetic':
        return <Scroll className="h-4 w-4" />
      case 'teaching':
        return <GraduationCap className="h-4 w-4" />
      default:
        return <Megaphone className="h-4 w-4" />
    }
  }

  const subscriptionLabels: Record<string, string> = {
    daily_devotional: 'Daily Devotional',
    weekly_newsletter: 'Weekly Newsletter',
    prophetic_updates: 'Prophetic Updates',
    teaching_releases: 'Teaching Releases',
    announcements: 'Announcements',
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Email Campaigns</h1>
          <p className="text-gray-600">Create and manage email campaigns with AI assistance</p>
        </div>
        <Button className="bg-navy hover:bg-navy/90" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-navy/10 rounded-lg">
                <Mail className="h-5 w-5 text-navy" />
              </div>
              <div>
                <p className="text-2xl font-bold">{campaigns.length}</p>
                <p className="text-sm text-gray-500">Total Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'sent').length}</p>
                <p className="text-sm text-gray-500">Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'scheduled').length}</p>
                <p className="text-sm text-gray-500">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Object.values(subStats).reduce((sum, s) => sum + s.subscribed, 0)}
                </p>
                <p className="text-sm text-gray-500">Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'campaigns', label: 'Campaigns', icon: Mail },
          { key: 'quicksend', label: 'Quick Send', icon: Zap },
          { key: 'templates', label: 'Templates', icon: FileText },
          { key: 'subscribers', label: 'Subscribers', icon: Users },
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

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>Manage your email campaigns</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchCampaigns}>
              <RefreshCw className={`h-4 w-4 mr-2 ${campaignsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No campaigns yet</p>
                <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map(campaign => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-navy">{campaign.name}</h3>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <p className="text-sm text-gray-600">{campaign.subject}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {campaign.sent_at && (
                          <span>Sent: {formatDate(campaign.sent_at)}</span>
                        )}
                        {campaign.status === 'sent' && (
                          <>
                            <span>{campaign.sent_count} delivered</span>
                            <span>{campaign.open_count} opens</span>
                          </>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setTestCampaignId(campaign.id)
                          setTestEmailDialogOpen(true)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Send Test
                        </DropdownMenuItem>
                        {campaign.status === 'draft' && (
                          <DropdownMenuItem onClick={() => {
                            setCampaignToSend(campaign)
                            setSendDialogOpen(true)
                          }}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Send Tab */}
      {activeTab === 'quicksend' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-gold" />
              Quick Send
            </CardTitle>
            <CardDescription>Send a quick email or SMS to your members</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Type Toggle */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={quickSendType === 'email' ? 'default' : 'outline'}
                onClick={() => setQuickSendType('email')}
                className={quickSendType === 'email' ? 'bg-navy hover:bg-navy/90' : ''}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant={quickSendType === 'sms' ? 'default' : 'outline'}
                onClick={() => setQuickSendType('sms')}
                className={quickSendType === 'sms' ? 'bg-navy hover:bg-navy/90' : ''}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS
              </Button>
            </div>

            {/* Email Form */}
            {quickSendType === 'email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <Select
                    value={quickEmailForm.recipientType === 'all' ? 'all' : `tier-${quickEmailForm.recipientTier}`}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setQuickEmailForm(prev => ({ ...prev, recipientType: 'all' }))
                      } else {
                        const tier = value.replace('tier-', '') as 'free' | 'partner' | 'covenant'
                        setQuickEmailForm(prev => ({ ...prev, recipientType: 'tier', recipientTier: tier }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members ({members.length})</SelectItem>
                      <SelectItem value="tier-free">Free Members ({members.filter(m => m.tier === 'free').length})</SelectItem>
                      <SelectItem value="tier-partner">Partners ({members.filter(m => m.tier === 'partner').length})</SelectItem>
                      <SelectItem value="tier-covenant">Covenant ({members.filter(m => m.tier === 'covenant').length})</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {getQuickRecipientCount(quickEmailForm.recipientType, quickEmailForm.recipientTier)} recipients selected
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    placeholder="Email subject..."
                    value={quickEmailForm.subject}
                    onChange={(e) => setQuickEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea
                    placeholder="Write your message..."
                    className="min-h-[150px]"
                    value={quickEmailForm.message}
                    onChange={(e) => setQuickEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>

                <Button
                  className="w-full bg-navy hover:bg-navy/90"
                  onClick={handleQuickSendEmail}
                  disabled={quickSendSubmitting || !quickEmailForm.subject || !quickEmailForm.message}
                >
                  {quickSendSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Email to {getQuickRecipientCount(quickEmailForm.recipientType, quickEmailForm.recipientTier)} Recipients
                </Button>
              </div>
            )}

            {/* SMS Form */}
            {quickSendType === 'sms' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <Select
                    value={quickSmsForm.recipientType === 'all' ? 'all' : `tier-${quickSmsForm.recipientTier}`}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setQuickSmsForm(prev => ({ ...prev, recipientType: 'all' }))
                      } else {
                        const tier = value.replace('tier-', '') as 'free' | 'partner' | 'covenant'
                        setQuickSmsForm(prev => ({ ...prev, recipientType: 'tier', recipientTier: tier }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members with Phone ({members.filter(m => m.phone).length})</SelectItem>
                      <SelectItem value="tier-free">Free Members ({members.filter(m => m.tier === 'free' && m.phone).length})</SelectItem>
                      <SelectItem value="tier-partner">Partners ({members.filter(m => m.tier === 'partner' && m.phone).length})</SelectItem>
                      <SelectItem value="tier-covenant">Covenant ({members.filter(m => m.tier === 'covenant' && m.phone).length})</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {getQuickRecipientCount(quickSmsForm.recipientType, quickSmsForm.recipientTier)} recipients with phone numbers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea
                    placeholder="Write your SMS message..."
                    className="min-h-[100px]"
                    value={quickSmsForm.message}
                    onChange={(e) => setQuickSmsForm(prev => ({ ...prev, message: e.target.value }))}
                    maxLength={1600}
                  />
                  <p className="text-xs text-gray-500">
                    {quickSmsForm.message.length}/1600 characters
                    {quickSmsForm.message.length > 160 && ` (${Math.ceil(quickSmsForm.message.length / 160)} SMS parts)`}
                  </p>
                </div>

                <Button
                  className="w-full bg-navy hover:bg-navy/90"
                  onClick={handleQuickSendSms}
                  disabled={quickSendSubmitting || !quickSmsForm.message}
                >
                  {quickSendSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send SMS to {getQuickRecipientCount(quickSmsForm.recipientType, quickSmsForm.recipientTier)} Recipients
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Pre-built templates for different email types</CardDescription>
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
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-navy/10 rounded-lg text-navy">
                          {getCategoryIcon(template.category)}
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        Subject: {template.subject_template}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Stats</CardTitle>
            <CardDescription>Email subscription statistics by type</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : Object.keys(subStats).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No subscription data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(subStats).map(([type, stats]) => (
                  <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-navy/10 rounded-lg text-navy">
                        {getCategoryIcon(type.replace('_', '-'))}
                      </div>
                      <div>
                        <h3 className="font-medium">{subscriptionLabels[type] || type}</h3>
                        <p className="text-sm text-gray-500">
                          {stats.subscribed} subscribed, {stats.unsubscribed} unsubscribed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-navy">{stats.subscribed}</p>
                      <p className="text-xs text-gray-500">active</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-navy" />
              Create Campaign
            </DialogTitle>
            <DialogDescription>Create a new email campaign with AI assistance</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Campaign Name */}
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input
                placeholder="e.g., Weekly Newsletter - Dec 25"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Template</Label>
              <Select
                value={newCampaign.template_id}
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, template_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No template (custom)</SelectItem>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject with AI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Subject Line *</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAiContent('subject')}
                  disabled={aiGenerating}
                >
                  {aiGenerating && aiField === 'subject' ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  AI Suggest
                </Button>
              </div>
              <Input
                placeholder="Enter email subject..."
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
              />
              {aiSuggestions.length > 0 && aiField === 'subject' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-purple-900">AI Suggestions:</p>
                  {aiSuggestions.map((suggestion, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-white rounded cursor-pointer hover:bg-purple-100"
                      onClick={() => useAiSuggestion(suggestion)}
                    >
                      <span className="text-sm">{suggestion}</span>
                      <Copy className="h-4 w-4 text-purple-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Email Body with AI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Email Content</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAiContent('body')}
                  disabled={aiGenerating}
                >
                  {aiGenerating && aiField === 'body' ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="h-3 w-3 mr-1" />
                  )}
                  AI Write
                </Button>
              </div>
              <Textarea
                placeholder="Enter email content..."
                className="min-h-[150px]"
                value={newCampaign.content.body}
                onChange={(e) => setNewCampaign(prev => ({
                  ...prev,
                  content: { ...prev.content, body: e.target.value }
                }))}
              />
              {aiSuggestions.length > 0 && aiField === 'body' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-purple-900">AI Generated:</p>
                    <Button variant="ghost" size="sm" onClick={() => generateAiContent('body')}>
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiSuggestions[0]}</p>
                  <Button
                    size="sm"
                    className="mt-2 bg-purple-600 hover:bg-purple-700"
                    onClick={() => useAiSuggestion(aiSuggestions[0])}
                  >
                    Use This Content
                  </Button>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Button Text</Label>
                <Input
                  placeholder="e.g., Read More"
                  value={newCampaign.content.ctaText}
                  onChange={(e) => setNewCampaign(prev => ({
                    ...prev,
                    content: { ...prev.content, ctaText: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Button URL</Label>
                <Input
                  placeholder="https://tpcmin.org/..."
                  value={newCampaign.content.ctaUrl}
                  onChange={(e) => setNewCampaign(prev => ({
                    ...prev,
                    content: { ...prev.content, ctaUrl: e.target.value }
                  }))}
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={newCampaign.target_audience.all ? 'all' : 'tier'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setNewCampaign(prev => ({ ...prev, target_audience: { all: true } }))
                  } else {
                    setNewCampaign(prev => ({ ...prev, target_audience: { tier: ['partner', 'covenant'] } }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="tier">Partners & Covenant Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button className="bg-navy hover:bg-navy/90" onClick={handleCreateCampaign} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>Send a test email to preview the campaign</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestEmailDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendTestEmail} disabled={sendingTest || !testEmail}>
              {sendingTest ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Campaign Confirmation Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to send "{campaignToSend?.name}" to all recipients?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              This action cannot be undone. The email will be sent to all members matching your target audience.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>Cancel</Button>
            <Button className="bg-navy hover:bg-navy/90" onClick={handleSendCampaign} disabled={sendingCampaign}>
              {sendingCampaign ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Send Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function EmailCampaignsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    }>
      <EmailCampaignsContent />
    </Suspense>
  )
}

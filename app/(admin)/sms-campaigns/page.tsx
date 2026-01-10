'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MessageSquare,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Users,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SMSCampaign {
  id: string
  name: string
  message: string
  target_audience: string
  target_tier: string | null
  status: string
  scheduled_at: string | null
  sent_at: string | null
  sent_count: number
  failed_count: number
  created_at: string
}

interface SMSTemplate {
  id: string
  name: string
  category: string
  message: string
  variables: string[]
}

interface Counts {
  draft: number
  scheduled: number
  sending: number
  sent: number
  failed: number
  total: number
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  draft: { color: 'bg-gray-100 text-gray-700', icon: <Edit className="h-3.5 w-3.5" /> },
  scheduled: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3.5 w-3.5" /> },
  sending: { color: 'bg-yellow-100 text-yellow-700', icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  sent: { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  failed: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3.5 w-3.5" /> },
}

export default function SMSCampaignsPage() {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<SMSCampaign[]>([])
  const [templates, setTemplates] = useState<SMSTemplate[]>([])
  const [counts, setCounts] = useState<Counts>({ draft: 0, scheduled: 0, sending: 0, sent: 0, failed: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<SMSCampaign | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    target_audience: 'all',
    target_tier: '',
    scheduled_at: '',
  })

  useEffect(() => {
    fetchCampaigns()
    fetchTemplates()
  }, [statusFilter])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      const res = await fetch(`/api/admin/sms/campaigns?${params}`)
      const data = await res.json()
      setCampaigns(data.campaigns || [])
      setCounts(data.counts || { draft: 0, scheduled: 0, sending: 0, sent: 0, failed: 0, total: 0 })
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/sms/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.message.trim()) {
      toast({ title: 'Error', description: 'Name and message are required', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const method = editingCampaign ? 'PATCH' : 'POST'
      const body = editingCampaign
        ? { id: editingCampaign.id, ...formData }
        : formData

      const res = await fetch('/api/admin/sms/campaigns', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast({ title: 'Success', description: editingCampaign ? 'Campaign updated' : 'Campaign created' })
        setShowCreateDialog(false)
        setEditingCampaign(null)
        resetForm()
        fetchCampaigns()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save campaign', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign now?')) return

    setSending(campaignId)
    try {
      const res = await fetch('/api/admin/sms/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'Campaign Sent',
          description: `Sent ${data.sent} messages. ${data.failed > 0 ? `${data.failed} failed.` : ''}`,
        })
        fetchCampaigns()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send campaign', variant: 'destructive' })
    } finally {
      setSending(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return

    try {
      const res = await fetch(`/api/admin/sms/campaigns?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Deleted', description: 'Campaign deleted' })
        fetchCampaigns()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const openEdit = (campaign: SMSCampaign) => {
    setEditingCampaign(campaign)
    setFormData({
      name: campaign.name,
      message: campaign.message,
      target_audience: campaign.target_audience,
      target_tier: campaign.target_tier || '',
      scheduled_at: campaign.scheduled_at?.slice(0, 16) || '',
    })
    setShowCreateDialog(true)
  }

  const useTemplate = (template: SMSTemplate) => {
    setFormData(prev => ({ ...prev, message: template.message }))
    setShowTemplatesDialog(false)
  }

  const resetForm = () => {
    setFormData({ name: '', message: '', target_audience: 'all', target_tier: '', scheduled_at: '' })
    setEditingCampaign(null)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const charCount = formData.message.length
  const segments = Math.ceil(charCount / 160) || 1

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/communications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              SMS Campaigns
            </h1>
            <p className="text-gray-600 mt-1">Create and send SMS campaigns to your members</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={(open) => {
            setShowCreateDialog(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy/90">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create SMS Campaign'}</DialogTitle>
                <DialogDescription>
                  Create a new SMS campaign to send to your members.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Sunday Reminder"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">Message *</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTemplatesDialog(true)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Type your message... Use {{firstName}} for personalization"
                    rows={4}
                    maxLength={1600}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{charCount}/1600 characters</span>
                    <span>{segments} SMS segment{segments > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Target Audience</label>
                    <Select
                      value={formData.target_audience}
                      onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="subscribers">SMS Subscribers Only</SelectItem>
                        <SelectItem value="tier">Specific Tier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.target_audience === 'tier' && (
                    <div>
                      <label className="text-sm font-medium">Select Tier</label>
                      <Select
                        value={formData.target_tier}
                        onValueChange={(value) => setFormData({ ...formData, target_tier: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Schedule (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to save as draft</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingCampaign ? 'Update' : 'Create'} Campaign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Dialog */}
        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>SMS Templates</DialogTitle>
              <DialogDescription>Choose a template to start with</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => useTemplate(template)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{template.name}</span>
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.message}</p>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {Object.entries(counts).filter(([key]) => key !== 'total').map(([status, count]) => (
            <Card
              key={status}
              className={`cursor-pointer transition-all ${statusFilter === status ? 'ring-2 ring-navy' : ''}`}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {statusConfig[status]?.icon}
                  <div>
                    <div className="text-2xl font-bold text-navy">{count}</div>
                    <p className="text-sm text-gray-600 capitalize">{status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
              {statusFilter !== 'all' ? ` (${statusFilter})` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No SMS campaigns yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  Create your first campaign
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-navy">{campaign.name}</h3>
                        <Badge className={statusConfig[campaign.status]?.color || 'bg-gray-100'}>
                          <span className="flex items-center gap-1">
                            {statusConfig[campaign.status]?.icon}
                            {campaign.status}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                        {campaign.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {campaign.target_audience === 'tier'
                            ? campaign.target_tier
                            : campaign.target_audience}
                        </span>
                        {campaign.sent_at && (
                          <span>Sent: {formatDate(campaign.sent_at)}</span>
                        )}
                        {campaign.status === 'sent' && (
                          <span className="text-green-600">
                            {campaign.sent_count} delivered
                            {campaign.failed_count > 0 && `, ${campaign.failed_count} failed`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {campaign.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleSend(campaign.id)}
                          disabled={sending === campaign.id}
                        >
                          {sending === campaign.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Send className="h-4 w-4 mr-1" />
                          )}
                          Send Now
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {campaign.status === 'draft' && (
                            <DropdownMenuItem onClick={() => openEdit(campaign)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(campaign.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

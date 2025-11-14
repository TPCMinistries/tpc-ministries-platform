'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mail, MessageSquare, Send, Loader2, Clock, CheckCircle, Users, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { calculateSMSParts } from '@/lib/utils/phone'

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  tier: 'free' | 'partner' | 'covenant'
}

interface Communication {
  id: string
  type: 'email' | 'sms'
  recipient_type: 'all' | 'tier' | 'individual'
  recipient_tier?: string
  recipient_ids?: string[]
  subject?: string
  message: string
  sent_at: string
  sent_by: string
  recipient_count: number
}

export default function CommunicationsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [communications, setCommunications] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('email')
  const { toast } = useToast()

  // Email Form
  const [emailForm, setEmailForm] = useState({
    recipientType: 'all' as 'all' | 'tier' | 'individual',
    recipientTier: 'free' as 'free' | 'partner' | 'covenant',
    recipientIds: [] as string[],
    subject: '',
    message: '',
  })

  // SMS Form
  const [smsForm, setSmsForm] = useState({
    recipientType: 'all' as 'all' | 'tier' | 'individual',
    recipientTier: 'free' as 'free' | 'partner' | 'covenant',
    recipientIds: [] as string[],
    message: '',
  })

  useEffect(() => {
    fetchMembers()
    fetchCommunications()
  }, [])

  const fetchMembers = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone, tier')
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching members:', error)
      } else {
        setMembers(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunications = async () => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setCommunications(data)
      }
    } catch (error) {
      console.error('Error fetching communications:', error)
    }
  }

  const getRecipientCount = (type: 'all' | 'tier' | 'individual', tier?: string, ids?: string[]) => {
    if (type === 'all') {
      return members.length
    } else if (type === 'tier' && tier) {
      return members.filter(m => m.tier === tier).length
    } else if (type === 'individual' && ids) {
      return ids.length
    }
    return 0
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Get recipients based on selection
      let recipients: string[] = []
      if (emailForm.recipientType === 'all') {
        recipients = members.map(m => m.email)
      } else if (emailForm.recipientType === 'tier') {
        recipients = members.filter(m => m.tier === emailForm.recipientTier).map(m => m.email)
      } else if (emailForm.recipientType === 'individual') {
        recipients = members.filter(m => emailForm.recipientIds.includes(m.id)).map(m => m.email)
      }

      if (recipients.length === 0) {
        toast({
          title: 'No Recipients',
          description: 'Please select at least one recipient',
          variant: 'destructive',
        })
        setSubmitting(false)
        return
      }

      // Send email via API
      const response = await fetch('/api/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          subject: emailForm.subject,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">TPC Ministries</h1>
            </div>
            <div style="padding: 30px 20px;">
              ${emailForm.message.replace(/\n/g, '<br>')}
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
              <p style="margin: 0;">TPC Ministries | <a href="https://tpcmin.org" style="color: #c9a961;">tpcmin.org</a></p>
            </div>
          </div>`,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      toast({
        title: 'Email Sent!',
        description: `Successfully sent to ${result.sent || recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`,
      })

      // Reset form
      setEmailForm({
        recipientType: 'all',
        recipientTier: 'free',
        recipientIds: [],
        subject: '',
        message: '',
      })

      // Refresh history
      fetchCommunications()
    } catch (error: any) {
      console.error('Error sending email:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to send email',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Get recipients based on selection (only members with phone numbers)
      let recipients: string[] = []
      if (smsForm.recipientType === 'all') {
        recipients = members.filter(m => m.phone).map(m => m.phone!)
      } else if (smsForm.recipientType === 'tier') {
        recipients = members
          .filter(m => m.tier === smsForm.recipientTier && m.phone)
          .map(m => m.phone!)
      } else if (smsForm.recipientType === 'individual') {
        recipients = members
          .filter(m => smsForm.recipientIds.includes(m.id) && m.phone)
          .map(m => m.phone!)
      }

      if (recipients.length === 0) {
        toast({
          title: 'No Recipients',
          description: 'Please select at least one recipient with a phone number',
          variant: 'destructive',
        })
        setSubmitting(false)
        return
      }

      // Send SMS via API
      const response = await fetch('/api/sms/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          message: smsForm.message,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send SMS')
      }

      toast({
        title: 'SMS Sent!',
        description: `Successfully sent to ${result.sent || 0} of ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`,
      })

      // Reset form
      setSmsForm({
        recipientType: 'all',
        recipientTier: 'free',
        recipientIds: [],
        message: '',
      })

      // Refresh history
      fetchCommunications()
    } catch (error: any) {
      console.error('Error sending SMS:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to send SMS',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleRecipient = (memberId: string, isEmail: boolean) => {
    if (isEmail) {
      setEmailForm(prev => ({
        ...prev,
        recipientIds: prev.recipientIds.includes(memberId)
          ? prev.recipientIds.filter(id => id !== memberId)
          : [...prev.recipientIds, memberId]
      }))
    } else {
      setSmsForm(prev => ({
        ...prev,
        recipientIds: prev.recipientIds.includes(memberId)
          ? prev.recipientIds.filter(id => id !== memberId)
          : [...prev.recipientIds, memberId]
      }))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy mb-2">Communications</h1>
          <p className="text-gray-600">Send emails and SMS to members</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Emails Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {communications.filter(c => c.type === 'email').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">SMS Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {communications.filter(c => c.type === 'sms').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">
                {communications.filter(c => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return new Date(c.sent_at) >= weekAgo
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </TabsTrigger>
            <TabsTrigger value="sms">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send SMS
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Send Email Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-navy">Send Email</CardTitle>
                <CardDescription>
                  Send an email to all members, by tier, or to specific individuals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-6">
                  {/* Recipient Type */}
                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <Select
                      value={emailForm.recipientType}
                      onValueChange={(value: any) =>
                        setEmailForm({ ...emailForm, recipientType: value, recipientIds: [] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members ({members.length})</SelectItem>
                        <SelectItem value="tier">By Tier</SelectItem>
                        <SelectItem value="individual">Individual Members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tier Selection */}
                  {emailForm.recipientType === 'tier' && (
                    <div className="space-y-2">
                      <Label>Select Tier</Label>
                      <Select
                        value={emailForm.recipientTier}
                        onValueChange={(value: any) =>
                          setEmailForm({ ...emailForm, recipientTier: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">
                            Free ({members.filter(m => m.tier === 'free').length})
                          </SelectItem>
                          <SelectItem value="partner">
                            Partner ({members.filter(m => m.tier === 'partner').length})
                          </SelectItem>
                          <SelectItem value="covenant">
                            Covenant ({members.filter(m => m.tier === 'covenant').length})
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Individual Member Selection */}
                  {emailForm.recipientType === 'individual' && (
                    <div className="space-y-2">
                      <Label>Select Members ({emailForm.recipientIds.length} selected)</Label>
                      <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => toggleRecipient(member.id, true)}
                          >
                            <input
                              type="checkbox"
                              checked={emailForm.recipientIds.includes(member.id)}
                              onChange={() => {}}
                              className="rounded text-navy focus:ring-navy"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-navy">
                                {member.first_name} {member.last_name}
                              </div>
                              <div className="text-sm text-gray-600">{member.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject *</Label>
                    <Input
                      id="email-subject"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                      placeholder="Enter email subject..."
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="email-message">Message *</Label>
                    <textarea
                      id="email-message"
                      className="w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                      value={emailForm.message}
                      onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                      placeholder="Enter your email message..."
                      required
                    />
                  </div>

                  {/* Recipient Count Preview */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-blue-900">
                      <Users className="h-4 w-4" />
                      <span>
                        This email will be sent to{' '}
                        <strong>
                          {getRecipientCount(
                            emailForm.recipientType,
                            emailForm.recipientTier,
                            emailForm.recipientIds
                          )}
                        </strong>{' '}
                        recipient(s)
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-navy hover:bg-navy/90"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send SMS Tab */}
          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-navy">Send SMS</CardTitle>
                <CardDescription>
                  Send a text message to members (160 chars per SMS part, max 10 parts)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendSMS} className="space-y-6">
                  {/* Recipient Type */}
                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <Select
                      value={smsForm.recipientType}
                      onValueChange={(value: any) =>
                        setSmsForm({ ...smsForm, recipientType: value, recipientIds: [] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Members ({members.filter(m => m.phone).length} with phone)
                        </SelectItem>
                        <SelectItem value="tier">By Tier</SelectItem>
                        <SelectItem value="individual">Individual Members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tier Selection */}
                  {smsForm.recipientType === 'tier' && (
                    <div className="space-y-2">
                      <Label>Select Tier</Label>
                      <Select
                        value={smsForm.recipientTier}
                        onValueChange={(value: any) => setSmsForm({ ...smsForm, recipientTier: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">
                            Free ({members.filter(m => m.tier === 'free' && m.phone).length})
                          </SelectItem>
                          <SelectItem value="partner">
                            Partner ({members.filter(m => m.tier === 'partner' && m.phone).length})
                          </SelectItem>
                          <SelectItem value="covenant">
                            Covenant ({members.filter(m => m.tier === 'covenant' && m.phone).length})
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Individual Member Selection */}
                  {smsForm.recipientType === 'individual' && (
                    <div className="space-y-2">
                      <Label>Select Members ({smsForm.recipientIds.length} selected)</Label>
                      <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
                        {members.filter(m => m.phone).map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => toggleRecipient(member.id, false)}
                          >
                            <input
                              type="checkbox"
                              checked={smsForm.recipientIds.includes(member.id)}
                              onChange={() => {}}
                              className="rounded text-navy focus:ring-navy"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-navy">
                                {member.first_name} {member.last_name}
                              </div>
                              <div className="text-sm text-gray-600">{member.phone}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-message">Message *</Label>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {smsForm.message.length} characters
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            calculateSMSParts(smsForm.message) > 1 ? 'text-orange-600' : 'text-gray-600'
                          }`}
                        >
                          {calculateSMSParts(smsForm.message)} SMS part{calculateSMSParts(smsForm.message) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <textarea
                      id="sms-message"
                      className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                      value={smsForm.message}
                      onChange={(e) => setSmsForm({ ...smsForm, message: e.target.value })}
                      placeholder="Enter your SMS message..."
                      maxLength={1600}
                      required
                    />
                    {calculateSMSParts(smsForm.message) > 1 && (
                      <div className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>
                          This message will be sent as {calculateSMSParts(smsForm.message)} SMS parts.
                          {/[^\x00-\x7F]/.test(smsForm.message) && ' Contains unicode characters (emoji, accents) which reduce the limit to 70 chars per part.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recipient Count Preview */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-green-900">
                      <Users className="h-4 w-4" />
                      <span>
                        This SMS will be sent to{' '}
                        <strong>
                          {getRecipientCount(
                            smsForm.recipientType,
                            smsForm.recipientTier,
                            smsForm.recipientIds
                          )}
                        </strong>{' '}
                        recipient(s)
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-navy hover:bg-navy/90"
                    size="lg"
                    disabled={submitting || smsForm.message.length > 1600}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send SMS
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-navy">Communication History</CardTitle>
                <CardDescription>Past emails and SMS sent to members</CardDescription>
              </CardHeader>
              <CardContent>
                {communications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No communications sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {communications.map((comm) => (
                      <Card key={comm.id} className="border-l-4 border-l-navy">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {comm.type === 'email' ? (
                                  <Mail className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <MessageSquare className="h-4 w-4 text-green-600" />
                                )}
                                <span className="font-semibold text-navy">
                                  {comm.type === 'email' ? 'Email' : 'SMS'}
                                </span>
                                <span className="text-sm text-gray-600">
                                  • {formatDate(comm.sent_at)}
                                </span>
                              </div>
                              {comm.subject && (
                                <h4 className="font-medium text-navy mb-1">{comm.subject}</h4>
                              )}
                              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                                {comm.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {comm.recipient_count} recipient(s)
                                </span>
                                <span className="capitalize">
                                  {comm.recipient_type === 'tier'
                                    ? `${comm.recipient_tier} tier`
                                    : comm.recipient_type}
                                </span>
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  Sent
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

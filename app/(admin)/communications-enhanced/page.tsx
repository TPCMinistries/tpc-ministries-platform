'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Loader2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { EmailComposer } from '@/components/email-composer'

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  tier: 'free' | 'partner' | 'covenant'
}

interface Communication {
  id: string
  type: string
  subject?: string
  message: string
  sent_at: string
  recipient_count: number
  recipient_type: string
  recipient_tier?: string
}

export default function CommunicationsEnhancedPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [communications, setCommunications] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('compose')

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
        .select('id, first_name, last_name, email, tier')
        .order('first_name', { ascending: true })

      if (!error && data) {
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
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

  const handleSendEmail = async (emailData: any) => {
    const response = await fetch('/api/email/send-templated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email')
    }

    alert(`✅ Email sent successfully to ${result.sent} recipient(s)!`)
    fetchCommunications()
  }

  const handleTestEmail = async (emailData: any) => {
    const response = await fetch('/api/email/send-templated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...emailData, testEmail: true }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send test email')
    }

    alert('✅ Test email sent to your inbox!')
  }

  const handlePreview = (emailData: any) => {
    // For now, just show an alert. In production, you'd open a modal with preview
    alert(`Preview:\n\nTemplate: ${emailData.template}\nSubject: ${emailData.subject}\nTitle: ${emailData.title}\n\nMessage:\n${emailData.message}`)
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
          <h1 className="text-4xl font-bold text-navy mb-2">📧 Email Communications</h1>
          <p className="text-gray-600">
            Send beautiful, branded emails with templates, personalization, and preview
          </p>
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
              <CardTitle className="text-sm font-medium text-gray-600">Free Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {members.filter(m => m.tier === 'free').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Partner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {members.filter(m => m.tier === 'partner').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Covenant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">
                {members.filter(m => m.tier === 'covenant').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose">
              <Mail className="mr-2 h-4 w-4" />
              Compose Email
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="mr-2 h-4 w-4" />
              History ({communications.length})
            </TabsTrigger>
          </TabsList>

          {/* Compose Tab */}
          <TabsContent value="compose">
            <EmailComposer
              members={members}
              onSend={handleSendEmail}
              onPreview={handlePreview}
              onTestEmail={handleTestEmail}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-navy">Communication History</CardTitle>
                <CardDescription>Past emails sent to members</CardDescription>
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
                                <Mail className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-navy">Email</span>
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
                                <span>
                                  👥 {comm.recipient_count} recipient(s)
                                </span>
                                <span className="capitalize">
                                  {comm.recipient_type === 'tier'
                                    ? `${comm.recipient_tier} tier`
                                    : comm.recipient_type}
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

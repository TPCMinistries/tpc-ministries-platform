'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Send, TestTube, Loader2, Info } from 'lucide-react'

export type EmailTemplate =
  | 'custom'
  | 'announcement'
  | 'newsletter'
  | 'event'
  | 'urgent'

interface EmailComposerProps {
  members: Array<{
    id: string
    first_name: string
    last_name: string
    email: string
    tier: string
  }>
  onSend: (data: any) => Promise<void>
  onPreview: (data: any) => void
  onTestEmail: (data: any) => Promise<void>
}

export function EmailComposer({ members, onSend, onPreview, onTestEmail }: EmailComposerProps) {
  const [template, setTemplate] = useState<EmailTemplate>('custom')
  const [submitting, setSubmitting] = useState(false)
  const [testingSending, setTestSending] = useState(false)

  // Common fields
  const [recipientType, setRecipientType] = useState<'all' | 'tier' | 'individual'>('all')
  const [recipientTier, setRecipientTier] = useState<'free' | 'partner' | 'covenant'>('free')
  const [recipientIds, setRecipientIds] = useState<string[]>([])
  const [subject, setSubject] = useState('')

  // Template-specific fields
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // Event fields
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventLocation, setEventLocation] = useState('')

  // Urgent fields
  const [urgencyLevel, setUrgencyLevel] = useState<'high' | 'medium' | 'low'>('high')

  const getRecipientCount = () => {
    if (recipientType === 'all') return members.length
    if (recipientType === 'tier') return members.filter(m => m.tier === recipientTier).length
    if (recipientType === 'individual') return recipientIds.length
    return 0
  }

  const toggleRecipient = (memberId: string) => {
    setRecipientIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const getEmailData = () => {
    return {
      template,
      recipientType,
      recipientTier,
      recipientIds,
      subject,
      title,
      message,
      ctaText,
      ctaUrl,
      imageUrl,
      eventDate,
      eventTime,
      eventLocation,
      urgencyLevel,
    }
  }

  const handleSend = async () => {
    setSubmitting(true)
    try {
      await onSend(getEmailData())
      // Reset form
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  const handleTestEmail = async () => {
    setTestSending(true)
    try {
      await onTestEmail(getEmailData())
    } finally {
      setTestSending(false)
    }
  }

  const handlePreview = () => {
    onPreview(getEmailData())
  }

  const resetForm = () => {
    setSubject('')
    setTitle('')
    setMessage('')
    setCtaText('')
    setCtaUrl('')
    setImageUrl('')
    setEventDate('')
    setEventTime('')
    setEventLocation('')
    setRecipientIds([])
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="border-2 border-tpc-gold">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Email Template</Label>
              <Select value={template} onValueChange={(v: EmailTemplate) => setTemplate(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">✏️ Custom Email</SelectItem>
                  <SelectItem value="announcement">📢 Announcement</SelectItem>
                  <SelectItem value="newsletter">📰 Newsletter</SelectItem>
                  <SelectItem value="event">🎉 Event Invitation</SelectItem>
                  <SelectItem value="urgent">⚠️ Urgent Message</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600 mt-1">
                {template === 'custom' && 'Send a simple email with custom formatting'}
                {template === 'announcement' && 'Professional announcement with branding and call-to-action'}
                {template === 'newsletter' && 'Multi-section newsletter with quick links'}
                {template === 'event' && 'Event invitation with date, time, and RSVP'}
                {template === 'urgent' && 'High-priority message with urgency indicators'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Label>Recipients</Label>
            <Select value={recipientType} onValueChange={(v: any) => {
              setRecipientType(v)
              setRecipientIds([])
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members ({members.length})</SelectItem>
                <SelectItem value="tier">By Tier</SelectItem>
                <SelectItem value="individual">Individual Members</SelectItem>
              </SelectContent>
            </Select>

            {recipientType === 'tier' && (
              <Select value={recipientTier} onValueChange={(v: any) => setRecipientTier(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free ({members.filter(m => m.tier === 'free').length})</SelectItem>
                  <SelectItem value="partner">Partner ({members.filter(m => m.tier === 'partner').length})</SelectItem>
                  <SelectItem value="covenant">Covenant ({members.filter(m => m.tier === 'covenant').length})</SelectItem>
                </SelectContent>
              </Select>
            )}

            {recipientType === 'individual' && (
              <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => toggleRecipient(member.id)}
                  >
                    <input
                      type="checkbox"
                      checked={recipientIds.includes(member.id)}
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
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-900">
                <Info className="h-4 w-4" />
                <span>
                  Will send to <strong>{getRecipientCount()}</strong> recipient(s)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Content - Dynamic based on template */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                required
              />
            </div>

            <div>
              <Label htmlFor="title">
                {template === 'event' ? 'Event Title' : template === 'newsletter' ? 'Headline' : 'Title'} *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={template === 'event' ? 'Sunday Service' : 'Enter title...'}
                required
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <textarea
                id="message"
                className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message... Use {{firstName}} or {{lastName}} for personalization"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                💡 Tip: Use <code>{'{{firstName}}'}</code> or <code>{'{{lastName}}'}</code> to personalize emails
              </p>
            </div>

            {/* Event-specific fields */}
            {template === 'event' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Event Date *</Label>
                    <Input
                      id="eventDate"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="Sunday, December 15, 2024"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">Event Time *</Label>
                    <Input
                      id="eventTime"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="10:00 AM - 12:00 PM EST"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="eventLocation">Event Location *</Label>
                  <Input
                    id="eventLocation"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="123 Church St, City, State"
                    required
                  />
                </div>
              </>
            )}

            {/* Urgent-specific fields */}
            {template === 'urgent' && (
              <div>
                <Label>Urgency Level</Label>
                <Select value={urgencyLevel} onValueChange={(v: any) => setUrgencyLevel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High - Immediate Attention</SelectItem>
                    <SelectItem value="medium">🟠 Medium - Action Needed</SelectItem>
                    <SelectItem value="low">🟡 Low - Important Notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Call to Action (for announcement/event) */}
            {(template === 'announcement' || template === 'event') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText">{template === 'event' ? 'RSVP Button Text' : 'Button Text'}</Label>
                  <Input
                    id="ctaText"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder={template === 'event' ? 'RSVP Now' : 'Learn More'}
                  />
                </div>
                <div>
                  <Label htmlFor="ctaUrl">Button URL</Label>
                  <Input
                    id="ctaUrl"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://tpcmin.org/..."
                  />
                </div>
              </div>
            )}

            {/* Image URL (for announcement/event) */}
            {(template === 'announcement' || template === 'event') && (
              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handlePreview}
          variant="outline"
          className="flex-1"
          disabled={!subject || !title || !message}
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview Email
        </Button>
        <Button
          onClick={handleTestEmail}
          variant="outline"
          className="flex-1"
          disabled={!subject || !title || !message || testSending}
        >
          {testSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Test...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              Send Test Email
            </>
          )}
        </Button>
        <Button
          onClick={handleSend}
          className="flex-1 bg-navy hover:bg-navy/90"
          disabled={!subject || !title || !message || submitting || getRecipientCount() === 0}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending to {getRecipientCount()}...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send to {getRecipientCount()} Recipients
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

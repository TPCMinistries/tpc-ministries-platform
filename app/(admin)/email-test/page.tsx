'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Loader2, Check, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const sendTestEmail = async (type: string) => {
    if (!testEmail || !testEmail.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }

    setLoading(type)

    try {
      let endpoint = ''
      let body: any = {}

      switch (type) {
        case 'welcome':
          endpoint = '/api/email/send-welcome'
          body = {
            memberName: 'Test User',
            email: testEmail,
            loginUrl: 'https://tpcmin.org/login',
            temporaryPassword: 'TempPass123!',
          }
          break

        case 'donation':
          endpoint = '/api/email/send-donation-receipt'
          body = {
            donorName: 'Test Donor',
            email: testEmail,
            amount: 10000, // $100.00
            date: new Date().toLocaleDateString(),
            donationType: 'One-Time Donation',
            transactionId: 'test_' + Date.now(),
            isRecurring: false,
          }
          break

        case 'lead':
          endpoint = '/api/email/send-lead-confirmation'
          body = {
            name: 'Test Lead',
            email: testEmail,
            interests: ['teachings', 'prayer', 'missions'],
          }
          break

        case 'prophecy':
          endpoint = '/api/email/send-prophecy-notification'
          body = {
            memberName: 'Test Member',
            email: testEmail,
            prophecyTitle: 'A Word of Encouragement',
            viewUrl: 'https://tpcmin.org/member/prophecy',
          }
          break

        case 'password':
          endpoint = '/api/email/send-password-reset'
          body = {
            memberName: 'Test User',
            email: testEmail,
            resetUrl: 'https://tpcmin.org/reset-password?token=test123',
            expiresIn: '1 hour',
          }
          break

        default:
          throw new Error('Unknown email type')
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      toast({
        title: 'Email Sent!',
        description: `Test ${type} email sent to ${testEmail}`,
      })
    } catch (error: any) {
      console.error('Test email error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test email',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const emailTypes = [
    {
      id: 'welcome',
      title: 'Welcome Email',
      description: 'Sent when a new member signs up or is converted from a lead',
      icon: '👋',
    },
    {
      id: 'donation',
      title: 'Donation Receipt',
      description: 'Sent after a successful donation with receipt details',
      icon: '💝',
    },
    {
      id: 'lead',
      title: 'Lead Confirmation',
      description: 'Sent when someone submits the homepage contact form',
      icon: '✅',
    },
    {
      id: 'prophecy',
      title: 'Prophecy Notification',
      description: 'Sent when a personal prophecy is assigned to a member',
      icon: '✨',
    },
    {
      id: 'password',
      title: 'Password Reset',
      description: 'Sent when a user requests to reset their password',
      icon: '🔒',
    },
  ]

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-8 w-8 text-gold" />
            <h1 className="text-4xl font-bold text-navy">Email Testing</h1>
          </div>
          <p className="text-gray-600">Test email templates to see how they look</p>
        </div>

        {/* Email Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-navy">Test Email Address</CardTitle>
            <CardDescription>
              Enter your email address to receive test emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Types */}
        <div className="grid gap-6 md:grid-cols-2">
          {emailTypes.map((emailType) => (
            <Card key={emailType.id}>
              <CardHeader>
                <CardTitle className="text-navy flex items-center gap-2">
                  <span className="text-2xl">{emailType.icon}</span>
                  {emailType.title}
                </CardTitle>
                <CardDescription>{emailType.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => sendTestEmail(emailType.id)}
                  disabled={loading === emailType.id || !testEmail}
                  className="w-full bg-gold hover:bg-gold/90 text-navy"
                >
                  {loading === emailType.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-navy flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-gold" />
              Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>1.</strong> Enter your email address in the field above
              </p>
              <p>
                <strong>2.</strong> Click any "Send Test Email" button to send that email template
              </p>
              <p>
                <strong>3.</strong> Check your inbox (and spam folder) for the test email
              </p>
              <p>
                <strong>4.</strong> Verify the email looks good on desktop and mobile
              </p>
              <p className="text-gold font-medium mt-4">
                💡 Tip: Use your personal email or a test email address. These are real emails
                sent via Resend!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

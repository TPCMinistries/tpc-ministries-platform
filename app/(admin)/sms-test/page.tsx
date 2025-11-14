'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MessageSquare, Loader2, Check, AlertCircle, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { calculateSMSParts } from '@/lib/utils/phone'

export default function SMSTestPage() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const charCount = message.length
  const smsParts = calculateSMSParts(message)
  const hasUnicode = /[^\x00-\x7F]/.test(message)
  const charsPerPart = hasUnicode ? 70 : 160

  const sendTestSMS = async () => {
    if (!phone || !message) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both phone number and message',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS')
      }

      setResult({
        success: true,
        sid: data.data?.sid,
        status: data.data?.status,
        to: data.data?.to,
      })

      toast({
        title: 'SMS Sent!',
        description: `Test message sent to ${phone}`,
      })
    } catch (error: any) {
      console.error('Test SMS error:', error)
      setResult({
        success: false,
        error: error.message,
      })

      toast({
        title: 'Error',
        description: error.message || 'Failed to send test SMS',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-8 w-8 text-gold" />
            <h1 className="text-4xl font-bold text-navy">Test SMS Messaging</h1>
          </div>
          <p className="text-gray-600">Send a test SMS to verify Twilio integration</p>
        </div>

        {/* Trial Account Warning */}
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800 font-semibold">Trial Account Limitation</AlertTitle>
          <AlertDescription className="text-yellow-700">
            SMS can only be sent to <strong>verified phone numbers</strong>. To verify your number:
            <br />
            1. Go to{' '}
            <a
              href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              Twilio Console → Verified Caller IDs
            </a>
            <br />
            2. Click "Add a new Caller ID" and verify your phone number
            <br />
            3. Complete A2P 10DLC registration to send to all members
          </AlertDescription>
        </Alert>

        {/* Test Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-navy">Send Test SMS</CardTitle>
            <CardDescription>Enter phone number and message to test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Phone Number */}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+19177465358"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                E.164 format: +1234567890 (country code + number)
              </p>
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your test message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {charCount} characters
                  {hasUnicode && ' (contains unicode)'}
                </p>
                <p
                  className={`text-xs font-medium ${
                    smsParts > 1 ? 'text-orange-600' : 'text-gray-500'
                  }`}
                >
                  {smsParts} SMS part{smsParts !== 1 ? 's' : ''}
                </p>
              </div>
              {smsParts > 1 && (
                <Alert className="mt-2 bg-orange-50 border-orange-200">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700 text-xs">
                    Message exceeds {charsPerPart} characters and will be sent as {smsParts} SMS
                    parts
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Send Button */}
            <Button
              onClick={sendTestSMS}
              disabled={loading || !phone || !message}
              className="w-full bg-gold hover:bg-gold/90 text-navy"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Test SMS
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card
            className={`${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}
              >
                {result.success ? (
                  <>
                    <Check className="h-5 w-5" />
                    SMS Sent Successfully!
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    Failed to Send SMS
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium text-navy">{result.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-navy">{result.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Message SID:</span>
                    <span className="font-mono text-xs text-navy">{result.sid}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">
                    Check your phone for the test message. It should arrive within a few seconds.
                  </p>
                </div>
              ) : (
                <div className="text-sm">
                  <p className="text-red-700 font-medium mb-2">Error:</p>
                  <p className="text-red-600">{result.error}</p>
                  {result.error.includes('verified') && (
                    <p className="text-red-600 mt-2 text-xs">
                      Make sure this phone number is verified in your Twilio account.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-navy flex items-center gap-2">
              <Info className="h-5 w-5 text-gold" />
              Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>1.</strong> Enter your phone number in E.164 format (+19177465358)
              </p>
              <p>
                <strong>2.</strong> Type a test message (160 characters = 1 SMS part)
              </p>
              <p>
                <strong>3.</strong> Click "Send Test SMS"
              </p>
              <p>
                <strong>4.</strong> Check your phone for the message
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-yellow-800 text-xs font-medium">
                  ⚠️ <strong>Trial Account:</strong> You can only send SMS to verified phone
                  numbers. Complete A2P 10DLC registration in Twilio to send to any number.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

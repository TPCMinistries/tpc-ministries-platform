'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Send, Mail, Loader2 } from 'lucide-react'

export function NewsletterSignupForms() {
  const [prophecyEmail, setProphecyEmail] = useState('')
  const [prophecyLoading, setProphecyLoading] = useState(false)
  const [prophecyMessage, setProphecyMessage] = useState('')

  const [devotionalEmail, setDevotionalEmail] = useState('')
  const [devotionalLoading, setDevotionalLoading] = useState(false)
  const [devotionalMessage, setDevotionalMessage] = useState('')

  const handleProphecySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProphecyLoading(true)
    setProphecyMessage('')

    try {
      const response = await fetch('/api/email/send-lead-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Subscriber',
          email: prophecyEmail,
          interests: ['Prophetic Words'],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setProphecyMessage('✅ Subscribed! Check your email for confirmation.')
        setProphecyEmail('')
      } else {
        setProphecyMessage('❌ ' + (data.error || 'Something went wrong. Please try again.'))
      }
    } catch (error) {
      setProphecyMessage('❌ Network error. Please check your connection and try again.')
    } finally {
      setProphecyLoading(false)
    }
  }

  const handleDevotionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDevotionalLoading(true)
    setDevotionalMessage('')

    try {
      const response = await fetch('/api/email/send-lead-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Subscriber',
          email: devotionalEmail,
          interests: ['Daily Devotionals'],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setDevotionalMessage('✅ Subscribed! Check your email for confirmation.')
        setDevotionalEmail('')
      } else {
        setDevotionalMessage('❌ ' + (data.error || 'Something went wrong. Please try again.'))
      }
    } catch (error) {
      setDevotionalMessage('❌ Network error. Please check your connection and try again.')
    } finally {
      setDevotionalLoading(false)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Request a Word */}
      <Card className="border-2 border-tpc-gold">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-tpc-navy">
            Request a Word
          </CardTitle>
          <CardDescription className="text-base">
            Subscribe to receive personalized prophetic words and guidance for your spiritual journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProphecySubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="border-tpc-navy/30"
              value={prophecyEmail}
              onChange={(e) => setProphecyEmail(e.target.value)}
              required
              disabled={prophecyLoading}
            />
            <Button
              type="submit"
              className="w-full bg-tpc-navy text-white hover:bg-tpc-navy/90"
              disabled={prophecyLoading}
            >
              {prophecyLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe for Words
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            {prophecyMessage && (
              <p className="text-sm text-center font-medium">{prophecyMessage}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Daily Devotionals */}
      <Card className="border-2 border-tpc-gold-accent">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-tpc-navy">
            Daily Devotionals
          </CardTitle>
          <CardDescription className="text-base">
            Get powerful daily devotionals to strengthen your faith and guide your walk with Christ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDevotionalSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="border-tpc-navy/30"
              value={devotionalEmail}
              onChange={(e) => setDevotionalEmail(e.target.value)}
              required
              disabled={devotionalLoading}
            />
            <Button
              type="submit"
              className="w-full bg-tpc-gold-accent text-white hover:bg-tpc-gold-accent/90"
              disabled={devotionalLoading}
            >
              {devotionalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  Get Daily Devotionals
                  <Mail className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            {devotionalMessage && (
              <p className="text-sm text-center font-medium">{devotionalMessage}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  MapPin,
  Send,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
          <div className="relative w-full max-w-md px-4">
            <div className="rounded-3xl border border-border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mb-2 font-display text-display-xs text-navy dark:text-white">Message Sent!</h2>
              <p className="mb-6 text-body-md text-muted-foreground">
                Thank you for reaching out. We&apos;ll get back to you within 24-48 hours.
              </p>
              <Button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    category: 'general',
                    message: ''
                  })
                }}
                variant="glow"
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Reach Out
          </p>
          <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
            Contact Us
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            We&apos;d love to hear from you. Reach out with questions, prayer requests, or just to say hello.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Contact Section */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
                  Info
                </p>
                <h2 className="mb-6 font-display text-display-sm text-navy dark:text-white">Get In Touch</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-navy/10 dark:bg-navy/30">
                      <Mail className="h-5 w-5 text-navy dark:text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display text-body-lg font-semibold text-navy dark:text-white">Email</h3>
                      <a href="mailto:info@tpcmin.org" className="text-body-md text-muted-foreground hover:text-gold">
                        info@tpcmin.org
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-navy/10 dark:bg-navy/30">
                      <MapPin className="h-5 w-5 text-navy dark:text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display text-body-lg font-semibold text-navy dark:text-white">Location</h3>
                      <p className="text-body-md text-muted-foreground">
                        Global Ministry<br />
                        Kenya &bull; South Africa &bull; Grenada
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="mb-4 font-display text-body-lg font-semibold text-navy dark:text-white">Follow Us @tpcmin</h3>
                <div className="flex gap-3">
                  {[
                    { href: 'https://facebook.com/tpcmin', icon: Facebook, label: 'Facebook' },
                    { href: 'https://twitter.com/tpcmin', icon: Twitter, label: 'Twitter' },
                    { href: 'https://instagram.com/tpcmin', icon: Instagram, label: 'Instagram' },
                    { href: 'https://youtube.com/@tpcmin', icon: Youtube, label: 'YouTube' },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/10 transition-colors hover:bg-navy hover:text-white dark:bg-white/5 dark:hover:bg-gold dark:hover:text-navy-950"
                      aria-label={`Follow us on ${social.label}`}
                    >
                      <social.icon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="rounded-3xl border border-border bg-card p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="prayer">Prayer Request</SelectItem>
                          <SelectItem value="giving">Giving Question</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="missions">Missions</SelectItem>
                          <SelectItem value="events">Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you?"
                      rows={5}
                      required
                    />
                  </div>

                  <div role="alert" aria-live="polite">
                    {error && (
                      <p className="text-body-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="glow"
                    size="xl"
                    className="w-full"
                  >
                    {loading ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

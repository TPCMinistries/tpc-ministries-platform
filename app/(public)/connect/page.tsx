'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Send,
  Mail,
  Users,
  Heart,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  MapPin,
} from 'lucide-react'

export default function ConnectPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', phone: '', subject: 'general', message: '' })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const subjects = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'prayer', label: 'Prayer Request' },
    { value: 'partnership', label: 'Partnership Interest' },
    { value: 'missions', label: 'Missions Information' },
    { value: 'volunteer', label: 'Volunteer Opportunities' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            We&apos;d Love to Hear From You
          </p>
          <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
            Connect With Us
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            Whether you have questions, need prayer, or want to get involved,
            we&apos;re here for you. Reach out and let&apos;s start a conversation.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Main Content */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
                Get In Touch
              </p>
              <h2 className="mb-8 font-display text-display-sm text-navy dark:text-white">
                Send Us a Message
              </h2>

              {isSubmitted ? (
                <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950/50">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="mb-2 font-display text-display-xs text-green-800 dark:text-green-300">Message Sent!</h3>
                  <p className="mb-6 text-body-md text-green-700 dark:text-green-400">
                    Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-100"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-card p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <select
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="h-10 w-full rounded-md border border-border bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                          required
                        >
                          {subjects.map((subject) => (
                            <option key={subject.value} value={subject.value}>
                              {subject.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Your Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="How can we help you? Share your questions, prayer requests, or how you'd like to get involved..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      variant="glow"
                      size="xl"
                      className="w-full"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Side - Info Cards */}
            <div className="space-y-6">
              <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
                More Options
              </p>
              <h2 className="mb-8 font-display text-display-sm text-navy dark:text-white">
                Other Ways to Connect
              </h2>

              {/* Join Community Card */}
              <div className="rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:border-gold/30 hover:shadow-xl">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-display-xs text-navy dark:text-white">Join Our Community</h3>
                    <p className="text-body-sm text-muted-foreground">Create an account to access member resources</p>
                  </div>
                </div>
                <p className="mb-6 text-body-md text-muted-foreground">
                  Sign up for free to access teachings, prayer groups, events, and connect
                  with other believers in our community.
                </p>
                <Link href="/auth/signup">
                  <Button variant="glow" className="w-full">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Partnership Card */}
              <div className="rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:border-gold/30 hover:shadow-xl">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                    <Heart className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-display text-display-xs text-navy dark:text-white">Become a Partner</h3>
                    <p className="text-body-sm text-muted-foreground">Support the ministry with monthly giving</p>
                  </div>
                </div>
                <p className="mb-6 text-body-md text-muted-foreground">
                  Partners receive exclusive access to all ebooks, special content,
                  and join a community of purpose-driven believers.
                </p>
                <Link href="/partner">
                  <Button variant="outline" className="w-full border-gold/30 text-foreground hover:bg-gold/10">
                    Learn About Partnership
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Contact Info Card */}
              <div className="rounded-3xl border border-border bg-secondary/50 p-8">
                <h3 className="mb-4 font-display text-body-lg font-semibold text-navy dark:text-white">Direct Contact</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:info@tpcmin.org"
                    className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-navy dark:hover:text-white"
                  >
                    <Mail className="h-5 w-5 text-gold" />
                    <span>info@tpcmin.org</span>
                  </a>
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                    <span>Based in the United States<br />Serving Globally</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />

        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Ready?
          </p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
            Ready to Take the Next Step?
          </h2>
          <p className="mb-10 text-body-xl text-white/50">
            Join thousands of believers growing in faith and purpose together.
          </p>
          <Link href="/auth/signup">
            <Button variant="glow" size="xl">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

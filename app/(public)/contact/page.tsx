'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  Phone,
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
        <section className="flex-1 bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">Message Sent!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for reaching out. We'll get back to you within 24-48 hours.
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
                className="bg-navy hover:bg-navy/90"
              >
                Send Another Message
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We'd love to hear from you. Reach out with questions, prayer requests, or just to say hello.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-navy mb-6">Get In Touch</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-navy/10 rounded-full p-3">
                      <Mail className="h-5 w-5 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">Email</h3>
                      <a href="mailto:info@tpcmin.org" className="text-gray-600 hover:text-gold">
                        info@tpcmin.org
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-navy/10 rounded-full p-3">
                      <MapPin className="h-5 w-5 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">Location</h3>
                      <p className="text-gray-600">
                        Global Ministry<br />
                        Kenya • South Africa • Grenada
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-navy mb-4">Follow Us @tpcmin</h3>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com/tpcmin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-navy/10 rounded-full p-3 hover:bg-navy hover:text-white transition-colors"
                    aria-label="Follow us on Facebook"
                  >
                    <Facebook className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <a
                    href="https://twitter.com/tpcmin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-navy/10 rounded-full p-3 hover:bg-navy hover:text-white transition-colors"
                    aria-label="Follow us on Twitter"
                  >
                    <Twitter className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <a
                    href="https://instagram.com/tpcmin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-navy/10 rounded-full p-3 hover:bg-navy hover:text-white transition-colors"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <a
                    href="https://youtube.com/@tpcmin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-navy/10 rounded-full p-3 hover:bg-navy hover:text-white transition-colors"
                    aria-label="Subscribe on YouTube"
                  >
                    <Youtube className="h-5 w-5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
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

                    <div className="grid md:grid-cols-2 gap-4">
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
                        <p className="text-red-600 text-sm">{error}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-navy hover:bg-navy/90"
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

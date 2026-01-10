'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Phone,
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-tpc-navy via-tpc-navy/95 to-tpc-navy/90 text-white px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <MessageCircle className="h-4 w-4 text-tpc-gold" />
              <span className="text-tpc-gold text-sm font-medium">We'd Love to Hear From You</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Connect With Us
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Whether you have questions, need prayer, or want to get involved,
              we're here for you. Reach out and let's start a conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-6">Send Us a Message</h2>

              {isSubmitted ? (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-green-700 mb-6">
                      Thank you for reaching out. We'll get back to you as soon as possible.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-100"
                    >
                      Send Another Message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
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

                      <div className="grid sm:grid-cols-2 gap-4">
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
                            className="w-full h-10 px-3 rounded-md border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-tpc-gold"
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
                        className="w-full bg-tpc-navy hover:bg-tpc-navy/90 text-white h-12"
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
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - Info Cards */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-stone-900 mb-6">Other Ways to Connect</h2>

              {/* Join Community Card */}
              <Card className="border-tpc-gold/30 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-tpc-navy rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-tpc-gold" />
                    </div>
                    <div>
                      <CardTitle className="text-tpc-navy">Join Our Community</CardTitle>
                      <CardDescription>Create an account to access member resources</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-600 mb-4">
                    Sign up for free to access teachings, prayer groups, events, and connect
                    with other believers in our community.
                  </p>
                  <Link href="/auth/signup">
                    <Button className="w-full bg-tpc-gold hover:bg-tpc-gold/90 text-tpc-navy font-semibold">
                      Create Free Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Partnership Card */}
              <Card className="border-tpc-gold/30 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-tpc-gold/20 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-tpc-gold" />
                    </div>
                    <div>
                      <CardTitle className="text-tpc-navy">Become a Partner</CardTitle>
                      <CardDescription>Support the ministry with monthly giving</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-600 mb-4">
                    Partners receive exclusive access to all ebooks, special content,
                    and join a community of purpose-driven believers.
                  </p>
                  <Link href="/partner">
                    <Button variant="outline" className="w-full border-tpc-gold text-tpc-gold hover:bg-tpc-gold/10">
                      Learn About Partnership
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Contact Info Card */}
              <Card className="bg-stone-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-stone-900 mb-4">Direct Contact</h3>
                  <div className="space-y-4">
                    <a
                      href="mailto:info@tpcmin.org"
                      className="flex items-center gap-3 text-stone-600 hover:text-tpc-navy transition-colors"
                    >
                      <Mail className="h-5 w-5 text-tpc-gold" />
                      <span>info@tpcmin.org</span>
                    </a>
                    <div className="flex items-start gap-3 text-stone-600">
                      <MapPin className="h-5 w-5 text-tpc-gold flex-shrink-0 mt-0.5" />
                      <span>Based in the United States<br />Serving Globally</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-tpc-gold to-tpc-gold-accent px-4 py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-tpc-navy mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl text-tpc-navy/80 mb-8">
            Join thousands of believers growing in faith and purpose together.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-tpc-navy hover:bg-tpc-navy/90 text-white font-bold px-8 h-14">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

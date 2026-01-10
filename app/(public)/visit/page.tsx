'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  Clock,
  Video,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Globe,
  Users,
  Heart,
  BookOpen,
  Headphones,
  MessageCircle
} from 'lucide-react'

interface ServiceTime {
  id: string
  name: string
  description?: string
  day_of_week?: number
  start_time: string
  end_time?: string
  location?: string
  location_type: string
  stream_url?: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function VisitPage() {
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/public/service-times')
      const data = await res.json()
      setServiceTimes(data.serviceTimes || [])
      setFaqs(data.faqs || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Connect With Us
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join our global community of believers from Kenya, South Africa, Grenada, and beyond
          </p>
        </div>
      </section>

      {/* Ways to Connect */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">Ways to Connect</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-navy rounded-full p-3">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-navy">Online Services</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Join us for live worship and teaching online. Connect with believers from around the world.
                </p>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">
                    Join Live
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gold rounded-full p-3">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-navy">Teachings Library</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Access our library of prophetic teachings, sermons, and biblical studies anytime.
                </p>
                <Link href="/teachings">
                  <Button variant="outline" className="w-full">
                    Browse Teachings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-navy rounded-full p-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-navy">Member Community</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Become a member to access exclusive content, prayer groups, and discipleship resources.
                </p>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">
                    Become a Member
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scheduled Services */}
      {!loading && serviceTimes.length > 0 && (
        <section className="px-4 py-16 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-navy mb-8 text-center">Service Schedule</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {serviceTimes.map(service => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-navy rounded-full p-3">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-navy">{service.name}</CardTitle>
                        <p className="text-gold font-medium">
                          {service.day_of_week !== null && service.day_of_week !== undefined
                            ? dayNames[service.day_of_week]
                            : 'Special Event'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-2xl font-bold text-navy">
                        {formatTime(service.start_time)}
                        {service.end_time && ` - ${formatTime(service.end_time)}`}
                      </p>
                      {service.description && (
                        <p className="text-gray-600 text-sm">{service.description}</p>
                      )}
                      {service.location_type !== 'in_person' && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Video className="h-4 w-4" />
                          {service.location_type === 'online' ? 'Online' : 'In-Person & Online'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What We Offer */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">What We Offer</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="bg-gold/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-gold" />
                </div>
                <h3 className="font-semibold text-navy mb-2">Prophetic Words</h3>
                <p className="text-gray-600 text-sm">
                  Receive timely prophetic insights and guidance for your spiritual journey.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="bg-navy/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-navy" />
                </div>
                <h3 className="font-semibold text-navy mb-2">Biblical Teaching</h3>
                <p className="text-gray-600 text-sm">
                  Deep, transformative teaching rooted in Scripture and the prophetic.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="bg-gold/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-gold" />
                </div>
                <h3 className="font-semibold text-navy mb-2">Prayer Support</h3>
                <p className="text-gray-600 text-sm">
                  Submit prayer requests and join our community in intercession.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="bg-navy/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-navy" />
                </div>
                <h3 className="font-semibold text-navy mb-2">Global Missions</h3>
                <p className="text-gray-600 text-sm">
                  Partner with our missions in Kenya, South Africa, and Grenada.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="px-4 py-16 bg-white">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-navy mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map(faq => (
                <Card
                  key={faq.id}
                  className={`cursor-pointer transition-shadow ${expandedFaq === faq.id ? 'shadow-md' : ''}`}
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-navy">{faq.question}</h3>
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    {expandedFaq === faq.id && (
                      <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-br from-gold to-amber-500">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-navy/80 mb-8">
            Join thousands of believers discovering their purpose and walking in their calling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-navy text-white hover:bg-navy/90">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-navy text-navy hover:bg-navy/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

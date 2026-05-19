'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Clock,
  Video,
  ChevronDown,
  ArrowRight,
  Globe,
  Users,
  Heart,
  BookOpen,
  Headphones,
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
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,184,131,0.06),transparent_60%)]" />

        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <p className="mb-6 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Join Our Community
          </p>
          <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
            Connect With Us
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/65">
            A growing community across the US and worldwide. Find us online, on the road, and in the room.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Ways to Connect */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
              Get Involved
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-navy dark:text-white">
              Ways to Connect
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Video,
                title: 'Online Services',
                desc: 'Join us for live worship and teaching online. Connect with believers from around the world.',
                linkHref: '/auth/signup',
                linkText: 'Join Live',
                color: 'bg-navy',
              },
              {
                icon: BookOpen,
                title: 'Teachings Library',
                desc: 'Access our library of prophetic teachings, sermons, and biblical studies anytime.',
                linkHref: '/teachings',
                linkText: 'Browse Teachings',
                color: 'bg-gold',
              },
              {
                icon: Users,
                title: 'Member Community',
                desc: 'Become a member to access exclusive content, prayer groups, and discipleship resources.',
                linkHref: '/auth/signup',
                linkText: 'Become a Member',
                color: 'bg-navy',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:border-gold/30 hover:shadow-xl"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-display text-display-xs text-navy dark:text-white">{item.title}</h3>
                </div>
                <p className="mb-6 text-body-md text-muted-foreground">{item.desc}</p>
                <Link href={item.linkHref}>
                  <Button variant="outline" className="w-full">
                    {item.linkText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scheduled Services */}
      {!loading && serviceTimes.length > 0 && (
        <section className="bg-navy dark:bg-navy-950 px-4 py-section">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Schedule
              </p>
              <h2 className="font-display text-display-md md:text-display-lg text-white">
                Service Schedule
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {serviceTimes.map(service => (
                <div
                  key={service.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-gold/30 hover:bg-white/10"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                      <Clock className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display text-body-lg font-semibold text-white">{service.name}</h3>
                      <p className="text-body-sm font-medium text-gold">
                        {service.day_of_week !== null && service.day_of_week !== undefined
                          ? dayNames[service.day_of_week]
                          : 'Special Event'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="font-display text-display-xs text-white">
                      {formatTime(service.start_time)}
                      {service.end_time && ` - ${formatTime(service.end_time)}`}
                    </p>
                    {service.description && (
                      <p className="text-body-sm text-white/50">{service.description}</p>
                    )}
                    {service.location_type !== 'in_person' && (
                      <div className="flex items-center gap-2 text-body-sm text-gold/70">
                        <Video className="h-4 w-4" />
                        {service.location_type === 'online' ? 'Online' : 'In-Person & Online'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What We Offer */}
      <section className="px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
              Ministry
            </p>
            <h2 className="font-display text-display-md md:text-display-lg text-navy dark:text-white">
              What We Offer
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Headphones, title: 'Prophetic Words', desc: 'Receive timely prophetic insights and guidance for your spiritual journey.' },
              { icon: BookOpen, title: 'Biblical Teaching', desc: 'Deep, transformative teaching rooted in Scripture and the prophetic.' },
              { icon: Heart, title: 'Prayer Support', desc: 'Submit prayer requests and join our community in intercession.' },
              { icon: Globe, title: 'Global Missions', desc: 'Partner with US digital ministry + on-the-ground work in Kenya, South Africa, and Grenada.' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-gold/30 hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy/10 dark:bg-navy/30">
                  <item.icon className="h-6 w-6 text-navy dark:text-gold" />
                </div>
                <h3 className="mb-2 font-display text-body-lg font-semibold text-navy dark:text-white">
                  {item.title}
                </h3>
                <p className="text-body-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="border-y border-border bg-secondary/50 px-4 py-section">
          <div className="container mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
                Questions
              </p>
              <h2 className="font-display text-display-md text-navy dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map(faq => (
                <div
                  key={faq.id}
                  className={`cursor-pointer rounded-3xl border bg-card p-6 transition-all duration-300 ${
                    expandedFaq === faq.id ? 'border-gold/30 shadow-lg' : 'border-border hover:border-gold/20'
                  }`}
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-body-lg font-semibold text-navy dark:text-white">{faq.question}</h3>
                    <ChevronDown className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${
                      expandedFaq === faq.id ? 'rotate-180 text-gold' : ''
                    }`} />
                  </div>
                  {expandedFaq === faq.id && (
                    <p className="mt-4 border-t border-border pt-4 text-body-md leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />

        <div className="container relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Begin Today
          </p>
          <h2 className="mb-6 font-display text-display-md md:text-display-lg text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="mb-10 text-body-xl text-white/50">
            Join thousands of believers discovering their purpose and walking in their calling.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/signup">
              <Button variant="glow" size="xl">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-gold/30 text-white hover:bg-gold/10"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

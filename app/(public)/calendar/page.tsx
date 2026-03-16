'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  ArrowRight,
  Filter
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  event_type: string
  start_date: string
  end_date: string
  location?: string
  is_virtual: boolean
  virtual_link?: string
  capacity?: number
  registration_deadline?: string
  featured_image_url?: string
  price: number
}

const eventTypeLabels: Record<string, string> = {
  conference: 'Conference',
  workshop: 'Workshop',
  service: 'Service',
  webinar: 'Webinar',
  retreat: 'Retreat'
}

const eventTypeColors: Record<string, string> = {
  conference: 'bg-purple-100 text-purple-800',
  workshop: 'bg-blue-100 text-blue-800',
  service: 'bg-green-100 text-green-800',
  webinar: 'bg-orange-100 text-orange-800',
  retreat: 'bg-pink-100 text-pink-800'
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/public/events?limit=20')
      const data = await res.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.event_type === filter)

  const eventTypes = [...new Set(events.map(e => e.event_type))]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Join Us</p>
          <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
            Upcoming Events
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            Join us for worship, learning, and fellowship. Find an event that speaks to your heart.
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Events Section */}
      <section className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-6xl">
          {/* Filter */}
          {eventTypes.length > 1 && (
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                <Filter className="mr-2 h-4 w-4" />
                All Events
              </Button>
              {eventTypes.map(type => (
                <Button
                  key={type}
                  variant={filter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(type)}
                >
                  {eventTypeLabels[type] || type}
                </Button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-navy"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="rounded-2xl py-16 text-center">
              <CardContent>
                <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 font-display text-display-xs text-foreground">
                  No Upcoming Events
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Check back soon for new events, or subscribe to our newsletter to stay updated.
                </p>
                <Link href="/#newsletter">
                  <Button>
                    Subscribe for Updates
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map(event => (
                <Card key={event.id} className="overflow-hidden rounded-2xl border-border transition-all hover:border-gold/30 hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Date sidebar */}
                      <div className="flex flex-col items-center justify-center bg-navy p-6 text-white md:w-48 dark:bg-navy-950">
                        <span className="text-display-md font-bold">
                          {new Date(event.start_date).getDate()}
                        </span>
                        <span className="text-body-sm font-semibold uppercase tracking-wide text-gold">
                          {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-body-sm text-white/50">
                          {new Date(event.start_date).getFullYear()}
                        </span>
                      </div>

                      {/* Event details */}
                      <div className="flex-1 p-6">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge className={eventTypeColors[event.event_type] || 'bg-secondary text-secondary-foreground'}>
                            {eventTypeLabels[event.event_type] || event.event_type}
                          </Badge>
                          {event.is_virtual && (
                            <Badge variant="outline" className="gap-1">
                              <Video className="h-3 w-3" />
                              Virtual
                            </Badge>
                          )}
                          {event.price === 0 && (
                            <Badge className="bg-green-100 text-green-800">Free</Badge>
                          )}
                        </div>

                        <h3 className="mb-2 font-display text-display-xs text-foreground">{event.title}</h3>

                        {event.description && (
                          <p className="mb-4 line-clamp-2 text-muted-foreground">{event.description}</p>
                        )}

                        <div className="mb-4 flex flex-wrap gap-4 text-body-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(event.start_date)}
                            {event.end_date && ` - ${formatTime(event.end_date)}`}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </span>
                          )}
                          {event.capacity && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {event.capacity} spots
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Link href={`/events/${event.id}`}>
                            <Button variant="glow">
                              Learn More
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                          {event.is_virtual && event.virtual_link && (
                            <Button variant="outline">
                              <Video className="mr-2 h-4 w-4" />
                              Join Online
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,131,0.1),transparent_70%)]" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <h2 className="mb-4 font-display text-display-md text-white">
            Want to Host an Event?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-body-xl text-white/50">
            Partner with us to bring transformative experiences to your community
          </p>
          <Link href="/contact">
            <Button variant="glow" size="lg">
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

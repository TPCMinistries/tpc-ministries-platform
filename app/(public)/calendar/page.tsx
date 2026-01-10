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
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold text-white md:text-6xl">
            Upcoming Events
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join us for worship, learning, and fellowship. Find an event that speaks to your heart.
          </p>
        </div>
      </section>

      {/* Events Section */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          {/* Filter */}
          {eventTypes.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-navy' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                All Events
              </Button>
              {eventTypes.map(type => (
                <Button
                  key={type}
                  variant={filter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(type)}
                  className={filter === type ? 'bg-navy' : ''}
                >
                  {eventTypeLabels[type] || type}
                </Button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Upcoming Events
                </h3>
                <p className="text-gray-500 mb-6">
                  Check back soon for new events, or subscribe to our newsletter to stay updated.
                </p>
                <Link href="/#newsletter">
                  <Button className="bg-navy hover:bg-navy/90">
                    Subscribe for Updates
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map(event => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Date sidebar */}
                      <div className="bg-navy text-white p-6 md:w-48 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold">
                          {new Date(event.start_date).getDate()}
                        </span>
                        <span className="text-gold uppercase tracking-wide">
                          {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-sm text-gray-300">
                          {new Date(event.start_date).getFullYear()}
                        </span>
                      </div>

                      {/* Event details */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={eventTypeColors[event.event_type] || 'bg-gray-100 text-gray-800'}>
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

                        <h3 className="text-2xl font-bold text-navy mb-2">{event.title}</h3>

                        {event.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
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
                            <Button className="bg-gold hover:bg-gold/90 text-navy">
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
      <section className="px-4 py-16 bg-gradient-to-br from-gold to-amber-500">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Want to Host an Event?
          </h2>
          <p className="text-xl text-navy/80 mb-8">
            Partner with us to bring transformative experiences to your community
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-navy text-white hover:bg-navy/90">
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

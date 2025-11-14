'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, MapPin, Users, Video, Check, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Event {
  id: string
  title: string
  description: string
  type: 'in-person' | 'online' | 'hybrid'
  date: string
  time: string
  location?: string
  meeting_link?: string
  image_url?: string
  attendees_count: number
  is_registered: boolean
  category: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)

      // Fetch all upcoming events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

      // Fetch user's registrations
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('event_id, status')
        .eq('user_id', user.id)

      const registeredEventIds = new Set(
        registrations?.filter(r => r.status === 'registered').map(r => r.event_id) || []
      )

      if (eventsError) {
        console.error('Error fetching events:', eventsError)
      } else if (eventsData) {
        setEvents(
          eventsData.map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description || '',
            type: event.event_type,
            date: new Date(event.start_time).toLocaleDateString(),
            time: new Date(event.start_time).toLocaleTimeString(),
            location: event.location,
            meeting_link: event.virtual_link,
            image_url: event.image_url,
            attendees_count: 0, // TODO: Calculate from registrations
            is_registered: registeredEventIds.has(event.id),
            category: 'Event',
          }))
        )
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRegistration = async (eventId: string) => {
    if (!userId) return

    const supabase = createClient()
    const event = events.find(e => e.id === eventId)
    if (!event) return

    try {
      if (event.is_registered) {
        // Cancel registration
        const { error } = await supabase
          .from('event_registrations')
          .update({ status: 'cancelled' })
          .eq('event_id', eventId)
          .eq('user_id', userId)

        if (error) console.error('Error canceling registration:', error)
      } else {
        // Register for event
        const { error } = await supabase
          .from('event_registrations')
          .insert({
            event_id: eventId,
            user_id: userId,
            attendance_type: event.type === 'online' ? 'virtual' : 'in-person',
            status: 'registered',
          })

        if (error) console.error('Error registering:', error)
      }

      // Update local state
      setEvents(
        events.map((e) =>
          e.id === eventId ? { ...e, is_registered: !e.is_registered } : e
        )
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'in-person':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'online':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'hybrid':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date()
  }

  const upcomingEvents = events.filter((event) => isUpcoming(event.date))
  const pastEvents = events.filter((event) => !isUpcoming(event.date))
  const myEvents = events.filter((event) => event.is_registered)

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy">Events</h1>
        <p className="text-gray-600 mt-1">Discover and register for upcoming ministry events</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-navy">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">My Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{myEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Past Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{pastEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="my-events">My Events ({myEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6 space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">No upcoming events at this time.</p>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        {event.is_registered && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Registered
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">{event.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="h-4 w-4 text-navy" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="h-4 w-4 text-navy" />
                      {event.time}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-navy" />
                        {event.location}
                      </div>
                    )}
                    {event.meeting_link && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Video className="h-4 w-4 text-navy" />
                        Online Event
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="h-4 w-4 text-navy" />
                      {event.attendees_count} attendees
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getEventTypeColor(event.type)}>
                      {event.type.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{event.category}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleRegistration(event.id)}
                      className={
                        event.is_registered
                          ? 'bg-gray-600 hover:bg-gray-700'
                          : 'bg-navy hover:bg-navy/90'
                      }
                    >
                      {event.is_registered ? 'Unregister' : 'Register Now'}
                    </Button>
                    {event.meeting_link && event.is_registered && (
                      <Button variant="outline">Join Online</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="my-events" className="mt-6 space-y-4">
          {myEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center mb-4">
                  You haven't registered for any events yet.
                </p>
                <Button onClick={() => setActiveTab('upcoming')} className="bg-navy hover:bg-navy/90">
                  Browse Upcoming Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            myEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow border-l-4 border-l-navy">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                      <CardDescription className="text-base">{event.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="h-4 w-4 text-navy" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="h-4 w-4 text-navy" />
                      {event.time}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-navy" />
                        {event.location}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => toggleRegistration(event.id)} variant="outline">
                      Unregister
                    </Button>
                    {event.meeting_link && (
                      <Button className="bg-navy hover:bg-navy/90">Join Online</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6 space-y-4">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">No past events to display.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <Card key={event.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <CardDescription>{formatDate(event.date)}</CardDescription>
                      </div>
                      <Badge variant="outline">Past Event</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Loader2,
  MapPin,
  Video,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

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
  price: number
  tier_access: string[]
  registrations: { count: number }[]
  user_registered?: boolean
  registration_status?: string
}

export default function MemberEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('upcoming')
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id, tier')
        .eq('auth_user_id', user.id)
        .single()

      if (!member) return

      // Fetch all published events
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          registrations:event_registrations(count)
        `)
        .eq('is_published', true)
        .order('start_date', { ascending: true })

      if (error) throw error

      // Check if user is registered for each event
      const { data: userRegistrations } = await supabase
        .from('event_registrations')
        .select('event_id, status')
        .eq('member_id', member.id)

      const registrationMap = new Map(
        userRegistrations?.map(r => [r.event_id, r.status]) || []
      )

      const eventsWithRegistration = (data || []).map(event => ({
        ...event,
        user_registered: registrationMap.has(event.id),
        registration_status: registrationMap.get(event.id),
      }))

      setEvents(eventsWithRegistration)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!member) throw new Error('Member not found')

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          member_id: member.id,
          status: 'registered',
        })

      if (error) throw error

      toast({
        title: 'Registration Successful!',
        description: 'You have been registered for this event.',
      })

      fetchEvents()
    } catch (error: any) {
      console.error('Error registering:', error)
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register for event',
        variant: 'destructive',
      })
    } finally {
      setRegistering(null)
    }
  }

  const handleCancelRegistration = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel your registration?')) return

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!member) throw new Error('Member not found')

      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('member_id', member.id)

      if (error) throw error

      toast({
        title: 'Registration Cancelled',
        description: 'Your registration has been cancelled.',
      })

      fetchEvents()
    } catch (error: any) {
      console.error('Error cancelling:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel registration',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const isEventFull = (event: Event) => {
    if (!event.capacity) return false
    return (event.registrations[0]?.count || 0) >= event.capacity
  }

  const isRegistrationClosed = (event: Event) => {
    if (!event.registration_deadline) return false
    return new Date(event.registration_deadline) < new Date()
  }

  const isEventPast = (event: Event) => {
    return new Date(event.end_date) < new Date()
  }

  const canRegister = (event: Event) => {
    return !event.user_registered &&
           !isEventFull(event) &&
           !isRegistrationClosed(event) &&
           !isEventPast(event)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'workshop': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'service': return 'bg-green-100 text-green-700 border-green-200'
      case 'webinar': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'retreat': return 'bg-pink-100 text-pink-700 border-pink-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const upcomingEvents = events.filter(e => !isEventPast(e))
  const myEvents = events.filter(e => e.user_registered && e.registration_status === 'registered')
  const pastEvents = events.filter(e => isEventPast(e))

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy mb-2">Events</h1>
          <p className="text-gray-600">Browse and register for ministry events</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{upcomingEvents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">My Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{myEvents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Past Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{pastEvents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              <Calendar className="mr-2 h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="my-events">
              <CheckCircle className="mr-2 h-4 w-4" />
              My Events
            </TabsTrigger>
            <TabsTrigger value="past">
              <Clock className="mr-2 h-4 w-4" />
              Past
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="upcoming">
            <div className="grid gap-6">
              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No upcoming events</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-semibold text-navy">{event.title}</h3>
                              <Badge variant="outline" className={getEventTypeColor(event.event_type)}>
                                {event.event_type}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-gray-600 mb-4">{event.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {formatDate(event.start_date)} at {formatTime(event.start_date)}
                              {' - '}
                              {formatTime(event.end_date)}
                            </span>
                          </div>
                          {event.is_virtual ? (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Video className="h-4 w-4 flex-shrink-0" />
                              <span>Virtual Event</span>
                              {event.user_registered && event.virtual_link && (
                                <a
                                  href={event.virtual_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-navy underline ml-2"
                                >
                                  Join Meeting
                                </a>
                              )}
                            </div>
                          ) : event.location && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {event.registrations[0]?.count || 0}
                                {event.capacity && ` / ${event.capacity}`} registered
                              </span>
                            </div>
                            {event.price > 0 && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <DollarSign className="h-4 w-4 flex-shrink-0" />
                                <span>${event.price}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2">
                            {event.user_registered ? (
                              event.registration_status === 'registered' ? (
                                <>
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="text-green-600 font-medium">You're registered!</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-5 w-5 text-gray-600" />
                                  <span className="text-gray-600 font-medium">Cancelled</span>
                                </>
                              )
                            ) : isEventFull(event) ? (
                              <>
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <span className="text-red-600 font-medium">Event Full</span>
                              </>
                            ) : isRegistrationClosed(event) ? (
                              <>
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                <span className="text-orange-600 font-medium">Registration Closed</span>
                              </>
                            ) : null}
                          </div>

                          {canRegister(event) ? (
                            <Button
                              onClick={() => handleRegister(event.id)}
                              disabled={registering === event.id}
                              className="bg-gold hover:bg-gold/90 text-navy"
                            >
                              {registering === event.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Registering...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Register Now
                                </>
                              )}
                            </Button>
                          ) : event.user_registered && event.registration_status === 'registered' ? (
                            <Button
                              variant="outline"
                              onClick={() => handleCancelRegistration(event.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Cancel Registration
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* My Events */}
          <TabsContent value="my-events">
            <div className="grid gap-6">
              {myEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">You haven't registered for any events yet</p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('upcoming')}
                      className="mt-4"
                    >
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myEvents.map((event) => (
                  <Card key={event.id} className="border-gold hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-semibold text-navy">{event.title}</h3>
                              <Badge variant="outline" className={getEventTypeColor(event.event_type)}>
                                {event.event_type}
                              </Badge>
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                Registered
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-gray-600 mb-4">{event.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {formatDate(event.start_date)} at {formatTime(event.start_date)}
                            </span>
                          </div>
                          {event.is_virtual ? (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Video className="h-4 w-4 flex-shrink-0" />
                              <span>Virtual Event</span>
                              {event.virtual_link && (
                                <a
                                  href={event.virtual_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-navy underline ml-2 font-medium"
                                >
                                  Join Meeting →
                                </a>
                              )}
                            </div>
                          ) : event.location && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => handleCancelRegistration(event.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Cancel Registration
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Past Events */}
          <TabsContent value="past">
            <div className="grid gap-6">
              {pastEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No past events</p>
                  </CardContent>
                </Card>
              ) : (
                pastEvents.map((event) => (
                  <Card key={event.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-700">{event.title}</h3>
                            <Badge variant="outline" className="bg-gray-100 text-gray-600">
                              {event.event_type}
                            </Badge>
                            {event.user_registered && (
                              <Badge className="bg-blue-100 text-blue-700">
                                Attended
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(event.start_date)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

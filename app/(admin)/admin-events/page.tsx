'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Calendar,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Video,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  is_published: boolean
  price: number
  tier_access: string[]
  registrations?: { count: number }[]
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const { toast } = useToast()

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'service',
    start_date: '',
    end_date: '',
    location: '',
    is_virtual: false,
    virtual_link: '',
    capacity: '',
    registration_deadline: '',
    is_published: false,
    price: '0',
    tier_access: ['free', 'partner', 'covenant'],
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          registrations:event_registrations(count)
        `)
        .order('start_date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
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

      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        event_type: eventForm.event_type,
        start_date: eventForm.start_date,
        end_date: eventForm.end_date,
        location: eventForm.location,
        is_virtual: eventForm.is_virtual,
        virtual_link: eventForm.virtual_link,
        capacity: eventForm.capacity ? parseInt(eventForm.capacity) : null,
        registration_deadline: eventForm.registration_deadline || null,
        is_published: eventForm.is_published,
        price: parseFloat(eventForm.price),
        tier_access: eventForm.tier_access,
        created_by: member.id,
        updated_at: new Date().toISOString(),
      }

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error

        toast({
          title: 'Event Updated!',
          description: 'The event has been updated successfully.',
        })
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData)

        if (error) throw error

        toast({
          title: 'Event Created!',
          description: 'The event has been created successfully.',
        })
      }

      setDialogOpen(false)
      resetForm()
      fetchEvents()
    } catch (error: any) {
      console.error('Error saving event:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save event',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_date: event.start_date.split('T')[0] + 'T' + event.start_date.split('T')[1].substring(0, 5),
      end_date: event.end_date.split('T')[0] + 'T' + event.end_date.split('T')[1].substring(0, 5),
      location: event.location || '',
      is_virtual: event.is_virtual,
      virtual_link: event.virtual_link || '',
      capacity: event.capacity?.toString() || '',
      registration_deadline: event.registration_deadline?.split('T')[0] || '',
      is_published: event.is_published,
      price: event.price.toString(),
      tier_access: event.tier_access,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Event Deleted',
        description: 'The event has been removed.',
      })

      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      event_type: 'service',
      start_date: '',
      end_date: '',
      location: '',
      is_virtual: false,
      virtual_link: '',
      capacity: '',
      registration_deadline: '',
      is_published: false,
      price: '0',
      tier_access: ['free', 'partner', 'covenant'],
    })
    setEditingEvent(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference': return 'bg-purple-100 text-purple-700'
      case 'workshop': return 'bg-blue-100 text-blue-700'
      case 'service': return 'bg-green-100 text-green-700'
      case 'webinar': return 'bg-orange-100 text-orange-700'
      case 'retreat': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Event Management</h1>
            <p className="text-gray-600">Create and manage ministry events</p>
          </div>
          <Button
            onClick={() => {
              resetForm()
              setDialogOpen(true)
            }}
            className="bg-gold hover:bg-gold/90 text-navy"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {events.filter(e => e.is_published).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {events.filter(e => new Date(e.start_date) > new Date()).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">
                {events.reduce((sum, e) => sum + (e.registrations?.[0]?.count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="grid gap-6">
          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No events created yet</p>
                <Button
                  onClick={() => {
                    resetForm()
                    setDialogOpen(true)
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-navy">{event.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type}
                        </span>
                        {event.is_published ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            Draft
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-gray-600 mb-4">{event.description}</p>
                      )}

                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                        </div>
                        {event.is_virtual ? (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Video className="h-4 w-4" />
                            <span>Virtual Event</span>
                          </div>
                        ) : event.location && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Users className="h-4 w-4" />
                            <span>
                              {event.registrations?.[0]?.count || 0}
                              {event.capacity && ` / ${event.capacity}`} registered
                            </span>
                          </div>
                          {event.price > 0 && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <DollarSign className="h-4 w-4" />
                              <span>${event.price}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
              <DialogDescription>
                Fill in the event details below
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Annual Conference 2024"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Event description..."
                  rows={4}
                />
              </div>

              {/* Event Type & Price */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event_type">Event Type *</Label>
                  <Select
                    value={eventForm.event_type}
                    onValueChange={(value) => setEventForm({ ...eventForm, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                      <SelectItem value="retreat">Retreat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={eventForm.price}
                    onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date & Time *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={eventForm.start_date}
                    onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date & Time *</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={eventForm.end_date}
                    onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Virtual */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Virtual Event</div>
                  <div className="text-sm text-gray-600">
                    This event will be held online
                  </div>
                </div>
                <Switch
                  checked={eventForm.is_virtual}
                  onCheckedChange={(checked) => setEventForm({ ...eventForm, is_virtual: checked })}
                />
              </div>

              {/* Location or Virtual Link */}
              {eventForm.is_virtual ? (
                <div className="space-y-2">
                  <Label htmlFor="virtual_link">Virtual Meeting Link</Label>
                  <Input
                    id="virtual_link"
                    type="url"
                    value={eventForm.virtual_link}
                    onChange={(e) => setEventForm({ ...eventForm, virtual_link: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              )}

              {/* Capacity & Registration Deadline */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (leave empty for unlimited)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <Input
                    id="registration_deadline"
                    type="date"
                    value={eventForm.registration_deadline}
                    onChange={(e) => setEventForm({ ...eventForm, registration_deadline: e.target.value })}
                  />
                </div>
              </div>

              {/* Published */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Publish Event</div>
                  <div className="text-sm text-gray-600">
                    Make this event visible to members
                  </div>
                </div>
                <Switch
                  checked={eventForm.is_published}
                  onCheckedChange={(checked) => setEventForm({ ...eventForm, is_published: checked })}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-navy hover:bg-navy/90"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

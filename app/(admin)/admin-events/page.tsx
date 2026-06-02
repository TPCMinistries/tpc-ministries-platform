'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Globe2,
  HeartHandshake,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Video,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

type EventType = 'in-person' | 'online' | 'hybrid'
type EventTier = 'free' | 'partner' | 'covenant'
type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

interface Event {
  id: string
  title: string
  description?: string | null
  event_type: EventType
  location?: string | null
  virtual_link?: string | null
  start_time: string
  end_time: string
  max_attendees?: number | null
  registration_required: boolean
  registration_deadline?: string | null
  tier_required: EventTier
  status: EventStatus
  registrations?: { count: number }[]
}

interface EventFormData {
  title: string
  description: string
  event_type: EventType
  location: string
  virtual_link: string
  start_time: string
  end_time: string
  max_attendees: string
  registration_required: boolean
  registration_deadline: string
  tier_required: EventTier
  status: EventStatus
}

const defaultEventForm: EventFormData = {
  title: '',
  description: '',
  event_type: 'in-person',
  location: '',
  virtual_link: '',
  start_time: '',
  end_time: '',
  max_attendees: '',
  registration_required: false,
  registration_deadline: '',
  tier_required: 'free',
  status: 'draft',
}

const partnerEventPresets: Array<{
  label: string
  description: string
  icon: typeof HeartHandshake
  data: Partial<EventFormData>
}> = [
  {
    label: 'Monthly Partner Gathering',
    description: 'Alignment, teaching, prayer, and corporate encouragement for Covenant Partners.',
    icon: HeartHandshake,
    data: {
      title: 'Monthly Covenant Partner Gathering',
      description:
        'A live partner gathering for alignment, teaching, prayer, and corporate encouragement.',
      event_type: 'online',
      tier_required: 'partner',
      registration_required: true,
      status: 'draft',
    },
  },
  {
    label: 'Future-Readiness Training',
    description: 'AI, leadership, wisdom, business, family, health, and purpose training.',
    icon: Sparkles,
    data: {
      title: 'Partner Future-Readiness Training',
      description:
        'A practical equipping session helping believers grow spiritually, practically, and prophetically for the future ahead.',
      event_type: 'online',
      tier_required: 'partner',
      registration_required: true,
      status: 'draft',
    },
  },
  {
    label: 'Missions Briefing',
    description: 'Early updates, prayer points, and preparation for missions and global assignments.',
    icon: Globe2,
    data: {
      title: 'Covenant Partner Missions Briefing',
      description:
        'A partner briefing with missions updates, prayer focus, and ways to help sustain international outreach.',
      event_type: 'hybrid',
      tier_required: 'covenant',
      registration_required: true,
      status: 'draft',
    },
  },
]

function toLocalDateTimeInput(value: string | null | undefined) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

function toIsoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getEventTypeLabel(type: EventType) {
  if (type === 'in-person') return 'In person'
  if (type === 'online') return 'Online'
  return 'Hybrid'
}

function getStatusVariant(status: EventStatus) {
  if (status === 'upcoming' || status === 'ongoing') return 'default'
  if (status === 'draft') return 'secondary'
  return 'outline'
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventForm, setEventForm] = useState<EventFormData>(defaultEventForm)
  const { toast } = useToast()

  const fetchEvents = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          registrations:event_registrations(count)
        `)
        .order('start_time', { ascending: true })

      if (error) throw error
      setEvents((data || []) as Event[])
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
  }, [toast])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const openCreateDialog = (initialData: Partial<EventFormData> = {}) => {
    setEditingEvent(null)
    setEventForm({ ...defaultEventForm, ...initialData })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEventForm(defaultEventForm)
    setEditingEvent(null)
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      location: event.location || '',
      virtual_link: event.virtual_link || '',
      start_time: toLocalDateTimeInput(event.start_time),
      end_time: toLocalDateTimeInput(event.end_time),
      max_attendees: event.max_attendees?.toString() || '',
      registration_required: event.registration_required,
      registration_deadline: toLocalDateTimeInput(event.registration_deadline),
      tier_required: event.tier_required,
      status: event.status,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eventForm.title || !eventForm.start_time || !eventForm.end_time) {
      toast({
        title: 'Missing details',
        description: 'Add a title, start time, and end time before saving.',
        variant: 'destructive',
      })
      return
    }

    if (new Date(eventForm.end_time) <= new Date(eventForm.start_time)) {
      toast({
        title: 'Check the schedule',
        description: 'The event end time must be after the start time.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    const supabase = createClient()

    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description || null,
        event_type: eventForm.event_type,
        location: eventForm.location || null,
        virtual_link: eventForm.virtual_link || null,
        start_time: new Date(eventForm.start_time).toISOString(),
        end_time: new Date(eventForm.end_time).toISOString(),
        max_attendees: eventForm.max_attendees ? Number(eventForm.max_attendees) : null,
        registration_required: eventForm.registration_required,
        registration_deadline: toIsoOrNull(eventForm.registration_deadline),
        tier_required: eventForm.tier_required,
        status: eventForm.status,
        updated_at: new Date().toISOString(),
      }

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error

        toast({
          title: 'Event updated',
          description: 'The gathering has been updated successfully.',
        })
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData)

        if (error) throw error

        toast({
          title: 'Event created',
          description: 'The gathering has been created successfully.',
        })
      }

      setDialogOpen(false)
      resetForm()
      fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save event',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
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
        title: 'Event deleted',
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

  const publishedEvents = events.filter((event) => ['upcoming', 'ongoing'].includes(event.status))
  const partnerEvents = events.filter((event) =>
    event.status === 'upcoming' && ['partner', 'covenant'].includes(event.tier_required)
  )
  const upcomingEvents = events.filter((event) =>
    event.status === 'upcoming' && new Date(event.start_time) > new Date()
  )
  const totalRegistrations = events.reduce((sum, event) => sum + (event.registrations?.[0]?.count || 0), 0)

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-navy md:text-4xl">Event Management</h1>
            <p className="text-gray-600">Create gatherings that feed the public calendar and Partner Hub.</p>
          </div>
          <Button
            onClick={() => openCreateDialog()}
            className="bg-gold text-navy hover:bg-gold/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
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
              <CardTitle className="text-sm font-medium text-gray-600">Visible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{publishedEvents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{upcomingEvents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">{totalRegistrations}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gold/30 bg-gold/5">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-3 py-1 text-sm font-medium text-navy">
                  <HeartHandshake className="h-4 w-4 text-gold-text" />
                  Covenant Partner Gatherings
                </div>
                <CardTitle className="text-navy">Publish gatherings into the Partner Hub</CardTitle>
                <CardDescription className="mt-2 max-w-3xl">
                  Partner Hub events must be marked <strong>Upcoming</strong> with access set to
                  <strong> Partner</strong> or <strong>Covenant</strong>. Drafts stay hidden while details are being prepared.
                </CardDescription>
              </div>
              <div className="rounded-lg border bg-white p-3 text-right sm:min-w-[180px]">
                <div className="text-2xl font-bold text-navy">{partnerEvents.length}</div>
                <div className="text-xs text-muted-foreground">Partner Hub ready</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {partnerEventPresets.map((preset) => {
                const Icon = preset.icon
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => openCreateDialog(preset.data)}
                    className="rounded-lg border bg-white p-4 text-left transition hover:border-gold/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                  >
                    <div className="mb-3 flex items-center gap-2 font-medium text-navy">
                      <Icon className="h-5 w-5 text-gold-text" />
                      {preset.label}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{preset.description}</p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No events created yet</p>
                <Button
                  onClick={() => openCreateDialog()}
                  variant="outline"
                  className="mt-4"
                >
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold text-navy">{event.title}</h3>
                        <Badge variant="outline">{getEventTypeLabel(event.event_type)}</Badge>
                        <Badge variant={getStatusVariant(event.status)}>{event.status}</Badge>
                        <Badge className="bg-navy/10 text-navy hover:bg-navy/10">
                          {event.tier_required}
                        </Badge>
                        {['partner', 'covenant'].includes(event.tier_required) && event.status === 'upcoming' && (
                          <Badge className="bg-gold/20 text-navy hover:bg-gold/20">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Partner Hub
                          </Badge>
                        )}
                      </div>

                      {event.description && (
                        <p className="mb-4 max-w-3xl text-gray-600">{event.description}</p>
                      )}

                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-4 w-4" />
                          <span>{formatDateTime(event.start_time)} - {formatDateTime(event.end_time)}</span>
                        </div>
                        {event.event_type === 'online' ? (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Video className="h-4 w-4" />
                            <span>{event.virtual_link ? 'Virtual link added' : 'Virtual link pending'}</span>
                          </div>
                        ) : event.location ? (
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="h-4 w-4" />
                          <span>
                            {event.registrations?.[0]?.count || 0}
                            {event.max_attendees && ` / ${event.max_attendees}`} registered
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm" className="text-green-700 hover:bg-green-50">
                        <Link href={`/admin-events/checkin?event_id=${event.id}`}>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Check-in
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
              <DialogDescription>
                Use Draft while planning. Set status to Upcoming when this should appear to the right audience.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Monthly Covenant Partner Gathering"
                  required
                />
              </div>

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

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Event Type *</Label>
                  <Select
                    value={eventForm.event_type}
                    onValueChange={(value: EventType) => setEventForm({ ...eventForm, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In person</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Access Tier</Label>
                  <Select
                    value={eventForm.tier_required}
                    onValueChange={(value: EventTier) => setEventForm({ ...eventForm, tier_required: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="covenant">Covenant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={eventForm.status}
                    onValueChange={(value: EventStatus) => setEventForm({ ...eventForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Date & Time *</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={eventForm.start_time}
                    onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Date & Time *</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={eventForm.end_time}
                    onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Church, venue, or city"
                  />
                </div>
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_attendees">Max Attendees</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    min="1"
                    value={eventForm.max_attendees}
                    onChange={(e) => setEventForm({ ...eventForm, max_attendees: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <Input
                    id="registration_deadline"
                    type="datetime-local"
                    value={eventForm.registration_deadline}
                    onChange={(e) => setEventForm({ ...eventForm, registration_deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="font-medium">Registration Required</div>
                  <div className="text-sm text-gray-600">
                    Track RSVPs and enable check-in for this gathering.
                  </div>
                </div>
                <Switch
                  checked={eventForm.registration_required}
                  onCheckedChange={(checked) => setEventForm({ ...eventForm, registration_required: checked })}
                />
              </div>

              {['partner', 'covenant'].includes(eventForm.tier_required) && (
                <div className="rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm text-muted-foreground">
                  <div className="mb-1 flex items-center gap-2 font-medium text-navy">
                    <ShieldCheck className="h-4 w-4 text-gold-text" />
                    Partner Hub visibility
                  </div>
                  Set status to <strong>Upcoming</strong> when this should appear in the Partner Hub.
                  Draft, completed, and cancelled events stay out of the Hub.
                </div>
              )}

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

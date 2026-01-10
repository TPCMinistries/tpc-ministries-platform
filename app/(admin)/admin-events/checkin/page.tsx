'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CheckCircle2,
  UserPlus,
  Users,
  Search,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  ArrowLeft,
  Trash2,
  User,
  Mail,
  Phone,
  QrCode,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Event {
  id: string
  title: string
  start_time: string
  capacity: number | null
}

interface CheckIn {
  id: string
  event_id: string
  member_id: string | null
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  checked_in_at: string
  check_in_method: string
  notes: string | null
  member: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url: string | null
  } | null
  checked_in_by_member: {
    first_name: string
    last_name: string
  } | null
}

interface Registration {
  member_id: string
  members: {
    first_name: string
    last_name: string
    email: string
  }
}

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url: string | null
}

export default function EventCheckinPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = searchParams.get('event_id')

  const [event, setEvent] = useState<Event | null>(null)
  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [checkinType, setCheckinType] = useState<'member' | 'guest'>('member')

  const [checkinCount, setCheckinCount] = useState(0)
  const [registrationCount, setRegistrationCount] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    member_id: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    notes: '',
  })

  useEffect(() => {
    if (eventId) {
      fetchCheckins()
      fetchMembers()
    }
  }, [eventId])

  const fetchCheckins = async () => {
    if (!eventId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/events/checkin?event_id=${eventId}`)
      const data = await res.json()

      setEvent(data.event || null)
      setCheckins(data.checkins || [])
      setCheckinCount(data.checkinCount || 0)
      setRegistrationCount(data.registrationCount || 0)
      setRegistrations(data.registrations || [])
    } catch (error) {
      console.error('Error fetching check-ins:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, avatar_url')
      .order('first_name')

    setMembers(data || [])
  }

  const handleCheckin = async () => {
    if (checkinType === 'member' && !formData.member_id) return
    if (checkinType === 'guest' && !formData.guest_name) return

    setSaving(true)
    try {
      const body: any = {
        event_id: eventId,
        check_in_method: 'manual',
        notes: formData.notes || undefined,
      }

      if (checkinType === 'member') {
        body.member_id = formData.member_id
      } else {
        body.guest_name = formData.guest_name
        body.guest_email = formData.guest_email || undefined
        body.guest_phone = formData.guest_phone || undefined
      }

      const res = await fetch('/api/admin/events/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowAddDialog(false)
        setFormData({
          member_id: '',
          guest_name: '',
          guest_email: '',
          guest_phone: '',
          notes: '',
        })
        fetchCheckins()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to check in')
      }
    } catch (error) {
      console.error('Error checking in:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveCheckin = async (id: string) => {
    if (!confirm('Remove this check-in?')) return

    try {
      await fetch(`/api/admin/events/checkin?id=${id}`, { method: 'DELETE' })
      fetchCheckins()
    } catch (error) {
      console.error('Error removing check-in:', error)
    }
  }

  const quickCheckin = async (memberId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/events/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          member_id: memberId,
          check_in_method: 'quick',
        }),
      })

      if (res.ok) {
        fetchCheckins()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to check in')
      }
    } catch (error) {
      console.error('Error checking in:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(dateString))
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString))
  }

  // Filter out already checked-in members from the dropdown
  const checkedInMemberIds = new Set(checkins.filter(c => c.member_id).map(c => c.member_id))
  const availableMembers = members.filter(m => !checkedInMemberIds.has(m.id))

  // Filter registrations to show who hasn't checked in yet
  const notCheckedIn = registrations.filter(r => !checkedInMemberIds.has(r.member_id))

  const filteredCheckins = searchQuery
    ? checkins.filter(c =>
        c.member
          ? `${c.member.first_name} ${c.member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
          : c.guest_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : checkins

  if (!eventId) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-navy mb-2">Select an Event</h1>
          <p className="text-gray-600 mb-4">Choose an event from the Events page to manage check-ins.</p>
          <Link href="/admin-events">
            <Button className="bg-navy hover:bg-navy/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Events
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin-events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8" />
              Event Check-in
            </h1>
            {event && (
              <div className="flex items-center gap-4 mt-1 text-gray-600">
                <span className="font-medium text-navy">{event.title}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.start_time)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(event.start_time)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchCheckins} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-navy hover:bg-navy/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Check In
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Check In Attendee</DialogTitle>
                  <DialogDescription>
                    Check in a member or add a guest to this event.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex gap-2">
                    <Button
                      variant={checkinType === 'member' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCheckinType('member')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Member
                    </Button>
                    <Button
                      variant={checkinType === 'guest' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCheckinType('guest')}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Guest
                    </Button>
                  </div>

                  {checkinType === 'member' ? (
                    <div>
                      <label className="text-sm font-medium">Select Member *</label>
                      <Select
                        value={formData.member_id}
                        onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Search members..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMembers.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.first_name} {m.last_name} ({m.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium">Guest Name *</label>
                        <Input
                          value={formData.guest_name}
                          onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input
                            type="email"
                            value={formData.guest_email}
                            onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                            placeholder="Email address"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <Input
                            value={formData.guest_phone}
                            onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any notes about this check-in..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCheckin}
                    disabled={saving || (checkinType === 'member' ? !formData.member_id : !formData.guest_name)}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Check In
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <div className="text-3xl font-bold text-green-600">{checkinCount}</div>
                  <p className="text-sm text-gray-600">Checked In</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="text-3xl font-bold text-blue-600">{registrationCount}</div>
                  <p className="text-sm text-gray-600">Registered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-orange-500" />
                <div>
                  <div className="text-3xl font-bold text-orange-600">{notCheckedIn.length}</div>
                  <p className="text-sm text-gray-600">Not Yet Checked In</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Check-ins List */}
          <div className="col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Checked In ({checkinCount})</CardTitle>
                    <CardDescription>Attendees who have checked in</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-navy" />
                  </div>
                ) : filteredCheckins.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No check-ins yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attendee</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCheckins.map((checkin) => (
                        <TableRow key={checkin.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {checkin.member ? (
                                <>
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage src={checkin.member.avatar_url || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {checkin.member.first_name[0]}
                                      {checkin.member.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {checkin.member.first_name} {checkin.member.last_name}
                                    </div>
                                    <div className="text-xs text-gray-500">{checkin.member.email}</div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{checkin.guest_name}</div>
                                    <div className="text-xs text-gray-500">
                                      {checkin.guest_email || 'Guest'}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTime(checkin.checked_in_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {checkin.check_in_method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveCheckin(checkin.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Check-in - Registered but not checked in */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Waiting to Check In
                </CardTitle>
                <CardDescription>Registered members not yet checked in</CardDescription>
              </CardHeader>
              <CardContent>
                {notCheckedIn.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500 opacity-50" />
                    <p className="text-sm">All registered members checked in!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {notCheckedIn.map((reg) => (
                      <div
                        key={reg.member_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {reg.members.first_name} {reg.members.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{reg.members.email}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => quickCheckin(reg.member_id)}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

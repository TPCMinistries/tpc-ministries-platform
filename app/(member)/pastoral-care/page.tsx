'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import {
  Heart,
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  Shield
} from 'lucide-react'

interface PastoralStaff {
  id: string
  title: string
  specialty: string[]
  bio?: string
  photo_url?: string
  is_available: boolean
  member?: {
    first_name: string
    last_name: string
  }
}

interface Appointment {
  id: string
  pastor_id: string
  appointment_type: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  location?: string
  meeting_link?: string
  status: string
  notes?: string
  pastor: PastoralStaff
}

export default function PastoralCarePage() {
  const [staff, setStaff] = useState<PastoralStaff[]>([])
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [selectedPastor, setSelectedPastor] = useState<PastoralStaff | null>(null)
  const [bookingForm, setBookingForm] = useState({
    appointment_type: 'counseling',
    scheduled_date: '',
    scheduled_time: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (member) {
      setMemberId(member.id)

      // Fetch my appointments
      const { data: appointments } = await supabase
        .from('counseling_appointments')
        .select(`
          *,
          pastor:pastoral_staff(
            *,
            member:members(first_name, last_name)
          )
        `)
        .eq('member_id', member.id)
        .order('scheduled_date', { ascending: true })

      if (appointments) {
        setMyAppointments(appointments as any)
      }
    }

    // Fetch pastoral staff
    const { data: staffData } = await supabase
      .from('pastoral_staff')
      .select(`
        *,
        member:members(first_name, last_name)
      `)
      .eq('is_available', true)

    if (staffData) {
      setStaff(staffData as any)
    }

    setLoading(false)
  }

  const bookAppointment = async () => {
    if (!memberId || !selectedPastor) return

    setSubmitting(true)
    const supabase = createClient()

    await supabase.from('counseling_appointments').insert({
      member_id: memberId,
      pastor_id: selectedPastor.id,
      appointment_type: bookingForm.appointment_type,
      scheduled_date: bookingForm.scheduled_date,
      scheduled_time: bookingForm.scheduled_time,
      notes: bookingForm.notes,
      status: 'pending'
    })

    setSubmitting(false)
    setShowBooking(false)
    setSelectedPastor(null)
    setBookingForm({
      appointment_type: 'counseling',
      scheduled_date: '',
      scheduled_time: '',
      notes: ''
    })
    fetchData()
  }

  const getAppointmentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      counseling: 'Counseling',
      prayer: 'Prayer Meeting',
      spiritual_direction: 'Spiritual Direction',
      marriage: 'Marriage Counseling',
      crisis: 'Crisis Support',
      general: 'General Meeting'
    }
    return types[type] || type
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const upcomingAppointments = myAppointments.filter(
    a => new Date(a.scheduled_date) >= new Date() && a.status !== 'cancelled'
  )
  const pastAppointments = myAppointments.filter(
    a => new Date(a.scheduled_date) < new Date() || a.status === 'completed'
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  // Booking Form View
  if (showBooking && selectedPastor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => { setShowBooking(false); setSelectedPastor(null); }}
            className="mb-6"
          >
            &larr; Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Pastor */}
              <div className="flex items-center gap-4 p-4 bg-navy/5 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center relative overflow-hidden">
                  {selectedPastor.photo_url ? (
                    <Image src={selectedPastor.photo_url} alt={`${selectedPastor.member?.first_name} ${selectedPastor.member?.last_name}`} fill className="object-cover" sizes="48px" />
                  ) : (
                    <User className="h-6 w-6 text-navy" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-navy">
                    {selectedPastor.member?.first_name} {selectedPastor.member?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{selectedPastor.title}</p>
                </div>
              </div>

              {/* Appointment Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type of Meeting
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'counseling', label: 'Counseling' },
                    { id: 'prayer', label: 'Prayer' },
                    { id: 'spiritual_direction', label: 'Spiritual Direction' },
                    { id: 'marriage', label: 'Marriage' },
                    { id: 'crisis', label: 'Crisis Support' },
                    { id: 'general', label: 'General' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setBookingForm({ ...bookingForm, appointment_type: type.id })}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        bookingForm.appointment_type === type.id
                          ? 'border-navy bg-navy/5 text-navy'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Preferred Date
                </label>
                <Input
                  type="date"
                  value={bookingForm.scheduled_date}
                  onChange={(e) => setBookingForm({ ...bookingForm, scheduled_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Preferred Time
                </label>
                <Input
                  type="time"
                  value={bookingForm.scheduled_time}
                  onChange={(e) => setBookingForm({ ...bookingForm, scheduled_time: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What would you like to discuss? (Optional)
                </label>
                <Textarea
                  placeholder="Share any context that might be helpful..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  This information is confidential
                </p>
              </div>

              <Button
                onClick={bookAppointment}
                disabled={submitting || !bookingForm.scheduled_date || !bookingForm.scheduled_time}
                className="w-full bg-navy hover:bg-navy/90"
              >
                {submitting ? 'Booking...' : 'Request Appointment'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Pastoral Care</h1>
          </div>
          <p className="text-gray-600">
            Connect with our pastoral team for prayer, counseling, and support
          </p>
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-navy mb-4">Upcoming Appointments</h2>
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <Card key={apt.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-navy" />
                        </div>
                        <div>
                          <p className="font-semibold text-navy">
                            {apt.pastor.member?.first_name} {apt.pastor.member?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{apt.pastor.title}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(apt.scheduled_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {apt.scheduled_time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusBadge(apt.status)}>
                          {apt.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-2">
                          {getAppointmentTypeLabel(apt.appointment_type)}
                        </p>
                      </div>
                    </div>
                    {apt.meeting_link && (
                      <div className="mt-4 pt-4 border-t">
                        <a
                          href={apt.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-navy hover:underline"
                        >
                          <Video className="h-4 w-4" />
                          Join Video Call
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pastoral Staff */}
        <div>
          <h2 className="text-lg font-semibold text-navy mb-4">Our Pastoral Team</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {staff.map((pastor) => (
              <Card key={pastor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center overflow-hidden relative">
                      {pastor.photo_url ? (
                        <Image src={pastor.photo_url} alt={`${pastor.member?.first_name} ${pastor.member?.last_name}`} fill className="object-cover" sizes="64px" />
                      ) : (
                        <User className="h-8 w-8 text-navy" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-navy">
                        {pastor.member?.first_name} {pastor.member?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{pastor.title}</p>
                      {pastor.specialty && pastor.specialty.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {pastor.specialty.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {pastor.bio && (
                    <p className="text-sm text-gray-600 mb-4">{pastor.bio}</p>
                  )}

                  <Button
                    onClick={() => { setSelectedPastor(pastor); setShowBooking(true); }}
                    className="w-full bg-navy hover:bg-navy/90"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-navy mb-4">Past Appointments</h2>
            <div className="space-y-2">
              {pastAppointments.slice(0, 5).map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-700">
                            {apt.pastor.member?.first_name} {apt.pastor.member?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getAppointmentTypeLabel(apt.appointment_type)} - {new Date(apt.scheduled_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact Options */}
        <Card className="mt-8 bg-gradient-to-r from-navy/5 to-gold/5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-navy mb-4">Need Immediate Support?</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Call Prayer Line
              </Button>
              <Button variant="outline" className="justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Submit Prayer Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Stethoscope,
  X,
} from 'lucide-react'
import Link from 'next/link'

interface Participant {
  id: string
  trip_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string | null
  passport_status: string
  passport_expiry: string | null
  visa_status: string
  vaccinations: any[]
  allergies: string | null
  medications: string | null
  medical_conditions: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  service_track: string | null
  ministry_role: string | null
  fundraising_goal: number
  application_status: string
  application_date: string
  notes: string | null
}

export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Participant[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTrack, setFilterTrack] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<Participant | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    const supabase = createClient()

    // Get the latest trip
    const { data: trip } = await supabase
      .from('kenya_trips')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (trip) {
      const { data } = await supabase
        .from('kenya_trip_participants')
        .select('*')
        .eq('trip_id', trip.id)
        .eq('application_status', 'pending')
        .order('application_date', { ascending: true })

      setApplications(data || [])
    }

    setLoading(false)
  }

  const handleDecision = async (id: string, status: 'approved' | 'declined' | 'waitlisted') => {
    setProcessing(true)
    const supabase = createClient()

    await supabase
      .from('kenya_trip_participants')
      .update({
        application_status: status,
        approval_date: status === 'approved' ? new Date().toISOString() : null,
        notes: reviewNotes || null,
      })
      .eq('id', id)

    setSelectedApplication(null)
    setReviewNotes('')
    setProcessing(false)
    fetchApplications()
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTrack = filterTrack === 'all' || app.service_track === filterTrack
    return matchesSearch && matchesTrack
  })

  const serviceTracks = ['medical', 'education', 'construction', 'evangelism', 'worship', 'admin']

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/kenya-command-center"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-navy">Application Review</h1>
            <p className="text-gray-600">Review and process Kenya trip applications</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600">{applications.length}</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Oldest Application</p>
                  <p className="text-xl font-bold text-navy">
                    {applications.length > 0
                      ? `${Math.floor((Date.now() - new Date(applications[0].application_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                      : 'N/A'}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-navy/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-green-600">
                    {applications.filter(a => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(a.application_date) > weekAgo
                    }).length}
                  </p>
                </div>
                <Users className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Button className="w-full bg-navy hover:bg-navy/90" onClick={fetchApplications}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Tracks</option>
            {serviceTracks.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Application Queue */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold text-navy mb-2">All Caught Up!</h3>
              <p>No pending applications to review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map(app => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center">
                      <span className="text-navy font-bold">
                        {app.first_name[0]}{app.last_name[0]}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-navy text-lg">
                          {app.first_name} {app.last_name}
                        </h3>
                        {app.service_track && (
                          <Badge variant="outline" className="capitalize">{app.service_track}</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {app.email}
                        </span>
                        {app.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {app.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Applied {new Date(app.application_date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className={`flex items-center gap-1 ${
                          app.passport_status === 'verified' ? 'text-green-600' :
                          app.passport_status === 'pending' ? 'text-yellow-600' :
                          'text-gray-500'
                        }`}>
                          <Shield className="h-4 w-4" />
                          Passport: {app.passport_status}
                        </span>
                        {app.medical_conditions && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <Stethoscope className="h-4 w-4" />
                            Medical conditions noted
                          </span>
                        )}
                        {!app.emergency_contact_name && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            Missing emergency contact
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleDecision(app.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-navy">Application Review</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" /> Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                  <div><span className="text-gray-500">Name:</span> <strong>{selectedApplication.first_name} {selectedApplication.last_name}</strong></div>
                  <div><span className="text-gray-500">Email:</span> {selectedApplication.email}</div>
                  <div><span className="text-gray-500">Phone:</span> {selectedApplication.phone || 'Not provided'}</div>
                  <div><span className="text-gray-500">Date of Birth:</span> {selectedApplication.date_of_birth ? new Date(selectedApplication.date_of_birth).toLocaleDateString() : 'Not provided'}</div>
                  <div><span className="text-gray-500">Service Track:</span> <span className="capitalize">{selectedApplication.service_track || 'Not selected'}</span></div>
                  <div><span className="text-gray-500">Ministry Role:</span> {selectedApplication.ministry_role || 'Not specified'}</div>
                </div>
              </div>

              {/* Travel Documents */}
              <div>
                <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Travel Documents
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="text-gray-500">Passport Status:</span>
                    <Badge className={`ml-2 ${
                      selectedApplication.passport_status === 'verified' ? 'bg-green-100 text-green-800' :
                      selectedApplication.passport_status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedApplication.passport_status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Passport Expiry:</span> {selectedApplication.passport_expiry ? new Date(selectedApplication.passport_expiry).toLocaleDateString() : 'Not provided'}
                  </div>
                  <div>
                    <span className="text-gray-500">Visa Status:</span>
                    <Badge className={`ml-2 ${
                      selectedApplication.visa_status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedApplication.visa_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedApplication.visa_status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Medical */}
              <div>
                <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" /> Medical Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div><span className="text-gray-500">Allergies:</span> {selectedApplication.allergies || 'None reported'}</div>
                  <div><span className="text-gray-500">Medications:</span> {selectedApplication.medications || 'None reported'}</div>
                  <div><span className="text-gray-500">Medical Conditions:</span> {selectedApplication.medical_conditions || 'None reported'}</div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5" /> Emergency Contact
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  {selectedApplication.emergency_contact_name ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div><span className="text-gray-500">Name:</span> {selectedApplication.emergency_contact_name}</div>
                      <div><span className="text-gray-500">Phone:</span> {selectedApplication.emergency_contact_phone}</div>
                      <div><span className="text-gray-500">Relationship:</span> {selectedApplication.emergency_contact_relationship}</div>
                    </div>
                  ) : (
                    <p className="text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Emergency contact not provided - require before approval
                    </p>
                  )}
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <h3 className="font-semibold text-navy mb-3">Review Notes</h3>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this application..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleDecision(selectedApplication.id, 'approved')}
                  disabled={processing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDecision(selectedApplication.id, 'waitlisted')}
                  disabled={processing}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Waitlist
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => handleDecision(selectedApplication.id, 'declined')}
                  disabled={processing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

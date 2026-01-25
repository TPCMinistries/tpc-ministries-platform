'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Stethoscope,
  DollarSign,
  ChevronLeft,
  RefreshCw,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Heart,
  Star,
  Plane,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Participant {
  id: string
  trip_id: string
  member_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  passport_number: string | null
  passport_expiry: string | null
  passport_status: string
  passport_photo_url: string | null
  visa_status: string
  vaccinations: any[]
  allergies: string | null
  medications: string | null
  medical_conditions: string | null
  dietary_restrictions: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  service_track: string | null
  ministry_role: string | null
  team_leader: boolean
  city_assignment: string | null
  fundraising_goal: number
  amount_raised: number
  payment_status: string
  scholarship_amount: number
  application_status: string
  application_date: string
  approval_date: string | null
  notes: string | null
}

export default function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Participant>>({})

  useEffect(() => {
    fetchParticipant()
  }, [resolvedParams.id])

  const fetchParticipant = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from('kenya_trip_participants')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (data) {
      setParticipant(data)
      setEditData(data)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!participant) return

    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('kenya_trip_participants')
      .update(editData)
      .eq('id', participant.id)

    if (!error) {
      setParticipant({ ...participant, ...editData })
      setEditing(false)
    }

    setSaving(false)
  }

  const updateField = (field: keyof Participant, value: any) => {
    setEditData({ ...editData, [field]: value })
  }

  const serviceTracks = [
    { value: 'medical', label: 'Medical' },
    { value: 'education', label: 'Education' },
    { value: 'construction', label: 'Construction' },
    { value: 'evangelism', label: 'Evangelism' },
    { value: 'worship', label: 'Worship' },
    { value: 'admin', label: 'Administration' },
  ]

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-[1200px] mx-auto text-center py-12">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-navy mb-2">Participant Not Found</h2>
          <Link href="/kenya-command-center">
            <Button className="mt-4">Back to Command Center</Button>
          </Link>
        </div>
      </div>
    )
  }

  const fundraisingPercent = participant.fundraising_goal > 0
    ? Math.round((participant.amount_raised / participant.fundraising_goal) * 100)
    : 0

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/kenya-command-center"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-navy">
                {participant.first_name} {participant.last_name}
              </h1>
              {participant.team_leader && (
                <Badge className="bg-gold/20 text-gold-dark">
                  <Star className="h-3 w-3 mr-1" /> Team Leader
                </Badge>
              )}
              <Badge className={`${
                participant.application_status === 'approved' ? 'bg-green-100 text-green-800' :
                participant.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                participant.application_status === 'waitlisted' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {participant.application_status}
              </Badge>
            </div>
            <p className="text-gray-600">{participant.email}</p>
          </div>
          <div className="flex gap-3">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => { setEditing(false); setEditData(participant); }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button className="bg-navy hover:bg-navy/90" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  {editing ? (
                    <Input
                      value={editData.first_name || ''}
                      onChange={(e) => updateField('first_name', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{participant.first_name}</p>
                  )}
                </div>
                <div>
                  <Label>Last Name</Label>
                  {editing ? (
                    <Input
                      value={editData.last_name || ''}
                      onChange={(e) => updateField('last_name', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">{participant.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Email</Label>
                {editing ? (
                  <Input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1">{participant.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  {editing ? (
                    <Input
                      value={editData.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">{participant.phone || '-'}</p>
                  )}
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  {editing ? (
                    <Input
                      type="date"
                      value={editData.date_of_birth || ''}
                      onChange={(e) => updateField('date_of_birth', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">
                      {participant.date_of_birth
                        ? new Date(participant.date_of_birth).toLocaleDateString()
                        : '-'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Travel Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Passport Status</Label>
                  {editing ? (
                    <select
                      value={editData.passport_status || 'pending'}
                      onChange={(e) => updateField('passport_status', e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="submitted">Submitted</option>
                      <option value="verified">Verified</option>
                      <option value="expired">Expired</option>
                    </select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={`${
                        participant.passport_status === 'verified' ? 'bg-green-100 text-green-800' :
                        participant.passport_status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        participant.passport_status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {participant.passport_status}
                      </Badge>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Passport Expiry</Label>
                  {editing ? (
                    <Input
                      type="date"
                      value={editData.passport_expiry || ''}
                      onChange={(e) => updateField('passport_expiry', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">
                      {participant.passport_expiry
                        ? new Date(participant.passport_expiry).toLocaleDateString()
                        : '-'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Visa Status</Label>
                {editing ? (
                  <select
                    value={editData.visa_status || 'not_started'}
                    onChange={(e) => updateField('visa_status', e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                  </select>
                ) : (
                  <div className="mt-1">
                    <Badge className={`${
                      participant.visa_status === 'approved' ? 'bg-green-100 text-green-800' :
                      participant.visa_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      participant.visa_status === 'denied' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {participant.visa_status.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" /> Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Allergies</Label>
                {editing ? (
                  <Textarea
                    value={editData.allergies || ''}
                    onChange={(e) => updateField('allergies', e.target.value)}
                    placeholder="List any allergies..."
                    rows={2}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1">{participant.allergies || 'None reported'}</p>
                )}
              </div>

              <div>
                <Label>Medications</Label>
                {editing ? (
                  <Textarea
                    value={editData.medications || ''}
                    onChange={(e) => updateField('medications', e.target.value)}
                    placeholder="List current medications..."
                    rows={2}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1">{participant.medications || 'None reported'}</p>
                )}
              </div>

              <div>
                <Label>Medical Conditions</Label>
                {editing ? (
                  <Textarea
                    value={editData.medical_conditions || ''}
                    onChange={(e) => updateField('medical_conditions', e.target.value)}
                    placeholder="List any medical conditions..."
                    rows={2}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1">{participant.medical_conditions || 'None reported'}</p>
                )}
              </div>

              <div>
                <Label>Dietary Restrictions</Label>
                {editing ? (
                  <Input
                    value={editData.dietary_restrictions || ''}
                    onChange={(e) => updateField('dietary_restrictions', e.target.value)}
                    placeholder="Any dietary restrictions..."
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1">{participant.dietary_restrictions || 'None'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" /> Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Contact Name</Label>
                {editing ? (
                  <Input
                    value={editData.emergency_contact_name || ''}
                    onChange={(e) => updateField('emergency_contact_name', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1">{participant.emergency_contact_name || '-'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  {editing ? (
                    <Input
                      value={editData.emergency_contact_phone || ''}
                      onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">{participant.emergency_contact_phone || '-'}</p>
                  )}
                </div>
                <div>
                  <Label>Relationship</Label>
                  {editing ? (
                    <Input
                      value={editData.emergency_contact_relationship || ''}
                      onChange={(e) => updateField('emergency_contact_relationship', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">{participant.emergency_contact_relationship || '-'}</p>
                  )}
                </div>
              </div>

              {!participant.emergency_contact_name && !editing && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Emergency contact required</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment & Role */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" /> Assignment & Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Service Track</Label>
                {editing ? (
                  <select
                    value={editData.service_track || ''}
                    onChange={(e) => updateField('service_track', e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="">Select track...</option>
                    {serviceTracks.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 capitalize">{participant.service_track || '-'}</p>
                )}
              </div>

              <div>
                <Label>Ministry Role</Label>
                {editing ? (
                  <Input
                    value={editData.ministry_role || ''}
                    onChange={(e) => updateField('ministry_role', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1">{participant.ministry_role || '-'}</p>
                )}
              </div>

              <div>
                <Label>City Assignment</Label>
                {editing ? (
                  <Input
                    value={editData.city_assignment || ''}
                    onChange={(e) => updateField('city_assignment', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1">{participant.city_assignment || '-'}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="team_leader"
                  checked={editing ? editData.team_leader : participant.team_leader}
                  onChange={(e) => editing && updateField('team_leader', e.target.checked)}
                  disabled={!editing}
                  className="rounded"
                />
                <Label htmlFor="team_leader">Team Leader</Label>
              </div>
            </CardContent>
          </Card>

          {/* Financial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Financial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fundraising Goal</Label>
                  {editing ? (
                    <Input
                      type="number"
                      value={editData.fundraising_goal || 0}
                      onChange={(e) => updateField('fundraising_goal', parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">${participant.fundraising_goal.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <Label>Amount Raised</Label>
                  {editing ? (
                    <Input
                      type="number"
                      value={editData.amount_raised || 0}
                      onChange={(e) => updateField('amount_raised', parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium">${participant.amount_raised.toLocaleString()}</p>
                  )}
                </div>
              </div>

              {/* Fundraising Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{fundraisingPercent}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      fundraisingPercent >= 100 ? 'bg-green-500' :
                      fundraisingPercent >= 50 ? 'bg-gold' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${Math.min(fundraisingPercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Status</Label>
                  {editing ? (
                    <select
                      value={editData.payment_status || 'pending'}
                      onChange={(e) => updateField('payment_status', e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={`${
                        participant.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        participant.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {participant.payment_status}
                      </Badge>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Scholarship Amount</Label>
                  {editing ? (
                    <Input
                      type="number"
                      value={editData.scholarship_amount || 0}
                      onChange={(e) => updateField('scholarship_amount', parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1">${participant.scholarship_amount.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Textarea
                  value={editData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Add any notes about this participant..."
                  rows={4}
                />
              ) : (
                <p className="text-gray-600">
                  {participant.notes || 'No notes added'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

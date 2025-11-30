'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Heart,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  MessageSquare,
  Video,
  MapPin,
  Save,
  X,
  Search,
  Filter,
} from 'lucide-react'

interface PastoralStaff {
  id: string
  member_id: string | null
  name: string
  title: string
  email: string
  phone: string | null
  bio: string | null
  photo_url: string | null
  specialties: string[]
  is_available: boolean
  created_at: string
}

interface Appointment {
  id: string
  member_id: string
  staff_id: string
  staff_name?: string
  member_name?: string
  member_email?: string
  appointment_type: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  location: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}

export default function AdminPastoralPage() {
  const [staff, setStaff] = useState<PastoralStaff[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'appointments' | 'staff'>('appointments')
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<PastoralStaff | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedThisMonth: 0,
    availableStaff: 0,
  })

  const [staffFormData, setStaffFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    bio: '',
    photo_url: '',
    specialties: '',
    is_available: true,
  })

  const appointmentTypes = ['counseling', 'prayer', 'marriage', 'grief', 'spiritual_direction', 'general']

  useEffect(() => {
    fetchStaff()
    fetchAppointments()
    fetchStats()
  }, [])

  const fetchStaff = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('pastoral_staff')
      .select('*')
      .order('name')

    if (!error && data) {
      setStaff(data)
    }
    setLoading(false)
  }

  const fetchAppointments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('pastoral_appointments')
      .select(`
        *,
        pastoral_staff(name),
        members(first_name, last_name, email)
      `)
      .order('scheduled_date', { ascending: true })

    if (!error && data) {
      setAppointments(data.map(a => ({
        ...a,
        staff_name: a.pastoral_staff?.name,
        member_name: a.members ? `${a.members.first_name} ${a.members.last_name}` : 'Unknown',
        member_email: a.members?.email
      })))
    }
  }

  const fetchStats = async () => {
    const supabase = createClient()

    const { count: totalAppointments } = await supabase
      .from('pastoral_appointments')
      .select('*', { count: 'exact', head: true })

    const { count: pendingAppointments } = await supabase
      .from('pastoral_appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { count: completedThisMonth } = await supabase
      .from('pastoral_appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('scheduled_date', startOfMonth)

    const { count: availableStaff } = await supabase
      .from('pastoral_staff')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true)

    setStats({
      totalAppointments: totalAppointments || 0,
      pendingAppointments: pendingAppointments || 0,
      completedThisMonth: completedThisMonth || 0,
      availableStaff: availableStaff || 0,
    })
  }

  const handleCreateStaff = async () => {
    const supabase = createClient()
    const payload = {
      ...staffFormData,
      specialties: staffFormData.specialties.split(',').map(s => s.trim()).filter(Boolean),
      photo_url: staffFormData.photo_url || null,
      phone: staffFormData.phone || null,
      bio: staffFormData.bio || null,
    }

    if (selectedStaff) {
      await supabase.from('pastoral_staff').update(payload).eq('id', selectedStaff.id)
    } else {
      await supabase.from('pastoral_staff').insert([payload])
    }

    fetchStaff()
    fetchStats()
    closeStaffModal()
  }

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Delete this pastoral staff member?')) return
    const supabase = createClient()
    await supabase.from('pastoral_staff').delete().eq('id', id)
    fetchStaff()
    fetchStats()
  }

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('pastoral_appointments').update({ status }).eq('id', id)
    fetchAppointments()
    fetchStats()
  }

  const openStaffEditModal = (staffMember: PastoralStaff) => {
    setSelectedStaff(staffMember)
    setStaffFormData({
      name: staffMember.name,
      title: staffMember.title,
      email: staffMember.email,
      phone: staffMember.phone || '',
      bio: staffMember.bio || '',
      photo_url: staffMember.photo_url || '',
      specialties: staffMember.specialties?.join(', ') || '',
      is_available: staffMember.is_available,
    })
    setShowStaffModal(true)
  }

  const closeStaffModal = () => {
    setShowStaffModal(false)
    setSelectedStaff(null)
    setStaffFormData({
      name: '',
      title: '',
      email: '',
      phone: '',
      bio: '',
      photo_url: '',
      specialties: '',
      is_available: true,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'counseling': return MessageSquare
      case 'prayer': return Heart
      case 'marriage': return Heart
      case 'grief': return Heart
      case 'spiritual_direction': return Heart
      default: return MessageSquare
    }
  }

  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    const matchesSearch = a.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.staff_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-navy mb-2">Pastoral Care</h1>
            <p className="text-gray-600">Manage appointments and pastoral staff</p>
          </div>
          {activeTab === 'staff' && (
            <Button onClick={() => setShowStaffModal(true)} className="bg-navy hover:bg-navy/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                  <p className="text-3xl font-bold text-navy">{stats.totalAppointments}</p>
                </div>
                <Calendar className="h-10 w-10 text-navy/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed This Month</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedThisMonth}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Staff</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.availableStaff}</p>
                </div>
                <User className="h-10 w-10 text-purple-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(['appointments', 'staff'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by member or staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredAppointments.map((apt) => {
                  const TypeIcon = getTypeIcon(apt.appointment_type)
                  return (
                    <Card key={apt.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="text-center min-w-[60px]">
                            <div className="text-2xl font-bold text-navy">
                              {new Date(apt.scheduled_date).getDate()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(apt.scheduled_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(apt.status)}`}>
                                {apt.status}
                              </span>
                              <span className="bg-navy/10 text-navy px-2 py-0.5 rounded text-xs capitalize">
                                {apt.appointment_type.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="font-semibold text-navy mb-1">{apt.member_name}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              with {apt.staff_name} at {apt.scheduled_time} ({apt.duration_minutes} min)
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span><MapPin className="h-3 w-3 inline mr-1" />{apt.location}</span>
                              {apt.member_email && (
                                <span><Mail className="h-3 w-3 inline mr-1" />{apt.member_email}</span>
                              )}
                            </div>
                            {apt.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">"{apt.notes}"</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {apt.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateAppointmentStatus(apt.id, 'confirmed')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateAppointmentStatus(apt.id, 'cancelled')}
                                  className="text-red-600 border-red-200"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {apt.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateAppointmentStatus(apt.id, 'completed')}
                                className="bg-navy hover:bg-navy/90"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {staff.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pastoral staff added yet</p>
                </CardContent>
              </Card>
            ) : (
              staff.map((s) => (
                <Card key={s.id} className={!s.is_available ? 'opacity-60' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {s.photo_url ? (
                        <img src={s.photo_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-navy/40" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-navy">{s.name}</h3>
                          {!s.is_available && (
                            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">Unavailable</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{s.title}</p>
                        <div className="space-y-1 text-sm text-gray-500">
                          <p><Mail className="h-3 w-3 inline mr-1" />{s.email}</p>
                          {s.phone && <p><Phone className="h-3 w-3 inline mr-1" />{s.phone}</p>}
                        </div>
                        {s.specialties && s.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {s.specialties.map((spec) => (
                              <span key={spec} className="bg-navy/10 text-navy px-2 py-0.5 rounded text-xs">
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button size="sm" variant="ghost" onClick={() => openStaffEditModal(s)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteStaff(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Staff Modal */}
        {showStaffModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy">
                  {selectedStaff ? 'Edit Staff Member' : 'Add Pastoral Staff'}
                </h2>
                <button onClick={closeStaffModal}><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={staffFormData.name}
                      onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                      placeholder="Pastor John Smith"
                    />
                  </div>
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={staffFormData.title}
                      onChange={(e) => setStaffFormData({ ...staffFormData, title: e.target.value })}
                      placeholder="Senior Pastor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={staffFormData.email}
                      onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={staffFormData.phone}
                      onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={staffFormData.bio}
                    onChange={(e) => setStaffFormData({ ...staffFormData, bio: e.target.value })}
                    rows={3}
                    placeholder="Brief bio..."
                  />
                </div>

                <div>
                  <Label>Specialties (comma-separated)</Label>
                  <Input
                    value={staffFormData.specialties}
                    onChange={(e) => setStaffFormData({ ...staffFormData, specialties: e.target.value })}
                    placeholder="marriage, grief, youth"
                  />
                </div>

                <div>
                  <Label>Photo URL</Label>
                  <Input
                    value={staffFormData.photo_url}
                    onChange={(e) => setStaffFormData({ ...staffFormData, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={staffFormData.is_available}
                    onChange={(e) => setStaffFormData({ ...staffFormData, is_available: e.target.checked })}
                  />
                  <span className="text-sm">Available for appointments</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleCreateStaff} className="flex-1 bg-navy hover:bg-navy/90">
                    <Save className="mr-2 h-4 w-4" />
                    {selectedStaff ? 'Update' : 'Add'} Staff
                  </Button>
                  <Button variant="outline" onClick={closeStaffModal}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

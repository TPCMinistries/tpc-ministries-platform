'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Plane,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Heart,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  User,
  Phone,
  Mail,
  Shield,
  Stethoscope,
  Briefcase,
  Home,
  BookOpen,
  Send,
  Star,
  Target,
  TrendingUp,
  CreditCard,
  Receipt,
  Building,
  Car,
  Coffee,
  Sun,
  Moon,
} from 'lucide-react'

// Types
interface Trip {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  status: string
  fundraising_goal: number
  participant_goal: number
  registration_deadline: string
}

interface Participant {
  id: string
  trip_id: string
  member_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  passport_status: string
  passport_expiry: string | null
  visa_status: string
  vaccinations: any[]
  allergies: string | null
  medications: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  service_track: string | null
  ministry_role: string | null
  team_leader: boolean
  fundraising_goal: number
  amount_raised: number
  payment_status: string
  application_status: string
  application_date: string
}

interface ItineraryItem {
  id: string
  trip_id: string
  day_number: number
  date: string
  title: string
  description: string
  location: string
  start_time: string
  end_time: string
  category: string
}

interface Flight {
  id: string
  trip_id: string
  flight_type: string
  direction: string
  airline: string
  flight_number: string
  departure_airport: string
  arrival_airport: string
  departure_datetime: string
  arrival_datetime: string
  booking_status: string
}

interface Lodging {
  id: string
  trip_id: string
  name: string
  city: string
  check_in_date: string
  check_out_date: string
  total_rooms: number
}

interface Contact {
  id: string
  trip_id: string
  name: string
  role: string
  organization: string
  phone: string
  email: string
  city: string
  is_primary: boolean
}

interface BudgetCategory {
  id: string
  trip_id: string
  name: string
  budgeted_amount: number
  spent_amount?: number
}

interface Expense {
  id: string
  trip_id: string
  category_id: string
  description: string
  amount: number
  expense_date: string
  status: string
  paid_by: string
}

interface Announcement {
  id: string
  trip_id: string
  title: string
  content: string
  priority: string
  target_audience: string
  publish_at: string
  is_pinned: boolean
}

interface Document {
  id: string
  trip_id: string
  name: string
  category: string
  file_url: string
  is_required: boolean
}

interface FAQ {
  id: string
  trip_id: string
  question: string
  answer: string
  category: string
}

interface DailyFocus {
  id: string
  trip_id: string
  focus_date: string
  phase: string
  theme: string
  scripture_reference: string
  scripture_text: string
  prayer_focus: string
  leadership_notes: string
}

interface Stats {
  totalParticipants: number
  approvedParticipants: number
  pendingApplications: number
  teamLeaders: number
  totalRaised: number
  fundraisingGoal: number
  passportsVerified: number
  visasApproved: number
  fullyPaid: number
  daysUntilTrip: number
}

type TabType = 'overview' | 'people' | 'itinerary' | 'budget' | 'comms' | 'prayer'

const serviceTracks = [
  { value: 'medical', label: 'Medical', icon: Stethoscope },
  { value: 'education', label: 'Education', icon: BookOpen },
  { value: 'construction', label: 'Construction', icon: Building },
  { value: 'evangelism', label: 'Evangelism', icon: Heart },
  { value: 'worship', label: 'Worship', icon: Star },
  { value: 'admin', label: 'Administration', icon: Briefcase },
]

export default function KenyaCommandCenter() {
  // Core state
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [trip, setTrip] = useState<Trip | null>(null)

  // Data state
  const [participants, setParticipants] = useState<Participant[]>([])
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [lodging, setLodging] = useState<Lodging[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [dailyFocus, setDailyFocus] = useState<DailyFocus[]>([])

  // Stats
  const [stats, setStats] = useState<Stats>({
    totalParticipants: 0,
    approvedParticipants: 0,
    pendingApplications: 0,
    teamLeaders: 0,
    totalRaised: 0,
    fundraisingGoal: 0,
    passportsVerified: 0,
    visasApproved: 0,
    fullyPaid: 0,
    daysUntilTrip: 0,
  })

  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTrack, setFilterTrack] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Modal states
  const [showParticipantModal, setShowParticipantModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showItineraryModal, setShowItineraryModal] = useState(false)
  const [showDailyFocusModal, setShowDailyFocusModal] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)

  // Form states
  const [newExpense, setNewExpense] = useState({
    category_id: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    paid_by: '',
    payment_method: '',
  })

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal',
    target_audience: 'all',
  })

  const [newDailyFocus, setNewDailyFocus] = useState({
    focus_date: '',
    phase: 'pre_trip',
    theme: '',
    scripture_reference: '',
    scripture_text: '',
    prayer_focus: '',
    leadership_notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()

    // Fetch trip
    const { data: tripData } = await supabase
      .from('kenya_trips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (tripData) {
      setTrip(tripData)

      // Fetch all related data in parallel
      const [
        participantsRes,
        itineraryRes,
        flightsRes,
        lodgingRes,
        contactsRes,
        budgetRes,
        expensesRes,
        announcementsRes,
        documentsRes,
        faqsRes,
        dailyFocusRes,
      ] = await Promise.all([
        supabase.from('kenya_trip_participants').select('*').eq('trip_id', tripData.id).order('last_name'),
        supabase.from('kenya_trip_itinerary').select('*').eq('trip_id', tripData.id).order('date').order('start_time'),
        supabase.from('kenya_trip_flights').select('*').eq('trip_id', tripData.id).order('departure_datetime'),
        supabase.from('kenya_trip_lodging').select('*').eq('trip_id', tripData.id).order('check_in_date'),
        supabase.from('kenya_trip_contacts').select('*').eq('trip_id', tripData.id).order('name'),
        supabase.from('kenya_trip_budget_categories').select('*').eq('trip_id', tripData.id).order('sort_order'),
        supabase.from('kenya_trip_expenses').select('*').eq('trip_id', tripData.id).order('expense_date', { ascending: false }),
        supabase.from('kenya_trip_announcements').select('*').eq('trip_id', tripData.id).order('publish_at', { ascending: false }),
        supabase.from('kenya_trip_documents').select('*').eq('trip_id', tripData.id).order('sort_order'),
        supabase.from('kenya_trip_faqs').select('*').eq('trip_id', tripData.id).order('sort_order'),
        supabase.from('kenya_trip_daily_focus').select('*').eq('trip_id', tripData.id).order('focus_date'),
      ])

      setParticipants(participantsRes.data || [])
      setItinerary(itineraryRes.data || [])
      setFlights(flightsRes.data || [])
      setLodging(lodgingRes.data || [])
      setContacts(contactsRes.data || [])
      setBudgetCategories(budgetRes.data || [])
      setExpenses(expensesRes.data || [])
      setAnnouncements(announcementsRes.data || [])
      setDocuments(documentsRes.data || [])
      setFaqs(faqsRes.data || [])
      setDailyFocus(dailyFocusRes.data || [])

      // Calculate stats
      const p = participantsRes.data || []
      const tripDate = new Date(tripData.start_date)
      const today = new Date()
      const daysUntil = Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      setStats({
        totalParticipants: p.length,
        approvedParticipants: p.filter(x => x.application_status === 'approved').length,
        pendingApplications: p.filter(x => x.application_status === 'pending').length,
        teamLeaders: p.filter(x => x.team_leader).length,
        totalRaised: p.reduce((sum, x) => sum + (x.amount_raised || 0), 0),
        fundraisingGoal: tripData.fundraising_goal || 0,
        passportsVerified: p.filter(x => x.passport_status === 'verified').length,
        visasApproved: p.filter(x => x.visa_status === 'approved').length,
        fullyPaid: p.filter(x => x.payment_status === 'paid').length,
        daysUntilTrip: daysUntil,
      })
    }

    setLoading(false)
  }

  // Calculate budget spent per category
  const getBudgetSpent = (categoryId: string) => {
    return expenses
      .filter(e => e.category_id === categoryId && ['approved', 'paid', 'reimbursed'].includes(e.status))
      .reduce((sum, e) => sum + e.amount, 0)
  }

  // Filter participants
  const filteredParticipants = participants.filter(p => {
    const matchesSearch =
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTrack = filterTrack === 'all' || p.service_track === filterTrack
    const matchesStatus = filterStatus === 'all' || p.application_status === filterStatus
    return matchesSearch && matchesTrack && matchesStatus
  })

  // Handle expense submission
  const handleAddExpense = async () => {
    if (!trip || !newExpense.description || !newExpense.amount) return

    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_expenses').insert({
      trip_id: trip.id,
      category_id: newExpense.category_id || null,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      expense_date: newExpense.expense_date,
      paid_by: newExpense.paid_by,
      payment_method: newExpense.payment_method,
      status: 'pending',
    })

    if (!error) {
      setShowExpenseModal(false)
      setNewExpense({
        category_id: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        paid_by: '',
        payment_method: '',
      })
      fetchData()
    }
  }

  // Handle announcement submission
  const handleAddAnnouncement = async () => {
    if (!trip || !newAnnouncement.title || !newAnnouncement.content) return

    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_announcements').insert({
      trip_id: trip.id,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      priority: newAnnouncement.priority,
      target_audience: newAnnouncement.target_audience,
    })

    if (!error) {
      setShowAnnouncementModal(false)
      setNewAnnouncement({ title: '', content: '', priority: 'normal', target_audience: 'all' })
      fetchData()
    }
  }

  // Handle daily focus submission
  const handleAddDailyFocus = async () => {
    if (!trip || !newDailyFocus.focus_date || !newDailyFocus.theme) return

    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_daily_focus').insert({
      trip_id: trip.id,
      ...newDailyFocus,
    })

    if (!error) {
      setShowDailyFocusModal(false)
      setNewDailyFocus({
        focus_date: '',
        phase: 'pre_trip',
        theme: '',
        scripture_reference: '',
        scripture_text: '',
        prayer_focus: '',
        leadership_notes: '',
      })
      fetchData()
    }
  }

  // Handle participant status update
  const updateParticipantStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_participants').update({
      application_status: status,
      approval_date: status === 'approved' ? new Date().toISOString() : null
    }).eq('id', id)
    fetchData()
  }

  // Handle expense approval
  const updateExpenseStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_expenses').update({ status }).eq('id', id)
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-[1800px] mx-auto text-center py-12">
          <Plane className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-navy mb-2">No Trip Found</h2>
          <p className="text-gray-600">Create a Kenya trip in the database to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-navy">{trip.name}</h1>
              <Badge className={`${
                trip.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                trip.status === 'registration_open' ? 'bg-green-100 text-green-800' :
                trip.status === 'active' ? 'bg-gold text-navy' :
                'bg-gray-100 text-gray-800'
              }`}>
                {trip.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-gray-600">
              {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -
              {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {stats.daysUntilTrip > 0 && (
                <span className="ml-2 text-navy font-medium">({stats.daysUntilTrip} days away)</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-6 mb-8">
          <Card className="bg-gradient-to-br from-navy to-navy-800 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Team Size</p>
                  <p className="text-3xl font-bold">{stats.approvedParticipants}</p>
                  <p className="text-xs text-white/50">of {trip.participant_goal} goal</p>
                </div>
                <Users className="h-10 w-10 text-white/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fundraising</p>
                  <p className="text-3xl font-bold text-gold">${(stats.totalRaised / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-gray-500">{((stats.totalRaised / stats.fundraisingGoal) * 100).toFixed(0)}% of goal</p>
                </div>
                <DollarSign className="h-10 w-10 text-gold/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Passports</p>
                  <p className="text-3xl font-bold text-green-600">{stats.passportsVerified}</p>
                  <p className="text-xs text-gray-500">verified</p>
                </div>
                <Shield className="h-10 w-10 text-green-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Visas</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.visasApproved}</p>
                  <p className="text-xs text-gray-500">approved</p>
                </div>
                <FileText className="h-10 w-10 text-blue-600/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fully Paid</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.fullyPaid}</p>
                </div>
                <CreditCard className="h-10 w-10 text-purple-600/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {([
            { key: 'overview', label: 'Overview', icon: Target },
            { key: 'people', label: 'People', icon: Users },
            { key: 'itinerary', label: 'Itinerary', icon: Calendar },
            { key: 'budget', label: 'Budget', icon: DollarSign },
            { key: 'comms', label: 'Comms', icon: MessageSquare },
            { key: 'prayer', label: 'Prayer', icon: Heart },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============== OVERVIEW TAB ============== */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle>Application Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'pending', label: 'Pending Review', color: 'bg-yellow-500' },
                    { status: 'approved', label: 'Approved', color: 'bg-green-500' },
                    { status: 'waitlisted', label: 'Waitlisted', color: 'bg-blue-500' },
                    { status: 'declined', label: 'Declined', color: 'bg-red-500' },
                  ].map(({ status, label, color }) => {
                    const count = participants.filter(p => p.application_status === status).length
                    const percent = stats.totalParticipants > 0 ? (count / stats.totalParticipants * 100) : 0
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{label}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Fundraising Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Fundraising Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-navy">${stats.totalRaised.toLocaleString()}</p>
                  <p className="text-gray-600">of ${stats.fundraisingGoal.toLocaleString()} goal</p>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                    style={{ width: `${Math.min((stats.totalRaised / stats.fundraisingGoal) * 100, 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-bold text-navy">{stats.fullyPaid}</p>
                    <p className="text-gray-600">Fully Paid</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-bold text-yellow-600">{participants.filter(p => p.payment_status === 'partial').length}</p>
                    <p className="text-gray-600">Partial</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-bold text-red-600">{participants.filter(p => p.payment_status === 'pending').length}</p>
                    <p className="text-gray-600">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Tracks */}
            <Card>
              <CardHeader>
                <CardTitle>Service Tracks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceTracks.map(track => {
                    const count = participants.filter(p => p.service_track === track.value && p.application_status === 'approved').length
                    return (
                      <div key={track.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <track.icon className="h-5 w-5 text-navy" />
                        <span className="flex-1">{track.label}</span>
                        <span className="font-bold text-navy">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Alerts & Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.pendingApplications > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="flex-1 text-sm">{stats.pendingApplications} applications need review</span>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('people')}>Review</Button>
                  </div>
                )}
                {participants.filter(p => {
                  if (!p.passport_expiry) return false
                  const expiry = new Date(p.passport_expiry)
                  const tripEnd = new Date(trip.end_date)
                  tripEnd.setMonth(tripEnd.getMonth() + 6)
                  return expiry < tripEnd
                }).length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="flex-1 text-sm">Passport expiry issues detected</span>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('people')}>View</Button>
                  </div>
                )}
                {expenses.filter(e => e.status === 'pending').length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    <span className="flex-1 text-sm">{expenses.filter(e => e.status === 'pending').length} expenses pending approval</span>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('budget')}>Review</Button>
                  </div>
                )}
                {stats.pendingApplications === 0 && expenses.filter(e => e.status === 'pending').length === 0 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="flex-1 text-sm">All caught up! No pending items.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Announcements */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Announcements</CardTitle>
                <Button size="sm" onClick={() => setShowAnnouncementModal(true)}>
                  <Plus className="h-4 w-4 mr-1" /> New
                </Button>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No announcements yet</p>
                ) : (
                  <div className="space-y-3">
                    {announcements.slice(0, 3).map(ann => (
                      <div key={ann.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          ann.priority === 'urgent' ? 'bg-red-500' :
                          ann.priority === 'high' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-navy">{ann.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{ann.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(ann.publish_at).toLocaleDateString()} • {ann.target_audience}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============== PEOPLE TAB ============== */}
        {activeTab === 'people' && (
          <>
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
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            {/* Participants Table */}
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Track</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Passport</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Visa</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Fundraising</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Payment</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map((p) => {
                      const passportAlert = p.passport_expiry && (() => {
                        const expiry = new Date(p.passport_expiry)
                        const tripEnd = new Date(trip.end_date)
                        tripEnd.setMonth(tripEnd.getMonth() + 6)
                        return expiry < tripEnd
                      })()
                      const fundraisingPercent = p.fundraising_goal > 0
                        ? Math.round((p.amount_raised / p.fundraising_goal) * 100)
                        : 0

                      return (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center">
                                <span className="text-navy font-medium">
                                  {p.first_name[0]}{p.last_name[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-navy flex items-center gap-2">
                                  {p.first_name} {p.last_name}
                                  {p.team_leader && (
                                    <Badge className="bg-gold/20 text-gold-dark text-xs">Leader</Badge>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">{p.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm capitalize">{p.service_track || '-'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              p.passport_status === 'verified' ? 'bg-green-100 text-green-800' :
                              passportAlert ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {p.passport_status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              p.visa_status === 'approved' ? 'bg-green-100 text-green-800' :
                              p.visa_status === 'denied' ? 'bg-red-100 text-red-800' :
                              p.visa_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {p.visa_status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="w-20">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{fundraisingPercent}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              p.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                              p.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {p.payment_status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              p.application_status === 'approved' ? 'bg-green-100 text-green-800' :
                              p.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              p.application_status === 'waitlisted' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {p.application_status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedParticipant(p)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {p.application_status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600"
                                    onClick={() => updateParticipantStatus(p.id, 'approved')}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600"
                                    onClick={() => updateParticipantStatus(p.id, 'declined')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filteredParticipants.length === 0 && (
                  <div className="py-12 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No participants found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ============== ITINERARY TAB ============== */}
        {activeTab === 'itinerary' && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Schedule */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Trip Schedule</CardTitle>
                <Button size="sm" onClick={() => setShowItineraryModal(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </CardHeader>
              <CardContent>
                {itinerary.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No itinerary items yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.from(new Set(itinerary.map(i => i.date))).map(date => (
                      <div key={date} className="border rounded-lg overflow-hidden">
                        <div className="bg-navy text-white px-4 py-2 font-medium">
                          Day {itinerary.find(i => i.date === date)?.day_number} - {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="divide-y">
                          {itinerary.filter(i => i.date === date).map(item => (
                            <div key={item.id} className="flex items-start gap-4 p-4">
                              <div className="w-16 text-sm text-gray-500">
                                {item.start_time?.slice(0, 5)}
                              </div>
                              <div className={`w-2 h-2 rounded-full mt-1.5 ${
                                item.category === 'travel' ? 'bg-blue-500' :
                                item.category === 'ministry' ? 'bg-green-500' :
                                item.category === 'meals' ? 'bg-yellow-500' :
                                item.category === 'meeting' ? 'bg-purple-500' :
                                'bg-gray-400'
                              }`} />
                              <div className="flex-1">
                                <p className="font-medium text-navy">{item.title}</p>
                                {item.location && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {item.location}
                                  </p>
                                )}
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flights & Lodging */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" /> Flights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {flights.length === 0 ? (
                    <p className="text-gray-500 text-sm">No flights added</p>
                  ) : (
                    <div className="space-y-3">
                      {flights.map(f => (
                        <div key={f.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{f.airline} {f.flight_number}</span>
                            <Badge variant="outline" className="text-xs">{f.direction}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {f.departure_airport} → {f.arrival_airport}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(f.departure_datetime).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" /> Lodging
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lodging.length === 0 ? (
                    <p className="text-gray-500 text-sm">No lodging added</p>
                  ) : (
                    <div className="space-y-3">
                      {lodging.map(l => (
                        <div key={l.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{l.name}</p>
                          <p className="text-sm text-gray-600">{l.city}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(l.check_in_date).toLocaleDateString()} - {new Date(l.check_out_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" /> Local Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contacts.length === 0 ? (
                    <p className="text-gray-500 text-sm">No contacts added</p>
                  ) : (
                    <div className="space-y-3">
                      {contacts.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-navy" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.role} • {c.city}</p>
                          </div>
                          {c.is_primary && (
                            <Star className="h-4 w-4 text-gold" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============== BUDGET TAB ============== */}
        {activeTab === 'budget' && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Budget Categories */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Budget Overview</CardTitle>
                <Button size="sm" onClick={() => setShowExpenseModal(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Expense
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetCategories.map(cat => {
                    const spent = getBudgetSpent(cat.id)
                    const percent = cat.budgeted_amount > 0 ? (spent / cat.budgeted_amount) * 100 : 0
                    const isOverBudget = percent > 100

                    return (
                      <div key={cat.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{cat.name}</span>
                          <span className={isOverBudget ? 'text-red-600' : 'text-gray-600'}>
                            ${spent.toLocaleString()} / ${cat.budgeted_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverBudget ? 'bg-red-500' :
                              percent > 80 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Budget Summary */}
                <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-navy">
                      ${budgetCategories.reduce((sum, c) => sum + c.budgeted_amount, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Budget</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ${expenses.filter(e => ['approved', 'paid', 'reimbursed'].includes(e.status)).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gold">
                      ${(budgetCategories.reduce((sum, c) => sum + c.budgeted_amount, 0) -
                         expenses.filter(e => ['approved', 'paid', 'reimbursed'].includes(e.status)).reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No expenses recorded</p>
                ) : (
                  <div className="space-y-3">
                    {expenses.slice(0, 10).map(e => (
                      <div key={e.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{e.description}</p>
                          <p className="text-xs text-gray-500">{new Date(e.expense_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-navy">${e.amount}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            e.status === 'approved' || e.status === 'paid' ? 'bg-green-100 text-green-800' :
                            e.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {e.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            {expenses.filter(e => e.status === 'pending').length > 0 && (
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {expenses.filter(e => e.status === 'pending').map(e => (
                      <div key={e.id} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{e.description}</span>
                          <span className="font-bold text-navy">${e.amount}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          {e.paid_by} • {new Date(e.expense_date).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => updateExpenseStatus(e.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600 border-red-600"
                            onClick={() => updateExpenseStatus(e.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ============== COMMS TAB ============== */}
        {activeTab === 'comms' && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Announcements */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Announcements</CardTitle>
                <Button size="sm" onClick={() => setShowAnnouncementModal(true)}>
                  <Plus className="h-4 w-4 mr-1" /> New Announcement
                </Button>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No announcements yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map(ann => (
                      <div key={ann.id} className={`border rounded-lg p-4 ${ann.is_pinned ? 'border-gold bg-gold/5' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            ann.priority === 'urgent' ? 'bg-red-500' :
                            ann.priority === 'high' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-navy">{ann.title}</h4>
                              {ann.is_pinned && <Star className="h-4 w-4 text-gold" />}
                              <Badge variant="outline" className="text-xs">{ann.target_audience}</Badge>
                            </div>
                            <p className="text-gray-600">{ann.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(ann.publish_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents & FAQs */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <p className="text-gray-500 text-sm">No documents uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map(doc => (
                        <a
                          key={doc.id}
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-navy" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.category}</p>
                          </div>
                          {doc.is_required && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>FAQs</CardTitle>
                </CardHeader>
                <CardContent>
                  {faqs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No FAQs added</p>
                  ) : (
                    <div className="space-y-3">
                      {faqs.slice(0, 5).map(faq => (
                        <div key={faq.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-sm text-navy">{faq.question}</p>
                          <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============== PRAYER TAB ============== */}
        {activeTab === 'prayer' && (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daily Prayer Focus</CardTitle>
                <Button size="sm" onClick={() => setShowDailyFocusModal(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Day
                </Button>
              </CardHeader>
              <CardContent>
                {dailyFocus.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No prayer focus days added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dailyFocus.map(df => (
                      <div key={df.id} className="border rounded-lg overflow-hidden">
                        <div className={`px-4 py-2 font-medium flex items-center gap-2 ${
                          df.phase === 'pre_trip' ? 'bg-blue-50 text-blue-800' :
                          df.phase === 'during_trip' ? 'bg-green-50 text-green-800' :
                          'bg-purple-50 text-purple-800'
                        }`}>
                          {df.phase === 'pre_trip' ? <Clock className="h-4 w-4" /> :
                           df.phase === 'during_trip' ? <Sun className="h-4 w-4" /> :
                           <Moon className="h-4 w-4" />}
                          {new Date(df.focus_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <h4 className="font-semibold text-navy text-lg">{df.theme}</h4>
                          </div>
                          {df.scripture_reference && (
                            <div className="bg-gold/10 p-3 rounded-lg border-l-4 border-gold">
                              <p className="font-medium text-gold-dark">{df.scripture_reference}</p>
                              {df.scripture_text && (
                                <p className="text-sm text-gray-700 mt-1 italic">"{df.scripture_text}"</p>
                              )}
                            </div>
                          )}
                          {df.prayer_focus && (
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Prayer Focus:</p>
                              <p className="text-gray-700">{df.prayer_focus}</p>
                            </div>
                          )}
                          {df.leadership_notes && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-gray-500 mb-1">Leadership Notes:</p>
                              <p className="text-sm text-gray-600">{df.leadership_notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prayer Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prayer Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">Pre-Trip Days</span>
                      <span className="font-bold text-blue-800">
                        {dailyFocus.filter(d => d.phase === 'pre_trip').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">During Trip Days</span>
                      <span className="font-bold text-green-800">
                        {dailyFocus.filter(d => d.phase === 'during_trip').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm">Post-Trip Days</span>
                      <span className="font-bold text-purple-800">
                        {dailyFocus.filter(d => d.phase === 'post_trip').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Leaders</CardTitle>
                </CardHeader>
                <CardContent>
                  {participants.filter(p => p.team_leader).length === 0 ? (
                    <p className="text-gray-500 text-sm">No team leaders assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {participants.filter(p => p.team_leader).map(leader => (
                        <div key={leader.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                            <Star className="h-5 w-5 text-gold" />
                          </div>
                          <div>
                            <p className="font-medium">{leader.first_name} {leader.last_name}</p>
                            <p className="text-xs text-gray-500 capitalize">{leader.service_track}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* ============== MODALS ============== */}

      {/* Participant Detail Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-navy">Participant Details</h2>
              <button onClick={() => setSelectedParticipant(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-navy mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Name:</span> {selectedParticipant.first_name} {selectedParticipant.last_name}</div>
                  <div><span className="text-gray-500">Email:</span> {selectedParticipant.email}</div>
                  <div><span className="text-gray-500">Phone:</span> {selectedParticipant.phone || '-'}</div>
                  <div><span className="text-gray-500">Track:</span> {selectedParticipant.service_track || '-'}</div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-navy mb-3">Travel Documents</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Passport Status:</span>
                    <Badge className="ml-2">{selectedParticipant.passport_status}</Badge>
                  </div>
                  <div><span className="text-gray-500">Passport Expiry:</span> {selectedParticipant.passport_expiry || '-'}</div>
                  <div>
                    <span className="text-gray-500">Visa Status:</span>
                    <Badge className="ml-2">{selectedParticipant.visa_status}</Badge>
                  </div>
                </div>
              </div>

              {/* Medical */}
              <div>
                <h3 className="font-semibold text-navy mb-3">Medical Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Allergies:</span> {selectedParticipant.allergies || 'None'}</div>
                  <div><span className="text-gray-500">Medications:</span> {selectedParticipant.medications || 'None'}</div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="font-semibold text-navy mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Name:</span> {selectedParticipant.emergency_contact_name || '-'}</div>
                  <div><span className="text-gray-500">Phone:</span> {selectedParticipant.emergency_contact_phone || '-'}</div>
                </div>
              </div>

              {/* Financial */}
              <div>
                <h3 className="font-semibold text-navy mb-3">Financial</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Fundraising Goal:</span> ${selectedParticipant.fundraising_goal}</div>
                  <div><span className="text-gray-500">Amount Raised:</span> ${selectedParticipant.amount_raised}</div>
                  <div>
                    <span className="text-gray-500">Payment Status:</span>
                    <Badge className="ml-2">{selectedParticipant.payment_status}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-navy">Add Expense</h2>
              <button onClick={() => setShowExpenseModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Category</Label>
                <select
                  value={newExpense.category_id}
                  onChange={(e) => setNewExpense({ ...newExpense, category_id: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                >
                  <option value="">Select category...</option>
                  {budgetCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="What was purchased?"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newExpense.expense_date}
                    onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Paid By</Label>
                <Input
                  value={newExpense.paid_by}
                  onChange={(e) => setNewExpense({ ...newExpense, paid_by: e.target.value })}
                  placeholder="Who made this purchase?"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowExpenseModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-navy hover:bg-navy/90" onClick={handleAddExpense}>
                  Add Expense
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-navy">New Announcement</h2>
              <button onClick={() => setShowAnnouncementModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Announcement title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Write your announcement..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <Label>Audience</Label>
                  <select
                    value={newAnnouncement.target_audience}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target_audience: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="all">All Team</option>
                    <option value="leaders">Leaders Only</option>
                    {serviceTracks.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAnnouncementModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-navy hover:bg-navy/90" onClick={handleAddAnnouncement}>
                  Post Announcement
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Daily Focus Modal */}
      {showDailyFocusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-navy">Add Prayer Focus Day</h2>
              <button onClick={() => setShowDailyFocusModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newDailyFocus.focus_date}
                    onChange={(e) => setNewDailyFocus({ ...newDailyFocus, focus_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phase</Label>
                  <select
                    value={newDailyFocus.phase}
                    onChange={(e) => setNewDailyFocus({ ...newDailyFocus, phase: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    <option value="pre_trip">Pre-Trip</option>
                    <option value="during_trip">During Trip</option>
                    <option value="post_trip">Post-Trip</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Theme</Label>
                <Input
                  value={newDailyFocus.theme}
                  onChange={(e) => setNewDailyFocus({ ...newDailyFocus, theme: e.target.value })}
                  placeholder="e.g., Unity, Boldness, Healing"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Scripture Reference</Label>
                <Input
                  value={newDailyFocus.scripture_reference}
                  onChange={(e) => setNewDailyFocus({ ...newDailyFocus, scripture_reference: e.target.value })}
                  placeholder="e.g., Philippians 4:13"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Scripture Text</Label>
                <Textarea
                  value={newDailyFocus.scripture_text}
                  onChange={(e) => setNewDailyFocus({ ...newDailyFocus, scripture_text: e.target.value })}
                  placeholder="The verse text..."
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Prayer Focus</Label>
                <Textarea
                  value={newDailyFocus.prayer_focus}
                  onChange={(e) => setNewDailyFocus({ ...newDailyFocus, prayer_focus: e.target.value })}
                  placeholder="What to pray for today..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Leadership Notes (optional)</Label>
                <Textarea
                  value={newDailyFocus.leadership_notes}
                  onChange={(e) => setNewDailyFocus({ ...newDailyFocus, leadership_notes: e.target.value })}
                  placeholder="Notes for team leaders..."
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowDailyFocusModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-navy hover:bg-navy/90" onClick={handleAddDailyFocus}>
                  Add Focus Day
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

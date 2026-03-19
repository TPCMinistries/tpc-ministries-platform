'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Trip, Participant, ItineraryItem, Flight, Lodging, Contact,
  BudgetCategory, Expense, Announcement, Document, FAQ, DailyFocus, Stats,
  PackingItem, PackingStatus, ConferenceSession, LogisticsMatrix,
  MediaCalendarItem, MediaAssignment, ShotListItem, WaitingListEntry,
  ActionItem, TrackDetail, TrackMaterial, AdminNote, SupportRole,
  KenyaInvite
} from './types'

export function useKenyaData() {
  // Core state
  const [loading, setLoading] = useState(true)
  const [trip, setTrip] = useState<Trip | null>(null)

  // Existing data state
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

  // Phase 2/3 data state
  const [packingItems, setPackingItems] = useState<PackingItem[]>([])
  const [packingStatuses, setPackingStatuses] = useState<PackingStatus[]>([])
  const [conferenceSessions, setConferenceSessions] = useState<ConferenceSession[]>([])
  const [logisticsMatrix, setLogisticsMatrix] = useState<LogisticsMatrix[]>([])
  const [mediaCalendar, setMediaCalendar] = useState<MediaCalendarItem[]>([])
  const [mediaAssignments, setMediaAssignments] = useState<MediaAssignment[]>([])
  const [shotList, setShotList] = useState<ShotListItem[]>([])
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([])

  // Phase 4 data state (migration 045)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [trackDetails, setTrackDetails] = useState<TrackDetail[]>([])
  const [trackMaterials, setTrackMaterials] = useState<TrackMaterial[]>([])
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([])

  // Phase 5 data state (migration 047)
  const [supportRoles, setSupportRoles] = useState<SupportRole[]>([])

  // Kenya invite state
  const [kenyaInvites, setKenyaInvites] = useState<KenyaInvite[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Check-in data
  const [todayCheckins, setTodayCheckins] = useState<{ participant_id: string; checkin_date: string }[]>([])

  // Save indicator
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showDailyFocusModal, setShowDailyFocusModal] = useState(false)
  const [showItineraryModal, setShowItineraryModal] = useState(false)
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

  // Save indicator helper
  const flashSave = useCallback((success: boolean = true) => {
    setSaveStatus(success ? 'saved' : 'error')
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: tripData } = await supabase
      .from('kenya_trips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (tripData) {
      setTrip(tripData)

      // Fetch all existing data in parallel
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

      // Fetch packing tables
      try {
        const [packingItemsRes, packingStatusRes] = await Promise.all([
          supabase.from('kenya_trip_packing_items').select('*').eq('trip_id', tripData.id).order('sort_order'),
          supabase.from('kenya_trip_packing_status').select('*'),
        ])
        setPackingItems(packingItemsRes.data || [])
        setPackingStatuses(packingStatusRes.data || [])
      } catch { /* tables may not exist yet */ }

      // Fetch phase 2/3 tables
      try {
        const [confRes, logRes, mcRes, maRes, slRes, wlRes] = await Promise.all([
          supabase.from('kenya_trip_conference_sessions').select('*').eq('trip_id', tripData.id).order('conference_date').order('start_time'),
          supabase.from('kenya_trip_logistics_matrix').select('*').eq('trip_id', tripData.id).order('day_date'),
          supabase.from('kenya_trip_media_calendar').select('*').eq('trip_id', tripData.id).order('post_date'),
          supabase.from('kenya_trip_media_assignments').select('*').eq('trip_id', tripData.id).order('day_date'),
          supabase.from('kenya_trip_shot_list').select('*').eq('trip_id', tripData.id).order('priority'),
          supabase.from('kenya_trip_waiting_list').select('*').eq('trip_id', tripData.id).order('created_at', { ascending: false }),
        ])
        setConferenceSessions(confRes.data || [])
        setLogisticsMatrix(logRes.data || [])
        setMediaCalendar(mcRes.data || [])
        setMediaAssignments(maRes.data || [])
        setShotList(slRes.data || [])
        setWaitingList(wlRes.data || [])
      } catch { /* tables may not exist yet */ }

      // Fetch phase 4 tables (migration 045)
      try {
        const [actionRes, trackRes, materialRes, notesRes] = await Promise.all([
          supabase.from('kenya_trip_action_items').select('*').eq('trip_id', tripData.id).order('sort_order'),
          supabase.from('kenya_trip_track_details').select('*').eq('trip_id', tripData.id).order('track'),
          supabase.from('kenya_trip_track_materials').select('*').order('sort_order'),
          supabase.from('kenya_trip_admin_notes').select('*').eq('trip_id', tripData.id).order('sort_order'),
        ])
        setActionItems(actionRes.data || [])
        setTrackDetails(trackRes.data || [])
        setTrackMaterials(materialRes.data || [])
        setAdminNotes(notesRes.data || [])
      } catch { /* tables may not exist yet */ }

      // Fetch phase 5 tables (migration 047)
      try {
        const supportRes = await supabase
          .from('kenya_trip_support_roles')
          .select('*')
          .eq('trip_id', tripData.id)
          .order('sort_order')
        setSupportRoles(supportRes.data || [])
      } catch { /* table may not exist yet */ }

      // Fetch today's check-ins
      try {
        const today = new Date().toISOString().split('T')[0]
        const checkinRes = await supabase
          .from('kenya_trip_checkins')
          .select('participant_id, checkin_date')
          .eq('trip_id', tripData.id)
          .eq('checkin_date', today)
        setTodayCheckins(checkinRes.data || [])
      } catch { /* table may not exist yet */ }

      // Fetch Kenya invites
      try {
        const inviteRes = await fetch('/api/admin/kenya-invites')
        if (inviteRes.ok) {
          const inviteData = await inviteRes.json()
          setKenyaInvites(inviteData)
        }
      } catch { /* invite data is supplementary */ }

      // Calculate stats
      const p = participantsRes.data || []
      const tripDate = new Date(tripData.start_date)
      const today = new Date()
      const daysUntil = Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      setStats({
        totalParticipants: p.length,
        approvedParticipants: p.filter((x: any) => x.application_status === 'approved').length,
        pendingApplications: p.filter((x: any) => x.application_status === 'pending').length,
        teamLeaders: p.filter((x: any) => x.team_leader).length,
        totalRaised: p.reduce((sum: number, x: any) => sum + (x.amount_raised || 0), 0),
        fundraisingGoal: tripData.fundraising_goal || 0,
        passportsVerified: p.filter((x: any) => x.passport_status === 'verified').length,
        visasApproved: p.filter((x: any) => x.visa_status === 'approved').length,
        fullyPaid: p.filter((x: any) => x.payment_status === 'paid').length,
        daysUntilTrip: daysUntil,
      })
    }

    setLoading(false)
  }, [])

  // Calculate budget spent per category
  const getBudgetSpent = useCallback((categoryId: string) => {
    return expenses
      .filter(e => e.category_id === categoryId && ['approved', 'paid', 'reimbursed'].includes(e.status))
      .reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  // CSV export
  const exportCSV = useCallback(() => {
    const headers = [
      'First Name', 'Last Name', 'Email', 'Phone', 'Service Track',
      'Application Status', 'Passport Status', 'Visa Status',
      'Payment Status', 'Trip Cost', 'Amount Paid', 'Amount Raised',
      'Honorific', 'Legal Full Name', 'Date of Birth', 'Organization', 'Title',
      'Mailing Address', 'Location',
      'Travel Accommodation', 'Travel Date In', 'Travel Date Out',
      'Departure Airport', 'Return Airport',
      'Special Assistance', 'TSA/KTN', 'Travel Notes',
      'Flight Status', 'Hotel Status', 'Booking Type',
      'Interest Form', 'Travel Form', 'Medical Form', 'Waiver',
      'Application Date',
    ]

    const rows = participants.map(p => {
      return [
        p.first_name, p.last_name, p.email, p.phone || '',
        p.service_track || '', p.application_status, p.passport_status, p.visa_status,
        p.payment_status, p.trip_cost || '3500', p.amount_paid || '0', p.amount_raised || '0',
        p.honorific || '', p.legal_full_name || '', p.date_of_birth || '',
        p.organization || '', p.org_title || '',
        p.mailing_address || '', p.location || '',
        p.travel_accommodation_type || '', p.travel_date_in || '', p.travel_date_out || '',
        p.departure_airport || '', p.return_airport || '',
        p.special_assistance || '', p.tsa_known_traveler_number || '', p.travel_notes || '',
        p.flight_status || 'not_booked', p.hotel_status || 'not_booked', p.booking_type || 'tbd',
        p.interest_form_completed_at ? 'Yes' : 'No',
        p.travel_form_completed_at ? 'Yes' : 'No',
        p.medical_form_completed_at ? 'Yes' : 'No',
        p.waiver_signed_at ? 'Yes' : 'No',
        p.application_date ? new Date(p.application_date).toLocaleDateString() : '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`)
    })

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kenya-trip-participants-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [participants])

  // Filter participants
  const filteredParticipants = participants.filter(p => {
    const matchesSearch =
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTrack = filterTrack === 'all' || p.service_track === filterTrack
    const matchesStatus = filterStatus === 'all' || p.application_status === filterStatus
    return matchesSearch && matchesTrack && matchesStatus
  })

  // ============ GENERIC INLINE EDIT (Optimistic) ============

  const updateParticipantField = useCallback(async (id: string, field: string, value: string) => {
    // Optimistic update
    setParticipants(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ))
    setSaveStatus('saving')

    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_participants')
      .update({ [field]: value })
      .eq('id', id)

    if (error) {
      flashSave(false)
      fetchData() // Revert on error
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  const updateLodgingField = useCallback(async (id: string, field: string, value: string | number) => {
    setLodging(prev => prev.map(l =>
      l.id === id ? { ...l, [field]: value } : l
    ))
    setSaveStatus('saving')

    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_lodging')
      .update({ [field]: value })
      .eq('id', id)

    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  // ============ EXISTING CRUD HANDLERS ============

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
        category_id: '', description: '', amount: '',
        expense_date: new Date().toISOString().split('T')[0], paid_by: '', payment_method: '',
      })
      fetchData()
    }
  }

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
        focus_date: '', phase: 'pre_trip', theme: '', scripture_reference: '',
        scripture_text: '', prayer_focus: '', leadership_notes: '',
      })
      fetchData()
    }
  }

  const updateParticipantStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_participants').update({
      application_status: status,
      approval_date: status === 'approved' ? new Date().toISOString() : null
    }).eq('id', id)
    fetchData()
  }

  const updateExpenseStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_expenses').update({ status }).eq('id', id)
    fetchData()
  }

  const updateExpenseField = useCallback(async (id: string, field: string, value: string | number) => {
    setExpenses(prev => prev.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ))
    setSaveStatus('saving')
    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_expenses')
      .update({ [field]: value })
      .eq('id', id)
    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
    const supabase = createClient()
    await supabase.from('kenya_trip_expenses').delete().eq('id', id)
  }

  const addExpenseInline = async (expense: { category_id: string; description: string; amount: number; expense_date: string; paid_by: string }) => {
    if (!trip || !expense.description || !expense.amount) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_expenses').insert({
      trip_id: trip.id,
      ...expense,
      status: 'pending',
    })
    if (!error) fetchData()
  }

  // ============ ANNOUNCEMENT/FAQ/DOC HANDLERS ============

  const updateAnnouncementField = useCallback(async (id: string, field: string, value: string | boolean) => {
    setAnnouncements(prev => prev.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    ))
    setSaveStatus('saving')
    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_announcements')
      .update({ [field]: value })
      .eq('id', id)
    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    const supabase = createClient()
    await supabase.from('kenya_trip_announcements').delete().eq('id', id)
  }

  const addFaq = async (question: string, answer: string) => {
    if (!trip || !question.trim()) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_faqs').insert({
      trip_id: trip.id,
      question: question.trim(),
      answer: answer.trim(),
      category: 'general',
      sort_order: faqs.length,
    })
    if (!error) fetchData()
  }

  const updateFaqField = useCallback(async (id: string, field: string, value: string) => {
    setFaqs(prev => prev.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    ))
    setSaveStatus('saving')
    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_faqs')
      .update({ [field]: value })
      .eq('id', id)
    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  const deleteFaq = async (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id))
    const supabase = createClient()
    await supabase.from('kenya_trip_faqs').delete().eq('id', id)
  }

  const addDocument = async (name: string, fileUrl: string, category: string) => {
    if (!trip || !name.trim()) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_documents').insert({
      trip_id: trip.id,
      name: name.trim(),
      file_url: fileUrl.trim(),
      category: category || 'general',
      is_required: false,
      sort_order: documents.length,
    })
    if (!error) fetchData()
  }

  const deleteDocument = async (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
    const supabase = createClient()
    await supabase.from('kenya_trip_documents').delete().eq('id', id)
  }

  // ============ PACKING HANDLERS ============

  const addPackingItem = async (item: { item_name: string; category: string; is_required: boolean; quantity: number; notes?: string }) => {
    if (!trip) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_packing_items').insert({
      trip_id: trip.id,
      ...item,
      sort_order: packingItems.length,
    })
    if (!error) fetchData()
  }

  const deletePackingItem = async (id: string) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_packing_items').delete().eq('id', id)
    fetchData()
  }

  const togglePackingStatus = async (participantId: string, packingItemId: string, currentlyPacked: boolean) => {
    const supabase = createClient()
    if (currentlyPacked) {
      await supabase.from('kenya_trip_packing_status')
        .update({ is_packed: false, packed_at: null })
        .eq('participant_id', participantId)
        .eq('packing_item_id', packingItemId)
    } else {
      await supabase.from('kenya_trip_packing_status')
        .upsert({
          participant_id: participantId,
          packing_item_id: packingItemId,
          is_packed: true,
          packed_at: new Date().toISOString(),
        }, { onConflict: 'participant_id,packing_item_id' })
    }
    fetchData()
  }

  const initializePackingForAll = async () => {
    if (!trip || packingItems.length === 0) return
    const supabase = createClient()
    const approvedParticipants = participants.filter(p => p.application_status === 'approved')
    const rows = approvedParticipants.flatMap(p =>
      packingItems.map(item => ({
        participant_id: p.id,
        packing_item_id: item.id,
        is_packed: false,
      }))
    )
    if (rows.length > 0) {
      await supabase.from('kenya_trip_packing_status')
        .upsert(rows, { onConflict: 'participant_id,packing_item_id', ignoreDuplicates: true })
      fetchData()
    }
  }

  // ============ LOGISTICS HANDLERS ============

  const upsertLogisticsCell = async (dayDate: string, track: string, content: string) => {
    if (!trip) return
    const supabase = createClient()
    await supabase.from('kenya_trip_logistics_matrix').upsert({
      trip_id: trip.id,
      day_date: dayDate,
      track,
      content,
    }, { onConflict: 'trip_id,day_date,track' })
    fetchData()
  }

  const addConferenceSession = async (session: Omit<ConferenceSession, 'id' | 'trip_id' | 'sort_order'>) => {
    if (!trip) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_conference_sessions').insert({
      trip_id: trip.id,
      ...session,
      sort_order: conferenceSessions.filter(s => s.conference_date === session.conference_date).length,
    })
    if (!error) fetchData()
  }

  const deleteConferenceSession = async (id: string) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_conference_sessions').delete().eq('id', id)
    fetchData()
  }

  const copyFromItinerary = async (dayDate: string) => {
    if (!trip) return
    const dayItems = itinerary.filter(i => i.date === dayDate)
    const content = dayItems.map(i => `${i.start_time?.slice(0, 5) || ''} ${i.title}`).join('\n')
    if (content) {
      await upsertLogisticsCell(dayDate, 'all', content)
    }
  }

  // ============ MEDIA HANDLERS ============

  const addMediaCalendarItem = async (item: Omit<MediaCalendarItem, 'id' | 'trip_id'>) => {
    if (!trip) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_media_calendar').insert({
      trip_id: trip.id, ...item,
    })
    if (!error) fetchData()
  }

  const updateMediaCalendarItem = async (id: string, updates: Partial<MediaCalendarItem>) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_media_calendar').update(updates).eq('id', id)
    fetchData()
  }

  const deleteMediaCalendarItem = async (id: string) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_media_calendar').delete().eq('id', id)
    fetchData()
  }

  const addMediaAssignment = async (assignment: Omit<MediaAssignment, 'id' | 'trip_id'>) => {
    if (!trip) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_media_assignments').insert({
      trip_id: trip.id, ...assignment,
    })
    if (!error) fetchData()
  }

  const deleteMediaAssignment = async (id: string) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_media_assignments').delete().eq('id', id)
    fetchData()
  }

  const addShotListItem = async (item: Omit<ShotListItem, 'id' | 'trip_id' | 'is_captured'>) => {
    if (!trip) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_shot_list').insert({
      trip_id: trip.id, ...item, is_captured: false,
    })
    if (!error) fetchData()
  }

  const toggleShotCaptured = async (id: string, currentlyCaptured: boolean) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_shot_list').update({
      is_captured: !currentlyCaptured,
    }).eq('id', id)
    fetchData()
  }

  const deleteShotListItem = async (id: string) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_shot_list').delete().eq('id', id)
    fetchData()
  }

  // ============ PIPELINE HANDLERS ============

  const addWaitingListEntry = async (entry: Omit<WaitingListEntry, 'id' | 'trip_id' | 'created_at' | 'promoted_to_participant_id'>) => {
    if (!trip) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_waiting_list').insert({
      trip_id: trip.id, ...entry,
    })
    if (!error) fetchData()
  }

  const updateWaitingListEntry = async (id: string, updates: Partial<WaitingListEntry>) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_waiting_list').update(updates).eq('id', id)
    fetchData()
  }

  const deleteWaitingListEntry = async (id: string) => {
    const supabase = createClient()
    await supabase.from('kenya_trip_waiting_list').delete().eq('id', id)
    fetchData()
  }

  const promoteToDelegate = async (entry: WaitingListEntry) => {
    if (!trip) return
    const supabase = createClient()
    const { data: newParticipant, error: pError } = await supabase.from('kenya_trip_participants').insert({
      trip_id: trip.id,
      first_name: entry.first_name,
      last_name: entry.last_name,
      email: entry.email,
      phone: entry.phone,
      application_status: 'approved',
      payment_status: 'pending',
      passport_status: 'not_started',
      visa_status: 'not_started',
      fundraising_goal: 3500,
      amount_raised: 0,
      team_leader: false,
    }).select().single()

    if (!pError && newParticipant) {
      await supabase.from('kenya_trip_waiting_list').update({
        status: 'promoted',
        promoted_to_participant_id: newParticipant.id,
      }).eq('id', entry.id)
      fetchData()
    }
  }

  // ============ ADD DELEGATE / CONTACT HANDLERS ============

  const addParticipantDirect = async (firstName: string, lastName: string) => {
    if (!trip || !firstName.trim()) return
    setSaveStatus('saving')

    // Use admin API endpoint (bypasses RLS)
    try {
      const res = await fetch('/api/admin/kenya-add-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: (lastName || '').trim(),
          track: 'Flex',
          tripId: trip.id,
        }),
      })
      const result = await res.json()
      if (result.success) {
        flashSave(true)
        fetchData()
      } else {
        console.error('Add delegate error:', result.error)
        flashSave(false)
      }
    } catch (err) {
      console.error('Add delegate error:', err)
      flashSave(false)
    }
  }

  const addContact = async (name: string) => {
    if (!trip || !name.trim()) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_contacts').insert({
      trip_id: trip.id,
      name: name.trim(),
      role: '',
      organization: '',
      phone: '',
      email: '',
      city: '',
      is_primary: false,
    })
    if (!error) fetchData()
  }

  const deleteParticipant = async (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id))
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/admin/kenya-delete-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participantId: id }),
      })
      const result = await res.json()
      if (result.success) {
        flashSave(true)
      } else {
        flashSave(false)
        fetchData() // Revert on error
      }
    } catch {
      flashSave(false)
      fetchData()
    }
  }

  const deleteContact = async (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id))
    const supabase = createClient()
    await supabase.from('kenya_trip_contacts').delete().eq('id', id)
  }

  const updateContactField = useCallback(async (id: string, field: string, value: string) => {
    setContacts(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ))
    setSaveStatus('saving')
    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_contacts')
      .update({ [field]: value })
      .eq('id', id)
    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  // Itinerary CRUD
  const addItineraryItem = async (item: { date: string; day_number: number; title: string; description: string; start_time: string; category: string; location: string }) => {
    if (!trip) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_itinerary').insert({
      trip_id: trip.id,
      ...item,
    })
    if (!error) fetchData()
  }

  const updateItineraryField = useCallback(async (id: string, field: string, value: string) => {
    setItinerary(prev => prev.map(i =>
      i.id === id ? { ...i, [field]: value } : i
    ))
    setSaveStatus('saving')
    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_itinerary')
      .update({ [field]: value })
      .eq('id', id)
    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  const deleteItineraryItem = async (id: string) => {
    setItinerary(prev => prev.filter(i => i.id !== id))
    const supabase = createClient()
    await supabase.from('kenya_trip_itinerary').delete().eq('id', id)
  }

  // ============ ACTION ITEMS HANDLERS ============

  const addActionItem = async (item: { title: string; category: string; priority: string }) => {
    if (!trip || !item.title) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_action_items').insert({
      trip_id: trip.id,
      title: item.title,
      category: item.category,
      priority: item.priority,
      sort_order: actionItems.length,
    })
    if (!error) fetchData()
  }

  const updateActionItemField = useCallback(async (id: string, field: string, value: string | null) => {
    setActionItems(prev => prev.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    ))
    setSaveStatus('saving')

    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_action_items')
      .update({ [field]: value })
      .eq('id', id)

    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  const deleteActionItem = async (id: string) => {
    setActionItems(prev => prev.filter(a => a.id !== id))
    const supabase = createClient()
    await supabase.from('kenya_trip_action_items').delete().eq('id', id)
  }

  // ============ TRACK HANDLERS ============

  const updateTrackDetailField = useCallback(async (id: string, field: string, value: string) => {
    setTrackDetails(prev => prev.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ))
    setSaveStatus('saving')

    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_track_details')
      .update({ [field]: value })
      .eq('id', id)

    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  const addTrackMaterial = async (trackDetailId: string, itemName: string) => {
    if (!itemName.trim()) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_track_materials').insert({
      track_detail_id: trackDetailId,
      item_name: itemName.trim(),
      sort_order: trackMaterials.filter(m => m.track_detail_id === trackDetailId).length,
    })
    if (!error) fetchData()
  }

  const toggleTrackMaterial = useCallback(async (id: string, currentlyChecked: boolean) => {
    setTrackMaterials(prev => prev.map(m =>
      m.id === id ? { ...m, is_checked: !currentlyChecked } : m
    ))
    const supabase = createClient()
    await supabase.from('kenya_trip_track_materials')
      .update({ is_checked: !currentlyChecked })
      .eq('id', id)
  }, [])

  const deleteTrackMaterial = async (id: string) => {
    setTrackMaterials(prev => prev.filter(m => m.id !== id))
    const supabase = createClient()
    await supabase.from('kenya_trip_track_materials').delete().eq('id', id)
  }

  // ============ ADMIN NOTES HANDLERS ============

  const addAdminNote = async (note: { note_type: string; title?: string; content?: string; url?: string }) => {
    if (!trip) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_admin_notes').insert({
      trip_id: trip.id,
      ...note,
      sort_order: adminNotes.filter(n => n.note_type === note.note_type).length,
    })
    if (!error) fetchData()
  }

  const updateAdminNoteField = useCallback(async (id: string, field: string, value: string) => {
    setAdminNotes(prev => prev.map(n =>
      n.id === id ? { ...n, [field]: value } : n
    ))
    setSaveStatus('saving')

    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_admin_notes')
      .update({ [field]: value })
      .eq('id', id)

    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  const deleteAdminNote = async (id: string) => {
    setAdminNotes(prev => prev.filter(n => n.id !== id))
    const supabase = createClient()
    await supabase.from('kenya_trip_admin_notes').delete().eq('id', id)
  }

  // ============ LODGING ADD HANDLER ============

  const addLodging = async (city: string, checkIn: string, checkOut: string) => {
    if (!trip || !city.trim() || !checkIn || !checkOut) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_lodging').insert({
      trip_id: trip.id,
      name: 'TBD',
      city: city.trim(),
      check_in_date: checkIn,
      check_out_date: checkOut,
      total_rooms: 0,
      booking_status: '⬜ Not started',
      notes: '',
    })
    if (!error) fetchData()
  }

  // ============ SUPPORT ROLES HANDLERS ============

  const addSupportRole = async (roleName: string) => {
    if (!trip || !roleName.trim()) return
    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_support_roles').insert({
      trip_id: trip.id,
      role_name: roleName.trim(),
      sort_order: supportRoles.length,
    })
    if (!error) fetchData()
  }

  const updateSupportRoleField = useCallback(async (id: string, field: string, value: string) => {
    setSupportRoles(prev => prev.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    ))
    setSaveStatus('saving')

    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trip_support_roles')
      .update({ [field]: value })
      .eq('id', id)

    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [flashSave, fetchData])

  const deleteSupportRole = async (id: string) => {
    setSupportRoles(prev => prev.filter(r => r.id !== id))
    const supabase = createClient()
    await supabase.from('kenya_trip_support_roles').delete().eq('id', id)
  }

  // ============ TRIP FIELD HANDLERS ============

  const updateTripField = useCallback(async (field: string, value: string | number) => {
    if (!trip) return
    setTrip(prev => prev ? { ...prev, [field]: value } : prev)
    if (field === 'fundraising_goal') {
      setStats(prev => ({ ...prev, fundraisingGoal: Number(value) }))
    }
    setSaveStatus('saving')

    const supabase = createClient()
    const { error } = await supabase
      .from('kenya_trips')
      .update({ [field]: value })
      .eq('id', trip.id)

    if (error) {
      flashSave(false)
      fetchData()
    } else {
      flashSave(true)
    }
  }, [trip, flashSave, fetchData])

  // ============ APPLICATION REVIEW HANDLERS ============

  const updateApplicationStatus = async (id: string, status: string, notes?: string) => {
    // Call the approval API which updates status AND sends email
    const response = await fetch('/api/admin/kenya-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: id, status, notes }),
    })
    const data = await response.json()
    if (data.success) {
      // Optimistic update
      setParticipants(prev => prev.map(p =>
        p.id === id ? { ...p, application_status: status } : p
      ))
    }
    return data
  }

  const requestMoreInfo = async (participantId: string, email: string, name: string, message: string) => {
    const response = await fetch('/api/admin/kenya-request-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId, email, name, message }),
    })
    return response.json()
  }

  // ============ KENYA INVITE HANDLERS ============

  const sendKenyaInvite = async (invite: {
    firstName: string
    lastName: string
    email: string
    track: string
    role: string
    sendEmail: boolean
  }) => {
    const response = await fetch('/api/admin/kenya-invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...invite }),
    })
    const data = await response.json()
    if (data.success) {
      fetchData() // Refresh all data including participants
    }
    return data
  }

  const sendBulkKenyaInvites = async (invites: {
    firstName: string
    lastName: string
    email: string
    track: string
    role: string
  }[]) => {
    const response = await fetch('/api/admin/kenya-invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk_create', invites, sendEmails: true }),
    })
    const data = await response.json()
    if (data.success) {
      fetchData()
    }
    return data
  }

  const resendKenyaInvite = async (inviteId: string) => {
    const response = await fetch('/api/admin/kenya-invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resend', inviteId }),
    })
    return response.json()
  }

  const deactivateKenyaInvite = async (inviteId: string) => {
    const response = await fetch('/api/admin/kenya-invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deactivate', inviteId }),
    })
    const data = await response.json()
    if (data.success) {
      setKenyaInvites(prev => prev.map(inv =>
        inv.id === inviteId ? { ...inv, is_active: false } : inv
      ))
    }
    return data
  }

  return {
    // Core
    loading, trip, fetchData,
    // Data
    participants, itinerary, flights, lodging, contacts,
    budgetCategories, expenses, announcements, documents, faqs, dailyFocus,
    packingItems, packingStatuses, conferenceSessions, logisticsMatrix,
    mediaCalendar, mediaAssignments, shotList, waitingList,
    // Phase 4 data
    actionItems, trackDetails, trackMaterials, adminNotes,
    // Phase 5 data
    supportRoles,
    // Check-in data
    todayCheckins,
    // Save status
    saveStatus,
    // Stats
    stats,
    // UI state
    searchQuery, setSearchQuery, filterTrack, setFilterTrack, filterStatus, setFilterStatus,
    // Modals
    showExpenseModal, setShowExpenseModal,
    showAnnouncementModal, setShowAnnouncementModal,
    showDailyFocusModal, setShowDailyFocusModal,
    showItineraryModal, setShowItineraryModal,
    selectedParticipant, setSelectedParticipant,
    // Form state
    newExpense, setNewExpense,
    newAnnouncement, setNewAnnouncement,
    newDailyFocus, setNewDailyFocus,
    // Computed
    filteredParticipants, getBudgetSpent,
    // Existing handlers
    handleAddExpense, handleAddAnnouncement, handleAddDailyFocus,
    updateParticipantStatus, updateExpenseStatus, exportCSV,
    // Budget inline handlers
    updateExpenseField, deleteExpense, addExpenseInline,
    // Announcement/FAQ/Doc handlers
    updateAnnouncementField, deleteAnnouncement,
    addFaq, updateFaqField, deleteFaq,
    addDocument, deleteDocument,
    // Inline edit handlers
    updateParticipantField, updateLodgingField, updateContactField,
    // Add/delete delegates & contacts
    addParticipantDirect, deleteParticipant, addContact, deleteContact,
    // Itinerary handlers
    addItineraryItem, updateItineraryField, deleteItineraryItem,
    // Packing handlers
    addPackingItem, deletePackingItem, togglePackingStatus, initializePackingForAll,
    // Logistics handlers
    upsertLogisticsCell, addConferenceSession, deleteConferenceSession, copyFromItinerary,
    // Media handlers
    addMediaCalendarItem, updateMediaCalendarItem, deleteMediaCalendarItem,
    addMediaAssignment, deleteMediaAssignment,
    addShotListItem, toggleShotCaptured, deleteShotListItem,
    // Pipeline handlers
    addWaitingListEntry, updateWaitingListEntry, deleteWaitingListEntry, promoteToDelegate,
    // Action items handlers
    addActionItem, updateActionItemField, deleteActionItem,
    // Track handlers
    updateTrackDetailField, addTrackMaterial, toggleTrackMaterial, deleteTrackMaterial,
    // Admin notes handlers
    addAdminNote, updateAdminNoteField, deleteAdminNote,
    // Lodging add handler
    addLodging,
    // Trip field handlers
    updateTripField,
    // Support roles handlers
    addSupportRole, updateSupportRoleField, deleteSupportRole,
    // Application review handlers
    updateApplicationStatus, requestMoreInfo,
    // Kenya invite handlers
    kenyaInvites, showInviteModal, setShowInviteModal,
    sendKenyaInvite, sendBulkKenyaInvites, resendKenyaInvite, deactivateKenyaInvite,
  }
}

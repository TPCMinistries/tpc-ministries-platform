'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Trip,
  Participant,
  Member,
  Announcement,
  Document,
  FAQ,
  DailyFocus,
  PackingItem,
  PackingStatus,
  ItineraryItem,
  ConferenceSession,
  Lodging,
  Contact,
  Donation,
} from './types'

interface FeedPost {
  id: string
  trip_id: string
  participant_id: string
  content: string
  created_at: string
  kenya_trip_participants: {
    first_name: string
    last_name: string
    service_track: string | null
  } | null
}

export interface DelegateData {
  loading: boolean
  trip: Trip | null
  participant: Participant | null
  member: Member | null
  announcements: Announcement[]
  documents: Document[]
  faqs: FAQ[]
  dailyFocus: DailyFocus[]
  packingItems: PackingItem[]
  packingStatus: PackingStatus[]
  itinerary: ItineraryItem[]
  conferenceSessions: ConferenceSession[]
  lodging: Lodging[]
  contacts: Contact[]
  donations: Donation[]
  allParticipants: {
    id: string
    first_name: string
    last_name: string
    service_track: string | null
    ministry_role: string | null
    instagram_handle?: string | null
    tiktok_handle?: string | null
    twitter_handle?: string | null
  }[]
  feedPosts: FeedPost[]
  refetch: () => Promise<void>
  // Actions
  togglePackingItem: (itemId: string) => Promise<void>
  uploadDocument: (file: File, documentType: 'passport' | 'visa' | 'vaccination' | 'insurance' | 'medical_form') => Promise<void>
  deleteDocument: (documentType: 'passport' | 'visa' | 'vaccination' | 'insurance' | 'medical_form') => Promise<void>
  submitManualDonation: (donation: { donor_name: string; amount: string; message: string; is_anonymous: boolean }) => Promise<boolean>
  savePersonalization: (updates: { story?: string; headline?: string; videoUrl?: string; pageEnabled?: boolean }) => Promise<boolean>
  uploadPhoto: (file: File) => Promise<void>
  submitApplication: (form: ApplicationForm) => Promise<boolean>
  submitFeedPost: (content: string) => Promise<boolean>
  uploadingDoc: string | null
  uploadingPhoto: boolean
}

export interface ApplicationForm {
  first_name: string
  last_name: string
  email: string
  phone: string
  service_track: string
  why_interested: string
  previous_missions: string
  special_skills: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  allergies: string
  medications: string
  medical_conditions: string
  dietary_restrictions: string
  needs_scholarship: boolean
  scholarship_reason: string
}

export function useDelegateData(): DelegateData {
  const [loading, setLoading] = useState(true)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [dailyFocus, setDailyFocus] = useState<DailyFocus[]>([])
  const [packingItems, setPackingItems] = useState<PackingItem[]>([])
  const [packingStatus, setPackingStatus] = useState<PackingStatus[]>([])
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [conferenceSessions, setConferenceSessions] = useState<ConferenceSession[]>([])
  const [lodging, setLodging] = useState<Lodging[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [allParticipants, setAllParticipants] = useState<DelegateData['allParticipants']>([])
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([])
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/kenya/delegate')
      if (!res.ok) throw new Error('Failed to fetch delegate data')
      const data = await res.json()

      setTrip(data.trip)
      setParticipant(data.participant)
      setMember(data.member)
      setAnnouncements(data.announcements || [])
      setDocuments(data.documents || [])
      setFaqs(data.faqs || [])
      setDailyFocus(data.dailyFocus || [])
      setPackingItems(data.packingItems || [])
      setPackingStatus(data.packingStatus || [])
      setItinerary(data.itinerary || [])
      setConferenceSessions(data.conferenceSessions || [])
      setLodging(data.lodging || [])
      setContacts(data.contacts || [])
      setDonations(data.donations || [])
      setAllParticipants(data.allParticipants || [])
      setFeedPosts(data.feedPosts || [])
    } catch (error) {
      console.error('Error fetching delegate data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ─── Actions ───────────────────────────────────────────

  const togglePackingItem = useCallback(async (itemId: string) => {
    if (!participant) return
    const supabase = createClient()

    const currentStatus = packingStatus.find(s => s.packing_item_id === itemId)
    const newStatus = !currentStatus?.is_packed

    if (currentStatus) {
      await supabase
        .from('kenya_trip_packing_status')
        .update({ is_packed: newStatus, packed_at: newStatus ? new Date().toISOString() : null })
        .eq('participant_id', participant.id)
        .eq('packing_item_id', itemId)
    } else {
      await supabase.from('kenya_trip_packing_status').insert({
        participant_id: participant.id,
        packing_item_id: itemId,
        is_packed: true,
        packed_at: new Date().toISOString(),
      })
    }

    setPackingStatus(prev => {
      const existing = prev.find(s => s.packing_item_id === itemId)
      if (existing) {
        return prev.map(s => s.packing_item_id === itemId ? { ...s, is_packed: newStatus } : s)
      }
      return [...prev, { packing_item_id: itemId, is_packed: true }]
    })
  }, [participant, packingStatus])

  const uploadDocument = useCallback(async (
    file: File,
    documentType: 'passport' | 'visa' | 'vaccination' | 'insurance' | 'medical_form'
  ) => {
    if (!participant) return
    setUploadingDoc(documentType)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kenya-trip-documents')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = await supabase.storage
        .from('kenya-trip-documents')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365)

      const documentUrl = urlData?.signedUrl || uploadData.path

      const columnName = `${documentType}_document_url`
      const { error: updateError } = await supabase
        .from('kenya_trip_participants')
        .update({ [columnName]: documentUrl })
        .eq('id', participant.id)

      if (updateError) throw updateError

      await fetchData()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setUploadingDoc(null)
    }
  }, [participant, fetchData])

  const deleteDocument = useCallback(async (
    documentType: 'passport' | 'visa' | 'vaccination' | 'insurance' | 'medical_form'
  ) => {
    if (!participant) return
    if (!confirm('Are you sure you want to delete this document?')) return

    const supabase = createClient()
    try {
      const columnName = `${documentType}_document_url`
      const { error } = await supabase
        .from('kenya_trip_participants')
        .update({ [columnName]: null })
        .eq('id', participant.id)

      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete document.')
    }
  }, [participant, fetchData])

  const submitManualDonation = useCallback(async (
    donation: { donor_name: string; amount: string; message: string; is_anonymous: boolean }
  ): Promise<boolean> => {
    if (!participant) return false

    const amount = parseFloat(donation.amount)
    if (isNaN(amount) || amount < 1) {
      alert('Please enter a valid amount')
      return false
    }

    const supabase = createClient()
    const { error } = await supabase.from('kenya_trip_donations').insert({
      participant_id: participant.id,
      trip_id: participant.trip_id,
      donor_name: donation.is_anonymous ? 'Anonymous' : donation.donor_name,
      donor_email: null,
      is_anonymous: donation.is_anonymous,
      show_name_publicly: !donation.is_anonymous,
      amount,
      fees_covered: 0,
      net_amount: amount,
      payment_method: 'offline',
      status: 'completed',
      message: donation.message || null,
      is_manual_entry: true,
    })

    if (!error) {
      await fetchData()
      return true
    }
    console.error('Manual donation error:', error)
    alert('Failed to add donation. Please try again.')
    return false
  }, [participant, fetchData])

  const savePersonalization = useCallback(async (updates: {
    story?: string
    headline?: string
    videoUrl?: string
    pageEnabled?: boolean
  }): Promise<boolean> => {
    if (!participant) return false
    const supabase = createClient()

    const { error } = await supabase
      .from('kenya_trip_participants')
      .update({
        fundraising_story: updates.story ?? null,
        fundraising_headline: updates.headline ?? null,
        fundraising_video_url: updates.videoUrl ?? null,
        fundraising_page_enabled: updates.pageEnabled ?? participant.fundraising_page_enabled,
      })
      .eq('id', participant.id)

    if (!error) {
      await fetchData()
      return true
    }
    alert('Failed to save changes. Please try again.')
    return false
  }, [participant, fetchData])

  const uploadPhoto = useCallback(async (file: File) => {
    if (!participant) return
    setUploadingPhoto(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/fundraising_photo_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('kenya-trip-documents')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = await supabase.storage
        .from('kenya-trip-documents')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365)

      const photoUrl = urlData?.signedUrl

      await supabase
        .from('kenya_trip_participants')
        .update({ fundraising_photo_url: photoUrl })
        .eq('id', participant.id)

      await fetchData()
    } catch (error) {
      console.error('Photo upload error:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }, [participant, fetchData])

  const submitApplication = useCallback(async (form: ApplicationForm): Promise<boolean> => {
    if (!trip) return false

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    let memberId = null

    if (user) {
      const { data: memberData } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()
      memberId = memberData?.id
    }

    const applicationNotes = [
      form.why_interested && `Why interested: ${form.why_interested}`,
      form.previous_missions && `Previous missions: ${form.previous_missions}`,
      form.special_skills && `Special skills: ${form.special_skills}`,
      form.dietary_restrictions && `Dietary restrictions: ${form.dietary_restrictions}`,
      form.needs_scholarship && `Scholarship requested: ${form.scholarship_reason || 'Yes'}`,
    ].filter(Boolean).join('\n\n')

    const { error } = await supabase.from('kenya_trip_participants').insert({
      trip_id: trip.id,
      member_id: memberId,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      service_track: form.service_track || null,
      emergency_contact_name: form.emergency_contact_name || null,
      emergency_contact_phone: form.emergency_contact_phone || null,
      emergency_contact_relationship: form.emergency_contact_relationship || null,
      allergies: form.allergies || null,
      medications: form.medications || null,
      medical_conditions: form.medical_conditions || null,
      notes: applicationNotes || null,
      scholarship_requested: form.needs_scholarship,
      application_status: 'pending',
    })

    if (!error) {
      await fetchData()
      return true
    }
    console.error('Application error:', error)
    alert('Failed to submit application. Please try again.')
    return false
  }, [trip, fetchData])

  const submitFeedPost = useCallback(async (content: string): Promise<boolean> => {
    if (!participant || !trip) return false
    const supabase = createClient()

    const { error } = await supabase.from('kenya_trip_feed').insert({
      trip_id: trip.id,
      participant_id: participant.id,
      content,
    })

    if (!error) {
      // Refresh feed
      const { data } = await supabase
        .from('kenya_trip_feed')
        .select('*, kenya_trip_participants(first_name, last_name, service_track)')
        .eq('trip_id', trip.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setFeedPosts(data || [])
      return true
    }
    return false
  }, [participant, trip])

  return {
    loading,
    trip,
    participant,
    member,
    announcements,
    documents,
    faqs,
    dailyFocus,
    packingItems,
    packingStatus,
    itinerary,
    conferenceSessions,
    lodging,
    contacts,
    donations,
    allParticipants,
    feedPosts,
    refetch: fetchData,
    togglePackingItem,
    uploadDocument,
    deleteDocument,
    submitManualDonation,
    savePersonalization,
    uploadPhoto,
    submitApplication,
    submitFeedPost,
    uploadingDoc,
    uploadingPhoto,
  }
}

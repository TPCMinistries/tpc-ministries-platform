'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Trip,
  KenyaPartner,
  PartnerProposal,
  Announcement,
  Document,
  FAQ,
  ItineraryItem,
  ConferenceSession,
  LogisticsMatrix,
  Lodging,
  Contact,
} from '../../_components/types'

interface PartnerDelegate {
  id: string
  first_name: string
  last_name: string
  service_track: string | null
  ministry_role: string | null
  team_leader: boolean
}

interface PartnerTeamMember {
  id: string
  partner_type: string
  organization: string | null
  title: string | null
  city: string | null
  first_name: string
  last_name: string
}

export interface PartnerData {
  loading: boolean
  error: string | null
  partner: KenyaPartner | null
  trip: Trip | null
  member: { id: string; first_name: string; last_name: string; email: string } | null
  delegates: PartnerDelegate[]
  itinerary: ItineraryItem[]
  conferenceSessions: ConferenceSession[]
  logisticsMatrix: LogisticsMatrix[]
  lodging: Lodging[]
  contacts: Contact[]
  announcements: Announcement[]
  documents: Document[]
  faqs: FAQ[]
  proposals: PartnerProposal[]
  allPartners: PartnerTeamMember[]
  // Handlers
  submitProposal: (type: string, title: string, description: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function usePartnerData(): PartnerData {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [partner, setPartner] = useState<KenyaPartner | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [member, setMember] = useState<PartnerData['member']>(null)
  const [delegates, setDelegates] = useState<PartnerDelegate[]>([])
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [conferenceSessions, setConferenceSessions] = useState<ConferenceSession[]>([])
  const [logisticsMatrix, setLogisticsMatrix] = useState<LogisticsMatrix[]>([])
  const [lodging, setLodging] = useState<Lodging[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [proposals, setProposals] = useState<PartnerProposal[]>([])
  const [allPartners, setAllPartners] = useState<PartnerTeamMember[]>([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/kenya/partner')
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to load partner data')
        return
      }

      setPartner(data.partner)
      setTrip(data.trip)
      setMember(data.member)
      setDelegates(data.delegates || [])
      setItinerary(data.itinerary || [])
      setConferenceSessions(data.conferenceSessions || [])
      setLogisticsMatrix(data.logisticsMatrix || [])
      setLodging(data.lodging || [])
      setContacts(data.contacts || [])
      setAnnouncements(data.announcements || [])
      setDocuments(data.documents || [])
      setFaqs(data.faqs || [])
      setProposals(data.proposals || [])
      setAllPartners(data.allPartners || [])
    } catch (err) {
      console.error('Failed to fetch partner data:', err)
      setError('Failed to load partner data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const submitProposal = useCallback(async (
    type: string, title: string, description: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/kenya/partner/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_type: type,
          title,
          description,
        }),
      })

      if (!res.ok) return false

      const data = await res.json()
      if (data.proposal) {
        setProposals(prev => [data.proposal, ...prev])
      }
      return true
    } catch {
      return false
    }
  }, [])

  return {
    loading,
    error,
    partner,
    trip,
    member,
    delegates,
    itinerary,
    conferenceSessions,
    logisticsMatrix,
    lodging,
    contacts,
    announcements,
    documents,
    faqs,
    proposals,
    allPartners,
    submitProposal,
    refetch: fetchData,
  }
}

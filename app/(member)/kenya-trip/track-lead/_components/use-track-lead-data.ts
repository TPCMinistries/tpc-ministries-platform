'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Trip,
  Announcement,
  ConferenceSession,
  LogisticsMatrix,
  TrackDetail,
  TrackMaterial,
  TrackLeadNote,
  TrackPlan,
} from '../../_components/types'

interface ActionItem {
  id: string
  trip_id: string
  label: string
  category: string
  assigned_to: string | null
  status: string
  due_date: string | null
  notes: string | null
  created_at: string
}

interface TrackParticipant {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  passport_status: string
  visa_status: string
  payment_status: string
  service_track: string | null
  interest_form_completed_at: string | null
  travel_form_completed_at: string | null
  medical_form_completed_at: string | null
  waiver_signed_at: string | null
  flight_status: string | null
  application_status: string
}

interface TrackLeadParticipant {
  id: string
  trip_id: string
  member_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  passport_status: string
  visa_status: string
  payment_status: string
  service_track: string | null
  team_leader: boolean
  interest_form_completed_at: string | null
  travel_form_completed_at: string | null
  medical_form_completed_at: string | null
  waiver_signed_at: string | null
  flight_status: string | null
  application_status: string
}

interface TrackLeadData {
  loading: boolean
  error: string | null
  participant: TrackLeadParticipant | null
  trip: Trip | null
  trackParticipants: TrackParticipant[]
  trackDetails: TrackDetail[]
  trackMaterials: TrackMaterial[]
  logisticsMatrix: LogisticsMatrix[]
  conferenceSessions: ConferenceSession[]
  announcements: Announcement[]
  trackLeadNotes: Record<string, TrackLeadNote>
  trackPlans: TrackPlan[]
  actionItems: ActionItem[]
  // Handlers
  refetch: () => Promise<void>
  createAnnouncement: (title: string, content: string, priority: string) => Promise<boolean>
  saveNote: (participantId: string, note: string) => Promise<boolean>
  createPlan: (title: string, content: string, planType: string) => Promise<boolean>
  updatePlan: (id: string, updates: Partial<Pick<TrackPlan, 'title' | 'content' | 'plan_type' | 'status'>>) => Promise<boolean>
  deletePlan: (id: string) => Promise<boolean>
  addMaterial: (trackDetailId: string, itemName: string) => Promise<boolean>
  toggleMaterial: (id: string, isChecked: boolean) => Promise<boolean>
  deleteMaterial: (id: string) => Promise<boolean>
}

export function useTrackLeadData(): TrackLeadData {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participant, setParticipant] = useState<TrackLeadParticipant | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [trackParticipants, setTrackParticipants] = useState<TrackParticipant[]>([])
  const [trackDetails, setTrackDetails] = useState<TrackDetail[]>([])
  const [trackMaterials, setTrackMaterials] = useState<TrackMaterial[]>([])
  const [logisticsMatrix, setLogisticsMatrix] = useState<LogisticsMatrix[]>([])
  const [conferenceSessions, setConferenceSessions] = useState<ConferenceSession[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [trackLeadNotes, setTrackLeadNotes] = useState<Record<string, TrackLeadNote>>({})
  const [trackPlans, setTrackPlans] = useState<TrackPlan[]>([])
  const [actionItems, setActionItems] = useState<ActionItem[]>([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/kenya/track-lead')
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to load data')
        return
      }

      setParticipant(data.participant)
      setTrip(data.trip)
      setTrackParticipants(data.trackParticipants || [])
      setTrackDetails(data.trackDetails || [])
      setTrackMaterials(data.trackMaterials || [])
      setLogisticsMatrix(data.logisticsMatrix || [])
      setConferenceSessions(data.conferenceSessions || [])
      setAnnouncements(data.announcements || [])
      setTrackLeadNotes(data.trackLeadNotes || {})
      setTrackPlans(data.trackPlans || [])
      setActionItems(data.actionItems || [])
    } catch (err) {
      console.error('Failed to fetch track lead data:', err)
      setError('Failed to load track lead data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- Handlers ---

  const createAnnouncement = useCallback(async (title: string, content: string, priority: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/kenya/track-lead/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, priority }),
      })

      if (!res.ok) return false

      const data = await res.json()
      if (data.announcement) {
        setAnnouncements(prev => [data.announcement, ...prev])
      }
      return true
    } catch {
      return false
    }
  }, [])

  const saveNote = useCallback(async (participantId: string, note: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/kenya/track-lead/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantId, note }),
      })

      if (!res.ok) return false

      const data = await res.json()
      if (data.note) {
        setTrackLeadNotes(prev => ({
          ...prev,
          [data.note.participant_id]: data.note,
        }))
      }
      return true
    } catch {
      return false
    }
  }, [])

  const createPlan = useCallback(async (title: string, content: string, planType: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/kenya/track-lead/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, plan_type: planType }),
      })

      if (!res.ok) return false

      const data = await res.json()
      if (data.plan) {
        setTrackPlans(prev => [data.plan, ...prev])
      }
      return true
    } catch {
      return false
    }
  }, [])

  const updatePlan = useCallback(async (id: string, updates: Partial<Pick<TrackPlan, 'title' | 'content' | 'plan_type' | 'status'>>): Promise<boolean> => {
    try {
      const res = await fetch('/api/kenya/track-lead/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })

      if (!res.ok) return false

      const data = await res.json()
      if (data.plan) {
        setTrackPlans(prev => prev.map(p => p.id === id ? data.plan : p))
      }
      return true
    } catch {
      return false
    }
  }, [])

  const deletePlan = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/kenya/track-lead/plans', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) return false

      setTrackPlans(prev => prev.filter(p => p.id !== id))
      return true
    } catch {
      return false
    }
  }, [])

  const addMaterial = useCallback(async (trackDetailId: string, itemName: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/kenya/track-lead/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track_detail_id: trackDetailId, item_name: itemName }),
      })

      if (!res.ok) return false

      const data = await res.json()
      if (data.material) {
        setTrackMaterials(prev => [...prev, data.material])
      }
      return true
    } catch {
      return false
    }
  }, [])

  const toggleMaterial = useCallback(async (id: string, isChecked: boolean): Promise<boolean> => {
    try {
      // Optimistic update
      setTrackMaterials(prev => prev.map(m => m.id === id ? { ...m, is_checked: isChecked } : m))

      const res = await fetch('/api/kenya/track-lead/materials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_checked: isChecked }),
      })

      if (!res.ok) {
        // Revert
        setTrackMaterials(prev => prev.map(m => m.id === id ? { ...m, is_checked: !isChecked } : m))
        return false
      }

      return true
    } catch {
      return false
    }
  }, [])

  const deleteMaterial = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/kenya/track-lead/materials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) return false

      setTrackMaterials(prev => prev.filter(m => m.id !== id))
      return true
    } catch {
      return false
    }
  }, [])

  return {
    loading,
    error,
    participant,
    trip,
    trackParticipants,
    trackDetails,
    trackMaterials,
    logisticsMatrix,
    conferenceSessions,
    announcements,
    trackLeadNotes,
    trackPlans,
    actionItems,
    refetch: fetchData,
    createAnnouncement,
    saveNote,
    createPlan,
    updatePlan,
    deletePlan,
    addMaterial,
    toggleMaterial,
    deleteMaterial,
  }
}

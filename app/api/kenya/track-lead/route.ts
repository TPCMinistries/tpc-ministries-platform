import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Get member record
    const { data: member } = await admin
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    // Get latest trip
    const { data: trip } = await admin
      .from('kenya_trips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!trip) {
      return NextResponse.json({ error: 'No trip found' }, { status: 404 })
    }

    // Get participant record — must be team_leader
    const { data: participant } = await admin
      .from('kenya_trip_participants')
      .select('*')
      .eq('trip_id', trip.id)
      .eq('member_id', member.id)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    if (!participant.team_leader) {
      return NextResponse.json({ error: 'Not a track lead' }, { status: 403 })
    }

    const track = participant.service_track
    const isFlex = track === 'Flex'

    // Build track filter for queries
    // Flex track leads see ALL tracks
    const trackFilter = (query: any, column: string) => {
      if (isFlex) return query
      return query.eq(column, track)
    }

    const trackOrAllFilter = (query: any, column: string) => {
      if (isFlex) return query
      return query.or(`${column}.eq.${track},${column}.eq.all,${column}.is.null`)
    }

    // Fetch all track-scoped data in parallel
    const [
      trackParticipantsRes,
      trackDetailsRes,
      logisticsMatrixRes,
      conferenceSessionsRes,
      announcementsRes,
      trackLeadNotesRes,
      trackPlansRes,
      actionItemsRes,
    ] = await Promise.all([
      // Track participants — limited fields, NO dollar amounts
      (() => {
        let q = admin
          .from('kenya_trip_participants')
          .select('id, first_name, last_name, email, phone, passport_status, visa_status, payment_status, service_track, interest_form_completed_at, travel_form_completed_at, medical_form_completed_at, waiver_signed_at, flight_status, application_status')
          .eq('trip_id', trip.id)
        if (!isFlex) {
          q = q.eq('service_track', track)
        }
        return q.order('last_name')
      })(),

      // Track details
      (() => {
        let q = admin
          .from('kenya_trip_track_details')
          .select('*')
          .eq('trip_id', trip.id)
        if (!isFlex) {
          q = q.eq('track', track)
        }
        return q
      })(),

      // Logistics matrix — track + 'all'
      (() => {
        let q = admin
          .from('kenya_trip_logistics_matrix')
          .select('*')
          .eq('trip_id', trip.id)
        if (!isFlex) {
          q = q.or(`track.eq.${track},track.eq.all`)
        }
        return q.order('day_date')
      })(),

      // Conference sessions — track + 'all' + null
      (() => {
        let q = admin
          .from('kenya_trip_conference_sessions')
          .select('*')
          .eq('trip_id', trip.id)
        if (!isFlex) {
          q = q.or(`track.eq.${track},track.eq.all,track.is.null`)
        }
        return q.order('conference_date').order('start_time')
      })(),

      // All announcements
      admin
        .from('kenya_trip_announcements')
        .select('id, trip_id, title, content, priority, target_audience, publish_at, is_pinned')
        .eq('trip_id', trip.id)
        .lte('publish_at', new Date().toISOString())
        .order('is_pinned', { ascending: false })
        .order('publish_at', { ascending: false }),

      // Track lead notes — written by this track lead
      admin
        .from('kenya_trip_track_lead_notes')
        .select('*')
        .eq('author_id', participant.id),

      // Track plans for this track
      (() => {
        let q = admin
          .from('kenya_trip_track_plans')
          .select('*')
          .eq('trip_id', trip.id)
        if (!isFlex) {
          q = q.eq('service_track', track)
        }
        return q.order('created_at', { ascending: false })
      })(),

      // Admin action items — read only
      admin
        .from('kenya_trip_action_items')
        .select('*')
        .eq('trip_id', trip.id)
        .order('due_date'),
    ])

    // Get track materials for the retrieved track details
    const trackDetailIds = (trackDetailsRes.data || []).map((d: any) => d.id)
    let trackMaterials: any[] = []
    if (trackDetailIds.length > 0) {
      const { data: materialsData } = await admin
        .from('kenya_trip_track_materials')
        .select('*')
        .in('track_detail_id', trackDetailIds)
        .order('sort_order')
      trackMaterials = materialsData || []
    }

    // Build notes map keyed by participant_id
    const notesMap: Record<string, any> = {}
    for (const note of (trackLeadNotesRes.data || [])) {
      notesMap[note.participant_id] = note
    }

    // Strip financial data from participant record returned to track lead
    const safeParticipant = {
      id: participant.id,
      trip_id: participant.trip_id,
      member_id: participant.member_id,
      first_name: participant.first_name,
      last_name: participant.last_name,
      email: participant.email,
      phone: participant.phone,
      passport_status: participant.passport_status,
      visa_status: participant.visa_status,
      payment_status: participant.payment_status,
      service_track: participant.service_track,
      team_leader: participant.team_leader,
      interest_form_completed_at: participant.interest_form_completed_at,
      travel_form_completed_at: participant.travel_form_completed_at,
      medical_form_completed_at: participant.medical_form_completed_at,
      waiver_signed_at: participant.waiver_signed_at,
      flight_status: participant.flight_status,
      application_status: participant.application_status,
    }

    return NextResponse.json({
      participant: safeParticipant,
      trip,
      trackParticipants: trackParticipantsRes.data || [],
      trackDetails: trackDetailsRes.data || [],
      trackMaterials,
      logisticsMatrix: logisticsMatrixRes.data || [],
      conferenceSessions: conferenceSessionsRes.data || [],
      announcements: announcementsRes.data || [],
      trackLeadNotes: notesMap,
      trackPlans: trackPlansRes.data || [],
      actionItems: actionItemsRes.data || [],
    })
  } catch (error) {
    console.error('Track lead data fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

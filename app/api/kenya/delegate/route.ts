import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Auth gate — get current user via server client
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Get member record
    const { data: member } = await admin
      .from('members')
      .select('id, user_id, first_name, last_name, email, phone, tier, role, occupation, bio, city, state, country, date_of_birth, created_at')
      .eq('user_id', user.id)
      .single()

    // Get latest trip
    const { data: trip } = await admin
      .from('kenya_trips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!trip) {
      return NextResponse.json({ trip: null, participant: null })
    }

    // Get participant record (if exists)
    let participant = null
    if (member) {
      const { data: participantData } = await admin
        .from('kenya_trip_participants')
        .select('*')
        .eq('trip_id', trip.id)
        .eq('member_id', member.id)
        .single()

      participant = participantData
    }

    // Fetch all public + participant-scoped data in parallel
    const [
      announcementsRes,
      documentsRes,
      faqsRes,
      dailyFocusRes,
      packingItemsRes,
      itineraryRes,
      conferenceSessionsRes,
      lodgingRes,
      contactsRes,
      allParticipantsRes,
    ] = await Promise.all([
      admin
        .from('kenya_trip_announcements')
        .select('id, trip_id, title, content, priority, target_audience, publish_at, is_pinned')
        .eq('trip_id', trip.id)
        .lte('publish_at', new Date().toISOString())
        .order('is_pinned', { ascending: false })
        .order('publish_at', { ascending: false }),
      admin
        .from('kenya_trip_documents')
        .select('id, name, description, category, file_url, is_required')
        .eq('trip_id', trip.id)
        .order('sort_order'),
      admin
        .from('kenya_trip_faqs')
        .select('id, question, answer, category')
        .eq('trip_id', trip.id)
        .eq('is_published', true)
        .order('sort_order'),
      admin
        .from('kenya_trip_daily_focus')
        .select('id, focus_date, phase, theme, scripture_reference, scripture_text, prayer_focus, leadership_notes')
        .eq('trip_id', trip.id)
        .order('focus_date'),
      admin
        .from('kenya_trip_packing_items')
        .select('id, item_name, category, is_required, description, quantity, notes')
        .eq('trip_id', trip.id)
        .order('sort_order'),
      admin
        .from('kenya_trip_itinerary')
        .select('*')
        .eq('trip_id', trip.id)
        .order('date')
        .order('start_time'),
      admin
        .from('kenya_trip_conference_sessions')
        .select('*')
        .eq('trip_id', trip.id)
        .order('conference_date')
        .order('start_time'),
      admin
        .from('kenya_trip_lodging')
        .select('*')
        .eq('trip_id', trip.id)
        .order('check_in_date'),
      admin
        .from('kenya_trip_contacts')
        .select('*')
        .eq('trip_id', trip.id)
        .order('name'),
      admin
        .from('kenya_trip_participants')
        .select('id, first_name, last_name, service_track, ministry_role, instagram_handle, tiktok_handle, twitter_handle')
        .eq('trip_id', trip.id)
        .eq('application_status', 'approved')
        .order('last_name'),
    ])

    // Check if user is also a Kenya partner
    let isPartner = false
    if (member) {
      const { data: partnerRecord } = await admin
        .from('kenya_trip_partners')
        .select('id, partner_type, is_active')
        .eq('trip_id', trip.id)
        .eq('member_id', member.id)
        .eq('is_active', true)
        .maybeSingle()

      isPartner = !!partnerRecord
    }

    // Fetch participant-scoped data
    let packingStatus: { packing_item_id: string; is_packed: boolean }[] = []
    let donations: Record<string, unknown>[] = []
    let feedPosts: Record<string, unknown>[] = []

    if (participant) {
      const [packingStatusRes, donationsRes, feedRes] = await Promise.all([
        admin
          .from('kenya_trip_packing_status')
          .select('packing_item_id, is_packed')
          .eq('participant_id', participant.id),
        admin
          .from('kenya_trip_donations')
          .select('id, donor_name, is_anonymous, amount, net_amount, message, status, created_at, is_manual_entry')
          .eq('participant_id', participant.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(20),
        admin
          .from('kenya_trip_feed')
          .select('*, kenya_trip_participants(first_name, last_name, service_track)')
          .eq('trip_id', trip.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      packingStatus = packingStatusRes.data || []
      donations = donationsRes.data || []
      feedPosts = feedRes.data || []
    }

    return NextResponse.json({
      trip,
      participant,
      member,
      isPartner,
      announcements: announcementsRes.data || [],
      documents: documentsRes.data || [],
      faqs: faqsRes.data || [],
      dailyFocus: dailyFocusRes.data || [],
      packingItems: packingItemsRes.data || [],
      packingStatus,
      itinerary: itineraryRes.data || [],
      conferenceSessions: conferenceSessionsRes.data || [],
      lodging: lodgingRes.data || [],
      contacts: contactsRes.data || [],
      donations,
      allParticipants: allParticipantsRes.data || [],
      feedPosts,
    })
  } catch (error) {
    console.error('Delegate API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

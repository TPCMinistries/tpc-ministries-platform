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
      .select('id, user_id, first_name, last_name, email, phone, tier, role')
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

    // Look up partner record for this member + trip
    const { data: partner } = await admin
      .from('kenya_trip_partners')
      .select('*')
      .eq('trip_id', trip.id)
      .eq('member_id', member.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!partner) {
      return NextResponse.json({ error: 'Not an active partner for this trip' }, { status: 403 })
    }

    // Fetch all partner-scoped data in parallel
    const [
      delegatesRes,
      itineraryRes,
      conferenceSessionsRes,
      logisticsMatrixRes,
      lodgingRes,
      contactsRes,
      announcementsRes,
      documentsRes,
      faqsRes,
      proposalsRes,
      allPartnersRes,
    ] = await Promise.all([
      // Delegates — limited fields only (NO financial, medical, passport, visa, or personal data)
      admin
        .from('kenya_trip_participants')
        .select('id, first_name, last_name, service_track, ministry_role, team_leader')
        .eq('trip_id', trip.id)
        .eq('application_status', 'approved')
        .order('last_name'),
      // Itinerary
      admin
        .from('kenya_trip_itinerary')
        .select('*')
        .eq('trip_id', trip.id)
        .order('date')
        .order('start_time'),
      // Conference sessions
      admin
        .from('kenya_trip_conference_sessions')
        .select('*')
        .eq('trip_id', trip.id)
        .order('conference_date')
        .order('start_time'),
      // Logistics matrix (all tracks)
      admin
        .from('kenya_trip_logistics_matrix')
        .select('*')
        .eq('trip_id', trip.id)
        .order('day_date'),
      // Lodging
      admin
        .from('kenya_trip_lodging')
        .select('*')
        .eq('trip_id', trip.id)
        .order('check_in_date'),
      // Contacts
      admin
        .from('kenya_trip_contacts')
        .select('*')
        .eq('trip_id', trip.id)
        .order('name'),
      // Announcements (published)
      admin
        .from('kenya_trip_announcements')
        .select('id, trip_id, title, content, priority, target_audience, publish_at, is_pinned')
        .eq('trip_id', trip.id)
        .lte('publish_at', new Date().toISOString())
        .order('is_pinned', { ascending: false })
        .order('publish_at', { ascending: false }),
      // Documents
      admin
        .from('kenya_trip_documents')
        .select('id, name, description, category, file_url, is_required')
        .eq('trip_id', trip.id)
        .order('sort_order'),
      // FAQs (published)
      admin
        .from('kenya_trip_faqs')
        .select('id, question, answer, category')
        .eq('trip_id', trip.id)
        .eq('is_published', true)
        .order('sort_order'),
      // This partner's proposals
      admin
        .from('kenya_trip_partner_proposals')
        .select('*')
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false }),
      // All active partners (with member info joined)
      admin
        .from('kenya_trip_partners')
        .select('id, partner_type, organization, title, city, member_id, members(first_name, last_name)')
        .eq('trip_id', trip.id)
        .eq('is_active', true),
    ])

    // Flatten allPartners to include first_name, last_name from members join
    const allPartners = (allPartnersRes.data || []).map((p: Record<string, unknown>) => {
      const m = p.members as { first_name: string; last_name: string } | null
      return {
        id: p.id,
        partner_type: p.partner_type,
        organization: p.organization,
        title: p.title,
        city: p.city,
        first_name: m?.first_name || '',
        last_name: m?.last_name || '',
      }
    })

    return NextResponse.json({
      partner,
      trip,
      member: {
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
      },
      delegates: delegatesRes.data || [],
      itinerary: itineraryRes.data || [],
      conferenceSessions: conferenceSessionsRes.data || [],
      logisticsMatrix: logisticsMatrixRes.data || [],
      lodging: lodgingRes.data || [],
      contacts: contactsRes.data || [],
      announcements: announcementsRes.data || [],
      documents: documentsRes.data || [],
      faqs: faqsRes.data || [],
      proposals: proposalsRes.data || [],
      allPartners,
    })
  } catch (error) {
    console.error('Partner API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

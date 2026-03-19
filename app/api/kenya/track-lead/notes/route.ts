import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function validateTrackLead(admin: any, userId: string) {
  const { data: member } = await admin
    .from('members')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!member) return null

  const { data: trip } = await admin
    .from('kenya_trips')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!trip) return null

  const { data: participant } = await admin
    .from('kenya_trip_participants')
    .select('id, service_track, team_leader')
    .eq('trip_id', trip.id)
    .eq('member_id', member.id)
    .single()

  if (!participant || !participant.team_leader) return null

  return { member, trip, participant }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const ctx = await validateTrackLead(admin, user.id)

    if (!ctx) {
      return NextResponse.json({ error: 'Not a track lead' }, { status: 403 })
    }

    const { data: notes, error } = await admin
      .from('kenya_trip_track_lead_notes')
      .select('*')
      .eq('author_id', ctx.participant.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    return NextResponse.json({ notes: notes || [] })
  } catch (error) {
    console.error('Track lead notes GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const ctx = await validateTrackLead(admin, user.id)

    if (!ctx) {
      return NextResponse.json({ error: 'Not a track lead' }, { status: 403 })
    }

    const body = await request.json()
    const { participant_id, note } = body

    if (!participant_id || typeof note !== 'string') {
      return NextResponse.json({ error: 'participant_id and note are required' }, { status: 400 })
    }

    // Verify the target participant is in the same track (or lead is Flex)
    const isFlex = ctx.participant.service_track === 'Flex'
    if (!isFlex) {
      const { data: target } = await admin
        .from('kenya_trip_participants')
        .select('id, service_track')
        .eq('id', participant_id)
        .single()

      if (!target || target.service_track !== ctx.participant.service_track) {
        return NextResponse.json({ error: 'Participant not in your track' }, { status: 403 })
      }
    }

    // Upsert — if a note already exists for this participant by this author, update it
    const { data: existing } = await admin
      .from('kenya_trip_track_lead_notes')
      .select('id')
      .eq('participant_id', participant_id)
      .eq('author_id', ctx.participant.id)
      .single()

    let result
    if (existing) {
      const { data, error } = await admin
        .from('kenya_trip_track_lead_notes')
        .update({ note, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating note:', error)
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
      }
      result = data
    } else {
      const { data, error } = await admin
        .from('kenya_trip_track_lead_notes')
        .insert({
          participant_id,
          author_id: ctx.participant.id,
          note,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating note:', error)
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({ note: result })
  } catch (error) {
    console.error('Track lead notes POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

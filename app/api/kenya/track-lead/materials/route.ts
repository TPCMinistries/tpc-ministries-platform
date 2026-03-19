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

async function verifyTrackDetailOwnership(admin: any, trackDetailId: string, track: string, isFlex: boolean) {
  const { data: detail } = await admin
    .from('kenya_trip_track_details')
    .select('id, track')
    .eq('id', trackDetailId)
    .single()

  if (!detail) return false
  if (isFlex) return true
  return detail.track === track
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
    const { track_detail_id, item_name } = body

    if (!track_detail_id || !item_name) {
      return NextResponse.json({ error: 'track_detail_id and item_name are required' }, { status: 400 })
    }

    const isFlex = ctx.participant.service_track === 'Flex'
    const isOwner = await verifyTrackDetailOwnership(admin, track_detail_id, ctx.participant.service_track, isFlex)

    if (!isOwner) {
      return NextResponse.json({ error: 'Track detail not in your track' }, { status: 403 })
    }

    // Get max sort_order for this track detail
    const { data: maxSort } = await admin
      .from('kenya_trip_track_materials')
      .select('sort_order')
      .eq('track_detail_id', track_detail_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxSort?.sort_order ?? -1) + 1

    const { data: material, error } = await admin
      .from('kenya_trip_track_materials')
      .insert({
        track_detail_id,
        item_name,
        is_checked: false,
        sort_order: nextOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding material:', error)
      return NextResponse.json({ error: 'Failed to add material' }, { status: 500 })
    }

    return NextResponse.json({ material })
  } catch (error) {
    console.error('Track lead materials POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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
    const { id, is_checked } = body

    if (!id || typeof is_checked !== 'boolean') {
      return NextResponse.json({ error: 'id and is_checked (boolean) are required' }, { status: 400 })
    }

    // Verify material belongs to track lead's track
    const { data: material } = await admin
      .from('kenya_trip_track_materials')
      .select('id, track_detail_id')
      .eq('id', id)
      .single()

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    const isFlex = ctx.participant.service_track === 'Flex'
    const isOwner = await verifyTrackDetailOwnership(admin, material.track_detail_id, ctx.participant.service_track, isFlex)

    if (!isOwner) {
      return NextResponse.json({ error: 'Material not in your track' }, { status: 403 })
    }

    const { data: updated, error } = await admin
      .from('kenya_trip_track_materials')
      .update({ is_checked })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling material:', error)
      return NextResponse.json({ error: 'Failed to update material' }, { status: 500 })
    }

    return NextResponse.json({ material: updated })
  } catch (error) {
    console.error('Track lead materials PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 })
    }

    // Verify material belongs to track lead's track
    const { data: material } = await admin
      .from('kenya_trip_track_materials')
      .select('id, track_detail_id')
      .eq('id', id)
      .single()

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    const isFlex = ctx.participant.service_track === 'Flex'
    const isOwner = await verifyTrackDetailOwnership(admin, material.track_detail_id, ctx.participant.service_track, isFlex)

    if (!isOwner) {
      return NextResponse.json({ error: 'Material not in your track' }, { status: 403 })
    }

    const { error } = await admin
      .from('kenya_trip_track_materials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting material:', error)
      return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track lead materials DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

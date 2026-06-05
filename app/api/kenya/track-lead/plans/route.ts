import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function validateTrackLead(admin: ReturnType<typeof createAdminClient>, userId: string) {
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

    const isFlex = ctx.participant.service_track === 'Flex'
    let query = admin
      .from('kenya_trip_track_plans')
      .select('*')
      .eq('trip_id', ctx.trip.id)

    if (!isFlex) {
      query = query.eq('service_track', ctx.participant.service_track)
    }

    const { data: plans, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching plans:', error)
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
    }

    return NextResponse.json({ plans: plans || [] })
  } catch (error) {
    console.error('Track lead plans GET error:', error)
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
    const { title, content, plan_type } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const validTypes = ['general', 'timeline', 'logistics', 'prep']
    const safeType = validTypes.includes(plan_type) ? plan_type : 'general'

    const { data: plan, error } = await admin
      .from('kenya_trip_track_plans')
      .insert({
        trip_id: ctx.trip.id,
        service_track: ctx.participant.service_track,
        title,
        content: content || '',
        plan_type: safeType,
        author_id: ctx.participant.id,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating plan:', error)
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Track lead plans POST error:', error)
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
    const { id, title, content, plan_type, status } = body

    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Verify plan belongs to the track lead's track
    const { data: existing } = await admin
      .from('kenya_trip_track_plans')
      .select('id, service_track')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const isFlex = ctx.participant.service_track === 'Flex'
    if (!isFlex && existing.service_track !== ctx.participant.service_track) {
      return NextResponse.json({ error: 'Plan not in your track' }, { status: 403 })
    }

    const updates: Record<string, string> = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (plan_type !== undefined) {
      const validTypes = ['general', 'timeline', 'logistics', 'prep']
      if (validTypes.includes(plan_type)) updates.plan_type = plan_type
    }
    if (status !== undefined) {
      // Track leads can only set draft or shared — approved is admin-only
      if (['draft', 'shared'].includes(status)) updates.status = status
    }

    const { data: plan, error } = await admin
      .from('kenya_trip_track_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating plan:', error)
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Track lead plans PUT error:', error)
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
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Verify plan belongs to the track lead's track
    const { data: existing } = await admin
      .from('kenya_trip_track_plans')
      .select('id, service_track')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const isFlex = ctx.participant.service_track === 'Flex'
    if (!isFlex && existing.service_track !== ctx.participant.service_track) {
      return NextResponse.json({ error: 'Plan not in your track' }, { status: 403 })
    }

    const { error } = await admin
      .from('kenya_trip_track_plans')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting plan:', error)
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track lead plans DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

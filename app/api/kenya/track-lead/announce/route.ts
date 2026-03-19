import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Get member
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
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!trip) {
      return NextResponse.json({ error: 'No trip found' }, { status: 404 })
    }

    // Validate track lead
    const { data: participant } = await admin
      .from('kenya_trip_participants')
      .select('id, service_track, team_leader')
      .eq('trip_id', trip.id)
      .eq('member_id', member.id)
      .single()

    if (!participant || !participant.team_leader) {
      return NextResponse.json({ error: 'Not a track lead' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, priority } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const validPriorities = ['normal', 'important', 'urgent']
    const safePriority = validPriorities.includes(priority) ? priority : 'normal'

    // Create announcement scoped to the track
    const { data: announcement, error } = await admin
      .from('kenya_trip_announcements')
      .insert({
        trip_id: trip.id,
        title,
        content,
        priority: safePriority,
        target_audience: participant.service_track,
        publish_at: new Date().toISOString(),
        is_pinned: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating announcement:', error)
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
    }

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error('Track lead announce error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

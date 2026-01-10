import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch community activity feed
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // Filter by activity type
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('community_activity')
      .select(`
        id,
        activity_type,
        title,
        description,
        metadata,
        created_at,
        member:members!community_activity_member_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by type if specified
    if (type) {
      query = query.eq('activity_type', type)
    }

    const { data: activities, error, count } = await query

    if (error) {
      console.error('Error fetching activity feed:', error)
      return NextResponse.json({ error: 'Failed to fetch activity feed' }, { status: 500 })
    }

    return NextResponse.json({
      activities: activities || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in activity feed API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Log a new activity (for manual logging from app)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member ID
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const { activity_type, title, description, metadata, is_public = true } = body

    if (!activity_type || !title) {
      return NextResponse.json({ error: 'activity_type and title are required' }, { status: 400 })
    }

    // Valid activity types
    const validTypes = [
      'assessment_complete',
      'group_join',
      'badge_earned',
      'discussion_created',
      'course_complete',
      'milestone_reached',
      'testimony_shared',
      'streak_achieved'
    ]

    if (!validTypes.includes(activity_type)) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
    }

    const { data: activity, error: insertError } = await supabase
      .from('community_activity')
      .insert({
        member_id: member.id,
        activity_type,
        title,
        description,
        metadata: metadata || {},
        is_public
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error logging activity:', insertError)
      return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
    }

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    console.error('Error in log activity API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

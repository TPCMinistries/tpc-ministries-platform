import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - List discussions for a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const groupId = params.id

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

    // Check if member is in this group
    const { data: membership } = await supabase
      .from('group_members')
      .select('id, role')
      .eq('group_id', groupId)
      .eq('member_id', member.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Fetch discussions with author info
    const { data: discussions, error: discussionsError, count } = await supabase
      .from('group_discussions')
      .select(`
        id,
        title,
        content,
        is_pinned,
        is_locked,
        reply_count,
        last_activity_at,
        created_at,
        member:members!group_discussions_member_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('group_id', groupId)
      .order('is_pinned', { ascending: false })
      .order('last_activity_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (discussionsError) {
      console.error('Error fetching discussions:', discussionsError)
      return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 })
    }

    return NextResponse.json({
      discussions: discussions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      membership: {
        role: membership.role
      }
    })
  } catch (error) {
    console.error('Error in discussions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new discussion
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const groupId = params.id

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

    // Check if member is in this group
    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('member_id', member.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Get request body
    const body = await request.json()
    const { title, content } = body

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    if (title.length > 255) {
      return NextResponse.json({ error: 'Title must be 255 characters or less' }, { status: 400 })
    }

    // Create the discussion
    const { data: discussion, error: createError } = await supabase
      .from('group_discussions')
      .insert({
        group_id: groupId,
        member_id: member.id,
        title: title.trim(),
        content: content.trim()
      })
      .select(`
        id,
        title,
        content,
        is_pinned,
        is_locked,
        reply_count,
        last_activity_at,
        created_at,
        member:members!group_discussions_member_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single()

    if (createError) {
      console.error('Error creating discussion:', createError)
      return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 })
    }

    return NextResponse.json({ discussion }, { status: 201 })
  } catch (error) {
    console.error('Error in create discussion API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

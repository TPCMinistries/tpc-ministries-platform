import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get a single discussion with replies
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; discussionId: string } }
) {
  try {
    const supabase = await createClient()
    const { id: groupId, discussionId } = params

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

    // Fetch the discussion
    const { data: discussion, error: discussionError } = await supabase
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
        updated_at,
        member:members!group_discussions_member_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', discussionId)
      .eq('group_id', groupId)
      .single()

    if (discussionError || !discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
    }

    // Fetch replies
    const { data: replies, error: repliesError } = await supabase
      .from('group_discussion_replies')
      .select(`
        id,
        content,
        parent_reply_id,
        is_edited,
        created_at,
        updated_at,
        member:members!group_discussion_replies_member_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true })

    if (repliesError) {
      console.error('Error fetching replies:', repliesError)
    }

    return NextResponse.json({
      discussion,
      replies: replies || [],
      membership: {
        role: membership.role,
        memberId: member.id
      }
    })
  } catch (error) {
    console.error('Error in discussion API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a discussion (title, content, pin, lock)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; discussionId: string } }
) {
  try {
    const supabase = await createClient()
    const { id: groupId, discussionId } = params

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

    // Check membership and get discussion
    const { data: membership } = await supabase
      .from('group_members')
      .select('id, role')
      .eq('group_id', groupId)
      .eq('member_id', member.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Get the discussion to check ownership
    const { data: discussion } = await supabase
      .from('group_discussions')
      .select('member_id')
      .eq('id', discussionId)
      .eq('group_id', groupId)
      .single()

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
    }

    const isAuthor = discussion.member_id === member.id
    const isAdmin = ['admin', 'leader'].includes(membership.role)

    const body = await request.json()
    const updates: any = {}

    // Authors can update title and content
    if (isAuthor) {
      if (body.title !== undefined) updates.title = body.title.trim()
      if (body.content !== undefined) updates.content = body.content.trim()
    }

    // Admins can pin and lock
    if (isAdmin) {
      if (body.is_pinned !== undefined) updates.is_pinned = body.is_pinned
      if (body.is_locked !== undefined) updates.is_locked = body.is_locked
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('group_discussions')
      .update(updates)
      .eq('id', discussionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating discussion:', updateError)
      return NextResponse.json({ error: 'Failed to update discussion' }, { status: 500 })
    }

    return NextResponse.json({ discussion: updated })
  } catch (error) {
    console.error('Error in update discussion API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a discussion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; discussionId: string } }
) {
  try {
    const supabase = await createClient()
    const { id: groupId, discussionId } = params

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

    // Check membership
    const { data: membership } = await supabase
      .from('group_members')
      .select('id, role')
      .eq('group_id', groupId)
      .eq('member_id', member.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Get the discussion to check ownership
    const { data: discussion } = await supabase
      .from('group_discussions')
      .select('member_id')
      .eq('id', discussionId)
      .eq('group_id', groupId)
      .single()

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
    }

    const isAuthor = discussion.member_id === member.id
    const isAdmin = ['admin', 'leader'].includes(membership.role)

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('group_discussions')
      .delete()
      .eq('id', discussionId)

    if (deleteError) {
      console.error('Error deleting discussion:', deleteError)
      return NextResponse.json({ error: 'Failed to delete discussion' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete discussion API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

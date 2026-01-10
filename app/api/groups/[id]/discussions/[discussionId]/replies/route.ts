import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Create a reply to a discussion
export async function POST(
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
      .select('id')
      .eq('group_id', groupId)
      .eq('member_id', member.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Check if discussion exists and is not locked
    const { data: discussion } = await supabase
      .from('group_discussions')
      .select('id, is_locked')
      .eq('id', discussionId)
      .eq('group_id', groupId)
      .single()

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
    }

    if (discussion.is_locked) {
      return NextResponse.json({ error: 'This discussion is locked' }, { status: 403 })
    }

    // Get request body
    const body = await request.json()
    const { content, parent_reply_id } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // If replying to another reply, verify it exists in this discussion
    if (parent_reply_id) {
      const { data: parentReply } = await supabase
        .from('group_discussion_replies')
        .select('id')
        .eq('id', parent_reply_id)
        .eq('discussion_id', discussionId)
        .single()

      if (!parentReply) {
        return NextResponse.json({ error: 'Parent reply not found' }, { status: 404 })
      }
    }

    // Create the reply
    const { data: reply, error: createError } = await supabase
      .from('group_discussion_replies')
      .insert({
        discussion_id: discussionId,
        member_id: member.id,
        content: content.trim(),
        parent_reply_id: parent_reply_id || null
      })
      .select(`
        id,
        content,
        parent_reply_id,
        is_edited,
        created_at,
        member:members!group_discussion_replies_member_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single()

    if (createError) {
      console.error('Error creating reply:', createError)
      return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
    }

    return NextResponse.json({ reply }, { status: 201 })
  } catch (error) {
    console.error('Error in create reply API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a reply
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; discussionId: string } }
) {
  try {
    const supabase = await createClient()
    const { discussionId } = params

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
    const { reply_id, content } = body

    if (!reply_id || !content?.trim()) {
      return NextResponse.json({ error: 'Reply ID and content are required' }, { status: 400 })
    }

    // Verify the reply exists and belongs to this member
    const { data: reply } = await supabase
      .from('group_discussion_replies')
      .select('id, member_id')
      .eq('id', reply_id)
      .eq('discussion_id', discussionId)
      .single()

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
    }

    if (reply.member_id !== member.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Update the reply
    const { data: updated, error: updateError } = await supabase
      .from('group_discussion_replies')
      .update({
        content: content.trim(),
        is_edited: true
      })
      .eq('id', reply_id)
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
      .single()

    if (updateError) {
      console.error('Error updating reply:', updateError)
      return NextResponse.json({ error: 'Failed to update reply' }, { status: 500 })
    }

    return NextResponse.json({ reply: updated })
  } catch (error) {
    console.error('Error in update reply API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a reply
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

    const searchParams = request.nextUrl.searchParams
    const replyId = searchParams.get('reply_id')

    if (!replyId) {
      return NextResponse.json({ error: 'Reply ID is required' }, { status: 400 })
    }

    // Check membership role
    const { data: membership } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('member_id', member.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Get the reply
    const { data: reply } = await supabase
      .from('group_discussion_replies')
      .select('id, member_id')
      .eq('id', replyId)
      .eq('discussion_id', discussionId)
      .single()

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
    }

    const isAuthor = reply.member_id === member.id
    const isAdmin = ['admin', 'leader'].includes(membership.role)

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('group_discussion_replies')
      .delete()
      .eq('id', replyId)

    if (deleteError) {
      console.error('Error deleting reply:', deleteError)
      return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete reply API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

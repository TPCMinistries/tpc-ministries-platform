import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PUT update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { comment_text } = body

    if (!comment_text || comment_text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment text is required' },
        { status: 400 }
      )
    }

    const { data: comment, error } = await supabase
      .from('teaching_comments')
      .update({
        comment_text: comment_text.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.commentId)
      .eq('member_id', member.id)
      .select(`
        id,
        comment_text,
        created_at,
        updated_at,
        member:members(id, full_name)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Comment updated successfully',
      comment,
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// DELETE soft delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('teaching_comments')
      .update({ is_deleted: true })
      .eq('id', params.commentId)
      .eq('member_id', member.id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET comments for a teaching
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: comments, error } = await supabase
      .from('teaching_comments')
      .select(`
        id,
        comment_text,
        created_at,
        updated_at,
        member:members(id, full_name)
      `)
      .eq('teaching_id', params.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      comments,
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST create a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
      .select('id, full_name')
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
      .insert({
        teaching_id: params.id,
        member_id: member.id,
        comment_text: comment_text.trim(),
      })
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
      message: 'Comment added successfully',
      comment,
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

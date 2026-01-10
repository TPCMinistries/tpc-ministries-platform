import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Submit a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient()
    const { slug } = params

    // Get the post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('id, comments_enabled')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (!post.comments_enabled) {
      return NextResponse.json({ error: 'Comments are disabled for this post' }, { status: 400 })
    }

    const body = await request.json()
    const { content, guest_name, guest_email, parent_id } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    let memberId = null

    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (member) {
        memberId = member.id
      }
    } else {
      // For guests, require name and email
      if (!guest_name || !guest_email) {
        return NextResponse.json(
          { error: 'Name and email required for guest comments' },
          { status: 400 }
        )
      }
    }

    // Create comment (auto-approve for logged-in members)
    const { data: comment, error } = await supabase
      .from('blog_comments')
      .insert({
        post_id: post.id,
        member_id: memberId,
        guest_name: memberId ? null : guest_name,
        guest_email: memberId ? null : guest_email,
        content: content.trim(),
        parent_id: parent_id || null,
        is_approved: !!memberId // Auto-approve for members
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 })
    }

    return NextResponse.json({
      comment,
      message: memberId
        ? 'Comment posted successfully'
        : 'Comment submitted for review'
    }, { status: 201 })
  } catch (error) {
    console.error('Error in comment POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

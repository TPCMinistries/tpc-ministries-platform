import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    // Require staff/admin access
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = await createClient()

    const body = await request.json()
    const {
      title,
      type,
      author,
      description,
      duration,
      topic,
      status = 'draft',
      video_url,
      audio_url,
      pdf_url,
      content,
      scriptures,
    } = body

    // Validate required fields
    if (!title || !type || !author || !description || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create the teaching
    const { data, error } = await supabase
      .from('teachings')
      .insert({
        slug,
        title,
        type,
        author,
        description,
        duration,
        topic,
        status,
        video_url,
        audio_url,
        pdf_url,
        content,
        scriptures,
        views: 0,
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating teaching:', error)
      return NextResponse.json(
        { error: 'Failed to create teaching' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Teaching created successfully', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in teaching create API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

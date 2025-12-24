import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Check if user is admin
    // For now, allow all authenticated users

    const body = await request.json()
    const {
      title,
      audio_url,
      video_url,
      transcript,
      theme,
      is_featured = false,
      publish_date,
      scriptures,
      excerpt,
      tier_required = 'free',
    } = body

    // Validate required fields
    if (!title || !transcript || !theme) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Determine status based on publish_date
    const now = new Date()
    const publishDate = publish_date ? new Date(publish_date) : now
    const status = publishDate <= now ? 'published' : 'scheduled'

    // Create the public prophecy
    const { data, error } = await supabase
      .from('public_prophecies')
      .insert({
        title,
        audio_url,
        video_url,
        transcript,
        theme,
        is_featured,
        status,
        date: publishDate.toISOString(),
        scriptures,
        excerpt: excerpt || transcript.substring(0, 200) + '...',
        tier_required,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating public prophecy:', error)
      return NextResponse.json(
        { error: 'Failed to create prophecy' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Public prophecy created successfully', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in upload prophecy API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

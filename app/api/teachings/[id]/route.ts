import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from('teachings')
      .select(`
        id,
        slug,
        title,
        type,
        author,
        description,
        duration,
        views,
        topic,
        status,
        thumbnail,
        video_url,
        audio_url,
        pdf_url,
        content,
        scriptures,
        created_at,
        published_at
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Teaching not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await supabase
      .from('teachings')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error fetching teaching:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

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
    } = body

    const updates: any = {}

    if (title) updates.title = title
    if (type) updates.type = type
    if (author) updates.author = author
    if (description) updates.description = description
    if (duration) updates.duration = duration
    if (topic) updates.topic = topic
    if (status) updates.status = status
    if (video_url !== undefined) updates.video_url = video_url
    if (audio_url !== undefined) updates.audio_url = audio_url
    if (pdf_url !== undefined) updates.pdf_url = pdf_url
    if (content !== undefined) updates.content = content
    if (scriptures !== undefined) updates.scriptures = scriptures

    // Update slug if title changed
    if (title) {
      updates.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    // Update the teaching
    const { data, error: updateError } = await supabase
      .from('teachings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating teaching:', updateError)
      return NextResponse.json(
        { error: 'Failed to update teaching' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Teaching updated successfully', data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in teaching update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Check if user is admin

    // Delete the teaching
    const { error: deleteError } = await supabase
      .from('teachings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting teaching:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete teaching' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Teaching deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in teaching delete API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
      member_id,
      delivery_method,
      audio_url,
      video_url,
      transcript,
      themes,
      admin_notes,
      title,
    } = body

    // Validate required fields
    if (!member_id || !transcript || !themes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert themes string to array if needed
    const themesArray = typeof themes === 'string'
      ? themes.split(',').map(t => t.trim())
      : themes

    // Generate title from first sentence if not provided
    const generatedTitle = title || transcript.split('.')[0].substring(0, 100)

    // Create the personal prophecy
    const { data, error } = await supabase
      .from('personal_prophecies')
      .insert({
        member_id,
        delivery_method: delivery_method || 'in-person',
        audio_url,
        video_url,
        transcript,
        themes: themesArray,
        admin_notes,
        title: generatedTitle,
        date: new Date().toISOString(),
        fulfillment_status: 'unfolding',
        given_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating personal prophecy:', error)
      return NextResponse.json(
        { error: 'Failed to create personal prophecy' },
        { status: 500 }
      )
    }

    // TODO: Send notification to member
    // This could be an email, in-app notification, or both

    return NextResponse.json(
      { message: 'Personal prophecy assigned successfully', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in assign prophecy API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

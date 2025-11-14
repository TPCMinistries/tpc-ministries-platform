import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { teaching_id, progress, is_completed = false } = body

    if (!teaching_id || progress === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if progress record already exists
    const { data: existing, error: fetchError } = await supabase
      .from('teaching_progress')
      .select('id, progress')
      .eq('member_id', user.id)
      .eq('teaching_id', teaching_id)
      .single()

    if (existing) {
      // Update existing progress
      const { data, error: updateError } = await supabase
        .from('teaching_progress')
        .update({
          progress,
          is_completed,
          last_accessed: new Date().toISOString(),
          completed_at: is_completed ? new Date().toISOString() : null,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating progress:', updateError)
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { message: 'Progress updated successfully', data },
        { status: 200 }
      )
    } else {
      // Create new progress record
      const { data, error: insertError } = await supabase
        .from('teaching_progress')
        .insert({
          member_id: user.id,
          teaching_id,
          progress,
          is_completed,
          last_accessed: new Date().toISOString(),
          completed_at: is_completed ? new Date().toISOString() : null,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating progress:', insertError)
        return NextResponse.json(
          { error: 'Failed to create progress' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { message: 'Progress created successfully', data },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Error in track progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const teaching_id = searchParams.get('teaching_id')

    if (teaching_id) {
      // Get progress for specific teaching
      const { data, error } = await supabase
        .from('teaching_progress')
        .select('*')
        .eq('member_id', user.id)
        .eq('teaching_id', teaching_id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching progress:', error)
        return NextResponse.json(
          { error: 'Failed to fetch progress' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { progress: data || null },
        { status: 200 }
      )
    } else {
      // Get all progress for user
      const { data, error } = await supabase
        .from('teaching_progress')
        .select(`
          *,
          teachings:teaching_id (
            id,
            slug,
            title,
            type,
            author,
            duration,
            thumbnail
          )
        `)
        .eq('member_id', user.id)
        .order('last_accessed', { ascending: false })

      if (error) {
        console.error('Error fetching all progress:', error)
        return NextResponse.json(
          { error: 'Failed to fetch progress' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { progress: data || [] },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error in get progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

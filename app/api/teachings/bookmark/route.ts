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
    const { teaching_id } = body

    if (!teaching_id) {
      return NextResponse.json(
        { error: 'Missing teaching_id' },
        { status: 400 }
      )
    }

    // Check if already bookmarked
    const { data: existing, error: fetchError } = await supabase
      .from('teaching_bookmarks')
      .select('id')
      .eq('member_id', user.id)
      .eq('teaching_id', teaching_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Teaching already bookmarked' },
        { status: 400 }
      )
    }

    // Create bookmark
    const { data, error: insertError } = await supabase
      .from('teaching_bookmarks')
      .insert({
        member_id: user.id,
        teaching_id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating bookmark:', insertError)
      return NextResponse.json(
        { error: 'Failed to create bookmark' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Bookmark created successfully', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in bookmark create API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!teaching_id) {
      return NextResponse.json(
        { error: 'Missing teaching_id' },
        { status: 400 }
      )
    }

    // Delete bookmark
    const { error: deleteError } = await supabase
      .from('teaching_bookmarks')
      .delete()
      .eq('member_id', user.id)
      .eq('teaching_id', teaching_id)

    if (deleteError) {
      console.error('Error deleting bookmark:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete bookmark' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Bookmark removed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in bookmark delete API:', error)
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
      // Check if specific teaching is bookmarked
      const { data, error } = await supabase
        .from('teaching_bookmarks')
        .select('id')
        .eq('member_id', user.id)
        .eq('teaching_id', teaching_id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking bookmark:', error)
        return NextResponse.json(
          { error: 'Failed to check bookmark' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { is_bookmarked: !!data },
        { status: 200 }
      )
    } else {
      // Get all bookmarks for user
      const { data, error } = await supabase
        .from('teaching_bookmarks')
        .select(`
          id,
          created_at,
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
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bookmarks:', error)
        return NextResponse.json(
          { error: 'Failed to fetch bookmarks' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { bookmarks: data || [] },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error in bookmark get API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

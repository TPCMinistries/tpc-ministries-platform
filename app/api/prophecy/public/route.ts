import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const theme = searchParams.get('theme') || 'all'
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query for published public prophecies
    let query = supabase
      .from('public_prophecies')
      .select(`
        id,
        title,
        theme,
        date,
        duration,
        audio_url,
        video_url,
        thumbnail,
        excerpt,
        is_featured,
        created_at
      `, { count: 'exact' })
      .eq('status', 'published')

    // Filter by theme
    if (theme !== 'all') {
      query = query.eq('theme', theme)
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    // Sort by date (newest first)
    query = query.order('date', { ascending: false })

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching public prophecies:', error)
      return NextResponse.json(
        { error: 'Failed to fetch prophecies' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        prophecies: data || [],
        total: count || 0,
        limit,
        offset,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in public prophecies API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

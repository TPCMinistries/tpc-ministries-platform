import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const type = searchParams.get('type') || 'all'
    const topic = searchParams.get('topic') || 'all'
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'published'
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
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
        created_at,
        published_at
      `, { count: 'exact' })

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Filter by type
    if (type !== 'all') {
      query = query.eq('type', type)
    }

    // Filter by topic
    if (topic !== 'all') {
      query = query.eq('topic', topic)
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Sorting
    switch (sort) {
      case 'popular':
        query = query.order('views', { ascending: false })
        break
      case 'oldest':
        query = query.order('published_at', { ascending: true })
        break
      case 'newest':
      default:
        query = query.order('published_at', { ascending: false })
        break
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching teachings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch teachings' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        teachings: data || [],
        total: count || 0,
        limit,
        offset,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in teachings list API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

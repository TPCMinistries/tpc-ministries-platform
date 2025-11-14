import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const category = searchParams.get('category') || 'all'
    const sort = searchParams.get('sort') || 'newest'
    const answered = searchParams.get('answered') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query
    let query = supabase
      .from('prayer_requests')
      .select(`
        id,
        request_text,
        category,
        is_anonymous,
        is_answered,
        answered_testimony,
        prayer_count,
        created_at,
        member_id,
        members:member_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('status', 'active') // Only show approved prayers
      .eq('is_public', true)   // Only show public prayers

    // Filter by answered status
    query = query.eq('is_answered', answered)

    // Filter by category
    if (category !== 'all') {
      query = query.eq('category', category)
    }

    // Sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'most-prayed':
        query = query.order('prayer_count', { ascending: false })
        break
      case 'urgent':
        query = query.eq('is_urgent', true).order('created_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Pagination
    const start = (page - 1) * limit
    const end = start + limit - 1
    query = query.range(start, end)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching prayer requests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch prayer requests' },
        { status: 500 }
      )
    }

    // Transform data to hide member details for anonymous requests
    const transformedData = data?.map(prayer => ({
      ...prayer,
      requester: prayer.is_anonymous
        ? 'Anonymous'
        : prayer.members?.raw_user_meta_data?.full_name || 'Member',
      members: undefined, // Remove member data from response
      member_id: undefined, // Remove member_id for privacy
    }))

    return NextResponse.json(
      {
        data: transformedData,
        pagination: {
          page,
          limit,
          total: count,
          hasMore: end < (count || 0),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in prayer list API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

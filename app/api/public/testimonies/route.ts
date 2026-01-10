import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get approved testimonies
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    let query = supabase
      .from('testimonies')
      .select(`
        id,
        title,
        content,
        category,
        image_url,
        video_url,
        is_anonymous,
        is_featured,
        likes_count,
        created_at,
        member:members!testimonies_member_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (featured) {
      query = query.eq('is_featured', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: testimonies, count, error } = await query

    if (error) {
      console.error('Error fetching testimonies:', error)
      return NextResponse.json({ error: 'Failed to fetch testimonies' }, { status: 500 })
    }

    // Process testimonies to handle anonymous ones
    const processedTestimonies = testimonies?.map(t => ({
      ...t,
      member: t.is_anonymous ? null : t.member
    }))

    return NextResponse.json({
      testimonies: processedTestimonies,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in testimonies GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get public photo albums
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category') || 'all'
    const search = searchParams.get('search') || ''
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    // Build query for public albums
    let query = supabase
      .from('photo_albums')
      .select(`
        id,
        title,
        slug,
        description,
        category,
        date,
        location,
        photo_count,
        view_count,
        photographer,
        is_featured,
        created_at,
        cover_photo:photos!photo_albums_cover_photo_id_fkey(
          id,
          thumbnail_url,
          medium_url
        )
      `, { count: 'exact' })
      .eq('is_public', true)
      .order('date', { ascending: false, nullsFirst: false })

    // Filter by category
    if (category !== 'all') {
      query = query.eq('category', category)
    }

    // Filter featured
    if (featured) {
      query = query.eq('is_featured', true)
    }

    // Search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: albums, error, count } = await query

    if (error) {
      console.error('Error fetching albums:', error)
      return NextResponse.json({ albums: [], categories: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } })
    }

    // Get categories for filter
    const { data: categoriesData } = await supabase
      .from('photo_albums')
      .select('category')
      .eq('is_public', true)
      .not('category', 'is', null)

    const categories = [...new Set(categoriesData?.map(c => c.category) || [])]

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      albums: albums || [],
      categories,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })
  } catch (error) {
    console.error('Gallery API error:', error)
    return NextResponse.json({ albums: [], categories: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } })
  }
}

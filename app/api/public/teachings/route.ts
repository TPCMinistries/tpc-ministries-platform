import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get all published teachings (public)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const contentType = searchParams.get('content_type') || 'all'
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    // Build query - only published teachings
    // Using minimal columns that should exist
    let query = supabase
      .from('teachings')
      .select('*', { count: 'exact' })
      .eq('is_published', true)

    // Filter by content type
    if (contentType !== 'all') {
      query = query.eq('content_type', contentType)
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Sorting
    switch (sort) {
      case 'popular':
        query = query.order('views', { ascending: false, nullsFirst: false })
        break
      case 'oldest':
        query = query.order('published_at', { ascending: true, nullsFirst: false })
        break
      case 'newest':
      default:
        query = query.order('published_at', { ascending: false, nullsFirst: false })
        break
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: teachings, error, count } = await query

    if (error) {
      console.error('Error fetching teachings:', error)
      // Return empty results instead of error for public page
      return NextResponse.json({
        teachings: [],
        topics: [],
        types: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0
        }
      })
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      teachings: teachings || [],
      topics: [],
      types: [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error in public teachings GET:', error)
    return NextResponse.json({
      teachings: [],
      topics: [],
      types: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      }
    })
  }
}

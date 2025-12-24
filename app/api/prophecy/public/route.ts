import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addAccessInfo } from '@/lib/auth/content-access'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Get user's role for content access
    let userRole = 'free'
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('user_id', user.id)
        .single()
      userRole = member?.role || 'free'
    }

    const theme = searchParams.get('theme') || 'all'
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query for published public prophecies - include tier_required
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
        tier_required,
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

    // Add access info to each prophecy (canAccess, requiredRole)
    const propheciesWithAccess = addAccessInfo(data || [], userRole, 'tier_required')

    return NextResponse.json(
      {
        prophecies: propheciesWithAccess,
        total: count || 0,
        limit,
        offset,
        userRole,
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

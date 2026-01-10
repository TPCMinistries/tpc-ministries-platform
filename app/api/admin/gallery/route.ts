import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - List all albums (admin view)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('is_admin, role')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin && member?.role !== 'admin' && member?.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const offset = (page - 1) * limit

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
        photographer,
        photo_count,
        view_count,
        is_public,
        is_featured,
        created_at,
        updated_at,
        cover_photo:photos!photo_albums_cover_photo_id_fkey(
          id,
          thumbnail_url,
          medium_url
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: albums, error, count } = await query

    if (error) {
      console.error('Error fetching albums:', error)
      return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 })
    }

    // Get unique categories
    const { data: categoriesData } = await supabase
      .from('photo_albums')
      .select('category')
      .not('category', 'is', null)

    const categories = [...new Set(categoriesData?.map(c => c.category) || [])]

    return NextResponse.json({
      albums: albums || [],
      categories,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Admin gallery API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new album
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, is_admin, role')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin && member?.role !== 'admin' && member?.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, date, location, photographer, is_public, is_featured } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('photo_albums')
      .select('slug')
      .ilike('slug', `${baseSlug}%`)

    let slug = baseSlug
    if (existing && existing.length > 0) {
      slug = `${baseSlug}-${existing.length + 1}`
    }

    const { data: album, error } = await supabase
      .from('photo_albums')
      .insert({
        title,
        slug,
        description: description || null,
        category: category || null,
        date: date || null,
        location: location || null,
        photographer: photographer || null,
        is_public: is_public ?? false,
        is_featured: is_featured ?? false,
        created_by: member.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating album:', error)
      return NextResponse.json({ error: 'Failed to create album' }, { status: 500 })
    }

    return NextResponse.json({ album })
  } catch (error) {
    console.error('Create album error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

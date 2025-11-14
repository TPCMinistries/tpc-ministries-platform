import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET all content for admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: member } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!member || member.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabase
      .from('teachings')
      .select(`
        id,
        title,
        slug,
        content_type,
        author,
        description,
        content_url,
        is_published,
        views_count,
        created_at,
        updated_at,
        season:seasons(id, name)
      `)
      .order('created_at', { ascending: false })

    if (type && type !== 'all') {
      query = query.eq('content_type', type)
    }

    if (status === 'published') {
      query = query.eq('is_published', true)
    } else if (status === 'draft') {
      query = query.eq('is_published', false)
    }

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      content: data,
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

// POST create new content
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: member } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!member || member.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      content_type,
      author,
      description,
      content_url,
      season_id,
      topic,
      scriptures,
      duration_minutes,
      is_published,
    } = body

    if (!title || !content_type || !author) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data, error } = await supabase
      .from('teachings')
      .insert({
        title,
        slug,
        content_type,
        author,
        description,
        content_url,
        season_id,
        topic,
        scriptures,
        duration_minutes,
        is_published: is_published || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Content created successfully',
      content: data,
    })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create content' },
      { status: 500 }
    )
  }
}

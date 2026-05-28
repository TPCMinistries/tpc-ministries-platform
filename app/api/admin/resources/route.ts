import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const tier = searchParams.get('tier')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    // Build query
    const supabase = createAdminClient()
    let query = supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    if (tier && tier !== 'all') {
      query = query.eq('tier_required', tier)
    }

    if (status === 'published') {
      query = query.eq('published', true)
    } else if (status === 'draft') {
      query = query.eq('published', false)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching resources:', error)
      return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in resources API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { title, description, type, file_url, thumbnail_url, category, tags, tier_required, is_published, author } = body

    if (!title || !file_url) {
      return NextResponse.json({ error: 'Title and file URL are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title,
        description,
        type: type || 'ebook',
        file_url,
        thumbnail_url,
        category,
        tags: tags || [],
        tier_required: tier_required || 'free',
        published: is_published || false,
        author,
        download_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating resource:', error)
      return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in resources API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

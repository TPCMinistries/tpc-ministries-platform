import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Props {
  params: Promise<{ slug: string }>
}

// GET - Get album details and photos
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    // Get album
    const { data: album, error: albumError } = await supabase
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
        created_at
      `)
      .eq('slug', slug)
      .eq('is_public', true)
      .single()

    if (albumError || !album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from('photo_albums')
      .update({ view_count: (album.view_count || 0) + 1 })
      .eq('id', album.id)

    // Get photos
    const { data: photos, error: photosError, count } = await supabase
      .from('photos')
      .select('*', { count: 'exact' })
      .eq('album_id', album.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (photosError) {
      console.error('Error fetching photos:', photosError)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      album,
      photos: photos || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })
  } catch (error) {
    console.error('Gallery album API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

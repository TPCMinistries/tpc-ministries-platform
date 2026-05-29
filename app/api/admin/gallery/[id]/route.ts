import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

// GET - Get album details with photos
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createAdminClient()

    // Get album
    const { data: album, error: albumError } = await supabase
      .from('photo_albums')
      .select(`
        *,
        cover_photo:photos!photo_albums_cover_photo_id_fkey(
          id,
          thumbnail_url,
          medium_url,
          original_url
        )
      `)
      .eq('id', id)
      .single()

    if (albumError || !album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    // Get photos
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (photosError) {
      console.error('Error fetching photos:', photosError)
    }

    return NextResponse.json({
      album,
      photos: photos || []
    })
  } catch (error) {
    console.error('Get album error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update album
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      date,
      location,
      photographer,
      is_public,
      is_featured,
      cover_photo_id
    } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (date !== undefined) updateData.date = date
    if (location !== undefined) updateData.location = location
    if (photographer !== undefined) updateData.photographer = photographer
    if (is_public !== undefined) updateData.is_public = is_public
    if (is_featured !== undefined) updateData.is_featured = is_featured
    if (cover_photo_id !== undefined) updateData.cover_photo_id = cover_photo_id

    const supabase = createAdminClient()
    const { data: album, error } = await supabase
      .from('photo_albums')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating album:', error)
      return NextResponse.json({ error: 'Failed to update album' }, { status: 500 })
    }

    return NextResponse.json({ album })
  } catch (error) {
    console.error('Update album error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete album
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createAdminClient()

    // Get photos to delete from storage
    const { data: photos } = await supabase
      .from('photos')
      .select('original_url, thumbnail_url, medium_url, large_url')
      .eq('album_id', id)

    // Delete photos from storage
    if (photos && photos.length > 0) {
      const filePaths: string[] = []
      photos.forEach(photo => {
        // Extract file path from URL
        [photo.original_url, photo.thumbnail_url, photo.medium_url, photo.large_url]
          .filter(Boolean)
          .forEach(url => {
            const match = url?.match(/\/gallery\/(.+)$/)
            if (match) {
              filePaths.push(`gallery/${match[1]}`)
            }
          })
      })

      if (filePaths.length > 0) {
        await supabase.storage.from('tpc-media').remove(filePaths)
      }
    }

    // Delete album (cascade will delete photos records)
    const { error } = await supabase
      .from('photo_albums')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting album:', error)
      return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete album error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

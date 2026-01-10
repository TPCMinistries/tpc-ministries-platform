import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Props {
  params: Promise<{ id: string }>
}

// POST - Add photos to album
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id: albumId } = await params
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

    // Verify album exists
    const { data: album, error: albumError } = await supabase
      .from('photo_albums')
      .select('id')
      .eq('id', albumId)
      .single()

    if (albumError || !album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    const body = await request.json()
    const { photos } = body

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json({ error: 'Photos array is required' }, { status: 400 })
    }

    // Get current max sort order
    const { data: lastPhoto } = await supabase
      .from('photos')
      .select('sort_order')
      .eq('album_id', albumId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    let sortOrder = (lastPhoto?.sort_order || 0) + 1

    // Insert photos
    const photosToInsert = photos.map((photo: {
      original_url: string
      thumbnail_url?: string
      medium_url?: string
      large_url?: string
      title?: string
      description?: string
      alt_text?: string
      width?: number
      height?: number
      file_size?: number
      mime_type?: string
    }) => ({
      album_id: albumId,
      original_url: photo.original_url,
      thumbnail_url: photo.thumbnail_url || photo.original_url,
      medium_url: photo.medium_url || photo.original_url,
      large_url: photo.large_url || photo.original_url,
      title: photo.title || null,
      description: photo.description || null,
      alt_text: photo.alt_text || null,
      width: photo.width || null,
      height: photo.height || null,
      file_size: photo.file_size || null,
      mime_type: photo.mime_type || 'image/jpeg',
      sort_order: sortOrder++,
      uploaded_by: member.id
    }))

    const { data: insertedPhotos, error: insertError } = await supabase
      .from('photos')
      .insert(photosToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting photos:', insertError)
      return NextResponse.json({ error: 'Failed to add photos' }, { status: 500 })
    }

    // Set cover photo if album doesn't have one
    const { data: albumData } = await supabase
      .from('photo_albums')
      .select('cover_photo_id')
      .eq('id', albumId)
      .single()

    if (!albumData?.cover_photo_id && insertedPhotos && insertedPhotos.length > 0) {
      await supabase
        .from('photo_albums')
        .update({ cover_photo_id: insertedPhotos[0].id })
        .eq('id', albumId)
    }

    return NextResponse.json({ photos: insertedPhotos })
  } catch (error) {
    console.error('Add photos error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update photo order
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id: albumId } = await params
    const supabase = await createClient()

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

    const body = await request.json()
    const { photoOrders } = body

    if (!photoOrders || !Array.isArray(photoOrders)) {
      return NextResponse.json({ error: 'photoOrders array is required' }, { status: 400 })
    }

    // Update each photo's sort order
    for (const { id, sort_order } of photoOrders) {
      await supabase
        .from('photos')
        .update({ sort_order })
        .eq('id', id)
        .eq('album_id', albumId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update photo order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete photos from album
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id: albumId } = await params
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

    const photoIds = searchParams.get('ids')?.split(',') || []

    if (photoIds.length === 0) {
      return NextResponse.json({ error: 'Photo IDs required' }, { status: 400 })
    }

    // Get photos to delete from storage
    const { data: photos } = await supabase
      .from('photos')
      .select('id, original_url, thumbnail_url, medium_url, large_url')
      .eq('album_id', albumId)
      .in('id', photoIds)

    // Delete from storage
    if (photos && photos.length > 0) {
      const filePaths: string[] = []
      photos.forEach(photo => {
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

    // Delete photo records
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('album_id', albumId)
      .in('id', photoIds)

    if (error) {
      console.error('Error deleting photos:', error)
      return NextResponse.json({ error: 'Failed to delete photos' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete photos error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

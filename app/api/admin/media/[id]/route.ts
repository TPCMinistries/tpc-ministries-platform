import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - Get single media item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Get media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update media metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const body = await request.json()
    const { alt_text, caption, tags, folder } = body

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('media_library')
      .update({
        alt_text: alt_text ?? undefined,
        caption: caption ?? undefined,
        tags: tags ?? undefined,
        folder: folder ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update media error:', error)
      return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Update media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete media from storage + DB
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const adminClient = createAdminClient()

    // Get file path first
    const { data: media, error: fetchError } = await adminClient
      .from('media_library')
      .select('file_path')
      .eq('id', id)
      .single()

    if (fetchError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await adminClient.storage
      .from('tpc-media')
      .remove([media.file_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue to delete DB record even if storage delete fails
    }

    // Delete DB record
    const { error: dbError } = await adminClient
      .from('media_library')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('DB delete error:', dbError)
      return NextResponse.json({ error: 'Failed to delete media record' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

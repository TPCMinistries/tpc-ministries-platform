import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - List/filter/search media
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const searchParams = request.nextUrl.searchParams
    const mediaType = searchParams.get('type')
    const folder = searchParams.get('folder')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '40')

    const supabase = createAdminClient()
    let query = supabase
      .from('media_library')
      .select('*', { count: 'exact' })

    if (mediaType && mediaType !== 'all') {
      query = query.eq('media_type', mediaType)
    }

    if (folder && folder !== 'all') {
      query = query.eq('folder', folder)
    }

    if (search) {
      query = query.or(`file_name.ilike.%${search}%,original_name.ilike.%${search}%,alt_text.ilike.%${search}%,caption.ilike.%${search}%`)
    }

    const start = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching media:', error)
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Media list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Upload file + create media record
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'general'
    const altText = formData.get('alt_text') as string
    const caption = formData.get('caption') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Determine media type from mime
    const mimeType = file.type
    let mediaType = 'document'
    if (mimeType.startsWith('image/')) mediaType = 'image'
    else if (mimeType.startsWith('video/')) mediaType = 'video'
    else if (mimeType.startsWith('audio/')) mediaType = 'audio'

    // Upload to storage
    const adminClient = createAdminClient()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${folder}/${Date.now()}-${safeName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await adminClient.storage
      .from('tpc-media')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from('tpc-media')
      .getPublicUrl(storagePath)

    // Create DB record
    const { data: mediaRecord, error: dbError } = await adminClient
      .from('media_library')
      .insert({
        file_name: safeName,
        original_name: file.name,
        file_path: storagePath,
        public_url: urlData.publicUrl,
        bucket: 'tpc-media',
        media_type: mediaType,
        mime_type: mimeType,
        file_size_bytes: file.size,
        alt_text: altText || null,
        caption: caption || null,
        folder,
        uploaded_by: authResult.member.id,
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB insert error:', dbError)
      // Clean up uploaded file
      await adminClient.storage.from('tpc-media').remove([storagePath])
      return NextResponse.json({ error: 'Failed to save media record' }, { status: 500 })
    }

    return NextResponse.json({ data: mediaRecord }, { status: 201 })
  } catch (error) {
    console.error('Media upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

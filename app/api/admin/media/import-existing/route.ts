import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getMediaTypeFromMime(mime: string): string {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return 'document'
}

// POST - Scan tpc-media bucket and import existing files into media_library
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const adminClient = createAdminClient()
    const folders = ['teachings', 'prophecies', 'events', 'resources', 'profiles', 'missions']

    let imported = 0
    let skipped = 0
    let errors = 0

    for (const folder of folders) {
      const { data: files, error: listError } = await adminClient.storage
        .from('tpc-media')
        .list(folder, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } })

      if (listError || !files) continue

      for (const file of files) {
        // Skip placeholder files
        if (file.name === '.emptyFolderPlaceholder') continue

        const filePath = `${folder}/${file.name}`

        // Check if already imported
        const { data: existing } = await adminClient
          .from('media_library')
          .select('id')
          .eq('file_path', filePath)
          .single()

        if (existing) {
          skipped++
          continue
        }

        // Get public URL
        const { data: urlData } = adminClient.storage
          .from('tpc-media')
          .getPublicUrl(filePath)

        const mime = file.metadata?.mimetype || 'application/octet-stream'

        const { error: insertError } = await adminClient
          .from('media_library')
          .insert({
            file_name: file.name,
            original_name: file.name,
            file_path: filePath,
            public_url: urlData.publicUrl,
            bucket: 'tpc-media',
            media_type: getMediaTypeFromMime(mime),
            mime_type: mime,
            file_size_bytes: file.metadata?.size || 0,
            folder,
            uploaded_by: authResult.member.id,
          })

        if (insertError) {
          console.error(`Import error for ${filePath}:`, insertError)
          errors++
        } else {
          imported++
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

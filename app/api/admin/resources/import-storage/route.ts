import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('role, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member || (member.role !== 'admin' && !member.is_admin)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // List files in multiple possible folders
    const foldersToCheck = ['ebooks', 'resources', 'books', 'pdfs', '']
    let allFiles: any[] = []
    let folderFound = ''

    for (const folder of foldersToCheck) {
      const { data: files, error: storageError } = await supabase.storage
        .from('tpc-media')
        .list(folder || undefined, { limit: 100 })

      if (!storageError && files && files.length > 0) {
        const validFiles = files.filter(f =>
          f.name !== '.emptyFolderPlaceholder' &&
          (f.name.endsWith('.pdf') || f.name.endsWith('.epub') || f.name.endsWith('.docx'))
        )
        if (validFiles.length > 0) {
          allFiles = validFiles.map(f => ({ ...f, folder }))
          folderFound = folder
          break
        }
      }
    }

    const files = allFiles

    // Get existing resources to avoid duplicates
    const { data: existingResources } = await supabase
      .from('resources')
      .select('file_url')

    const existingUrls = new Set((existingResources || []).map(r => r.file_url))

    const imported: string[] = []
    const skipped: string[] = []

    for (const file of files) {
      const folderPath = file.folder ? `${file.folder}/` : ''
      const fileUrl = `https://naulwwnzrznslvhhxfed.supabase.co/storage/v1/object/public/tpc-media/${folderPath}${file.name}`

      if (existingUrls.has(fileUrl)) {
        skipped.push(file.name)
        continue
      }

      // Generate title from filename
      const title = file.name
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[-_]/g, ' ')    // Replace dashes/underscores with spaces
        .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize words

      // Determine type from extension
      const type = file.name.endsWith('.pdf') ? 'ebook' :
                   file.name.endsWith('.epub') ? 'ebook' : 'document'

      // Insert resource
      const { error: insertError } = await supabase
        .from('resources')
        .insert({
          title,
          description: `Download "${title}" to grow in your faith journey.`,
          type,
          file_url: fileUrl,
          tier_required: 'free',
          published: true,
          download_count: 0,
        })

      if (insertError) {
        console.error('Error inserting resource:', insertError)
        skipped.push(file.name)
      } else {
        imported.push(file.name)
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      skipped: skipped.length,
      folder_searched: folderFound || 'root',
      total_files_found: files.length,
      files: {
        imported,
        skipped,
      }
    })
  } catch (error) {
    console.error('Error in import storage API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

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

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

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

    const body = await request.json()
    const { title, description, type, file_url, thumbnail_url, category, tier_required, is_published, author } = body

    const { data, error } = await supabase
      .from('resources')
      .update({
        title,
        description,
        type,
        file_url,
        thumbnail_url,
        category,
        tier_required,
        published: is_published,
        author,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating resource:', error)
      return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating resource:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

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

    // Get the resource to find the file URL
    const { data: resource } = await supabase
      .from('resources')
      .select('file_url')
      .eq('id', id)
      .single()

    // Delete from database
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting resource:', error)
      return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 })
    }

    // Optionally delete the file from storage
    if (resource?.file_url) {
      try {
        const urlParts = resource.file_url.split('/storage/v1/object/public/tpc-media/')
        if (urlParts.length > 1) {
          await supabase.storage.from('tpc-media').remove([urlParts[1]])
        }
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

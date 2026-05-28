import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching resource:', error)
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in resource API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { title, description, type, file_url, thumbnail_url, category, tags, tier_required, is_published, author } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('resources')
      .update({
        title,
        description,
        type,
        file_url,
        thumbnail_url,
        category,
        tags: tags || [],
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
    console.error('Error in resource API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting resource:', error)
      return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in resource API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { requireAdmin } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - List all tags
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createAdminClient()
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*, member_tags(count)')
      .order('name')

    if (error) throw error

    // Transform to include member count
    const tagsWithCount = tags?.map(tag => ({
      ...tag,
      memberCount: tag.member_tags?.[0]?.count || 0
    }))

    return NextResponse.json({ success: true, tags: tagsWithCount })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { name, color = '#6B7280', description } = body

    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Tag name is required'
      }, { status: 400 })
    }

    // Check if tag name already exists
    const supabase = createAdminClient()
    const { data: existing } = await supabase
      .from('tags')
      .select('id')
      .ilike('name', name)
      .single()

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'A tag with this name already exists'
      }, { status: 400 })
    }

    const { data: newTag, error } = await supabase
      .from('tags')
      .insert({ name, color, description })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, tag: newTag })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}

// PATCH - Update tag
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { id, name, color, description } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Tag ID is required'
      }, { status: 400 })
    }

    const updates: Record<string, string> = {}
    if (name !== undefined) updates.name = name
    if (color !== undefined) updates.color = color
    if (description !== undefined) updates.description = description

    const supabase = createAdminClient()
    const { data: updatedTag, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, tag: updatedTag })
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tag' },
      { status: 500 }
    )
  }
}

// DELETE - Delete tag
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Tag ID is required'
      }, { status: 400 })
    }

    // Delete all member_tags associations first
    const supabase = createAdminClient()
    await supabase.from('member_tags').delete().eq('tag_id', id)

    // Delete the tag
    const { error } = await supabase.from('tags').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
}

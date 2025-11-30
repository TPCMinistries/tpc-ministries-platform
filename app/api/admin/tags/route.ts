import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to check admin status
async function checkAdminStatus(supabase: any, userId: string) {
  const { data: adminMember } = await supabase
    .from('members')
    .select('is_admin')
    .eq('user_id', userId)
    .single()

  return adminMember?.is_admin === true
}

// GET - List all tags
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminStatus(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminStatus(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminStatus(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, color, description } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Tag ID is required'
      }, { status: 400 })
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (color !== undefined) updates.color = color
    if (description !== undefined) updates.description = description

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminStatus(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Tag ID is required'
      }, { status: 400 })
    }

    // Delete all member_tags associations first
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

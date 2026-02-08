import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { getContentType, generateSlug } from '@/lib/content/content-types'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: member } = await supabase
    .from('members')
    .select('id, is_admin')
    .eq('id', user.id)
    .single()

  if (!member?.is_admin) return null
  return member
}

// GET - Get single content item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const type = request.nextUrl.searchParams.get('type')
    if (!type) {
      return NextResponse.json({ error: 'Type parameter required' }, { status: 400 })
    }

    const config = getContentType(type)
    if (!config) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from(config.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({ data: { ...data, _type: type } })
  } catch (error) {
    console.error('Content get error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { type, ...fields } = body

    const config = getContentType(type)
    if (!config) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    // Build update data
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    for (const field of config.fields) {
      if (fields[field.name] !== undefined) {
        updateData[field.name] = fields[field.name]
      }
    }

    // Handle rich text format
    if (config.formatField && updateData[config.bodyField]) {
      updateData[config.formatField] = 'html'
    }
    if (config.bodyHtmlField && updateData[config.bodyField]) {
      updateData[config.bodyHtmlField] = updateData[config.bodyField]
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from(config.table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Content update error:', error)
      return NextResponse.json({ error: 'Failed to update content', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { ...data, _type: type } })
  } catch (error) {
    console.error('Content hub update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const type = request.nextUrl.searchParams.get('type')
    if (!type) {
      return NextResponse.json({ error: 'Type parameter required' }, { status: 400 })
    }

    const config = getContentType(type)
    if (!config) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from(config.table)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Content delete error:', error)
      return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Content hub delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

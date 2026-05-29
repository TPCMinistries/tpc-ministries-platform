import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - Fetch SMS templates
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active_only') === 'true'

    let query = supabase
      .from('sms_templates')
      .select('*')
      .order('usage_count', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error('Error fetching SMS templates:', error)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    return NextResponse.json({ templates: templates || [] })
  } catch (error) {
    console.error('SMS templates GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new SMS template
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { name, category, message, variables } = body

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })
    }

    if (message.length > 1600) {
      return NextResponse.json({ error: 'Message too long (max 1600 characters)' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: template, error } = await supabase
      .from('sms_templates')
      .insert({
        name,
        category: category || 'general',
        message,
        variables: variables || [],
        created_by: authResult.member.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating SMS template:', error)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('SMS templates POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a template
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: template, error } = await supabase
      .from('sms_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating SMS template:', error)
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('SMS templates PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a template
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('sms_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting SMS template:', error)
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('SMS templates DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Increment usage count when template is used
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Increment usage count
    const supabase = createAdminClient()
    const { error } = await supabase.rpc('increment_template_usage', { template_id: id })

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: template } = await supabase
        .from('sms_templates')
        .select('usage_count')
        .eq('id', id)
        .single()

      if (template) {
        await supabase
          .from('sms_templates')
          .update({ usage_count: (template.usage_count || 0) + 1 })
          .eq('id', id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('SMS templates PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

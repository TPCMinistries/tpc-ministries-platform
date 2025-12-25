import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// GET - List campaigns or get single campaign
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (id) {
      // Get single campaign
      const { data: campaign, error } = await supabase
        .from('email_campaigns')
        .select('*, email_templates(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, campaign })
    }

    // List campaigns
    let query = supabase
      .from('email_campaigns')
      .select('*, email_templates(name, category)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: campaigns, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      campaigns: campaigns || [],
      total: count || 0
    })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({
      error: 'Failed to fetch campaigns',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      template_id,
      subject,
      content,
      html_preview,
      send_type = 'immediate',
      scheduled_at,
      recurring_schedule,
      target_audience = { all: true }
    } = body

    if (!name || !subject) {
      return NextResponse.json({ error: 'Name and subject are required' }, { status: 400 })
    }

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        name,
        template_id,
        subject,
        content: content || {},
        html_preview,
        status: 'draft',
        send_type,
        scheduled_at,
        recurring_schedule,
        target_audience,
        created_by: member.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign created successfully'
    })

  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({
      error: 'Failed to create campaign',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update campaign
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Don't allow updating sent campaigns
    const { data: existing } = await supabase
      .from('email_campaigns')
      .select('status')
      .eq('id', id)
      .single()

    if (existing?.status === 'sent') {
      return NextResponse.json({ error: 'Cannot update sent campaigns' }, { status: 400 })
    }

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign updated successfully'
    })

  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({
      error: 'Failed to update campaign',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Delete campaign
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({
      error: 'Failed to delete campaign',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

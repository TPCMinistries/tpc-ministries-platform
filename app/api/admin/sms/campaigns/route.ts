import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms/twilio'

// GET - Fetch SMS campaigns
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    let query = supabase
      .from('sms_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Error fetching SMS campaigns:', error)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    // Get counts by status
    const { data: allCampaigns } = await supabase
      .from('sms_campaigns')
      .select('status')

    const counts = {
      draft: 0,
      scheduled: 0,
      sending: 0,
      sent: 0,
      failed: 0,
      total: allCampaigns?.length || 0,
    }

    allCampaigns?.forEach(c => {
      if (c.status in counts) {
        counts[c.status as keyof typeof counts]++
      }
    })

    return NextResponse.json({ campaigns: campaigns || [], counts })
  } catch (error) {
    console.error('SMS campaigns GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new SMS campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      message,
      target_audience,
      target_tier,
      scheduled_at,
    } = body

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })
    }

    if (message.length > 1600) {
      return NextResponse.json({ error: 'Message too long (max 1600 characters)' }, { status: 400 })
    }

    const { data: campaign, error } = await supabase
      .from('sms_campaigns')
      .insert({
        name,
        message,
        target_audience: target_audience || 'all',
        target_tier,
        scheduled_at,
        status: scheduled_at ? 'scheduled' : 'draft',
        created_by: member.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating SMS campaign:', error)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: member.id,
      action: 'create',
      entity_type: 'sms_campaign',
      entity_id: campaign.id,
      entity_name: name,
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('SMS campaigns POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a campaign
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Don't allow editing sent campaigns
    const { data: existing } = await supabase
      .from('sms_campaigns')
      .select('status')
      .eq('id', id)
      .single()

    if (existing?.status === 'sent' || existing?.status === 'sending') {
      return NextResponse.json({ error: 'Cannot edit a sent campaign' }, { status: 400 })
    }

    const { data: campaign, error } = await supabase
      .from('sms_campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating SMS campaign:', error)
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('SMS campaigns PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a campaign
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Get campaign info for logging
    const { data: campaign } = await supabase
      .from('sms_campaigns')
      .select('name, status')
      .eq('id', id)
      .single()

    if (campaign?.status === 'sending') {
      return NextResponse.json({ error: 'Cannot delete a campaign that is sending' }, { status: 400 })
    }

    const { error } = await supabase
      .from('sms_campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting SMS campaign:', error)
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
    }

    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: member.id,
      action: 'delete',
      entity_type: 'sms_campaign',
      entity_id: id,
      entity_name: campaign?.name,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('SMS campaigns DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

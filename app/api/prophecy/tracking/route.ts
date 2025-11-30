import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      prophecy_id,
      member_journal,
      fulfillment_status,
      manifested_date,
      manifested_testimony,
      member_tags,
    } = body

    if (!prophecy_id) {
      return NextResponse.json(
        { error: 'Missing prophecy_id' },
        { status: 400 }
      )
    }

    // Get member ID for the current user
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Check if user owns this prophecy
    const { data: prophecy, error: fetchError } = await supabase
      .from('personal_prophecies')
      .select('member_id')
      .eq('id', prophecy_id)
      .single()

    if (fetchError || !prophecy) {
      return NextResponse.json(
        { error: 'Prophecy not found' },
        { status: 404 }
      )
    }

    if (prophecy.member_id !== member.id) {
      return NextResponse.json(
        { error: 'You can only update your own prophecies' },
        { status: 403 }
      )
    }

    // Build updates object
    const updates: any = {}

    if (member_journal !== undefined) {
      updates.member_journal = member_journal
    }

    if (fulfillment_status !== undefined) {
      updates.fulfillment_status = fulfillment_status
    }

    if (manifested_date !== undefined) {
      updates.manifested_date = manifested_date
    }

    if (manifested_testimony !== undefined) {
      updates.manifested_testimony = manifested_testimony
    }

    if (member_tags !== undefined) {
      // Convert comma-separated string to array if needed
      updates.member_tags = typeof member_tags === 'string'
        ? member_tags.split(',').map(t => t.trim()).filter(t => t)
        : member_tags
    }

    // Update the prophecy tracking
    const { data, error: updateError } = await supabase
      .from('personal_prophecies')
      .update(updates)
      .eq('id', prophecy_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating prophecy tracking:', updateError)
      return NextResponse.json(
        { error: 'Failed to update prophecy tracking' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Prophecy tracking updated successfully', data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in prophecy tracking API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

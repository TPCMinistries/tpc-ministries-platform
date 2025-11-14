import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from('prayer_requests')
      .select(`
        id,
        request_text,
        category,
        is_anonymous,
        is_answered,
        answered_testimony,
        prayer_count,
        created_at,
        member_id,
        members:member_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Prayer request not found' },
        { status: 404 }
      )
    }

    // Check if current user is the owner
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = user?.id === data.member_id

    // Transform data
    const transformedData = {
      ...data,
      requester: data.is_anonymous
        ? 'Anonymous'
        : data.members?.raw_user_meta_data?.full_name || 'Member',
      isOwner,
      members: undefined,
      member_id: isOwner ? data.member_id : undefined,
    }

    return NextResponse.json(transformedData, { status: 200 })
  } catch (error) {
    console.error('Error fetching prayer request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the prayer request
    const { data: prayerRequest, error: fetchError } = await supabase
      .from('prayer_requests')
      .select('member_id')
      .eq('id', id)
      .single()

    if (fetchError || !prayerRequest) {
      return NextResponse.json(
        { error: 'Prayer request not found' },
        { status: 404 }
      )
    }

    // Check if user is the owner
    if (prayerRequest.member_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own prayer requests' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { is_answered, answered_testimony } = body

    const updates: any = {}

    if (typeof is_answered === 'boolean') {
      updates.is_answered = is_answered
    }

    if (answered_testimony) {
      updates.answered_testimony = answered_testimony
    }

    // Update the prayer request
    const { data, error: updateError } = await supabase
      .from('prayer_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating prayer request:', updateError)
      return NextResponse.json(
        { error: 'Failed to update prayer request' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Prayer request updated successfully', data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in prayer update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the prayer request
    const { data: prayerRequest, error: fetchError } = await supabase
      .from('prayer_requests')
      .select('member_id')
      .eq('id', id)
      .single()

    if (fetchError || !prayerRequest) {
      return NextResponse.json(
        { error: 'Prayer request not found' },
        { status: 404 }
      )
    }

    // Check if user is the owner (or admin - implement admin check later)
    if (prayerRequest.member_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own prayer requests' },
        { status: 403 }
      )
    }

    // Delete the prayer request
    const { error: deleteError } = await supabase
      .from('prayer_requests')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting prayer request:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete prayer request' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Prayer request deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in prayer delete API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

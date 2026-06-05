import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type JoinedMember = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  avatar_url?: string | null
}

function firstJoinedRow<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function getMemberName(member: JoinedMember | null | undefined): string | null {
  if (!member) return null
  const fullName = [member.first_name, member.last_name].filter(Boolean).join(' ').trim()
  return fullName || member.email?.split('@')[0] || null
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const authClient = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from('prayer_requests')
      .select(`
        id,
        request_text,
        category,
        is_anonymous,
        is_answered,
        testimony,
        prayer_count,
        created_at,
        member_id,
        members:member_id (
          id,
          email,
          first_name,
          last_name,
          avatar_url
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
    const { data: { user } } = await authClient.auth.getUser()
    const { data: currentMember } = user
      ? await authClient
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()
      : { data: null }
    const isOwner = currentMember?.id === data.member_id
    const member = firstJoinedRow(data.members as JoinedMember | JoinedMember[] | null)

    // Transform data
    const transformedData = {
      ...data,
      answered_testimony: data.testimony,
      testimony: undefined,
      requester: data.is_anonymous
        ? 'Anonymous'
        : getMemberName(member) || 'Member',
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

    const updates: {
      is_answered?: boolean
      answered_testimony?: string
    } = {}

    if (typeof is_answered === 'boolean') {
      updates.is_answered = is_answered
    }

    if (typeof answered_testimony === 'string' && answered_testimony) {
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

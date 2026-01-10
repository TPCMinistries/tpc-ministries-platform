import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Follow/Connect with a member
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const targetMemberId = params.id

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's member ID
    const { data: currentMember } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!currentMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Can't follow yourself
    if (currentMember.id === targetMemberId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if target member exists
    const { data: targetMember } = await supabase
      .from('members')
      .select('id')
      .eq('id', targetMemberId)
      .single()

    if (!targetMember) {
      return NextResponse.json({ error: 'Target member not found' }, { status: 404 })
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('member_connections')
      .select('id')
      .eq('follower_id', currentMember.id)
      .eq('following_id', targetMemberId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already following this member' }, { status: 400 })
    }

    // Create connection
    const { data: connection, error: insertError } = await supabase
      .from('member_connections')
      .insert({
        follower_id: currentMember.id,
        following_id: targetMemberId
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating connection:', insertError)
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })
    }

    return NextResponse.json({ connection, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error in connect API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Unfollow/Disconnect from a member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const targetMemberId = params.id

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's member ID
    const { data: currentMember } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!currentMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Delete connection
    const { error: deleteError } = await supabase
      .from('member_connections')
      .delete()
      .eq('follower_id', currentMember.id)
      .eq('following_id', targetMemberId)

    if (deleteError) {
      console.error('Error deleting connection:', deleteError)
      return NextResponse.json({ error: 'Failed to remove connection' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in disconnect API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

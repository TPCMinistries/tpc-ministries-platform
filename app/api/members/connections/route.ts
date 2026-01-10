import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get current user's connections (followers and following)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'following' // 'following' or 'followers'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let connections: any[] = []
    let total = 0

    if (type === 'following') {
      // Get people I'm following
      const { data, error, count } = await supabase
        .from('member_connections')
        .select(`
          id,
          created_at,
          following:members!member_connections_following_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            bio
          )
        `, { count: 'exact' })
        .eq('follower_id', currentMember.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (!error) {
        connections = data?.map(c => ({
          id: c.id,
          created_at: c.created_at,
          member: c.following
        })) || []
        total = count || 0
      }
    } else {
      // Get my followers
      const { data, error, count } = await supabase
        .from('member_connections')
        .select(`
          id,
          created_at,
          follower:members!member_connections_follower_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            bio
          )
        `, { count: 'exact' })
        .eq('following_id', currentMember.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (!error) {
        connections = data?.map(c => ({
          id: c.id,
          created_at: c.created_at,
          member: c.follower
        })) || []
        total = count || 0
      }
    }

    // For followers, check if I'm following them back
    if (type === 'followers') {
      const followerIds = connections.map(c => c.member?.id).filter(Boolean)

      if (followerIds.length > 0) {
        const { data: mutualConnections } = await supabase
          .from('member_connections')
          .select('following_id')
          .eq('follower_id', currentMember.id)
          .in('following_id', followerIds)

        const mutualIds = new Set(mutualConnections?.map(m => m.following_id) || [])

        connections = connections.map(c => ({
          ...c,
          isFollowingBack: mutualIds.has(c.member?.id)
        }))
      }
    }

    return NextResponse.json({
      connections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

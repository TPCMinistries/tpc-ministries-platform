import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get member public profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const memberId = params.id

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

    // Get the member profile
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        bio,
        is_profile_public,
        show_badges,
        created_at
      `)
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if profile is public (or if viewing own profile)
    const isOwnProfile = currentMember?.id === memberId
    if (!member.is_profile_public && !isOwnProfile) {
      return NextResponse.json({
        member: {
          id: member.id,
          first_name: member.first_name,
          last_name: member.last_name,
          avatar_url: member.avatar_url,
          is_profile_public: false
        },
        isPrivate: true
      })
    }

    // Get follower/following counts
    const { data: followers } = await supabase
      .from('member_connections')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', memberId)

    const { data: following } = await supabase
      .from('member_connections')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', memberId)

    // Check if current user is following this member
    let isFollowing = false
    if (currentMember && currentMember.id !== memberId) {
      const { data: connection } = await supabase
        .from('member_connections')
        .select('id')
        .eq('follower_id', currentMember.id)
        .eq('following_id', memberId)
        .single()

      isFollowing = !!connection
    }

    // Get badges if allowed
    let badges: any[] = []
    if (member.show_badges) {
      const { data: memberBadges } = await supabase
        .from('member_badges')
        .select(`
          id,
          earned_at,
          badge:badges(id, name, description, icon_url, category)
        `)
        .eq('member_id', memberId)
        .order('earned_at', { ascending: false })
        .limit(10)

      badges = memberBadges || []
    }

    // Get recent public activity
    const { data: recentActivity } = await supabase
      .from('community_activity')
      .select('id, activity_type, title, created_at')
      .eq('member_id', memberId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      member: {
        ...member,
        followers_count: followers || 0,
        following_count: following || 0
      },
      badges,
      recentActivity: recentActivity || [],
      isFollowing,
      isOwnProfile
    })
  } catch (error) {
    console.error('Error fetching member profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

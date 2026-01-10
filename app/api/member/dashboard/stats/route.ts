import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, created_at')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    // Calculate days since joining
    const joinDate = new Date(member.created_at)
    const daysSinceJoining = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24))

    // Date calculations for filtering
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Content consumption activity types
    const contentActivityTypes = ['teaching_viewed', 'content_view', 'devotional_read', 'prophecy_viewed']

    // Get all content activity
    const { data: allContentActivity } = await supabase
      .from('member_activity')
      .select('activity_type, created_at')
      .eq('member_id', member.id)
      .in('activity_type', contentActivityTypes)

    const totalContentConsumed = allContentActivity?.length || 0
    const contentThisWeek = allContentActivity?.filter(a =>
      new Date(a.created_at) >= oneWeekAgo
    ).length || 0
    const contentThisMonth = allContentActivity?.filter(a =>
      new Date(a.created_at) >= oneMonthAgo
    ).length || 0

    // Get completed assessments
    const { count: assessmentsCompleted } = await supabase
      .from('member_assessment_results')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', member.id)

    // Get current streak
    const { data: streakData } = await supabase
      .from('member_streaks')
      .select('current_streak')
      .eq('member_id', member.id)
      .single()

    const stats = {
      total_content_consumed: totalContentConsumed,
      content_this_week: contentThisWeek,
      content_this_month: contentThisMonth,
      assessments_completed: assessmentsCompleted || 0,
      days_since_joining: daysSinceJoining,
      current_season_streak: streakData?.current_streak || 0
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Activity type to points mapping
const ACTIVITY_POINTS: Record<string, number> = {
  login: 5,
  devotional: 10,
  prayer_submit: 15,
  prayer_pray: 5,
  content_view: 3,
  event_attend: 25,
  donation: 30,
  checkin: 10
}

// POST - Log an activity
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member
    let { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      const { data: memberAlt } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      member = memberAlt
    }

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const { activity_type } = body

    if (!activity_type || !ACTIVITY_POINTS[activity_type]) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
    }

    const points = ACTIVITY_POINTS[activity_type]
    const today = new Date().toISOString().split('T')[0]

    // Upsert the activity (increment count if already exists)
    const { data: existingActivity } = await supabase
      .from('daily_activity_log')
      .select('id, activity_count')
      .eq('member_id', member.id)
      .eq('activity_date', today)
      .eq('activity_type', activity_type)
      .single()

    if (existingActivity) {
      // Update existing activity
      await supabase
        .from('daily_activity_log')
        .update({
          activity_count: existingActivity.activity_count + 1,
          points_earned: (existingActivity.activity_count + 1) * points
        })
        .eq('id', existingActivity.id)
    } else {
      // Insert new activity
      await supabase
        .from('daily_activity_log')
        .insert({
          member_id: member.id,
          activity_date: today,
          activity_type,
          activity_count: 1,
          points_earned: points
        })
    }

    // Update engagement streak counters based on activity type
    const streakUpdates: Record<string, number> = {}

    switch (activity_type) {
      case 'devotional':
        streakUpdates.devotionals_read = 1
        break
      case 'prayer_submit':
        streakUpdates.prayers_submitted = 1
        break
      case 'prayer_pray':
        streakUpdates.prayers_prayed_for = 1
        break
      case 'content_view':
        streakUpdates.content_viewed = 1
        break
      case 'event_attend':
        streakUpdates.events_attended = 1
        break
      case 'donation':
        streakUpdates.donations_made = 1
        break
    }

    // Increment counters in engagement_streaks
    if (Object.keys(streakUpdates).length > 0) {
      const { data: currentStreak } = await supabase
        .from('engagement_streaks')
        .select('*')
        .eq('member_id', member.id)
        .single()

      if (currentStreak) {
        const updates: Record<string, number> = {}
        for (const [key, increment] of Object.entries(streakUpdates)) {
          updates[key] = (currentStreak[key] || 0) + increment
        }

        await supabase
          .from('engagement_streaks')
          .update(updates)
          .eq('member_id', member.id)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Activity logged',
      points_earned: points
    })

  } catch (error) {
    console.error('Activity log error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get member's engagement stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member
    let { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      const { data: memberAlt } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      member = memberAlt
    }

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get engagement streak
    const { data: streak } = await supabase
      .from('engagement_streaks')
      .select('*')
      .eq('member_id', member.id)
      .single()

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('daily_activity_log')
      .select('*')
      .eq('member_id', member.id)
      .order('activity_date', { ascending: false })
      .limit(30)

    return NextResponse.json({
      success: true,
      streak: streak || {
        current_streak: 0,
        longest_streak: 0,
        engagement_score: 0,
        total_days_active: 0
      },
      recent_activity: recentActivity || []
    })

  } catch (error) {
    console.error('Get activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

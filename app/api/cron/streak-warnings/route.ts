import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for cron jobs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate time windows
    const now = new Date()
    const twentyHoursAgo = new Date(now.getTime() - 20 * 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Find members at risk of losing their streak
    // They have a streak > 0 and haven't been active in 20-24 hours
    const { data: atRiskStreaks, error: streakError } = await supabase
      .from('member_streaks')
      .select(`
        id,
        member_id,
        streak_type,
        current_streak,
        last_activity_date
      `)
      .gt('current_streak', 0)
      .lt('last_activity_date', twentyHoursAgo.toISOString().split('T')[0])
      .gte('last_activity_date', twentyFourHoursAgo.toISOString().split('T')[0])

    if (streakError) {
      console.error('Error fetching at-risk streaks:', streakError)
      return NextResponse.json({ error: 'Failed to fetch streaks' }, { status: 500 })
    }

    if (!atRiskStreaks || atRiskStreaks.length === 0) {
      return NextResponse.json({ message: 'No members at risk', warned: 0 })
    }

    // Check notification preferences and avoid duplicate warnings
    const warningsCreated: string[] = []

    for (const streak of atRiskStreaks) {
      // Check if member has streak warning notifications enabled
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('notify_streak_at_risk')
        .eq('member_id', streak.member_id)
        .single()

      // Skip if they've opted out of streak warnings
      if (prefs && prefs.notify_streak_at_risk === false) {
        continue
      }

      // Check if we already sent a streak warning in the last 20 hours
      const twentyHoursAgoISO = twentyHoursAgo.toISOString()
      const { data: existingWarning } = await supabase
        .from('notifications')
        .select('id')
        .eq('member_id', streak.member_id)
        .eq('notification_type', 'streak_warning')
        .gte('created_at', twentyHoursAgoISO)
        .limit(1)
        .single()

      if (existingWarning) {
        // Already warned recently, skip
        continue
      }

      // Create the warning notification
      const streakTypeLabels: Record<string, string> = {
        devotional: 'devotional',
        prayer: 'prayer',
        journal: 'journaling',
        login: 'daily check-in',
        giving: 'giving'
      }

      const streakLabel = streakTypeLabels[streak.streak_type] || streak.streak_type

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          member_id: streak.member_id,
          title: "Don't lose your streak!",
          body: `Your ${streak.current_streak}-day ${streakLabel} streak is at risk! Check in today to keep it going.`,
          notification_type: 'streak_warning',
          action_url: getActionUrl(streak.streak_type),
          is_read: false,
          is_sent: false
        })

      if (notifError) {
        console.error(`Error creating notification for member ${streak.member_id}:`, notifError)
        continue
      }

      warningsCreated.push(streak.member_id)
    }

    return NextResponse.json({
      message: 'Streak warnings processed',
      atRisk: atRiskStreaks.length,
      warned: warningsCreated.length
    })
  } catch (error) {
    console.error('Streak warning cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getActionUrl(streakType: string): string {
  switch (streakType) {
    case 'devotional':
      return '/devotional'
    case 'prayer':
      return '/prayer'
    case 'journal':
      return '/journal'
    case 'giving':
      return '/give'
    default:
      return '/dashboard'
  }
}

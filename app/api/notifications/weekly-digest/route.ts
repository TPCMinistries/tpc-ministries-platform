import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, EmailTemplates } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Get all active members
    const { data: members } = await supabase
      .from('members')
      .select('id, full_name, email')
      .eq('is_active', true)

    if (!members || members.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active members to send digest to',
      })
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/member/dashboard`
    const results = []

    // Send weekly digest to each member
    for (const member of members) {
      try {
        // Calculate stats for the past week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        // Count content watched this week
        const { data: recentProgress } = await supabase
          .from('content_progress')
          .select('id')
          .eq('member_id', member.id)
          .gte('last_accessed', oneWeekAgo.toISOString())

        // Count prayers received this week
        const { data: recentPrayers } = await supabase
          .from('prayer_requests')
          .select('id')
          .eq('member_id', member.id)
          .gte('created_at', oneWeekAgo.toISOString())

        // Count active seasons
        const { data: activeSeasons } = await supabase
          .from('member_seasons')
          .select('id')
          .eq('member_id', member.id)
          .is('completed_at', null)

        // Calculate overall progress
        const { data: allProgress } = await supabase
          .from('content_progress')
          .select('progress_percentage')
          .eq('member_id', member.id)

        const avgProgress = allProgress && allProgress.length > 0
          ? Math.round(allProgress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / allProgress.length)
          : 0

        const stats = {
          contentWatched: recentProgress?.length || 0,
          prayersReceived: recentPrayers?.length || 0,
          seasonsActive: activeSeasons?.length || 0,
          progressThisWeek: avgProgress,
        }

        // Only send if there's activity
        if (stats.contentWatched > 0 || stats.seasonsActive > 0) {
          const { subject, html } = EmailTemplates.weeklyDigest(
            member.full_name,
            stats,
            dashboardUrl
          )

          const result = await sendEmail({
            to: member.email,
            subject,
            html,
          })

          results.push({
            member: member.email,
            success: result.success,
          })
        }
      } catch (error) {
        console.error(`Failed to send digest to ${member.email}:`, error)
        results.push({
          member: member.email,
          success: false,
          error: String(error),
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Weekly digest processed for ${members.length} members`,
      results,
    })
  } catch (error) {
    console.error('Weekly digest error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send weekly digest' },
      { status: 500 }
    )
  }
}

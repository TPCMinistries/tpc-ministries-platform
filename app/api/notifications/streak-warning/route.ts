import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@tpcministries.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  member: {
    first_name: string
  }
  streak: {
    current_streak: number
  } | null
}

// This endpoint should be called by a cron job (e.g., Vercel Cron, Supabase Edge Function)
// every hour to check for at-risk streaks and send notifications
export async function POST(request: Request) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all users with active streaks who haven't checked in today
    // and whose last activity was 20+ hours ago
    const twentyHoursAgo = new Date()
    twentyHoursAgo.setHours(twentyHoursAgo.getHours() - 20)

    const { data: atRiskUsers, error: usersError } = await supabase
      .from('engagement_streaks')
      .select(`
        user_id,
        current_streak,
        last_activity_date,
        members!inner (
          first_name,
          user_id
        )
      `)
      .gte('current_streak', 3) // Only notify if they have a streak worth preserving
      .lt('last_activity_date', twentyHoursAgo.toISOString().split('T')[0])

    if (usersError) {
      console.error('Error fetching at-risk users:', usersError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!atRiskUsers || atRiskUsers.length === 0) {
      return NextResponse.json({ message: 'No at-risk streaks found', sent: 0 })
    }

    let sentCount = 0
    const errors: string[] = []

    for (const user of atRiskUsers) {
      // Get push subscriptions for this user
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('id, endpoint, p256dh, auth')
        .eq('user_id', user.user_id)
        .eq('is_active', true)

      if (subError || !subscriptions?.length) continue

      const member = user.members as any
      const firstName = member?.first_name || 'Friend'
      const streak = user.current_streak

      const payload = JSON.stringify({
        title: `Don't lose your ${streak}-day streak!`,
        body: `Hey ${firstName}, check in today to keep your streak alive. You've got this!`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: {
          url: '/daily-checkin',
          type: 'streak_warning'
        },
        actions: [
          { action: 'checkin', title: 'Check In Now' },
          { action: 'dismiss', title: 'Later' }
        ]
      })

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            payload
          )
          sentCount++

          // Log the notification
          await supabase.from('notification_history').insert({
            user_id: user.user_id,
            title: `Don't lose your ${streak}-day streak!`,
            message: `Hey ${firstName}, check in today to keep your streak alive.`,
            type: 'push',
            category: 'streak_warning',
            sent_at: new Date().toISOString()
          })
        } catch (pushError: any) {
          // If subscription is invalid, mark it as inactive
          if (pushError.statusCode === 410 || pushError.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', sub.id)
          }
          errors.push(`Failed to send to ${sub.endpoint.slice(0, 50)}...`)
        }
      }
    }

    return NextResponse.json({
      message: 'Streak warnings processed',
      atRiskUsers: atRiskUsers.length,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error processing streak warnings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check the status (for debugging)
export async function GET() {
  const supabase = await createClient()

  const twentyHoursAgo = new Date()
  twentyHoursAgo.setHours(twentyHoursAgo.getHours() - 20)

  const { data, error } = await supabase
    .from('engagement_streaks')
    .select('user_id, current_streak, last_activity_date')
    .gte('current_streak', 3)
    .lt('last_activity_date', twentyHoursAgo.toISOString().split('T')[0])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    atRiskStreaks: data?.length || 0,
    users: data?.map(u => ({
      streak: u.current_streak,
      lastActive: u.last_activity_date
    }))
  })
}

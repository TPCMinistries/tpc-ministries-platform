import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import WeeklyNewsletterFull from '@/lib/email/templates/weekly-newsletter-full'
import { render } from '@react-email/render'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

interface WeeklyStats {
  prayersAnswered: number
  newMembers: number
  teachingsWatched: number
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    // Gather weekly content and stats
    const [
      topTeachings,
      newProphecies,
      upcomingEvents,
      weeklyStats,
    ] = await Promise.all([
      // Top viewed teachings this week
      supabase
        .from('teachings')
        .select('id, title, author, description, slug')
        .eq('is_published', true)
        .order('views', { ascending: false })
        .limit(1)
        .single(),

      // New prophecies this week
      supabase
        .from('prophecies')
        .select('id, title, content, slug')
        .eq('published', true)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3),

      // Upcoming events (next 2 weeks)
      supabase
        .from('events')
        .select('id, title, event_date, slug')
        .gte('event_date', now.toISOString())
        .lte('event_date', new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('event_date', { ascending: true })
        .limit(3),

      // Weekly stats
      gatherWeeklyStats(weekAgo, now),
    ])

    // Get subscribed members
    const { data: subscriptions, error: subError } = await supabase
      .from('email_subscriptions')
      .select(`
        member_id,
        members (
          id,
          email,
          first_name,
          last_name,
          tier
        )
      `)
      .eq('subscription_type', 'weekly_newsletter')
      .eq('is_subscribed', true)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    const recipients = (subscriptions || [])
      .filter(s => (s.members as any)?.email)
      .map(s => ({
        email: (s.members as any).email,
        firstName: (s.members as any).first_name || 'Friend',
        tier: (s.members as any).tier || 'free',
        memberId: (s.members as any).id
      }))

    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No subscribers found for weekly newsletter' })
    }

    // Generate AI summary
    let aiSummary = ''
    if (process.env.OPENAI_API_KEY) {
      try {
        const contentSummary = `
          - ${weeklyStats.newMembers} new members joined
          - ${weeklyStats.prayersAnswered} prayers answered
          - ${weeklyStats.teachingsWatched} teachings watched
          - ${(newProphecies.data || []).length} new prophetic words released
          - ${(upcomingEvents.data || []).length} upcoming events
        `

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a warm, engaging newsletter writer for TPC Ministries, a Christian ministry. Write a brief (3-4 sentences) warm summary of the week\'s highlights. Be encouraging and celebrate what God is doing. Do not use bullet points.'
              },
              {
                role: 'user',
                content: `Write a weekly summary paragraph for TPC Ministries newsletter based on these highlights:\n${contentSummary}`
              }
            ],
            max_tokens: 200,
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          aiSummary = data.choices?.[0]?.message?.content || ''
        }
      } catch (aiError) {
        console.error('AI generation error:', aiError)
      }
    }

    // Default summary if AI fails
    if (!aiSummary) {
      aiSummary = `This week has been filled with God's faithfulness! We welcomed ${weeklyStats.newMembers} new members to our family, witnessed ${weeklyStats.prayersAnswered} answered prayers, and saw ${weeklyStats.teachingsWatched} teachings consumed by our community. God is moving!`
    }

    // Prepare newsletter content
    const featuredTeaching = topTeachings.data ? {
      title: topTeachings.data.title,
      speaker: topTeachings.data.author || 'TPC Ministries',
      description: (topTeachings.data.description || '').substring(0, 150) + '...',
      url: `https://tpcmin.org/teachings/${topTeachings.data.slug || topTeachings.data.id}`,
    } : undefined

    const propheciesFormatted = (newProphecies.data || []).map(p => ({
      title: p.title,
      excerpt: (p.content || '').substring(0, 100) + '...',
      url: `https://tpcmin.org/prophecy/${p.slug || p.id}`,
    }))

    const eventsFormatted = (upcomingEvents.data || []).map(e => ({
      title: e.title,
      date: new Date(e.event_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      url: `https://tpcmin.org/events/${e.slug || e.id}`,
    }))

    // Send emails in batches
    const BATCH_SIZE = 50
    let sentCount = 0
    let failedCount = 0

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE)

      for (const recipient of batch) {
        try {
          const emailHtml = await render(
            WeeklyNewsletterFull({
              recipientName: recipient.firstName,
              weekDate: weekDate,
              aiSummary: aiSummary,
              featuredTeaching: featuredTeaching,
              newProphecies: propheciesFormatted,
              upcomingEvents: eventsFormatted,
              communityStats: weeklyStats,
              unsubscribeUrl: `https://tpcmin.org/settings/notifications`,
            })
          )

          await resend.emails.send({
            from: 'TPC Ministries <newsletter@tpcmin.com>',
            to: recipient.email,
            subject: `This Week at TPC Ministries - ${weekDate}`,
            html: emailHtml,
          })

          sentCount++
        } catch (sendError) {
          console.error(`Failed to send to ${recipient.email}:`, sendError)
          failedCount++
        }
      }

      // Small delay between batches
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Log campaign
    await supabase.from('email_campaigns').insert({
      name: `Weekly Newsletter - ${weekDate}`,
      subject: `This Week at TPC Ministries - ${weekDate}`,
      content: {
        aiSummary: !!aiSummary,
        featuredTeaching: featuredTeaching?.title,
        propheciesCount: propheciesFormatted.length,
        eventsCount: eventsFormatted.length,
        stats: weeklyStats,
      },
      status: 'sent',
      send_type: 'recurring',
      recurring_schedule: '0 9 * * 0',
      target_audience: { subscription_type: 'weekly_newsletter' },
      sent_count: sentCount,
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Weekly newsletter sent',
      stats: {
        weekDate,
        totalRecipients: recipients.length,
        sent: sentCount,
        failed: failedCount,
        aiSummaryGenerated: !!aiSummary,
        contentIncluded: {
          featuredTeaching: !!featuredTeaching,
          prophecies: propheciesFormatted.length,
          events: eventsFormatted.length,
        }
      }
    })

  } catch (error) {
    console.error('Weekly newsletter cron error:', error)
    return NextResponse.json({
      error: 'Failed to send weekly newsletter',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function gatherWeeklyStats(startDate: Date, endDate: Date): Promise<WeeklyStats> {
  const stats: WeeklyStats = {
    prayersAnswered: 0,
    newMembers: 0,
    teachingsWatched: 0,
  }

  try {
    // New members this week
    const { count: newMemberCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    stats.newMembers = newMemberCount || 0

    // Answered prayers this week
    const { count: answeredCount } = await supabase
      .from('prayer_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'answered')
      .gte('answered_at', startDate.toISOString())
      .lte('answered_at', endDate.toISOString())

    stats.prayersAnswered = answeredCount || 0

    // Teaching views this week (from content_progress or teaching_progress)
    const { count: teachingViewCount } = await supabase
      .from('content_progress')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'teaching')
      .gte('last_accessed', startDate.toISOString())
      .lte('last_accessed', endDate.toISOString())

    stats.teachingsWatched = teachingViewCount || 0

  } catch (error) {
    console.error('Error gathering weekly stats:', error)
  }

  return stats
}

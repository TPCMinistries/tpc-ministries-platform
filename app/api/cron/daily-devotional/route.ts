import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import DailyDevotionalEmail from '@/lib/email/templates/daily-devotional'
import { render } from '@react-email/render'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Fetch today's devotional
    const { data: devotional, error: devotionalError } = await supabase
      .from('devotionals')
      .select('*')
      .eq('date', todayStr)
      .eq('is_published', true)
      .single()

    if (devotionalError || !devotional) {
      // Try to get the most recent devotional if none for today
      const { data: recentDevotional } = await supabase
        .from('devotionals')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      if (!recentDevotional) {
        return NextResponse.json({
          message: 'No devotional content found for today',
          date: todayStr
        })
      }

      // Use recent devotional
      Object.assign(devotional || {}, recentDevotional)
    }

    // Fetch today's scripture if available
    const { data: scripture } = await supabase
      .from('daily_scriptures')
      .select('*')
      .eq('date', todayStr)
      .single()

    // Get subscribed members
    const { data: subscriptions, error: subError } = await supabase
      .from('email_subscriptions')
      .select(`
        member_id,
        members (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('subscription_type', 'daily_devotional')
      .eq('is_subscribed', true)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    // Filter out invalid entries and get recipients
    const recipients = (subscriptions || [])
      .filter(s => (s.members as any)?.email)
      .map(s => ({
        email: (s.members as any).email,
        firstName: (s.members as any).first_name || 'Friend',
        memberId: (s.members as any).id
      }))

    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No subscribers found for daily devotional' })
    }

    // Generate AI intro if OpenAI is available
    let aiIntro = ''
    if (process.env.OPENAI_API_KEY) {
      try {
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
                content: 'You are a warm, pastoral writer for TPC Ministries. Write a brief (2-3 sentences) warm introduction to a daily devotional email. Be encouraging and spiritually uplifting without being overly formal.'
              },
              {
                role: 'user',
                content: `Write a brief intro for today's devotional titled "${devotional?.title || 'Daily Reflection'}" based on ${scripture?.reference || devotional?.scripture_reference || 'today\'s scripture'}. Theme: ${devotional?.theme || 'faith and hope'}.`
              }
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          aiIntro = data.choices?.[0]?.message?.content || ''
        }
      } catch (aiError) {
        console.error('AI generation error:', aiError)
        // Continue without AI intro
      }
    }

    // Prepare email content
    const devotionalContent = devotional?.content || devotional?.body || ''
    const reflection = aiIntro
      ? `${aiIntro}\n\n${devotionalContent}`
      : devotionalContent

    // Send emails in batches
    const BATCH_SIZE = 50
    let sentCount = 0
    let failedCount = 0

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE)

      for (const recipient of batch) {
        try {
          const emailHtml = await render(
            DailyDevotionalEmail({
              recipientName: recipient.firstName,
              devotionalTitle: devotional?.title || 'Daily Devotional',
              scripture: scripture?.reference || devotional?.scripture_reference || 'Scripture of the Day',
              scriptureText: scripture?.text || devotional?.scripture_text || '',
              reflection: reflection,
              prayer: devotional?.prayer || scripture?.prayer,
              author: devotional?.author || 'TPC Ministries',
              date: today.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }),
              readMoreUrl: `https://tpcmin.org/devotional`,
              unsubscribeUrl: `https://tpcmin.org/settings/notifications`,
            })
          )

          await resend.emails.send({
            from: 'TPC Ministries <devotional@tpcmin.com>',
            to: recipient.email,
            subject: `${devotional?.title || 'Daily Devotional'} - Your Morning Word`,
            html: emailHtml,
          })

          sentCount++
        } catch (sendError) {
          console.error(`Failed to send to ${recipient.email}:`, sendError)
          failedCount++
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Log campaign
    await supabase.from('email_campaigns').insert({
      name: `Daily Devotional - ${todayStr}`,
      subject: `${devotional?.title || 'Daily Devotional'} - Your Morning Word`,
      content: {
        devotionalId: devotional?.id,
        scriptureId: scripture?.id,
        aiIntroGenerated: !!aiIntro,
      },
      status: 'sent',
      send_type: 'recurring',
      recurring_schedule: '0 6 * * *',
      target_audience: { subscription_type: 'daily_devotional' },
      sent_count: sentCount,
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Daily devotional emails sent',
      stats: {
        date: todayStr,
        devotionalTitle: devotional?.title,
        totalRecipients: recipients.length,
        sent: sentCount,
        failed: failedCount,
        aiIntroGenerated: !!aiIntro,
      }
    })

  } catch (error) {
    console.error('Daily devotional cron error:', error)
    return NextResponse.json({
      error: 'Failed to send daily devotional',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

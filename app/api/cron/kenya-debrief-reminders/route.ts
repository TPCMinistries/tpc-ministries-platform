import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { buildDebriefEmail } from '@/lib/email/kenya-debrief-emails'
import { KENYA_DEBRIEF } from '@/lib/kenya-debrief'

export const dynamic = 'force-dynamic'

type Stage = 't7' | 't1' | 'day_of'

const STAGE_COLUMN: Record<Stage, string> = {
  t7: 'reminder_t7_sent_at',
  t1: 'reminder_t1_sent_at',
  day_of: 'reminder_day_of_sent_at',
}

// Allow manual triggering / a "test" run that ignores the date window.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const eventDate = new Date(KENYA_DEBRIEF.startUTC)
    const msPerDay = 24 * 60 * 60 * 1000
    // Whole days between today (UTC midnight) and event day (UTC midnight).
    const today0 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    const event0 = Date.UTC(
      eventDate.getUTCFullYear(),
      eventDate.getUTCMonth(),
      eventDate.getUTCDate()
    )
    const daysUntil = Math.round((event0 - today0) / msPerDay)

    // Pick the stage for today. One stage per day, no overlap.
    let stage: Stage | null = null
    if (daysUntil === 0) stage = 'day_of'
    else if (daysUntil === 1) stage = 't1'
    else if (daysUntil >= 2 && daysUntil <= 8) stage = 't7'

    if (!stage) {
      return NextResponse.json({
        success: true,
        message: `No reminder stage for daysUntil=${daysUntil}.`,
        daysUntil,
      })
    }

    const supabase = createAdminClient()
    const column = STAGE_COLUMN[stage]

    // Recipients who haven't received this stage and haven't unsubscribed.
    const { data: recipients, error } = await supabase
      .from('kenya_debrief_registrations')
      .select('id, full_name, email')
      .is(column, null)
      .is('unsubscribed_at', null)

    if (error) {
      console.error('Kenya debrief reminder query error:', error)
      return NextResponse.json({ error: 'Failed to load recipients' }, { status: 500 })
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending recipients.', stage, daysUntil, sent: 0 })
    }

    let sent = 0
    let failed = 0

    for (const r of recipients) {
      const firstName = (r.full_name || '').split(' ')[0]
      const { subject, html } = buildDebriefEmail(stage, firstName)
      try {
        const result = await sendEmail({ to: r.email, subject, html, from: KENYA_DEBRIEF.fromEmail })
        if (result.success) {
          await supabase
            .from('kenya_debrief_registrations')
            .update({ [column]: new Date().toISOString() })
            .eq('id', r.id)
          sent++
        } else {
          failed++
        }
      } catch (e) {
        console.error(`Failed to send ${stage} to ${r.email}:`, e)
        failed++
      }
      // Gentle pacing to stay within Resend rate limits.
      await new Promise((resolve) => setTimeout(resolve, 120))
    }

    return NextResponse.json({
      success: true,
      stage,
      daysUntil,
      totalPending: recipients.length,
      sent,
      failed,
    })
  } catch (error) {
    console.error('Kenya debrief reminder cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

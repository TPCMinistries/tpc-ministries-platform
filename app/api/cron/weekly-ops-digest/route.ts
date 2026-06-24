import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage } from '@/lib/telegram'
import { getSubscriberStats } from '@/lib/db/subscribers'

export const dynamic = 'force-dynamic'

type Admin = ReturnType<typeof createAdminClient>

async function countSince(supabase: Admin, table: string, sinceIso: string): Promise<number> {
  try {
    const { count } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sinceIso)
    return count ?? 0
  } catch {
    return 0
  }
}

/**
 * Weekly ops digest → Telegram. Cron-gated (CRON_SECRET). Summarizes the last
 * 7 days: new leads, new members, prayer requests, gifts, and the current
 * unified audience size. Sends to Lorenzo via Telegram (no-op until creds set).
 *
 * Schedule (vercel.json): Mondays 13:00 UTC (~9am ET).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [newLeads, newMembers, newPrayers, donationRows, audience] = await Promise.all([
    countSince(supabase, 'leads', since),
    countSince(supabase, 'members', since),
    countSince(supabase, 'prayer_requests', since),
    supabase
      .from('donations')
      .select('amount')
      .gte('created_at', since)
      .then((r) => r.data ?? [])
      .catch(() => [] as { amount: number | null }[]),
    getSubscriberStats().catch(() => null),
  ])

  const giftCount = donationRows.length
  const giftTotal = donationRows.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const lines = [
    `<b>🕊 TPC Weekly Ops — ${dateLabel}</b>`,
    `<i>Last 7 days</i>`,
    ``,
    `🌱 New leads: <b>${newLeads}</b>`,
    `👤 New members: <b>${newMembers}</b>`,
    `🙏 Prayer requests: <b>${newPrayers}</b>`,
    `💝 Gifts: <b>${giftCount}</b>${giftTotal > 0 ? ` ($${giftTotal.toLocaleString()})` : ''}`,
  ]
  if (audience) {
    lines.push(
      ``,
      `📋 Audience: <b>${audience.totalUnique.toLocaleString()}</b> unique · ${audience.sendEligible.toLocaleString()} sendable`,
      `   (${audience.bySource.member} members · ${audience.bySource.lead} leads · ${audience.bySource.newsletter} newsletter)`,
    )
  }

  const text = lines.join('\n')
  const result = await sendTelegramMessage(text)

  return NextResponse.json({
    ok: true,
    sent: result.ok,
    skipped: result.skipped ?? false,
    metrics: { newLeads, newMembers, newPrayers, giftCount, giftTotal },
  })
}

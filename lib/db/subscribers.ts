// Unified subscriber read-layer (non-destructive).
//
// TPC keeps audience data in three separate stores:
//   - members            (full accounts; opt-out via email_notifications)
//   - leads              (funnel captures: get-involved, ask-prophet, etc.)
//   - email_subscribers  (newsletter; opt-out via is_subscribed / unsubscribed_at)
//
// This merges them into ONE deduplicated audience (by lowercased email) with
// source attribution and send-eligibility — WITHOUT migrating or deleting any
// data. It's the clean "send list" foundation for campaigns.

import { createAdminClient } from '@/lib/supabase/admin'

export type SubscriberSource = 'member' | 'lead' | 'newsletter'

export interface UnifiedSubscriber {
  email: string
  name: string | null
  source: SubscriberSource
  sourceDetail: string | null
  sendEligible: boolean
  createdAt: string | null
}

export interface SubscriberStats {
  totalUnique: number
  sendEligible: number
  bySource: Record<SubscriberSource, number>
  duplicatesCollapsed: number
}

// Precedence when the same email appears in multiple stores: a member outranks a
// lead outranks a newsletter-only subscriber.
const PRECEDENCE: Record<SubscriberSource, number> = { member: 3, lead: 2, newsletter: 1 }

export async function getUnifiedSubscribers(): Promise<UnifiedSubscriber[]> {
  const supabase = createAdminClient()

  const [membersRes, leadsRes, subsRes] = await Promise.all([
    supabase.from('members').select('email, first_name, last_name, email_notifications, created_at'),
    supabase.from('leads').select('email, name, source, created_at'),
    supabase.from('email_subscribers').select('email, name, source, is_subscribed, created_at'),
  ])

  const rows: UnifiedSubscriber[] = []

  for (const m of membersRes.data ?? []) {
    if (!m.email) continue
    rows.push({
      email: m.email,
      name: [m.first_name, m.last_name].filter(Boolean).join(' ') || null,
      source: 'member',
      sourceDetail: 'account',
      sendEligible: m.email_notifications !== false,
      createdAt: m.created_at ?? null,
    })
  }
  for (const l of leadsRes.data ?? []) {
    if (!l.email) continue
    rows.push({
      email: l.email,
      name: l.name ?? null,
      source: 'lead',
      sourceDetail: l.source ?? null,
      sendEligible: true, // leads opted in by submitting a form
      createdAt: l.created_at ?? null,
    })
  }
  for (const s of subsRes.data ?? []) {
    if (!s.email) continue
    rows.push({
      email: s.email,
      name: s.name ?? null,
      source: 'newsletter',
      sourceDetail: s.source ?? null,
      sendEligible: s.is_subscribed !== false,
      createdAt: s.created_at ?? null,
    })
  }

  // Dedup by lowercased email, keeping the highest-precedence source.
  const byEmail = new Map<string, UnifiedSubscriber>()
  for (const row of rows) {
    const key = row.email.trim().toLowerCase()
    if (!key) continue
    const existing = byEmail.get(key)
    if (!existing || PRECEDENCE[row.source] > PRECEDENCE[existing.source]) {
      byEmail.set(key, { ...row, email: key })
    } else if (existing && !existing.sendEligible && row.sendEligible) {
      // keep higher-precedence identity but don't lose an opt-in signal
      existing.sendEligible = true
    }
  }

  return [...byEmail.values()]
}

export async function getSubscriberStats(): Promise<SubscriberStats> {
  const unified = await getUnifiedSubscribers()
  const bySource: Record<SubscriberSource, number> = { member: 0, lead: 0, newsletter: 0 }
  let sendEligible = 0
  for (const s of unified) {
    bySource[s.source]++
    if (s.sendEligible) sendEligible++
  }
  return {
    totalUnique: unified.length,
    sendEligible,
    bySource,
    duplicatesCollapsed: 0, // set by caller if raw counts are tracked
  }
}

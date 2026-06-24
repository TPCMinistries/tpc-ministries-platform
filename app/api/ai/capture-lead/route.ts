import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { renderLeadConfirmation } from '@/lib/email/render'

export const dynamic = 'force-dynamic'

/**
 * Captures an email from the Ask-Prophet AI widget (typically after a visitor
 * reaches the free message limit). These are HOT leads — they engaged deeply
 * with the AI before converting. Flows into the same `leads` pipeline + nurture
 * as the Get Involved funnel, so they show up in admin Comms / Lead Scoring.
 *
 * Deduplicates on email: if the address is already a lead, we no-op (idempotent)
 * rather than create a duplicate.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body as { email?: string; name?: string }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = (name || '').trim() || 'Friend'
    const supabase = createAdminClient()

    // Dedup: if this email is already a lead, treat as success (no duplicate).
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: true, deduped: true }, { status: 200 })
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name: cleanName,
        email: cleanEmail,
        interests: [],
        source: 'ask-prophet-widget',
        status: 'new',
        interest_level: 'hot',
        notes: 'Captured from Ask Prophet AI chat after reaching the free message limit.',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating ask-prophet lead:', error)
      return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
    }

    // Confirmation to the visitor (best-effort)
    try {
      const html = await renderLeadConfirmation({ name: cleanName, interests: ['A personal word from Prophet Lorenzo'] })
      await sendEmail({
        to: cleanEmail,
        subject: 'Your word is coming — TPC Ministries',
        html,
      })
    } catch (emailError) {
      console.warn('Failed to send ask-prophet confirmation email:', emailError)
    }

    // Admin notify (best-effort)
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'info@tpcmin.org',
        subject: `New AI-chat lead (HOT): ${cleanEmail}`,
        html: `
          <h2>New lead from the Ask Prophet AI widget</h2>
          <p><strong>Email:</strong> ${cleanEmail}</p>
          <p><strong>Name:</strong> ${cleanName}</p>
          <p><strong>Source:</strong> Ask Prophet AI chat (hit free limit)</p>
          <p><strong>Lead level:</strong> HOT</p>
        `,
      })
    } catch (emailError) {
      console.warn('Failed to send admin notification:', emailError)
    }

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 })
  } catch (error) {
    console.error('Error in ask-prophet capture-lead POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

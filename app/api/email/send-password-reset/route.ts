import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import { renderPasswordReset } from '@/lib/email/render'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberName, email, resetUrl, expiresIn } = body

    if (!memberName || !email || !resetUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: memberName, email, resetUrl' },
        { status: 400 }
      )
    }

    // Force the reset link onto our own origin. Without this, the endpoint can
    // be abused to send TPC-branded "reset your password" emails that point at
    // an attacker-controlled URL (credential phishing). Keep only path/query/hash.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'
    let safeResetUrl: string
    try {
      const incoming = new URL(resetUrl, siteUrl)
      safeResetUrl = new URL(
        incoming.pathname + incoming.search + incoming.hash,
        siteUrl
      ).toString()
    } catch {
      return NextResponse.json({ error: 'Invalid resetUrl' }, { status: 400 })
    }

    // Only send to a real member — stops the endpoint being used to spam
    // branded reset emails to arbitrary addresses.
    const admin = createAdminClient()
    const { data: member } = await admin
      .from('members')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (member) {
      const html = await renderPasswordReset({
        memberName,
        resetUrl: safeResetUrl,
        expiresIn: expiresIn || '1 hour',
      })
      await sendEmail({
        to: email,
        subject: 'Reset your TPC Ministries password',
        html,
      })
    }

    // Always return the same response so callers can't enumerate accounts.
    return NextResponse.json({
      success: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    })
  } catch (error) {
    console.error('Password reset email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

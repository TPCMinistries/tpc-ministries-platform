import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const CATEGORY_LABEL: Record<string, string> = {
  health: 'Health',
  family: 'Family',
  financial: 'Financial',
  spiritual: 'Spiritual',
  other: 'Other',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to submit a prayer request.' },
        { status: 401 }
      )
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, email, first_name, last_name')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { error: 'Member profile not found. Please complete your profile setup.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { request_text, category, is_public, is_anonymous } = body

    if (!request_text || request_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prayer request text is required' },
        { status: 400 }
      )
    }

    if (request_text.length > 500) {
      return NextResponse.json(
        { error: 'Prayer request must be 500 characters or less' },
        { status: 400 }
      )
    }

    if (!category || !['health', 'family', 'financial', 'spiritual', 'other'].includes(category)) {
      return NextResponse.json(
        { error: 'Valid category is required' },
        { status: 400 }
      )
    }

    const trimmedText = request_text.trim()

    const { data, error } = await supabase
      .from('prayer_requests')
      .insert([
        {
          member_id: member.id,
          request_text: trimmedText,
          category,
          is_public: is_public ?? true,
          is_anonymous: is_anonymous ?? false,
          status: 'pending',
          is_answered: false,
          prayer_count: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating prayer request:', error)
      return NextResponse.json(
        { error: 'Failed to submit prayer request' },
        { status: 500 }
      )
    }

    const requesterName = [member.first_name, member.last_name].filter(Boolean).join(' ').trim()
      || user.user_metadata?.full_name
      || (member.email || user.email || 'Friend').split('@')[0]
    const requesterEmail = member.email || user.email || null
    const adminEmail = process.env.ADMIN_EMAIL || 'info@tpcmin.org'
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'

    // Fire both follow-up emails best-effort — never block the response or fail the request.
    fireAndForget(sendRequesterConfirmation({
      baseUrl,
      to: requesterEmail,
      name: requesterName,
      requestText: trimmedText,
      category,
    }))
    fireAndForget(sendAdminNotification({
      baseUrl,
      to: adminEmail,
      requesterName,
      requesterEmail,
      requestText: trimmedText,
      category,
      isAnonymous: is_anonymous ?? false,
      requestId: data?.id,
    }))

    return NextResponse.json(
      {
        message: 'Your prayer request has been submitted and is pending approval.',
        data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in prayer submit API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function fireAndForget(p: Promise<unknown>) {
  p.catch((err) => console.warn('Prayer email side-effect failed:', err))
}

async function sendRequesterConfirmation(params: {
  baseUrl: string
  to: string | null
  name: string
  requestText: string
  category: string
}) {
  if (!params.to) return
  const categoryLabel = CATEGORY_LABEL[params.category] || 'Prayer'
  const html = `
    <!DOCTYPE html>
    <html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); color: white; padding: 32px 24px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">We're praying with you</h1>
      </div>
      <div style="background: #ffffff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Dear ${escapeHtml(params.name)},</p>
        <p>Your prayer request has been received and is now in our community's hands.
        Our team reviews each submission before posting it to the public wall, and our
        intercessors will be standing with you regardless.</p>
        <div style="background: #faf5ff; border-left: 4px solid #7c3aed; padding: 16px 20px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0 0 6px 0; color: #6b21a8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(categoryLabel)}</p>
          <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(params.requestText)}</p>
        </div>
        <p style="font-style: italic; color: #555;">"Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective." — James 5:16</p>
        <p style="margin-top: 28px;">If your situation changes, you're always welcome to update us.</p>
        <p>Standing with you,<br>The TPC Ministries Team</p>
        <p style="margin-top: 32px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 16px;">
          <a href="${params.baseUrl}/prayer" style="color: #1e3a8a;">View the prayer wall</a>
        </p>
      </div>
    </body></html>
  `
  await fetch(`${params.baseUrl}/api/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: params.to,
      subject: 'Your prayer request has been received',
      html,
    }),
  })
}

async function sendAdminNotification(params: {
  baseUrl: string
  to: string
  requesterName: string
  requesterEmail: string | null
  requestText: string
  category: string
  isAnonymous: boolean
  requestId?: string
}) {
  const categoryLabel = CATEGORY_LABEL[params.category] || 'Prayer'
  const fromLine = params.isAnonymous
    ? '<em>Anonymous (visible to admins only)</em>'
    : `${escapeHtml(params.requesterName)}${params.requesterEmail ? ` &lt;${escapeHtml(params.requesterEmail)}&gt;` : ''}`
  const html = `
    <!DOCTYPE html>
    <html><body style="font-family: Arial, sans-serif; line-height: 1.5; color: #222; max-width: 640px; margin: 0 auto; padding: 20px;">
      <h2 style="margin: 0 0 16px 0;">New prayer request — pending approval</h2>
      <p><strong>From:</strong> ${fromLine}</p>
      <p><strong>Category:</strong> ${escapeHtml(categoryLabel)}</p>
      <div style="background: #f8fafc; border-left: 4px solid #1e3a8a; padding: 14px 18px; border-radius: 4px; margin: 16px 0; white-space: pre-wrap;">${escapeHtml(params.requestText)}</div>
      ${params.requestId ? `<p style="font-size: 12px; color: #666;">Request ID: <code>${escapeHtml(params.requestId)}</code></p>` : ''}
      <p><a href="${params.baseUrl}/admin/prayer-requests" style="display: inline-block; background: #1e3a8a; color: white; padding: 10px 22px; text-decoration: none; border-radius: 6px;">Review in admin</a></p>
    </body></html>
  `
  await fetch(`${params.baseUrl}/api/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: params.to,
      subject: `Prayer request: ${categoryLabel} (pending)`,
      html,
    }),
  })
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { renderLeadConfirmation } from '@/lib/email/render'

export const dynamic = 'force-dynamic'

// Human-readable labels for each interest a newcomer can signify.
const INTEREST_LABELS: Record<string, string> = {
  newcomer: "I'm new — add me to the list",
  serve: 'I want to serve / volunteer',
  missions: 'Future mission trips (e.g. Kenya)',
  'october-gathering': 'The October gathering',
}

/**
 * Public "Get Involved" funnel entry.
 * Captures a newcomer into the existing `leads` pipeline so it shows up in
 * the admin Communications / Lead Scoring tools, then confirms by email.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, interests } = body as {
      name?: string
      email?: string
      phone?: string
      interests?: string[]
    }

    // Validate
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const selected = Array.isArray(interests)
      ? interests.filter((i): i is string => typeof i === 'string' && i in INTEREST_LABELS)
      : []

    // Anyone asking to serve, join missions, or attend the Oct gathering is a
    // warmer lead than a plain "add me to the list" signup.
    const isHot = selected.some((i) => i === 'serve' || i === 'missions' || i === 'october-gathering')
    const labels = selected.map((i) => INTEREST_LABELS[i])

    const supabase = createAdminClient()

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone: phone || null,
        interests: selected,
        source: 'website',
        status: 'new',
        interest_level: isHot ? 'hot' : 'warm',
        notes: `Get Involved form. Interested in: ${labels.join(', ') || 'general'}`,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating get-involved lead:', error)
      return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 })
    }

    // Confirmation email to the person (best-effort)
    try {
      const html = await renderLeadConfirmation({ name, interests: labels })
      await sendEmail({
        to: email,
        subject: 'Welcome — thanks for connecting with TPC Ministries!',
        html,
      })
    } catch (emailError) {
      console.warn('Failed to send lead confirmation email:', emailError)
    }

    // Notify admin (best-effort) — send directly via Resend, like the
    // confirmation above, so it doesn't depend on a self-fetch / SITE_URL.
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'info@tpcmin.org',
        subject: `New Get Involved signup: ${name}`,
        html: `
          <h2>New "Get Involved" submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Interested in:</strong> ${labels.join(', ') || 'General'}</p>
          <p><strong>Lead level:</strong> ${isHot ? 'HOT' : 'Warm'}</p>
        `,
      })
    } catch (emailError) {
      console.warn('Failed to send admin notification:', emailError)
    }

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 })
  } catch (error) {
    console.error('Error in get-involved POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { buildDebriefEmail } from '@/lib/email/kenya-debrief-emails'

const TIME_LABELS: Record<string, string> = {
  '9am_pt': '9:00 AM Pacific',
  '12pm_et': '12:00 PM Eastern',
  '7pm_eat': '7:00 PM East Africa Time',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const fullName: string = (body.fullName || '').trim()
    const email: string = (body.email || '').trim().toLowerCase()
    const phone: string | null = body.phone?.trim() || null
    const preferredTime: string | null = body.preferredTime || null
    const howHeard: string | null = body.howHeard?.trim() || null

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Please share your name and email so we can send the link.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // Upsert on email — re-registering just refreshes the record, never errors.
    const { error: upsertError } = await supabase
      .from('kenya_debrief_registrations')
      .upsert(
        {
          full_name: fullName,
          email,
          phone,
          preferred_time: preferredTime,
          how_heard: howHeard,
          source: 'kenya-debrief-page',
        },
        { onConflict: 'email' }
      )

    if (upsertError) {
      console.error('Error saving Kenya debrief registration:', upsertError)
      return NextResponse.json(
        { error: 'Something went wrong saving your spot. Please try again.' },
        { status: 500 }
      )
    }

    // Confirmation (with Zoom link + calendar) to the registrant.
    const firstName = fullName.split(' ')[0]
    const { subject, html } = buildDebriefEmail('confirmation', firstName)
    try {
      const result = await sendEmail({ to: email, subject, html })
      if (result.success) {
        await supabase
          .from('kenya_debrief_registrations')
          .update({ confirmation_sent_at: new Date().toISOString() })
          .eq('email', email)
      }
    } catch (emailError) {
      console.error('Failed to send debrief confirmation email:', emailError)
    }

    // Admin notification.
    const timeLabel = preferredTime ? TIME_LABELS[preferredTime] : null
    try {
      await sendEmail({
        to: 'info@tpcmin.org',
        subject: `Kenya Debrief registration: ${fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color:#1e3a61;">New Kenya Debrief registration</h2>
            <table style="width:100%; border-collapse:collapse;">
              <tr><td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb; font-weight:bold;">Name</td><td style="padding:8px; border:1px solid #e5e7eb;">${fullName}</td></tr>
              <tr><td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb; font-weight:bold;">Email</td><td style="padding:8px; border:1px solid #e5e7eb;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb; font-weight:bold;">Phone</td><td style="padding:8px; border:1px solid #e5e7eb;">${phone || 'N/A'}</td></tr>
              <tr><td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb; font-weight:bold;">Preferred time</td><td style="padding:8px; border:1px solid #e5e7eb;">${timeLabel || 'No preference'}</td></tr>
              <tr><td style="padding:8px; border:1px solid #e5e7eb; background:#f9fafb; font-weight:bold;">How heard</td><td style="padding:8px; border:1px solid #e5e7eb;">${howHeard || 'N/A'}</td></tr>
            </table>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send debrief admin notification:', emailError)
    }

    return NextResponse.json(
      { success: true, message: "You're registered. Check your inbox for confirmation." },
      { status: 201 }
    )
  } catch (error) {
    console.error('Kenya debrief registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth-server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authResult = await requireStaff()
  if (authResult instanceof NextResponse) return authResult
  const staffMember = authResult.member

  try {
    const { contactId, action, subject, message } = await request.json()

    if (!contactId || !action) {
      return NextResponse.json({ error: 'contactId and action are required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: contact, error: contactError } = await adminClient
      .from('kenya_trip_contacts')
      .select('*')
      .eq('id', contactId)
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    if (!contact.email) {
      return NextResponse.json({ error: 'Contact has no email address. Add their email first.' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'

    if (action === 'custom_email') {
      // Send custom composed email
      if (!subject || !message) {
        return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
      }

      // Convert newlines to <br> for HTML
      const htmlMessage = message.replace(/\n/g, '<br>')

      await sendEmail({
        to: contact.email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #006600, #004d00); color: white; padding: 24px 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">TPC Ministries</h2>
              <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div style="height: 4px; background: linear-gradient(90deg, #d4af37, #f0d060, #d4af37);"></div>
            <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; background: #fff;">
              <p>Dear ${contact.name},</p>
              <div style="margin: 16px 0; line-height: 1.7;">${htmlMessage}</div>
              <p style="margin-top: 24px;">Blessings,<br><strong>${staffMember.first_name} ${staffMember.last_name}</strong><br>TPC Ministries Missions Team</p>
            </div>
            <div style="text-align: center; padding: 16px; color: #6b7280; font-size: 12px; background: #f9fafb; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <p>&copy; ${new Date().getFullYear()} TPC Ministries | <a href="https://tpcmin.org">tpcmin.org</a></p>
            </div>
          </div>
        `,
      })

      return NextResponse.json({ success: true })

    } else if (action === 'team_signup_link') {
      // Send the Kenya team signup form link
      const signupUrl = `${appUrl}/kenya/team`

      await sendEmail({
        to: contact.email,
        subject: 'Join the Kenya Team — Kingdom Impact Trip 2026',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #006600, #004d00); color: white; padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0 0 8px; font-size: 28px;">Karibu!</h1>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div style="height: 4px; background: linear-gradient(90deg, #d4af37, #f0d060, #d4af37);"></div>
            <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; background: #fff;">
              <p>Dear ${contact.name},</p>
              <p>We'd love to have you join the <strong>Kenya-based team</strong> for the Kingdom Impact Trip 2026. Please complete the registration form below so we can coordinate with you.</p>

              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-weight: bold; color: #166534;">Trip Details</p>
                <ul style="margin: 0; padding-left: 18px; font-size: 14px;">
                  <li><strong>Dates:</strong> April 22 – May 7, 2026</li>
                  <li><strong>Cities:</strong> Nairobi, Kakamega & Mombasa</li>
                  <li><strong>Tracks:</strong> Ministry, Health, Education & Business</li>
                </ul>
              </div>

              <p style="text-align: center; margin: 24px 0;">
                <a href="${signupUrl}" style="display: inline-block; background: #d4af37; color: #1e3a5f; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Register as Kenya Team</a>
              </p>
              <p style="font-size: 13px; color: #6b7280; text-align: center;">Or copy this link: ${signupUrl}</p>
            </div>
            <div style="text-align: center; padding: 16px; color: #6b7280; font-size: 12px; background: #f9fafb; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <p><strong>TPC Ministries</strong> — Kenya Kingdom Impact Trip 2026</p>
            </div>
          </div>
        `,
      })

      return NextResponse.json({ success: true })

    } else if (action === 'info_request') {
      // Send partner info request form (reuse existing logic)
      const formUrl = `${appUrl}/kenya/partner-info?id=${contactId}`

      await sendEmail({
        to: contact.email,
        subject: 'Kenya Trip — Help Us Coordinate!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #006600, #004d00); color: white; padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0 0 8px; font-size: 28px;">Kenya Kingdom Impact Trip</h1>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">Partner Coordination</p>
            </div>
            <div style="height: 4px; background: linear-gradient(90deg, #d4af37, #f0d060, #d4af37);"></div>
            <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; background: #fff;">
              <p>Hello ${contact.name}!</p>
              <p>We're coordinating logistics for the <strong>Kenya Kingdom Impact Trip 2026</strong>. Please take a moment to fill out this quick form so we have your complete information on file.</p>
              <p style="text-align: center; margin: 24px 0;">
                <a href="${formUrl}" style="display: inline-block; background: #d4af37; color: #1e3a5f; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Complete Partner Info Form</a>
              </p>
              <p style="font-size: 13px; color: #6b7280; text-align: center;">Or copy: ${formUrl}</p>
            </div>
            <div style="text-align: center; padding: 16px; color: #6b7280; font-size: 12px; background: #f9fafb; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <p><strong>TPC Ministries</strong> — Kenya Kingdom Impact Trip 2026</p>
            </div>
          </div>
        `,
      })

      return NextResponse.json({ success: true })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Kenya partner send error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

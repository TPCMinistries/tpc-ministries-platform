import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth-server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authResult = await requireStaff()
  if (authResult instanceof NextResponse) return authResult

  try {
    const { participantId, status, notes } = await request.json()
    const adminClient = createAdminClient()

    // Update participant status
    const updateData: Record<string, string | null> = {
      application_status: status,
      notes: notes || null,
    }
    if (status === 'approved') {
      updateData.approval_date = new Date().toISOString()
    }

    const { error: updateError } = await adminClient
      .from('kenya_trip_participants')
      .update(updateData)
      .eq('id', participantId)

    if (updateError) throw updateError

    // Get participant details for email
    const { data: participant } = await adminClient
      .from('kenya_trip_participants')
      .select('first_name, last_name, email, service_track')
      .eq('id', participantId)
      .single()

    if (!participant?.email) {
      return NextResponse.json({ success: true, emailSent: false })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'

    // Send status email
    if (status === 'approved') {
      const approvalHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #006600 0%, #004d00 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0 0 8px; font-size: 28px; }
            .header p { margin: 0; opacity: 0.9; }
            .accent-bar { height: 4px; background: linear-gradient(90deg, #d4af37, #f0d060, #d4af37); }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .steps { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .steps h3 { margin: 0 0 12px; color: #006600; }
            .steps ol { margin: 0; padding-left: 20px; }
            .steps li { margin: 8px 0; }
            .cta-btn { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Approved!</h1>
              <p>Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div class="accent-bar"></div>
            <div class="content">
              <p>Dear ${participant.first_name},</p>
              <p>Great news! Your application for the <strong>Kenya Kingdom Impact Trip 2026</strong> has been approved. We're excited to have you join the delegation!</p>

              <div class="steps">
                <h3>Next Steps</h3>
                <ol>
                  <li><strong>Complete your travel form</strong> — We need your passport details, flight preferences, and travel dates</li>
                  <li><strong>Submit your deposit</strong> — Secure your spot with an initial payment</li>
                  <li><strong>Join the trip community</strong> — Connect with other delegates and stay updated</li>
                </ol>
              </div>

              <p style="text-align: center; margin: 24px 0;">
                <a href="${appUrl}/kenya/travel" class="cta-btn">Complete Travel Form</a>
              </p>

              <p><strong>Trip Details:</strong></p>
              <ul>
                <li><strong>Dates:</strong> April 22 - May 7, 2026</li>
                <li><strong>Cities:</strong> Nairobi, Kakamega & Mombasa</li>
                <li><strong>Your Track:</strong> ${participant.service_track || 'To be assigned'}</li>
                <li><strong>Cost:</strong> $3,500 - $5,000 (payment plans available)</li>
              </ul>

              <p>If you have any questions, reach out to us at <a href="mailto:info@tpcmin.org">info@tpcmin.org</a>.</p>

              <p>See you in Kenya!<br><strong>TPC Ministries Missions Team</strong></p>
            </div>
            <div class="footer">
              <p><strong>TPC Ministries</strong> — Kenya Kingdom Impact Trip 2026</p>
            </div>
          </div>
        </body>
        </html>
      `

      await sendEmail({
        to: participant.email,
        subject: "You're Approved! Kenya Kingdom Impact Trip 2026 - Next Steps",
        html: approvalHtml,
      })
    } else if (status === 'waitlisted') {
      const waitlistHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Application Update</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div class="content">
              <p>Dear ${participant.first_name},</p>
              <p>Thank you for your interest in the Kenya Kingdom Impact Trip 2026. We've placed your application on our <strong>waitlist</strong>.</p>
              <p>This means we're still reviewing applications and managing trip capacity. We'll reach out as soon as a spot becomes available or if we have any updates.</p>
              <p>In the meantime, feel free to reach out to us at <a href="mailto:info@tpcmin.org">info@tpcmin.org</a> with any questions.</p>
              <p>Blessings,<br><strong>TPC Ministries Missions Team</strong></p>
            </div>
            <div class="footer">
              <p><strong>TPC Ministries</strong></p>
            </div>
          </div>
        </body>
        </html>
      `

      await sendEmail({
        to: participant.email,
        subject: 'Kenya Trip Application Update - Waitlisted',
        html: waitlistHtml,
      })
    } else if (status === 'declined') {
      const declineHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Application Update</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div class="content">
              <p>Dear ${participant.first_name},</p>
              <p>Thank you for your interest in the Kenya Kingdom Impact Trip 2026. After careful review, we're unable to accommodate your application at this time.</p>
              <p>We encourage you to stay connected with TPC Ministries and consider future mission opportunities. If you have questions or would like more information, please reach out to us at <a href="mailto:info@tpcmin.org">info@tpcmin.org</a>.</p>
              <p>Blessings,<br><strong>TPC Ministries Missions Team</strong></p>
            </div>
            <div class="footer">
              <p><strong>TPC Ministries</strong></p>
            </div>
          </div>
        </body>
        </html>
      `

      await sendEmail({
        to: participant.email,
        subject: 'Kenya Trip Application Update',
        html: declineHtml,
      })
    }

    return NextResponse.json({ success: true, emailSent: true })
  } catch (error) {
    console.error('Kenya approve error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

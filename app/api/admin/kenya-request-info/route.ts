import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

// Check if user is staff or admin
async function checkStaffOrAdmin(supabase: any, userId: string) {
  const { data: member } = await supabase
    .from('members')
    .select('id, first_name, last_name, is_admin, role')
    .eq('user_id', userId)
    .single()
  if (!member) return null
  if (member.is_admin || member.role === 'staff' || member.role === 'admin') return member
  return null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const staffMember = await checkStaffOrAdmin(supabase, user.id)
  if (!staffMember) return NextResponse.json({ error: 'Staff access required' }, { status: 403 })

  try {
    const { participantId, email, name, message } = await request.json()

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 })
    }

    const senderName = `${staffMember.first_name} ${staffMember.last_name}`.trim()

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #006600 0%, #004d00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .accent-bar { height: 4px; background: linear-gradient(90deg, #d4af37, #f0d060, #d4af37); }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .message-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.7; }
          .reply-btn { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 22px;">Kenya Kingdom Impact Trip</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Follow-Up on Your Application</p>
          </div>
          <div class="accent-bar"></div>
          <div class="content">
            <p>Hi ${name.split(' ')[0] || 'there'},</p>
            <p>Thank you for your interest in the Kenya Kingdom Impact Trip 2026! We have a few follow-up questions about your application:</p>
            <div class="message-box">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <p style="text-align: center; margin: 24px 0;">
              <a href="mailto:info@tpcmin.org?subject=Kenya Trip Follow-Up" class="reply-btn">Reply to This Email</a>
            </p>
            <p style="font-size: 13px; color: #6b7280;">
              You can also reply directly to this email or reach us at <a href="mailto:info@tpcmin.org">info@tpcmin.org</a>.
            </p>
          </div>
          <div class="footer">
            <p><strong>TPC Ministries</strong> — Kenya Kingdom Impact Trip 2026</p>
            <p>Message sent by ${senderName}</p>
          </div>
        </div>
      </body>
      </html>
    `

    await sendEmail({
      to: email,
      subject: 'Kenya Trip Application - Follow-Up Questions',
      html: emailHtml,
      from: 'TPC Ministries <info@tpcmin.com>',
    })

    // Log the follow-up in participant notes
    if (participantId) {
      const adminClient = createAdminClient()
      const { data: existing } = await adminClient
        .from('kenya_trip_participants')
        .select('notes')
        .eq('id', participantId)
        .single()

      const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const noteEntry = `\n---\n[${timestamp}] Follow-up sent by ${senderName}: ${message.substring(0, 100)}...`
      const updatedNotes = (existing?.notes || '') + noteEntry

      await adminClient
        .from('kenya_trip_participants')
        .update({ notes: updatedNotes })
        .eq('id', participantId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Request info error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

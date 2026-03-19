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

function buildPartnerEmailHtml(name: string, contactId: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'
  const formUrl = `${appUrl}/kenya/partner-info?id=${contactId}`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #006600 0%, #004d00 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0 0 8px; font-size: 28px; }
        .header p { margin: 0; font-size: 16px; opacity: 0.9; }
        .accent-bar { height: 4px; background: linear-gradient(90deg, #d4af37, #f0d060, #d4af37); }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 24px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kenya Kingdom Impact Trip</h1>
          <p>Partner Coordination</p>
        </div>
        <div class="accent-bar"></div>
        <div class="content">
          <h2 style="color: #1e3a5f;">Hello ${name}!</h2>
          <p>We're coordinating logistics for the <strong>Kenya Kingdom Impact Trip 2026</strong>. Please take a moment to fill out this quick form so we have your complete information on file.</p>
          <p style="text-align: center;">
            <a href="${formUrl}" class="button">Complete Partner Info Form</a>
          </p>
          <p style="font-size: 13px; color: #6b7280; text-align: center;">
            Or copy this link: ${formUrl}
          </p>
        </div>
        <div class="footer">
          <p><strong>TPC Ministries</strong> — Kenya Kingdom Impact Trip 2026</p>
          <p>Questions? Reply to this email or contact your trip coordinator.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const staffMember = await checkStaffOrAdmin(supabase, user.id)
  if (!staffMember) return NextResponse.json({ error: 'Staff access required' }, { status: 403 })

  try {
    const { contactId } = await request.json()

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Look up the contact
    const { data: contact, error: contactError } = await adminClient
      .from('kenya_trip_contacts')
      .select('*')
      .eq('id', contactId)
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    if (!contact.email) {
      return NextResponse.json({ error: 'Contact has no email address' }, { status: 400 })
    }

    const emailResult = await sendEmail({
      to: contact.email,
      subject: 'Kenya Trip — Help Us Coordinate!',
      html: buildPartnerEmailHtml(contact.name || 'Partner', contactId),
    })

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
    })
  } catch (error: any) {
    console.error('Kenya partner email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

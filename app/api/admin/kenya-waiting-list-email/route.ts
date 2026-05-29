import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth-server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

function buildEnticeEmailHtml(name: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'

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
        .highlight { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin: 4px 2px; }
        .details { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .details h3 { margin: 0 0 12px; color: #006600; font-size: 16px; }
        .details ul { margin: 0; padding-left: 20px; }
        .details li { margin: 6px 0; color: #374151; font-size: 14px; }
        .button { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 24px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're On Our Radar!</h1>
          <p>Kenya Kingdom Impact Trip 2026</p>
        </div>
        <div class="accent-bar"></div>
        <div class="content">
          <h2 style="color: #1e3a5f;">Hello ${name}!</h2>
          <p>We noticed your interest in the <strong>Kenya Kingdom Impact Trip 2026</strong> and wanted to share some exciting details about what's in store.</p>

          <p style="font-size: 15px;"><strong>Join 30+ delegates</strong> on a life-changing journey across Kenya!</p>

          <p><strong>Dates:</strong> April 22 – May 7, 2026</p>
          <p><strong>Cities:</strong> Nairobi, Kakamega & Mombasa</p>

          <div class="details">
            <h3>Ministry Tracks</h3>
            <ul>
              <li><span class="highlight">Ministry</span> — Spiritual care, preaching, and pastoral support</li>
              <li><span class="highlight">Medical</span> — Health screenings, clinics, and wellness outreach</li>
              <li><span class="highlight">Education</span> — Youth development, tutoring, and school partnerships</li>
              <li><span class="highlight">Business</span> — Economic empowerment, entrepreneurship training, and micro-enterprise</li>
              <li><span class="highlight">Media</span> — Storytelling, content creation, and digital outreach</li>
            </ul>
          </div>

          <p style="text-align: center;">
            <a href="${appUrl}/kenya" class="button">I'm Interested — Tell Me More</a>
          </p>
          <p style="font-size: 13px; color: #6b7280; text-align: center;">
            Or visit: ${appUrl}/kenya
          </p>
        </div>
        <div class="footer">
          <p><strong>TPC Ministries</strong> — Kenya Kingdom Impact Trip 2026</p>
          <p>April 22 – May 7, 2026 | Nairobi, Kakamega & Mombasa</p>
          <p>Questions? Reply to this email or contact your trip coordinator.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function buildWelcomeEmailHtml(name: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'

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
          <h1>Welcome to the Delegation!</h1>
          <p>Kenya Kingdom Impact Trip 2026</p>
        </div>
        <div class="accent-bar"></div>
        <div class="content">
          <h2 style="color: #1e3a5f;">Congratulations, ${name}!</h2>
          <p>We're thrilled to officially welcome you to the <strong>Kenya Kingdom Impact Trip 2026</strong> delegation! This is going to be a life-changing experience, and we can't wait to journey with you.</p>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px; color: #92400e; font-size: 16px;">Next Steps</h3>
            <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
              <li style="margin: 6px 0;"><strong>Step 1:</strong> <a href="${appUrl}/kenya/travel" style="color: #b45309;">Complete your Travel Form</a> — travel logistics, passport, flights</li>
              <li style="margin: 6px 0;"><strong>Step 2:</strong> <a href="${appUrl}/kenya/health-safety" style="color: #b45309;">Complete Health & Safety Form</a> — emergency contact, vaccinations, medical info</li>
              <li style="margin: 6px 0;"><strong>Step 3:</strong> Apply for Kenya eTA at <a href="https://etakenya.go.ke" style="color: #b45309;">etakenya.go.ke</a> ($30)</li>
              <li style="margin: 6px 0;"><strong>Step 4:</strong> Schedule your Yellow Fever vaccination (takes 10 days to activate)</li>
            </ol>
          </div>

          <p style="text-align: center;">
            <a href="${appUrl}/kenya/travel" class="button">Complete Travel Form</a>
          </p>

          <p>If you have any questions, reach out to us at <a href="mailto:info@tpcmin.org">info@tpcmin.org</a>.</p>
          <p>See you in Kenya!<br><strong>TPC Ministries Missions Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>TPC Ministries</strong> — Kenya Kingdom Impact Trip 2026</p>
          <p>April 22 – May 7, 2026 | Nairobi, Kakamega & Mombasa</p>
          <p>Questions? Reply to this email or contact your trip coordinator.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function buildDeclineEmailHtml(name: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'

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
        .way-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 12px 0; }
        .way-card h4 { margin: 0 0 6px; color: #006600; font-size: 15px; }
        .way-card p { margin: 0; font-size: 14px; color: #374151; }
        .way-card a { color: #006600; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>We'll Miss You</h1>
          <p>Kenya Kingdom Impact Trip 2026</p>
        </div>
        <div class="accent-bar"></div>
        <div class="content">
          <h2 style="color: #1e3a5f;">Dear ${name},</h2>
          <p>We understand plans change — but you can still make an impact from right where you are.</p>

          <h3 style="color: #1e3a5f; margin-top: 24px;">4 Ways You Can Still Participate</h3>

          <div class="way-card">
            <h4>&#128230; Pack the Mission</h4>
            <p>Pledge supplies for the team heading to Kenya. Every item makes a difference.</p>
            <p style="margin-top: 8px;"><a href="${appUrl}/kenya/pack-the-mission">Pledge Supplies &rarr;</a></p>
          </div>

          <div class="way-card">
            <h4>&#128157; Donate</h4>
            <p>Your financial support helps cover travel, medical supplies, and community resources.</p>
            <p style="margin-top: 8px;"><a href="${appUrl}/kenya/give">Give a Gift &rarr;</a></p>
          </div>

          <div class="way-card">
            <h4>&#128225; Follow Along</h4>
            <p>Stay connected with live trip updates, photos, and stories from the field.</p>
            <p style="margin-top: 8px;"><a href="${appUrl}/kenya/live">Get Live Updates &rarr;</a></p>
          </div>

          <div class="way-card">
            <h4>&#128591; Pray</h4>
            <p>Cover the team in prayer. Your intercession is one of the most powerful ways to support the mission.</p>
          </div>

          <p style="margin-top: 20px;">Follow us on social media for trip updates: <strong>@tpcministries</strong></p>

          <p>Blessings,<br><strong>TPC Ministries Missions Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>TPC Ministries</strong> — Kenya Kingdom Impact Trip 2026</p>
          <p>April 22 – May 7, 2026 | Nairobi, Kakamega & Mombasa</p>
          <p>Questions? Reply to this email or contact your trip coordinator.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  const authResult = await requireStaff()
  if (authResult instanceof NextResponse) return authResult

  try {
    const { waitingListId, action } = await request.json()

    if (!waitingListId) {
      return NextResponse.json({ error: 'waitingListId is required' }, { status: 400 })
    }

    if (!action || !['entice', 'welcome', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be entice, welcome, or decline' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Look up the waiting list entry
    const { data: entry, error: entryError } = await adminClient
      .from('kenya_trip_waiting_list')
      .select('*')
      .eq('id', waitingListId)
      .single()

    if (entryError || !entry) {
      return NextResponse.json({ error: 'Waiting list entry not found' }, { status: 404 })
    }

    if (!entry.email) {
      return NextResponse.json({ error: 'Waiting list entry has no email address' }, { status: 400 })
    }

    const name = `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || 'Friend'
    let subject: string
    let html: string
    let newStatus: string

    if (action === 'entice') {
      subject = "Kenya Kingdom Impact Trip 2026 — You're On Our Radar!"
      html = buildEnticeEmailHtml(name)
      newStatus = '📧 Contacted'
    } else if (action === 'welcome') {
      subject = 'Welcome to the Kenya Delegation! 🇰🇪 Next Steps Inside'
      html = buildWelcomeEmailHtml(name)
      newStatus = '✅ Promoted'
    } else {
      subject = "We'll Miss You — But You Can Still Be Part of This"
      html = buildDeclineEmailHtml(name)
      newStatus = '❌ Declined'
    }

    const emailResult = await sendEmail({
      to: entry.email,
      subject,
      html,
    })

    // Update the waiting list entry status
    const { error: updateError } = await adminClient
      .from('kenya_trip_waiting_list')
      .update({ status: newStatus })
      .eq('id', waitingListId)

    if (updateError) {
      console.error('Failed to update waiting list status:', updateError)
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      status: newStatus,
    })
  } catch (error) {
    console.error('Kenya waiting list email error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

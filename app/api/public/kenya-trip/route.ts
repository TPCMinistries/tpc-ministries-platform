import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { NextRequest, NextResponse } from 'next/server'

const trackLabels: Record<string, string> = {
  ministry: 'Ministry & Spiritual Care',
  education: 'Education & Youth Development',
  medical: 'Medical Missions',
  business: 'Business & Economic Development',
  'food-security': 'Food Security & Social Enterprise',
  'not-sure': 'Not Sure Yet',
}

const passportLabels: Record<string, string> = {
  valid: 'Have valid passport',
  renew: 'Need to renew',
  apply: 'Need to apply',
}

// POST - Submit Kenya trip application
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      cityState,
      preferredTrack,
      passportStatus,
      scholarshipNeeded,
      notes,
      consent,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !preferredTrack || !passportStatus || !scholarshipNeeded) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    // Validate consent
    if (!consent) {
      return NextResponse.json(
        { error: 'Please agree to be contacted to continue' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Try to insert into kenya_trip_applications table
    // If table doesn't exist, fall back to contact_submissions
    let insertError = null

    // First, try the dedicated table
    const { error: kenyaError } = await supabase
      .from('kenya_trip_applications')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        city_state: cityState || null,
        preferred_track: preferredTrack,
        passport_status: passportStatus,
        scholarship_needed: scholarshipNeeded === 'yes',
        notes: notes || null,
        consent: true,
        status: 'pending',
        trip_year: 2026,
      })

    if (kenyaError) {
      // Table might not exist - fall back to contact_submissions
      console.log('Kenya trip table not found, using contact_submissions:', kenyaError.message)

      const { error: contactError } = await supabase
        .from('contact_submissions')
        .insert({
          name: `${firstName} ${lastName}`,
          email,
          phone: phone || null,
          subject: 'Kenya Kingdom Impact Trip 2026 Application',
          message: `
KENYA TRIP APPLICATION

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || 'Not provided'}
City/State: ${cityState || 'Not provided'}
Preferred Track: ${preferredTrack}
Passport Status: ${passportStatus}
Scholarship Needed: ${scholarshipNeeded}

Notes/Skills/Background:
${notes || 'None provided'}
          `.trim(),
          category: 'missions',
        })

      insertError = contactError
    }

    if (insertError) {
      console.error('Error saving Kenya trip application:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      )
    }

    // Send email notification to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            td { padding: 12px; border: 1px solid #e5e7eb; }
            td:first-child { background: #f9fafb; font-weight: bold; width: 40%; }
            .notes { background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
            .badge { display: inline-block; background: ${scholarshipNeeded === 'yes' ? '#fef3c7' : '#d1fae5'}; color: ${scholarshipNeeded === 'yes' ? '#92400e' : '#065f46'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Kenya Trip Application</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Kingdom Impact Trip 2026</p>
            </div>
            <div class="content">
              <p>A new application has been submitted for the Kenya Kingdom Impact Trip.</p>

              <table>
                <tr>
                  <td>Name</td>
                  <td><strong>${firstName} ${lastName}</strong></td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td>${phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td>Location</td>
                  <td>${cityState || 'Not provided'}</td>
                </tr>
                <tr>
                  <td>Preferred Track</td>
                  <td>${trackLabels[preferredTrack] || preferredTrack}</td>
                </tr>
                <tr>
                  <td>Passport Status</td>
                  <td>${passportLabels[passportStatus] || passportStatus}</td>
                </tr>
                <tr>
                  <td>Scholarship</td>
                  <td><span class="badge">${scholarshipNeeded === 'yes' ? 'Requesting Scholarship' : 'Full Cost Covered'}</span></td>
                </tr>
              </table>

              ${notes ? `
                <div class="notes">
                  <strong>Notes / Skills / Background:</strong>
                  <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${notes}</p>
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>This application was submitted via <a href="https://tpcmin.org/kenya">tpcmin.org/kenya</a></p>
              <p>© ${new Date().getFullYear()} TPC Ministries</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send admin notification (don't fail the request if email fails)
    try {
      await sendEmail({
        to: 'info@tpcmin.org',
        subject: `New Kenya Trip Application: ${firstName} ${lastName}`,
        html: adminEmailHtml,
      })
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
    }

    // Send confirmation email to applicant
    const confirmationEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .highlight { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding: 20px; background: #f9fafb; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Application Received!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div class="content">
              <p>Dear ${firstName},</p>

              <p>Thank you for your interest in joining the <strong>Kenya Kingdom Impact Trip 2026</strong>! We have received your application and our team will review it shortly.</p>

              <div class="highlight">
                <strong>What happens next?</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Our missions team will review your application</li>
                  <li>We'll reach out within 5-7 business days</li>
                  <li>You'll receive information about next steps, including orientation dates and preparation materials</li>
                </ul>
              </div>

              <p>In the meantime, if you have any questions, please don't hesitate to reach out to us at <a href="mailto:info@tpcmin.org">info@tpcmin.org</a>.</p>

              <p>We're excited about the possibility of serving alongside you in Kenya!</p>

              <p>Blessings,<br><strong>TPC Ministries Missions Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TPC Ministries</p>
              <p><a href="https://tpcmin.org">tpcmin.org</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      await sendEmail({
        to: email,
        subject: 'Your Kenya Trip Application - TPC Ministries',
        html: confirmationEmailHtml,
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your application! We will be in touch soon.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in Kenya trip POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Retrieve applications (admin use)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Try to get from dedicated table first
    const { data, error } = await supabase
      .from('kenya_trip_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Fall back to contact submissions filtered by subject
      const { data: contactData, error: contactError } = await supabase
        .from('contact_submissions')
        .select('*')
        .ilike('subject', '%Kenya%')
        .order('created_at', { ascending: false })

      if (contactError) {
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
      }

      return NextResponse.json({ applications: contactData })
    }

    return NextResponse.json({ applications: data })
  } catch (error) {
    console.error('Error in Kenya trip GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

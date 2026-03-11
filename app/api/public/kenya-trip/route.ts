import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { NextRequest, NextResponse } from 'next/server'

const trackLabels: Record<string, string> = {
  ministry: 'Ministry & Spiritual Care',
  education: 'Education & Youth Development',
  health: 'Health & Wellness',
  business: 'Business & Economic Development',
  all: 'All Ministries',
}

const passportLabels: Record<string, string> = {
  valid: 'Have valid passport',
  renew: 'Need to renew',
  apply: 'Need to apply',
}

// POST - Submit Kenya trip interest/application
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

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

    if (!consent) {
      return NextResponse.json(
        { error: 'Please agree to be contacted to continue' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check for duplicate email on this trip
    const { data: existing } = await supabase
      .from('kenya_trip_participants')
      .select('id, email')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'An application with this email already exists. If you need to update your information, please contact info@tpcmin.org.' },
        { status: 409 }
      )
    }

    // Get the active trip
    const { data: trip } = await supabase
      .from('kenya_trips')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Insert directly into participants table as pending application
    const { error: insertError } = await supabase
      .from('kenya_trip_participants')
      .insert({
        trip_id: trip?.id || null,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        location: cityState || null,
        service_track: preferredTrack,
        passport_status: passportStatus === 'valid' ? 'submitted' : 'pending',
        scholarship_requested: scholarshipNeeded === 'yes',
        notes: notes || null,
        application_status: 'pending',
        interest_form_completed_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Error saving Kenya trip application:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      )
    }

    // Send admin notification email
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
              <h1 style="margin: 0;">New Kenya Trip Interest</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Kingdom Impact Trip 2026</p>
            </div>
            <div class="content">
              <p>A new interest form has been submitted for the Kenya Kingdom Impact Trip.</p>

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
                  <td>Ministry Interest</td>
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

              <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">
                View and manage this application in the <a href="https://tpcmin.org/kenya-command-center">Kenya Command Center</a>.
              </p>
            </div>
            <div class="footer">
              <p>Submitted via <a href="https://tpcmin.org/kenya">tpcmin.org/kenya</a></p>
              <p>&copy; ${new Date().getFullYear()} TPC Ministries</p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      await sendEmail({
        to: 'info@tpcmin.org',
        subject: `New Kenya Trip Interest: ${firstName} ${lastName}`,
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
              <h1 style="margin: 0;">We Received Your Interest!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div class="content">
              <p>Dear ${firstName},</p>

              <p>Thank you for your interest in the <strong>Kenya Kingdom Impact Trip 2026</strong>! We're excited about the possibility of you joining us on this transformative journey.</p>

              <div class="highlight">
                <strong>What happens next?</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Our missions team will review your submission</li>
                  <li>We'll reach out within a few days with next steps</li>
                  <li>You'll receive a link to complete your travel details and secure your spot</li>
                </ul>
              </div>

              <p><strong>Trip Details:</strong></p>
              <ul>
                <li><strong>Dates:</strong> April 22 &ndash; May 7, 2026</li>
                <li><strong>Cities:</strong> Nairobi, Kakamega &amp; Mombasa</li>
                <li><strong>Cost:</strong> $3,500 &ndash; $5,000 (payment plans available)</li>
                <li><strong>Your Interest:</strong> ${trackLabels[preferredTrack] || preferredTrack}</li>
              </ul>

              <p>If you have any questions, don't hesitate to reach out to us at <a href="mailto:info@tpcmin.org">info@tpcmin.org</a>.</p>

              <p>Blessings,<br><strong>TPC Ministries Missions Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} TPC Ministries</p>
              <p><a href="https://tpcmin.org">tpcmin.org</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      await sendEmail({
        to: email,
        subject: 'Your Kenya Trip Interest - TPC Ministries',
        html: confirmationEmailHtml,
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your interest! We will be in touch soon.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in Kenya trip POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Retrieve applications (admin use)
export async function GET() {
  try {
    const supabase = createAdminClient()

    // Fetch all participants ordered by most recent
    const { data, error } = await supabase
      .from('kenya_trip_participants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching participants:', error)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    return NextResponse.json({ applications: data })
  } catch (error) {
    console.error('Error in Kenya trip GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

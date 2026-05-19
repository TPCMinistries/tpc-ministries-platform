import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { NextRequest, NextResponse } from 'next/server'

const roleLabels: Record<string, string> = {
  admin: 'Kenya Administrator',
  partner: 'Partner Organization',
  attendee: 'Local Attendee',
}

const trackLabels: Record<string, string> = {
  ministry: 'Ministry & Spiritual Care',
  health: 'Health & Wellness',
  education: 'Education & Youth Development',
  business: 'Business & Economic Development',
  all: 'All Ministries',
}

// Kenya 2026 trip ended 2026-05-06 — POSTs return 410 Gone.
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'kenya_2026_closed', message: 'Kenya 2026 is complete. See the recap at /kenya-2026.' },
    { status: 410 }
  )

  // eslint-disable-next-line no-unreachable
  try {
    const supabase = createAdminClient()
    const body = await _request.json()

    const {
      firstName,
      lastName,
      email,
      phone,
      kenyaTeamRole,
      organization,
      orgTitle,
      city,
      serviceTrack,
      languagesSpoken,
      tShirtSize,
      howHeard,
      emergencyContactName,
      emergencyContactPhone,
      notes,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !kenyaTeamRole || !city) {
      return NextResponse.json(
        { error: 'Please fill in all required fields: Name, Email, Phone, Role, and City.' },
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

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('kenya_trip_participants')
      .select('id, email')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'A registration with this email already exists. If you need to update your information, please contact info@tpcmin.org.' },
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

    // Insert Kenya team participant
    const { error: insertError } = await supabase
      .from('kenya_trip_participants')
      .insert({
        trip_id: trip?.id || null,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        delegation_type: 'kenya_team',
        kenya_team_role: kenyaTeamRole,
        organization: organization || null,
        org_title: orgTitle || null,
        location: city,
        service_track: serviceTrack || null,
        languages_spoken: languagesSpoken || null,
        t_shirt_size: tShirtSize || null,
        how_heard: howHeard || null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_phone: emergencyContactPhone || null,
        notes: notes || null,
        application_status: 'pending',
        kenya_team_form_completed_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Error saving Kenya team signup:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit registration. Please try again.' },
        { status: 500 }
      )
    }

    // Send admin notification
    try {
      await sendEmail({
        to: 'info@tpcmin.org',
        subject: `Kenya Team Signup: ${firstName} ${lastName} (${roleLabels[kenyaTeamRole] || kenyaTeamRole})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #006600, #004d00); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h2 style="margin: 0;">New Kenya Team Registration</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Kingdom Impact Trip 2026</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>${firstName} ${lastName}</strong></td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Role</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${roleLabels[kenyaTeamRole] || kenyaTeamRole}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Phone</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${phone}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">City</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${city}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Organization</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${organization || 'N/A'} ${orgTitle ? '(' + orgTitle + ')' : ''}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Ministry</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${trackLabels[serviceTrack] || serviceTrack || 'Not specified'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Languages</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${languagesSpoken || 'Not specified'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">T-Shirt</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${tShirtSize || 'Not specified'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">How Heard</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${howHeard || 'Not specified'}</td></tr>
                ${notes ? `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Notes</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${notes}</td></tr>` : ''}
              </table>
              <p style="margin-top: 15px; color: #6b7280; font-size: 13px;">View in <a href="https://tpcmin.org/kenya-command-center">Kenya Command Center</a></p>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
    }

    // Send confirmation to registrant
    try {
      await sendEmail({
        to: email,
        subject: 'Registration Received — Kenya Kingdom Impact Trip 2026',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #006600, #004d00); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Karibu! Welcome!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p>Dear ${firstName},</p>
              <p>Thank you for registering as a <strong>${roleLabels[kenyaTeamRole] || kenyaTeamRole}</strong> for the Kenya Kingdom Impact Trip 2026! We're excited to have you as part of the Kenya team.</p>

              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                <strong>What happens next?</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
                  <li>Our team will review your registration</li>
                  <li>We'll reach out to confirm your role and responsibilities</li>
                  <li>You'll receive coordination details as the trip approaches</li>
                </ul>
              </div>

              <p><strong>Trip Details:</strong></p>
              <ul>
                <li><strong>Dates:</strong> April 22 &ndash; May 7, 2026</li>
                <li><strong>Cities:</strong> Nairobi, Kakamega &amp; Mombasa</li>
                <li><strong>Your Role:</strong> ${roleLabels[kenyaTeamRole] || kenyaTeamRole}</li>
              </ul>

              <p>If you have any questions, reach out to us at <a href="mailto:info@tpcmin.org">info@tpcmin.org</a>.</p>

              <p>Blessings,<br><strong>TPC Ministries Missions Team</strong></p>
            </div>
            <div style="text-align: center; padding: 15px; color: #6b7280; font-size: 12px; background: #f9fafb; border-radius: 0 0 10px 10px;">
              <p>&copy; ${new Date().getFullYear()} TPC Ministries | <a href="https://tpcmin.org">tpcmin.org</a></p>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json(
      { success: true, message: 'Registration submitted successfully.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Kenya team signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

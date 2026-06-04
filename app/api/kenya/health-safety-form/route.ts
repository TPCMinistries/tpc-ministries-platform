import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { NextRequest, NextResponse } from 'next/server'

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
      email,
      gender,
      preferredName,
      tShirtSize,
      roommatePreference,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      yellowFeverStatus,
      yellowFeverDate,
      malariaProphylaxis,
      travelInsuranceStatus,
      travelInsuranceProvider,
      bloodType,
      allergies,
      medications,
      medicalConditions,
      dietaryRestrictions,
      languagesSpoken,
      priorMissionExperience,
    } = body

    // Validate required fields
    if (!email || !gender || !tShirtSize || !emergencyContactName || !emergencyContactPhone || !yellowFeverStatus || !travelInsuranceStatus) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 }
      )
    }

    // Find participant by email
    const { data: participant } = await supabase
      .from('kenya_trip_participants')
      .select('id, first_name, last_name')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (!participant) {
      return NextResponse.json(
        { error: 'No registration found for this email. Please submit the Travel Form first.' },
        { status: 404 }
      )
    }
    const participantRecord = participant as NonNullable<typeof participant>

    const healthData = {
      gender: gender || null,
      preferred_name: preferredName || null,
      t_shirt_size: tShirtSize || null,
      roommate_preference: roommatePreference || null,
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      emergency_contact_relationship: emergencyContactRelationship || null,
      yellow_fever_status: yellowFeverStatus || 'unknown',
      yellow_fever_date: yellowFeverDate || null,
      malaria_prophylaxis: malariaProphylaxis || null,
      travel_insurance_status: travelInsuranceStatus || 'unknown',
      travel_insurance_provider: travelInsuranceProvider || null,
      blood_type: bloodType || null,
      allergies: allergies || null,
      medications: medications || null,
      medical_conditions: medicalConditions || null,
      dietary_restrictions: dietaryRestrictions || null,
      languages_spoken: languagesSpoken || null,
      prior_mission_experience: priorMissionExperience || null,
      health_safety_form_completed_at: new Date().toISOString(),
      medical_form_completed_at: new Date().toISOString(),
    }

    const { error: dbError } = await supabase
      .from('kenya_trip_participants')
      .update(healthData)
      .eq('id', participantRecord.id)

    if (dbError) {
      console.error('Error saving health & safety form:', dbError)
      return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
    }

    // Send admin notification
    try {
      await sendEmail({
        to: 'info@tpcmin.org',
        subject: `Health & Safety Form: ${participantRecord.first_name} ${participantRecord.last_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #006600, #004d00); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h2 style="margin: 0;">Health & Safety Form Submitted</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
              <p><strong>${participantRecord.first_name} ${participantRecord.last_name}</strong> (${email}) has submitted their Health & Safety form.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Yellow Fever</td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${yellowFeverStatus}</td></tr>
                <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Travel Insurance</td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${travelInsuranceStatus}</td></tr>
                <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Emergency Contact</td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${emergencyContactName} (${emergencyContactRelationship || 'N/A'})</td></tr>
                <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Blood Type</td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${bloodType || 'Unknown'}</td></tr>
                <tr><td style="padding: 6px 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">T-Shirt</td><td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${tShirtSize}</td></tr>
              </table>
              <p style="margin-top: 12px; color: #6b7280; font-size: 13px;">View in <a href="https://tpcmin.org/kenya-command-center">Kenya Command Center</a></p>
            </div>
          </div>
        `,
      })
    } catch {
      console.error('Failed to send admin notification')
    }

    // Send confirmation to participant
    try {
      await sendEmail({
        to: email,
        subject: 'Health & Safety Info Received — Kenya Trip 2026',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #006600, #004d00); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 22px;">Health & Safety Info Received!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p>Dear ${participantRecord.first_name},</p>
              <p>Thank you for completing your Health & Safety form! Our team now has your emergency contact, medical, and vaccination information on file.</p>
              ${yellowFeverStatus === 'need_to_schedule' ? `
                <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <strong style="color: #991b1b;">Action Needed: Yellow Fever Vaccination</strong>
                  <p style="color: #991b1b; margin: 5px 0 0 0; font-size: 14px;">Please schedule your Yellow Fever vaccination as soon as possible. The vaccine takes 10 days to become effective, and you may need the certificate for Kenya entry.</p>
                </div>
              ` : ''}
              ${travelInsuranceStatus === 'need_help' || travelInsuranceStatus === 'none' ? `
                <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <strong style="color: #92400e;">Reminder: Travel Insurance</strong>
                  <p style="color: #92400e; margin: 5px 0 0 0; font-size: 14px;">We strongly recommend travel insurance with medical evacuation coverage for your Kenya trip. Contact us if you need help finding a policy.</p>
                </div>
              ` : ''}
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                <strong>What's Next?</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
                  <li>Apply for your Kenya eTA at <a href="https://etakenya.go.ke">etakenya.go.ke</a> ($30)</li>
                  <li>Ensure your passport is valid through October 2026</li>
                  <li>We'll be in touch with final trip details closer to departure</li>
                </ul>
              </div>
              <p>If you need to update anything, reply to this email.</p>
              <p>Blessings,<br><strong>TPC Ministries Missions Team</strong></p>
            </div>
            <div style="text-align: center; padding: 15px; color: #6b7280; font-size: 12px; background: #f9fafb; border-radius: 0 0 10px 10px;">
              <p>&copy; ${new Date().getFullYear()} TPC Ministries | <a href="https://tpcmin.org">tpcmin.org</a></p>
            </div>
          </div>
        `,
      })
    } catch {
      console.error('Failed to send confirmation email')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Health & safety form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

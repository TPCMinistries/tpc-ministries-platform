import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { NextRequest, NextResponse } from 'next/server'

const trackLabels: Record<string, string> = {
  ministry: 'Ministry & Spiritual Care',
  health: 'Health & Wellness',
  education: 'Education & Youth Development',
  business: 'Business & Economic Development',
  all: 'All Ministries',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const formData = await request.formData()

    // Extract fields
    const displayFirstName = formData.get('displayFirstName') as string
    const displayLastName = formData.get('displayLastName') as string
    const honorific = formData.get('honorific') as string
    const serviceTrack = formData.get('serviceTrack') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const mailingAddress = formData.get('mailingAddress') as string
    const organization = formData.get('organization') as string
    const orgTitle = formData.get('orgTitle') as string
    const location = formData.get('location') as string
    const travelAccommodationType = formData.get('travelAccommodationType') as string
    const travelAccommodationOther = formData.get('travelAccommodationOther') as string
    const travelDateIn = formData.get('travelDateIn') as string
    const travelDateOut = formData.get('travelDateOut') as string
    const legalFullName = formData.get('legalFullName') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const departureAirport = formData.get('departureAirport') as string
    const returnAirport = formData.get('returnAirport') as string
    const specialAssistance = formData.get('specialAssistance') as string
    const specialAssistanceDetails = formData.get('specialAssistanceDetails') as string
    const tsaKnownTravelerNumber = formData.get('tsaKnownTravelerNumber') as string
    const travelNotes = formData.get('travelNotes') as string
    const passportPhoto = formData.get('passportPhoto') as File | null
    // Enhanced fields (migration 053)
    const gender = formData.get('gender') as string
    const preferredName = formData.get('preferredName') as string
    const tShirtSize = formData.get('tShirtSize') as string
    const roommatePreference = formData.get('roommatePreference') as string
    const yellowFeverStatus = formData.get('yellowFeverStatus') as string
    const yellowFeverDate = formData.get('yellowFeverDate') as string
    const malariaProphylaxis = formData.get('malariaProphylaxis') as string
    const travelInsuranceStatus = formData.get('travelInsuranceStatus') as string
    const travelInsuranceProvider = formData.get('travelInsuranceProvider') as string
    const emergencyContactName = formData.get('emergencyContactName') as string
    const emergencyContactPhone = formData.get('emergencyContactPhone') as string
    const emergencyContactRelationship = formData.get('emergencyContactRelationship') as string
    const allergies = formData.get('allergies') as string
    const medications = formData.get('medications') as string
    const medicalConditions = formData.get('medicalConditions') as string
    const dietaryRestrictions = formData.get('dietaryRestrictions') as string
    const languagesSpoken = formData.get('languagesSpoken') as string
    const priorMissionExperience = formData.get('priorMissionExperience') as string
    const bloodType = formData.get('bloodType') as string

    // Validate required fields
    if (!displayFirstName || !displayLastName || !email || !legalFullName || !serviceTrack) {
      return NextResponse.json(
        { error: 'Please fill in all required fields (name, email, legal name, ministry track).' },
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

    // Upload passport photo if provided
    let passportPhotoUrl: string | null = null
    if (passportPhoto && passportPhoto.size > 0) {
      const fileExt = passportPhoto.name.split('.').pop()
      const fileName = `passport_${displayFirstName.toLowerCase()}_${displayLastName.toLowerCase()}_${Date.now()}.${fileExt}`
      const filePath = `kenya-travel/${fileName}`

      const arrayBuffer = await passportPhoto.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from('kenya-trip-documents')
        .upload(filePath, arrayBuffer, {
          contentType: passportPhoto.type,
          upsert: false,
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('kenya-trip-documents')
          .getPublicUrl(filePath)
        passportPhotoUrl = urlData.publicUrl
      } else {
        console.error('Passport photo upload error:', uploadError)
      }
    }

    // Get the active trip
    const { data: trip } = await supabase
      .from('kenya_trips')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Check if participant already exists (by email)
    const { data: existing } = await supabase
      .from('kenya_trip_participants')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    const travelData = {
      display_first_name: displayFirstName,
      display_last_name: displayLastName,
      honorific: honorific === 'none' ? null : honorific || null,
      service_track: serviceTrack,
      email,
      phone: phone || null,
      mailing_address: mailingAddress || null,
      organization: organization || null,
      org_title: orgTitle || null,
      location: location || null,
      travel_accommodation_type: travelAccommodationType || null,
      travel_accommodation_other: travelAccommodationOther || null,
      travel_date_in: travelDateIn || null,
      travel_date_out: travelDateOut || null,
      legal_full_name: legalFullName,
      date_of_birth: dateOfBirth || null,
      departure_airport: departureAirport || null,
      return_airport: returnAirport || null,
      special_assistance: specialAssistance || 'none',
      special_assistance_details: specialAssistanceDetails || null,
      tsa_known_traveler_number: tsaKnownTravelerNumber || null,
      travel_notes: travelNotes || null,
      travel_form_completed_at: new Date().toISOString(),
      ...(passportPhotoUrl ? { passport_photo_url: passportPhotoUrl } : {}),
      // Enhanced fields
      gender: gender || null,
      preferred_name: preferredName || null,
      t_shirt_size: tShirtSize || null,
      roommate_preference: roommatePreference || null,
      yellow_fever_status: yellowFeverStatus || 'unknown',
      yellow_fever_date: yellowFeverDate || null,
      malaria_prophylaxis: malariaProphylaxis || null,
      travel_insurance_status: travelInsuranceStatus || 'unknown',
      travel_insurance_provider: travelInsuranceProvider || null,
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      emergency_contact_relationship: emergencyContactRelationship || null,
      allergies: allergies || null,
      medications: medications || null,
      medical_conditions: medicalConditions || null,
      dietary_restrictions: dietaryRestrictions || null,
      languages_spoken: languagesSpoken || null,
      prior_mission_experience: priorMissionExperience || null,
      blood_type: bloodType || null,
    }

    let dbError = null

    if (existing) {
      // Update existing participant record
      const { error } = await supabase
        .from('kenya_trip_participants')
        .update(travelData)
        .eq('id', existing.id)
      dbError = error
    } else {
      // Create new participant record (travel form submitted without interest form first)
      const { error } = await supabase
        .from('kenya_trip_participants')
        .insert({
          trip_id: trip?.id || null,
          first_name: displayFirstName,
          last_name: displayLastName,
          application_status: 'pending',
          ...travelData,
        })
      dbError = error
    }

    if (dbError) {
      console.error('Error saving travel form:', dbError)
      return NextResponse.json(
        { error: 'Failed to save travel information. Please try again.' },
        { status: 500 }
      )
    }

    // Send admin notification
    const accommodationLabels: Record<string, string> = {
      team_flight_and_hotel: 'Team books flight + accommodations',
      team_flight: 'Team books flight only',
      team_hotel: 'Team books accommodations only',
      self_arrange: 'Self-arranging everything',
      other: `Other: ${travelAccommodationOther || 'not specified'}`,
    }

    try {
      await sendEmail({
        to: 'info@tpcmin.org',
        subject: `Travel Form Submitted: ${honorific && honorific !== 'none' ? honorific + ' ' : ''}${displayFirstName} ${displayLastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #b45309, #f59e0b); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h2 style="margin: 0;">Travel Form Submitted</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Name (ID)</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${honorific && honorific !== 'none' ? honorific + ' ' : ''}${displayFirstName} ${displayLastName}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Legal Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${legalFullName}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${email}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Phone</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${phone || 'N/A'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Ministry</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${trackLabels[serviceTrack] || serviceTrack}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Organization</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${organization || 'N/A'} ${orgTitle ? '(' + orgTitle + ')' : ''}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Travel Type</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${accommodationLabels[travelAccommodationType] || travelAccommodationType || 'Not specified'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Travel Dates</td><td style="padding: 8px; border: 1px solid #e5e7eb;">In: ${travelDateIn || 'TBD'} | Out: ${travelDateOut || 'TBD'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Airports</td><td style="padding: 8px; border: 1px solid #e5e7eb;">Depart: ${departureAirport || 'N/A'} | Return: ${returnAirport || 'N/A'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Special Assistance</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${specialAssistance === 'none' ? 'None' : specialAssistance + (specialAssistanceDetails ? ': ' + specialAssistanceDetails : '')}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">TSA/KTN</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${tsaKnownTravelerNumber || 'N/A'}</td></tr>
                ${travelNotes ? `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Notes</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${travelNotes}</td></tr>` : ''}
                ${passportPhotoUrl ? `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Passport Photo</td><td style="padding: 8px; border: 1px solid #e5e7eb;"><a href="${passportPhotoUrl}">View uploaded photo</a></td></tr>` : ''}
              </table>
              <p style="margin-top: 15px; color: #6b7280; font-size: 13px;">View in <a href="https://tpcmin.org/kenya-command-center">Kenya Command Center</a></p>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send admin travel form notification:', emailError)
    }

    // Send confirmation to participant
    try {
      await sendEmail({
        to: email,
        subject: 'Travel Information Received - Kenya Kingdom Impact Trip 2026',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #b45309, #f59e0b); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0;">Travel Details Received!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Kenya Kingdom Impact Trip 2026</p>
            </div>
            <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p>Dear ${displayFirstName},</p>
              <p>Thank you for submitting your travel information for the Kenya Kingdom Impact Trip! Our team now has what we need to begin coordinating your travel arrangements.</p>
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <strong>What happens next?</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Our travel team will review your details</li>
                  <li>If you requested team-booked travel, we'll send you options to confirm</li>
                  <li>You'll receive payment information and options shortly</li>
                </ul>
              </div>
              <p>If you need to update any information, please reply to this email or contact us at <a href="mailto:info@tpcmin.org">info@tpcmin.org</a>.</p>
              <p>Blessings,<br><strong>TPC Ministries Missions Team</strong></p>
            </div>
            <div style="text-align: center; padding: 15px; color: #6b7280; font-size: 12px; background: #f9fafb; border-radius: 0 0 10px 10px;">
              <p>&copy; ${new Date().getFullYear()} TPC Ministries | <a href="https://tpcmin.org">tpcmin.org</a></p>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send travel form confirmation:', emailError)
    }

    return NextResponse.json(
      { success: true, message: 'Travel information submitted successfully.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in travel form POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

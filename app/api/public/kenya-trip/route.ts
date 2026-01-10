import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    // TODO: Send email notification to info@tpcmin.org
    // This requires configuring an email provider (Resend, SendGrid, etc.)
    // The site appears to have Resend configured - check /lib/email or similar

    // TODO: Send confirmation email to applicant

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

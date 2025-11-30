import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const certificateId = searchParams.get('id')

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (certificateId) {
      // Get specific certificate
      const { data: certificate } = await supabase
        .from('plant_certificates')
        .select(`
          *,
          course:plant_courses(name, slug),
          learning_path:plant_learning_paths(name, slug)
        `)
        .eq('id', certificateId)
        .eq('member_id', member.id)
        .single()

      if (!certificate) {
        return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
      }

      return NextResponse.json({ certificate })
    }

    // Get all certificates
    const { data: certificates } = await supabase
      .from('plant_certificates')
      .select(`
        *,
        course:plant_courses(name, slug),
        learning_path:plant_learning_paths(name, slug)
      `)
      .eq('member_id', member.id)
      .order('issued_at', { ascending: false })

    return NextResponse.json({ certificates: certificates || [] })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const { course_id, learning_path_id } = body

    if (!course_id && !learning_path_id) {
      return NextResponse.json({ error: 'course_id or learning_path_id required' }, { status: 400 })
    }

    const recipientName = `${member.first_name} ${member.last_name}`

    if (course_id) {
      // Check if course is completed
      const { data: enrollment } = await supabase
        .from('plant_enrollments')
        .select('id, status, certificate_issued')
        .eq('member_id', member.id)
        .eq('course_id', course_id)
        .single()

      if (!enrollment) {
        return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 404 })
      }

      if (enrollment.status !== 'completed') {
        return NextResponse.json({ error: 'Course not completed' }, { status: 400 })
      }

      if (enrollment.certificate_issued) {
        // Return existing certificate
        const { data: existingCert } = await supabase
          .from('plant_certificates')
          .select('*')
          .eq('member_id', member.id)
          .eq('course_id', course_id)
          .single()

        return NextResponse.json({
          message: 'Certificate already issued',
          certificate: existingCert
        })
      }

      // Get course details
      const { data: course } = await supabase
        .from('plant_courses')
        .select('name, has_certificate')
        .eq('id', course_id)
        .single()

      if (!course?.has_certificate) {
        return NextResponse.json({ error: 'This course does not offer a certificate' }, { status: 400 })
      }

      // Create certificate
      const { data: certificate, error } = await supabase
        .from('plant_certificates')
        .insert({
          member_id: member.id,
          course_id,
          recipient_name: recipientName,
          course_name: course.name,
          verification_url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-certificate/`
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating certificate:', error)
        return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
      }

      // Update verification URL with certificate ID
      await supabase
        .from('plant_certificates')
        .update({ verification_url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-certificate/${certificate.id}` })
        .eq('id', certificate.id)

      // Mark certificate as issued
      await supabase
        .from('plant_enrollments')
        .update({ certificate_issued: true, certificate_id: certificate.id })
        .eq('id', enrollment.id)

      return NextResponse.json({
        message: 'Certificate issued',
        certificate
      })
    }

    if (learning_path_id) {
      // Check if path is completed
      const { data: pathEnrollment } = await supabase
        .from('plant_path_enrollments')
        .select('id, progress_percent, certificate_issued')
        .eq('member_id', member.id)
        .eq('learning_path_id', learning_path_id)
        .single()

      if (!pathEnrollment) {
        return NextResponse.json({ error: 'Not enrolled in this path' }, { status: 404 })
      }

      if (pathEnrollment.progress_percent < 100) {
        return NextResponse.json({ error: 'Learning path not completed' }, { status: 400 })
      }

      if (pathEnrollment.certificate_issued) {
        const { data: existingCert } = await supabase
          .from('plant_certificates')
          .select('*')
          .eq('member_id', member.id)
          .eq('learning_path_id', learning_path_id)
          .single()

        return NextResponse.json({
          message: 'Certificate already issued',
          certificate: existingCert
        })
      }

      // Get path details
      const { data: path } = await supabase
        .from('plant_learning_paths')
        .select('name')
        .eq('id', learning_path_id)
        .single()

      // Create certificate
      const { data: certificate, error } = await supabase
        .from('plant_certificates')
        .insert({
          member_id: member.id,
          learning_path_id,
          recipient_name: recipientName,
          course_name: `${path?.name} Learning Path`,
          verification_url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-certificate/`
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating path certificate:', error)
        return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
      }

      // Update verification URL
      await supabase
        .from('plant_certificates')
        .update({ verification_url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-certificate/${certificate.id}` })
        .eq('id', certificate.id)

      // Mark certificate as issued
      await supabase
        .from('plant_path_enrollments')
        .update({ certificate_issued: true, certificate_id: certificate.id })
        .eq('id', pathEnrollment.id)

      return NextResponse.json({
        message: 'Certificate issued',
        certificate
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error in certificates API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

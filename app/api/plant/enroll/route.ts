import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, membership_tier')
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

    const memberTier = member.membership_tier || 'free'
    const tierOrder = { free: 0, partner: 1, covenant: 2 }
    const userTierLevel = tierOrder[memberTier as keyof typeof tierOrder] || 0

    // Enroll in a course
    if (course_id) {
      // Check course exists and tier access
      const { data: course } = await supabase
        .from('plant_courses')
        .select('id, required_tier, name')
        .eq('id', course_id)
        .eq('status', 'published')
        .single()

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      const requiredTierLevel = tierOrder[course.required_tier as keyof typeof tierOrder] || 0
      if (userTierLevel < requiredTierLevel) {
        return NextResponse.json({
          error: 'Upgrade required',
          required_tier: course.required_tier,
          current_tier: memberTier
        }, { status: 403 })
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('plant_enrollments')
        .select('id, status')
        .eq('member_id', member.id)
        .eq('course_id', course_id)
        .single()

      if (existing) {
        // Reactivate if paused
        if (existing.status === 'paused') {
          await supabase
            .from('plant_enrollments')
            .update({ status: 'active', started_at: new Date().toISOString() })
            .eq('id', existing.id)

          return NextResponse.json({ message: 'Enrollment reactivated', enrollment_id: existing.id })
        }
        return NextResponse.json({ message: 'Already enrolled', enrollment_id: existing.id })
      }

      // Create enrollment
      const { data: enrollment, error } = await supabase
        .from('plant_enrollments')
        .insert({
          member_id: member.id,
          course_id,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating enrollment:', error)
        return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
      }

      // Update course enrollment count
      await supabase.rpc('increment_enrollment_count', { course_id_param: course_id })
        .then(() => {})
        .catch(() => {
          // If RPC doesn't exist, update manually
          supabase
            .from('plant_courses')
            .update({ enrollment_count: course.enrollment_count + 1 })
            .eq('id', course_id)
        })

      return NextResponse.json({
        message: 'Enrolled successfully',
        enrollment_id: enrollment.id,
        course_name: course.name
      })
    }

    // Enroll in a learning path
    if (learning_path_id) {
      // Check path exists and tier access
      const { data: path } = await supabase
        .from('plant_learning_paths')
        .select(`
          id,
          required_tier,
          name,
          courses:plant_path_courses(
            course:plant_courses(id, required_tier)
          )
        `)
        .eq('id', learning_path_id)
        .eq('status', 'published')
        .single()

      if (!path) {
        return NextResponse.json({ error: 'Learning path not found' }, { status: 404 })
      }

      const requiredTierLevel = tierOrder[path.required_tier as keyof typeof tierOrder] || 0
      if (userTierLevel < requiredTierLevel) {
        return NextResponse.json({
          error: 'Upgrade required',
          required_tier: path.required_tier,
          current_tier: memberTier
        }, { status: 403 })
      }

      // Check if already enrolled in path
      const { data: existingPath } = await supabase
        .from('plant_path_enrollments')
        .select('id')
        .eq('member_id', member.id)
        .eq('learning_path_id', learning_path_id)
        .single()

      if (existingPath) {
        return NextResponse.json({ message: 'Already enrolled in path', enrollment_id: existingPath.id })
      }

      // Create path enrollment
      const { data: pathEnrollment, error: pathError } = await supabase
        .from('plant_path_enrollments')
        .insert({
          member_id: member.id,
          learning_path_id,
          status: 'active'
        })
        .select()
        .single()

      if (pathError) {
        console.error('Error creating path enrollment:', pathError)
        return NextResponse.json({ error: 'Failed to enroll in path' }, { status: 500 })
      }

      // Auto-enroll in all path courses
      const courseIds = path.courses?.map((c: any) => c.course?.id).filter(Boolean) || []

      for (const courseId of courseIds) {
        // Check if already enrolled in course
        const { data: existingCourse } = await supabase
          .from('plant_enrollments')
          .select('id')
          .eq('member_id', member.id)
          .eq('course_id', courseId)
          .single()

        if (!existingCourse) {
          await supabase
            .from('plant_enrollments')
            .insert({
              member_id: member.id,
              course_id: courseId,
              status: 'active',
              started_at: new Date().toISOString()
            })
        }
      }

      return NextResponse.json({
        message: 'Enrolled in learning path',
        enrollment_id: pathEnrollment.id,
        path_name: path.name,
        courses_enrolled: courseIds.length
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error in enroll API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get all course enrollments
    const { data: enrollments } = await supabase
      .from('plant_enrollments')
      .select(`
        *,
        course:plant_courses(
          id,
          slug,
          name,
          thumbnail_url,
          total_lessons,
          estimated_hours
        )
      `)
      .eq('member_id', member.id)
      .order('last_accessed_at', { ascending: false, nullsFirst: false })

    // Get path enrollments
    const { data: pathEnrollments } = await supabase
      .from('plant_path_enrollments')
      .select(`
        *,
        learning_path:plant_learning_paths(
          id,
          slug,
          name,
          thumbnail_url,
          total_courses
        )
      `)
      .eq('member_id', member.id)

    return NextResponse.json({
      course_enrollments: enrollments || [],
      path_enrollments: pathEnrollments || []
    })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

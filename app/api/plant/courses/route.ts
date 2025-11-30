import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const ministry = searchParams.get('ministry') || 'all'
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')

    // Get current user's membership tier
    const { data: { user } } = await supabase.auth.getUser()
    let memberTier = 'free'
    let memberId: string | null = null

    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('id, membership_tier')
        .eq('user_id', user.id)
        .single()

      if (member) {
        memberTier = member.membership_tier || 'free'
        memberId = member.id
      }
    }

    // If slug is provided, get single course with full details
    if (slug) {
      const { data: course, error } = await supabase
        .from('plant_courses')
        .select(`
          *,
          instructor:plant_instructors(
            id,
            member_id,
            external_name,
            title,
            specialty,
            credentials
          ),
          modules:plant_modules(
            id,
            slug,
            name,
            description,
            sequence_order,
            has_quiz,
            lessons:plant_lessons(
              id,
              slug,
              name,
              description,
              sequence_order,
              content_type,
              estimated_minutes,
              is_preview
            )
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error || !course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      // Sort modules and lessons
      course.modules = course.modules
        ?.sort((a: any, b: any) => a.sequence_order - b.sequence_order)
        .map((module: any) => ({
          ...module,
          lessons: module.lessons?.sort((a: any, b: any) => a.sequence_order - b.sequence_order)
        }))

      // Check enrollment and progress
      let enrollment = null
      let lessonProgress: Record<string, any> = {}

      if (memberId) {
        const { data: enrollmentData } = await supabase
          .from('plant_enrollments')
          .select('*')
          .eq('member_id', memberId)
          .eq('course_id', course.id)
          .single()

        enrollment = enrollmentData

        if (enrollmentData) {
          const { data: progress } = await supabase
            .from('plant_lesson_progress')
            .select('lesson_id, status, progress_percent, completed_at')
            .eq('enrollment_id', enrollmentData.id)

          if (progress) {
            progress.forEach(p => {
              lessonProgress[p.lesson_id] = p
            })
          }
        }
      }

      // Check tier access
      const tierOrder = { free: 0, partner: 1, covenant: 2 }
      const requiredTierLevel = tierOrder[course.required_tier as keyof typeof tierOrder] || 0
      const userTierLevel = tierOrder[memberTier as keyof typeof tierOrder] || 0

      return NextResponse.json({
        course: {
          ...course,
          enrollment,
          lesson_progress: lessonProgress,
          has_access: userTierLevel >= requiredTierLevel,
          is_enrolled: !!enrollment
        },
        user_tier: memberTier
      })
    }

    // List courses
    let query = supabase
      .from('plant_courses')
      .select(`
        id,
        slug,
        name,
        description,
        thumbnail_url,
        category,
        difficulty_level,
        ministry_id,
        required_tier,
        estimated_hours,
        total_modules,
        total_lessons,
        enrollment_count,
        average_rating,
        has_certificate,
        instructor:plant_instructors(
          id,
          external_name,
          title,
          member:members(first_name, last_name)
        )
      `)
      .eq('status', 'published')
      .eq('is_public', true)

    if (category) {
      query = query.eq('category', category)
    }

    if (ministry !== 'all') {
      query = query.or(`ministry_id.eq.${ministry},ministry_id.eq.general`)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    query = query.order('name')

    const { data: courses, error } = await query

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    // Get user's enrollments
    let enrollments: Record<string, any> = {}
    if (memberId) {
      const { data: userEnrollments } = await supabase
        .from('plant_enrollments')
        .select('course_id, status, progress_percent')
        .eq('member_id', memberId)

      if (userEnrollments) {
        userEnrollments.forEach(e => {
          enrollments[e.course_id] = e
        })
      }
    }

    // Add access and enrollment info
    const coursesWithAccess = courses?.map(course => {
      const tierOrder = { free: 0, partner: 1, covenant: 2 }
      const requiredTierLevel = tierOrder[course.required_tier as keyof typeof tierOrder] || 0
      const userTierLevel = tierOrder[memberTier as keyof typeof tierOrder] || 0

      return {
        ...course,
        enrollment: enrollments[course.id] || null,
        has_access: userTierLevel >= requiredTierLevel,
        is_enrolled: !!enrollments[course.id]
      }
    })

    return NextResponse.json({
      courses: coursesWithAccess,
      user_tier: memberTier
    })
  } catch (error) {
    console.error('Error in courses API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

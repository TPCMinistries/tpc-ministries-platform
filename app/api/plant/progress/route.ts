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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      lesson_id,
      status,
      progress_percent,
      video_position,
      time_spent,
      personal_notes
    } = body

    if (!lesson_id) {
      return NextResponse.json({ error: 'lesson_id required' }, { status: 400 })
    }

    // Get the lesson and verify enrollment
    const { data: lesson } = await supabase
      .from('plant_lessons')
      .select(`
        id,
        module:plant_modules(
          id,
          course_id
        )
      `)
      .eq('id', lesson_id)
      .single()

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const courseId = (lesson.module as any)?.course_id

    // Get enrollment
    const { data: enrollment } = await supabase
      .from('plant_enrollments')
      .select('id')
      .eq('member_id', member.id)
      .eq('course_id', courseId)
      .single()

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
    }

    // Check for existing progress
    const { data: existingProgress } = await supabase
      .from('plant_lesson_progress')
      .select('id, time_spent')
      .eq('member_id', member.id)
      .eq('lesson_id', lesson_id)
      .single()

    const now = new Date().toISOString()
    const isCompleting = status === 'completed'

    if (existingProgress) {
      // Update existing progress
      const updateData: any = {
        last_accessed_at: now,
        time_spent: (existingProgress.time_spent || 0) + (time_spent || 0)
      }

      if (status) updateData.status = status
      if (progress_percent !== undefined) updateData.progress_percent = progress_percent
      if (video_position !== undefined) updateData.video_position = video_position
      if (personal_notes !== undefined) updateData.personal_notes = personal_notes
      if (isCompleting) updateData.completed_at = now

      const { error } = await supabase
        .from('plant_lesson_progress')
        .update(updateData)
        .eq('id', existingProgress.id)

      if (error) {
        console.error('Error updating progress:', error)
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Progress updated' })
    } else {
      // Create new progress record
      const { error } = await supabase
        .from('plant_lesson_progress')
        .insert({
          member_id: member.id,
          lesson_id,
          enrollment_id: enrollment.id,
          status: status || 'in_progress',
          progress_percent: progress_percent || 0,
          video_position: video_position || 0,
          started_at: now,
          last_accessed_at: now,
          time_spent: time_spent || 0,
          personal_notes,
          completed_at: isCompleting ? now : null
        })

      if (error) {
        console.error('Error creating progress:', error)
        return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Progress recorded' })
    }
  } catch (error) {
    console.error('Error in progress API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')

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

    if (courseId) {
      // Get progress for specific course
      const { data: enrollment } = await supabase
        .from('plant_enrollments')
        .select('*')
        .eq('member_id', member.id)
        .eq('course_id', courseId)
        .single()

      if (!enrollment) {
        return NextResponse.json({ error: 'Not enrolled' }, { status: 404 })
      }

      const { data: lessonProgress } = await supabase
        .from('plant_lesson_progress')
        .select('*')
        .eq('enrollment_id', enrollment.id)

      return NextResponse.json({
        enrollment,
        lesson_progress: lessonProgress || []
      })
    }

    // Get overall learning stats
    const { data: enrollments } = await supabase
      .from('plant_enrollments')
      .select('*')
      .eq('member_id', member.id)

    const { data: allProgress } = await supabase
      .from('plant_lesson_progress')
      .select('status, time_spent')
      .eq('member_id', member.id)

    const completedLessons = allProgress?.filter(p => p.status === 'completed').length || 0
    const totalTimeSpent = allProgress?.reduce((sum, p) => sum + (p.time_spent || 0), 0) || 0
    const completedCourses = enrollments?.filter(e => e.status === 'completed').length || 0

    const { data: certificates } = await supabase
      .from('plant_certificates')
      .select('id')
      .eq('member_id', member.id)

    return NextResponse.json({
      stats: {
        enrolled_courses: enrollments?.length || 0,
        completed_courses: completedCourses,
        completed_lessons: completedLessons,
        total_time_spent: totalTimeSpent,
        certificates_earned: certificates?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

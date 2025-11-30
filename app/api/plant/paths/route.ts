import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const ministry = searchParams.get('ministry') || 'all'

    // Get current user's membership tier (if logged in)
    const { data: { user } } = await supabase.auth.getUser()
    let memberTier = 'free'

    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('membership_tier')
        .eq('user_id', user.id)
        .single()

      if (member?.membership_tier) {
        memberTier = member.membership_tier
      }
    }

    // Build query for learning paths
    let query = supabase
      .from('plant_learning_paths')
      .select(`
        *,
        courses:plant_path_courses(
          sequence_order,
          is_required,
          course:plant_courses(
            id,
            slug,
            name,
            thumbnail_url,
            estimated_hours
          )
        )
      `)
      .eq('status', 'published')
      .eq('is_public', true)

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category)
    }

    // Filter by ministry if not 'all'
    if (ministry !== 'all') {
      query = query.or(`ministry_id.eq.${ministry},ministry_id.eq.general`)
    }

    // Order by name
    query = query.order('name')

    const { data: paths, error } = await query

    if (error) {
      console.error('Error fetching learning paths:', error)
      return NextResponse.json({ error: 'Failed to fetch learning paths' }, { status: 500 })
    }

    // Check if user is enrolled in each path
    let enrollments: Record<string, any> = {}
    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (member) {
        const { data: pathEnrollments } = await supabase
          .from('plant_path_enrollments')
          .select('learning_path_id, status, progress_percent')
          .eq('member_id', member.id)

        if (pathEnrollments) {
          pathEnrollments.forEach(e => {
            enrollments[e.learning_path_id] = e
          })
        }
      }
    }

    // Add enrollment info and check tier access
    const pathsWithAccess = paths?.map(path => {
      const tierOrder = { free: 0, partner: 1, covenant: 2 }
      const requiredTierLevel = tierOrder[path.required_tier as keyof typeof tierOrder] || 0
      const userTierLevel = tierOrder[memberTier as keyof typeof tierOrder] || 0

      return {
        ...path,
        courses: path.courses?.sort((a: any, b: any) => a.sequence_order - b.sequence_order),
        enrollment: enrollments[path.id] || null,
        has_access: userTierLevel >= requiredTierLevel,
        is_enrolled: !!enrollments[path.id]
      }
    })

    return NextResponse.json({
      paths: pathsWithAccess,
      user_tier: memberTier
    })
  } catch (error) {
    console.error('Error in learning paths API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

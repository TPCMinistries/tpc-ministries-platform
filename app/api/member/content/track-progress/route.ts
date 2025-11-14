import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { teaching_id, progress_percentage, completed, last_position_seconds } = body

    if (!teaching_id) {
      return NextResponse.json(
        { success: false, error: 'Missing teaching_id' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    // Upsert progress record
    const { data, error } = await supabase
      .from('content_progress')
      .upsert({
        member_id: member.id,
        teaching_id,
        progress_percentage: progress_percentage || 0,
        completed: completed || false,
        last_position_seconds: last_position_seconds || 0,
        last_accessed: new Date().toISOString()
      }, {
        onConflict: 'member_id,teaching_id'
      })
      .select()
      .single()

    if (error) throw error

    // Check if season is now complete and send email
    if (completed) {
      try {
        // Get the teaching's season
        const { data: teaching } = await supabase
          .from('teachings')
          .select('season_id')
          .eq('id', teaching_id)
          .single()

        if (teaching?.season_id) {
          // Count total teachings in season
          const { count: totalTeachings } = await supabase
            .from('teachings')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', teaching.season_id)
            .eq('is_published', true)

          // Count completed teachings in season for this member
          const { data: allProgress } = await supabase
            .from('content_progress')
            .select('teaching_id, completed')
            .eq('member_id', member.id)
            .eq('completed', true)

          // Get all teaching IDs for this season
          const { data: seasonTeachings } = await supabase
            .from('teachings')
            .select('id')
            .eq('season_id', teaching.season_id)
            .eq('is_published', true)

          const seasonTeachingIds = new Set(seasonTeachings?.map(t => t.id) || [])
          const completedInSeason = allProgress?.filter(p => seasonTeachingIds.has(p.teaching_id)).length || 0

          // If all teachings are completed, trigger completion email
          if (totalTeachings && completedInSeason === totalTeachings) {
            await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/notifications/season-complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                memberId: member.id,
                seasonId: teaching.season_id,
              }),
            })
          }
        }
      } catch (emailError) {
        // Don't fail progress tracking if email fails
        console.warn('Season completion email check failed:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Progress saved',
      data
    })
  } catch (error) {
    console.error('Error tracking progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track progress' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const teaching_id = searchParams.get('teaching_id')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    let query = supabase
      .from('content_progress')
      .select('*')
      .eq('member_id', member.id)

    if (teaching_id) {
      query = query.eq('teaching_id', teaching_id)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      progress: data
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

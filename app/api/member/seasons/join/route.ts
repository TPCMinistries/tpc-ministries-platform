import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { season_id } = body

    if (!season_id) {
      return NextResponse.json(
        { success: false, error: 'Missing season_id' },
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

    // Check if already joined
    const { data: existing } = await supabase
      .from('member_seasons')
      .select('id')
      .eq('member_id', member.id)
      .eq('season_id', season_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Already joined this season' },
        { status: 409 }
      )
    }

    // Join the season
    const { data, error } = await supabase
      .from('member_seasons')
      .insert({
        member_id: member.id,
        season_id: season_id,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Successfully joined season',
      data
    })
  } catch (error) {
    console.error('Error joining season:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join season' },
      { status: 500 }
    )
  }
}

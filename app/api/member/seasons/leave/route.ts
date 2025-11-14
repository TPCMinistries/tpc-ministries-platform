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

    // Delete the member_season record
    const { error } = await supabase
      .from('member_seasons')
      .delete()
      .eq('member_id', member.id)
      .eq('season_id', season_id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Successfully left season'
    })
  } catch (error) {
    console.error('Error leaving season:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to leave season' },
      { status: 500 }
    )
  }
}

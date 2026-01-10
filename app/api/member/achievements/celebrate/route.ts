import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Mark achievement as celebrated
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
    const { achievement_id } = body

    if (!achievement_id) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('member_achievements')
      .update({
        celebrated: true,
        celebrated_at: new Date().toISOString()
      })
      .eq('id', achievement_id)
      .eq('member_id', member.id)

    if (updateError) {
      console.error('Error marking achievement:', updateError)
      return NextResponse.json({ error: 'Failed to mark achievement' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in celebrate API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    const { data: streak, error } = await supabase
      .from('journal_streaks')
      .select('*')
      .eq('member_id', member.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching streak:', error)
      return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 })
    }

    return NextResponse.json({
      streak: streak || {
        current_streak: 0,
        longest_streak: 0,
        total_entries: 0,
        last_entry_date: null
      }
    })
  } catch (error) {
    console.error('Error in streak API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

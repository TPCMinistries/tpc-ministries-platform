import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Get first uncelebrated achievement
export async function GET() {
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

    // Get first uncelebrated achievement
    const { data: achievement } = await supabase
      .from('member_achievements')
      .select('*')
      .eq('member_id', member.id)
      .eq('celebrated', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ achievement })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

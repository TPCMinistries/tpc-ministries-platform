import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
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
    const { content_id, content_type, action } = body

    if (!content_id || !content_type) {
      return NextResponse.json({ error: 'Missing content_id or content_type' }, { status: 400 })
    }

    if (action === 'remove') {
      // Remove from watchlist
      const { error } = await supabase
        .from('member_watchlist')
        .delete()
        .eq('member_id', member.id)
        .eq('content_id', content_id)
        .eq('content_type', content_type)

      if (error) throw error

      return NextResponse.json({ success: true, action: 'removed' })
    } else {
      // Add to watchlist (upsert to handle duplicates)
      const { error } = await supabase
        .from('member_watchlist')
        .upsert({
          member_id: member.id,
          content_id,
          content_type,
          added_at: new Date().toISOString()
        }, {
          onConflict: 'member_id,content_id,content_type'
        })

      if (error) throw error

      return NextResponse.json({ success: true, action: 'added' })
    }
  } catch (error) {
    console.error('Error managing watchlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

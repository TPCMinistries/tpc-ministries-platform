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
    const { mood, prayer_focus, devotional_read, scripture_read, notes } = body

    // Insert or update today's check-in
    const today = new Date().toISOString().split('T')[0]

    const { data: existingCheckin } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('member_id', member.id)
      .eq('checkin_date', today)
      .single()

    if (existingCheckin) {
      // Update existing check-in
      const { data, error } = await supabase
        .from('daily_checkins')
        .update({
          mood,
          prayer_focus,
          devotional_read,
          scripture_read,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCheckin.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating check-in:', error)
        return NextResponse.json({ error: 'Failed to update check-in' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Check-in updated', data, isNew: false })
    } else {
      // Create new check-in
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert({
          member_id: member.id,
          checkin_date: today,
          mood,
          prayer_focus,
          devotional_read,
          scripture_read,
          notes
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating check-in:', error)
        return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Check-in created', data, isNew: true })
    }
  } catch (error) {
    console.error('Error in check-in API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Get today's check-in
    const today = new Date().toISOString().split('T')[0]

    const { data: checkin } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('member_id', member.id)
      .eq('checkin_date', today)
      .single()

    // Get streak data
    const { data: streak } = await supabase
      .from('member_streaks')
      .select('*')
      .eq('member_id', member.id)
      .single()

    // Get badges
    const { data: badges } = await supabase
      .from('member_badges')
      .select('*')
      .eq('member_id', member.id)
      .order('earned_at', { ascending: false })

    return NextResponse.json({
      checkin,
      streak: streak || { current_streak: 0, longest_streak: 0, total_checkins: 0 },
      badges: badges || []
    })
  } catch (error) {
    console.error('Error fetching check-in data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

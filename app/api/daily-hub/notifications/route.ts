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

    // Get notification schedule
    const { data: schedule } = await supabase
      .from('notification_schedules')
      .select('*')
      .eq('member_id', member.id)
      .single()

    // Return default schedule if none exists
    return NextResponse.json(schedule || {
      morning_devotional: true,
      morning_time: '07:00:00',
      evening_prayer: true,
      evening_time: '21:00:00',
      weekly_digest: true,
      weekly_digest_day: 0,
      prayer_reminders: true,
      event_reminders: true,
      timezone: 'America/New_York'
    })
  } catch (error) {
    console.error('Error fetching notification schedule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
      morning_devotional,
      morning_time,
      evening_prayer,
      evening_time,
      weekly_digest,
      weekly_digest_day,
      prayer_reminders,
      event_reminders,
      timezone
    } = body

    // Upsert notification schedule
    const { data, error } = await supabase
      .from('notification_schedules')
      .upsert({
        member_id: member.id,
        morning_devotional,
        morning_time,
        evening_prayer,
        evening_time,
        weekly_digest,
        weekly_digest_day,
        prayer_reminders,
        event_reminders,
        timezone,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'member_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating notification schedule:', error)
      return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Schedule updated', data })
  } catch (error) {
    console.error('Error in notification schedule API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

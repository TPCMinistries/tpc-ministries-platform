import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get public events
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get('upcoming') !== 'false'
    const limit = parseInt(searchParams.get('limit') || '10')
    const eventType = searchParams.get('type')

    let query = supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .order('start_date', { ascending: true })
      .limit(limit)

    if (upcoming) {
      query = query.gte('start_date', new Date().toISOString())
    }

    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error in events GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

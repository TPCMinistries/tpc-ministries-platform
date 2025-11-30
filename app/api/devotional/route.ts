import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get today's devotional
    const { data: devotional, error } = await supabase
      .from('devotionals')
      .select('*')
      .eq('date', date)
      .eq('is_published', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching devotional:', error)
      return NextResponse.json({ error: 'Failed to fetch devotional' }, { status: 500 })
    }

    // If no devotional for today, get the most recent one
    if (!devotional) {
      const { data: latestDevotional } = await supabase
        .from('devotionals')
        .select('*')
        .eq('is_published', true)
        .lte('date', date)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      return NextResponse.json({ devotional: latestDevotional })
    }

    return NextResponse.json({ devotional })
  } catch (error) {
    console.error('Error in devotional API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get past devotionals
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { limit = 7, offset = 0 } = body

    const { data: devotionals, error } = await supabase
      .from('devotionals')
      .select('id, date, title, scripture_reference, series, author')
      .eq('is_published', true)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching devotionals:', error)
      return NextResponse.json({ error: 'Failed to fetch devotionals' }, { status: 500 })
    }

    // Get total count
    const { count } = await supabase
      .from('devotionals')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    return NextResponse.json({
      devotionals: devotionals || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    })
  } catch (error) {
    console.error('Error in devotional API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

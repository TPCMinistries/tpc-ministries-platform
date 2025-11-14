import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const theme = searchParams.get('theme') || 'all'
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    // Build query for member's personal prophecies
    let query = supabase
      .from('personal_prophecies')
      .select(`
        id,
        date,
        delivery_method,
        title,
        themes,
        transcript,
        audio_url,
        video_url,
        duration,
        member_journal,
        fulfillment_status,
        manifested_date,
        manifested_testimony,
        member_tags,
        created_at
      `)
      .eq('member_id', user.id)

    // Filter by theme
    if (theme !== 'all') {
      query = query.contains('themes', [theme])
    }

    // Filter by fulfillment status
    if (status !== 'all') {
      query = query.eq('fulfillment_status', status)
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,transcript.ilike.%${search}%`)
    }

    // Sort by date (newest first)
    query = query.order('date', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching personal prophecies:', error)
      return NextResponse.json(
        { error: 'Failed to fetch prophecies' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { prophecies: data || [] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in member prophecies API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

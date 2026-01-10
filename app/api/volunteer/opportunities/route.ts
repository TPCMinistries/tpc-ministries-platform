import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get volunteer opportunities and shifts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const ministryArea = searchParams.get('ministry_area')
    const includeShifts = searchParams.get('include_shifts') === 'true'

    let query = supabase
      .from('volunteer_opportunities')
      .select('*')
      .eq('is_active', true)
      .order('ministry_area')

    if (ministryArea) {
      query = query.eq('ministry_area', ministryArea)
    }

    const { data: opportunities, error } = await query

    if (error) {
      console.error('Error fetching opportunities:', error)
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
    }

    // Get upcoming shifts if requested
    if (includeShifts && opportunities) {
      const today = new Date().toISOString().split('T')[0]

      for (const opp of opportunities) {
        const { data: shifts } = await supabase
          .from('volunteer_shifts')
          .select(`
            *,
            signups:volunteer_signups(id, member_id, status)
          `)
          .eq('opportunity_id', opp.id)
          .gte('shift_date', today)
          .order('shift_date', { ascending: true })
          .limit(5)

        opp.upcoming_shifts = shifts || []
      }
    }

    // Get ministry areas for filtering
    const ministryAreas = [...new Set(opportunities?.map(o => o.ministry_area) || [])]

    return NextResponse.json({ opportunities, ministryAreas })
  } catch (error) {
    console.error('Error in opportunities GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Public share-by-id read for a single assessment result.
// Uses the service role so we can serve a result by its (unguessable) UUID
// without exposing a blanket anon SELECT that would let anyone enumerate every
// member's results.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid result id' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('member_assessment_results')
      .select(
        'id, assessment_type, primary_result, secondary_result, tertiary_result, scores, title, description, strengths, growth_areas, ministry_recommendations, scripture_references, next_steps'
      )
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    return NextResponse.json({ result: data })
  } catch (error) {
    console.error('Error fetching assessment result:', error)
    return NextResponse.json({ error: 'Failed to load result' }, { status: 500 })
  }
}

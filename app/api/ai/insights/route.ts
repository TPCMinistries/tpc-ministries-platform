import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getJournalInsights } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length < 20) {
      return NextResponse.json({ error: 'Content must be at least 20 characters' }, { status: 400 })
    }

    const insights = await getJournalInsights(content)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error getting insights:', error)
    return NextResponse.json({ error: 'Failed to get insights' }, { status: 500 })
  }
}

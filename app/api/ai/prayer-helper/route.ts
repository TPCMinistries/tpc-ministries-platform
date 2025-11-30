import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getPrayerSuggestions } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { context, type } = body

    if (!context) {
      return NextResponse.json({ error: 'Context is required' }, { status: 400 })
    }

    // Build prompt based on type
    let prompt = context
    if (type === 'gratitude') {
      prompt = `Help me write a prayer of gratitude for: ${context}`
    } else if (type === 'petition') {
      prompt = `Help me pray about this need: ${context}`
    } else if (type === 'intercession') {
      prompt = `Help me pray for someone else about: ${context}`
    } else if (type === 'confession') {
      prompt = `Help me write a prayer of confession and renewal regarding: ${context}`
    }

    const prayer = await getPrayerSuggestions(prompt)

    return NextResponse.json({ prayer })
  } catch (error) {
    console.error('Error getting prayer help:', error)
    return NextResponse.json({ error: 'Failed to get prayer suggestions' }, { status: 500 })
  }
}

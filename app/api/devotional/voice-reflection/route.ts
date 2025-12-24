import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const getAuthClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getAuthClient()

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
    const { devotionalId, audioUrl, audioDuration, transcription } = body

    if (!devotionalId || !audioUrl) {
      return NextResponse.json(
        { error: 'Devotional ID and audio URL are required' },
        { status: 400 }
      )
    }

    // Save to member_voice_notes table
    const { data: reflection, error } = await supabase
      .from('member_voice_notes')
      .insert({
        member_id: member.id,
        context_type: 'devotional',
        context_id: devotionalId,
        audio_url: audioUrl,
        audio_duration_seconds: audioDuration,
        transcription: transcription || null,
        is_transcribed: !!transcription
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving voice reflection:', error)
      return NextResponse.json(
        { error: 'Failed to save voice reflection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, reflection })
  } catch (error) {
    console.error('Voice reflection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getAuthClient()
    const { searchParams } = new URL(request.url)
    const devotionalId = searchParams.get('devotionalId')

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

    // Get the voice reflection for this devotional
    const { data: reflection, error } = await supabase
      .from('member_voice_notes')
      .select('*')
      .eq('member_id', member.id)
      .eq('context_type', 'devotional')
      .eq('context_id', devotionalId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching voice reflection:', error)
      return NextResponse.json(
        { error: 'Failed to fetch voice reflection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reflection })
  } catch (error) {
    console.error('Get voice reflection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

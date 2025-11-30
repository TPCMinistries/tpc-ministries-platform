import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') // 'prayer', 'reflection', 'gratitude', 'voice'

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

    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('entry_type', type)
    }

    const { data: entries, error } = await query

    if (error) {
      console.error('Error fetching journal entries:', error)
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }

    // Get total count
    const { count } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', member.id)

    return NextResponse.json({
      entries: entries || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    })
  } catch (error) {
    console.error('Error in journal API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const {
      entry_type,
      title,
      content,
      transcription,
      audio_url,
      ai_summary,
      ai_insights,
      scripture_references,
      mood,
      tags,
      is_private
    } = body

    const { data: entry, error } = await supabase
      .from('journal_entries')
      .insert({
        member_id: member.id,
        entry_type: entry_type || 'reflection',
        title,
        content,
        transcription,
        audio_url,
        ai_summary,
        ai_insights,
        scripture_references: scripture_references || [],
        mood,
        tags: tags || [],
        is_private: is_private !== false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating journal entry:', error)
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error in journal API:', error)
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 })
    }

    const { data: entry, error } = await supabase
      .from('journal_entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('member_id', member.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating journal entry:', error)
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error in journal API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

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

    if (!id) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('member_id', member.id)

    if (error) {
      console.error('Error deleting journal entry:', error)
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Entry deleted' })
  } catch (error) {
    console.error('Error in journal API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

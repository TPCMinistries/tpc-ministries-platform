import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get user's notes for a service
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

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('service_id')

    let query = supabase
      .from('service_notes')
      .select(`
        *,
        service:live_services(id, title, scheduled_start)
      `)
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })

    if (serviceId) {
      query = query.eq('service_id', serviceId)
    }

    const { data: notes, error } = await query

    if (error) {
      console.error('Error fetching notes:', error)
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error in notes GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create/update a note
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
    const { service_id, content, timestamp_seconds, note_id } = body

    if (!service_id || !content) {
      return NextResponse.json({ error: 'service_id and content required' }, { status: 400 })
    }

    if (note_id) {
      // Update existing note
      const { data: note, error } = await supabase
        .from('service_notes')
        .update({
          content,
          timestamp_seconds,
          updated_at: new Date().toISOString()
        })
        .eq('id', note_id)
        .eq('member_id', member.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating note:', error)
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
      }

      return NextResponse.json({ note, success: true })
    } else {
      // Create new note
      const { data: note, error } = await supabase
        .from('service_notes')
        .insert({
          service_id,
          member_id: member.id,
          content,
          timestamp_seconds
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating note:', error)
        return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
      }

      return NextResponse.json({ note, success: true }, { status: 201 })
    }
  } catch (error) {
    console.error('Error in notes POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a note
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('id')

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('service_notes')
      .delete()
      .eq('id', noteId)
      .eq('member_id', member.id)

    if (error) {
      console.error('Error deleting note:', error)
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in notes DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

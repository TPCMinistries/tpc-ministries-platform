import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Send an encouragement to a member
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const recipientId = params.id

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's member ID
    const { data: currentMember } = await supabase
      .from('members')
      .select('id, first_name')
      .eq('user_id', user.id)
      .single()

    if (!currentMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Can't encourage yourself
    if (currentMember.id === recipientId) {
      return NextResponse.json({ error: 'Cannot send encouragement to yourself' }, { status: 400 })
    }

    // Check if recipient exists
    const { data: recipient } = await supabase
      .from('members')
      .select('id')
      .eq('id', recipientId)
      .single()

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    const body = await request.json()
    const { message } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 500) {
      return NextResponse.json({ error: 'Message must be 500 characters or less' }, { status: 400 })
    }

    // Create encouragement
    const { data: encouragement, error: insertError } = await supabase
      .from('member_encouragements')
      .insert({
        sender_id: currentMember.id,
        recipient_id: recipientId,
        message: message.trim()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error sending encouragement:', insertError)
      return NextResponse.json({ error: 'Failed to send encouragement' }, { status: 500 })
    }

    return NextResponse.json({ encouragement, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error in encourage API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

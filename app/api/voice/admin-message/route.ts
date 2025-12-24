import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Get authenticated Supabase client
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

// Admin client for service operations
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getAuthClient()

    // Verify user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      recipientId,
      recipientType = 'individual',
      recipientTier,
      title,
      description,
      messageType,
      audioUrl,
      audioDuration,
      transcription
    } = body

    // Validate required fields
    if (!audioUrl || !messageType) {
      return NextResponse.json(
        { error: 'Audio URL and message type are required' },
        { status: 400 }
      )
    }

    if (recipientType === 'individual' && !recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required for individual messages' },
        { status: 400 }
      )
    }

    const adminClient = getAdminClient()

    // Create voice message
    const { data: voiceMessage, error } = await adminClient
      .from('voice_messages')
      .insert({
        sender_id: member.id,
        recipient_id: recipientType === 'individual' ? recipientId : null,
        recipient_type: recipientType,
        recipient_tier: recipientType === 'tier' ? recipientTier : null,
        title,
        description,
        message_type: messageType,
        audio_url: audioUrl,
        audio_duration_seconds: audioDuration,
        transcription,
        is_transcribed: !!transcription
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating voice message:', error)
      return NextResponse.json(
        { error: 'Failed to create voice message' },
        { status: 500 }
      )
    }

    // Create notification for recipient(s)
    if (recipientType === 'individual' && recipientId) {
      // Get recipient's user_id
      const { data: recipient } = await adminClient
        .from('members')
        .select('user_id, first_name')
        .eq('id', recipientId)
        .single()

      if (recipient) {
        await adminClient.from('notifications').insert({
          user_id: recipient.user_id,
          type: 'voice_message',
          title: `New ${messageType.replace('_', ' ')} from Prophet Lorenzo`,
          message: title || `You have a new ${messageType.replace('_', ' ')} waiting for you`,
          data: { voiceMessageId: voiceMessage.id },
          is_read: false
        })
      }
    } else if (recipientType === 'group' || recipientType === 'tier') {
      // Get all members in the group/tier
      let query = adminClient.from('members').select('user_id')

      if (recipientType === 'tier' && recipientTier && recipientTier !== 'all') {
        query = query.eq('tier', recipientTier)
      }

      const { data: recipients } = await query

      if (recipients) {
        const notifications = recipients.map(r => ({
          user_id: r.user_id,
          type: 'voice_message',
          title: `New ${messageType.replace('_', ' ')} from Prophet Lorenzo`,
          message: title || `A new ${messageType.replace('_', ' ')} has been shared with the community`,
          data: { voiceMessageId: voiceMessage.id },
          is_read: false
        }))

        await adminClient.from('notifications').insert(notifications)
      }
    }

    return NextResponse.json({
      success: true,
      voiceMessage
    })
  } catch (error) {
    console.error('Admin voice message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get voice messages (for admin to see all, for members to see theirs)
export async function GET(request: NextRequest) {
  try {
    const supabase = await getAuthClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sent' for admin, 'received' for members

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, is_admin, tier')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const adminClient = getAdminClient()

    if (member.is_admin && type === 'sent') {
      // Admin viewing sent messages
      const { data, error } = await adminClient
        .from('voice_messages')
        .select(`
          *,
          recipient:members!voice_messages_recipient_id_fkey(id, first_name, last_name)
        `)
        .eq('sender_id', member.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ messages: data })
    } else {
      // Member viewing received messages
      const { data, error } = await adminClient
        .from('voice_messages')
        .select(`
          *,
          sender:members!voice_messages_sender_id_fkey(id, first_name, last_name)
        `)
        .or(`recipient_id.eq.${member.id},recipient_type.eq.group,and(recipient_type.eq.tier,or(recipient_tier.eq.${member.tier},recipient_tier.eq.all))`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ messages: data })
    }
  } catch (error) {
    console.error('Get voice messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { requireAdmin } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms/twilio'

export const dynamic = 'force-dynamic'

interface SmsMessageSummary {
  created_at: string
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Internal server error'
}

// GET - Fetch SMS conversations and messages
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin()
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const supabase = createAdminClient()
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action') || 'conversations'
  const conversationId = searchParams.get('conversationId')
  const search = searchParams.get('search')
  const showArchived = searchParams.get('archived') === 'true'

  try {
    if (action === 'conversations') {
      // Fetch all conversations with latest message
      let query = supabase
        .from('sms_conversations')
        .select(`
          *,
          member:members(id, first_name, last_name, email, phone),
          messages:sms_messages(
            id,
            body,
            direction,
            created_at,
            status
          )
        `)
        .eq('is_archived', showArchived)
        .order('last_message_at', { ascending: false })

      if (search) {
        query = query.or(`phone_number.ilike.%${search}%`)
      }

      const { data: conversations, error } = await query

      if (error) throw error

      // Format conversations with latest message
      const formattedConversations = conversations?.map((conv) => ({
        ...conv,
        latestMessage: (conv.messages as SmsMessageSummary[] | undefined)?.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0],
        messages: undefined, // Don't include all messages in list view
      }))

      return NextResponse.json(formattedConversations || [])
    }

    if (action === 'messages' && conversationId) {
      // Fetch all messages for a conversation
      const { data: messages, error } = await supabase
        .from('sms_messages')
        .select(`
          *,
          sender:members!sms_messages_sent_by_fkey(id, first_name, last_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Mark conversation as read
      await supabase
        .from('sms_conversations')
        .update({ is_unread: false })
        .eq('id', conversationId)

      return NextResponse.json(messages || [])
    }

    if (action === 'unread_count') {
      const { count, error } = await supabase
        .from('sms_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('is_unread', true)
        .eq('is_archived', false)

      if (error) throw error
      return NextResponse.json({ count: count || 0 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    console.error('SMS API error:', error)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// POST - Send SMS or perform actions
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin()
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const supabase = createAdminClient()

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'send') {
      const { to, message, conversationId } = body

      if (!to || !message) {
        return NextResponse.json(
          { error: 'Phone number and message are required' },
          { status: 400 }
        )
      }

      // Send via Twilio
      const result = await sendSMS({ to, message })

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      // Find or create conversation
      let convId = conversationId

      if (!convId) {
        // Format phone to E.164 for storage
        const formattedPhone = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`

        // Check for existing conversation
        const { data: existingConv } = await supabase
          .from('sms_conversations')
          .select('id')
          .eq('phone_number', formattedPhone)
          .single()

        if (existingConv) {
          convId = existingConv.id
        } else {
          // Try to find member
          const { data: member } = await supabase
            .from('members')
            .select('id')
            .or(`phone.eq.${formattedPhone},phone.eq.${to.replace(/\D/g, '')}`)
            .single()

          // Create new conversation
          const { data: newConv, error: convError } = await supabase
            .from('sms_conversations')
            .insert({
              phone_number: formattedPhone,
              member_id: member?.id || null,
            })
            .select('id')
            .single()

          if (convError) throw convError
          convId = newConv.id
        }
      }

      // Store the outbound message
      const { error: msgError } = await supabase
        .from('sms_messages')
        .insert({
          conversation_id: convId,
          direction: 'outbound',
          from_number: process.env.TWILIO_PHONE_NUMBER,
          to_number: to,
          body: message,
          twilio_sid: result.data?.sid,
          status: result.data?.status || 'sent',
          sent_by: authResult.member.id,
        })

      if (msgError) throw msgError

      return NextResponse.json({
        success: true,
        conversationId: convId,
        messageSid: result.data?.sid,
      })
    }

    if (action === 'archive') {
      const { conversationId, archived = true } = body

      const { error } = await supabase
        .from('sms_conversations')
        .update({ is_archived: archived })
        .eq('id', conversationId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'mark_read') {
      const { conversationId } = body

      const { error } = await supabase
        .from('sms_conversations')
        .update({ is_unread: false })
        .eq('id', conversationId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      const { conversationId } = body

      // Delete all messages first (cascade should handle this, but being safe)
      await supabase.from('sms_messages').delete().eq('conversation_id', conversationId)

      const { error } = await supabase.from('sms_conversations').delete().eq('id', conversationId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    console.error('SMS API error:', error)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

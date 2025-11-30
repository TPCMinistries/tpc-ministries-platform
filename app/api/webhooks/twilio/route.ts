import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role for webhook (no user auth)
function getSupabase() { return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!); }

// Twilio sends webhooks as form data
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract Twilio webhook data
    const messageSid = formData.get('MessageSid') as string
    const from = formData.get('From') as string // The sender's phone number
    const to = formData.get('To') as string // Your Twilio number
    const body = formData.get('Body') as string
    const numMedia = parseInt(formData.get('NumMedia') as string || '0')

    // Get media URLs if any (MMS)
    const mediaUrls: string[] = []
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = formData.get(`MediaUrl${i}`) as string
      if (mediaUrl) {
        mediaUrls.push(mediaUrl)
      }
    }

    console.log('Received SMS from:', from, 'Body:', body)

    // Try to find a member with this phone number
    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .or(`phone.eq.${from},phone.eq.${from.replace('+1', '')}`)
      .single()

    // Find or create conversation
    let { data: conversation } = await supabase
      .from('sms_conversations')
      .select('id')
      .eq('phone_number', from)
      .single()

    if (!conversation) {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('sms_conversations')
        .insert({
          phone_number: from,
          member_id: member?.id || null,
          is_unread: true,
        })
        .select('id')
        .single()

      if (convError) {
        console.error('Error creating conversation:', convError)
        // Return 200 so Twilio doesn't retry
        return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        })
      }
      conversation = newConversation
    } else {
      // Update conversation as unread
      await supabase
        .from('sms_conversations')
        .update({
          is_unread: true,
          member_id: member?.id || undefined // Link member if found
        })
        .eq('id', conversation.id)
    }

    // Store the incoming message
    const { error: msgError } = await supabase
      .from('sms_messages')
      .insert({
        conversation_id: conversation.id,
        direction: 'inbound',
        from_number: from,
        to_number: to,
        body: body || '',
        twilio_sid: messageSid,
        status: 'received',
        member_id: member?.id || null,
        media_urls: mediaUrls,
      })

    if (msgError) {
      console.error('Error storing message:', msgError)
    }

    // Return empty TwiML response (no auto-reply)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('Twilio webhook error:', error)
    // Always return 200 to Twilio to prevent retries
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}

// Handle Twilio status callbacks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const messageSid = searchParams.get('MessageSid')
  const messageStatus = searchParams.get('MessageStatus')

  if (messageSid && messageStatus) {
    // Update message status
    await supabase
      .from('sms_messages')
      .update({ status: messageStatus })
      .eq('twilio_sid', messageSid)
  }

  return NextResponse.json({ received: true })
}

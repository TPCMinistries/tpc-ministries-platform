import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role for webhook (no user auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Resend sends different event types
    const eventType = body.type

    if (eventType === 'email.received') {
      // Inbound email received
      const { from, to, subject, text, html, headers } = body.data

      // Try to find the member by email
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('email', from)
        .single()

      // Check for existing thread
      let threadId = null
      const inReplyTo = headers?.['in-reply-to']
      const messageId = headers?.['message-id']

      if (inReplyTo) {
        // Find existing thread by in-reply-to header
        const { data: existingEmail } = await supabase
          .from('inbox_emails')
          .select('thread_id')
          .eq('message_id', inReplyTo)
          .single()

        if (existingEmail?.thread_id) {
          threadId = existingEmail.thread_id

          // Update thread
          await supabase
            .from('email_threads')
            .update({
              last_message_at: new Date().toISOString(),
              message_count: supabase.rpc('increment_message_count', { row_id: threadId }),
              is_read: false
            })
            .eq('id', threadId)
        }
      }

      // Create new thread if needed
      if (!threadId) {
        const { data: newThread } = await supabase
          .from('email_threads')
          .insert({
            subject: subject || '(No Subject)',
            participant_emails: [from, to],
            member_id: member?.id || null,
            last_message_at: new Date().toISOString()
          })
          .select()
          .single()

        threadId = newThread?.id
      }

      // Insert the email
      const { error: emailError } = await supabase
        .from('inbox_emails')
        .insert({
          from_email: from,
          from_name: body.data.from_name || from.split('@')[0],
          to_email: to,
          subject: subject || '(No Subject)',
          body_text: text,
          body_html: html,
          message_id: messageId,
          in_reply_to: inReplyTo,
          thread_id: threadId,
          member_id: member?.id || null,
          folder: 'inbox',
          received_at: new Date().toISOString()
        })

      if (emailError) {
        console.error('Error storing email:', emailError)
        return NextResponse.json({ error: 'Failed to store email' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Email received' })
    }

    // Handle other event types (delivery, bounce, etc.)
    if (eventType === 'email.delivered') {
      const { email_id } = body.data
      await supabase
        .from('sent_emails')
        .update({ status: 'delivered' })
        .eq('resend_id', email_id)
    }

    if (eventType === 'email.bounced') {
      const { email_id } = body.data
      await supabase
        .from('sent_emails')
        .update({ status: 'bounced' })
        .eq('resend_id', email_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Resend verifies webhooks with GET
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' })
}

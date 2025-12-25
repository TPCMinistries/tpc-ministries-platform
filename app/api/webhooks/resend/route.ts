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

    console.log('Resend webhook received:', eventType, body.data)

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
        // Find existing email by in-reply-to header
        const { data: existingEmail } = await supabase
          .from('inbox_emails')
          .select('thread_id')
          .eq('message_id', inReplyTo)
          .single()

        if (existingEmail?.thread_id) {
          threadId = existingEmail.thread_id
        }
      }

      // Generate thread ID if not found
      if (!threadId) {
        threadId = crypto.randomUUID()
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
          is_read: false,
          received_at: new Date().toISOString()
        })

      if (emailError) {
        console.error('Error storing email:', emailError)
        return NextResponse.json({ error: 'Failed to store email' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Email received' })
    }

    // Handle email sent events
    if (eventType === 'email.sent') {
      const emailId = body.data.email_id
      if (emailId) {
        await supabase
          .from('sent_emails')
          .update({
            resend_status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('resend_id', emailId)
      }
    }

    // Handle delivery events
    if (eventType === 'email.delivered') {
      const emailId = body.data.email_id
      if (emailId) {
        await supabase
          .from('sent_emails')
          .update({
            resend_status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('resend_id', emailId)
      }
    }

    // Handle open events
    if (eventType === 'email.opened') {
      const emailId = body.data.email_id
      if (emailId) {
        await supabase
          .from('sent_emails')
          .update({
            resend_status: 'opened',
            opened_at: new Date().toISOString()
          })
          .eq('resend_id', emailId)
      }
    }

    // Handle bounce events
    if (eventType === 'email.bounced') {
      const emailId = body.data.email_id
      if (emailId) {
        await supabase
          .from('sent_emails')
          .update({ resend_status: 'bounced' })
          .eq('resend_id', emailId)
      }
    }

    // Handle complaint events
    if (eventType === 'email.complained') {
      const emailId = body.data.email_id
      if (emailId) {
        await supabase
          .from('sent_emails')
          .update({ resend_status: 'complained' })
          .eq('resend_id', emailId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Resend verifies webhooks with GET
export async function GET() {
  return NextResponse.json({ status: 'Resend webhook endpoint active' })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBulkEmail } from '@/lib/email/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get request body
    const body = await request.json()
    const { recipients, subject, html, from } = body

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'recipients must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, html' },
        { status: 400 }
      )
    }

    if (recipients.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 recipients per bulk send' },
        { status: 400 }
      )
    }

    // Send bulk emails via Resend
    const result = await sendBulkEmail({
      recipients,
      subject,
      html,
      from,
    })

    if (!result.success) {
      console.error('Failed to send bulk email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send bulk email', details: result.error },
        { status: 500 }
      )
    }

    // Store in communications table
    try {
      await supabase.from('communications').insert({
        sender_id: user.id,
        recipient_type: 'bulk',
        recipient_emails: recipients,
        subject,
        message: html,
        status: result.sent === result.total ? 'sent' : 'partial',
        sent_at: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error('Failed to store communication record:', dbError)
      // Don't fail the request if DB storage fails - emails were still sent
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${result.sent} of ${result.total} emails`,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
    })
  } catch (error: any) {
    console.error('Bulk email send error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

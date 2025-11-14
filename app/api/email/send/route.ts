import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'

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
    const { to, subject, html, from } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    // Send email via Resend
    const result = await sendEmail({
      to,
      subject,
      html,
      from,
    })

    if (!result.success) {
      console.error('Failed to send email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    // Store in communications table
    try {
      await supabase.from('communications').insert({
        sender_id: user.id,
        recipient_type: 'individual',
        recipient_emails: Array.isArray(to) ? to : [to],
        subject,
        message: html,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error('Failed to store communication record:', dbError)
      // Don't fail the request if DB storage fails - email was still sent
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: result.data,
    })
  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

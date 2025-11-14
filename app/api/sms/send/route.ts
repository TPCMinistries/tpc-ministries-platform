import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms/twilio'
import { isValidPhone } from '@/lib/utils/phone'

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
    const { to, message } = body

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      )
    }

    // Validate phone number
    if (!isValidPhone(to)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use E.164 format (+1234567890)' },
        { status: 400 }
      )
    }

    // Validate message length
    if (message.length > 1600) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 1600 characters (10 SMS parts)' },
        { status: 400 }
      )
    }

    // Send SMS via Twilio
    const result = await sendSMS({ to, message })

    if (!result.success) {
      console.error('Failed to send SMS:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS' },
        { status: 500 }
      )
    }

    // Store in communications table
    try {
      await supabase.from('communications').insert({
        sender_id: user.id,
        recipient_type: 'individual',
        recipient_phones: [to],
        message,
        type: 'sms',
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          twilio_sid: result.data?.sid,
          twilio_status: result.data?.status,
        },
      })
    } catch (dbError) {
      console.error('Failed to store communication record:', dbError)
      // Don't fail the request if DB storage fails - SMS was still sent
    }

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      data: result.data,
    })
  } catch (error: any) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBulkSMS } from '@/lib/sms/twilio'
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
    const { recipients, message } = body

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'recipients must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json({ error: 'Missing required field: message' }, { status: 400 })
    }

    // Validate message length
    if (message.length > 1600) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 1600 characters (10 SMS parts)' },
        { status: 400 }
      )
    }

    // Limit recipients
    if (recipients.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 recipients per bulk send' },
        { status: 400 }
      )
    }

    // Validate all phone numbers
    const invalidNumbers = recipients.filter((phone) => !isValidPhone(phone))
    if (invalidNumbers.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid phone numbers found',
          invalidNumbers: invalidNumbers.slice(0, 5), // Show first 5
        },
        { status: 400 }
      )
    }

    // Send bulk SMS via Twilio
    const result = await sendBulkSMS({ recipients, message })

    // Store in communications table
    try {
      await supabase.from('communications').insert({
        sender_id: user.id,
        recipient_type: 'bulk',
        recipient_phones: recipients,
        message,
        type: 'sms',
        status: result.sent === result.total ? 'sent' : 'partial',
        sent_at: new Date().toISOString(),
        metadata: {
          sent: result.sent,
          failed: result.failed,
          total: result.total,
        },
      })
    } catch (dbError) {
      console.error('Failed to store communication record:', dbError)
      // Don't fail the request if DB storage fails - SMS were still sent
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${result.sent} of ${result.total} SMS`,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
      results: result.results,
    })
  } catch (error: any) {
    console.error('Bulk SMS send error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

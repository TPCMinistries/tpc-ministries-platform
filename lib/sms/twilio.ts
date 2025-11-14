import twilio from 'twilio'
import { formatPhoneE164 } from '@/lib/utils/phone'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

if (!accountSid || !authToken || !twilioPhone) {
  console.warn('Twilio credentials not configured. SMS functionality will be disabled.')
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export async function sendSMS({
  to,
  message,
}: {
  to: string
  message: string
}) {
  if (!client || !twilioPhone) {
    return {
      success: false,
      error: 'Twilio is not configured',
    }
  }

  try {
    // Format phone number to E.164
    const formattedPhone = formatPhoneE164(to)
    if (!formattedPhone) {
      return {
        success: false,
        error: 'Invalid phone number format. Please use E.164 format (+1234567890)',
      }
    }

    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone,
    })

    return {
      success: true,
      data: {
        sid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
        dateCreated: result.dateCreated,
      },
    }
  } catch (error: any) {
    console.error('SMS send error:', error)

    // Handle common Twilio errors
    let errorMessage = 'Failed to send SMS'

    if (error.code === 21211) {
      errorMessage = 'Invalid phone number. Please check the number and try again.'
    } else if (error.code === 21408) {
      errorMessage =
        'This number must be verified in your Twilio account (trial limitation). Go to Twilio Console → Phone Numbers → Verified Caller IDs.'
    } else if (error.code === 21610) {
      errorMessage = 'This number has unsubscribed from receiving messages.'
    } else if (error.code === 20003) {
      errorMessage = 'Authentication failed. Please check your Twilio credentials.'
    } else if (error.code === 429 || error.status === 429) {
      errorMessage = 'Sending too fast. Please wait a moment and try again.'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage,
      code: error.code,
    }
  }
}

export async function sendBulkSMS({
  recipients,
  message,
}: {
  recipients: string[]
  message: string
}) {
  const results = []

  for (const phone of recipients) {
    const result = await sendSMS({ to: phone, message })
    results.push({
      phone,
      success: result.success,
      data: result.success ? result.data : null,
      error: result.success ? null : result.error,
    })

    // Small delay to avoid rate limits (Twilio trial: 1 msg/sec)
    await new Promise((resolve) => setTimeout(resolve, 1100))
  }

  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  return {
    success: true,
    sent: successful,
    failed,
    total: recipients.length,
    results,
  }
}

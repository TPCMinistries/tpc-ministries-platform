import { Resend } from 'resend'

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }
  return new Resend(apiKey)
}

export async function sendEmail({
  to,
  subject,
  html,
  from = 'TPC Ministries <info@tpcmin.com>',
}: {
  to: string | string[]
  subject: string
  html: string
  from?: string
}) {
  try {
    const resend = getResend()
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export async function sendBulkEmail({
  recipients,
  subject,
  html,
  from = 'TPC Ministries <info@tpcmin.com>',
}: {
  recipients: string[]
  subject: string
  html: string
  from?: string
}) {
  try {
    const resend = getResend()
    const results = []

    // Send in batches of 50 to avoid rate limits
    for (let i = 0; i < recipients.length; i += 50) {
      const batch = recipients.slice(i, i + 50)
      const batchPromises = batch.map((to) =>
        resend.emails.send({
          from,
          to,
          subject,
          html,
        })
      )
      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults)
    }

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return {
      success: true,
      sent: successful,
      failed,
      total: recipients.length,
    }
  } catch (error) {
    console.error('Bulk email send error:', error)
    return { success: false, error, sent: 0, failed: recipients.length, total: recipients.length }
  }
}

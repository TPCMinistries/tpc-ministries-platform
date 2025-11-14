import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import { renderLeadConfirmation } from '@/lib/email/render'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, interests } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email' },
        { status: 400 }
      )
    }

    // Render email template
    const html = await renderLeadConfirmation({
      name,
      interests: interests || [],
    })

    // Send email via Resend
    const result = await sendEmail({
      to: email,
      subject: 'Thank you for your interest in TPC Ministries!',
      html,
    })

    if (!result.success) {
      console.error('Failed to send lead confirmation email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lead confirmation email sent successfully',
    })
  } catch (error: any) {
    console.error('Lead confirmation email error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

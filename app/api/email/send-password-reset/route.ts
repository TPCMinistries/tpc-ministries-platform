import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import { renderPasswordReset } from '@/lib/email/render'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberName, email, resetUrl, expiresIn } = body

    if (!memberName || !email || !resetUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: memberName, email, resetUrl' },
        { status: 400 }
      )
    }

    // Render email template
    const html = await renderPasswordReset({
      memberName,
      resetUrl,
      expiresIn: expiresIn || '1 hour',
    })

    // Send email via Resend
    const result = await sendEmail({
      to: email,
      subject: 'Reset your TPC Ministries password',
      html,
    })

    if (!result.success) {
      console.error('Failed to send password reset email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
    })
  } catch (error: any) {
    console.error('Password reset email error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

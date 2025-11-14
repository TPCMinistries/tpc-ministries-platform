import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, EmailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, userId } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/member/dashboard`

    const { subject, html } = EmailTemplates.welcome(name, dashboardUrl)

    const result = await sendEmail({
      to: email,
      subject,
      html,
    })

    if (!result.success) {
      console.warn('Welcome email failed to send:', result.error)
      // Don't fail the request if email fails
      return NextResponse.json({
        success: true,
        message: 'User created but email notification failed',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
    })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}

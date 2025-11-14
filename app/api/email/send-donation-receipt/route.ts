import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import { renderDonationReceipt } from '@/lib/email/render'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { donorName, email, amount, date, donationType, transactionId, isRecurring } = body

    if (!donorName || !email || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: donorName, email, amount' },
        { status: 400 }
      )
    }

    // Render email template
    const html = await renderDonationReceipt({
      donorName,
      amount,
      date: date || new Date().toLocaleDateString(),
      donationType: donationType || 'One-Time Donation',
      transactionId,
      isRecurring: isRecurring || false,
    })

    // Send email via Resend
    const result = await sendEmail({
      to: email,
      subject: 'Thank you for your donation to TPC Ministries',
      html,
    })

    if (!result.success) {
      console.error('Failed to send donation receipt:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Donation receipt sent successfully',
    })
  } catch (error: any) {
    console.error('Donation receipt error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const { name, email, phone, subject, message, category } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        category: category || 'general'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating contact submission:', error)
      return NextResponse.json(
        { error: 'Failed to submit contact form' },
        { status: 500 }
      )
    }

    // Send email notification to admin
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
      await fetch(`${baseUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.ADMIN_EMAIL || 'info@tpcmin.org',
          subject: `New Contact Form: ${subject || category || 'General Inquiry'}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Category:</strong> ${category || 'General'}</p>
            ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        }),
      })
    } catch (emailError) {
      console.warn('Failed to send admin notification email:', emailError)
    }

    // Send confirmation email to user
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
      await fetch(`${baseUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Thank you for contacting TPC Ministries',
          html: `
            <h2>Thank You for Reaching Out!</h2>
            <p>Dear ${name},</p>
            <p>We have received your message and will respond as soon as possible.</p>
            <p>For reference, here's what you submitted:</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 15px; margin: 15px 0;">
              ${message.replace(/\n/g, '<br>')}
            </blockquote>
            <p>Blessings,<br>TPC Ministries Team</p>
          `,
        }),
      })
    } catch (emailError) {
      console.warn('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json(
      { success: true, message: 'Thank you for contacting us!' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in contact POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

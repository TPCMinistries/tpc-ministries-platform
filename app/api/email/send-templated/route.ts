import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import {
  renderAnnouncement,
  renderNewsletter,
  renderEventInvitation,
  renderUrgent,
  personalize,
} from '@/lib/email/render'

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

    const body = await request.json()
    const {
      template,
      recipientType,
      recipientTier,
      recipientIds,
      subject,
      title,
      message,
      ctaText,
      ctaUrl,
      imageUrl,
      eventDate,
      eventTime,
      eventLocation,
      urgencyLevel,
      testEmail,
    } = body

    if (!subject || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, title, message' },
        { status: 400 }
      )
    }

    // Get recipients
    let recipients: Array<{ email: string; first_name: string; last_name: string }> = []

    if (testEmail) {
      // Send test email to admin
      const { data: adminMember } = await supabase
        .from('members')
        .select('email, first_name, last_name')
        .eq('user_id', user.id)
        .single()

      if (adminMember) {
        recipients = [adminMember]
      }
    } else {
      // Get actual recipients
      let query = supabase
        .from('members')
        .select('email, first_name, last_name')

      if (recipientType === 'tier' && recipientTier) {
        query = query.eq('tier', recipientTier)
      } else if (recipientType === 'individual' && recipientIds?.length > 0) {
        query = query.in('id', recipientIds)
      }

      const { data, error } = await query

      if (error || !data) {
        return NextResponse.json(
          { error: 'Failed to fetch recipients' },
          { status: 500 }
        )
      }

      recipients = data
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found' },
        { status: 400 }
      )
    }

    // Send emails
    let successCount = 0
    let failureCount = 0

    for (const recipient of recipients) {
      try {
        // Personalize message and title
        const personalizedTitle = personalize(title, {
          firstName: recipient.first_name,
          lastName: recipient.last_name,
          email: recipient.email,
        })

        const personalizedMessage = personalize(message, {
          firstName: recipient.first_name,
          lastName: recipient.last_name,
          email: recipient.email,
        })

        // Generate HTML based on template
        let html: string

        if (template === 'announcement') {
          html = await renderAnnouncement({
            recipientName: recipient.first_name,
            title: personalizedTitle,
            message: personalizedMessage,
            ctaText,
            ctaUrl,
            imageUrl,
          })
        } else if (template === 'newsletter') {
          html = await renderNewsletter({
            recipientName: recipient.first_name,
            headline: personalizedTitle,
            message: personalizedMessage,
          })
        } else if (template === 'event') {
          html = await renderEventInvitation({
            recipientName: recipient.first_name,
            eventTitle: personalizedTitle,
            eventDate: eventDate || '',
            eventTime: eventTime || '',
            eventLocation: eventLocation || '',
            eventDescription: personalizedMessage,
            rsvpUrl: ctaUrl,
            imageUrl,
          })
        } else if (template === 'urgent') {
          html = await renderUrgent({
            recipientName: recipient.first_name,
            title: personalizedTitle,
            message: personalizedMessage,
            actionText: ctaText,
            actionUrl: ctaUrl,
            urgencyLevel: urgencyLevel || 'high',
          })
        } else {
          // Custom template - simple HTML
          html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">TPC Ministries</h1>
              </div>
              <div style="padding: 30px 20px;">
                <h2 style="color: #1e3a8a;">${personalizedTitle}</h2>
                ${personalizedMessage.replace(/\n/g, '<br>')}
              </div>
              <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
                <p style="margin: 0;">TPC Ministries | <a href="https://tpcmin.org" style="color: #c9a961;">tpcmin.org</a></p>
              </div>
            </div>
          `
        }

        // Send the email
        const result = await sendEmail({
          to: recipient.email,
          subject: personalize(subject, {
            firstName: recipient.first_name,
            lastName: recipient.last_name,
            email: recipient.email,
          }),
          html,
        })

        if (result.success) {
          successCount++
        } else {
          failureCount++
          console.error('Failed to send to', recipient.email, result.error)
        }
      } catch (error) {
        failureCount++
        console.error('Error sending to', recipient.email, error)
      }
    }

    // Log communication if not a test
    if (!testEmail) {
      try {
        await supabase.from('communications').insert({
          type: 'email',
          recipient_type: recipientType,
          recipient_tier: recipientType === 'tier' ? recipientTier : null,
          recipient_ids: recipientType === 'individual' ? recipientIds : null,
          subject,
          message: `${title}\n\n${message}`,
          sent_by: user.id,
          recipient_count: successCount,
        })
      } catch (error) {
        console.error('Failed to log communication:', error)
      }
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      total: recipients.length,
      isTest: testEmail || false,
    })
  } catch (error: any) {
    console.error('Templated email error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

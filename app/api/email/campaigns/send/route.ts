import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
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
    const { campaignId, testEmail } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status === 'sent' && !testEmail) {
      return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 })
    }

    // If test email, just send to that address
    if (testEmail) {
      try {
        await resend.emails.send({
          from: 'TPC Ministries <info@tpcmin.com>',
          to: testEmail,
          subject: `[TEST] ${campaign.subject}`,
          html: campaign.html_preview || generateDefaultHtml(campaign),
        })

        return NextResponse.json({
          success: true,
          message: `Test email sent to ${testEmail}`
        })
      } catch (sendError) {
        console.error('Test email error:', sendError)
        return NextResponse.json({
          error: 'Failed to send test email',
          details: sendError instanceof Error ? sendError.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    // Get recipients based on target audience
    const targetAudience = campaign.target_audience || { all: true }
    let recipients: Array<{ email: string; firstName: string; memberId: string }> = []

    if (targetAudience.all) {
      // All members
      const { data: allMembers } = await adminSupabase
        .from('members')
        .select('id, email, first_name')

      recipients = (allMembers || []).map(m => ({
        email: m.email,
        firstName: m.first_name || 'Friend',
        memberId: m.id
      }))
    } else if (targetAudience.tier && targetAudience.tier.length > 0) {
      // By tier
      const { data: tierMembers } = await adminSupabase
        .from('members')
        .select('id, email, first_name')
        .in('tier', targetAudience.tier)

      recipients = (tierMembers || []).map(m => ({
        email: m.email,
        firstName: m.first_name || 'Friend',
        memberId: m.id
      }))
    } else if (targetAudience.subscription_type) {
      // By subscription type
      const { data: subscriptions } = await adminSupabase
        .from('email_subscriptions')
        .select('members(id, email, first_name)')
        .eq('subscription_type', targetAudience.subscription_type)
        .eq('is_subscribed', true)

      recipients = (subscriptions || [])
        .filter(s => (s.members as any)?.email)
        .map(s => ({
          email: (s.members as any).email,
          firstName: (s.members as any).first_name || 'Friend',
          memberId: (s.members as any).id
        }))
    } else if (targetAudience.memberIds && targetAudience.memberIds.length > 0) {
      // Specific members
      const { data: specificMembers } = await adminSupabase
        .from('members')
        .select('id, email, first_name')
        .in('id', targetAudience.memberIds)

      recipients = (specificMembers || []).map(m => ({
        email: m.email,
        firstName: m.first_name || 'Friend',
        memberId: m.id
      }))
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 })
    }

    // Update campaign status to sending
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId)

    // Send emails in batches
    const BATCH_SIZE = 50
    let sentCount = 0
    let failedCount = 0

    const baseHtml = campaign.html_preview || generateDefaultHtml(campaign)

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE)

      for (const recipient of batch) {
        try {
          // Personalize email
          const personalizedHtml = baseHtml
            .replace(/\{\{firstName\}\}/g, recipient.firstName)
            .replace(/\{\{email\}\}/g, recipient.email)

          const personalizedSubject = campaign.subject
            .replace(/\{\{firstName\}\}/g, recipient.firstName)

          await resend.emails.send({
            from: 'TPC Ministries <info@tpcmin.com>',
            to: recipient.email,
            subject: personalizedSubject,
            html: personalizedHtml,
          })

          // Log send
          await adminSupabase.from('email_send_log').insert({
            campaign_id: campaignId,
            member_id: recipient.memberId,
            email_address: recipient.email,
            status: 'sent'
          })

          sentCount++
        } catch (sendError) {
          console.error(`Failed to send to ${recipient.email}:`, sendError)

          // Log failure
          await adminSupabase.from('email_send_log').insert({
            campaign_id: campaignId,
            member_id: recipient.memberId,
            email_address: recipient.email,
            status: 'failed',
            error_message: sendError instanceof Error ? sendError.message : 'Unknown error'
          })

          failedCount++
        }
      }

      // Delay between batches
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Update campaign with final stats
    await supabase
      .from('email_campaigns')
      .update({
        status: failedCount === recipients.length ? 'failed' : 'sent',
        sent_count: sentCount,
        sent_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    return NextResponse.json({
      success: true,
      message: 'Campaign sent',
      stats: {
        totalRecipients: recipients.length,
        sent: sentCount,
        failed: failedCount
      }
    })

  } catch (error) {
    console.error('Error sending campaign:', error)
    return NextResponse.json({
      error: 'Failed to send campaign',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function generateDefaultHtml(campaign: any): string {
  const content = campaign.content || {}

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 30px; text-align: center;">
            <h1 style="color: #c9a961; font-size: 24px; margin: 0;">TPC MINISTRIES</h1>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #1e3a8a; margin: 0 0 20px;">${campaign.subject}</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Dear {{firstName}},
            </p>
            <div style="color: #333; font-size: 16px; line-height: 1.6;">
              ${content.body || content.message || 'Thank you for being part of our TPC family.'}
            </div>
            ${content.ctaText && content.ctaUrl ? `
              <p style="text-align: center; margin: 30px 0;">
                <a href="${content.ctaUrl}" style="background: #c9a961; color: #1e3a8a; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  ${content.ctaText}
                </a>
              </p>
            ` : ''}
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
              Blessings,<br>
              <strong>TPC Ministries Team</strong>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background: #1e3a8a; padding: 30px; text-align: center;">
            <p style="color: #c9a961; margin: 0 0 10px;">
              <strong>TPC Ministries</strong><br>
              Awakening Purpose. Igniting Vision.
            </p>
            <p style="color: #fff; font-size: 13px; margin: 0;">
              <a href="https://tpcmin.org" style="color: #c9a961;">Website</a> |
              <a href="https://tpcmin.org/settings/notifications" style="color: #c9a961;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

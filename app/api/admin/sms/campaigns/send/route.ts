import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms/twilio'
import { formatPhoneE164 } from '@/lib/utils/phone'

// POST - Send an SMS campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { campaign_id } = body

    if (!campaign_id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('sms_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return NextResponse.json({ error: 'Campaign already sent or sending' }, { status: 400 })
    }

    // Update campaign status to sending
    await supabase
      .from('sms_campaigns')
      .update({ status: 'sending', sent_at: new Date().toISOString() })
      .eq('id', campaign_id)

    // Get target members with phone numbers
    let query = supabase
      .from('members')
      .select('id, first_name, phone_number')
      .not('phone_number', 'is', null)
      .neq('phone_number', '')

    // Apply audience filters
    if (campaign.target_audience === 'tier' && campaign.target_tier) {
      query = query.eq('tier', campaign.target_tier)
    } else if (campaign.target_audience === 'subscribers') {
      query = query.eq('sms_subscribed', true)
    }

    const { data: recipients, error: recipientsError } = await query

    if (recipientsError) {
      console.error('Error fetching recipients:', recipientsError)
      await supabase
        .from('sms_campaigns')
        .update({ status: 'failed' })
        .eq('id', campaign_id)
      return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 })
    }

    if (!recipients || recipients.length === 0) {
      await supabase
        .from('sms_campaigns')
        .update({ status: 'failed', sent_count: 0 })
        .eq('id', campaign_id)
      return NextResponse.json({ error: 'No recipients with phone numbers found' }, { status: 400 })
    }

    // Send SMS messages (with rate limiting for Twilio)
    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    for (const recipient of recipients) {
      try {
        // Personalize message
        let personalizedMessage = campaign.message
          .replace(/\{\{firstName\}\}/g, recipient.first_name || 'Friend')
          .replace(/\{\{first_name\}\}/g, recipient.first_name || 'Friend')

        // Format phone number
        const formattedPhone = formatPhoneE164(recipient.phone_number)
        if (!formattedPhone) {
          failCount++
          continue
        }

        const result = await sendSMS({ to: formattedPhone, message: personalizedMessage })

        if (result.success) {
          successCount++
        } else {
          failCount++
          if (result.error) {
            errors.push(`${recipient.phone_number}: ${result.error}`)
          }
        }

        // Rate limit: 1 message per second for Twilio
        await new Promise(resolve => setTimeout(resolve, 1100))
      } catch (err) {
        failCount++
        console.error(`Error sending to ${recipient.phone_number}:`, err)
      }
    }

    // Update campaign with results
    const finalStatus = failCount === recipients.length ? 'failed' : 'sent'
    await supabase
      .from('sms_campaigns')
      .update({
        status: finalStatus,
        sent_count: successCount,
        failed_count: failCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', campaign_id)

    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: member.id,
      action: 'send',
      entity_type: 'sms_campaign',
      entity_id: campaign_id,
      entity_name: campaign.name,
      details: { sent: successCount, failed: failCount, total: recipients.length },
    })

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      total: recipients.length,
      errors: errors.slice(0, 10), // Only return first 10 errors
    })
  } catch (error) {
    console.error('SMS campaign send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail as sendResendEmail } from '@/lib/email/resend'
import { renderCovenantPartnerEmail } from '@/lib/email/render'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createAdminClient()
}

interface WorkflowConfig {
  id: string
  name: string
  trigger_type: string
  action_type: string
  trigger_config: {
    days_before?: number
    days_after?: number
    days_inactive?: number
    partner_email_kind?: 'welcome' | 'monthly-update' | 'gathering' | 'resource' | 'training' | 'missions'
  }
  action_config: {
    subject?: string
    message?: string
    ctaText?: string
    ctaUrl?: string
    template?: string
  }
}

interface WorkflowRecipient {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  years?: number
  event_title?: string
  event_date?: string
  event_time?: string
  event_url?: string
  subscription_status?: string | null
}

interface EventRow {
  id: string
  title: string
  start_time: string
}

function startOfDay(date: Date) {
  const clone = new Date(date)
  clone.setHours(0, 0, 0, 0)
  return clone
}

function endOfDay(date: Date) {
  const clone = new Date(date)
  clone.setHours(23, 59, 59, 999)
  return clone
}

async function hasRecentExecution(workflowId: string, memberId: string, days = 30) {
  const supabase = getSupabase()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('workflow_executions')
    .select('id')
    .eq('workflow_id', workflowId)
    .eq('member_id', memberId)
    .gte('executed_at', since)
    .limit(1)

  return Boolean(data?.length)
}

// Get members matching the workflow trigger
async function getMembersForWorkflow(workflow: WorkflowConfig) {
  const now = new Date()
  const members: WorkflowRecipient[] = []
  const supabase = getSupabase()

  switch (workflow.trigger_type) {
    case 'birthday': {
      const daysBefore = workflow.trigger_config.days_before || 0
      const targetDate = new Date(now.getTime() + daysBefore * 24 * 60 * 60 * 1000)
      const month = targetDate.getMonth() + 1
      const day = targetDate.getDate()

      // Get members with birthday on target date
      const { data } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, date_of_birth')
        .not('date_of_birth', 'is', null)

      for (const member of data || []) {
        if (member.date_of_birth) {
          const dob = new Date(member.date_of_birth)
          if (dob.getMonth() + 1 === month && dob.getDate() === day) {
            members.push(member)
          }
        }
      }
      break
    }

    case 'anniversary': {
      const daysBefore = workflow.trigger_config.days_before || 0
      const targetDate = new Date(now.getTime() + daysBefore * 24 * 60 * 60 * 1000)
      const month = targetDate.getMonth() + 1
      const day = targetDate.getDate()

      const { data } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, created_at')

      for (const member of data || []) {
        const joinDate = new Date(member.created_at)
        if (joinDate.getMonth() + 1 === month && joinDate.getDate() === day) {
          const years = now.getFullYear() - joinDate.getFullYear()
          if (years >= 1) {
            members.push({ ...member, years })
          }
        }
      }
      break
    }

    case 'new_member': {
      const daysAfter = workflow.trigger_config.days_after || 0
      const targetDate = new Date(now.getTime() - daysAfter * 24 * 60 * 60 * 1000)
      const { data } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, created_at')
        .gte('created_at', startOfDay(targetDate).toISOString())
        .lte('created_at', endOfDay(targetDate).toISOString())

      members.push(...(data || []))
      break
    }

    case 'inactive': {
      const daysInactive = workflow.trigger_config.days_inactive || 30
      const cutoffDate = new Date(now.getTime() - daysInactive * 24 * 60 * 60 * 1000)

      // Get all members
      const { data: allMembers } = await supabase
        .from('members')
        .select('id, first_name, last_name, email')

      // Check last activity for each
      for (const member of allMembers || []) {
        const { data: activity } = await supabase
          .from('member_activity')
          .select('created_at')
          .eq('member_id', member.id)
          .order('created_at', { ascending: false })
          .limit(1)

        const lastActivity = activity?.[0]?.created_at
        if (!lastActivity || new Date(lastActivity) < cutoffDate) {
          // Check if we already sent re-engagement recently
          const { data: recentExecution } = await supabase
            .from('workflow_executions')
            .select('id')
            .eq('workflow_id', workflow.id)
            .eq('member_id', member.id)
            .gte('executed_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1)

          if (!recentExecution?.length) {
            members.push(member)
          }
        }
      }
      break
    }

    case 'prayer_answered': {
      // Get prayers marked as answered in the last 24 hours
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const { data } = await supabase
        .from('prayer_requests')
        .select(`
          id, member_id, title,
          members (id, first_name, last_name, email)
        `)
        .eq('is_answered', true)
        .gte('updated_at', yesterday.toISOString())

      for (const prayer of data || []) {
        if (prayer.members) {
          members.push(prayer.members)
        }
      }
      break
    }

    case 'partner_welcome':
    case 'partner_hub_reminder': {
      const daysAfter = workflow.trigger_config.days_after || 0
      const targetDate = new Date(now.getTime() - daysAfter * 24 * 60 * 60 * 1000)
      const { data } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, tier, joined_at, created_at')
        .in('tier', ['partner', 'covenant'])

      for (const member of data || []) {
        if (!member.email) continue
        const joinedAt = member.joined_at || member.created_at
        if (!joinedAt) continue
        const joinedDate = new Date(joinedAt)
        if (joinedDate < startOfDay(targetDate) || joinedDate > endOfDay(targetDate)) continue
        if (await hasRecentExecution(workflow.id, member.id, 60)) continue
        members.push(member)
      }
      break
    }

    case 'partner_gathering_reminder': {
      const daysBefore = workflow.trigger_config.days_before ?? 1
      const targetDate = new Date(now.getTime() + daysBefore * 24 * 60 * 60 * 1000)
      const { data: events } = await supabase
        .from('events')
        .select('id, title, start_time')
        .eq('status', 'upcoming')
        .in('tier_required', ['partner', 'covenant'])
        .gte('start_time', startOfDay(targetDate).toISOString())
        .lte('start_time', endOfDay(targetDate).toISOString())
        .order('start_time', { ascending: true })

      if (!events?.length) break

      const nextEvent = events[0] as EventRow
      const eventDate = new Date(nextEvent.start_time)
      const eventUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'}/partner-hub`

      const { data: partners } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, tier')
        .in('tier', ['partner', 'covenant'])

      for (const member of partners || []) {
        if (!member.email) continue
        if (await hasRecentExecution(workflow.id, member.id, 7)) continue
        members.push({
          ...member,
          event_title: nextEvent.title,
          event_date: eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
          event_time: eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          event_url: eventUrl,
        })
      }
      break
    }

    case 'payment_attention': {
      const { data } = await supabase
        .from('member_subscriptions')
        .select(`
          member_id,
          status,
          members:member_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .in('status', ['past_due', 'unpaid', 'incomplete'])

      for (const row of data || []) {
        const member = Array.isArray(row.members) ? row.members[0] : row.members
        if (!member?.email) continue
        if (await hasRecentExecution(workflow.id, member.id, 7)) continue
        members.push({ ...member, subscription_status: row.status })
      }
      break
    }
  }

  return members
}

// Process message template with member data
function processTemplate(template: string, member: WorkflowRecipient): string {
  return template
    .replace(/{first_name}/g, member.first_name || 'Friend')
    .replace(/{last_name}/g, member.last_name || '')
    .replace(/{email}/g, member.email || '')
    .replace(/{years}/g, member.years?.toString() || '1')
    .replace(/{event_title}/g, member.event_title || 'the next Covenant Partner gathering')
    .replace(/{event_date}/g, member.event_date || '')
    .replace(/{event_time}/g, member.event_time || '')
    .replace(/{partner_hub_url}/g, `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'}/partner-hub`)
    .replace(/{giving_url}/g, `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'}/my-giving`)
}

async function sendWorkflowEmail(workflow: WorkflowConfig, member: WorkflowRecipient, subject: string, body: string) {
  if (!member.email) return false

  try {
    const isPartnerTemplate = workflow.action_config.template === 'covenant-partner'
      || workflow.trigger_type.startsWith('partner_')
      || workflow.trigger_type === 'payment_attention'

    const html = isPartnerTemplate
      ? await renderCovenantPartnerEmail({
        kind: workflow.trigger_config.partner_email_kind || 'monthly-update',
        memberName: member.first_name || 'Friend',
        updateTitle: subject,
        updateBody: body,
        partnerHubUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tpcmin.org'}/partner-hub`,
        gatheringUrl: member.event_url,
        gatheringDate: member.event_date,
        gatheringTime: member.event_time,
        ctaText: workflow.action_config.ctaText,
        ctaUrl: workflow.action_config.ctaUrl || member.event_url,
      })
      : `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
          <div style="background:#0e1a2e;color:#fff;padding:24px;text-align:center;">
            <h1 style="margin:0;">TPC Ministries</h1>
          </div>
          <div style="padding:28px 22px;color:#374151;line-height:1.6;">
            ${body.replace(/\n/g, '<br>')}
          </div>
        </div>
      `

    const result = await sendResendEmail({ to: member.email, subject, html })
    return result.success
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Send notification
async function sendNotification(memberId: string, message: string) {
  try {
    await getSupabase().from('notifications').insert({
      user_id: memberId,
      type: 'workflow',
      title: 'TPC Ministries',
      message,
      is_read: false
    })
    return true
  } catch (error) {
    console.error('Error sending notification:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { workflowId } = await request.json()
    const supabase = getSupabase()

    if (!workflowId) {
      return NextResponse.json({ error: 'workflowId required' }, { status: 400 })
    }

    // Get workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('automated_workflows')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (!workflow.is_active) {
      return NextResponse.json({ error: 'Workflow is not active' }, { status: 400 })
    }

    // Get members matching trigger
    const members = await getMembersForWorkflow(workflow)

    let sent = 0
    let failed = 0

    // Process each member
    for (const member of members) {
      let success = false
      let errorMessage = ''

      try {
        switch (workflow.action_type) {
          case 'email': {
            const subject = processTemplate(workflow.action_config.subject || '', member)
            const body = processTemplate(workflow.action_config.message || '', member)
            success = await sendWorkflowEmail(workflow, member, subject, body)
            break
          }
          case 'notification': {
            const message = processTemplate(workflow.action_config.message || '', member)
            success = await sendNotification(member.id, message)
            break
          }
          case 'sms': {
            // SMS would be implemented here
            success = false
            errorMessage = 'SMS not configured'
            break
          }
        }
      } catch (error) {
        errorMessage = (error as Error).message
      }

      // Log execution
      await supabase.from('workflow_executions').insert({
        workflow_id: workflowId,
        workflow_name: workflow.name,
        member_id: member.id,
        member_name: `${member.first_name} ${member.last_name}`,
        action_type: workflow.action_type,
        status: success ? 'sent' : 'failed',
        error_message: errorMessage || null,
        executed_at: new Date().toISOString()
      })

      if (success) sent++
      else failed++
    }

    // Update workflow stats
    await supabase
      .from('automated_workflows')
      .update({
        last_run: new Date().toISOString(),
        total_sent: (workflow.total_sent || 0) + sent
      })
      .eq('id', workflowId)

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: members.length
    })

  } catch (error) {
    console.error('Error running workflow:', error)
    return NextResponse.json(
      { error: 'Failed to run workflow' },
      { status: 500 }
    )
  }
}

// Cron endpoint to run all active workflows
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isAuthorizedCron = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`)

    if (!isAuthorizedCron) {
      const authResult = await requireStaff()
      if (authResult instanceof NextResponse) {
        return authResult
      }
    }

    const supabase = getSupabase()

    // Get all active workflows
    const { data: workflows, error } = await supabase
      .from('automated_workflows')
      .select('*')
      .eq('is_active', true)

    if (error) throw error

    const results: Array<{
      workflow: string
      matched?: number
      sent?: number
      error?: string
    }> = []

    for (const workflow of workflows || []) {
      try {
        const members = await getMembersForWorkflow(workflow)

        let sent = 0
        for (const member of members) {
          let success = false

          switch (workflow.action_type) {
            case 'email': {
              const subject = processTemplate(workflow.action_config.subject || '', member)
              const body = processTemplate(workflow.action_config.message || '', member)
              success = await sendWorkflowEmail(workflow, member, subject, body)
              break
            }
            case 'notification': {
              const message = processTemplate(workflow.action_config.message || '', member)
              success = await sendNotification(member.id, message)
              break
            }
          }

          if (success) {
            sent++
            await supabase.from('workflow_executions').insert({
              workflow_id: workflow.id,
              workflow_name: workflow.name,
              member_id: member.id,
              member_name: `${member.first_name} ${member.last_name}`,
              action_type: workflow.action_type,
              status: 'sent',
              executed_at: new Date().toISOString()
            })
          }
        }

        if (sent > 0) {
          await supabase
            .from('automated_workflows')
            .update({
              last_run: new Date().toISOString(),
              total_sent: (workflow.total_sent || 0) + sent
            })
            .eq('id', workflow.id)
        }

        results.push({
          workflow: workflow.name,
          matched: members.length,
          sent
        })

      } catch (error) {
        console.error(`Error running workflow ${workflow.name}:`, error)
        results.push({
          workflow: workflow.name,
          error: (error as Error).message
        })
      }
    }

    return NextResponse.json({
      success: true,
      executed: results.length,
      results
    })

  } catch (error) {
    console.error('Error in cron workflow run:', error)
    return NextResponse.json(
      { error: 'Failed to run workflows' },
      { status: 500 }
    )
  }
}

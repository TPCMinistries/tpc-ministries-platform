import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WorkflowConfig {
  id: string
  name: string
  trigger_type: string
  action_type: string
  trigger_config: {
    days_before?: number
    days_after?: number
    days_inactive?: number
  }
  action_config: {
    subject?: string
    message?: string
  }
}

// Get members matching the workflow trigger
async function getMembersForWorkflow(workflow: WorkflowConfig) {
  const now = new Date()
  const members: any[] = []

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
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

      const { data } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, created_at')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())

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
  }

  return members
}

// Process message template with member data
function processTemplate(template: string, member: any): string {
  return template
    .replace(/{first_name}/g, member.first_name || 'Friend')
    .replace(/{last_name}/g, member.last_name || '')
    .replace(/{email}/g, member.email || '')
    .replace(/{years}/g, member.years?.toString() || '1')
}

// Send email via API
async function sendEmail(to: string, subject: string, body: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html: body.replace(/\n/g, '<br>'),
        text: body
      })
    })
    return response.ok
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Send notification
async function sendNotification(memberId: string, message: string) {
  try {
    await supabase.from('notifications').insert({
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
    const { workflowId } = await request.json()

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
            success = await sendEmail(member.email, subject, body)
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
    // Verify cron secret if needed
    const authHeader = request.headers.get('authorization')
    // In production, verify: if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return 401

    // Get all active workflows
    const { data: workflows, error } = await supabase
      .from('automated_workflows')
      .select('*')
      .eq('is_active', true)

    if (error) throw error

    const results: any[] = []

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
              success = await sendEmail(member.email, subject, body)
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

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

interface ReportMetrics {
  totalMembers: number
  newMembers: number
  memberGrowthPercent: number
  activeMembers: number
  engagementRate: number
  totalRevenue: number
  revenueChange: number
  mrr: number
  prayerRequests: number
  answeredPrayers: number
  atRiskMembers: number
  topFeatures: Array<{ name: string; count: number }>
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'weekly' // weekly or monthly

    const now = new Date()
    const isMonday = now.getDay() === 1
    const isFirstOfMonth = now.getDate() === 1

    // Only run on appropriate days
    if (reportType === 'weekly' && !isMonday) {
      return NextResponse.json({ message: 'Weekly reports only run on Mondays' })
    }
    if (reportType === 'monthly' && !isFirstOfMonth) {
      return NextResponse.json({ message: 'Monthly reports only run on the 1st' })
    }

    // Calculate date ranges
    let startDate: Date
    let periodLabel: string

    if (reportType === 'monthly') {
      // Last month
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      periodLabel = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else {
      // Last 7 days
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      periodLabel = `Week of ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }

    // Gather metrics
    const metrics = await gatherReportMetrics(startDate, now, reportType)

    // Get subscribers
    const { data: subscribers } = await supabase
      .from('scheduled_report_subscriptions')
      .select('member_id, members(email, first_name, is_admin)')
      .eq('report_type', reportType)
      .eq('enabled', true)

    // If no subscriptions table exists or no subscribers, send to all admins
    let recipients: Array<{ email: string; firstName: string }> = []

    if (!subscribers || subscribers.length === 0) {
      const { data: admins } = await supabase
        .from('members')
        .select('email, first_name')
        .eq('is_admin', true)

      recipients = (admins || []).map(a => ({
        email: a.email,
        firstName: a.first_name || 'Admin'
      }))
    } else {
      recipients = subscribers
        .filter(s => (s.members as any)?.email && (s.members as any)?.is_admin)
        .map(s => ({
          email: (s.members as any).email,
          firstName: (s.members as any).first_name || 'Admin'
        }))
    }

    if (recipients.length === 0) {
      return NextResponse.json({ message: 'No recipients found for report' })
    }

    // Generate and send email
    const subject = reportType === 'monthly'
      ? `TPC Ministries Monthly Report - ${periodLabel}`
      : `TPC Ministries Weekly Report - ${periodLabel}`

    const emailHtml = generateReportEmail(metrics, reportType, periodLabel)

    const results = []
    for (const recipient of recipients) {
      try {
        await resend.emails.send({
          from: 'TPC Ministries <reports@tpcministries.org>',
          to: recipient.email,
          subject,
          html: emailHtml.replace('{{firstName}}', recipient.firstName)
        })
        results.push({ email: recipient.email, status: 'sent' })
      } catch (error) {
        console.error(`Error sending to ${recipient.email}:`, error)
        results.push({ email: recipient.email, status: 'failed' })
      }
    }

    // Log the report
    await supabase.from('report_history').insert({
      report_type: reportType,
      period_start: startDate.toISOString(),
      period_end: now.toISOString(),
      recipients_count: recipients.length,
      sent_at: new Date().toISOString(),
      metrics: metrics
    }).catch(() => {}) // Ignore if table doesn't exist

    return NextResponse.json({
      success: true,
      reportType,
      periodLabel,
      recipientCount: recipients.length,
      results
    })

  } catch (error) {
    console.error('Error generating email report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function gatherReportMetrics(startDate: Date, endDate: Date, type: string): Promise<ReportMetrics> {
  const periodLength = endDate.getTime() - startDate.getTime()
  const comparisonStart = new Date(startDate.getTime() - periodLength)

  // Total members
  const { count: totalMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  // New members in period
  const { count: newMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // New members in comparison period
  const { count: prevNewMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', comparisonStart.toISOString())
    .lt('created_at', startDate.toISOString())

  const memberGrowthPercent = prevNewMembers
    ? Math.round(((newMembers || 0) - prevNewMembers) / prevNewMembers * 100)
    : 0

  // Active members
  const { data: activeData } = await supabase
    .from('member_activity')
    .select('member_id')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const activeMembers = new Set(activeData?.map(a => a.member_id) || []).size
  const engagementRate = totalMembers ? Math.round((activeMembers / totalMembers) * 100) : 0

  // Revenue
  const { data: revenueData } = await supabase
    .from('donations')
    .select('amount')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const totalRevenue = (revenueData || []).reduce((sum, d) => sum + (d.amount || 0), 0)

  const { data: prevRevenueData } = await supabase
    .from('donations')
    .select('amount')
    .gte('created_at', comparisonStart.toISOString())
    .lt('created_at', startDate.toISOString())

  const prevRevenue = (prevRevenueData || []).reduce((sum, d) => sum + (d.amount || 0), 0)
  const revenueChange = prevRevenue ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0

  // MRR from tiers
  const { data: tiers } = await supabase
    .from('members')
    .select('tier')

  let partnerCount = 0
  let covenantCount = 0
  for (const t of tiers || []) {
    if (t.tier === 'partner') partnerCount++
    if (t.tier === 'covenant') covenantCount++
  }
  const mrr = partnerCount * 50 + covenantCount * 150

  // Prayer stats
  const { count: prayerRequests } = await supabase
    .from('prayer_requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const { count: answeredPrayers } = await supabase
    .from('prayer_requests')
    .select('*', { count: 'exact', head: true })
    .eq('is_answered', true)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // At-risk members
  const thirtyDaysAgo = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
  const { data: allMembers } = await supabase
    .from('members')
    .select('id')
    .limit(100)

  let atRiskMembers = 0
  for (const member of allMembers || []) {
    const { data: lastActivity } = await supabase
      .from('member_activity')
      .select('created_at')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!lastActivity?.length || new Date(lastActivity[0].created_at) < thirtyDaysAgo) {
      atRiskMembers++
    }
    if (atRiskMembers >= 10) break
  }

  // Top features
  const { data: featureData } = await supabase
    .from('member_activity')
    .select('activity_type')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const featureCounts: Record<string, number> = {}
  for (const f of featureData || []) {
    featureCounts[f.activity_type] = (featureCounts[f.activity_type] || 0) + 1
  }

  const topFeatures = Object.entries(featureCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))

  return {
    totalMembers: totalMembers || 0,
    newMembers: newMembers || 0,
    memberGrowthPercent,
    activeMembers,
    engagementRate,
    totalRevenue,
    revenueChange,
    mrr,
    prayerRequests: prayerRequests || 0,
    answeredPrayers: answeredPrayers || 0,
    atRiskMembers,
    topFeatures
  }
}

function generateReportEmail(metrics: ReportMetrics, type: string, periodLabel: string): string {
  const isMonthly = type === 'monthly'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TPC Ministries ${isMonthly ? 'Monthly' : 'Weekly'} Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">TPC Ministries</h1>
      <p style="color: #d4af37; margin: 10px 0 0; font-size: 16px;">${isMonthly ? 'Monthly' : 'Weekly'} Ministry Report</p>
      <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 14px;">${periodLabel}</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
      <!-- Greeting -->
      <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">
        Hi {{firstName}},
      </p>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 25px;">
        Here's your ${isMonthly ? 'monthly' : 'weekly'} ministry performance summary:
      </p>

      <!-- Key Metrics Grid -->
      <div style="margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px;">
          <tr>
            <td style="width: 50%; background: #f8fafc; border-radius: 8px; padding: 15px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">Total Members</p>
              <p style="color: #1e3a5f; font-size: 28px; font-weight: bold; margin: 5px 0;">${metrics.totalMembers.toLocaleString()}</p>
              <p style="color: ${metrics.memberGrowthPercent >= 0 ? '#16a34a' : '#dc2626'}; font-size: 12px; margin: 0;">
                ${metrics.memberGrowthPercent >= 0 ? '↑' : '↓'} ${Math.abs(metrics.memberGrowthPercent)}% vs prev
              </p>
            </td>
            <td style="width: 50%; background: #f0fdf4; border-radius: 8px; padding: 15px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">Total Giving</p>
              <p style="color: #16a34a; font-size: 28px; font-weight: bold; margin: 5px 0;">$${metrics.totalRevenue.toLocaleString()}</p>
              <p style="color: ${metrics.revenueChange >= 0 ? '#16a34a' : '#dc2626'}; font-size: 12px; margin: 0;">
                ${metrics.revenueChange >= 0 ? '↑' : '↓'} ${Math.abs(metrics.revenueChange)}% vs prev
              </p>
            </td>
          </tr>
          <tr>
            <td style="width: 50%; background: #faf5ff; border-radius: 8px; padding: 15px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">Engagement Rate</p>
              <p style="color: #7c3aed; font-size: 28px; font-weight: bold; margin: 5px 0;">${metrics.engagementRate}%</p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">${metrics.activeMembers} active members</p>
            </td>
            <td style="width: 50%; background: #fef2f2; border-radius: 8px; padding: 15px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">Prayers</p>
              <p style="color: #dc2626; font-size: 28px; font-weight: bold; margin: 5px 0;">${metrics.prayerRequests}</p>
              <p style="color: #16a34a; font-size: 12px; margin: 0;">${metrics.answeredPrayers} answered</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- MRR -->
      <div style="background: linear-gradient(135deg, #d4af37 0%, #b8963a 100%); border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
        <p style="color: rgba(255,255,255,0.9); font-size: 12px; margin: 0;">Monthly Recurring Revenue</p>
        <p style="color: white; font-size: 32px; font-weight: bold; margin: 5px 0;">$${metrics.mrr.toLocaleString()}/mo</p>
      </div>

      <!-- New Members -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
        <p style="color: #1e3a5f; font-size: 14px; font-weight: 600; margin: 0 0 10px;">New Members This Period</p>
        <p style="color: #16a34a; font-size: 24px; font-weight: bold; margin: 0;">+${metrics.newMembers}</p>
      </div>

      ${metrics.atRiskMembers > 0 ? `
      <!-- At-Risk Alert -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 15px; margin-bottom: 25px;">
        <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 5px;">⚠️ Attention Needed</p>
        <p style="color: #a16207; font-size: 14px; margin: 0;">
          ${metrics.atRiskMembers} members haven't engaged in 30+ days. Consider reaching out.
        </p>
      </div>
      ` : ''}

      <!-- Top Features -->
      ${metrics.topFeatures.length > 0 ? `
      <div style="margin-bottom: 25px;">
        <p style="color: #1e3a5f; font-size: 14px; font-weight: 600; margin: 0 0 15px;">Top Features Used</p>
        ${metrics.topFeatures.map((f, i) => `
          <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="color: #d4af37; font-weight: bold; width: 20px;">${i + 1}.</span>
            <span style="flex: 1; color: #374151; text-transform: capitalize;">${f.name}</span>
            <span style="color: #6b7280;">${f.count.toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- CTA -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.tpcministries.org'}/admin/analytics"
           style="display: inline-block; background: #1e3a5f; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600;">
          View Full Analytics
        </a>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This is an automated report from TPC Ministries.
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.tpcministries.org'}/admin/settings" style="color: #6b7280;">
            Manage report preferences
          </a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Lazy initialization to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

interface PastoralAlert {
  id: string
  member_id: string
  member_name: string
  alert_type: 'inactive' | 'struggling' | 'celebration' | 'milestone' | 'new_member' | 'churn_risk'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  suggested_action: string
  metadata: Record<string, any>
  created_at: string
}

interface ContentGap {
  topic: string
  search_count: number
  available_content: number
  recommendation: string
}

interface AIInsights {
  dailyBriefing: string
  pastoralAlerts: PastoralAlert[]
  atRiskMembers: any[]
  upcomingCelebrations: any[]
  contentGaps: ContentGap[]
  engagementTrends: any
  revenueInsights: any
  suggestedActions: any[]
  memberStats: any
}

// Generate AI-powered daily briefing
async function generateDailyBriefing(data: any): Promise<string> {
  const prompt = `You are an AI assistant for Prophet Lorenzo at TPC Ministries. Generate a concise, encouraging daily briefing for the ministry admin dashboard.

Current Data:
- Total Members: ${data.totalMembers}
- New Members This Week: ${data.newMembersThisWeek}
- Active Members (30 days): ${data.activeMembers}
- Pending Prayer Requests: ${data.pendingPrayers}
- Revenue This Month: $${data.revenueThisMonth}
- At-Risk Members: ${data.atRiskCount}
- Upcoming Birthdays: ${data.upcomingBirthdays}
- Upcoming Anniversaries: ${data.upcomingAnniversaries}

Generate a 2-3 sentence briefing that:
1. Highlights the most important thing to focus on today
2. Celebrates any wins
3. Mentions any urgent pastoral care needs

Keep it warm, spiritual, and actionable. Use "your ministry" or "your congregation" language.`

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    })
    return completion.choices[0]?.message?.content || 'Welcome to your ministry dashboard. May God guide your leadership today.'
  } catch (error) {
    console.error('Error generating briefing:', error)
    return 'Welcome to your ministry dashboard. Check your pastoral alerts for members who need attention today.'
  }
}

// Analyze member data and generate pastoral alerts
async function generatePastoralAlerts(): Promise<PastoralAlert[]> {
  const alerts: PastoralAlert[] = []
  const now = new Date()

  // 1. Find inactive members (no activity in 30+ days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const { data: inactiveMembers } = await supabase
    .from('members')
    .select(`
      id, first_name, last_name, email, created_at,
      member_activity (created_at)
    `)
    .order('created_at', { ascending: false })

  for (const member of inactiveMembers || []) {
    const lastActivity = member.member_activity?.[0]?.created_at
    if (!lastActivity || new Date(lastActivity) < thirtyDaysAgo) {
      const daysInactive = lastActivity
        ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
        : Math.floor((now.getTime() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24))

      if (daysInactive >= 30) {
        alerts.push({
          id: `inactive-${member.id}`,
          member_id: member.id,
          member_name: `${member.first_name} ${member.last_name}`,
          alert_type: 'inactive',
          priority: daysInactive > 60 ? 'high' : 'medium',
          title: `${member.first_name} hasn't been active`,
          description: `No activity in ${daysInactive} days. Last seen: ${lastActivity ? new Date(lastActivity).toLocaleDateString() : 'Never logged in'}`,
          suggested_action: 'Send a personal check-in message or make a pastoral call',
          metadata: { daysInactive, lastActivity, email: member.email },
          created_at: now.toISOString()
        })
      }
    }
  }

  // 2. Find upcoming birthdays (next 7 days)
  const { data: upcomingBirthdays } = await supabase
    .from('members')
    .select('id, first_name, last_name, date_of_birth, email')
    .not('date_of_birth', 'is', null)

  for (const member of upcomingBirthdays || []) {
    if (member.date_of_birth) {
      const birthday = new Date(member.date_of_birth)
      const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate())

      // If birthday already passed this year, check next year
      if (thisYearBirthday < now) {
        thisYearBirthday.setFullYear(now.getFullYear() + 1)
      }

      const daysUntil = Math.ceil((thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil >= 0 && daysUntil <= 7) {
        const age = now.getFullYear() - birthday.getFullYear()
        alerts.push({
          id: `birthday-${member.id}`,
          member_id: member.id,
          member_name: `${member.first_name} ${member.last_name}`,
          alert_type: 'celebration',
          priority: daysUntil === 0 ? 'high' : 'low',
          title: daysUntil === 0
            ? `${member.first_name}'s birthday is TODAY!`
            : `${member.first_name}'s birthday in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
          description: `Turning ${age} years old`,
          suggested_action: 'Send birthday blessing message',
          metadata: { daysUntil, age, date: thisYearBirthday.toISOString() },
          created_at: now.toISOString()
        })
      }
    }
  }

  // 3. Find new members (joined in last 7 days) - welcome follow-up
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const { data: newMembers } = await supabase
    .from('members')
    .select('id, first_name, last_name, email, created_at')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  for (const member of newMembers || []) {
    const daysAgo = Math.floor((now.getTime() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24))
    alerts.push({
      id: `new-${member.id}`,
      member_id: member.id,
      member_name: `${member.first_name} ${member.last_name}`,
      alert_type: 'new_member',
      priority: daysAgo <= 1 ? 'high' : 'medium',
      title: `New member: ${member.first_name} ${member.last_name}`,
      description: `Joined ${daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`}`,
      suggested_action: 'Send personal welcome message and introduce to community groups',
      metadata: { joinedAt: member.created_at, email: member.email },
      created_at: now.toISOString()
    })
  }

  // 4. Find members with unanswered prayers (over 3 days old)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const { data: unansweredPrayers } = await supabase
    .from('prayer_requests')
    .select(`
      id, title, created_at, is_answered,
      members (id, first_name, last_name, email)
    `)
    .eq('is_answered', false)
    .eq('is_public', true)
    .lte('created_at', threeDaysAgo.toISOString())
    .order('created_at', { ascending: true })
    .limit(10)

  for (const prayer of unansweredPrayers || []) {
    const member = prayer.members as any
    if (member) {
      const daysAgo = Math.floor((now.getTime() - new Date(prayer.created_at).getTime()) / (1000 * 60 * 60 * 24))
      alerts.push({
        id: `prayer-${prayer.id}`,
        member_id: member.id,
        member_name: `${member.first_name} ${member.last_name}`,
        alert_type: 'struggling',
        priority: daysAgo > 7 ? 'high' : 'medium',
        title: `Prayer request needs attention`,
        description: `"${prayer.title}" - submitted ${daysAgo} days ago`,
        suggested_action: 'Pray for this request and send an encouraging message',
        metadata: { prayerId: prayer.id, title: prayer.title, daysAgo },
        created_at: now.toISOString()
      })
    }
  }

  // 5. Find members with engagement score drop (potential churn risk)
  const { data: memberProfiles } = await supabase
    .from('member_spiritual_profiles')
    .select(`
      member_id, engagement_score, previous_engagement_score,
      members (id, first_name, last_name, email)
    `)

  for (const profile of memberProfiles || []) {
    const member = profile.members as any
    if (member && profile.previous_engagement_score && profile.engagement_score) {
      const drop = profile.previous_engagement_score - profile.engagement_score
      if (drop >= 20) {
        alerts.push({
          id: `churn-${member.id}`,
          member_id: member.id,
          member_name: `${member.first_name} ${member.last_name}`,
          alert_type: 'churn_risk',
          priority: drop >= 40 ? 'high' : 'medium',
          title: `${member.first_name}'s engagement is dropping`,
          description: `Engagement score dropped by ${drop}% (from ${profile.previous_engagement_score}% to ${profile.engagement_score}%)`,
          suggested_action: 'Reach out personally to understand what they need',
          metadata: {
            currentScore: profile.engagement_score,
            previousScore: profile.previous_engagement_score,
            drop
          },
          created_at: now.toISOString()
        })
      }
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return alerts.slice(0, 20) // Return top 20 alerts
}

// Get content gaps based on search trends
async function getContentGaps(): Promise<ContentGap[]> {
  // This would normally analyze search logs - for now we'll check what topics are searched but have limited content
  const { data: searchLogs } = await supabase
    .from('search_logs')
    .select('query, created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const searchCounts: Record<string, number> = {}
  for (const log of searchLogs || []) {
    const query = log.query?.toLowerCase().trim()
    if (query) {
      searchCounts[query] = (searchCounts[query] || 0) + 1
    }
  }

  // Get content counts by category
  const { count: teachingsCount } = await supabase
    .from('teachings')
    .select('*', { count: 'exact', head: true })

  const gaps: ContentGap[] = []

  // Add some intelligent content gap recommendations
  const topSearches = Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  for (const [topic, count] of topSearches) {
    if (count >= 3) {
      gaps.push({
        topic,
        search_count: count,
        available_content: 0, // Would need to actually check
        recommendation: `Members are searching for "${topic}" - consider creating content on this topic`
      })
    }
  }

  // Add default recommendations if no search data
  if (gaps.length === 0) {
    gaps.push(
      {
        topic: 'Spiritual Gifts Discovery',
        search_count: 0,
        available_content: 2,
        recommendation: 'Popular topic - consider adding more assessments and teachings'
      },
      {
        topic: 'Prayer & Intercession',
        search_count: 0,
        available_content: 3,
        recommendation: 'Core ministry focus - keep content fresh and updated'
      }
    )
  }

  return gaps
}

// Get member statistics
async function getMemberStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalResult,
    newThisWeekResult,
    activeResult,
    tierBreakdown
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString()),
    supabase.from('member_activity').select('member_id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('members').select('tier')
  ])

  const tiers = { free: 0, partner: 0, covenant: 0 }
  for (const member of tierBreakdown.data || []) {
    const tier = member.tier || 'free'
    tiers[tier as keyof typeof tiers] = (tiers[tier as keyof typeof tiers] || 0) + 1
  }

  return {
    total: totalResult.count || 0,
    newThisWeek: newThisWeekResult.count || 0,
    activeThisMonth: activeResult.count || 0,
    byTier: tiers
  }
}

// Get revenue insights
async function getRevenueInsights() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [thisMonthResult, lastMonthResult] = await Promise.all([
    supabase.from('donations')
      .select('amount')
      .gte('created_at', startOfMonth.toISOString()),
    supabase.from('donations')
      .select('amount')
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString())
  ])

  const thisMonth = (thisMonthResult.data || []).reduce((sum, d) => sum + (d.amount || 0), 0)
  const lastMonth = (lastMonthResult.data || []).reduce((sum, d) => sum + (d.amount || 0), 0)
  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0

  return {
    thisMonth,
    lastMonth,
    change: parseFloat(change as string),
    trend: thisMonth >= lastMonth ? 'up' : 'down'
  }
}

// Generate suggested actions based on data
async function generateSuggestedActions(alerts: PastoralAlert[], stats: any): Promise<any[]> {
  const actions: any[] = []

  // High priority alerts
  const highPriorityCount = alerts.filter(a => a.priority === 'high').length
  if (highPriorityCount > 0) {
    actions.push({
      id: 'high-priority-alerts',
      type: 'urgent',
      title: `${highPriorityCount} High Priority Alert${highPriorityCount > 1 ? 's' : ''}`,
      description: 'Members need your immediate attention',
      action: 'Review alerts',
      actionUrl: '#alerts'
    })
  }

  // New members to welcome
  const newMemberAlerts = alerts.filter(a => a.alert_type === 'new_member')
  if (newMemberAlerts.length > 0) {
    actions.push({
      id: 'welcome-new-members',
      type: 'opportunity',
      title: `Welcome ${newMemberAlerts.length} New Member${newMemberAlerts.length > 1 ? 's' : ''}`,
      description: 'First impressions matter - send personal welcomes',
      action: 'Send welcomes',
      actionUrl: '/admin-messages'
    })
  }

  // Birthday celebrations
  const birthdayAlerts = alerts.filter(a => a.alert_type === 'celebration')
  if (birthdayAlerts.length > 0) {
    actions.push({
      id: 'birthday-blessings',
      type: 'celebration',
      title: `${birthdayAlerts.length} Birthday${birthdayAlerts.length > 1 ? 's' : ''} This Week`,
      description: 'Opportunity to show members you care',
      action: 'Send blessings',
      actionUrl: '/admin-celebrations'
    })
  }

  // Low engagement re-engagement
  const inactiveAlerts = alerts.filter(a => a.alert_type === 'inactive')
  if (inactiveAlerts.length >= 5) {
    actions.push({
      id: 're-engagement-campaign',
      type: 'strategy',
      title: 'Consider a Re-engagement Campaign',
      description: `${inactiveAlerts.length} members haven't been active in 30+ days`,
      action: 'Create campaign',
      actionUrl: '/communications'
    })
  }

  // Content creation suggestion
  if (stats.total > 50) {
    actions.push({
      id: 'content-refresh',
      type: 'growth',
      title: 'Keep Content Fresh',
      description: 'Regular new content keeps members engaged',
      action: 'Add content',
      actionUrl: '/admin-content'
    })
  }

  return actions
}

export async function GET(request: NextRequest) {
  try {
    // Gather all data in parallel
    const [
      memberStats,
      revenueInsights,
      pastoralAlerts,
      contentGaps,
      prayerCountResult
    ] = await Promise.all([
      getMemberStats(),
      getRevenueInsights(),
      generatePastoralAlerts(),
      getContentGaps(),
      supabase.from('prayer_requests')
        .select('*', { count: 'exact', head: true })
        .eq('is_answered', false)
    ])

    // Generate AI briefing
    const briefingData = {
      totalMembers: memberStats.total,
      newMembersThisWeek: memberStats.newThisWeek,
      activeMembers: memberStats.activeThisMonth,
      pendingPrayers: prayerCountResult.count || 0,
      revenueThisMonth: revenueInsights.thisMonth,
      atRiskCount: pastoralAlerts.filter(a => a.alert_type === 'churn_risk' || a.alert_type === 'inactive').length,
      upcomingBirthdays: pastoralAlerts.filter(a => a.alert_type === 'celebration').length,
      upcomingAnniversaries: 0
    }

    const dailyBriefing = await generateDailyBriefing(briefingData)

    // Generate suggested actions
    const suggestedActions = await generateSuggestedActions(pastoralAlerts, memberStats)

    // Get at-risk members (churn risk and inactive)
    const atRiskMembers = pastoralAlerts
      .filter(a => a.alert_type === 'churn_risk' || a.alert_type === 'inactive')
      .slice(0, 10)

    // Get upcoming celebrations
    const upcomingCelebrations = pastoralAlerts
      .filter(a => a.alert_type === 'celebration')
      .slice(0, 10)

    const insights: AIInsights = {
      dailyBriefing,
      pastoralAlerts,
      atRiskMembers,
      upcomingCelebrations,
      contentGaps,
      engagementTrends: {
        activeRate: memberStats.total > 0
          ? Math.round((memberStats.activeThisMonth / memberStats.total) * 100)
          : 0,
        newMemberRate: memberStats.total > 0
          ? Math.round((memberStats.newThisWeek / memberStats.total) * 100)
          : 0
      },
      revenueInsights,
      suggestedActions,
      memberStats
    }

    return NextResponse.json(insights)

  } catch (error) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

// POST endpoint for taking action on alerts
export async function POST(request: NextRequest) {
  try {
    const { action, alertId, memberId, data } = await request.json()

    switch (action) {
      case 'dismiss_alert':
        // Log that alert was dismissed
        await getSupabase().from('admin_alert_actions').insert({
          alert_id: alertId,
          action_type: 'dismissed',
          admin_notes: data?.notes
        })
        return NextResponse.json({ success: true })

      case 'send_message':
        // Queue a message to be sent
        await getSupabase().from('message_queue').insert({
          recipient_id: memberId,
          message_type: data?.type || 'personal',
          content: data?.content,
          scheduled_for: new Date().toISOString()
        })
        return NextResponse.json({ success: true })

      case 'mark_contacted':
        // Mark member as contacted
        await getSupabase().from('member_contact_log').insert({
          member_id: memberId,
          contact_type: data?.type || 'other',
          notes: data?.notes,
          contacted_at: new Date().toISOString()
        })
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error processing action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}

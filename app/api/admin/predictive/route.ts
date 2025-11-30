import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

function getSupabase() { return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!); }

function getOpenAI() { return new OpenAI({
  apiKey: process.env.OPENAI_API_KEY }); }

interface MemberActivity {
  member_id: any
  activity_type: any
  created_at: any
}

interface ChurnRiskFactors {
  daysInactive: number
  activityTrend: 'declining' | 'stable' | 'increasing'
  engagementScore: number
  donationStatus: 'active' | 'lapsed' | 'never'
  lastInteractionDays: number
}

// Calculate churn probability based on behavioral signals
function calculateChurnProbability(factors: ChurnRiskFactors): number {
  let score = 0

  // Days inactive (max 40 points)
  if (factors.daysInactive > 90) score += 40
  else if (factors.daysInactive > 60) score += 30
  else if (factors.daysInactive > 30) score += 20
  else if (factors.daysInactive > 14) score += 10

  // Activity trend (max 25 points)
  if (factors.activityTrend === 'declining') score += 25
  else if (factors.activityTrend === 'stable') score += 10

  // Engagement score inverse (max 20 points)
  if (factors.engagementScore < 20) score += 20
  else if (factors.engagementScore < 40) score += 15
  else if (factors.engagementScore < 60) score += 10
  else if (factors.engagementScore < 80) score += 5

  // Donation status (max 15 points)
  if (factors.donationStatus === 'lapsed') score += 15
  else if (factors.donationStatus === 'never') score += 8

  return Math.min(100, score) / 100
}

// Analyze activity trend over time
function analyzeActivityTrend(activities: MemberActivity[]): 'declining' | 'stable' | 'increasing' {
  if (activities.length < 2) return 'stable'

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const recentActivities = activities.filter(a => new Date(a.created_at) >= thirtyDaysAgo).length
  const olderActivities = activities.filter(a => {
    const date = new Date(a.created_at)
    return date >= sixtyDaysAgo && date < thirtyDaysAgo
  }).length

  if (recentActivities > olderActivities * 1.2) return 'increasing'
  if (recentActivities < olderActivities * 0.8) return 'declining'
  return 'stable'
}

// Generate AI recommendations for at-risk members
async function generateRetentionRecommendations(
  memberName: string,
  riskFactors: string[],
  engagementHistory: string
): Promise<string> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for TPC Ministries helping with member retention.
          Generate a brief, actionable pastoral recommendation (2-3 sentences) for re-engaging a member.
          Focus on spiritual care and genuine connection, not sales tactics.`
        },
        {
          role: 'user',
          content: `Member: ${memberName}
Risk factors: ${riskFactors.join(', ')}
Recent engagement: ${engagementHistory}

Suggest a specific, personalized way to reach out and reconnect with this member.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    })

    return response.choices[0]?.message?.content || 'Consider a personal phone call or email to check in.'
  } catch (error) {
    return 'Consider a personal phone call or email to check in on their spiritual journey.'
  }
}

// Predict optimal engagement times
function predictOptimalSendTime(activities: MemberActivity[]): { dayOfWeek: string; timeOfDay: string } {
  if (activities.length < 5) {
    return { dayOfWeek: 'Tuesday', timeOfDay: '10:00 AM' }
  }

  const dayCount: Record<number, number> = {}
  const hourCount: Record<number, number> = {}

  for (const activity of activities) {
    const date = new Date(activity.created_at)
    const day = date.getDay()
    const hour = date.getHours()

    dayCount[day] = (dayCount[day] || 0) + 1
    hourCount[hour] = (hourCount[hour] || 0) + 1
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const bestDay = Object.entries(dayCount).sort(([,a], [,b]) => b - a)[0]?.[0] || '2'
  const bestHour = Object.entries(hourCount).sort(([,a], [,b]) => b - a)[0]?.[0] || '10'

  const hour = parseInt(bestHour)
  const timeOfDay = hour < 12
    ? `${hour === 0 ? 12 : hour}:00 AM`
    : `${hour === 12 ? 12 : hour - 12}:00 PM`

  return {
    dayOfWeek: days[parseInt(bestDay)],
    timeOfDay
  }
}

// Forecast engagement for next 30 days
function forecastEngagement(
  currentScore: number,
  trend: 'declining' | 'stable' | 'increasing',
  recentActivityCount: number
): { projected30Day: number; confidence: number } {
  let projectedChange = 0
  let confidence = 70

  if (trend === 'increasing') {
    projectedChange = Math.min(30, recentActivityCount * 2)
    confidence = 80
  } else if (trend === 'declining') {
    projectedChange = -Math.min(25, 30 - recentActivityCount)
    confidence = 75
  } else {
    projectedChange = 0
    confidence = 85
  }

  return {
    projected30Day: Math.max(0, Math.min(100, currentScore + projectedChange)),
    confidence
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const predictions: any = {}

    // =====================================
    // CHURN PREDICTIONS
    // =====================================
    if (type === 'all' || type === 'churn') {
      const { data: members } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, tier, created_at')

      const churnRisks: any[] = []

      for (const member of members || []) {
        // Get member activity
        const { data: activities } = await supabase
          .from('member_activity')
          .select('activity_type, created_at')
          .eq('member_id', member.id)
          .order('created_at', { ascending: false })
          .limit(100)

        // Get last activity date
        const lastActivity = activities?.[0]?.created_at
        const daysInactive = lastActivity
          ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
          : 999

        // Get donation status
        const { data: donations } = await supabase
          .from('donations')
          .select('created_at')
          .eq('member_id', member.id)
          .order('created_at', { ascending: false })
          .limit(1)

        let donationStatus: 'active' | 'lapsed' | 'never' = 'never'
        if (donations?.length) {
          const lastDonation = new Date(donations[0].created_at)
          const daysSinceDonation = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24))
          donationStatus = daysSinceDonation > 90 ? 'lapsed' : 'active'
        }

        // Get engagement score
        const { data: profile } = await supabase
          .from('member_spiritual_profiles')
          .select('engagement_score')
          .eq('member_id', member.id)
          .single()

        const engagementScore = profile?.engagement_score || 0
        const activityTrend = analyzeActivityTrend((activities || []) as MemberActivity[])

        const factors: ChurnRiskFactors = {
          daysInactive,
          activityTrend,
          engagementScore,
          donationStatus,
          lastInteractionDays: daysInactive
        }

        const churnProbability = calculateChurnProbability(factors)

        // Only include members with significant churn risk
        if (churnProbability >= 0.3) {
          const riskFactors: string[] = []
          if (daysInactive > 14) riskFactors.push(`${daysInactive} days inactive`)
          if (activityTrend === 'declining') riskFactors.push('Declining engagement')
          if (engagementScore < 40) riskFactors.push('Low engagement score')
          if (donationStatus === 'lapsed') riskFactors.push('Lapsed donor')

          churnRisks.push({
            memberId: member.id,
            memberName: `${member.first_name} ${member.last_name}`,
            email: member.email,
            tier: member.tier || 'free',
            churnProbability: Math.round(churnProbability * 100),
            riskLevel: churnProbability >= 0.7 ? 'high' : churnProbability >= 0.5 ? 'medium' : 'low',
            riskFactors,
            daysInactive,
            engagementScore,
            optimalContactTime: predictOptimalSendTime((activities || []) as MemberActivity[])
          })
        }
      }

      // Sort by churn probability
      churnRisks.sort((a, b) => b.churnProbability - a.churnProbability)

      predictions.churn = {
        atRiskCount: churnRisks.length,
        highRisk: churnRisks.filter(m => m.riskLevel === 'high').length,
        mediumRisk: churnRisks.filter(m => m.riskLevel === 'medium').length,
        lowRisk: churnRisks.filter(m => m.riskLevel === 'low').length,
        members: churnRisks.slice(0, 20) // Top 20 at-risk
      }
    }

    // =====================================
    // ENGAGEMENT FORECASTS
    // =====================================
    if (type === 'all' || type === 'engagement') {
      const { data: recentActivity } = await supabase
        .from('member_activity')
        .select('member_id, activity_type, created_at')
        .gte('created_at', sixtyDaysAgo.toISOString())

      // Group by member
      const memberActivities: Record<string, MemberActivity[]> = {}
      for (const activity of recentActivity || []) {
        if (!memberActivities[activity.member_id]) {
          memberActivities[activity.member_id] = []
        }
        memberActivities[activity.member_id].push(activity)
      }

      // Calculate forecasts
      const forecasts: any[] = []

      for (const [memberId, activities] of Object.entries(memberActivities)) {
        const trend = analyzeActivityTrend(activities)
        const recentCount = activities.filter(a => new Date(a.created_at) >= thirtyDaysAgo).length

        // Get current engagement score
        const { data: profile } = await supabase
          .from('member_spiritual_profiles')
          .select('engagement_score')
          .eq('member_id', memberId)
          .single()

        const currentScore = profile?.engagement_score || Math.min(100, recentCount * 5)
        const forecast = forecastEngagement(currentScore, trend, recentCount)

        forecasts.push({
          memberId,
          currentScore,
          trend,
          recentActivityCount: recentCount,
          ...forecast
        })
      }

      // Aggregate insights
      const increasingCount = forecasts.filter(f => f.trend === 'increasing').length
      const decliningCount = forecasts.filter(f => f.trend === 'declining').length
      const avgCurrentScore = forecasts.length > 0
        ? Math.round(forecasts.reduce((sum, f) => sum + f.currentScore, 0) / forecasts.length)
        : 0
      const avgProjectedScore = forecasts.length > 0
        ? Math.round(forecasts.reduce((sum, f) => sum + f.projected30Day, 0) / forecasts.length)
        : 0

      predictions.engagement = {
        overview: {
          totalTracked: forecasts.length,
          increasingEngagement: increasingCount,
          decliningEngagement: decliningCount,
          stableEngagement: forecasts.length - increasingCount - decliningCount,
          avgCurrentScore,
          avgProjectedScore,
          projectedTrend: avgProjectedScore > avgCurrentScore ? 'up' : avgProjectedScore < avgCurrentScore ? 'down' : 'stable'
        },
        topGrowing: forecasts
          .filter(f => f.trend === 'increasing')
          .sort((a, b) => b.projected30Day - a.projected30Day)
          .slice(0, 10),
        needingAttention: forecasts
          .filter(f => f.trend === 'declining')
          .sort((a, b) => a.projected30Day - b.projected30Day)
          .slice(0, 10)
      }
    }

    // =====================================
    // CONTENT RECOMMENDATIONS
    // =====================================
    if (type === 'all' || type === 'content') {
      // Analyze search patterns for content gaps
      const { data: searches } = await supabase
        .from('search_logs')
        .select('query, results_count')
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Find searches with low results
      const lowResultSearches: Record<string, { count: number; avgResults: number }> = {}
      for (const search of searches || []) {
        const query = search.query?.toLowerCase().trim()
        if (query && (search.results_count || 0) < 3) {
          if (!lowResultSearches[query]) {
            lowResultSearches[query] = { count: 0, avgResults: 0 }
          }
          lowResultSearches[query].count++
          lowResultSearches[query].avgResults =
            (lowResultSearches[query].avgResults * (lowResultSearches[query].count - 1) + (search.results_count || 0)) /
            lowResultSearches[query].count
        }
      }

      const contentGaps = Object.entries(lowResultSearches)
        .filter(([, data]) => data.count >= 2)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([topic, data]) => ({
          topic,
          searchCount: data.count,
          avgResults: Math.round(data.avgResults * 10) / 10
        }))

      // Get top performing content
      const { data: teachings } = await supabase
        .from('teachings')
        .select('id, title, views, completion_rate')
        .order('views', { ascending: false })
        .limit(5)

      predictions.content = {
        gaps: contentGaps,
        recommendations: contentGaps.slice(0, 5).map(gap => ({
          topic: gap.topic,
          reason: `${gap.searchCount} members searched for this with few results`,
          suggestedType: 'Teaching or Blog Post'
        })),
        topPerforming: teachings || []
      }
    }

    // =====================================
    // REVENUE PREDICTIONS
    // =====================================
    if (type === 'all' || type === 'revenue') {
      // Get donation history
      const { data: donations } = await supabase
        .from('donations')
        .select('amount, created_at, member_id, is_recurring')
        .gte('created_at', new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      // Calculate monthly trends
      const monthlyTotals: Record<string, number> = {}
      for (const donation of donations || []) {
        const month = new Date(donation.created_at).toISOString().slice(0, 7)
        monthlyTotals[month] = (monthlyTotals[month] || 0) + (donation.amount || 0)
      }

      const months = Object.entries(monthlyTotals).sort(([a], [b]) => a.localeCompare(b))
      const lastMonth = months[months.length - 1]?.[1] || 0
      const prevMonth = months[months.length - 2]?.[1] || lastMonth

      // Simple linear projection
      const trend = lastMonth > prevMonth ? 'increasing' : lastMonth < prevMonth ? 'decreasing' : 'stable'
      const changeRate = prevMonth > 0 ? (lastMonth - prevMonth) / prevMonth : 0
      const projectedNextMonth = Math.round(lastMonth * (1 + changeRate * 0.5)) // Conservative projection

      // MRR calculation
      const { data: recurringDonations } = await supabase
        .from('donations')
        .select('amount')
        .eq('is_recurring', true)
        .eq('status', 'active')

      const currentMRR = (recurringDonations || []).reduce((sum, d) => sum + (d.amount || 0), 0)

      predictions.revenue = {
        currentMRR,
        lastMonthTotal: lastMonth,
        projectedNextMonth,
        trend,
        changePercentage: Math.round(changeRate * 100),
        monthlyHistory: months.map(([month, total]) => ({ month, total }))
      }
    }

    // =====================================
    // AI STRATEGIC RECOMMENDATIONS
    // =====================================
    if (type === 'all' || type === 'recommendations') {
      try {
        // Generate strategic recommendations based on all data
        const summaryData = {
          churnRisk: predictions.churn?.highRisk || 0,
          engagementTrend: predictions.engagement?.overview?.projectedTrend || 'stable',
          contentGaps: predictions.content?.gaps?.length || 0,
          revenueTrend: predictions.revenue?.trend || 'stable'
        }

        const response = await getOpenAI().chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a ministry growth strategist for TPC Ministries, a Christian ministry platform.
              Provide 3-5 specific, actionable strategic recommendations based on the analytics data.
              Focus on spiritual growth, member engagement, and sustainable ministry growth.
              Keep each recommendation brief (1-2 sentences) and actionable.
              Format as a JSON array of objects with "title" and "description" fields.`
            },
            {
              role: 'user',
              content: `Current ministry analytics:
- High churn risk members: ${summaryData.churnRisk}
- Overall engagement trend: ${summaryData.engagementTrend}
- Content gaps identified: ${summaryData.contentGaps}
- Revenue trend: ${summaryData.revenueTrend}

Generate strategic recommendations for the next 30 days.`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })

        const content = response.choices[0]?.message?.content || '[]'
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        predictions.recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : []
      } catch (error) {
        predictions.recommendations = [
          {
            title: 'Focus on At-Risk Members',
            description: 'Prioritize personal outreach to members showing declining engagement in the last 30 days.'
          },
          {
            title: 'Create Requested Content',
            description: 'Address the content gaps identified by member searches to improve engagement.'
          },
          {
            title: 'Strengthen Community Connections',
            description: 'Encourage members to join small groups or community features to build lasting relationships.'
          }
        ]
      }
    }

    return NextResponse.json(predictions)

  } catch (error) {
    console.error('Error generating predictions:', error)
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    )
  }
}

// Endpoint to get AI recommendations for a specific member
export async function POST(request: NextRequest) {
  try {
    const { memberId } = await request.json()

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }

    // Get member details
    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, tier')
      .eq('id', memberId)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get activity history
    const { data: activities } = await supabase
      .from('member_activity')
      .select('activity_type, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Analyze engagement
    const activityTypes = Array.from(new Set(activities?.map(a => a.activity_type) || []))
    const engagementHistory = activityTypes.length > 0
      ? `Active in: ${activityTypes.slice(0, 5).join(', ')}`
      : 'No recent activity recorded'

    // Calculate risk factors
    const now = new Date()
    const lastActivity = activities?.[0]?.created_at
    const daysInactive = lastActivity
      ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    const riskFactors: string[] = []
    if (daysInactive > 14) riskFactors.push(`${daysInactive} days since last activity`)
    if (activities && activities.length < 5) riskFactors.push('Low overall engagement')
    if (!activityTypes.includes('devotional_read')) riskFactors.push('Not using devotionals')
    if (!activityTypes.includes('teaching_viewed')) riskFactors.push('Not watching teachings')

    // Generate personalized recommendation
    const recommendation = await generateRetentionRecommendations(
      `${member.first_name} ${member.last_name}`,
      riskFactors,
      engagementHistory
    )

    // Calculate optimal contact time
    const optimalTime = predictOptimalSendTime((activities || []) as MemberActivity[])

    return NextResponse.json({
      member: {
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        tier: member.tier
      },
      analysis: {
        daysInactive,
        activityCount: activities?.length || 0,
        engagementAreas: activityTypes,
        riskFactors
      },
      recommendation,
      optimalContactTime: optimalTime
    })

  } catch (error) {
    console.error('Error getting member recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    )
  }
}

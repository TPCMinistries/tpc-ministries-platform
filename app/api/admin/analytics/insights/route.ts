import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Insight {
  type: 'success' | 'warning' | 'info' | 'prediction'
  category: 'growth' | 'engagement' | 'revenue' | 'content' | 'members'
  title: string
  description: string
  metric?: string
  change?: number
  recommendation?: string
  confidence?: number
}

interface Prediction {
  type: 'giving' | 'growth' | 'churn' | 'engagement'
  title: string
  prediction: string
  confidence: number
  trend: 'up' | 'down' | 'stable'
  recommendation: string
}

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const insights: Insight[] = []
    const predictions: Prediction[] = []

    // =====================================
    // GATHER DATA FOR ANALYSIS
    // =====================================

    // Total members
    const { count: totalMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })

    // New members last 30 days
    const { count: newMembersLast30 } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    // New members 30-60 days ago
    const { count: newMembersPrev30 } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())

    // Active members last 30 days
    const { data: activeMembers } = await supabase
      .from('member_activity')
      .select('member_id')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const uniqueActiveCount = new Set(activeMembers?.map(a => a.member_id) || []).size

    // Revenue last 30 days
    const { data: revenueData } = await supabase
      .from('donations')
      .select('amount, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const revenueLast30 = (revenueData || []).reduce((sum, d) => sum + (d.amount || 0), 0)

    // Revenue 30-60 days ago
    const { data: revenuePrevData } = await supabase
      .from('donations')
      .select('amount')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())

    const revenuePrev30 = (revenuePrevData || []).reduce((sum, d) => sum + (d.amount || 0), 0)

    // Members by tier
    const { data: tierData } = await supabase
      .from('members')
      .select('tier')

    const tiers = { free: 0, partner: 0, covenant: 0 }
    for (const m of tierData || []) {
      const tier = m.tier || 'free'
      tiers[tier as keyof typeof tiers]++
    }

    // At-risk members (inactive 30+ days)
    const { data: allMembersList } = await supabase
      .from('members')
      .select('id')
      .limit(100)

    let atRiskCount = 0
    for (const member of allMembersList || []) {
      const { data: lastActivity } = await supabase
        .from('member_activity')
        .select('created_at')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!lastActivity?.length) {
        atRiskCount++
      } else {
        const lastDate = new Date(lastActivity[0].created_at)
        if (now.getTime() - lastDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
          atRiskCount++
        }
      }
      if (atRiskCount >= 20) break
    }

    // =====================================
    // GENERATE AUTOMATED INSIGHTS
    // =====================================

    // Member Growth Analysis
    const memberGrowthRate = newMembersPrev30 ? ((newMembersLast30 || 0) - newMembersPrev30) / newMembersPrev30 * 100 : 0

    if (memberGrowthRate > 20) {
      insights.push({
        type: 'success',
        category: 'growth',
        title: 'Strong Member Growth',
        description: `Member acquisition has increased by ${Math.round(memberGrowthRate)}% compared to the previous period.`,
        metric: `+${newMembersLast30} new members`,
        change: memberGrowthRate,
        recommendation: 'Consider launching a referral program to capitalize on this momentum.'
      })
    } else if (memberGrowthRate < -20) {
      insights.push({
        type: 'warning',
        category: 'growth',
        title: 'Member Growth Decline',
        description: `Member acquisition has decreased by ${Math.abs(Math.round(memberGrowthRate))}% compared to the previous period.`,
        metric: `${newMembersLast30} new members`,
        change: memberGrowthRate,
        recommendation: 'Review your outreach campaigns and consider running a welcome promotion.'
      })
    }

    // Engagement Analysis
    const engagementRate = totalMembers ? Math.round((uniqueActiveCount / totalMembers) * 100) : 0

    if (engagementRate < 30) {
      insights.push({
        type: 'warning',
        category: 'engagement',
        title: 'Low Engagement Rate',
        description: `Only ${engagementRate}% of members have been active in the last 30 days.`,
        metric: `${uniqueActiveCount}/${totalMembers} active`,
        recommendation: 'Consider sending re-engagement emails with personalized content recommendations.'
      })
    } else if (engagementRate > 60) {
      insights.push({
        type: 'success',
        category: 'engagement',
        title: 'Excellent Engagement',
        description: `${engagementRate}% of members are actively engaged with the platform.`,
        metric: `${uniqueActiveCount} active members`,
        recommendation: 'Consider introducing gamification features to maintain high engagement.'
      })
    }

    // Revenue Analysis
    const revenueChange = revenuePrev30 ? ((revenueLast30 - revenuePrev30) / revenuePrev30) * 100 : 0

    if (revenueChange > 15) {
      insights.push({
        type: 'success',
        category: 'revenue',
        title: 'Revenue Growth',
        description: `Giving has increased by ${Math.round(revenueChange)}% compared to the previous period.`,
        metric: `$${revenueLast30.toLocaleString()}`,
        change: revenueChange,
        recommendation: 'Consider launching a special giving campaign to build on this momentum.'
      })
    } else if (revenueChange < -15) {
      insights.push({
        type: 'warning',
        category: 'revenue',
        title: 'Revenue Decline',
        description: `Giving has decreased by ${Math.abs(Math.round(revenueChange))}% compared to the previous period.`,
        metric: `$${revenueLast30.toLocaleString()}`,
        change: revenueChange,
        recommendation: 'Consider sending personalized giving reminders to regular donors.'
      })
    }

    // At-Risk Members Analysis
    const atRiskPercentage = totalMembers ? (atRiskCount / totalMembers) * 100 : 0

    if (atRiskPercentage > 20) {
      insights.push({
        type: 'warning',
        category: 'members',
        title: 'High Churn Risk',
        description: `${Math.round(atRiskPercentage)}% of members haven't engaged in 30+ days.`,
        metric: `${atRiskCount} at-risk members`,
        recommendation: 'Send personalized re-engagement emails with exclusive content or offers.'
      })
    }

    // Tier Distribution Analysis
    const paidPercentage = totalMembers ? ((tiers.partner + tiers.covenant) / totalMembers) * 100 : 0

    if (paidPercentage < 10) {
      insights.push({
        type: 'info',
        category: 'revenue',
        title: 'Upgrade Opportunity',
        description: `Only ${Math.round(paidPercentage)}% of members are on paid tiers.`,
        metric: `${tiers.free} free members`,
        recommendation: 'Consider creating a limited-time upgrade offer for free members.'
      })
    } else if (paidPercentage > 30) {
      insights.push({
        type: 'success',
        category: 'revenue',
        title: 'Strong Paid Conversion',
        description: `${Math.round(paidPercentage)}% of members are on paid tiers.`,
        metric: `${tiers.partner + tiers.covenant} paid members`,
        recommendation: 'Explore adding premium features for Covenant Partners to increase upgrades.'
      })
    }

    // =====================================
    // GENERATE PREDICTIONS
    // =====================================

    // Giving Forecast
    const avgDailyGiving = revenueLast30 / 30
    const projectedMonthlyGiving = avgDailyGiving * 30
    const givingTrend = revenueChange > 5 ? 'up' : revenueChange < -5 ? 'down' : 'stable'

    predictions.push({
      type: 'giving',
      title: 'Next Month Giving Forecast',
      prediction: `$${Math.round(projectedMonthlyGiving).toLocaleString()}`,
      confidence: 75,
      trend: givingTrend,
      recommendation: givingTrend === 'up'
        ? 'Consider launching a special campaign to maximize giving during this strong period.'
        : givingTrend === 'down'
          ? 'Focus on donor retention and personalized thank-you messages.'
          : 'Maintain current giving initiatives and monitor closely.'
    })

    // Member Growth Forecast
    const avgDailyNewMembers = (newMembersLast30 || 0) / 30
    const projectedNewMembers = Math.round(avgDailyNewMembers * 30)
    const growthTrend = memberGrowthRate > 10 ? 'up' : memberGrowthRate < -10 ? 'down' : 'stable'

    predictions.push({
      type: 'growth',
      title: 'Next Month New Members',
      prediction: `+${projectedNewMembers} members`,
      confidence: 70,
      trend: growthTrend,
      recommendation: growthTrend === 'up'
        ? 'Prepare for increased onboarding needs and welcome sequences.'
        : growthTrend === 'down'
          ? 'Increase marketing efforts and consider referral incentives.'
          : 'Continue current acquisition strategies.'
    })

    // Churn Prediction
    const projectedChurn = Math.round(atRiskCount * 0.3)
    const churnTrend = atRiskPercentage > 25 ? 'up' : atRiskPercentage < 15 ? 'down' : 'stable'

    predictions.push({
      type: 'churn',
      title: 'Predicted Member Churn',
      prediction: `~${projectedChurn} members may leave`,
      confidence: 65,
      trend: churnTrend,
      recommendation: churnTrend === 'up'
        ? 'Urgently reach out to at-risk members with personalized engagement.'
        : 'Continue monitoring inactive members and send check-in messages.'
    })

    // Engagement Prediction
    const engagementTrend = engagementRate > 50 ? 'up' : engagementRate < 30 ? 'down' : 'stable'

    predictions.push({
      type: 'engagement',
      title: 'Engagement Outlook',
      prediction: engagementTrend === 'up'
        ? 'Engagement likely to remain strong'
        : engagementTrend === 'down'
          ? 'Engagement may continue declining'
          : 'Engagement expected to remain stable',
      confidence: 60,
      trend: engagementTrend,
      recommendation: engagementTrend === 'down'
        ? 'Launch new content or features to re-engage members.'
        : 'Maintain current engagement strategies.'
    })

    // =====================================
    // AI SUMMARY (using simple template for now)
    // =====================================

    const positiveInsights = insights.filter(i => i.type === 'success').length
    const warningInsights = insights.filter(i => i.type === 'warning').length

    let summaryTone: 'positive' | 'concerning' | 'neutral'
    if (positiveInsights > warningInsights) {
      summaryTone = 'positive'
    } else if (warningInsights > positiveInsights) {
      summaryTone = 'concerning'
    } else {
      summaryTone = 'neutral'
    }

    const summary = generateSummary({
      totalMembers: totalMembers || 0,
      newMembers: newMembersLast30 || 0,
      engagementRate,
      revenue: revenueLast30,
      revenueChange,
      atRiskCount,
      summaryTone
    })

    return NextResponse.json({
      insights,
      predictions,
      summary,
      generatedAt: new Date().toISOString(),
      stats: {
        totalMembers: totalMembers || 0,
        activeMembers: uniqueActiveCount,
        engagementRate,
        monthlyRevenue: revenueLast30,
        atRiskMembers: atRiskCount,
        paidMembers: tiers.partner + tiers.covenant
      }
    })

  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

function generateSummary(data: {
  totalMembers: number
  newMembers: number
  engagementRate: number
  revenue: number
  revenueChange: number
  atRiskCount: number
  summaryTone: 'positive' | 'concerning' | 'neutral'
}): string {
  const { totalMembers, newMembers, engagementRate, revenue, revenueChange, atRiskCount, summaryTone } = data

  if (summaryTone === 'positive') {
    return `Great news! Your ministry is showing strong performance this month. ` +
      `You've welcomed ${newMembers} new members, bringing your total to ${totalMembers.toLocaleString()}. ` +
      `Engagement is at ${engagementRate}% with giving ${revenueChange > 0 ? 'up' : 'holding steady'} at $${revenue.toLocaleString()}. ` +
      `Keep up the great work and consider capitalizing on this momentum with a special campaign.`
  } else if (summaryTone === 'concerning') {
    return `This month shows some areas that need attention. ` +
      `While you've added ${newMembers} new members, ${atRiskCount} members are at risk of disengaging. ` +
      `Engagement is at ${engagementRate}% and giving is ${revenueChange < 0 ? 'down' : 'stable'} at $${revenue.toLocaleString()}. ` +
      `Consider focusing on member retention and re-engagement campaigns to turn these trends around.`
  } else {
    return `Your ministry metrics are stable this month. ` +
      `You've added ${newMembers} new members with ${engagementRate}% engagement and $${revenue.toLocaleString()} in giving. ` +
      `To drive growth, consider launching new initiatives for member engagement and community building.`
  }
}

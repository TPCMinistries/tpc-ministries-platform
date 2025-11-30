import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

function getSupabase() { return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!); }

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// AI-Powered Giving Forecasting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '6') // Forecast months ahead

    const now = new Date()

    // Get historical donation data (last 12 months)
    const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

    const { data: donations } = await supabase
      .from('donations')
      .select('amount, created_at, is_recurring, member_id, fund_name')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Group donations by month
    const monthlyTotals: Record<string, { total: number, count: number, recurring: number, oneTime: number }> = {}

    for (const d of donations || []) {
      const month = new Date(d.created_at).toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { total: 0, count: 0, recurring: 0, oneTime: 0 }
      }
      monthlyTotals[month].total += d.amount || 0
      monthlyTotals[month].count++
      if (d.is_recurring) {
        monthlyTotals[month].recurring += d.amount || 0
      } else {
        monthlyTotals[month].oneTime += d.amount || 0
      }
    }

    // Calculate historical statistics
    const monthlyData = Object.entries(monthlyTotals)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    const recentMonths = monthlyData.slice(-6)
    const avgMonthlyTotal = recentMonths.length > 0
      ? recentMonths.reduce((sum, m) => sum + m.total, 0) / recentMonths.length
      : 0

    const avgMonthlyRecurring = recentMonths.length > 0
      ? recentMonths.reduce((sum, m) => sum + m.recurring, 0) / recentMonths.length
      : 0

    // Calculate trend (simple linear regression)
    let trend = 0
    if (recentMonths.length >= 3) {
      const n = recentMonths.length
      const sumX = (n * (n - 1)) / 2
      const sumY = recentMonths.reduce((sum, m) => sum + m.total, 0)
      const sumXY = recentMonths.reduce((sum, m, i) => sum + i * m.total, 0)
      const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

      trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    }

    // Get current MRR from recurring donations
    const { data: activeRecurring } = await supabase
      .from('donations')
      .select('amount')
      .eq('is_recurring', true)
      .eq('status', 'active')

    const currentMRR = activeRecurring?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

    // Get member tier counts for membership revenue
    const { data: tierData } = await supabase
      .from('members')
      .select('tier')

    const tiers = { free: 0, partner: 0, covenant: 0 }
    for (const m of tierData || []) {
      const tier = (m.tier || 'free') as keyof typeof tiers
      tiers[tier] = (tiers[tier] || 0) + 1
    }

    const membershipMRR = (tiers.partner * 50) + (tiers.covenant * 150)

    // Generate forecasts
    const forecasts: { month: string; projected: number; confidence: number; breakdown: any }[] = []

    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const month = forecastDate.toISOString().slice(0, 7)

      // Base projection on trend and recurring
      const recurringRevenue = currentMRR + membershipMRR
      const projectedOneTime = avgMonthlyTotal - avgMonthlyRecurring
      const trendAdjustment = trend * (recentMonths.length + i)

      // Apply seasonality (basic - could be enhanced with more data)
      const monthNum = forecastDate.getMonth()
      let seasonalMultiplier = 1

      // Higher giving around holidays/year-end
      if (monthNum === 11) seasonalMultiplier = 1.3 // December
      if (monthNum === 10) seasonalMultiplier = 1.1 // November
      if (monthNum === 0) seasonalMultiplier = 0.9  // January
      if (monthNum === 6 || monthNum === 7) seasonalMultiplier = 0.85 // Summer

      const projected = Math.max(0, (recurringRevenue + projectedOneTime + trendAdjustment) * seasonalMultiplier)

      // Confidence decreases further into future
      const confidence = Math.max(50, 95 - (i * 7))

      forecasts.push({
        month,
        projected: Math.round(projected),
        confidence,
        breakdown: {
          recurring: Math.round(recurringRevenue),
          projected_onetime: Math.round(projectedOneTime * seasonalMultiplier),
          seasonal_factor: seasonalMultiplier
        }
      })
    }

    // Calculate YTD and projected annual
    const currentYear = now.getFullYear()
    const ytdData = monthlyData.filter(m => m.month.startsWith(String(currentYear)))
    const ytdTotal = ytdData.reduce((sum, m) => sum + m.total, 0)

    const remainingMonthsThisYear = 12 - (now.getMonth() + 1)
    const projectedRemaining = forecasts
      .slice(0, remainingMonthsThisYear)
      .reduce((sum, f) => sum + f.projected, 0)

    const projectedAnnual = ytdTotal + projectedRemaining

    // Get giving by fund for pie chart
    const fundTotals: Record<string, number> = {}
    for (const d of donations || []) {
      const fund = d.fund_name || 'General'
      fundTotals[fund] = (fundTotals[fund] || 0) + (d.amount || 0)
    }

    // Get top donors (anonymous)
    const donorTotals: Record<string, number> = {}
    for (const d of donations || []) {
      if (d.member_id) {
        donorTotals[d.member_id] = (donorTotals[d.member_id] || 0) + (d.amount || 0)
      }
    }

    const topDonorCount = Object.values(donorTotals).filter(v => v > 500).length

    // Generate AI insights
    let aiInsights = ''
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Generate 2-3 brief, actionable insights about giving trends for a ministry leader. Be specific and data-driven.'
          },
          {
            role: 'user',
            content: `Giving data analysis:
- Current MRR: $${currentMRR.toLocaleString()}
- Membership MRR: $${membershipMRR.toLocaleString()}
- Average monthly: $${avgMonthlyTotal.toLocaleString()}
- Trend: ${trend > 0 ? 'Increasing' : trend < 0 ? 'Decreasing' : 'Stable'} ($${Math.abs(Math.round(trend)).toLocaleString()}/month)
- YTD Total: $${ytdTotal.toLocaleString()}
- Projected Annual: $${projectedAnnual.toLocaleString()}
- Partners: ${tiers.partner}, Covenant Partners: ${tiers.covenant}
- Top donors (>$500): ${topDonorCount}

Provide specific recommendations to improve giving.`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
      aiInsights = response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error generating AI insights:', error)
    }

    return NextResponse.json({
      current: {
        mrr: currentMRR,
        membershipMRR,
        totalMRR: currentMRR + membershipMRR,
        avgMonthlyTotal: Math.round(avgMonthlyTotal),
        trend: {
          direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
          amount: Math.round(trend),
          percentage: avgMonthlyTotal > 0 ? ((trend / avgMonthlyTotal) * 100).toFixed(1) : 0
        }
      },
      membership: {
        partners: tiers.partner,
        covenantPartners: tiers.covenant,
        partnerMRR: tiers.partner * 50,
        covenantMRR: tiers.covenant * 150
      },
      annual: {
        ytdTotal: Math.round(ytdTotal),
        projectedAnnual: Math.round(projectedAnnual),
        goalProgress: 100000 > 0 ? ((ytdTotal / 100000) * 100).toFixed(1) : 0 // Assuming 100k goal
      },
      historical: monthlyData.slice(-12),
      forecasts,
      byFund: Object.entries(fundTotals)
        .map(([fund, total]) => ({ fund, total, percentage: ((total / (donations?.reduce((s, d) => s + (d.amount || 0), 0) || 1)) * 100).toFixed(1) }))
        .sort((a, b) => b.total - a.total),
      insights: aiInsights,
      metrics: {
        totalDonors: Object.keys(donorTotals).length,
        avgDonation: donations?.length ? Math.round((donations.reduce((s, d) => s + (d.amount || 0), 0)) / donations.length) : 0,
        topDonorCount,
        recurringDonorCount: new Set(donations?.filter(d => d.is_recurring).map(d => d.member_id)).size
      }
    })

  } catch (error) {
    console.error('Error generating forecast:', error)
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 })
  }
}

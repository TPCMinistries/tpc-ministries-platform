import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section') || 'all'

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const analytics: any = {}

    // =====================================
    // MEMBER METRICS
    // =====================================
    if (section === 'all' || section === 'members') {
      // Total members
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })

      // New members this week
      const { count: newThisWeek } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      // New members this month
      const { count: newThisMonth } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

      // Active members (last 30 days)
      const { data: activeData } = await supabase
        .from('member_activity')
        .select('member_id')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const uniqueActiveMembers = new Set(activeData?.map(a => a.member_id) || []).size

      // Members by tier
      const { data: tierData } = await supabase
        .from('members')
        .select('tier')

      const tiers = { free: 0, partner: 0, covenant: 0 }
      for (const m of tierData || []) {
        const tier = m.tier || 'free'
        tiers[tier as keyof typeof tiers] = (tiers[tier as keyof typeof tiers] || 0) + 1
      }

      // Engagement rate
      const engagementRate = totalMembers && totalMembers > 0
        ? Math.round((uniqueActiveMembers / totalMembers) * 100)
        : 0

      // Most active members
      const { data: activityCounts } = await supabase
        .from('member_activity')
        .select('member_id')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const memberActivityCounts: Record<string, number> = {}
      for (const a of activityCounts || []) {
        memberActivityCounts[a.member_id] = (memberActivityCounts[a.member_id] || 0) + 1
      }

      const topMemberIds = Object.entries(memberActivityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id)

      let mostActiveMembers: any[] = []
      if (topMemberIds.length > 0) {
        const { data: topMembers } = await supabase
          .from('members')
          .select('id, first_name, last_name')
          .in('id', topMemberIds)

        mostActiveMembers = (topMembers || []).map(m => ({
          id: m.id,
          name: `${m.first_name} ${m.last_name}`,
          actions: memberActivityCounts[m.id] || 0,
          score: Math.min(100, Math.round((memberActivityCounts[m.id] || 0) / 2))
        })).sort((a, b) => b.actions - a.actions)
      }

      // At-risk members (inactive 30+ days)
      const { data: allMembers } = await supabase
        .from('members')
        .select('id, first_name, last_name')

      const atRiskMembers: any[] = []
      for (const member of allMembers || []) {
        const { data: lastActivity } = await supabase
          .from('member_activity')
          .select('created_at, activity_type')
          .eq('member_id', member.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (!lastActivity?.length) {
          atRiskMembers.push({
            id: member.id,
            name: `${member.first_name} ${member.last_name}`,
            daysInactive: 999,
            lastAction: 'Never active'
          })
        } else {
          const lastDate = new Date(lastActivity[0].created_at)
          const daysInactive = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysInactive >= 30) {
            atRiskMembers.push({
              id: member.id,
              name: `${member.first_name} ${member.last_name}`,
              daysInactive,
              lastAction: lastActivity[0].activity_type?.replace(/_/g, ' ') || 'Activity'
            })
          }
        }
        if (atRiskMembers.length >= 10) break
      }

      analytics.members = {
        total: totalMembers || 0,
        newThisWeek: newThisWeek || 0,
        newThisMonth: newThisMonth || 0,
        activeMembers: uniqueActiveMembers,
        engagementRate,
        byTier: tiers,
        mostActive: mostActiveMembers.slice(0, 5),
        atRisk: atRiskMembers.sort((a, b) => b.daysInactive - a.daysInactive).slice(0, 5)
      }
    }

    // =====================================
    // CONTENT METRICS
    // =====================================
    if (section === 'all' || section === 'content') {
      // Most viewed teachings
      const { data: teachings } = await supabase
        .from('teachings')
        .select('id, title, views, completion_rate')
        .order('views', { ascending: false })
        .limit(5)

      // Most listened prophecies
      const { data: prophecies } = await supabase
        .from('prophecies')
        .select('id, title, listen_count, avg_listen_time')
        .order('listen_count', { ascending: false })
        .limit(5)

      // Search trends
      const { data: searchData } = await supabase
        .from('search_logs')
        .select('query')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const searchCounts: Record<string, number> = {}
      for (const s of searchData || []) {
        const q = s.query?.toLowerCase().trim()
        if (q) searchCounts[q] = (searchCounts[q] || 0) + 1
      }

      const searchTrends = Object.entries(searchCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([keyword, searches]) => ({ keyword, searches }))

      // Total teachings
      const { count: totalTeachings } = await supabase
        .from('teachings')
        .select('*', { count: 'exact', head: true })

      // Total devotionals read
      const { count: devotionalsRead } = await supabase
        .from('member_activity')
        .select('*', { count: 'exact', head: true })
        .eq('activity_type', 'devotional_read')
        .gte('created_at', thirtyDaysAgo.toISOString())

      analytics.content = {
        teachings: {
          total: totalTeachings || 0,
          mostViewed: (teachings || []).map(t => ({
            id: t.id,
            title: t.title,
            views: t.views || 0,
            completionRate: t.completion_rate || 70
          })),
          avgCompletionRate: teachings?.length
            ? Math.round(teachings.reduce((sum, t) => sum + (t.completion_rate || 70), 0) / teachings.length)
            : 75
        },
        prophecies: {
          mostListened: (prophecies || []).map(p => ({
            id: p.id,
            title: p.title,
            listens: p.listen_count || 0,
            avgListenTime: p.avg_listen_time || '10:00'
          }))
        },
        searchTrends,
        devotionalsRead: devotionalsRead || 0
      }
    }

    // =====================================
    // REVENUE METRICS
    // =====================================
    if (section === 'all' || section === 'revenue') {
      // This month's donations
      const { data: thisMonthDonations } = await supabase
        .from('donations')
        .select('amount, donation_type')
        .gte('created_at', startOfMonth.toISOString())

      // Last month's donations
      const { data: lastMonthDonations } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', startOfLastMonth.toISOString())
        .lte('created_at', endOfLastMonth.toISOString())

      const thisMonthTotal = (thisMonthDonations || []).reduce((sum, d) => sum + (d.amount || 0), 0)
      const lastMonthTotal = (lastMonthDonations || []).reduce((sum, d) => sum + (d.amount || 0), 0)
      const revenueChange = lastMonthTotal > 0
        ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 * 10) / 10
        : 0

      // MRR from recurring donations/memberships
      const { data: recurringData } = await supabase
        .from('donations')
        .select('amount')
        .eq('is_recurring', true)
        .eq('status', 'active')

      const mrr = (recurringData || []).reduce((sum, d) => sum + (d.amount || 0), 0)

      // Revenue by tier
      const partnerCount = analytics.members?.byTier?.partner || 0
      const covenantCount = analytics.members?.byTier?.covenant || 0
      const partnerMRR = partnerCount * 50 // Assuming $50/month for partners
      const covenantMRR = covenantCount * 150 // Assuming $150/month for covenant

      // Donations by mission/fund
      const { data: missionDonations } = await supabase
        .from('donations')
        .select('fund_name, amount')
        .gte('created_at', startOfMonth.toISOString())

      const byMission: Record<string, { amount: number; count: number }> = {}
      for (const d of missionDonations || []) {
        const fund = d.fund_name || 'General'
        if (!byMission[fund]) byMission[fund] = { amount: 0, count: 0 }
        byMission[fund].amount += d.amount || 0
        byMission[fund].count += 1
      }

      analytics.revenue = {
        thisMonth: thisMonthTotal,
        lastMonth: lastMonthTotal,
        change: revenueChange,
        trend: thisMonthTotal >= lastMonthTotal ? 'up' : 'down',
        mrr: mrr || partnerMRR + covenantMRR,
        byTier: {
          partner: { mrr: partnerMRR, count: partnerCount },
          covenant: { mrr: covenantMRR, count: covenantCount }
        },
        byMission: Object.entries(byMission).map(([location, data]) => ({
          location,
          amount: data.amount,
          donations: data.count
        })),
        avgLifetimeValue: analytics.members?.total > 0
          ? Math.round((thisMonthTotal * 12) / analytics.members.total)
          : 0
      }
    }

    // =====================================
    // ENGAGEMENT METRICS
    // =====================================
    if (section === 'all' || section === 'engagement') {
      // Daily active users
      const { data: dauData } = await supabase
        .from('member_activity')
        .select('member_id')
        .gte('created_at', oneDayAgo.toISOString())

      const dau = new Set(dauData?.map(a => a.member_id) || []).size

      // Weekly active users
      const { data: wauData } = await supabase
        .from('member_activity')
        .select('member_id')
        .gte('created_at', sevenDaysAgo.toISOString())

      const wau = new Set(wauData?.map(a => a.member_id) || []).size

      // Monthly active users
      const { data: mauData } = await supabase
        .from('member_activity')
        .select('member_id')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const mau = new Set(mauData?.map(a => a.member_id) || []).size

      // Feature usage
      const { data: featureData } = await supabase
        .from('member_activity')
        .select('activity_type')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const featureCounts: Record<string, number> = {}
      for (const a of featureData || []) {
        featureCounts[a.activity_type] = (featureCounts[a.activity_type] || 0) + 1
      }

      const featureLabels: Record<string, string> = {
        devotional_read: 'Daily Devotionals',
        teaching_viewed: 'Teachings Library',
        prayer_submitted: 'Prayer Requests',
        prophecy_viewed: 'Prophetic Words',
        ai_chat: 'Ask Prophet Lorenzo',
        journal_entry: 'Journaling',
        course_progress: 'PLANT Learning',
        group_activity: 'Community Groups'
      }

      const totalFeatureUsage = Object.values(featureCounts).reduce((a, b) => a + b, 0) || 1

      const topFeatures = Object.entries(featureCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([feature, usage]) => ({
          feature: featureLabels[feature] || feature.replace(/_/g, ' '),
          usage,
          percentage: Math.round((usage / totalFeatureUsage) * 100)
        }))

      // AI chat count
      const aiChats = featureCounts['ai_chat'] || 0

      analytics.engagement = {
        dau,
        wau,
        mau,
        avgSessionDuration: '15:30', // Would need real session tracking
        topFeatures,
        aiChats,
        prayerRequests: featureCounts['prayer_submitted'] || 0,
        journalEntries: featureCounts['journal_entry'] || 0
      }
    }

    // =====================================
    // GROWTH TRENDS (Historical)
    // =====================================
    if (section === 'all' || section === 'growth') {
      // Get member growth over last 90 days
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

      const { data: memberGrowth } = await supabase
        .from('members')
        .select('created_at')
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      // Group by week
      const weeklyGrowth: Record<string, number> = {}
      for (const m of memberGrowth || []) {
        const date = new Date(m.created_at)
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
        const weekKey = weekStart.toISOString().split('T')[0]
        weeklyGrowth[weekKey] = (weeklyGrowth[weekKey] || 0) + 1
      }

      analytics.growth = {
        weekly: Object.entries(weeklyGrowth).map(([week, count]) => ({
          week,
          newMembers: count
        }))
      }
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

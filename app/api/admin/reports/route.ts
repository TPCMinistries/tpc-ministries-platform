import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() { return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!); }

// Exportable Ministry Reports API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get('endDate') || new Date().toISOString()
    const format = searchParams.get('format') || 'json' // json, csv

    const report: any = {
      generatedAt: new Date().toISOString(),
      reportType,
      dateRange: { startDate, endDate }
    }

    switch (reportType) {
      case 'overview':
      case 'board': {
        // Comprehensive board report

        // Member stats
        const { count: totalMembers } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })

        const { count: newMembers } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        const { data: tierData } = await supabase
          .from('members')
          .select('tier')

        const tiers = { free: 0, partner: 0, covenant: 0 }
        for (const m of tierData || []) {
          const tier = (m.tier || 'free') as keyof typeof tiers
          tiers[tier] = (tiers[tier] || 0) + 1
        }

        // Revenue
        const { data: donations } = await supabase
          .from('donations')
          .select('amount, donation_type, fund_name, created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        const totalRevenue = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
        const avgDonation = donations?.length ? totalRevenue / donations.length : 0

        const revenueByFund: Record<string, number> = {}
        for (const d of donations || []) {
          const fund = d.fund_name || 'General'
          revenueByFund[fund] = (revenueByFund[fund] || 0) + (d.amount || 0)
        }

        // Engagement
        const { data: activities } = await supabase
          .from('member_activity')
          .select('member_id, activity_type')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        const uniqueActiveMembers = new Set(activities?.map(a => a.member_id)).size
        const engagementRate = totalMembers ? Math.round((uniqueActiveMembers / totalMembers) * 100) : 0

        const activityBreakdown: Record<string, number> = {}
        for (const a of activities || []) {
          activityBreakdown[a.activity_type] = (activityBreakdown[a.activity_type] || 0) + 1
        }

        // Prayer stats
        const { count: totalPrayers } = await supabase
          .from('prayer_requests')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        const { count: answeredPrayers } = await supabase
          .from('prayer_requests')
          .select('*', { count: 'exact', head: true })
          .eq('is_answered', true)
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        // Content stats
        const { count: teachingsWatched } = await supabase
          .from('member_activity')
          .select('*', { count: 'exact', head: true })
          .eq('activity_type', 'teaching_viewed')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        const { count: devotionalsRead } = await supabase
          .from('member_activity')
          .select('*', { count: 'exact', head: true })
          .eq('activity_type', 'devotional_read')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        report.data = {
          membership: {
            total: totalMembers || 0,
            new: newMembers || 0,
            byTier: tiers,
            growthRate: totalMembers && newMembers ? `${((newMembers / totalMembers) * 100).toFixed(1)}%` : '0%'
          },
          financial: {
            totalRevenue,
            donationCount: donations?.length || 0,
            averageDonation: Math.round(avgDonation * 100) / 100,
            byFund: Object.entries(revenueByFund).map(([fund, amount]) => ({ fund, amount })),
            partnerMRR: tiers.partner * 50, // Assuming $50/month
            covenantMRR: tiers.covenant * 150 // Assuming $150/month
          },
          engagement: {
            activeMembers: uniqueActiveMembers,
            engagementRate: `${engagementRate}%`,
            totalActivities: activities?.length || 0,
            byActivityType: Object.entries(activityBreakdown)
              .map(([type, count]) => ({ type, count }))
              .sort((a, b) => b.count - a.count)
          },
          spiritual: {
            prayerRequests: totalPrayers || 0,
            answeredPrayers: answeredPrayers || 0,
            answerRate: totalPrayers ? `${((answeredPrayers || 0) / totalPrayers * 100).toFixed(1)}%` : '0%',
            teachingsWatched: teachingsWatched || 0,
            devotionalsRead: devotionalsRead || 0
          }
        }
        break
      }

      case 'members': {
        const { data: members } = await supabase
          .from('members')
          .select('id, first_name, last_name, email, tier, created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false })

        report.data = {
          count: members?.length || 0,
          members: members?.map(m => ({
            name: `${m.first_name} ${m.last_name}`,
            email: m.email,
            tier: m.tier || 'free',
            joinedDate: m.created_at
          })) || []
        }
        break
      }

      case 'donations': {
        const { data: donations } = await supabase
          .from('donations')
          .select(`
            id, amount, donation_type, fund_name, created_at, is_recurring,
            members (first_name, last_name, email)
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false })

        const total = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

        report.data = {
          totalAmount: total,
          count: donations?.length || 0,
          donations: donations?.map(d => ({
            amount: d.amount,
            type: d.donation_type,
            fund: d.fund_name || 'General',
            recurring: d.is_recurring,
            donor: (d.members as any)?.first_name ? `${(d.members as any).first_name} ${(d.members as any).last_name}` : 'Anonymous',
            date: d.created_at
          })) || []
        }
        break
      }

      case 'engagement': {
        const { data: activities } = await supabase
          .from('member_activity')
          .select('member_id, activity_type, created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        // Group by day
        const dailyActivity: Record<string, number> = {}
        for (const a of activities || []) {
          const day = new Date(a.created_at).toISOString().split('T')[0]
          dailyActivity[day] = (dailyActivity[day] || 0) + 1
        }

        // Group by type
        const byType: Record<string, number> = {}
        for (const a of activities || []) {
          byType[a.activity_type] = (byType[a.activity_type] || 0) + 1
        }

        report.data = {
          totalActivities: activities?.length || 0,
          uniqueMembers: new Set(activities?.map(a => a.member_id)).size,
          byDay: Object.entries(dailyActivity)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date)),
          byType: Object.entries(byType)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
        }
        break
      }

      case 'prayers': {
        const { data: prayers } = await supabase
          .from('prayer_requests')
          .select(`
            id, title, category, is_answered, is_private, created_at,
            members (first_name, last_name)
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false })

        const answered = prayers?.filter(p => p.is_answered).length || 0
        const byCategory: Record<string, number> = {}
        for (const p of prayers || []) {
          const cat = p.category || 'General'
          byCategory[cat] = (byCategory[cat] || 0) + 1
        }

        report.data = {
          total: prayers?.length || 0,
          answered,
          pending: (prayers?.length || 0) - answered,
          answerRate: prayers?.length ? `${((answered / prayers.length) * 100).toFixed(1)}%` : '0%',
          byCategory: Object.entries(byCategory)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count),
          prayers: prayers?.filter(p => !p.is_private).map(p => ({
            title: p.title,
            category: p.category,
            answered: p.is_answered,
            submittedBy: (p.members as any)?.first_name || 'Anonymous',
            date: p.created_at
          })) || []
        }
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Format as CSV if requested
    if (format === 'csv') {
      const csvContent = convertToCSV(report.data)
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json(report)

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

// Convert report data to CSV format
function convertToCSV(data: any): string {
  if (!data) return ''

  // Handle different data structures
  if (Array.isArray(data)) {
    if (data.length === 0) return ''
    const headers = Object.keys(data[0])
    const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    return [headers.join(','), ...rows].join('\n')
  }

  // For nested objects, flatten first level
  const lines: string[] = []

  for (const [section, sectionData] of Object.entries(data)) {
    lines.push(`\n${section.toUpperCase()}`)
    lines.push('---')

    if (Array.isArray(sectionData)) {
      if (sectionData.length > 0) {
        const headers = Object.keys(sectionData[0])
        lines.push(headers.join(','))
        for (const row of sectionData) {
          lines.push(headers.map(h => JSON.stringify((row as any)[h] ?? '')).join(','))
        }
      }
    } else if (typeof sectionData === 'object' && sectionData !== null) {
      for (const [key, value] of Object.entries(sectionData)) {
        if (Array.isArray(value)) {
          lines.push(`${key}:`)
          if (value.length > 0 && typeof value[0] === 'object') {
            const headers = Object.keys(value[0])
            lines.push(headers.join(','))
            for (const row of value) {
              lines.push(headers.map(h => JSON.stringify((row as any)[h] ?? '')).join(','))
            }
          } else {
            lines.push(value.join(','))
          }
        } else {
          lines.push(`${key},${JSON.stringify(value)}`)
        }
      }
    } else {
      lines.push(String(sectionData))
    }
  }

  return lines.join('\n')
}

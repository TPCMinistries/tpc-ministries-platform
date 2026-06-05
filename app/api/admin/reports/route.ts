import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function getSupabase() { return createAdminClient() }

interface MinistryReport {
  generatedAt: string
  reportType: string
  dateRange: {
    startDate: string
    endDate: string
  }
  data?: unknown
}

interface RelatedMember {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

function relatedMember(value: RelatedMember | RelatedMember[] | null | undefined): RelatedMember | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Exportable Ministry Reports API
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = getSupabase()

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get('endDate') || new Date().toISOString()
    const format = searchParams.get('format') || 'json' // json, csv

    const report: MinistryReport = {
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
          .select('amount, donation_type, designation, created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        const totalRevenue = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
        const avgDonation = donations?.length ? totalRevenue / donations.length : 0

        const revenueByFund: Record<string, number> = {}
        for (const d of donations || []) {
          const fund = d.designation || 'General'
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
            id, amount, donation_type, designation, created_at, is_recurring,
            members (first_name, last_name, email)
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false })

        const total = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

        report.data = {
          totalAmount: total,
          count: donations?.length || 0,
          donations: donations?.map(d => {
            const donor = relatedMember(d.members as RelatedMember | RelatedMember[] | null)

            return {
              amount: d.amount,
              type: d.donation_type,
              fund: d.designation || 'General',
              recurring: d.is_recurring,
              donor: donor?.first_name ? `${donor.first_name} ${donor.last_name ?? ''}`.trim() : 'Anonymous',
              date: d.created_at
            }
          }) || []
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
          prayers: prayers?.filter(p => !p.is_private).map(p => {
            const submittedBy = relatedMember(p.members as RelatedMember | RelatedMember[] | null)

            return {
              title: p.title,
              category: p.category,
              answered: p.is_answered,
              submittedBy: submittedBy?.first_name || 'Anonymous',
              date: p.created_at
            }
          }) || []
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
function convertToCSV(data: unknown): string {
  if (!data) return ''

  // Handle different data structures
  if (Array.isArray(data)) {
    if (data.length === 0) return ''
    const firstRow = data.find(isRecord)
    if (!firstRow) return data.map(value => JSON.stringify(value ?? '')).join('\n')

    const headers = Object.keys(firstRow)
    const rows = data.map(row => {
      if (!isRecord(row)) return JSON.stringify(row ?? '')
      return headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
    })
    return [headers.join(','), ...rows].join('\n')
  }

  if (!isRecord(data)) return JSON.stringify(data)

  // For nested objects, flatten first level
  const lines: string[] = []

  for (const [section, sectionData] of Object.entries(data)) {
    lines.push(`\n${section.toUpperCase()}`)
    lines.push('---')

    if (Array.isArray(sectionData)) {
      if (sectionData.length > 0) {
        const firstRow = sectionData.find(isRecord)
        if (!firstRow) {
          lines.push(sectionData.map(value => JSON.stringify(value ?? '')).join(','))
          continue
        }

        const headers = Object.keys(firstRow)
        lines.push(headers.join(','))
        for (const row of sectionData) {
          if (!isRecord(row)) {
            lines.push(JSON.stringify(row ?? ''))
            continue
          }

          lines.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
        }
      }
    } else if (isRecord(sectionData)) {
      for (const [key, value] of Object.entries(sectionData)) {
        if (Array.isArray(value)) {
          lines.push(`${key}:`)
          const firstRow = value.find(isRecord)
          if (firstRow) {
            const headers = Object.keys(firstRow)
            lines.push(headers.join(','))
            for (const row of value) {
              if (!isRecord(row)) {
                lines.push(JSON.stringify(row ?? ''))
                continue
              }

              lines.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
            }
          } else {
            lines.push(value.map(item => JSON.stringify(item ?? '')).join(','))
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

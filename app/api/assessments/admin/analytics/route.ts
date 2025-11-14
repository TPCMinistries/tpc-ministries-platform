import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is admin
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      )
    }

    // TODO: Add admin role check
    // const { data: member } = await supabase
    //   .from('members')
    //   .select('role')
    //   .eq('user_id', user.id)
    //   .single()
    // if (member?.role !== 'admin') return 403

    const searchParams = request.nextUrl.searchParams
    const assessmentId = searchParams.get('assessment_id')
    const timeRange = parseInt(searchParams.get('time_range') || '30') // days

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeRange)

    // Get all active assessments
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('id, name, slug, total_completions, question_count, estimated_minutes')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (assessmentsError) throw assessmentsError

    // Get anonymous completions
    let anonymousQuery = supabase
      .from('assessment_responses_anonymous')
      .select('assessment_id, completed_at, converted_to_member, email')
      .gte('completed_at', startDate.toISOString())

    if (assessmentId) {
      anonymousQuery = anonymousQuery.eq('assessment_id', assessmentId)
    }

    const { data: anonymousData, error: anonymousError } = await anonymousQuery

    if (anonymousError) throw anonymousError

    // Get member completions
    let memberQuery = supabase
      .from('member_assessment_results')
      .select('assessment_id, completed_at, retake_number, member_id')
      .gte('completed_at', startDate.toISOString())

    if (assessmentId) {
      memberQuery = memberQuery.eq('assessment_id', assessmentId)
    }

    const { data: memberData, error: memberError } = await memberQuery

    if (memberError) throw memberError

    // Calculate analytics per assessment
    const analytics = assessments?.map(assessment => {
      const anonCompletions = anonymousData?.filter(
        r => r.assessment_id === assessment.id
      ) || []

      const memCompletions = memberData?.filter(
        r => r.assessment_id === assessment.id
      ) || []

      const conversions = anonCompletions.filter(
        r => r.converted_to_member
      ).length

      const conversionRate = anonCompletions.length > 0
        ? parseFloat(((conversions / anonCompletions.length) * 100).toFixed(1))
        : 0

      // Calculate unique members
      const uniqueMembers = new Set(memCompletions.map(m => m.member_id)).size

      // Calculate retake stats
      const retakes = memCompletions.filter(m => m.retake_number > 1).length
      const retakeRate = uniqueMembers > 0
        ? parseFloat(((retakes / uniqueMembers) * 100).toFixed(1))
        : 0

      // Calculate completion rate (of those who started)
      const totalStarted = anonCompletions.length + memCompletions.length
      const completionRate = 100 // All in results table are complete

      // Calculate emails captured
      const emailsCaptured = anonCompletions.filter(r => r.email && r.email.length > 0).length
      const emailCaptureRate = anonCompletions.length > 0
        ? parseFloat(((emailsCaptured / anonCompletions.length) * 100).toFixed(1))
        : 0

      return {
        assessment_id: assessment.id,
        assessment_name: assessment.name,
        assessment_slug: assessment.slug,
        question_count: assessment.question_count,
        estimated_minutes: assessment.estimated_minutes,

        // Completion stats
        total_completions: assessment.total_completions,
        completions_in_range: totalStarted,
        anonymous_completions: anonCompletions.length,
        member_completions: memCompletions.length,

        // Conversion stats
        conversion_count: conversions,
        conversion_rate: conversionRate,

        // Member stats
        unique_members: uniqueMembers,
        retakes: retakes,
        retake_rate: retakeRate,

        // Email capture
        emails_captured: emailsCaptured,
        email_capture_rate: emailCaptureRate,

        // Averages
        avg_completion_time: `${assessment.estimated_minutes} min`, // Would need actual tracking
      }
    })

    // Calculate overall stats
    const totalAnonymous = anonymousData?.length || 0
    const totalMember = memberData?.length || 0
    const totalConversions = anonymousData?.filter(r => r.converted_to_member).length || 0

    const overallStats = {
      total_assessments: assessments?.length || 0,
      total_completions_in_range: totalAnonymous + totalMember,
      total_anonymous: totalAnonymous,
      total_member: totalMember,
      total_conversions: totalConversions,
      overall_conversion_rate: totalAnonymous > 0
        ? parseFloat(((totalConversions / totalAnonymous) * 100).toFixed(1))
        : 0,
      unique_members: new Set(memberData?.map(m => m.member_id) || []).size,
      total_retakes: memberData?.filter(m => m.retake_number > 1).length || 0,
      time_range_days: timeRange
    }

    // Calculate conversion funnel (aggregate across all assessments)
    const totalEmailsCaptured = anonymousData?.filter(r => r.email && r.email.length > 0).length || 0
    const emailCaptureRate = totalAnonymous > 0
      ? parseFloat(((totalEmailsCaptured / totalAnonymous) * 100).toFixed(1))
      : 0

    const conversionFunnel = {
      started_assessments: totalAnonymous + totalMember,
      provided_email: totalEmailsCaptured,
      email_capture_rate: emailCaptureRate,
      completed_assessments: totalAnonymous + totalMember,
      created_account: totalConversions,
      conversion_rate: overallStats.overall_conversion_rate
    }

    return NextResponse.json(
      {
        success: true,
        time_range: {
          days: timeRange,
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString()
        },
        overall_stats: overallStats,
        conversion_funnel: conversionFunnel,
        assessment_analytics: analytics
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching assessment analytics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics'
      },
      { status: 500 }
    )
  }
}

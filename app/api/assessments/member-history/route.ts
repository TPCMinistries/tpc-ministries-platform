import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
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

    // Get member record
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name, email')
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        {
          success: false,
          error: 'Member not found'
        },
        { status: 404 }
      )
    }

    // Get all assessment results for this member with assessment details
    const { data: results, error } = await supabase
      .from('member_assessment_results')
      .select(`
        id,
        assessment_id,
        completed_at,
        retake_number,
        results_json,
        assessments (
          id,
          name,
          slug,
          description,
          category
        )
      `)
      .eq('member_id', member.id)
      .order('completed_at', { ascending: false })

    if (error) {
      throw error
    }

    // Group results by assessment for history view
    const groupedResults = results?.reduce((acc: any, result: any) => {
      const assessmentId = result.assessment_id
      if (!acc[assessmentId]) {
        acc[assessmentId] = {
          assessment: {
            id: result.assessments.id,
            name: result.assessments.name,
            slug: result.assessments.slug,
            description: result.assessments.description,
            category: result.assessments.category
          },
          times_completed: 0,
          last_taken: null,
          results: []
        }
      }

      acc[assessmentId].times_completed++

      // Track most recent completion date
      if (!acc[assessmentId].last_taken ||
          new Date(result.completed_at) > new Date(acc[assessmentId].last_taken)) {
        acc[assessmentId].last_taken = result.completed_at
      }

      acc[assessmentId].results.push({
        id: result.id,
        completed_at: result.completed_at,
        retake_number: result.retake_number,
        results_json: result.results_json
      })

      return acc
    }, {})

    // Sort results within each assessment by retake_number descending
    Object.keys(groupedResults || {}).forEach(key => {
      groupedResults[key].results.sort((a: any, b: any) =>
        b.retake_number - a.retake_number
      )
    })

    // Calculate summary stats
    const totalAssessmentsTaken = Object.keys(groupedResults || {}).length
    const totalCompletions = results?.length || 0
    const mostRecentCompletion = results && results.length > 0
      ? results[0].completed_at
      : null

    return NextResponse.json(
      {
        success: true,
        member: {
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email
        },
        summary: {
          total_assessments_taken: totalAssessmentsTaken,
          total_completions: totalCompletions,
          most_recent_completion: mostRecentCompletion
        },
        assessment_history: Object.values(groupedResults || {})
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching member assessment history:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assessment history'
      },
      { status: 500 }
    )
  }
}

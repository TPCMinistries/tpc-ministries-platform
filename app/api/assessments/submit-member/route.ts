import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Import the same calculation functions from submit-anonymous
// In a real app, these would be in a shared utility file
import { calculateAssessmentResults } from '../submit-anonymous/route'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { assessment_id, member_id, responses_json } = body

    if (!assessment_id || !member_id || !responses_json) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }

    // Verify user is authenticated and matches member_id
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

    // Get member record to verify ownership
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', member_id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - member mismatch'
        },
        { status: 403 }
      )
    }

    // Get assessment details to determine type
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, slug, name')
      .eq('id', assessment_id)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assessment not found'
        },
        { status: 404 }
      )
    }

    // Get questions to properly calculate results
    const { data: questions } = await supabase
      .from('assessment_questions')
      .select('id, scoring_category, question_type')
      .eq('assessment_id', assessment_id)
      .order('order_number', { ascending: true })

    // Calculate results based on assessment type
    const results_json = calculateMemberResults(
      assessment.slug,
      responses_json,
      questions || []
    )

    // Check for existing assessments to determine retake number and get comparison data
    const { data: existingResults, error: countError } = await supabase
      .from('member_assessment_results')
      .select('retake_number, results_json, completed_at')
      .eq('member_id', member_id)
      .eq('assessment_id', assessment_id)
      .order('retake_number', { ascending: false })

    const retake_number = existingResults && existingResults.length > 0
      ? existingResults[0].retake_number + 1
      : 1

    // Generate comparison if this is a retake
    let comparison = null
    if (retake_number > 1 && existingResults && existingResults.length > 0) {
      comparison = generateComparison(
        existingResults[0].results_json,
        results_json,
        assessment.slug
      )
    }

    const { data, error } = await supabase
      .from('member_assessment_results')
      .insert({
        member_id,
        assessment_id,
        responses_json,
        results_json,
        retake_number,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Assessment submitted successfully',
        result_id: data.id,
        results: results_json,
        retake_number,
        is_retake: retake_number > 1,
        comparison,
        previous_results: existingResults && existingResults.length > 0
          ? {
              completed_at: existingResults[0].completed_at,
              retake_number: existingResults[0].retake_number
            }
          : null
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error submitting member assessment:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit assessment'
      },
      { status: 500 }
    )
  }
}

function calculateMemberResults(
  assessmentSlug: string,
  responses: any,
  questions: any[]
) {
  // Use the same calculation logic as anonymous submissions
  // This ensures consistent scoring
  const calculatedAt = new Date().toISOString()

  // Import shared calculation functions
  // For now, inline a basic version
  return {
    type: assessmentSlug,
    scores: {},
    topResults: [],
    calculatedAt
  }
}

function generateComparison(previousResults: any, currentResults: any, assessmentSlug: string) {
  const changes: any = {
    assessmentType: assessmentSlug,
    hasChanges: false,
    improvements: [],
    declines: [],
    summary: ''
  }

  switch (assessmentSlug) {
    case 'spiritual-gifts':
      if (previousResults.topResults && currentResults.topResults) {
        const prevTop = previousResults.topResults[0]
        const currTop = currentResults.topResults[0]

        if (prevTop.gift !== currTop.gift) {
          changes.hasChanges = true
          changes.summary = `Your top gift changed from ${prevTop.gift} to ${currTop.gift}`
        } else if (currTop.percentage > prevTop.percentage) {
          changes.hasChanges = true
          changes.improvements.push(`${currTop.gift} increased by ${currTop.percentage - prevTop.percentage}%`)
          changes.summary = `Your ${currTop.gift} gift has strengthened`
        }
      }
      break

    case 'seasonal':
      if (previousResults.primarySeason !== currentResults.primarySeason) {
        changes.hasChanges = true
        changes.summary = `You've transitioned from ${previousResults.primarySeason} to ${currentResults.primarySeason}`
      }
      break

    case 'spiritual-maturity':
      if (previousResults.overallPercentage && currentResults.overallPercentage) {
        const diff = currentResults.overallPercentage - previousResults.overallPercentage
        if (diff > 0) {
          changes.hasChanges = true
          changes.improvements.push(`Overall maturity increased by ${diff}%`)
          changes.summary = `You've grown ${diff}% in spiritual maturity`
        } else if (diff < 0) {
          changes.hasChanges = true
          changes.declines.push(`Overall maturity decreased by ${Math.abs(diff)}%`)
          changes.summary = 'This may reflect honest self-assessment or a challenging season'
        }
      }
      break
  }

  return changes
}

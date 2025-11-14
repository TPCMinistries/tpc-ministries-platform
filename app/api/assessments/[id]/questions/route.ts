import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // First get the assessment to verify it exists and is active
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, name, slug, is_active')
      .eq('id', params.id)
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

    if (!assessment.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assessment is not active'
        },
        { status: 403 }
      )
    }

    // Get questions for this assessment
    const { data: questions, error } = await supabase
      .from('assessment_questions')
      .select('id, question_text, question_type, options_json, scoring_category, order_number')
      .eq('assessment_id', params.id)
      .order('order_number', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        name: assessment.name,
        slug: assessment.slug
      },
      questions
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching assessment questions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch questions'
      },
      { status: 500 }
    )
  }
}

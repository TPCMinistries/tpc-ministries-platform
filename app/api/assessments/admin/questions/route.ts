import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Create a new question
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      assessment_id,
      question_text,
      question_type,
      options_json,
      scoring_category,
      order_number
    } = body

    // Validation
    if (!assessment_id || !question_text || !question_type || order_number === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: assessment_id, question_text, question_type, order_number'
        },
        { status: 400 }
      )
    }

    // Validate question_type
    const validTypes = ['scale', 'multiple_choice', 'ranking', 'select_all']
    if (!validTypes.includes(question_type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid question type. Must be one of: ${validTypes.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Verify assessment exists
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, name')
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

    // Validate options_json for question types that require it
    if (['multiple_choice', 'ranking', 'select_all'].includes(question_type)) {
      if (!options_json || !Array.isArray(options_json) || options_json.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'options_json is required and must be a non-empty array for this question type'
          },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabase
      .from('assessment_questions')
      .insert({
        assessment_id,
        question_text,
        question_type,
        options_json: options_json || null,
        scoring_category: scoring_category || null,
        order_number
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Question created successfully',
        question: data
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create question'
      },
      { status: 500 }
    )
  }
}

// Update a question
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const {
      question_id,
      question_text,
      question_type,
      options_json,
      scoring_category,
      order_number
    } = body

    if (!question_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing question_id'
        },
        { status: 400 }
      )
    }

    // Verify question exists
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('assessment_questions')
      .select('id, question_type')
      .eq('id', question_id)
      .single()

    if (fetchError || !existingQuestion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question not found'
        },
        { status: 404 }
      )
    }

    // Validate question_type if provided
    if (question_type !== undefined) {
      const validTypes = ['scale', 'multiple_choice', 'ranking', 'select_all']
      if (!validTypes.includes(question_type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid question type. Must be one of: ${validTypes.join(', ')}`
          },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (question_text !== undefined) updateData.question_text = question_text
    if (question_type !== undefined) updateData.question_type = question_type
    if (options_json !== undefined) updateData.options_json = options_json
    if (scoring_category !== undefined) updateData.scoring_category = scoring_category
    if (order_number !== undefined) updateData.order_number = order_number

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No fields to update'
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('assessment_questions')
      .update(updateData)
      .eq('id', question_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Question updated successfully',
        question: data
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update question'
      },
      { status: 500 }
    )
  }
}

// Delete a question
export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const question_id = searchParams.get('question_id')

    if (!question_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing question_id parameter'
        },
        { status: 400 }
      )
    }

    // Verify question exists before deleting
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('assessment_questions')
      .select('id, assessment_id')
      .eq('id', question_id)
      .single()

    if (fetchError || !existingQuestion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question not found'
        },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('assessment_questions')
      .delete()
      .eq('id', question_id)

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Question deleted successfully',
        deleted_question_id: question_id
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete question'
      },
      { status: 500 }
    )
  }
}

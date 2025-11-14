import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    // const { data: member } = await supabase
    //   .from('members')
    //   .select('role')
    //   .eq('user_id', user.id)
    //   .single()
    // if (member?.role !== 'admin') return NextResponse.json({success: false, error: 'Forbidden'}, {status: 403})

    const body = await request.json()
    const {
      name,
      slug,
      description,
      question_count,
      estimated_minutes,
      category,
      biblical_foundation,
      display_order
    } = body

    // Validation
    if (!name || !slug || !question_count || !estimated_minutes) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, slug, question_count, estimated_minutes'
        },
        { status: 400 }
      )
    }

    // Validate slug format (lowercase, hyphens only)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug must be lowercase with hyphens only (e.g., "my-assessment")'
        },
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (question_count < 1 || question_count > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question count must be between 1 and 100'
        },
        { status: 400 }
      )
    }

    if (estimated_minutes < 1 || estimated_minutes > 120) {
      return NextResponse.json(
        {
          success: false,
          error: 'Estimated minutes must be between 1 and 120'
        },
        { status: 400 }
      )
    }

    // Get current max display_order if not provided
    let finalDisplayOrder = display_order
    if (!finalDisplayOrder) {
      const { data: maxOrderResult } = await supabase
        .from('assessments')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()

      finalDisplayOrder = maxOrderResult ? maxOrderResult.display_order + 1 : 1
    }

    // Create the assessment
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        name,
        slug,
        description: description || null,
        question_count,
        estimated_minutes,
        category: category || null,
        biblical_foundation: biblical_foundation || null,
        is_active: true,
        display_order: finalDisplayOrder,
        total_completions: 0
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Assessment created successfully',
        assessment: data
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating assessment:', error)

    // Check for unique constraint violation
    if (error?.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          error: 'An assessment with this slug already exists'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create assessment'
      },
      { status: 500 }
    )
  }
}

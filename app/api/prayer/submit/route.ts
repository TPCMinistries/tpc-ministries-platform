import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to submit a prayer request.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { request_text, category, is_public, is_anonymous } = body

    // Validation
    if (!request_text || request_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prayer request text is required' },
        { status: 400 }
      )
    }

    if (request_text.length > 500) {
      return NextResponse.json(
        { error: 'Prayer request must be 500 characters or less' },
        { status: 400 }
      )
    }

    if (!category || !['health', 'family', 'financial', 'spiritual', 'other'].includes(category)) {
      return NextResponse.json(
        { error: 'Valid category is required' },
        { status: 400 }
      )
    }

    // Insert prayer request
    const { data, error } = await supabase
      .from('prayer_requests')
      .insert([
        {
          member_id: user.id,
          request_text: request_text.trim(),
          category,
          is_public: is_public ?? true,
          is_anonymous: is_anonymous ?? false,
          status: 'pending', // Requires admin approval
          is_answered: false,
          prayer_count: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating prayer request:', error)
      return NextResponse.json(
        { error: 'Failed to submit prayer request' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Your prayer request has been submitted and is pending approval.',
        data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in prayer submit API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

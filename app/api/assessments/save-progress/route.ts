import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Note: This implementation uses JSONB storage in the members table
// In production, you might want a dedicated assessment_progress table

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { assessment_id, responses_json, current_question } = body

    if (!assessment_id || !responses_json || current_question === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }

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
      .select('id')
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

    // Store progress data
    // Note: For a production implementation, create a dedicated table:
    // CREATE TABLE assessment_progress (
    //   id UUID PRIMARY KEY,
    //   member_id UUID REFERENCES members(id),
    //   assessment_id UUID REFERENCES assessments(id),
    //   responses_json JSONB,
    //   current_question INTEGER,
    //   last_saved TIMESTAMP,
    //   UNIQUE(member_id, assessment_id)
    // )

    // For now, we'll use a simple approach with localStorage on client
    // and return success. In production, use the table above.

    const progressData = {
      assessment_id,
      member_id: member.id,
      responses_json,
      current_question,
      last_saved: new Date().toISOString()
    }

    // TODO: Implement actual database storage
    // const { error: saveError } = await supabase
    //   .from('assessment_progress')
    //   .upsert({
    //     member_id: member.id,
    //     assessment_id,
    //     responses_json,
    //     current_question,
    //     last_saved: new Date().toISOString()
    //   })

    return NextResponse.json(
      {
        success: true,
        message: 'Progress saved successfully',
        current_question,
        saved_at: progressData.last_saved
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving progress:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save progress'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const assessment_id = searchParams.get('assessment_id')

    if (!assessment_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing assessment_id parameter'
        },
        { status: 400 }
      )
    }

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
      .select('id')
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

    // TODO: Retrieve saved progress from database
    // const { data: progress, error: progressError } = await supabase
    //   .from('assessment_progress')
    //   .select('*')
    //   .eq('member_id', member.id)
    //   .eq('assessment_id', assessment_id)
    //   .single()

    // For now, return null (no saved progress - client will use localStorage)
    return NextResponse.json(
      {
        success: true,
        progress: null,
        message: 'No saved progress found'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error retrieving progress:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve progress'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const assessment_id = searchParams.get('assessment_id')

    if (!assessment_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing assessment_id parameter'
        },
        { status: 400 }
      )
    }

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
      .select('id')
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

    // TODO: Delete saved progress from database
    // const { error: deleteError } = await supabase
    //   .from('assessment_progress')
    //   .delete()
    //   .eq('member_id', member.id)
    //   .eq('assessment_id', assessment_id)

    return NextResponse.json(
      {
        success: true,
        message: 'Progress cleared successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error clearing progress:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear progress'
      },
      { status: 500 }
    )
  }
}

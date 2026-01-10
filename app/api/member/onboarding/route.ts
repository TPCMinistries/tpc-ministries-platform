import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get current user's onboarding progress
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member ID
    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, avatar_url, bio')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get onboarding progress
    let { data: onboarding } = await supabase
      .from('member_onboarding')
      .select('*')
      .eq('member_id', member.id)
      .single()

    // Create onboarding record if doesn't exist
    if (!onboarding) {
      const { data: newOnboarding, error: insertError } = await supabase
        .from('member_onboarding')
        .insert({ member_id: member.id })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating onboarding:', insertError)
      }
      onboarding = newOnboarding
    }

    // Calculate progress percentage
    let progress = 0
    if (onboarding) {
      if (onboarding.profile_completed) progress += 20
      if (onboarding.assessment_taken) progress += 20
      if (onboarding.group_joined) progress += 20
      if (onboarding.notifications_configured) progress += 20
      if (onboarding.first_checkin_completed) progress += 20
    }

    // Get suggested groups based on assessment results
    let suggestedGroups: any[] = []
    if (onboarding?.assessment_taken && !onboarding?.group_joined) {
      const { data: groups } = await supabase
        .from('community_groups')
        .select('id, name, description, image_url, member_count')
        .eq('is_active', true)
        .limit(3)

      suggestedGroups = groups || []
    }

    // Check if member has any assessments available
    const { data: assessments } = await supabase
      .from('assessments')
      .select('id, type, name, description')
      .eq('is_active', true)
      .limit(6)

    return NextResponse.json({
      onboarding: {
        ...onboarding,
        progress
      },
      member: {
        id: member.id,
        first_name: member.first_name,
        has_avatar: !!member.avatar_url,
        has_bio: !!member.bio
      },
      suggestedGroups,
      availableAssessments: assessments || []
    })
  } catch (error) {
    console.error('Error fetching onboarding:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update onboarding progress
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const { notifications_configured, skip_step } = body

    const updates: any = { updated_at: new Date().toISOString() }

    if (notifications_configured !== undefined) {
      updates.notifications_configured = notifications_configured
    }

    // Allow skipping optional steps
    if (skip_step) {
      switch (skip_step) {
        case 'profile':
          updates.profile_completed = true
          break
        case 'assessment':
          updates.assessment_taken = true
          break
        case 'group':
          updates.group_joined = true
          break
        case 'notifications':
          updates.notifications_configured = true
          break
        case 'checkin':
          updates.first_checkin_completed = true
          break
      }
    }

    const { data: onboarding, error: updateError } = await supabase
      .from('member_onboarding')
      .update(updates)
      .eq('member_id', member.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating onboarding:', updateError)
      return NextResponse.json({ error: 'Failed to update onboarding' }, { status: 500 })
    }

    return NextResponse.json({ onboarding, success: true })
  } catch (error) {
    console.error('Error in onboarding PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

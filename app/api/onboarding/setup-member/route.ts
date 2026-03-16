import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication failed', details: authError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Use admin client to check for existing member (bypasses RLS)
    const adminClient = createAdminClient()
    const { data: existingMember, error: checkError } = await adminClient
      .from('members')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('Checking for existing member:', { user_id: user.id, existingMember, checkError })

    if (existingMember) {
      console.log('Member already exists, returning success')
      return NextResponse.json({
        success: true,
        message: 'Member record already exists',
        is_admin: existingMember.is_admin,
        is_new_member: false,
      })
    }

    // Get name from user metadata or email
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const nameParts = fullName.split(' ')
    const firstName = nameParts[0] || 'User'
    const lastName = nameParts.slice(1).join(' ') || ''

    // Determine if user should be admin based on email
    const adminEmails = [
      'lorenzo@theglobalenterprise.org',
      'lorenzo.d.chambers@gmail.com',
      'sarahdaughtrychambers@gmail.com',
    ]
    const isAdmin = adminEmails.includes(user.email || '')

    // Create member record (using admin client to bypass RLS)
    const { data: newMember, error: createError } = await adminClient
      .from('members')
      .insert({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        is_admin: isAdmin,
        is_active: true,
        email_notifications: true,
        sms_notifications: false,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating member record:', createError)
      return NextResponse.json(
        { error: 'Failed to create member record', details: createError.message },
        { status: 500 }
      )
    }

    // Check for Kenya trip invite and auto-link
    let isKenyaDelegate = false
    try {
      const { data: kenyaInvite } = await adminClient
        .from('invite_codes')
        .select('id, role, participant_id, service_track')
        .eq('email', user.email)
        .eq('invite_type', 'kenya_trip')
        .eq('is_active', true)
        .maybeSingle()

      if (kenyaInvite && kenyaInvite.participant_id) {
        // Update member role if invite specifies staff/admin
        if (kenyaInvite.role === 'staff' || kenyaInvite.role === 'admin') {
          await adminClient
            .from('members')
            .update({ role: kenyaInvite.role })
            .eq('id', newMember.id)
        }

        // Link member to Kenya participant record
        await adminClient
          .from('kenya_trip_participants')
          .update({ member_id: newMember.id })
          .eq('id', kenyaInvite.participant_id)

        // Mark invite as used
        await adminClient
          .from('invite_codes')
          .update({
            use_count: 1,
            used_at: new Date().toISOString(),
            used_by: newMember.id,
          })
          .eq('id', kenyaInvite.id)

        isKenyaDelegate = true
      }
    } catch (linkError) {
      console.error('Kenya auto-link error (non-fatal):', linkError)
    }

    return NextResponse.json({
      success: true,
      message: 'Member record created successfully',
      is_admin: isAdmin,
      is_new_member: true,
      is_kenya_delegate: isKenyaDelegate,
      member: newMember,
    })
  } catch (error: any) {
    console.error('Setup member error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

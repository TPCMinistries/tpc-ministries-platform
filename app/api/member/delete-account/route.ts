import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get member ID
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Create admin client to bypass RLS for deletion
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Delete all related data in order (to respect foreign key constraints)
    // 1. Prayer interactions
    await adminClient
      .from('prayer_interactions')
      .delete()
      .eq('member_id', member.id)

    // 2. Prayer requests
    await adminClient
      .from('prayer_requests')
      .delete()
      .eq('member_id', member.id)

    // 3. Event registrations
    await adminClient
      .from('event_registrations')
      .delete()
      .eq('user_id', user.id)

    // 4. Assessment results
    await adminClient
      .from('member_assessment_results')
      .delete()
      .eq('member_id', member.id)

    // 5. Content progress
    await adminClient
      .from('content_progress')
      .delete()
      .eq('member_id', member.id)

    // 6. Member bookmarks
    await adminClient
      .from('member_bookmarks')
      .delete()
      .eq('member_id', member.id)

    // 7. Member seasons
    await adminClient
      .from('member_seasons')
      .delete()
      .eq('member_id', member.id)

    // 8. Messages
    await adminClient
      .from('messages')
      .delete()
      .or(`sender_id.eq.${member.id},recipient_id.eq.${member.id}`)

    // 9. Personal prophecies
    await adminClient
      .from('personal_prophecies')
      .delete()
      .eq('member_id', member.id)

    // 10. Push subscriptions
    await adminClient
      .from('push_subscriptions')
      .delete()
      .eq('member_id', member.id)

    // 11. Donations (mark as anonymized rather than delete for record keeping)
    await adminClient
      .from('donations')
      .update({
        user_id: null,
        donor_name: 'Deleted User',
        donor_email: null
      })
      .eq('user_id', user.id)

    // 12. Delete the member record
    const { error: memberDeleteError } = await adminClient
      .from('members')
      .delete()
      .eq('id', member.id)

    if (memberDeleteError) {
      console.error('Error deleting member:', memberDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete member record' },
        { status: 500 }
      )
    }

    // 13. Delete the auth user
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id)

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete authentication record' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in delete account API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

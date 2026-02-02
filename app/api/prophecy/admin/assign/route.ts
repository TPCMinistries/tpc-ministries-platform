import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireStaff, AuthResult } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    // Require staff/admin access
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult as AuthResult
    const supabase = await createClient()

    const body = await request.json()
    const {
      member_id,
      delivery_method,
      audio_url,
      video_url,
      transcript,
      themes,
      admin_notes,
      title,
    } = body

    // Validate required fields
    if (!member_id || !transcript || !themes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert themes string to array if needed
    const themesArray = typeof themes === 'string'
      ? themes.split(',').map(t => t.trim())
      : themes

    // Generate title from first sentence if not provided
    const generatedTitle = title || transcript.split('.')[0].substring(0, 100)

    // Get member details for notification
    const { data: memberData } = await supabase
      .from('members')
      .select('id, email, first_name, last_name')
      .eq('id', member_id)
      .single()

    // Create the personal prophecy
    const { data, error } = await supabase
      .from('personal_prophecies')
      .insert({
        member_id,
        delivery_method: delivery_method || 'in-person',
        audio_url,
        video_url,
        transcript,
        themes: themesArray,
        admin_notes,
        title: generatedTitle,
        date: new Date().toISOString(),
        fulfillment_status: 'unfolding',
        given_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating personal prophecy:', error)
      return NextResponse.json(
        { error: 'Failed to create personal prophecy' },
        { status: 500 }
      )
    }

    // Send in-app notification to member
    if (memberData) {
      try {
        await supabase.from('notifications').insert({
          user_id: member_id,
          type: 'prophecy',
          title: 'New Prophetic Word Received',
          message: `You have received a new prophetic word: "${generatedTitle}"`,
          link: '/my-prophecies',
          is_read: false,
        })
      } catch (notifError) {
        console.warn('Failed to create notification:', notifError)
      }

      // Send email notification
      if (memberData.email) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/email/send-prophecy-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: memberData.email,
              name: memberData.first_name || 'Beloved',
              prophecyTitle: generatedTitle,
              prophecyId: data.id,
            }),
          })
        } catch (emailError) {
          console.warn('Failed to send prophecy email:', emailError)
        }
      }
    }

    return NextResponse.json(
      { message: 'Personal prophecy assigned successfully', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in assign prophecy API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

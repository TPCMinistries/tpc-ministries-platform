import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { renderProphecyAssigned } from '@/lib/email/render'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { memberName, email, prophecyTitle, viewUrl } = body

    if (!memberName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: memberName, email' },
        { status: 400 }
      )
    }

    // Render email template
    const html = await renderProphecyAssigned({
      memberName,
      prophecyTitle,
      viewUrl: viewUrl || 'https://tpcmin.org/member/prophecy',
    })

    // Send email via Resend
    const result = await sendEmail({
      to: email,
      subject: '✨ You have a new personal prophecy from TPC Ministries',
      html,
    })

    if (!result.success) {
      console.error('Failed to send prophecy notification:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Prophecy notification sent successfully',
    })
  } catch (error: any) {
    console.error('Prophecy notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

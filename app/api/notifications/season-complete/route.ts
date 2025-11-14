import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, EmailTemplates } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { memberId, seasonId } = await request.json()

    if (!memberId || !seasonId) {
      return NextResponse.json(
        { success: false, error: 'Member ID and Season ID are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get member details
    const { data: member } = await supabase
      .from('members')
      .select('full_name, email')
      .eq('id', memberId)
      .single()

    // Get season details
    const { data: season } = await supabase
      .from('seasons')
      .select('name, color')
      .eq('id', seasonId)
      .single()

    if (!member || !season) {
      return NextResponse.json(
        { success: false, error: 'Member or season not found' },
        { status: 404 }
      )
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/member/seasons`

    const { subject, html } = EmailTemplates.seasonComplete(
      member.full_name,
      season.name,
      season.color,
      dashboardUrl
    )

    const result = await sendEmail({
      to: member.email,
      subject,
      html,
    })

    if (!result.success) {
      console.warn('Season completion email failed to send:', result.error)
      return NextResponse.json({
        success: true,
        message: 'Season marked complete but email notification failed',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Season completion email sent successfully',
    })
  } catch (error) {
    console.error('Season completion email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send season completion email' },
      { status: 500 }
    )
  }
}

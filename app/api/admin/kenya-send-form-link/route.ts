import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

async function checkStaffOrAdmin(supabase: any, userId: string) {
  const { data: member } = await supabase
    .from('members')
    .select('id, first_name, last_name, is_admin, role')
    .eq('user_id', userId)
    .single()
  if (!member) return null
  if (member.is_admin || member.role === 'staff' || member.role === 'admin') return member
  return null
}

const FORM_CONFIG: Record<string, { subject: string; title: string; description: string; path: string; icon: string }> = {
  travel: {
    subject: 'Kenya Trip — Please Complete Your Travel Form',
    title: 'Travel Form',
    description: 'We need your passport details, flight preferences, travel dates, and airport information to coordinate logistics.',
    path: '/kenya/travel',
    icon: '✈️',
  },
  health_safety: {
    subject: 'Kenya Trip — Health & Safety Form Needed',
    title: 'Health & Safety Form',
    description: 'Please provide your emergency contacts, vaccination records, medical information, and insurance details.',
    path: '/kenya/health-safety',
    icon: '🏥',
  },
  medical: {
    subject: 'Kenya Trip — Medical Form Required',
    title: 'Medical Form',
    description: 'We need your medical history, allergies, medications, and dietary restrictions for trip safety.',
    path: '/kenya/health-safety',
    icon: '💊',
  },
  interest: {
    subject: 'Kenya Trip — Interest Form',
    title: 'Interest Form',
    description: 'Tell us about your ministry interests, skills, and what you hope to contribute to the trip.',
    path: '/kenya',
    icon: '📋',
  },
  waiver: {
    subject: 'Kenya Trip — Please Sign the Liability Waiver',
    title: 'Liability Waiver',
    description: 'Please review and sign the trip liability waiver — this is required for all delegates.',
    path: '/kenya/travel',
    icon: '📝',
  },
  all_incomplete: {
    subject: 'Kenya Trip — Action Required: Complete Your Forms',
    title: 'Outstanding Forms',
    description: 'You have outstanding forms that need to be completed before the trip.',
    path: '',
    icon: '📬',
  },
}

function buildFormEmailHtml(name: string, formType: string, incompleteForms?: string[]): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'
  const config = FORM_CONFIG[formType]

  let formsListHtml = ''
  if (formType === 'all_incomplete' && incompleteForms) {
    formsListHtml = incompleteForms.map(f => {
      const fc = FORM_CONFIG[f]
      if (!fc) return ''
      return `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
            <strong>${fc.icon} ${fc.title}</strong><br>
            <span style="color: #6b7280; font-size: 13px;">${fc.description}</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: middle;">
            <a href="${appUrl}${fc.path}" style="display: inline-block; background: #d4af37; color: #1e3a5f; padding: 8px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">Complete →</a>
          </td>
        </tr>
      `
    }).join('')
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #006600 0%, #004d00 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0 0 8px; font-size: 28px; }
        .header p { margin: 0; font-size: 16px; opacity: 0.9; }
        .accent-bar { height: 4px; background: linear-gradient(90deg, #d4af37, #f0d060, #d4af37); }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 24px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${formType === 'all_incomplete' ? 'Forms Needed' : config.title}</h1>
          <p>Kenya Kingdom Impact Trip 2026</p>
        </div>
        <div class="accent-bar"></div>
        <div class="content">
          <h2 style="color: #1e3a5f;">Hello ${name}!</h2>
          ${formType === 'all_incomplete' ? `
            <p>We're getting closer to the trip! Please complete the following forms at your earliest convenience:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              ${formsListHtml}
            </table>
            <p style="font-size: 13px; color: #6b7280;">Completing these forms helps us coordinate logistics, ensure your safety, and make this the best trip possible.</p>
          ` : `
            <p>${config.description}</p>
            <p>Please take a few minutes to complete this form — it helps our team coordinate trip logistics and ensure everyone's safety.</p>
            <p style="text-align: center;">
              <a href="${appUrl}${config.path}" class="button">${config.icon} Complete ${config.title}</a>
            </p>
            <p style="font-size: 13px; color: #6b7280; text-align: center;">
              Or visit: ${appUrl}${config.path}
            </p>
          `}
        </div>
        <div class="footer">
          <p><strong>TPC Ministries</strong> — Kenya Kingdom Impact Trip 2026</p>
          <p>April 22 – May 7, 2026 | Nairobi, Kakamega & Mombasa</p>
          <p>Questions? Reply to this email or contact your trip coordinator.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const staffMember = await checkStaffOrAdmin(supabase, user.id)
  if (!staffMember) return NextResponse.json({ error: 'Staff access required' }, { status: 403 })

  try {
    const { participantId, formType } = await request.json()

    if (!participantId || !formType) {
      return NextResponse.json({ error: 'participantId and formType are required' }, { status: 400 })
    }

    if (!FORM_CONFIG[formType]) {
      return NextResponse.json({ error: 'Invalid form type' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: participant, error: pError } = await adminClient
      .from('kenya_trip_participants')
      .select('first_name, last_name, email, interest_form_completed_at, travel_form_completed_at, health_safety_form_completed_at, medical_form_completed_at, waiver_signed_at')
      .eq('id', participantId)
      .single()

    if (pError || !participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    if (!participant.email) {
      return NextResponse.json({ error: 'Participant has no email address' }, { status: 400 })
    }

    const name = `${participant.first_name} ${participant.last_name}`.trim() || 'Friend'

    // For all_incomplete, figure out which forms are missing
    let incompleteForms: string[] = []
    if (formType === 'all_incomplete') {
      if (!participant.interest_form_completed_at) incompleteForms.push('interest')
      if (!participant.travel_form_completed_at) incompleteForms.push('travel')
      if (!participant.health_safety_form_completed_at) incompleteForms.push('health_safety')
      if (!participant.medical_form_completed_at) incompleteForms.push('medical')
      if (!participant.waiver_signed_at) incompleteForms.push('waiver')

      if (incompleteForms.length === 0) {
        return NextResponse.json({ success: true, emailSent: false, message: 'All forms already completed' })
      }
    }

    const config = FORM_CONFIG[formType]
    const emailResult = await sendEmail({
      to: participant.email,
      subject: config.subject,
      html: buildFormEmailHtml(name, formType, incompleteForms),
    })

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      formType,
      incompleteForms: formType === 'all_incomplete' ? incompleteForms : undefined,
    })
  } catch (error: any) {
    console.error('Kenya send form link error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

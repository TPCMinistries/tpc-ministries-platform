import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

// Check if user is staff or admin
async function checkStaffOrAdmin(supabase: any, userId: string) {
  const { data: member } = await supabase
    .from('members')
    .select('id, first_name, last_name, is_admin, role')
    .eq('user_id', userId)
    .single()

  if (!member) return null
  // Staff (role = 'staff') or admin can send invites
  if (member.is_admin || member.role === 'staff' || member.role === 'admin') return member
  return null
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function buildExistingUserEmailHtml(name: string, track: string, loginUrl: string, inviterName: string): string {
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
        .track-badge { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin: 10px 0; }
        .button { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 24px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited!</h1>
          <p>Kenya Kingdom Impact Trip 2026</p>
        </div>
        <div class="accent-bar"></div>
        <div class="content">
          <h2 style="color: #1e3a5f;">Welcome Back, ${name}!</h2>
          <p>${inviterName} has personally invited you to join the <strong>Kenya Kingdom Impact Trip 2026</strong> with TPC Ministries.</p>
          ${track ? `<p>You've been assigned to the <span class="track-badge">${track} Track</span></p>` : ''}
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 15px; color: #1e40af;"><strong>You already have a TPC account!</strong></p>
            <p style="margin: 0; font-size: 14px; color: #374151;">Sign in to access your trip dashboard, complete forms, and manage your trip details.</p>
          </div>
          <p style="text-align: center;">
            <a href="${loginUrl}" class="button">Sign In & Access Your Trip</a>
          </p>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px; color: #92400e; font-size: 16px;">Next Steps After Signing In</h3>
            <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
              <li style="margin: 6px 0;"><strong>Step 1:</strong> Complete your Travel Form — flights, passport, airports</li>
              <li style="margin: 6px 0;"><strong>Step 2:</strong> Complete Health & Safety Form — emergency contact, vaccinations</li>
              <li style="margin: 6px 0;"><strong>Step 3:</strong> Apply for Kenya eTA at <a href="https://etakenya.go.ke" style="color: #b45309;">etakenya.go.ke</a> ($30)</li>
            </ol>
          </div>
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

function buildKenyaEmailHtml(name: string, track: string, inviteUrl: string, inviterName: string): string {
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
        .track-badge { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin: 10px 0; }
        .details { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .details h3 { margin: 0 0 12px; color: #006600; font-size: 16px; }
        .details ul { margin: 0; padding-left: 20px; }
        .details li { margin: 6px 0; color: #374151; font-size: 14px; }
        .button { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 24px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 13px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; background: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited!</h1>
          <p>Kenya Kingdom Impact Trip 2026</p>
        </div>
        <div class="accent-bar"></div>
        <div class="content">
          <h2 style="color: #1e3a5f;">Hello ${name}!</h2>
          <p>${inviterName} has personally invited you to join the <strong>Kenya Kingdom Impact Trip 2026</strong> with TPC Ministries.</p>
          ${track ? `<p>You've been assigned to the <span class="track-badge">${track} Track</span></p>` : ''}
          <div class="details">
            <h3>What to Expect</h3>
            <ul>
              <li>Kingdom impact across ministry, medical, education, business & media</li>
              <li>Conference sessions with Kenyan leaders and partners</li>
              <li>Cultural exchange and community building</li>
              <li>A life-changing experience of service and faith</li>
            </ul>
          </div>
          <p style="text-align: center;">
            <a href="${inviteUrl}" class="button">Accept Invitation & Join</a>
          </p>
          <p style="font-size: 13px; color: #6b7280; text-align: center;">
            Or copy this link: ${inviteUrl}
          </p>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px; color: #92400e; font-size: 16px;">Next Steps</h3>
            <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
              <li style="margin: 6px 0;"><strong>Step 1:</strong> <a href="https://tpcmin.org/kenya/travel" style="color: #b45309;">Complete your Travel Form</a> — travel logistics, passport, flights</li>
              <li style="margin: 6px 0;"><strong>Step 2:</strong> <a href="https://tpcmin.org/kenya/health-safety" style="color: #b45309;">Complete Health & Safety Form</a> — emergency contact, vaccinations, medical info</li>
              <li style="margin: 6px 0;"><strong>Step 3:</strong> Apply for Kenya eTA at <a href="https://etakenya.go.ke" style="color: #b45309;">etakenya.go.ke</a> ($30)</li>
              <li style="margin: 6px 0;"><strong>Step 4:</strong> Schedule your Yellow Fever vaccination (takes 10 days to activate)</li>
            </ol>
          </div>
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

// GET - List Kenya invites
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const staffMember = await checkStaffOrAdmin(supabase, user.id)
  if (!staffMember) return NextResponse.json({ error: 'Staff access required' }, { status: 403 })

  try {
    const adminClient = createAdminClient()

    const { data: invites, error } = await adminClient
      .from('invite_codes')
      .select('*')
      .eq('invite_type', 'kenya_trip')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(invites || [])
  } catch (error: any) {
    console.error('Kenya invites list error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create, bulk create, resend, deactivate Kenya invites
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const staffMember = await checkStaffOrAdmin(supabase, user.id)
  if (!staffMember) return NextResponse.json({ error: 'Staff access required' }, { status: 403 })

  try {
    const body = await request.json()
    const { action } = body
    const adminClient = createAdminClient()

    // Get the current trip
    const { data: trip } = await adminClient
      .from('kenya_trips')
      .select('id, name')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!trip) {
      return NextResponse.json({ error: 'No Kenya trip found' }, { status: 404 })
    }

    if (action === 'create') {
      const { firstName, lastName, email, track, role = 'member', sendEmail: shouldSendEmail = true } = body

      // Enforce: only admins can create staff/admin invites
      if ((role === 'staff' || role === 'admin') && !staffMember.is_admin) {
        return NextResponse.json({ error: 'Only admins can create staff/admin invites' }, { status: 403 })
      }

      const name = `${firstName} ${lastName}`.trim()

      // Dedup: check if participant with same email already exists for this trip
      let participantId: string | null = null
      if (email) {
        const { data: existingParticipant } = await adminClient
          .from('kenya_trip_participants')
          .select('id')
          .eq('trip_id', trip.id)
          .eq('email', email)
          .maybeSingle()

        if (existingParticipant) {
          participantId = existingParticipant.id
        }
      }

      // Create participant record if none exists
      if (!participantId) {
        const { data: newParticipant, error: pError } = await adminClient
          .from('kenya_trip_participants')
          .insert({
            trip_id: trip.id,
            first_name: firstName || '',
            last_name: lastName || '',
            email: email || '',
            phone: '',
            application_status: 'approved',
            payment_status: 'pending',
            passport_status: 'pending',
            visa_status: 'not_started',
            flight_status: '⬜ Not booked',
            hotel_status: '⬜ Not booked',
            booking_type: 'TBD',
            service_track: track || 'Flex',
            fundraising_goal: 3500,
            amount_raised: 0,
            team_leader: false,
          })
          .select('id')
          .single()

        if (pError) throw pError
        participantId = newParticipant.id
      }

      // Generate unique invite code
      let code = generateInviteCode()
      let attempts = 0
      while (attempts < 5) {
        const { data: existing } = await adminClient
          .from('invite_codes')
          .select('id')
          .eq('code', code)
          .single()
        if (!existing) break
        code = generateInviteCode()
        attempts++
      }

      // Create invite code record
      const { data: invite, error: invErr } = await adminClient
        .from('invite_codes')
        .insert({
          code,
          email: email || null,
          name: name || null,
          role,
          invited_by: staffMember.id,
          invite_type: 'kenya_trip',
          trip_id: trip.id,
          service_track: track || null,
          participant_id: participantId,
        })
        .select()
        .single()

      if (invErr) throw invErr

      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'}/join/${code}`

      // Check if this email already has an auth account
      let existingUser = false
      if (email) {
        const { data: exists } = await adminClient.rpc('check_email_exists', {
          check_email: email,
        })
        existingUser = !!exists
      }

      // Send Kenya-branded email (different content for existing vs new users)
      let emailSent = false
      let emailError: string | null = null
      if (shouldSendEmail && email) {
        const inviterName = `${staffMember.first_name} ${staffMember.last_name}`.trim()
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'}/auth/login`

        if (existingUser) {
          // Existing user: send "Sign In" email instead of "Accept Invitation"
          const emailResult = await sendEmail({
            to: email,
            subject: "You're Invited to the Kenya Kingdom Impact Trip 2026 — Sign In to Get Started",
            html: buildExistingUserEmailHtml(name || 'Friend', track || '', loginUrl, inviterName),
          })
          emailSent = emailResult.success
          if (!emailResult.success) {
            emailError = emailResult.error instanceof Error ? emailResult.error.message : 'Email failed to send'
            console.error('Kenya invite email failed:', emailResult.error)
          }
        } else {
          // New user: standard invite flow
          const emailResult = await sendEmail({
            to: email,
            subject: "You're Invited to the Kenya Kingdom Impact Trip 2026",
            html: buildKenyaEmailHtml(name || 'Friend', track || '', inviteUrl, inviterName),
          })
          emailSent = emailResult.success
          if (!emailResult.success) {
            emailError = emailResult.error instanceof Error ? emailResult.error.message : 'Email failed to send'
            console.error('Kenya invite email failed:', emailResult.error)
          }
        }
      }

      return NextResponse.json({
        success: true,
        invite,
        inviteUrl,
        participantId,
        emailSent,
        emailError,
      })
    }

    if (action === 'bulk_create') {
      const { invites: inviteList, sendEmails = true } = body
      const results: any[] = []

      for (const inv of inviteList) {
        try {
          // Recursively call create logic for each entry
          const { firstName, lastName, email, track, role = 'member' } = inv

          if ((role === 'staff' || role === 'admin') && !staffMember.is_admin) {
            results.push({ ...inv, success: false, error: 'Only admins can create staff/admin invites' })
            continue
          }

          const name = `${firstName} ${lastName}`.trim()

          // Dedup
          let participantId: string | null = null
          if (email) {
            const { data: existingP } = await adminClient
              .from('kenya_trip_participants')
              .select('id')
              .eq('trip_id', trip.id)
              .eq('email', email)
              .maybeSingle()
            if (existingP) participantId = existingP.id
          }

          if (!participantId) {
            const { data: newP, error: pErr } = await adminClient
              .from('kenya_trip_participants')
              .insert({
                trip_id: trip.id,
                first_name: firstName || '',
                last_name: lastName || '',
                email: email || '',
                phone: '',
                application_status: 'approved',
                payment_status: 'pending',
                passport_status: '? Unknown',
                visa_status: '? Unknown',
                flight_status: 'Not booked',
                hotel_status: 'Not booked',
                booking_type: 'TBD',
                service_track: track || 'Flex',
                fundraising_goal: 3500,
                amount_raised: 0,
                team_leader: false,
              })
              .select('id')
              .single()
            if (pErr) {
              results.push({ ...inv, success: false, error: pErr.message })
              continue
            }
            participantId = newP.id
          }

          const code = generateInviteCode()
          const { data: invite, error: invErr } = await adminClient
            .from('invite_codes')
            .insert({
              code,
              email: email || null,
              name: name || null,
              role,
              invited_by: staffMember.id,
              invite_type: 'kenya_trip',
              trip_id: trip.id,
              service_track: track || null,
              participant_id: participantId,
            })
            .select()
            .single()

          if (invErr) {
            results.push({ ...inv, success: false, error: invErr.message })
            continue
          }

          const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'}/join/${code}`

          if (sendEmails && email) {
            const inviterName = `${staffMember.first_name} ${staffMember.last_name}`.trim()
            try {
              await sendEmail({
                to: email,
                subject: "You're Invited to the Kenya Kingdom Impact Trip 2026",
                html: buildKenyaEmailHtml(name || 'Friend', track || '', inviteUrl, inviterName),
              })
              results.push({ ...inv, success: true, code, inviteUrl, emailSent: true, participantId })
            } catch {
              results.push({ ...inv, success: true, code, inviteUrl, emailSent: false, participantId })
            }
          } else {
            results.push({ ...inv, success: true, code, inviteUrl, emailSent: false, participantId })
          }
        } catch (err: any) {
          results.push({ ...inv, success: false, error: err.message })
        }
      }

      return NextResponse.json({
        success: true,
        results,
        created: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      })
    }

    if (action === 'resend') {
      const { inviteId } = body

      const { data: invite, error } = await adminClient
        .from('invite_codes')
        .select('*')
        .eq('id', inviteId)
        .eq('invite_type', 'kenya_trip')
        .single()

      if (error || !invite) {
        return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
      }

      if (!invite.email) {
        return NextResponse.json({ error: 'No email associated with this invite' }, { status: 400 })
      }

      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'}/join/${invite.code}`
      const inviterName = `${staffMember.first_name} ${staffMember.last_name}`.trim()

      await sendEmail({
        to: invite.email,
        subject: "Reminder: You're Invited to the Kenya Kingdom Impact Trip 2026",
        html: buildKenyaEmailHtml(invite.name || 'Friend', invite.service_track || '', inviteUrl, inviterName),
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'deactivate') {
      const { inviteId } = body

      const { error } = await adminClient
        .from('invite_codes')
        .update({ is_active: false })
        .eq('id', inviteId)
        .eq('invite_type', 'kenya_trip')

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Kenya invites API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

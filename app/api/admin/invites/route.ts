import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

// Helper function to check admin status
async function checkAdminStatus(supabase: any, userId: string) {
  const { data: adminMember } = await supabase
    .from('members')
    .select('is_admin, id, first_name, last_name')
    .eq('user_id', userId)
    .single()

  return adminMember?.is_admin ? adminMember : null
}

// Generate random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// GET - List all invites
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminMember = await checkAdminStatus(supabase, user.id)
  if (!adminMember) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'all'

  try {
    let query = supabase
      .from('invite_codes')
      .select(`
        *,
        inviter:members!invite_codes_invited_by_fkey(first_name, last_name),
        used_by_member:members!invite_codes_used_by_fkey(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })

    if (status === 'active') {
      query = query.eq('is_active', true).or('use_count.lt.max_uses,max_uses.is.null')
    } else if (status === 'used') {
      query = query.gt('use_count', 0)
    } else if (status === 'expired') {
      query = query.lt('expires_at', new Date().toISOString())
    }

    const { data: invites, error } = await query

    if (error) throw error

    return NextResponse.json(invites || [])
  } catch (error: any) {
    console.error('Invites API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create invite or perform actions
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminMember = await checkAdminStatus(supabase, user.id)
  if (!adminMember) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      const { email, name, role = 'member', expiresInDays, notes, sendEmail: shouldSendEmail } = body

      // Generate unique code
      let code = generateInviteCode()
      let attempts = 0
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from('invite_codes')
          .select('id')
          .eq('code', code)
          .single()

        if (!existing) break
        code = generateInviteCode()
        attempts++
      }

      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null

      const { data: invite, error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          email: email || null,
          name: name || null,
          role,
          invited_by: adminMember.id,
          expires_at: expiresAt,
          notes: notes || null,
        })
        .select()
        .single()

      if (error) throw error

      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'}/join/${code}`

      // Send email if requested and email provided
      if (shouldSendEmail && email) {
        await sendEmail({
          to: email,
          subject: `You're Invited to Join TPC Ministries`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fff; padding: 30px; border: 1px solid #eee; }
                .button { display: inline-block; background: #d4af37; color: #1e3a5f; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>You're Invited!</h1>
                  <p>TPC Ministries</p>
                </div>
                <div class="content">
                  <h2>Hello${name ? ` ${name}` : ''}!</h2>
                  <p>${adminMember.first_name} ${adminMember.last_name} has invited you to join the TPC Ministries platform.</p>
                  <p>As a member, you'll have access to:</p>
                  <ul>
                    <li>Daily scripture and devotionals</li>
                    <li>Teachings and spiritual content</li>
                    <li>Prayer requests and community</li>
                    <li>Events and live streams</li>
                    <li>And much more!</li>
                  </ul>
                  <p style="text-align: center;">
                    <a href="${inviteUrl}" class="button">Accept Invitation</a>
                  </p>
                  <p style="font-size: 14px; color: #666;">
                    Or copy this link: ${inviteUrl}
                  </p>
                  ${expiresAt ? `<p style="font-size: 12px; color: #999;">This invitation expires on ${new Date(expiresAt).toLocaleDateString()}</p>` : ''}
                </div>
                <div class="footer">
                  <p>TPC Ministries - Empowering Your Spiritual Journey</p>
                </div>
              </div>
            </body>
            </html>
          `,
        })
      }

      return NextResponse.json({
        success: true,
        invite,
        inviteUrl,
        emailSent: shouldSendEmail && email,
      })
    }

    if (action === 'bulk_create') {
      const { invites: inviteList, expiresInDays, sendEmails } = body

      const results = []
      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null

      for (const inv of inviteList) {
        let code = generateInviteCode()

        const { data: invite, error } = await supabase
          .from('invite_codes')
          .insert({
            code,
            email: inv.email || null,
            name: inv.name || null,
            role: inv.role || 'member',
            invited_by: adminMember.id,
            expires_at: expiresAt,
          })
          .select()
          .single()

        if (error) {
          results.push({ ...inv, success: false, error: error.message })
          continue
        }

        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'}/join/${code}`

        if (sendEmails && inv.email) {
          try {
            await sendEmail({
              to: inv.email,
              subject: `You're Invited to Join TPC Ministries`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
                    <h1>You're Invited!</h1>
                  </div>
                  <div style="padding: 20px;">
                    <p>Hello${inv.name ? ` ${inv.name}` : ''}!</p>
                    <p>You've been invited to join TPC Ministries.</p>
                    <p style="text-align: center;">
                      <a href="${inviteUrl}" style="display: inline-block; background: #d4af37; color: #1e3a5f; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Now</a>
                    </p>
                  </div>
                </div>
              `,
            })
            results.push({ ...inv, success: true, code, inviteUrl, emailSent: true })
          } catch (emailError) {
            results.push({ ...inv, success: true, code, inviteUrl, emailSent: false })
          }
        } else {
          results.push({ ...inv, success: true, code, inviteUrl })
        }
      }

      return NextResponse.json({
        success: true,
        results,
        created: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      })
    }

    if (action === 'deactivate') {
      const { inviteId } = body

      const { error } = await supabase
        .from('invite_codes')
        .update({ is_active: false })
        .eq('id', inviteId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      const { inviteId } = body

      const { error } = await supabase.from('invite_codes').delete().eq('id', inviteId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'resend') {
      const { inviteId } = body

      const { data: invite, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('id', inviteId)
        .single()

      if (error || !invite) {
        return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
      }

      if (!invite.email) {
        return NextResponse.json({ error: 'No email associated with this invite' }, { status: 400 })
      }

      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tpcmin.org'}/join/${invite.code}`

      await sendEmail({
        to: invite.email,
        subject: `Reminder: You're Invited to Join TPC Ministries`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
              <h1>Reminder: You're Invited!</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hello${invite.name ? ` ${invite.name}` : ''}!</p>
              <p>Just a friendly reminder that you've been invited to join TPC Ministries.</p>
              <p style="text-align: center;">
                <a href="${inviteUrl}" style="display: inline-block; background: #d4af37; color: #1e3a5f; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Now</a>
              </p>
            </div>
          </div>
        `,
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Invites API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

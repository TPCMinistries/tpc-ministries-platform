import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

// Helper function to check admin status
async function checkAdminStatus(supabase: any, userId: string) {
  const { data: adminMember } = await supabase
    .from('members')
    .select('is_admin, id')
    .eq('user_id', userId)
    .single()

  return adminMember
}

// GET - List inbox emails
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await checkAdminStatus(supabase, user.id)
    if (!admin?.is_admin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const folder = searchParams.get('folder') || 'inbox'
    const search = searchParams.get('search')
    const unreadOnly = searchParams.get('unread') === 'true'

    let query = supabase
      .from('inbox_emails')
      .select(`
        *,
        members:member_id (
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('folder', folder)
      .order('received_at', { ascending: false })
      .limit(100)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    if (search) {
      query = query.or(`subject.ilike.%${search}%,from_email.ilike.%${search}%,body_text.ilike.%${search}%`)
    }

    const { data: emails, error } = await query

    if (error) throw error

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('inbox_emails')
      .select('*', { count: 'exact', head: true })
      .eq('folder', 'inbox')
      .eq('is_read', false)

    // Get sent emails if requested
    let sentEmails = []
    if (folder === 'sent') {
      const { data: sent } = await supabase
        .from('sent_emails')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100)
      sentEmails = sent || []
    }

    return NextResponse.json({
      success: true,
      emails: folder === 'sent' ? sentEmails : emails,
      unreadCount: unreadCount || 0
    })
  } catch (error) {
    console.error('Error fetching inbox:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inbox' },
      { status: 500 }
    )
  }
}

// POST - Send a reply or new email
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await checkAdminStatus(supabase, user.id)
    if (!admin?.is_admin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { to, subject, html, replyToId, threadId } = body

    if (!to || !subject || !html) {
      return NextResponse.json({
        success: false,
        error: 'To, subject, and message are required'
      }, { status: 400 })
    }

    // Send email via Resend
    const result = await sendEmail({
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      from: 'TPC Ministries <info@tpcmin.com>'
    })

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to send email'
      }, { status: 500 })
    }

    // Store in sent_emails
    await supabase.from('sent_emails').insert({
      to_emails: Array.isArray(to) ? to : [to],
      subject,
      body_html: html,
      thread_id: threadId || null,
      in_reply_to: replyToId || null,
      sent_by: admin.id,
      resend_id: (result.data as any)?.id || null,
      status: 'sent'
    })

    // Mark original as read if replying
    if (replyToId) {
      await supabase
        .from('inbox_emails')
        .update({ is_read: true })
        .eq('id', replyToId)
    }

    return NextResponse.json({ success: true, message: 'Email sent' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

// PATCH - Update email (mark read, star, archive, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await checkAdminStatus(supabase, user.id)
    if (!admin?.is_admin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ids, is_read, is_starred, is_archived, folder } = body

    const updates: any = {}
    if (is_read !== undefined) updates.is_read = is_read
    if (is_starred !== undefined) updates.is_starred = is_starred
    if (is_archived !== undefined) updates.is_archived = is_archived
    if (folder !== undefined) updates.folder = folder

    if (ids && Array.isArray(ids)) {
      // Bulk update
      const { error } = await supabase
        .from('inbox_emails')
        .update(updates)
        .in('id', ids)

      if (error) throw error
    } else if (id) {
      // Single update
      const { error } = await supabase
        .from('inbox_emails')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update email' },
      { status: 500 }
    )
  }
}

// DELETE - Delete email(s)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await checkAdminStatus(supabase, user.id)
    if (!admin?.is_admin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const ids = searchParams.get('ids')?.split(',')

    if (ids && ids.length > 0) {
      // Move to trash or permanently delete if already in trash
      const { data: emails } = await supabase
        .from('inbox_emails')
        .select('folder')
        .in('id', ids)

      const inTrash = emails?.every(e => e.folder === 'trash')

      if (inTrash) {
        await supabase.from('inbox_emails').delete().in('id', ids)
      } else {
        await supabase
          .from('inbox_emails')
          .update({ folder: 'trash' })
          .in('id', ids)
      }
    } else if (id) {
      const { data: email } = await supabase
        .from('inbox_emails')
        .select('folder')
        .eq('id', id)
        .single()

      if (email?.folder === 'trash') {
        await supabase.from('inbox_emails').delete().eq('id', id)
      } else {
        await supabase
          .from('inbox_emails')
          .update({ folder: 'trash' })
          .eq('id', id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete email' },
      { status: 500 }
    )
  }
}

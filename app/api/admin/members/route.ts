import { requireStaff } from '@/lib/auth-server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - List all members with tags
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const tier = searchParams.get('tier')
    const tag = searchParams.get('tag')

    let query = supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (tier && tier !== 'all') {
      query = query.eq('tier', tier)
    }

    const { data: members, error } = await query

    if (error) throw error

    // Fetch tags for all members
    const { data: memberTags } = await supabase
      .from('member_tags')
      .select('member_id, tag_id, tags(id, name, color)')

    // Fetch all available tags
    const { data: allTags } = await supabase
      .from('tags')
      .select('*')
      .order('name')

    // Group tags by member
    const tagsByMember: Record<string, any[]> = {}
    memberTags?.forEach((mt: any) => {
      if (!tagsByMember[mt.member_id]) {
        tagsByMember[mt.member_id] = []
      }
      if (mt.tags) {
        tagsByMember[mt.member_id].push(mt.tags)
      }
    })

    // Attach tags to members and filter by tag if needed
    let membersWithTags = members?.map(member => ({
      ...member,
      tags: tagsByMember[member.id] || []
    })) || []

    // Filter by tag if specified
    if (tag && tag !== 'all') {
      membersWithTags = membersWithTags.filter(m =>
        m.tags.some((t: any) => t.id === tag)
      )
    }

    // Calculate stats
    const stats = {
      total: members?.length || 0,
      covenant: members?.filter(m => m.tier === 'covenant').length || 0,
      partner: members?.filter(m => m.tier === 'partner').length || 0,
      free: members?.filter(m => m.tier === 'free').length || 0,
      admins: members?.filter(m => m.is_admin).length || 0,
    }

    return NextResponse.json({
      success: true,
      members: membersWithTags,
      availableTags: allTags || [],
      stats,
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST - Create a new member
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const {
      first_name,
      last_name,
      email,
      phone,
      role = 'free',
      tier = 'free',
      is_admin = false,
      tags = [],
      notes
    } = body

    if (!first_name || !last_name || !email) {
      return NextResponse.json({
        success: false,
        error: 'First name, last name, and email are required'
      }, { status: 400 })
    }

    // Check if email already exists
    const supabase = createAdminClient()
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'A member with this email already exists'
      }, { status: 400 })
    }

    // Create member record
    const { data: newMember, error: memberError } = await supabase
      .from('members')
      .insert({
        first_name,
        last_name,
        email,
        phone,
        role,
        tier,
        is_admin,
        notes,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (memberError) throw memberError

    // Add tags if provided
    if (tags.length > 0 && newMember) {
      const tagInserts = tags.map((tagId: string) => ({
        member_id: newMember.id,
        tag_id: tagId
      }))
      await supabase.from('member_tags').insert(tagInserts)
    }

    return NextResponse.json({ success: true, member: newMember })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create member' },
      { status: 500 }
    )
  }
}

// PATCH - Update member
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { id, tags, ...updates } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Member ID is required'
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Update member if there are updates
    if (Object.keys(updates).length > 0) {
      const { error: memberError } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)

      if (memberError) throw memberError
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing tags
      await supabase.from('member_tags').delete().eq('member_id', id)

      // Add new tags
      if (tags.length > 0) {
        const tagInserts = tags.map((tagId: string) => ({
          member_id: id,
          tag_id: tagId
        }))
        await supabase.from('member_tags').insert(tagInserts)
      }
    }

    // Fetch updated member
    const { data: updatedMember } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()

    return NextResponse.json({ success: true, member: updatedMember })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE - Delete member
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireStaff()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Member ID is required'
      }, { status: 400 })
    }

    // Don't allow deleting yourself
    const supabase = createAdminClient()
    const { data: targetMember } = await supabase
      .from('members')
      .select('user_id')
      .eq('id', id)
      .single()

    if (targetMember?.user_id === authResult.user.id) {
      return NextResponse.json({
        success: false,
        error: 'You cannot delete your own account'
      }, { status: 400 })
    }

    // Delete member tags first
    await supabase.from('member_tags').delete().eq('member_id', id)

    // Delete member
    const { error } = await supabase.from('members').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminMember } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!adminMember || adminMember.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const tier = searchParams.get('tier')

    let query = supabase
      .from('members')
      .select(`
        id,
        full_name,
        email,
        tier,
        is_active,
        created_at,
        last_active_at
      `)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (tier && tier !== 'all') {
      query = query.eq('tier', tier)
    }

    const { data: members, error } = await query

    if (error) throw error

    // Calculate stats
    const stats = {
      total: members.length,
      covenant: members.filter(m => m.tier === 'covenant').length,
      partner: members.filter(m => m.tier === 'partner').length,
      free: members.filter(m => m.tier === 'free').length,
      active: members.filter(m => m.is_active).length,
    }

    return NextResponse.json({
      success: true,
      members,
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

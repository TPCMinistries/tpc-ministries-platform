import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Export members to CSV
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'
    const role = searchParams.get('role')
    const tier = searchParams.get('tier')

    // Build query
    let query = supabase
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone_number,
        role,
        tier,
        bio,
        city,
        state,
        country,
        created_at,
        last_login_at,
        login_count
      `)
      .order('created_at', { ascending: false })

    if (role) query = query.eq('role', role)
    if (tier) query = query.eq('tier', tier)

    const { data: members, error } = await query

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    // Log the export action
    await supabase.from('admin_audit_log').insert({
      admin_id: member.id,
      action: 'export',
      entity_type: 'members',
      details: { count: members?.length || 0, format, filters: { role, tier } }
    })

    if (format === 'json') {
      return NextResponse.json({ members })
    }

    // Generate CSV
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Role',
      'Tier',
      'Bio',
      'City',
      'State',
      'Country',
      'Joined Date',
      'Last Login',
      'Login Count'
    ]

    const rows = members?.map(m => [
      m.id,
      m.first_name || '',
      m.last_name || '',
      m.email || '',
      m.phone_number || '',
      m.role || '',
      m.tier || '',
      (m.bio || '').replace(/"/g, '""').replace(/\n/g, ' '),
      m.city || '',
      m.state || '',
      m.country || '',
      m.created_at ? new Date(m.created_at).toLocaleDateString() : '',
      m.last_login_at ? new Date(m.last_login_at).toLocaleDateString() : '',
      m.login_count || 0
    ]) || []

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="members-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch audit log entries
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin/staff
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const entityType = searchParams.get('entity_type')
    const adminId = searchParams.get('admin_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('admin_audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (action) query = query.eq('action', action)
    if (entityType) query = query.eq('entity_type', entityType)
    if (adminId) query = query.eq('admin_id', adminId)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    const { data: logs, count, error } = await query

    if (error) {
      console.error('Error fetching audit log:', error)
      return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })
    }

    // Get unique actions and entity types for filters
    const { data: actions } = await supabase
      .from('admin_audit_log')
      .select('action')
      .limit(100)

    const { data: entityTypes } = await supabase
      .from('admin_audit_log')
      .select('entity_type')
      .limit(100)

    const uniqueActions = [...new Set(actions?.map(a => a.action) || [])]
    const uniqueEntityTypes = [...new Set(entityTypes?.map(e => e.entity_type) || [])]

    return NextResponse.json({
      logs: logs || [],
      total: count || 0,
      page,
      limit,
      filters: {
        actions: uniqueActions,
        entityTypes: uniqueEntityTypes
      }
    })
  } catch (error) {
    console.error('Audit log API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Log an admin action
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, last_name, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, entity_type, entity_id, entity_name, details } = body

    if (!action || !entity_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: member.id,
        admin_name: `${member.first_name} ${member.last_name}`,
        action,
        entity_type,
        entity_id,
        entity_name,
        details,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      })

    if (error) {
      console.error('Error logging action:', error)
      return NextResponse.json({ error: 'Failed to log action' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Audit log POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

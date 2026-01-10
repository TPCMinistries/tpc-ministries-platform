import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch admin tasks
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
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assigned_to')
    const priority = searchParams.get('priority')
    const myTasks = searchParams.get('my_tasks') === 'true'

    let query = supabase
      .from('admin_tasks')
      .select(`
        *,
        assigned_to_member:members!admin_tasks_assigned_to_fkey(id, first_name, last_name, avatar_url),
        assigned_by_member:members!admin_tasks_assigned_by_fkey(id, first_name, last_name)
      `)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)
    if (assignedTo) query = query.eq('assigned_to', assignedTo)
    if (myTasks) query = query.eq('assigned_to', member.id)

    const { data: tasks, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // Get staff members for assignment dropdown
    const { data: staff } = await supabase
      .from('members')
      .select('id, first_name, last_name, avatar_url')
      .in('role', ['admin', 'staff'])
      .order('first_name')

    // Get task counts by status
    const { data: statusCounts } = await supabase
      .from('admin_tasks')
      .select('status')

    const counts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      total: statusCounts?.length || 0
    }

    statusCounts?.forEach(t => {
      if (t.status in counts) {
        counts[t.status as keyof typeof counts]++
      }
    })

    return NextResponse.json({
      tasks: tasks || [],
      staff: staff || [],
      counts
    })
  } catch (error) {
    console.error('Tasks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, description, priority, due_date, assigned_to, related_entity_type, related_entity_id } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data: task, error } = await supabase
      .from('admin_tasks')
      .insert({
        title,
        description,
        priority: priority || 'medium',
        due_date,
        assigned_to,
        assigned_by: member.id,
        related_entity_type,
        related_entity_id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: member.id,
      action: 'create',
      entity_type: 'task',
      entity_id: task.id,
      entity_name: title
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Tasks POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a task
export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Handle status changes
    if (updates.status === 'completed') {
      updates.completed_at = new Date().toISOString()
      updates.completed_by = member.id
    }

    updates.updated_at = new Date().toISOString()

    const { data: task, error } = await supabase
      .from('admin_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: member.id,
      action: updates.status === 'completed' ? 'complete' : 'update',
      entity_type: 'task',
      entity_id: id,
      entity_name: task.title,
      details: updates
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Tasks PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a task
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Get task info for logging
    const { data: task } = await supabase
      .from('admin_tasks')
      .select('title')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('admin_tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting task:', error)
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }

    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: member.id,
      action: 'delete',
      entity_type: 'task',
      entity_id: id,
      entity_name: task?.title
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tasks DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

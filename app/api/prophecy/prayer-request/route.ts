import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { category, request_text } = body

    // Validate required fields
    if (!category || !request_text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the prayer request
    const { data, error } = await supabase
      .from('prophecy_prayer_requests')
      .insert({
        member_id: user.id,
        category,
        request_text,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating prayer request:', error)
      return NextResponse.json(
        { error: 'Failed to create prayer request' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Prayer request submitted successfully', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in prayer request API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'

    if (isAdmin) {
      // TODO: Check if user is admin
      // For now, allow all authenticated users to see admin view

      // Get all prayer requests for admin
      const { data, error } = await supabase
        .from('prophecy_prayer_requests')
        .select(`
          id,
          category,
          request_text,
          status,
          admin_response,
          created_at,
          member_id,
          members:member_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching prayer requests (admin):', error)
        return NextResponse.json(
          { error: 'Failed to fetch prayer requests' },
          { status: 500 }
        )
      }

      // Transform data
      const transformedData = data.map((request) => ({
        ...request,
        member_name: request.members?.raw_user_meta_data?.full_name || 'Unknown',
        member_email: request.members?.email || 'Unknown',
        members: undefined,
      }))

      return NextResponse.json(
        { requests: transformedData || [] },
        { status: 200 }
      )
    } else {
      // Get only current user's prayer requests
      const { data, error } = await supabase
        .from('prophecy_prayer_requests')
        .select(`
          id,
          category,
          request_text,
          status,
          admin_response,
          created_at
        `)
        .eq('member_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching prayer requests:', error)
        return NextResponse.json(
          { error: 'Failed to fetch prayer requests' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { requests: data || [] },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error in get prayer requests API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Check if user is admin

    const body = await request.json()
    const { request_id, status, admin_response } = body

    if (!request_id) {
      return NextResponse.json(
        { error: 'Missing request_id' },
        { status: 400 }
      )
    }

    const updates: any = {}
    if (status) updates.status = status
    if (admin_response !== undefined) updates.admin_response = admin_response

    // Update the prayer request
    const { data, error } = await supabase
      .from('prophecy_prayer_requests')
      .update(updates)
      .eq('id', request_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating prayer request:', error)
      return NextResponse.json(
        { error: 'Failed to update prayer request' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Prayer request updated successfully', data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in update prayer request API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

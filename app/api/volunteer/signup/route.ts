import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get user's volunteer signups
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const upcoming = searchParams.get('upcoming') === 'true'

    let query = supabase
      .from('volunteer_signups')
      .select(`
        *,
        shift:volunteer_shifts(
          *,
          opportunity:volunteer_opportunities(id, title, ministry_area)
        )
      `)
      .eq('member_id', member.id)
      .order('signed_up_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('shift.shift_date', today)
    }

    const { data: signups, error } = await query

    if (error) {
      console.error('Error fetching signups:', error)
      return NextResponse.json({ error: 'Failed to fetch signups' }, { status: 500 })
    }

    // Get total volunteer hours
    const { data: hoursData } = await supabase
      .from('volunteer_hours')
      .select('hours')
      .eq('member_id', member.id)

    const totalHours = hoursData?.reduce((sum, h) => sum + Number(h.hours), 0) || 0

    return NextResponse.json({ signups, totalHours })
  } catch (error) {
    console.error('Error in signups GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Sign up for a shift
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    const { shift_id, notes } = body

    if (!shift_id) {
      return NextResponse.json({ error: 'shift_id required' }, { status: 400 })
    }

    // Check if shift has available slots
    const { data: shift } = await supabase
      .from('volunteer_shifts')
      .select('slots_available, slots_filled')
      .eq('id', shift_id)
      .single()

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    if (shift.slots_filled >= shift.slots_available) {
      return NextResponse.json({ error: 'No available slots' }, { status: 400 })
    }

    // Check if already signed up
    const { data: existing } = await supabase
      .from('volunteer_signups')
      .select('id')
      .eq('shift_id', shift_id)
      .eq('member_id', member.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already signed up for this shift' }, { status: 400 })
    }

    // Create signup
    const { data: signup, error: insertError } = await supabase
      .from('volunteer_signups')
      .insert({
        shift_id,
        member_id: member.id,
        notes,
        status: 'confirmed'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating signup:', insertError)
      return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 })
    }

    // Update slots filled
    await supabase
      .from('volunteer_shifts')
      .update({ slots_filled: shift.slots_filled + 1 })
      .eq('id', shift_id)

    return NextResponse.json({ signup, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error in signups POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Cancel signup
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const signupId = searchParams.get('id')

    if (!signupId) {
      return NextResponse.json({ error: 'Signup ID required' }, { status: 400 })
    }

    // Get the signup to find shift
    const { data: signup } = await supabase
      .from('volunteer_signups')
      .select('shift_id')
      .eq('id', signupId)
      .eq('member_id', member.id)
      .single()

    if (!signup) {
      return NextResponse.json({ error: 'Signup not found' }, { status: 404 })
    }

    // Update status to cancelled
    const { error } = await supabase
      .from('volunteer_signups')
      .update({ status: 'cancelled' })
      .eq('id', signupId)
      .eq('member_id', member.id)

    if (error) {
      console.error('Error cancelling signup:', error)
      return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 })
    }

    // Decrement slots filled
    const { data: shift } = await supabase
      .from('volunteer_shifts')
      .select('slots_filled')
      .eq('id', signup.shift_id)
      .single()

    if (shift && shift.slots_filled > 0) {
      await supabase
        .from('volunteer_shifts')
        .update({ slots_filled: shift.slots_filled - 1 })
        .eq('id', signup.shift_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in signups DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

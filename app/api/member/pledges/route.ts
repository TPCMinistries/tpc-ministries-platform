import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get current user's giving pledges
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member ID
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get pledges with fund info
    const { data: pledges, error: pledgesError } = await supabase
      .from('giving_pledges')
      .select(`
        id,
        amount,
        frequency,
        start_date,
        end_date,
        notes,
        is_active,
        created_at,
        fund:giving_funds(id, name, description)
      `)
      .eq('member_id', member.id)
      .order('created_at', { ascending: false })

    if (pledgesError) {
      console.error('Error fetching pledges:', pledgesError)
      return NextResponse.json({ error: 'Failed to fetch pledges' }, { status: 500 })
    }

    // Calculate progress for each pledge
    const pledgesWithProgress = await Promise.all(
      (pledges || []).map(async (pledge) => {
        // Get giving history for this pledge's period
        const startDate = new Date(pledge.start_date)
        const endDate = pledge.end_date ? new Date(pledge.end_date) : new Date()

        const { data: transactions } = await supabase
          .from('giving_transactions')
          .select('amount')
          .eq('member_id', member.id)
          .eq('fund_id', pledge.fund?.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())

        const totalGiven = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

        // Calculate expected amount based on frequency
        const monthsElapsed = Math.max(1, Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        ))

        let expectedAmount = 0
        switch (pledge.frequency) {
          case 'weekly':
            expectedAmount = Number(pledge.amount) * (monthsElapsed * 4)
            break
          case 'monthly':
            expectedAmount = Number(pledge.amount) * monthsElapsed
            break
          case 'quarterly':
            expectedAmount = Number(pledge.amount) * Math.ceil(monthsElapsed / 3)
            break
          case 'yearly':
            expectedAmount = Number(pledge.amount) * Math.ceil(monthsElapsed / 12)
            break
          case 'one-time':
            expectedAmount = Number(pledge.amount)
            break
        }

        const progress = expectedAmount > 0 ? Math.min(100, Math.round((totalGiven / expectedAmount) * 100)) : 0

        return {
          ...pledge,
          total_given: totalGiven,
          expected_amount: expectedAmount,
          progress
        }
      })
    )

    // Calculate overall stats
    const activePledges = pledgesWithProgress.filter(p => p.is_active)
    const totalPledgedMonthly = activePledges.reduce((sum, p) => {
      switch (p.frequency) {
        case 'weekly': return sum + Number(p.amount) * 4
        case 'monthly': return sum + Number(p.amount)
        case 'quarterly': return sum + Number(p.amount) / 3
        case 'yearly': return sum + Number(p.amount) / 12
        default: return sum
      }
    }, 0)

    return NextResponse.json({
      pledges: pledgesWithProgress,
      stats: {
        active_pledges: activePledges.length,
        total_pledged_monthly: Math.round(totalPledgedMonthly * 100) / 100,
        average_progress: activePledges.length > 0
          ? Math.round(activePledges.reduce((sum, p) => sum + p.progress, 0) / activePledges.length)
          : 0
      }
    })
  } catch (error) {
    console.error('Error fetching pledges:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new pledge
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
    const { fund_id, amount, frequency, start_date, end_date, notes } = body

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    if (!frequency || !['weekly', 'monthly', 'quarterly', 'yearly', 'one-time'].includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 })
    }

    const { data: pledge, error: insertError } = await supabase
      .from('giving_pledges')
      .insert({
        member_id: member.id,
        fund_id: fund_id || null,
        amount,
        frequency,
        start_date: start_date || new Date().toISOString().split('T')[0],
        end_date: end_date || null,
        notes: notes || null
      })
      .select(`
        id,
        amount,
        frequency,
        start_date,
        end_date,
        notes,
        is_active,
        created_at,
        fund:giving_funds(id, name, description)
      `)
      .single()

    if (insertError) {
      console.error('Error creating pledge:', insertError)
      return NextResponse.json({ error: 'Failed to create pledge' }, { status: 500 })
    }

    return NextResponse.json({ pledge, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error in pledges POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a pledge
export async function PATCH(request: NextRequest) {
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
    const { id, amount, frequency, end_date, notes, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'Pledge ID is required' }, { status: 400 })
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (amount !== undefined) updates.amount = amount
    if (frequency !== undefined) updates.frequency = frequency
    if (end_date !== undefined) updates.end_date = end_date
    if (notes !== undefined) updates.notes = notes
    if (is_active !== undefined) updates.is_active = is_active

    const { data: pledge, error: updateError } = await supabase
      .from('giving_pledges')
      .update(updates)
      .eq('id', id)
      .eq('member_id', member.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating pledge:', updateError)
      return NextResponse.json({ error: 'Failed to update pledge' }, { status: 500 })
    }

    return NextResponse.json({ pledge, success: true })
  } catch (error) {
    console.error('Error in pledges PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a pledge
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Pledge ID is required' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('giving_pledges')
      .delete()
      .eq('id', id)
      .eq('member_id', member.id)

    if (deleteError) {
      console.error('Error deleting pledge:', deleteError)
      return NextResponse.json({ error: 'Failed to delete pledge' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in pledges DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

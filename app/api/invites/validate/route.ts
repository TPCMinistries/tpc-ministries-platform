import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role for public validation (no user auth required)
function getSupabase() { return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!); }

// GET - Validate an invite code
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 })
  }

  try {
    const { data: invite, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !invite) {
      return NextResponse.json({ valid: false, error: 'Invalid invite code' })
    }

    // Check if active
    if (!invite.is_active) {
      return NextResponse.json({ valid: false, error: 'This invite has been deactivated' })
    }

    // Check if expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This invite has expired' })
    }

    // Check usage limits
    if (invite.max_uses && invite.use_count >= invite.max_uses) {
      return NextResponse.json({ valid: false, error: 'This invite has already been used' })
    }

    return NextResponse.json({
      valid: true,
      invite: {
        code: invite.code,
        name: invite.name,
        email: invite.email,
        role: invite.role,
      },
    })
  } catch (error: any) {
    console.error('Invite validation error:', error)
    return NextResponse.json({ valid: false, error: 'Failed to validate invite' }, { status: 500 })
  }
}

// POST - Mark invite as used
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, memberId } = body

    if (!code) {
      return NextResponse.json({ success: false, error: 'No code provided' }, { status: 400 })
    }

    const { data: invite, error: fetchError } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (fetchError || !invite) {
      return NextResponse.json({ success: false, error: 'Invite not found' }, { status: 404 })
    }

    // Update invite as used
    const { error: updateError } = await supabase
      .from('invite_codes')
      .update({
        use_count: invite.use_count + 1,
        used_at: new Date().toISOString(),
        used_by: memberId || null,
      })
      .eq('id', invite.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Invite use error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

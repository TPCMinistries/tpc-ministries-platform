import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST - Subscribe to the newsletter (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const normalizedEmail = email.trim().toLowerCase()
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Re-subscribe if the email already exists, otherwise insert
    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('id, is_subscribed')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      if (!existing.is_subscribed) {
        const { error } = await supabase
          .from('email_subscribers')
          .update({
            is_subscribed: true,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null
          })
          .eq('id', existing.id)

        if (error) {
          console.error('Newsletter re-subscribe error:', error)
          return NextResponse.json(
            { error: 'Failed to subscribe' },
            { status: 500 }
          )
        }
      }
      return NextResponse.json({ success: true })
    }

    const { error } = await supabase
      .from('email_subscribers')
      .insert({
        email: normalizedEmail,
        name: typeof name === 'string' && name.trim() ? name.trim() : null,
        source: typeof source === 'string' && source.trim() ? source.trim() : 'website'
      })

    if (error) {
      console.error('Newsletter subscribe error:', error)
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

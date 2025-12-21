import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member tier
    const { data: member } = await supabase
      .from('members')
      .select('tier, role')
      .eq('user_id', user.id)
      .single()

    const memberTier = member?.tier || 'free'
    const isAdmin = member?.role === 'admin'

    // Get resource
    const { data: resource, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single()

    if (error || !resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Check tier access
    const tierHierarchy = ['free', 'member', 'partner', 'covenant']
    const memberTierIndex = tierHierarchy.indexOf(memberTier)
    const requiredTierIndex = tierHierarchy.indexOf(resource.tier_required)
    const hasAccess = isAdmin || memberTierIndex >= requiredTierIndex

    if (!hasAccess) {
      return NextResponse.json({
        data: {
          ...resource,
          file_url: null,
          has_access: false,
        },
        required_tier: resource.tier_required,
      })
    }

    // Track download/view
    await supabase
      .from('resources')
      .update({ download_count: resource.download_count + 1 })
      .eq('id', id)

    return NextResponse.json({
      data: {
        ...resource,
        has_access: true,
      },
    })
  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

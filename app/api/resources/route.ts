import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
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

    // Get query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // Build query - only published resources
    let query = supabase
      .from('resources')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,author.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching resources:', error)
      return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
    }

    // Filter by tier access and add locked flag
    const tierHierarchy = ['free', 'member', 'partner', 'covenant']
    const memberTierIndex = tierHierarchy.indexOf(memberTier)

    const resourcesWithAccess = (data || []).map(resource => {
      const requiredTierIndex = tierHierarchy.indexOf(resource.tier_required)
      const hasAccess = isAdmin || memberTierIndex >= requiredTierIndex
      return {
        ...resource,
        has_access: hasAccess,
        // Hide file_url if no access
        file_url: hasAccess ? resource.file_url : null,
      }
    })

    return NextResponse.json({ data: resourcesWithAccess, member_tier: memberTier })
  } catch (error) {
    console.error('Error in resources API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

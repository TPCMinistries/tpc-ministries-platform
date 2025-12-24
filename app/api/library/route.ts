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

    // Get member info
    const { data: member } = await supabase
      .from('members')
      .select('id, tier, role')
      .eq('user_id', user.id)
      .single()

    const memberTier = member?.tier || 'free'
    const isAdmin = member?.role === 'admin'

    // Get query params
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'all'
    const search = searchParams.get('search') || ''
    const tagFilter = searchParams.get('tag') || ''

    // Tier hierarchy for access control
    const tierHierarchy = ['free', 'member', 'partner', 'covenant']
    const memberTierIndex = tierHierarchy.indexOf(memberTier)

    // Fetch teachings
    let teachingsQuery = supabase
      .from('teachings')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (search) {
      teachingsQuery = teachingsQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,speaker.ilike.%${search}%`)
    }

    const { data: teachings } = await teachingsQuery

    // Fetch resources (ebooks)
    let resourcesQuery = supabase
      .from('resources')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (search) {
      resourcesQuery = resourcesQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,author.ilike.%${search}%`)
    }

    const { data: resources } = await resourcesQuery

    // Fetch sermons
    let sermonsQuery = supabase
      .from('sermons')
      .select('*')
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })

    if (search) {
      sermonsQuery = sermonsQuery.or(`title.ilike.%${search}%,speaker.ilike.%${search}%,series_name.ilike.%${search}%`)
    }

    const { data: sermons } = await sermonsQuery

    // Fetch user's teaching progress
    const { data: teachingProgress } = await supabase
      .from('teaching_progress')
      .select('teaching_id, progress_seconds, completed, last_watched_at')
      .eq('user_id', user.id)

    const progressMap = new Map(
      (teachingProgress || []).map(p => [p.teaching_id, p])
    )

    // Combine all content into unified format
    const allContent: any[] = []

    // Add teachings
    for (const teaching of teachings || []) {
      const progress = progressMap.get(teaching.id)
      const progressPercent = progress && teaching.duration_minutes 
        ? Math.round((progress.progress_seconds / (teaching.duration_minutes * 60)) * 100)
        : 0

      // Determine content type
      let contentType = 'article'
      if (teaching.video_url) contentType = 'video'
      else if (teaching.audio_url) contentType = 'audio'

      // Check tier access
      const requiredTierIndex = tierHierarchy.indexOf(teaching.tier_required || 'free')
      const hasAccess = isAdmin || memberTierIndex >= requiredTierIndex

      allContent.push({
        id: teaching.id,
        title: teaching.title,
        description: teaching.description,
        author: teaching.speaker,
        type: contentType,
        source: 'teaching',
        thumbnail_url: teaching.thumbnail_url,
        duration_minutes: teaching.duration_minutes,
        tier_required: teaching.tier_required || 'free',
        has_access: hasAccess,
        progress_percent: progressPercent,
        completed: progress?.completed || false,
        last_accessed: progress?.last_watched_at,
        created_at: teaching.created_at,
        href: `/content/${teaching.id}`,
      })
    }

    // Add resources (ebooks)
    for (const resource of resources || []) {
      const requiredTierIndex = tierHierarchy.indexOf(resource.tier_required || 'free')
      const hasAccess = isAdmin || memberTierIndex >= requiredTierIndex

      allContent.push({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        author: resource.author,
        type: 'ebook',
        source: 'resource',
        thumbnail_url: resource.thumbnail_url,
        tier_required: resource.tier_required || 'free',
        has_access: hasAccess,
        download_count: resource.download_count,
        tags: resource.tags || [],
        created_at: resource.created_at,
        href: `/ebooks/${resource.id}`,
      })
    }

    // Add sermons
    for (const sermon of sermons || []) {
      allContent.push({
        id: sermon.id,
        title: sermon.title,
        description: sermon.description,
        author: sermon.speaker,
        type: 'sermon',
        source: 'sermon',
        thumbnail_url: sermon.thumbnail_url,
        duration_minutes: sermon.duration_minutes,
        tier_required: 'free', // Sermons are typically free
        has_access: true,
        sermon_date: sermon.sermon_date,
        series_name: sermon.series_name,
        video_url: sermon.video_url,
        created_at: sermon.created_at,
        href: `/sermons`, // Sermons page handles detail view inline
      })
    }

    // Filter by tab
    let filteredContent = allContent

    switch (tab) {
      case 'videos':
        filteredContent = allContent.filter(c => c.type === 'video' || c.type === 'sermon')
        break
      case 'audio':
        filteredContent = allContent.filter(c => c.type === 'audio')
        break
      case 'ebooks':
        filteredContent = allContent.filter(c => c.type === 'ebook')
        break
      case 'progress':
        filteredContent = allContent.filter(c =>
          c.progress_percent > 0 || c.completed || c.last_accessed
        )
        break
    }

    // Filter by tag
    if (tagFilter) {
      filteredContent = filteredContent.filter(c =>
        c.tags && c.tags.includes(tagFilter.toLowerCase())
      )
    }

    // Collect all unique tags for filtering options
    const allTags = new Set<string>()
    allContent.forEach(c => {
      if (c.tags) {
        c.tags.forEach((tag: string) => allTags.add(tag))
      }
    })

    // Sort by created_at (newest first) for most tabs, or last_accessed for progress tab
    if (tab === 'progress') {
      filteredContent.sort((a, b) => {
        const dateA = a.last_accessed ? new Date(a.last_accessed).getTime() : 0
        const dateB = b.last_accessed ? new Date(b.last_accessed).getTime() : 0
        return dateB - dateA
      })
    } else {
      filteredContent.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    // Calculate stats
    const stats = {
      total: allContent.length,
      videos: allContent.filter(c => c.type === 'video' || c.type === 'sermon').length,
      audio: allContent.filter(c => c.type === 'audio').length,
      ebooks: allContent.filter(c => c.type === 'ebook').length,
      inProgress: allContent.filter(c => c.progress_percent > 0 && !c.completed).length,
    }

    return NextResponse.json({
      data: filteredContent,
      stats,
      tags: Array.from(allTags).sort(),
      member_tier: memberTier,
    })
  } catch (error) {
    console.error('Error in library API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

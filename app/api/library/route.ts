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
    const memberId = member?.id
    const isAdmin = member?.role === 'admin'

    // Get query params
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'all'
    const search = searchParams.get('search') || ''
    const tagFilter = searchParams.get('tag') || ''
    const seriesFilter = searchParams.get('series') || ''
    const sortBy = searchParams.get('sort') || 'newest'

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

    // Fetch user's watchlist
    const { data: watchlistData } = await supabase
      .from('member_watchlist')
      .select('content_id, content_type')
      .eq('member_id', memberId)

    const watchlistSet = new Set(
      (watchlistData || []).map(w => `${w.content_type}-${w.content_id}`)
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
        view_count: teaching.view_count || 0,
        is_featured: teaching.is_featured || false,
        tags: teaching.tags || [],
        series_name: teaching.series_name,
        created_at: teaching.created_at,
        in_watchlist: watchlistSet.has(`teaching-${teaching.id}`),
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
        download_count: resource.download_count || 0,
        view_count: resource.download_count || 0,
        is_featured: resource.is_featured || false,
        tags: resource.tags || [],
        created_at: resource.created_at,
        in_watchlist: watchlistSet.has(`resource-${resource.id}`),
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
        tier_required: 'free',
        has_access: true,
        sermon_date: sermon.sermon_date,
        series_name: sermon.series_name,
        video_url: sermon.video_url,
        view_count: sermon.view_count || 0,
        is_featured: sermon.is_featured || false,
        created_at: sermon.created_at,
        in_watchlist: watchlistSet.has(`sermon-${sermon.id}`),
        href: `/sermons`,
      })
    }

    // Build special sections

    // Continue Watching - in-progress content sorted by last accessed
    const continueWatching = allContent
      .filter(c => c.progress_percent > 0 && c.progress_percent < 100 && !c.completed)
      .sort((a, b) => {
        const dateA = a.last_accessed ? new Date(a.last_accessed).getTime() : 0
        const dateB = b.last_accessed ? new Date(b.last_accessed).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 10)

    // Recently Added - newest content from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentlyAdded = allContent
      .filter(c => new Date(c.created_at) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    // Featured Content
    const featured = allContent
      .filter(c => c.is_featured)
      .slice(0, 6)

    // Build Series/Collections from sermons and teachings with series_name
    const seriesMap = new Map<string, any[]>()
    allContent.forEach(c => {
      if (c.series_name) {
        if (!seriesMap.has(c.series_name)) {
          seriesMap.set(c.series_name, [])
        }
        seriesMap.get(c.series_name)!.push(c)
      }
    })

    const series = Array.from(seriesMap.entries())
      .map(([name, items]) => ({
        name,
        count: items.length,
        thumbnail: items[0]?.thumbnail_url,
        type: items[0]?.type,
        items: items.sort((a, b) =>
          new Date(a.sermon_date || a.created_at).getTime() -
          new Date(b.sermon_date || b.created_at).getTime()
        )
      }))
      .sort((a, b) => b.count - a.count)

    // Popular Content (by view count)
    const popular = [...allContent]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 10)

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
      case 'watchlist':
        filteredContent = allContent.filter(c => c.in_watchlist)
        break
    }

    // Filter by series
    if (seriesFilter) {
      filteredContent = filteredContent.filter(c => c.series_name === seriesFilter)
    }

    // Filter by tag
    if (tagFilter) {
      filteredContent = filteredContent.filter(c =>
        c.tags && c.tags.includes(tagFilter.toLowerCase())
      )
    }

    // Sort content
    switch (sortBy) {
      case 'oldest':
        filteredContent.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        break
      case 'popular':
        filteredContent.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        break
      case 'duration-short':
        filteredContent.sort((a, b) => (a.duration_minutes || 999) - (b.duration_minutes || 999))
        break
      case 'duration-long':
        filteredContent.sort((a, b) => (b.duration_minutes || 0) - (a.duration_minutes || 0))
        break
      case 'recent-activity':
        filteredContent.sort((a, b) => {
          const dateA = a.last_accessed ? new Date(a.last_accessed).getTime() : 0
          const dateB = b.last_accessed ? new Date(b.last_accessed).getTime() : 0
          return dateB - dateA
        })
        break
      case 'newest':
      default:
        filteredContent.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
    }

    // Collect all unique tags for filtering options
    const allTags = new Set<string>()
    allContent.forEach(c => {
      if (c.tags) {
        c.tags.forEach((tag: string) => allTags.add(tag))
      }
    })

    // Calculate stats
    const stats = {
      total: allContent.length,
      videos: allContent.filter(c => c.type === 'video' || c.type === 'sermon').length,
      audio: allContent.filter(c => c.type === 'audio').length,
      ebooks: allContent.filter(c => c.type === 'ebook').length,
      inProgress: allContent.filter(c => c.progress_percent > 0 && !c.completed).length,
      watchlist: allContent.filter(c => c.in_watchlist).length,
    }

    return NextResponse.json({
      data: filteredContent,
      sections: {
        continueWatching,
        recentlyAdded,
        featured,
        popular,
      },
      series,
      stats,
      tags: Array.from(allTags).sort(),
      member_tier: memberTier,
    })
  } catch (error) {
    console.error('Error in library API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Smart AI Recommendations for Groups, Events, Content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const type = searchParams.get('type') || 'all' // groups, events, content, all

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }

    const now = new Date()
    const recommendations: any = {}

    // Get member profile
    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, tier')
      .eq('id', memberId)
      .single()

    const { data: profile } = await supabase
      .from('member_spiritual_profiles')
      .select('*')
      .eq('member_id', memberId)
      .single()

    // Get member's activity history
    const { data: activities } = await supabase
      .from('member_activity')
      .select('activity_type, content_id, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(100)

    const watchedContentIds = new Set(
      activities?.filter(a => a.activity_type === 'teaching_viewed').map(a => a.content_id) || []
    )

    // ===================
    // GROUP RECOMMENDATIONS
    // ===================
    if (type === 'all' || type === 'groups') {
      // Get groups member is already in
      const { data: memberGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('member_id', memberId)

      const joinedGroupIds = new Set(memberGroups?.map(g => g.group_id) || [])

      // Get all available groups
      const { data: groups } = await supabase
        .from('groups')
        .select('id, name, description, category, meeting_day, meeting_time, max_members')
        .eq('is_active', true)

      // Score and rank groups
      const scoredGroups = (groups || [])
        .filter(g => !joinedGroupIds.has(g.id))
        .map(group => {
          let score = 50

          // Match by category to spiritual gift
          const giftCategories: Record<string, string[]> = {
            prophecy: ['prophetic', 'intercessory', 'worship'],
            teaching: ['bible study', 'discipleship', 'theology'],
            encouragement: ['support', 'fellowship', 'mentoring'],
            giving: ['missions', 'outreach', 'service'],
            leadership: ['leadership', 'ministry', 'evangelism'],
            mercy: ['pastoral care', 'counseling', 'support'],
            service: ['service', 'hospitality', 'outreach']
          }

          const memberGift = profile?.primary_gift?.toLowerCase() || ''
          const groupCategory = group.category?.toLowerCase() || ''

          if (giftCategories[memberGift]?.some(c => groupCategory.includes(c))) {
            score += 30
          }

          // Match by season
          const seasonGroups: Record<string, string[]> = {
            preparation: ['foundation', 'basics', 'new believers'],
            growth: ['discipleship', 'growth', 'training'],
            harvest: ['evangelism', 'outreach', 'missions'],
            rest: ['fellowship', 'support', 'prayer']
          }

          const memberSeason = profile?.current_season?.toLowerCase() || ''
          if (seasonGroups[memberSeason]?.some(s => groupCategory.includes(s) || group.name.toLowerCase().includes(s))) {
            score += 20
          }

          return {
            ...group,
            matchScore: Math.min(100, score),
            matchReason: score > 70 ? 'Great match for your spiritual journey!' :
              score > 50 ? 'Could complement your growth' : 'Explore something new'
          }
        })
        .sort((a, b) => b.matchScore - a.matchScore)

      recommendations.groups = scoredGroups.slice(0, 5)
    }

    // ===================
    // EVENT RECOMMENDATIONS
    // ===================
    if (type === 'all' || type === 'events') {
      // Get upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, description, start_date, end_date, location, event_type, max_attendees')
        .gte('start_date', now.toISOString())
        .order('start_date', { ascending: true })
        .limit(20)

      // Get events member already registered for
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('member_id', memberId)

      const registeredEventIds = new Set(registrations?.map(r => r.event_id) || [])

      // Score events
      const scoredEvents = (events || [])
        .filter(e => !registeredEventIds.has(e.id))
        .map(event => {
          let score = 50
          const eventType = event.event_type?.toLowerCase() || ''
          const eventTitle = event.title?.toLowerCase() || ''

          // Match by interest based on gift
          const giftEvents: Record<string, string[]> = {
            prophecy: ['prophetic', 'worship', 'prayer', 'encounter'],
            teaching: ['conference', 'seminar', 'training', 'bible'],
            encouragement: ['fellowship', 'celebration', 'gathering'],
            giving: ['missions', 'outreach', 'service'],
            leadership: ['leadership', 'conference', 'summit'],
            mercy: ['healing', 'restoration', 'care']
          }

          const memberGift = profile?.primary_gift?.toLowerCase() || ''
          if (giftEvents[memberGift]?.some(e => eventType.includes(e) || eventTitle.includes(e))) {
            score += 30
          }

          // Boost for soon events (within 2 weeks)
          const eventDate = new Date(event.start_date)
          const daysUntil = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (daysUntil <= 14) score += 15
          if (daysUntil <= 7) score += 10

          return {
            ...event,
            matchScore: Math.min(100, score),
            daysUntil,
            matchReason: score > 70 ? 'Highly recommended for you!' :
              score > 50 ? 'Aligned with your interests' : 'New experience awaits'
          }
        })
        .sort((a, b) => b.matchScore - a.matchScore)

      recommendations.events = scoredEvents.slice(0, 5)
    }

    // ===================
    // CONTENT RECOMMENDATIONS
    // ===================
    if (type === 'all' || type === 'content') {
      // Get teachings
      const { data: teachings } = await supabase
        .from('teachings')
        .select('id, title, description, category, duration, views, thumbnail_url')
        .order('created_at', { ascending: false })
        .limit(50)

      // Score teachings
      const scoredTeachings = (teachings || [])
        .filter(t => !watchedContentIds.has(t.id))
        .map(teaching => {
          let score = 50
          const category = teaching.category?.toLowerCase() || ''

          // Match by gift
          if (profile?.primary_gift && category.includes(profile.primary_gift.toLowerCase())) {
            score += 30
          }

          // Match by season
          if (profile?.current_season && category.includes(profile.current_season.toLowerCase())) {
            score += 20
          }

          // Popular content boost
          if (teaching.views > 100) score += 10
          if (teaching.views > 500) score += 10

          return {
            ...teaching,
            matchScore: Math.min(100, score),
            matchReason: score > 70 ? 'Perfect for your journey!' :
              score > 50 ? 'Recommended for you' : 'Expand your knowledge'
          }
        })
        .sort((a, b) => b.matchScore - a.matchScore)

      recommendations.teachings = scoredTeachings.slice(0, 6)

      // Get prophecies
      const { data: prophecies } = await supabase
        .from('prophecies')
        .select('id, title, description, audio_url, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      recommendations.prophecies = prophecies?.slice(0, 3) || []
    }

    // Generate AI summary
    let aiSummary = ''
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Generate a brief, encouraging 2-sentence personalized recommendation summary for a ministry member. Be warm and prophetic.'
          },
          {
            role: 'user',
            content: `Member: ${member?.first_name}
Gift: ${profile?.primary_gift || 'discovering'}
Season: ${profile?.current_season || 'growth'}
Top group match: ${recommendations.groups?.[0]?.name || 'exploring options'}
Top event: ${recommendations.events?.[0]?.title || 'upcoming events'}

Generate a personalized summary of what they should focus on this week.`
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
      aiSummary = response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error generating AI summary:', error)
    }

    return NextResponse.json({
      member: {
        name: member?.first_name,
        gift: profile?.primary_gift,
        season: profile?.current_season
      },
      recommendations,
      aiSummary
    })

  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}

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

// Personalized AI Dashboard for Members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get member info
    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, last_name, tier, created_at')
      .eq('id', memberId)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get spiritual profile
    const { data: profile } = await supabase
      .from('member_spiritual_profiles')
      .select('*')
      .eq('member_id', memberId)
      .single()

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('member_activity')
      .select('activity_type, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get streaks data
    const { data: streakData } = await supabase
      .from('member_streaks')
      .select('*')
      .eq('member_id', memberId)
      .single()

    // Get badges
    const { data: badges } = await supabase
      .from('member_badges')
      .select('badge_id, earned_at, badges(name, description, icon, category)')
      .eq('member_id', memberId)
      .order('earned_at', { ascending: false })

    // Calculate activity stats
    const activityCounts: Record<string, number> = {}
    for (const a of recentActivity || []) {
      activityCounts[a.activity_type] = (activityCounts[a.activity_type] || 0) + 1
    }

    // Get personalized content recommendations
    const primaryGift = profile?.primary_gift || 'wisdom'
    const currentSeason = profile?.current_season || 'growth'

    // Fetch teachings that match their profile
    const { data: recommendedTeachings } = await supabase
      .from('teachings')
      .select('id, title, description, thumbnail_url, duration, category')
      .or(`category.ilike.%${primaryGift}%,category.ilike.%${currentSeason}%`)
      .limit(5)

    // Get teachings they haven't watched
    const { data: watchedIds } = await supabase
      .from('member_activity')
      .select('content_id')
      .eq('member_id', memberId)
      .eq('activity_type', 'teaching_viewed')

    const watchedSet = new Set(watchedIds?.map(w => w.content_id) || [])

    const unwatchedTeachings = recommendedTeachings?.filter(t => !watchedSet.has(t.id)) || []

    // Get prophecies matching their season
    const { data: prophecies } = await supabase
      .from('prophecies')
      .select('id, title, audio_url, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    // Get upcoming events they might like
    const { data: events } = await supabase
      .from('events')
      .select('id, title, start_date, location, event_type')
      .gte('start_date', now.toISOString())
      .order('start_date', { ascending: true })
      .limit(3)

    // Calculate engagement score
    const weeklyActivityCount = recentActivity?.filter(a =>
      new Date(a.created_at) >= sevenDaysAgo
    ).length || 0

    const engagementScore = Math.min(100, (weeklyActivityCount * 10) + (streakData?.current_streak || 0) * 5)

    // Generate AI personalized greeting and insight
    let aiGreeting = `Welcome back, ${member.first_name}!`
    let aiInsight = ''

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a warm, encouraging prophetic ministry assistant. Generate a brief, personalized greeting and spiritual insight for a member. Keep it to 2-3 sentences total. Be warm but not overly effusive.`
          },
          {
            role: 'user',
            content: `Member: ${member.first_name}
Spiritual gift: ${primaryGift || 'not assessed yet'}
Current season: ${currentSeason || 'not identified yet'}
Recent activity: ${Object.keys(activityCounts).slice(0, 3).join(', ') || 'just getting started'}
Current streak: ${streakData?.current_streak || 0} days
Time of day: ${now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}

Generate a warm, personalized greeting and one sentence of spiritual encouragement relevant to their journey.`
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      })

      const content = response.choices[0]?.message?.content || ''
      const parts = content.split('\n').filter(p => p.trim())
      aiGreeting = parts[0] || aiGreeting
      aiInsight = parts.slice(1).join(' ') || ''
    } catch (error) {
      console.error('Error generating AI greeting:', error)
    }

    // Get prayer requests status
    const { data: prayers } = await supabase
      .from('prayer_requests')
      .select('id, title, is_answered, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(5)

    const answeredPrayers = prayers?.filter(p => p.is_answered).length || 0
    const pendingPrayers = prayers?.filter(p => !p.is_answered).length || 0

    // Calculate points and level
    const totalPoints = (streakData?.total_points || 0) + (badges?.length || 0) * 100 + weeklyActivityCount * 10
    const level = Math.floor(totalPoints / 500) + 1
    const pointsToNextLevel = (level * 500) - totalPoints

    // Get community groups they're in
    const { data: groups } = await supabase
      .from('group_members')
      .select('group_id, groups(id, name, description)')
      .eq('member_id', memberId)
      .limit(3)

    // Today's devotional
    const { data: todaysDevotional } = await supabase
      .from('devotionals')
      .select('id, title, scripture_reference, content')
      .lte('publish_date', now.toISOString())
      .order('publish_date', { ascending: false })
      .limit(1)
      .single()

    // Check if they've read today's devotional
    const today = now.toISOString().split('T')[0]
    const { data: readToday } = await supabase
      .from('member_activity')
      .select('id')
      .eq('member_id', memberId)
      .eq('activity_type', 'devotional_read')
      .gte('created_at', today)
      .limit(1)

    const hasReadTodaysDevotional = (readToday?.length || 0) > 0

    return NextResponse.json({
      greeting: {
        message: aiGreeting,
        insight: aiInsight,
        timeOfDay: now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'
      },
      member: {
        firstName: member.first_name,
        tier: member.tier || 'free',
        memberSince: member.created_at
      },
      spiritualProfile: {
        primaryGift: profile?.primary_gift,
        secondaryGift: profile?.secondary_gift,
        currentSeason: profile?.current_season,
        engagementScore
      },
      gamification: {
        level,
        totalPoints,
        pointsToNextLevel,
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
        badgesEarned: badges?.length || 0,
        recentBadges: badges?.slice(0, 3) || []
      },
      todaysActions: {
        devotional: {
          available: !!todaysDevotional,
          completed: hasReadTodaysDevotional,
          data: todaysDevotional
        },
        streakActive: (streakData?.current_streak || 0) > 0
      },
      recommendations: {
        teachings: unwatchedTeachings.slice(0, 3),
        prophecies: prophecies || [],
        events: events || []
      },
      prayers: {
        answered: answeredPrayers,
        pending: pendingPrayers,
        recent: prayers || []
      },
      community: {
        groups: groups?.map(g => g.groups) || []
      },
      weeklyStats: {
        activeDays: new Set(recentActivity?.filter(a =>
          new Date(a.created_at) >= sevenDaysAgo
        ).map(a => new Date(a.created_at).toISOString().split('T')[0])).size,
        totalActions: weeklyActivityCount,
        topActivities: Object.entries(activityCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([type, count]) => ({ type, count }))
      }
    })

  } catch (error) {
    console.error('Error fetching personalized data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personalized data' },
      { status: 500 }
    )
  }
}

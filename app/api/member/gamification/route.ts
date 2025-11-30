import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Badge definitions
const BADGES = {
  // Devotional badges
  first_devotional: { name: 'First Light', description: 'Read your first devotional', icon: '🌅', category: 'devotional', points: 50 },
  devotional_streak_7: { name: 'Week Warrior', description: '7-day devotional streak', icon: '🔥', category: 'devotional', points: 100 },
  devotional_streak_30: { name: 'Monthly Maven', description: '30-day devotional streak', icon: '💎', category: 'devotional', points: 500 },
  devotional_streak_100: { name: 'Century Champion', description: '100-day devotional streak', icon: '👑', category: 'devotional', points: 1000 },

  // Prayer badges
  first_prayer: { name: 'Prayer Warrior', description: 'Submit your first prayer request', icon: '🙏', category: 'prayer', points: 50 },
  prayer_answered: { name: 'Testimony Builder', description: 'First answered prayer', icon: '✨', category: 'prayer', points: 100 },
  prayer_intercessor: { name: 'Intercessor', description: 'Pray for 10 others', icon: '💫', category: 'prayer', points: 200 },

  // Learning badges
  first_teaching: { name: 'Eager Learner', description: 'Watch your first teaching', icon: '📚', category: 'learning', points: 50 },
  teaching_complete_10: { name: 'Knowledge Seeker', description: 'Complete 10 teachings', icon: '🎓', category: 'learning', points: 300 },
  course_complete: { name: 'Graduate', description: 'Complete a PLANT course', icon: '🏆', category: 'learning', points: 500 },

  // Community badges
  first_testimony: { name: 'Voice of Victory', description: 'Share your first testimony', icon: '📢', category: 'community', points: 100 },
  group_joiner: { name: 'Community Builder', description: 'Join a community group', icon: '🤝', category: 'community', points: 75 },
  encourager: { name: 'Encourager', description: 'Encourage 5 members', icon: '💝', category: 'community', points: 150 },

  // Journey badges
  profile_complete: { name: 'Identity Known', description: 'Complete spiritual profile', icon: '🎯', category: 'journey', points: 100 },
  gift_discovered: { name: 'Gift Discovered', description: 'Discover your spiritual gift', icon: '🎁', category: 'journey', points: 150 },
  season_identified: { name: 'Season Seeker', description: 'Identify your current season', icon: '🌱', category: 'journey', points: 100 },

  // Giving badges
  first_gift: { name: 'Generous Heart', description: 'Make your first donation', icon: '💰', category: 'giving', points: 100 },
  partner: { name: 'Partner', description: 'Become a ministry partner', icon: '⭐', category: 'giving', points: 500 },
  covenant_partner: { name: 'Covenant Partner', description: 'Become a covenant partner', icon: '🌟', category: 'giving', points: 1000 },

  // Special badges
  early_adopter: { name: 'Early Adopter', description: 'Joined in the first year', icon: '🚀', category: 'special', points: 200 },
  anniversary_1: { name: 'One Year Strong', description: '1 year membership', icon: '🎂', category: 'special', points: 300 },
  anniversary_3: { name: 'Faithful Friend', description: '3 years membership', icon: '🎊', category: 'special', points: 500 },
}

// Level thresholds
const LEVELS = [
  { level: 1, name: 'Seeker', minPoints: 0, maxPoints: 499 },
  { level: 2, name: 'Believer', minPoints: 500, maxPoints: 1499 },
  { level: 3, name: 'Disciple', minPoints: 1500, maxPoints: 2999 },
  { level: 4, name: 'Minister', minPoints: 3000, maxPoints: 4999 },
  { level: 5, name: 'Prophet', minPoints: 5000, maxPoints: 7499 },
  { level: 6, name: 'Apostle', minPoints: 7500, maxPoints: 9999 },
  { level: 7, name: 'Elder', minPoints: 10000, maxPoints: Infinity },
]

function getLevel(points: number) {
  return LEVELS.find(l => points >= l.minPoints && points <= l.maxPoints) || LEVELS[0]
}

// GET - Get member's gamification data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }

    // Get streak data
    const { data: streakData } = await supabase
      .from('member_streaks')
      .select('*')
      .eq('member_id', memberId)
      .single()

    // Get badges
    const { data: memberBadges } = await supabase
      .from('member_badges')
      .select('badge_id, earned_at')
      .eq('member_id', memberId)

    const earnedBadgeIds = memberBadges?.map(b => b.badge_id) || []
    const earnedBadges = earnedBadgeIds.map(id => ({
      ...BADGES[id as keyof typeof BADGES],
      id,
      earnedAt: memberBadges?.find(b => b.badge_id === id)?.earned_at
    }))

    // Calculate total points
    const totalPoints = (streakData?.total_points || 0)
    const level = getLevel(totalPoints)
    const nextLevel = LEVELS.find(l => l.level === level.level + 1)

    // Get leaderboard position
    const { data: leaderboard } = await supabase
      .from('member_streaks')
      .select('member_id, total_points')
      .order('total_points', { ascending: false })
      .limit(100)

    const position = leaderboard?.findIndex(l => l.member_id === memberId) ?? -1

    // Get available badges (not yet earned)
    const availableBadges = Object.entries(BADGES)
      .filter(([id]) => !earnedBadgeIds.includes(id))
      .map(([id, badge]) => ({ id, ...badge }))

    // Get recent achievements from other members (for social proof)
    const { data: recentAchievements } = await supabase
      .from('member_badges')
      .select(`
        badge_id, earned_at,
        members (first_name, last_name)
      `)
      .order('earned_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      stats: {
        totalPoints,
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
        lastActivity: streakData?.last_activity_date
      },
      level: {
        current: level,
        progress: nextLevel ? {
          current: totalPoints - level.minPoints,
          required: nextLevel.minPoints - level.minPoints,
          percentage: Math.round(((totalPoints - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100)
        } : { current: totalPoints, required: 0, percentage: 100 }
      },
      badges: {
        earned: earnedBadges,
        available: availableBadges,
        totalEarned: earnedBadges.length,
        totalAvailable: Object.keys(BADGES).length
      },
      leaderboard: {
        position: position + 1, // 1-indexed
        isTop10: position < 10,
        isTop100: position < 100
      },
      recentCommunityAchievements: recentAchievements?.map(a => ({
        badge: BADGES[a.badge_id as keyof typeof BADGES],
        memberName: `${(a.members as any)?.first_name} ${((a.members as any)?.last_name || '').charAt(0)}.`,
        earnedAt: a.earned_at
      })) || []
    })

  } catch (error) {
    console.error('Error fetching gamification data:', error)
    return NextResponse.json({ error: 'Failed to fetch gamification data' }, { status: 500 })
  }
}

// POST - Award points or check for new badges
export async function POST(request: NextRequest) {
  try {
    const { memberId, action, points: customPoints } = await request.json()

    if (!memberId || !action) {
      return NextResponse.json({ error: 'memberId and action required' }, { status: 400 })
    }

    // Define point values for actions
    const actionPoints: Record<string, number> = {
      devotional_read: 10,
      teaching_viewed: 15,
      prayer_submitted: 10,
      testimony_shared: 25,
      journal_entry: 10,
      ai_chat: 5,
      group_activity: 15,
      course_progress: 20,
      check_in: 5,
      prophecy_viewed: 10,
    }

    const pointsToAdd = customPoints || actionPoints[action] || 5

    // Get or create streak record
    let { data: streakData } = await supabase
      .from('member_streaks')
      .select('*')
      .eq('member_id', memberId)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    if (!streakData) {
      // Create new streak record
      const { data: newStreak } = await supabase
        .from('member_streaks')
        .insert({
          member_id: memberId,
          current_streak: 1,
          longest_streak: 1,
          total_points: pointsToAdd,
          last_activity_date: today
        })
        .select()
        .single()

      streakData = newStreak
    } else {
      // Update existing streak
      let newStreak = streakData.current_streak
      let longestStreak = streakData.longest_streak

      if (streakData.last_activity_date === yesterday) {
        // Continuing streak
        newStreak++
        if (newStreak > longestStreak) longestStreak = newStreak
      } else if (streakData.last_activity_date !== today) {
        // Streak broken (more than 1 day gap)
        newStreak = 1
      }

      await supabase
        .from('member_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          total_points: streakData.total_points + pointsToAdd,
          last_activity_date: today
        })
        .eq('member_id', memberId)

      streakData.current_streak = newStreak
      streakData.longest_streak = longestStreak
      streakData.total_points += pointsToAdd
    }

    // Check for new badges to award
    const newBadges: string[] = []

    // Get existing badges
    const { data: existingBadges } = await supabase
      .from('member_badges')
      .select('badge_id')
      .eq('member_id', memberId)

    const earnedBadgeIds = new Set(existingBadges?.map(b => b.badge_id) || [])

    // Check streak badges
    if (streakData.current_streak >= 7 && !earnedBadgeIds.has('devotional_streak_7')) {
      newBadges.push('devotional_streak_7')
    }
    if (streakData.current_streak >= 30 && !earnedBadgeIds.has('devotional_streak_30')) {
      newBadges.push('devotional_streak_30')
    }
    if (streakData.current_streak >= 100 && !earnedBadgeIds.has('devotional_streak_100')) {
      newBadges.push('devotional_streak_100')
    }

    // Check first action badges
    if (action === 'devotional_read' && !earnedBadgeIds.has('first_devotional')) {
      newBadges.push('first_devotional')
    }
    if (action === 'prayer_submitted' && !earnedBadgeIds.has('first_prayer')) {
      newBadges.push('first_prayer')
    }
    if (action === 'teaching_viewed' && !earnedBadgeIds.has('first_teaching')) {
      newBadges.push('first_teaching')
    }
    if (action === 'testimony_shared' && !earnedBadgeIds.has('first_testimony')) {
      newBadges.push('first_testimony')
    }

    // Award new badges
    if (newBadges.length > 0) {
      const badgeInserts = newBadges.map(badgeId => ({
        member_id: memberId,
        badge_id: badgeId,
        earned_at: new Date().toISOString()
      }))

      await supabase.from('member_badges').insert(badgeInserts)

      // Add badge points to total
      const badgePoints = newBadges.reduce((sum, id) =>
        sum + (BADGES[id as keyof typeof BADGES]?.points || 0), 0)

      if (badgePoints > 0) {
        await supabase
          .from('member_streaks')
          .update({ total_points: streakData.total_points + badgePoints })
          .eq('member_id', memberId)
      }
    }

    return NextResponse.json({
      success: true,
      pointsAdded: pointsToAdd,
      newBadges: newBadges.map(id => ({ id, ...BADGES[id as keyof typeof BADGES] })),
      currentStreak: streakData.current_streak,
      totalPoints: streakData.total_points + newBadges.reduce((sum, id) =>
        sum + (BADGES[id as keyof typeof BADGES]?.points || 0), 0)
    })

  } catch (error) {
    console.error('Error updating gamification:', error)
    return NextResponse.json({ error: 'Failed to update gamification' }, { status: 500 })
  }
}

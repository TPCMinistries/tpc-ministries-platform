import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

function getSupabase() { return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!); }

function getOpenAI() { return new OpenAI({
  apiKey: process.env.OPENAI_API_KEY }); }

interface MemberProfile {
  id: string
  first_name: string
  last_name: string
  primary_gift?: string
  secondary_gift?: string
  current_season?: string
  prayer_topics?: string[]
  engagement_score?: number
}

// Calculate compatibility score between two members
function calculateCompatibility(member1: MemberProfile, member2: MemberProfile): number {
  let score = 50 // Base score

  // Gift complementarity (different gifts complement each other)
  const gifts = ['prophecy', 'teaching', 'encouragement', 'giving', 'leadership', 'mercy', 'service', 'wisdom', 'faith', 'healing']
  if (member1.primary_gift && member2.primary_gift) {
    if (member1.primary_gift !== member2.primary_gift) {
      score += 15 // Different gifts complement
    }
    if (member1.secondary_gift === member2.primary_gift || member1.primary_gift === member2.secondary_gift) {
      score += 10 // Overlapping secondary/primary
    }
  }

  // Same season (can relate to struggles)
  if (member1.current_season && member2.current_season) {
    if (member1.current_season === member2.current_season) {
      score += 20
    }
  }

  // Similar engagement levels
  const eng1 = member1.engagement_score || 50
  const eng2 = member2.engagement_score || 50
  if (Math.abs(eng1 - eng2) < 20) {
    score += 10
  }

  return Math.min(100, score)
}

// Find prayer partner matches for a member
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }

    // Get the requesting member's profile
    const { data: member } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .eq('id', memberId)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { data: memberProfile } = await supabase
      .from('member_spiritual_profiles')
      .select('*')
      .eq('member_id', memberId)
      .single()

    // Get member's prayer topics
    const { data: memberPrayers } = await supabase
      .from('prayer_requests')
      .select('category')
      .eq('member_id', memberId)
      .eq('is_private', false)
      .limit(10)

    const memberData: MemberProfile = {
      id: member.id,
      first_name: member.first_name,
      last_name: member.last_name,
      primary_gift: memberProfile?.primary_gift,
      secondary_gift: memberProfile?.secondary_gift,
      current_season: memberProfile?.current_season,
      prayer_topics: memberPrayers?.map(p => p.category).filter(Boolean) || [],
      engagement_score: memberProfile?.engagement_score
    }

    // Get existing prayer partnerships to exclude
    const { data: existingPartners } = await supabase
      .from('prayer_partnerships')
      .select('partner_id')
      .eq('member_id', memberId)

    const excludeIds = [memberId, ...(existingPartners?.map(p => p.partner_id) || [])]

    // Get potential partners (active members with profiles)
    const { data: potentialPartners } = await supabase
      .from('members')
      .select(`
        id, first_name, last_name,
        member_spiritual_profiles (
          primary_gift, secondary_gift, current_season, engagement_score
        )
      `)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(50)

    if (!potentialPartners?.length) {
      return NextResponse.json({ matches: [], message: 'No potential partners found' })
    }

    // Calculate compatibility and rank matches
    const matches = potentialPartners.map(partner => {
      const profile = (partner as any).member_spiritual_profiles?.[0] || {}
      const partnerData: MemberProfile = {
        id: partner.id,
        first_name: partner.first_name,
        last_name: partner.last_name,
        primary_gift: profile.primary_gift,
        secondary_gift: profile.secondary_gift,
        current_season: profile.current_season,
        engagement_score: profile.engagement_score
      }

      const compatibility = calculateCompatibility(memberData, partnerData)

      // Generate match reasons
      const reasons: string[] = []
      if (partnerData.primary_gift && memberData.primary_gift !== partnerData.primary_gift) {
        reasons.push(`Complementary gift: ${partnerData.primary_gift}`)
      }
      if (partnerData.current_season === memberData.current_season && partnerData.current_season) {
        reasons.push(`Same spiritual season: ${partnerData.current_season}`)
      }
      if (partnerData.engagement_score && memberData.engagement_score) {
        if (Math.abs(partnerData.engagement_score - memberData.engagement_score) < 20) {
          reasons.push('Similar engagement level')
        }
      }

      return {
        partner: {
          id: partner.id,
          name: `${partner.first_name} ${partner.last_name}`,
          gift: partnerData.primary_gift,
          season: partnerData.current_season
        },
        compatibility,
        reasons
      }
    })

    // Sort by compatibility and return top matches
    matches.sort((a, b) => b.compatibility - a.compatibility)
    const topMatches = matches.slice(0, limit)

    // Generate AI recommendation for the top match
    let aiRecommendation = ''
    if (topMatches.length > 0) {
      try {
        const response = await getOpenAI().chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Generate a brief, encouraging 2-sentence message about why two prayer partners would be a good match. Be warm and spiritual.'
            },
            {
              role: 'user',
              content: `Member 1: ${memberData.first_name}, gift: ${memberData.primary_gift || 'discovering'}, season: ${memberData.current_season || 'growth'}
Member 2: ${topMatches[0].partner.name}, gift: ${topMatches[0].partner.gift || 'discovering'}, season: ${topMatches[0].partner.season || 'growth'}
Compatibility: ${topMatches[0].compatibility}%`
            }
          ],
          max_tokens: 100,
          temperature: 0.8
        })
        aiRecommendation = response.choices[0]?.message?.content || ''
      } catch (error) {
        console.error('Error generating AI recommendation:', error)
      }
    }

    return NextResponse.json({
      matches: topMatches,
      aiRecommendation,
      yourProfile: {
        gift: memberData.primary_gift,
        season: memberData.current_season
      }
    })

  } catch (error) {
    console.error('Error finding prayer partners:', error)
    return NextResponse.json({ error: 'Failed to find prayer partners' }, { status: 500 })
  }
}

// POST - Create a prayer partnership
export async function POST(request: NextRequest) {
  try {
    const { memberId, partnerId } = await request.json()

    if (!memberId || !partnerId) {
      return NextResponse.json({ error: 'memberId and partnerId required' }, { status: 400 })
    }

    // Check if partnership already exists
    const { data: existing } = await supabase
      .from('prayer_partnerships')
      .select('id')
      .or(`member_id.eq.${memberId},member_id.eq.${partnerId}`)
      .or(`partner_id.eq.${memberId},partner_id.eq.${partnerId}`)
      .limit(1)

    if (existing?.length) {
      return NextResponse.json({ error: 'Partnership already exists' }, { status: 400 })
    }

    // Create the partnership (both directions)
    await getSupabase().from('prayer_partnerships').insert([
      { member_id: memberId, partner_id: partnerId, status: 'active' },
      { member_id: partnerId, partner_id: memberId, status: 'active' }
    ])

    // Get partner info for notification
    const { data: partner } = await supabase
      .from('members')
      .select('first_name, last_name')
      .eq('id', partnerId)
      .single()

    // Send notification to partner
    await getSupabase().from('notifications').insert({
      user_id: partnerId,
      type: 'prayer_partner',
      title: 'New Prayer Partner!',
      message: `You've been matched with a new prayer partner. Start praying together!`,
      is_read: false
    })

    return NextResponse.json({
      success: true,
      message: `You are now prayer partners with ${partner?.first_name} ${partner?.last_name}!`
    })

  } catch (error) {
    console.error('Error creating partnership:', error)
    return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
  }
}

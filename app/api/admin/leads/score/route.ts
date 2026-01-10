import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface LeadData {
  id: string
  name: string
  email: string
  phone: string | null
  source: string | null
  interest_level: string | null
  interests: string[] | null
  notes: string | null
  status: string
  created_at: string
  last_contacted_at: string | null
  activities: any[]
}

// POST - Score leads using AI
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { lead_id, score_all } = body

    // Get leads to score
    let leadsToScore: LeadData[] = []

    if (lead_id) {
      // Score specific lead
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', lead_id)
        .single()

      if (lead) {
        // Get lead activities
        const { data: activities } = await supabase
          .from('lead_activities')
          .select('*')
          .eq('lead_id', lead_id)
          .order('created_at', { ascending: false })
          .limit(20)

        leadsToScore = [{ ...lead, activities: activities || [] }]
      }
    } else if (score_all) {
      // Score all unscored or stale leads
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .or(`ai_score.is.null,ai_scored_at.lt.${oneWeekAgo.toISOString()}`)
        .eq('status', 'new')
        .limit(50)

      if (leads) {
        // Get activities for each lead
        for (const lead of leads) {
          const { data: activities } = await supabase
            .from('lead_activities')
            .select('*')
            .eq('lead_id', lead.id)
            .order('created_at', { ascending: false })
            .limit(10)

          leadsToScore.push({ ...lead, activities: activities || [] })
        }
      }
    } else {
      return NextResponse.json({ error: 'lead_id or score_all required' }, { status: 400 })
    }

    if (leadsToScore.length === 0) {
      return NextResponse.json({ message: 'No leads to score', scored: 0 })
    }

    // Score each lead
    const results: { id: string; score: number; priority: string; summary: string }[] = []

    for (const lead of leadsToScore) {
      try {
        const score = await scoreLeadWithAI(lead)
        results.push({ id: lead.id, ...score })

        // Update lead in database
        await supabase
          .from('leads')
          .update({
            ai_score: score.score,
            ai_priority: score.priority,
            ai_summary: score.summary,
            ai_scored_at: new Date().toISOString(),
          })
          .eq('id', lead.id)
      } catch (err) {
        console.error(`Error scoring lead ${lead.id}:`, err)
      }
    }

    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: member.id,
      action: 'ai_score',
      entity_type: 'leads',
      details: { scored: results.length },
    })

    return NextResponse.json({
      success: true,
      scored: results.length,
      results,
    })
  } catch (error) {
    console.error('Lead scoring error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function scoreLeadWithAI(lead: LeadData): Promise<{ score: number; priority: string; summary: string }> {
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  const contactCount = lead.activities.filter(a => a.activity_type === 'contacted').length

  const prompt = `You are an AI lead scoring assistant for a church ministry. Analyze this lead and provide a score from 0-100, a priority level, and a brief summary.

Lead Information:
- Name: ${lead.name}
- Email: ${lead.email}
- Phone: ${lead.phone || 'Not provided'}
- Source: ${lead.source || 'Unknown'}
- Current Interest Level: ${lead.interest_level || 'Unknown'}
- Interests: ${lead.interests?.join(', ') || 'Not specified'}
- Notes: ${lead.notes || 'None'}
- Current Status: ${lead.status}
- Days Since Signup: ${daysSinceCreated}
- Times Contacted: ${contactCount}
- Last Contacted: ${lead.last_contacted_at || 'Never'}

Recent Activities:
${lead.activities.map(a => `- ${a.activity_type}: ${a.description || ''} (${new Date(a.created_at).toLocaleDateString()})`).join('\n') || 'No activities recorded'}

Scoring Criteria:
- Higher scores for: phone number provided, specific interests, recent activity, quick follow-up potential
- Lower scores for: no engagement, very old leads, no contact info

Respond in JSON format:
{
  "score": <0-100>,
  "priority": "hot" | "warm" | "cold",
  "summary": "<2-3 sentence actionable summary>"
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      score: Math.min(100, Math.max(0, result.score || 50)),
      priority: ['hot', 'warm', 'cold'].includes(result.priority) ? result.priority : 'warm',
      summary: result.summary || 'Lead requires manual review.',
    }
  } catch (error) {
    console.error('OpenAI scoring error:', error)

    // Fallback scoring based on basic heuristics
    let score = 50

    // Boost for phone number
    if (lead.phone) score += 15

    // Boost for interests
    if (lead.interests && lead.interests.length > 0) score += 10

    // Boost for hot interest level
    if (lead.interest_level === 'hot') score += 15
    else if (lead.interest_level === 'cold') score -= 10

    // Boost for recent lead
    if (daysSinceCreated < 7) score += 15
    else if (daysSinceCreated > 30) score -= 10

    // Boost for activities
    if (lead.activities.length > 0) score += 10

    score = Math.min(100, Math.max(0, score))

    const priority = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold'

    return {
      score,
      priority,
      summary: `Lead from ${lead.source || 'unknown source'}. ${lead.phone ? 'Has phone number.' : 'No phone.'} ${daysSinceCreated < 7 ? 'New lead - follow up soon.' : ''}`,
    }
  }
}

// GET - Get lead scores summary
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!member || !['admin', 'staff'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get leads with scores
    const { data: leads } = await supabase
      .from('leads')
      .select('id, name, email, ai_score, ai_priority, ai_summary, ai_scored_at, status')
      .not('ai_score', 'is', null)
      .order('ai_score', { ascending: false })
      .limit(100)

    // Get priority counts
    const { data: allLeads } = await supabase
      .from('leads')
      .select('ai_priority')
      .eq('status', 'new')

    const counts = {
      hot: 0,
      warm: 0,
      cold: 0,
      unscored: 0,
    }

    allLeads?.forEach(l => {
      if (!l.ai_priority) counts.unscored++
      else if (l.ai_priority in counts) {
        counts[l.ai_priority as keyof typeof counts]++
      }
    })

    return NextResponse.json({
      leads: leads || [],
      counts,
    })
  } catch (error) {
    console.error('Lead scores GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

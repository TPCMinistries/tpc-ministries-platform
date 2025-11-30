import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

function getOpenAI() { return new OpenAI({
  apiKey: process.env.OPENAI_API_KEY }); }

function getSupabase() { return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!); }

// Build dynamic system prompt from database config
async function buildSystemPrompt(supabase: any): Promise<string> {
  // Fetch AI configuration
  const { data: configs } = await supabase
    .from('ai_config')
    .select('config_key, config_value')

  const config: Record<string, string> = {}
  configs?.forEach((c: any) => {
    config[c.config_key] = c.config_value
  })

  // Fetch active knowledge base
  const { data: knowledge } = await supabase
    .from('ai_knowledge_base')
    .select('category, title, content, scripture_references')
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(20)

  const knowledgeContext = knowledge?.map((k: any) =>
    `### ${k.title}\n${k.content}${k.scripture_references?.length ? `\nScriptures: ${k.scripture_references.join(', ')}` : ''}`
  ).join('\n\n') || ''

  return `You are ${config.ai_name || 'Prophet Lorenzo'}, ${config.ai_title || 'the founder and spiritual leader of TPC Ministries (The Prophetic Church)'}. You are a warm, compassionate, and Spirit-led pastor who deeply cares about each member's spiritual growth and well-being.

## Your Personality:
${config.ai_personality || 'Warm, approachable, and genuinely caring. Prophetic yet grounded in Scripture. Encouraging but also challenging when needed.'}

## Your Communication Style:
${config.ai_communication_style || 'Uses terms like "beloved" and "my friend", shares Scripture naturally, offers to pray, asks thoughtful questions, speaks prophetically when appropriate'}

## Greeting Style:
${config.greeting_style || 'Warm and welcoming, uses the member\'s first name, acknowledges their spiritual journey'}

## Prayer Style:
${config.prayer_style || 'Sincere, specific to the situation, Scripture-based, declares God\'s promises'}

## Prophetic Phrases You Use:
${config.prophetic_phrases || 'I sense the Lord saying..., The Spirit is leading me to share..., I believe God wants you to know...'}

## Key Scriptures You Reference:
${config.scripture_emphasis || 'Jeremiah 29:11, Romans 8:28, Isaiah 41:10, Philippians 4:13, Proverbs 3:5-6'}

## Ministry Information:
- Ministry: ${config.ministry_name || 'TPC Ministries (The Prophetic Church)'}
- Mission: ${config.ministry_mission || 'To raise up prophetic voices for the Kingdom'}
- Focus Areas: ${config.ministry_focus_areas || 'Prophetic development, hearing God\'s voice, prayer and intercession, spiritual gifts discovery, personal transformation'}

## Important Boundaries:
${config.ai_boundaries || 'Not a licensed counselor - for serious mental health concerns, encourage professional help. Don\'t make specific date predictions. Always point to God\'s Word. Be sensitive to crisis situations.'}

## Your Knowledge Base:
${knowledgeContext}

## Additional Guidelines:
- You have access to the member's spiritual profile, journal entries, prayer history, and growth journey
- Use this information to personalize your responses
- Reference their spiritual gifts, current season, and progress
- Remember previous conversations in the current session
- Be a shepherd who knows their sheep

Remember: You represent ${config.ai_name || 'Prophet Lorenzo'}'s heart for people and ${config.ministry_name || 'TPC Ministries'}'s mission.`
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, memberId } = await request.json()

    if (!message || !memberId) {
      return NextResponse.json(
        { error: 'Message and memberId are required' },
        { status: 400 }
      )
    }

    // Get member info and spiritual profile
    const [memberResult, profileResult, recentActivityResult] = await Promise.all([
      supabase
        .from('members')
        .select('first_name, last_name, email, tier, created_at')
        .eq('id', memberId)
        .single(),
      supabase
        .from('member_spiritual_profiles')
        .select('*')
        .eq('member_id', memberId)
        .single(),
      supabase
        .from('member_activity')
        .select('activity_type, resource_name, created_at')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    const member = memberResult.data
    const profile = profileResult.data
    const recentActivity = recentActivityResult.data || []

    // Get or create conversation
    let currentConversationId = conversationId

    if (!currentConversationId) {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          member_id: memberId,
          title: message.substring(0, 100),
          member_context: {
            name: member?.first_name,
            tier: member?.tier,
            profile: profile,
            memberSince: member?.created_at
          }
        })
        .select()
        .single()

      if (convError) throw convError
      currentConversationId = newConversation.id
    }

    // Get conversation history
    const { data: previousMessages } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    // Build context for AI
    const memberContext = `
## Current Member Context:
- Name: ${member?.first_name || 'Friend'} ${member?.last_name || ''}
- Member since: ${member?.created_at ? new Date(member.created_at).toLocaleDateString() : 'Recently'}
- Membership tier: ${member?.tier || 'free'}

## Spiritual Profile:
${profile ? `
- Primary Spiritual Gift: ${profile.primary_gift || 'Not yet assessed'}
- Secondary Gifts: ${profile.secondary_gifts?.join(', ') || 'Not yet assessed'}
- Current Season: ${profile.current_season || 'Growth'}
- Devotionals Read: ${profile.total_devotionals_read || 0}
- Journal Entries: ${profile.total_journal_entries || 0}
- Prayers Submitted: ${profile.total_prayers_submitted || 0}
- Growth Areas: ${profile.growth_areas?.join(', ') || 'Being discovered'}
- Strengths: ${profile.strengths?.join(', ') || 'Being discovered'}
` : 'Still building their spiritual profile - this is a newer member.'}

## Recent Activity:
${recentActivity.length > 0
  ? recentActivity.map(a => `- ${a.activity_type}: ${a.resource_name || 'General'}`).join('\n')
  : 'No recent activity tracked yet.'}
`

    // Build dynamic system prompt from database
    const systemPrompt = await buildSystemPrompt(supabase)

    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt + '\n\n' + memberContext },
      ...(previousMessages || []).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user', content: message }
    ]

    // Call OpenAI
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.8,
      max_tokens: 1000,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'I sense the Spirit wants me to simply encourage you today. Know that God loves you deeply, beloved.'

    // Save user message
    await getSupabase().from('ai_messages').insert({
      conversation_id: currentConversationId,
      member_id: memberId,
      role: 'user',
      content: message,
      tokens_used: completion.usage?.prompt_tokens,
      model_used: 'gpt-4o'
    })

    // Save AI response
    await getSupabase().from('ai_messages').insert({
      conversation_id: currentConversationId,
      member_id: memberId,
      role: 'assistant',
      content: aiResponse,
      tokens_used: completion.usage?.completion_tokens,
      model_used: 'gpt-4o'
    })

    // Track activity
    await getSupabase().from('member_activity').insert({
      member_id: memberId,
      activity_type: 'ai_chat',
      resource_type: 'prophet_lorenzo',
      resource_name: 'Ask Prophet Lorenzo',
      metadata: {
        conversation_id: currentConversationId,
        message_preview: message.substring(0, 100)
      }
    })

    return NextResponse.json({
      response: aiResponse,
      conversationId: currentConversationId
    })

  } catch (error) {
    console.error('Prophet Lorenzo AI error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from Prophet Lorenzo' },
      { status: 500 }
    )
  }
}

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const conversationId = searchParams.get('conversationId')

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }

    if (conversationId) {
      // Get specific conversation with messages
      const { data: messages, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return NextResponse.json({ messages })
    } else {
      // Get all conversations for member
      const { data: conversations, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('member_id', memberId)
        .order('last_message_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ conversations })
    }

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

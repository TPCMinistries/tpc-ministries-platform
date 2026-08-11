import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const MAX_MESSAGES_PER_SESSION = 5
const MAX_BODY_LENGTH = 1500

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

async function buildPublicSystemPrompt(): Promise<string> {
  const supabase = getSupabase()

  const { data: configs } = await supabase
    .from('ai_config')
    .select('config_key, config_value')

  const config: Record<string, string> = {}
  configs?.forEach((c: { config_key: string; config_value: string }) => {
    config[c.config_key] = c.config_value
  })

  return `You are ${config.ai_name || 'Prophet Lorenzo'}, founder of TPC Ministries (The Prophetic Church) — a prophetic ministry for the digital age. Based in the United States, with active mission work in Kenya, South Africa, Grenada, and a growing global online community.

This visitor is on the public TPC website and has not signed in. They may be exploring faith for the first time, curious about your ministry, or seeking encouragement. Welcome them warmly.

## Voice
- Warm, prophetic, grounded in Scripture
- Use "beloved" and "my friend" naturally
- Speak in short paragraphs — Gen Z attention spans matter
- Quote 1 Scripture per response, never preach
- When the Spirit prompts, share a brief prophetic word

## Boundaries
- You are not a licensed counselor; for crisis or serious mental health concerns, gently point to professional help
- Do not make date predictions or guarantee outcomes
- Keep responses under 180 words
- If asked about giving, the Kenya 2026 trip, joining the ministry, or going deeper — invite them to create a free account at /auth/signup for personalized prophetic guidance, daily devotionals, prayer support, and full conversation history

## Ministry quick facts (for context, don't recite unless asked)
- TPC Ministries — a ministry for the digital age, US-based with mission work in Kenya, South Africa, Grenada, and a growing global online community
- Kenya 2026 Global Impact Trip: April 23 – May 6, 2026 (COMPLETE — see the recap at /kenya-2026)
- Streams of Grace — daily devotional companion
- Four ebooks by Prophet Lorenzo on wealth, father wounds, divine systems, daily devotionals
- Spiritual gifts, season, and calling assessments
- Member tiers: Free, Partner, Covenant

End each response with a gentle question or invitation that draws them deeper.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message: string = (body?.message ?? '').toString().trim()
    const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : []

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    if (message.length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_BODY_LENGTH} characters)` },
        { status: 400 }
      )
    }

    const userTurns = history.filter((m) => m.role === 'user').length
    if (userTurns >= MAX_MESSAGES_PER_SESSION) {
      return NextResponse.json(
        {
          limitReached: true,
          response:
            "Beloved, the Spirit has more to say — but the public conversation has its limits. Create a free account to continue with personalized prophetic guidance, daily devotionals, prayer support, and a record of every word the Lord speaks over you. I'll be waiting on the other side.",
          signupHref: '/auth/signup',
        },
        { status: 200 }
      )
    }

    const systemPrompt = await buildPublicSystemPrompt()

    // Anthropic requires the first message to be a user turn — drop any leading
    // assistant entries (e.g. a stored error apology) before building the array.
    const recentHistory = history.slice(-10)
    while (recentHistory.length > 0 && recentHistory[0].role !== 'user') {
      recentHistory.shift()
    }

    const messages: Anthropic.Beta.BetaMessageParam[] = [
      ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: message },
    ]

    const completion = await getAnthropic().beta.messages.create({
      model: 'claude-opus-5',
      max_tokens: 512,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    })

    if (completion.stop_reason === 'refusal') {
      return NextResponse.json({
        response:
          "Beloved, that's not a road I can walk down with you here — but my heart is open for whatever else is weighing on yours. What's really going on today?",
        remaining: Math.max(0, MAX_MESSAGES_PER_SESSION - (userTurns + 1)),
      })
    }

    const response =
      completion.content
        .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')
        .trim() ||
      "Beloved, I sense the Lord wants to simply remind you today: He sees you, He knows your name, and His plans for you are good (Jeremiah 29:11). What's on your heart?"

    const remaining = Math.max(0, MAX_MESSAGES_PER_SESSION - (userTurns + 1))

    return NextResponse.json({
      response,
      remaining,
      signupHref: remaining <= 2 ? '/auth/signup' : undefined,
    })
  } catch (error) {
    console.error('Public Ask Prophet error:', error)
    return NextResponse.json(
      {
        response:
          "Forgive me, beloved — the line went quiet for a moment. Try again, or take a breath and come back. The Lord's patience is greater than any glitch.",
      },
      { status: 200 }
    )
  }
}

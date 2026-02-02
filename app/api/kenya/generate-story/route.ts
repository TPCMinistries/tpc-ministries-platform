import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      serviceTrack,
      whyGoing,
      fundraisingGoal,
      tone = 'heartfelt', // heartfelt, professional, casual, inspiring
      includeCallToAction = true,
    } = body

    if (!firstName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Map service track to readable label
    const trackLabels: Record<string, string> = {
      'ministry_spiritual': 'Ministry & Spiritual Care',
      'education_youth': 'Education & Youth Development',
      'medical_missions': 'Medical Missions',
      'business_development': 'Business Development & Entrepreneurship',
      'food_security': 'Food Security & Agriculture',
      'material_support': 'Material Support & Distribution',
    }

    const trackLabel = serviceTrack ? trackLabels[serviceTrack] || serviceTrack : 'serving the community'

    const toneInstructions: Record<string, string> = {
      heartfelt: 'Write in a warm, personal, emotionally resonant tone that connects with readers on a heart level.',
      professional: 'Write in a polished, professional tone while still being personable and engaging.',
      casual: 'Write in a friendly, conversational tone like talking to a friend.',
      inspiring: 'Write in an uplifting, motivational tone that inspires action and hope.',
    }

    const prompt = `You are helping ${firstName} ${lastName} write a compelling fundraising story for their Kenya Kingdom Impact Trip 2025 mission trip.

Context:
- Trip: Kenya Kingdom Impact Trip (April 21 - May 7, 2025)
- Service Track: ${trackLabel}
- Fundraising Goal: $${fundraisingGoal?.toLocaleString() || '3,500'}
${whyGoing ? `- Why they're going: ${whyGoing}` : ''}

Tone: ${toneInstructions[tone] || toneInstructions.heartfelt}

Write a 150-200 word fundraising story that:
1. Introduces ${firstName} and their heart for this mission
2. Explains what they'll be doing on the trip (${trackLabel})
3. Shares the impact their service will have
4. ${includeCallToAction ? 'Ends with a warm call to action for supporters' : 'Ends with gratitude'}

Important:
- Write in FIRST PERSON as if ${firstName} is writing
- Be authentic and genuine, not salesy
- Focus on impact and transformation
- Keep it concise but compelling
- Do NOT include a title/headline - just the story content

Write the story now:`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const generatedStory = completion.choices[0]?.message?.content?.trim() || ''

    return NextResponse.json({ story: generatedStory })
  } catch (error: any) {
    console.error('Story generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate story' },
      { status: 500 }
    )
  }
}

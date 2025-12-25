import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type GenerationType =
  | 'subject_line'
  | 'devotional_intro'
  | 'newsletter_summary'
  | 'prophetic_intro'
  | 'teaching_highlight'
  | 'email_body'

interface GenerateRequest {
  type: GenerationType
  context: {
    contentTitle?: string
    contentType?: string
    scripture?: string
    theme?: string
    weekHighlights?: string[]
    topContent?: any[]
    prophecyTitle?: string
    prophecyExcerpt?: string
    teachingTitle?: string
    keyPoints?: string[]
    recipientName?: string
    customPrompt?: string
  }
  tone?: 'warm' | 'urgent' | 'celebratory' | 'reflective' | 'pastoral'
  count?: number // For generating multiple options
}

const systemPrompts: Record<GenerationType, string> = {
  subject_line: `You are an email marketing expert for TPC Ministries, a Christian ministry. Generate compelling email subject lines that are:
- 40-60 characters max
- Engaging and relevant to the content
- Spiritually uplifting without being preachy
- Action-oriented when appropriate
Return only the subject lines, one per line.`,

  devotional_intro: `You are a warm, pastoral writer for TPC Ministries. Write brief introductions (2-3 sentences) for daily devotional emails that:
- Are warm and welcoming
- Set the spiritual tone for the day
- Reference the scripture or theme naturally
- Encourage the reader to engage with the content`,

  newsletter_summary: `You are a newsletter writer for TPC Ministries. Write engaging weekly summary paragraphs (3-4 sentences) that:
- Celebrate what God is doing in the community
- Highlight key achievements without bragging
- Create excitement about upcoming content
- Maintain a warm, family-like tone`,

  prophetic_intro: `You are a respectful, reverent writer introducing prophetic words for TPC Ministries. Write brief introductions (2-3 sentences) that:
- Set a reverent, expectant tone
- Prepare the reader's heart to receive
- Reference any relevant scripture
- Honor the prophetic ministry`,

  teaching_highlight: `You are a content curator for TPC Ministries. Write brief teaching highlights (2-3 sentences) that:
- Capture the essence of the teaching
- Highlight 1-2 key takeaways
- Create interest without giving everything away
- Encourage the reader to watch/listen`,

  email_body: `You are a pastoral communications writer for TPC Ministries. Write full email content that is:
- Warm and personal
- Spiritually grounded
- Clear and easy to read
- Encouraging and actionable`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('members')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body: GenerateRequest = await request.json()
    const { type, context, tone = 'warm', count = 1 } = body

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'AI generation not configured',
        fallback: getFallbackContent(type, context)
      }, { status: 503 })
    }

    // Build the user prompt based on type
    const userPrompt = buildUserPrompt(type, context, tone, count)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompts[type] },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: type === 'email_body' ? 500 : 200,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI error:', errorData)
      return NextResponse.json({
        error: 'AI generation failed',
        fallback: getFallbackContent(type, context)
      }, { status: 500 })
    }

    const data = await response.json()
    const generatedContent = data.choices?.[0]?.message?.content || ''

    // Parse response based on type
    let result: any

    if (type === 'subject_line' && count > 1) {
      // Split multiple subject lines
      result = {
        options: generatedContent.split('\n').filter((line: string) => line.trim()).slice(0, count)
      }
    } else {
      result = {
        content: generatedContent.trim()
      }
    }

    return NextResponse.json({
      success: true,
      type,
      ...result,
      tokensUsed: data.usage?.total_tokens || 0
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function buildUserPrompt(
  type: GenerationType,
  context: GenerateRequest['context'],
  tone: string,
  count: number
): string {
  const toneGuide = `Tone: ${tone}`

  switch (type) {
    case 'subject_line':
      return `Generate ${count} subject line${count > 1 ? 's' : ''} for an email about:
Title: ${context.contentTitle || 'Ministry Update'}
Type: ${context.contentType || 'general'}
${context.theme ? `Theme: ${context.theme}` : ''}
${toneGuide}`

    case 'devotional_intro':
      return `Write a brief intro for a daily devotional:
Title: ${context.contentTitle || 'Daily Devotional'}
Scripture: ${context.scripture || 'Today\'s Scripture'}
Theme: ${context.theme || 'faith and hope'}
${context.recipientName ? `Address the reader as: ${context.recipientName}` : ''}
${toneGuide}`

    case 'newsletter_summary':
      return `Write a weekly summary paragraph for TPC Ministries newsletter.
Highlights to include:
${(context.weekHighlights || ['This week in ministry']).map(h => `- ${h}`).join('\n')}
${toneGuide}`

    case 'prophetic_intro':
      return `Write a brief introduction for a prophetic word:
Title: ${context.prophecyTitle || 'A Word from the Lord'}
${context.prophecyExcerpt ? `Excerpt: ${context.prophecyExcerpt}` : ''}
${context.scripture ? `Related Scripture: ${context.scripture}` : ''}
${toneGuide}`

    case 'teaching_highlight':
      return `Write a brief highlight for this teaching:
Title: ${context.teachingTitle || 'New Teaching'}
${context.keyPoints && context.keyPoints.length > 0 ? `Key Points:\n${context.keyPoints.map(p => `- ${p}`).join('\n')}` : ''}
${toneGuide}`

    case 'email_body':
      return `${context.customPrompt || 'Write an email to our ministry members.'}
${context.contentTitle ? `Topic: ${context.contentTitle}` : ''}
${context.theme ? `Theme: ${context.theme}` : ''}
${context.recipientName ? `Address reader as: ${context.recipientName}` : ''}
${toneGuide}`

    default:
      return context.customPrompt || 'Write content for a ministry email.'
  }
}

function getFallbackContent(type: GenerationType, context: GenerateRequest['context']): string {
  const name = context.recipientName || 'Friend'

  switch (type) {
    case 'subject_line':
      return context.contentTitle
        ? `${context.contentTitle} - TPC Ministries`
        : 'A Word for You Today'

    case 'devotional_intro':
      return `Good morning, ${name}! Today's devotional is a special word we believe will encourage your heart and strengthen your faith.`

    case 'newsletter_summary':
      return `This week has been filled with God's faithfulness at TPC Ministries! We're excited to share what's been happening in our community and what's coming up.`

    case 'prophetic_intro':
      return `The Lord has spoken a word for this season. We invite you to prayerfully receive what the Spirit is saying.`

    case 'teaching_highlight':
      return context.teachingTitle
        ? `Don't miss this powerful teaching: "${context.teachingTitle}". This message will equip and encourage you in your walk with Christ.`
        : `A new teaching has been released that we believe will bless you.`

    case 'email_body':
      return `Dear ${name},\n\nWe wanted to reach out and share something special with you today. Your partnership with TPC Ministries means so much to us.\n\nBlessings,\nTPC Ministries Team`

    default:
      return 'Content from TPC Ministries'
  }
}

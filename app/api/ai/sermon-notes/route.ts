import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

function getSupabase() { return createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!); }

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Generate AI sermon notes from transcript or audio
export async function POST(request: NextRequest) {
  try {
    const { sermonId, transcript, title, speaker } = await request.json()

    if (!transcript && !sermonId) {
      return NextResponse.json({ error: 'transcript or sermonId required' }, { status: 400 })
    }

    let sermonTranscript = transcript
    let sermonTitle = title
    let sermonSpeaker = speaker

    // If sermonId provided, fetch from database
    if (sermonId && !transcript) {
      const { data: sermon } = await supabase
        .from('sermons')
        .select('title, speaker, transcript')
        .eq('id', sermonId)
        .single()

      if (!sermon?.transcript) {
        return NextResponse.json({ error: 'Sermon transcript not found' }, { status: 404 })
      }

      sermonTranscript = sermon.transcript
      sermonTitle = sermon.title
      sermonSpeaker = sermon.speaker
    }

    // Generate structured sermon notes using AI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a skilled sermon note-taker and Bible teacher. Generate comprehensive, well-structured sermon notes from the provided transcript.

Format the notes as follows:
1. **Title**: The sermon title
2. **Speaker**: The speaker's name
3. **Main Scripture**: The primary scripture reference(s)
4. **Theme**: A one-sentence summary of the main theme
5. **Key Points**: 3-5 main points with supporting scriptures
6. **Memorable Quotes**: 2-3 powerful quotes from the sermon
7. **Application Questions**: 3-4 reflection/discussion questions
8. **Action Steps**: 2-3 practical action items
9. **Prayer Focus**: A suggested prayer based on the message
10. **Related Scriptures**: Additional scriptures for deeper study

Be thorough but concise. Use bullet points and clear formatting.`
        },
        {
          role: 'user',
          content: `Generate sermon notes for the following:

Title: ${sermonTitle || 'Untitled Sermon'}
Speaker: ${sermonSpeaker || 'Unknown'}

Transcript:
${sermonTranscript.substring(0, 15000)}` // Limit transcript length
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })

    const notesContent = response.choices[0]?.message?.content || ''

    // Parse the generated notes into structured format
    const notes = {
      raw: notesContent,
      title: sermonTitle,
      speaker: sermonSpeaker,
      generatedAt: new Date().toISOString(),
      sections: parseSermonNotes(notesContent)
    }

    // If sermonId provided, save the notes
    if (sermonId) {
      await supabase
        .from('sermon_notes')
        .upsert({
          sermon_id: sermonId,
          notes_content: notesContent,
          notes_json: notes.sections,
          generated_at: notes.generatedAt
        })
    }

    return NextResponse.json(notes)

  } catch (error) {
    console.error('Error generating sermon notes:', error)
    return NextResponse.json(
      { error: 'Failed to generate sermon notes' },
      { status: 500 }
    )
  }
}

// Parse the AI-generated notes into structured sections
function parseSermonNotes(content: string) {
  const sections: Record<string, any> = {}

  // Extract main scripture
  const scriptureMatch = content.match(/\*\*Main Scripture\*\*:?\s*([^\n]+)/i)
  if (scriptureMatch) sections.mainScripture = scriptureMatch[1].trim()

  // Extract theme
  const themeMatch = content.match(/\*\*Theme\*\*:?\s*([^\n]+)/i)
  if (themeMatch) sections.theme = themeMatch[1].trim()

  // Extract key points
  const keyPointsMatch = content.match(/\*\*Key Points\*\*:?([\s\S]*?)(?=\*\*Memorable Quotes|$)/i)
  if (keyPointsMatch) {
    const pointsText = keyPointsMatch[1]
    const points = pointsText.match(/[-•*]\s*(.+)/g) || []
    sections.keyPoints = points.map(p => p.replace(/^[-•*]\s*/, '').trim())
  }

  // Extract quotes
  const quotesMatch = content.match(/\*\*Memorable Quotes\*\*:?([\s\S]*?)(?=\*\*Application Questions|$)/i)
  if (quotesMatch) {
    const quotesText = quotesMatch[1]
    const quotes = quotesText.match(/[""]([^""]+)[""]/g) || []
    sections.quotes = quotes.map(q => q.replace(/[""]/g, '').trim())
  }

  // Extract application questions
  const questionsMatch = content.match(/\*\*Application Questions\*\*:?([\s\S]*?)(?=\*\*Action Steps|$)/i)
  if (questionsMatch) {
    const questionsText = questionsMatch[1]
    const questions = questionsText.match(/\d+\.\s*(.+)/g) || questionsText.match(/[-•*]\s*(.+)/g) || []
    sections.applicationQuestions = questions.map(q => q.replace(/^[\d.•*-]\s*/, '').trim())
  }

  // Extract action steps
  const actionsMatch = content.match(/\*\*Action Steps\*\*:?([\s\S]*?)(?=\*\*Prayer Focus|$)/i)
  if (actionsMatch) {
    const actionsText = actionsMatch[1]
    const actions = actionsText.match(/[-•*]\s*(.+)/g) || []
    sections.actionSteps = actions.map(a => a.replace(/^[-•*]\s*/, '').trim())
  }

  // Extract prayer focus
  const prayerMatch = content.match(/\*\*Prayer Focus\*\*:?([\s\S]*?)(?=\*\*Related Scriptures|$)/i)
  if (prayerMatch) sections.prayerFocus = prayerMatch[1].trim()

  // Extract related scriptures
  const scripturesMatch = content.match(/\*\*Related Scriptures\*\*:?([\s\S]*?)$/i)
  if (scripturesMatch) {
    const scripturesText = scripturesMatch[1]
    const scriptures = scripturesText.match(/[A-Z1-3][a-zA-Z]+\s+\d+[:\d\-,\s]*/g) || []
    sections.relatedScriptures = scriptures.map(s => s.trim())
  }

  return sections
}

// GET - Retrieve saved sermon notes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sermonId = searchParams.get('sermonId')

    if (!sermonId) {
      return NextResponse.json({ error: 'sermonId required' }, { status: 400 })
    }

    const { data: notes } = await supabase
      .from('sermon_notes')
      .select('*')
      .eq('sermon_id', sermonId)
      .single()

    if (!notes) {
      return NextResponse.json({ error: 'Notes not found' }, { status: 404 })
    }

    return NextResponse.json(notes)

  } catch (error) {
    console.error('Error fetching sermon notes:', error)
    return NextResponse.json({ error: 'Failed to fetch sermon notes' }, { status: 500 })
  }
}

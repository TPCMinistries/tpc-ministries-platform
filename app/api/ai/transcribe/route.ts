import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { openai, summarizeTranscription } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const summarize = formData.get('summarize') === 'true'

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    })

    const result: any = {
      transcription: transcription.text
    }

    // Optionally summarize and extract insights
    if (summarize && transcription.text) {
      const summary = await summarizeTranscription(transcription.text)
      result.summary = summary
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
  }
}

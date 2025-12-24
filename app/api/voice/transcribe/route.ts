import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null

const getOpenAI = () => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Max file size for Whisper: 25MB
    const maxSize = 25 * 1024 * 1024
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large for transcription. Maximum size is 25MB' },
        { status: 400 }
      )
    }

    const openai = getOpenAI()

    // Convert to format Whisper expects
    const audioBuffer = await audioFile.arrayBuffer()

    // Create a File object for the OpenAI API
    const file = new File([audioBuffer], audioFile.name || 'audio.webm', {
      type: audioFile.type || 'audio/webm'
    })

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text'
    })

    return NextResponse.json({
      success: true,
      transcription: transcription
    })
  } catch (error: any) {
    console.error('Transcription error:', error)

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}

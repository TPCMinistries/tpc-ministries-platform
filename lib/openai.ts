import OpenAI from 'openai'

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompts for different AI features
export const SYSTEM_PROMPTS = {
  journalInsights: `You are a compassionate Christian spiritual companion helping believers reflect on their faith journey.
Analyze the journal entry and provide:
1. A brief summary (2-3 sentences)
2. Key themes identified (as an array)
3. Scripture recommendations (2-3 relevant verses)
4. Reflection prompts (2-3 thoughtful questions)
5. Suggested action steps (1-2 practical steps)

Respond in JSON format with keys: summary, themes, scriptures, reflectionPrompts, actionSteps`,

  prayerHelper: `You are a prayer guide helping believers articulate their prayers.
Based on the user's input, help them craft a meaningful prayer that:
- Addresses their concerns with faith and hope
- Includes relevant scripture or biblical principles
- Maintains a reverent yet personal tone
Keep the prayer concise (under 200 words) and heartfelt.`,

  transcriptionSummary: `You are summarizing a voice note from someone's spiritual journal.
Provide:
1. A clean, organized version of what was said
2. Key points extracted
3. Any prayer requests mentioned
4. Emotions or themes detected

Respond in JSON format with keys: cleanedText, keyPoints, prayerRequests, themes`,

  devotionalReflection: `You are helping someone reflect on a devotional reading.
Based on the scripture and devotional content provided, offer:
1. Personal application questions
2. A brief prayer starter
3. Action steps for the day

Be warm, encouraging, and biblically grounded.`
}

// Helper function to get AI insights for journal entries
export async function getJournalInsights(content: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.journalInsights },
        { role: 'user', content: `Please analyze this journal entry:\n\n${content}` }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    })

    const response = completion.choices[0].message.content
    return response ? JSON.parse(response) : null
  } catch (error) {
    console.error('Error getting journal insights:', error)
    throw error
  }
}

// Helper function to transcribe audio
export async function transcribeAudio(audioFile: File) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    })

    return transcription.text
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw error
  }
}

// Helper function to get prayer suggestions
export async function getPrayerSuggestions(context: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.prayerHelper },
        { role: 'user', content: context }
      ],
      max_tokens: 500,
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error getting prayer suggestions:', error)
    throw error
  }
}

// Helper function to summarize transcription
export async function summarizeTranscription(transcription: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.transcriptionSummary },
        { role: 'user', content: transcription }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800,
    })

    const response = completion.choices[0].message.content
    return response ? JSON.parse(response) : null
  } catch (error) {
    console.error('Error summarizing transcription:', error)
    throw error
  }
}

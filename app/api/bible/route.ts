import { NextRequest, NextResponse } from 'next/server'
import {
  parseReference,
  getVerseOfTheDay,
  getVerseByCategory,
  findVersesByTopic,
  formatVerses,
  POPULAR_VERSES,
  BIBLE_VERSIONS,
  type EnglishVersion,
  type VerseCategory
} from '@/lib/bible'

export const dynamic = 'force-dynamic'

/**
 * GET /api/bible
 *
 * Query params:
 * - ref: Bible reference string (e.g., "John 3:16", "Psalm 23", "Romans 8:28-30")
 * - version: 'en-kjv' | 'en-asv' | 'en-web' | 'en-bbe' | 'en-ylt' (default: 'en-kjv')
 * - category: 'salvation' | 'comfort' | 'strength' | 'peace' | 'love' | 'faith' | 'wisdom' | 'hope' | 'prayer'
 * - topic: Search by topic/keyword (e.g., "anxious", "hope", "love")
 * - daily: 'true' (returns verse of the day)
 * - format: 'json' | 'text' (default: 'json')
 *
 * Examples:
 * - GET /api/bible?ref=John 3:16
 * - GET /api/bible?ref=Psalm 23&version=en-asv
 * - GET /api/bible?category=comfort
 * - GET /api/bible?topic=anxious
 * - GET /api/bible?daily=true
 * - GET /api/bible?ref=Romans 8:28&format=text
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const ref = searchParams.get('ref')
    const version = (searchParams.get('version') || 'en-kjv') as EnglishVersion
    const category = searchParams.get('category') as VerseCategory | null
    const topic = searchParams.get('topic')
    const daily = searchParams.get('daily')
    const format = searchParams.get('format') || 'json'

    // Validate version
    if (!BIBLE_VERSIONS[version]) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid version. Available: ${Object.keys(BIBLE_VERSIONS).join(', ')}`
        },
        { status: 400 }
      )
    }

    // Verse of the day
    if (daily === 'true') {
      const verses = await getVerseOfTheDay(version)

      if (format === 'text') {
        return new NextResponse(formatVerses(verses), {
          headers: { 'Content-Type': 'text/plain' }
        })
      }

      return NextResponse.json({
        success: true,
        type: 'daily',
        version: BIBLE_VERSIONS[version].name,
        data: verses
      })
    }

    // By category (random verse from category)
    if (category) {
      const validCategories = Object.keys(POPULAR_VERSES)
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid category. Available: ${validCategories.join(', ')}`
          },
          { status: 400 }
        )
      }

      const verses = await getVerseByCategory(category, version)

      if (format === 'text') {
        return new NextResponse(formatVerses(verses), {
          headers: { 'Content-Type': 'text/plain' }
        })
      }

      return NextResponse.json({
        success: true,
        type: 'category',
        category,
        version: BIBLE_VERSIONS[version].name,
        data: verses
      })
    }

    // By topic (keyword search)
    if (topic) {
      const result = await findVersesByTopic(topic, version)

      if (!result) {
        return NextResponse.json({
          success: true,
          type: 'topic',
          topic,
          message: 'No verses found for this topic. Try: comfort, peace, love, hope, faith, strength, wisdom, prayer, anxiety, worry',
          data: []
        })
      }

      if (format === 'text') {
        return new NextResponse(formatVerses(result.verses), {
          headers: { 'Content-Type': 'text/plain' }
        })
      }

      return NextResponse.json({
        success: true,
        type: 'topic',
        topic,
        matchedCategory: result.category,
        version: BIBLE_VERSIONS[version].name,
        data: result.verses
      })
    }

    // By reference (explicit verse lookup)
    if (ref) {
      const verses = await parseReference(ref, version)

      if (format === 'text') {
        return new NextResponse(formatVerses(verses), {
          headers: { 'Content-Type': 'text/plain' }
        })
      }

      return NextResponse.json({
        success: true,
        type: 'reference',
        reference: ref,
        version: BIBLE_VERSIONS[version].name,
        data: verses
      })
    }

    // No params - return available options
    return NextResponse.json({
      success: true,
      message: 'Bible API - Provide a query parameter to fetch verses',
      options: {
        ref: 'Bible reference (e.g., "John 3:16", "Psalm 23")',
        category: Object.keys(POPULAR_VERSES),
        topic: 'Keywords like: comfort, peace, love, hope, faith, strength, wisdom, prayer, anxious',
        daily: 'Set to "true" for verse of the day',
        version: Object.entries(BIBLE_VERSIONS).map(([id, v]) => `${id}: ${v.name}`),
        format: ['json', 'text']
      },
      examples: [
        '/api/bible?ref=John 3:16',
        '/api/bible?category=comfort',
        '/api/bible?topic=anxious',
        '/api/bible?daily=true',
        '/api/bible?ref=Psalm 23&format=text'
      ]
    })

  } catch (error) {
    console.error('[bible] Error:', error)

    const message = error instanceof Error ? error.message : 'Failed to fetch Bible verse'

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * Free Bible API for TPC Ministries
 * Uses: bible-api.com (free, no API key required)
 * Documentation: https://bible-api.com/
 */

export interface BibleVerse {
  reference: string
  verses: {
    book_id: string
    book_name: string
    chapter: number
    verse: number
    text: string
  }[]
  text: string
  translation_id: string
  translation_name: string
  translation_note: string
}

export interface VerseOfTheDay {
  reference: string
  text: string
  translation: string
}

// Common translations
export const TRANSLATIONS = {
  KJV: 'kjv',      // King James Version
  WEB: 'web',      // World English Bible (default, public domain)
  ASV: 'asv',      // American Standard Version
  BBE: 'bbe',      // Bible in Basic English
  DARBY: 'darby',  // Darby Translation
  YLT: 'ylt',      // Young's Literal Translation
} as const

type Translation = typeof TRANSLATIONS[keyof typeof TRANSLATIONS]

// Base API URL
const API_BASE = 'https://bible-api.com'

// Prayer category to verse mapping
const PRAYER_VERSES: Record<string, string[]> = {
  health: [
    'Psalm 103:2-3',
    'Jeremiah 30:17',
    'Isaiah 53:5',
    'Psalm 41:3',
    '3 John 1:2',
    'Proverbs 4:20-22',
    'Exodus 15:26'
  ],
  family: [
    'Psalm 128:3',
    'Proverbs 22:6',
    'Colossians 3:13-14',
    'Joshua 24:15',
    'Ephesians 6:1-4',
    '1 Timothy 5:8',
    'Psalm 127:3'
  ],
  financial: [
    'Philippians 4:19',
    'Malachi 3:10',
    'Proverbs 3:9-10',
    'Luke 6:38',
    'Deuteronomy 8:18',
    'Matthew 6:33',
    'Psalm 37:25'
  ],
  spiritual: [
    'James 4:8',
    'Romans 12:2',
    'Psalm 51:10',
    'Galatians 5:22-23',
    'Ephesians 6:10-11',
    'Colossians 3:16',
    'Hebrews 11:1'
  ],
  comfort: [
    'Psalm 23:4',
    'Isaiah 41:10',
    '2 Corinthians 1:3-4',
    'Matthew 11:28-30',
    'Psalm 34:18',
    'John 14:27',
    'Romans 8:28'
  ],
  guidance: [
    'Proverbs 3:5-6',
    'Psalm 32:8',
    'Isaiah 30:21',
    'James 1:5',
    'Psalm 119:105',
    'Jeremiah 29:11',
    'Psalm 37:23'
  ],
  strength: [
    'Isaiah 40:31',
    'Philippians 4:13',
    'Psalm 46:1',
    'Deuteronomy 31:6',
    '2 Corinthians 12:9-10',
    'Nehemiah 8:10',
    'Psalm 27:1'
  ],
  peace: [
    'John 14:27',
    'Philippians 4:6-7',
    'Isaiah 26:3',
    'Colossians 3:15',
    'Psalm 4:8',
    'Romans 15:13',
    'Numbers 6:24-26'
  ],
  thanksgiving: [
    'Psalm 100:4-5',
    '1 Thessalonians 5:18',
    'Colossians 3:17',
    'Psalm 107:1',
    'Ephesians 5:20',
    'Psalm 136:1',
    'Philippians 4:4'
  ]
}

// Daily verse rotation for Verse of the Day
const VOTD_VERSES = [
  'John 3:16',
  'Psalm 23:1-3',
  'Romans 8:28',
  'Philippians 4:13',
  'Jeremiah 29:11',
  'Proverbs 3:5-6',
  'Isaiah 41:10',
  'Matthew 11:28-30',
  'Psalm 46:1',
  'Romans 12:2',
  'Joshua 1:9',
  'Psalm 27:1',
  'Isaiah 40:31',
  'John 14:6',
  'Galatians 5:22-23',
  '1 Corinthians 13:4-7',
  'Psalm 119:105',
  'Matthew 6:33',
  'Colossians 3:23-24',
  '2 Timothy 1:7',
  'Psalm 91:1-2',
  'Romans 15:13',
  'Hebrews 11:1',
  'James 1:2-4',
  '1 Peter 5:7',
  'Psalm 34:8',
  'Ephesians 2:8-9',
  'Romans 5:8',
  'Psalm 37:4',
  'Isaiah 53:5'
]

/**
 * Fetch a Bible verse or passage
 * @param reference - Bible reference (e.g., "John 3:16", "Psalm 23:1-6")
 * @param translation - Bible translation (default: 'web')
 */
export async function getVerse(
  reference: string,
  translation: Translation = 'web'
): Promise<BibleVerse> {
  const url = `${API_BASE}/${encodeURIComponent(reference)}?translation=${translation}`

  const res = await fetch(url, {
    next: { revalidate: 3600 } // Cache for 1 hour
  })

  if (!res.ok) {
    throw new Error(`Bible API error: ${res.status} - ${res.statusText}`)
  }

  return res.json()
}

/**
 * Get multiple random verses from a category
 */
export async function getVersesByCategory(
  category: string,
  count: number = 1,
  translation: Translation = 'web'
): Promise<BibleVerse[]> {
  const verses = PRAYER_VERSES[category.toLowerCase()] || PRAYER_VERSES.comfort
  const shuffled = [...verses].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, verses.length))

  const results = await Promise.all(
    selected.map(ref => getVerse(ref, translation).catch(() => null))
  )

  return results.filter((v): v is BibleVerse => v !== null)
}

/**
 * Get a single verse by category
 */
export async function getVerseByCategory(
  category: string,
  translation: Translation = 'web'
): Promise<BibleVerse | null> {
  const verses = await getVersesByCategory(category, 1, translation)
  return verses[0] || null
}

/**
 * Get Verse of the Day (deterministic based on date)
 */
export async function getVerseOfTheDay(
  translation: Translation = 'web'
): Promise<VerseOfTheDay> {
  // Calculate which verse based on day of year
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - startOfYear.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const index = dayOfYear % VOTD_VERSES.length

  const reference = VOTD_VERSES[index]
  const verse = await getVerse(reference, translation)

  return {
    reference: verse.reference,
    text: verse.text.trim(),
    translation: verse.translation_name || 'World English Bible'
  }
}

/**
 * Search for verses containing a keyword (using local mapping)
 * Note: bible-api.com doesn't have search, so we use curated lists
 */
export function searchVerseReferences(keyword: string): string[] {
  const keywordLower = keyword.toLowerCase()

  // Map common search terms to categories
  const keywordMapping: Record<string, string> = {
    heal: 'health',
    sick: 'health',
    illness: 'health',
    family: 'family',
    children: 'family',
    marriage: 'family',
    money: 'financial',
    provision: 'financial',
    finances: 'financial',
    faith: 'spiritual',
    grow: 'spiritual',
    spirit: 'spiritual',
    peace: 'peace',
    anxiety: 'peace',
    worry: 'peace',
    strength: 'strength',
    courage: 'strength',
    weak: 'strength',
    guidance: 'guidance',
    direction: 'guidance',
    decision: 'guidance',
    comfort: 'comfort',
    grief: 'comfort',
    loss: 'comfort',
    thanks: 'thanksgiving',
    grateful: 'thanksgiving',
    praise: 'thanksgiving'
  }

  for (const [key, category] of Object.entries(keywordMapping)) {
    if (keywordLower.includes(key)) {
      return PRAYER_VERSES[category] || []
    }
  }

  // Default to comfort verses
  return PRAYER_VERSES.comfort
}

/**
 * Get a random verse for general inspiration
 */
export async function getRandomVerse(
  translation: Translation = 'web'
): Promise<BibleVerse> {
  const allVerses = Object.values(PRAYER_VERSES).flat()
  const randomIndex = Math.floor(Math.random() * allVerses.length)
  return getVerse(allVerses[randomIndex], translation)
}

/**
 * Format verse text for display (clean up whitespace, etc.)
 */
export function formatVerseText(text: string): string {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  return Object.keys(PRAYER_VERSES)
}

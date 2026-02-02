/**
 * Bible API Integration for TPC Ministries
 * Uses wldeh/bible-api - Free, unlimited, no auth required
 * CDN-hosted on jsDelivr for fast global access
 */

const BIBLE_API_BASE = 'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles'

// ============================================
// TYPES
// ============================================

export interface BibleVerse {
  book: string
  chapter: number
  verse: number
  text: string
  version: string
}

export interface BibleChapter {
  book: string
  chapter: number
  verses: BibleVerse[]
  version: string
}

export interface BibleVersion {
  id: string
  name: string
  language: string
  languageCode: string
}

export type BibleBook =
  | 'genesis' | 'exodus' | 'leviticus' | 'numbers' | 'deuteronomy'
  | 'joshua' | 'judges' | 'ruth' | '1-samuel' | '2-samuel'
  | '1-kings' | '2-kings' | '1-chronicles' | '2-chronicles'
  | 'ezra' | 'nehemiah' | 'esther' | 'job' | 'psalms' | 'proverbs'
  | 'ecclesiastes' | 'song-of-solomon' | 'isaiah' | 'jeremiah'
  | 'lamentations' | 'ezekiel' | 'daniel' | 'hosea' | 'joel'
  | 'amos' | 'obadiah' | 'jonah' | 'micah' | 'nahum' | 'habakkuk'
  | 'zephaniah' | 'haggai' | 'zechariah' | 'malachi'
  | 'matthew' | 'mark' | 'luke' | 'john' | 'acts' | 'romans'
  | '1-corinthians' | '2-corinthians' | 'galatians' | 'ephesians'
  | 'philippians' | 'colossians' | '1-thessalonians' | '2-thessalonians'
  | '1-timothy' | '2-timothy' | 'titus' | 'philemon' | 'hebrews'
  | 'james' | '1-peter' | '2-peter' | '1-john' | '2-john' | '3-john'
  | 'jude' | 'revelation'

// Common English versions
export type EnglishVersion = 'en-kjv' | 'en-asv' | 'en-web' | 'en-bbe' | 'en-ylt'

// ============================================
// CONFIGURATION
// ============================================

export const BIBLE_VERSIONS: Record<EnglishVersion, { name: string; year: number }> = {
  'en-kjv': { name: 'King James Version', year: 1611 },
  'en-asv': { name: 'American Standard Version', year: 1901 },
  'en-web': { name: 'World English Bible', year: 2000 },
  'en-bbe': { name: 'Bible in Basic English', year: 1965 },
  'en-ylt': { name: "Young's Literal Translation", year: 1862 }
}

export const DEFAULT_VERSION: EnglishVersion = 'en-kjv'

// Book name mappings for user-friendly input
const BOOK_ALIASES: Record<string, BibleBook> = {
  'gen': 'genesis',
  'ex': 'exodus',
  'lev': 'leviticus',
  'num': 'numbers',
  'deut': 'deuteronomy',
  'josh': 'joshua',
  'judg': 'judges',
  '1sam': '1-samuel',
  '2sam': '2-samuel',
  '1kgs': '1-kings',
  '2kgs': '2-kings',
  '1chr': '1-chronicles',
  '2chr': '2-chronicles',
  'neh': 'nehemiah',
  'est': 'esther',
  'ps': 'psalms',
  'psalm': 'psalms',
  'prov': 'proverbs',
  'eccl': 'ecclesiastes',
  'song': 'song-of-solomon',
  'sos': 'song-of-solomon',
  'isa': 'isaiah',
  'jer': 'jeremiah',
  'lam': 'lamentations',
  'ezek': 'ezekiel',
  'dan': 'daniel',
  'hos': 'hosea',
  'obad': 'obadiah',
  'jon': 'jonah',
  'mic': 'micah',
  'nah': 'nahum',
  'hab': 'habakkuk',
  'zeph': 'zephaniah',
  'hag': 'haggai',
  'zech': 'zechariah',
  'mal': 'malachi',
  'matt': 'matthew',
  'mt': 'matthew',
  'mk': 'mark',
  'lk': 'luke',
  'jn': 'john',
  'rom': 'romans',
  '1cor': '1-corinthians',
  '2cor': '2-corinthians',
  'gal': 'galatians',
  'eph': 'ephesians',
  'phil': 'philippians',
  'col': 'colossians',
  '1thess': '1-thessalonians',
  '2thess': '2-thessalonians',
  '1tim': '1-timothy',
  '2tim': '2-timothy',
  'tit': 'titus',
  'phlm': 'philemon',
  'heb': 'hebrews',
  'jas': 'james',
  '1pet': '1-peter',
  '2pet': '2-peter',
  '1jn': '1-john',
  '2jn': '2-john',
  '3jn': '3-john',
  'rev': 'revelation'
}

// ============================================
// HELPERS
// ============================================

function normalizeBookName(input: string): BibleBook {
  const cleaned = input.toLowerCase().trim().replace(/\s+/g, '-')
  return (BOOK_ALIASES[cleaned] || cleaned) as BibleBook
}

function formatBookName(book: BibleBook): string {
  return book
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get a single verse
 * @example getVerse('john', 3, 16) // John 3:16
 */
export async function getVerse(
  book: string,
  chapter: number,
  verse: number,
  version: EnglishVersion = DEFAULT_VERSION
): Promise<BibleVerse> {
  const normalizedBook = normalizeBookName(book)
  const url = `${BIBLE_API_BASE}/${version}/books/${normalizedBook}/chapters/${chapter}/verses/${verse}.json`

  const res = await fetch(url, {
    next: { revalidate: 86400 } // Cache for 24 hours (static content)
  })

  if (!res.ok) {
    throw new Error(`Bible API error: ${res.status} - Could not fetch ${book} ${chapter}:${verse}`)
  }

  const data = await res.json()

  return {
    book: formatBookName(normalizedBook),
    chapter,
    verse,
    text: data.text,
    version
  }
}

/**
 * Get an entire chapter
 * @example getChapter('psalms', 23) // Psalm 23
 */
export async function getChapter(
  book: string,
  chapter: number,
  version: EnglishVersion = DEFAULT_VERSION
): Promise<BibleChapter> {
  const normalizedBook = normalizeBookName(book)
  const url = `${BIBLE_API_BASE}/${version}/books/${normalizedBook}/chapters/${chapter}.json`

  const res = await fetch(url, {
    next: { revalidate: 86400 }
  })

  if (!res.ok) {
    throw new Error(`Bible API error: ${res.status} - Could not fetch ${book} ${chapter}`)
  }

  const data = await res.json()

  return {
    book: formatBookName(normalizedBook),
    chapter,
    version,
    verses: data.verses.map((v: { verse: number; text: string }) => ({
      book: formatBookName(normalizedBook),
      chapter,
      verse: v.verse,
      text: v.text,
      version
    }))
  }
}

/**
 * Get a range of verses
 * @example getVerseRange('john', 3, 16, 17) // John 3:16-17
 */
export async function getVerseRange(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
  version: EnglishVersion = DEFAULT_VERSION
): Promise<BibleVerse[]> {
  const chapterData = await getChapter(book, chapter, version)
  return chapterData.verses.filter(v => v.verse >= startVerse && v.verse <= endVerse)
}

/**
 * Parse a reference string and get the verse(s)
 * @example parseReference('John 3:16') // Single verse
 * @example parseReference('Psalm 23') // Entire chapter
 * @example parseReference('Romans 8:28-30') // Verse range
 */
export async function parseReference(
  reference: string,
  version: EnglishVersion = DEFAULT_VERSION
): Promise<BibleVerse[]> {
  // Regex patterns for different reference formats
  const singleVersePattern = /^(\d?\s*\w+)\s+(\d+):(\d+)$/i
  const verseRangePattern = /^(\d?\s*\w+)\s+(\d+):(\d+)-(\d+)$/i
  const chapterPattern = /^(\d?\s*\w+)\s+(\d+)$/i

  const cleaned = reference.trim()

  // Try single verse: "John 3:16"
  let match = cleaned.match(singleVersePattern)
  if (match) {
    const [, book, chapter, verse] = match
    const result = await getVerse(book, parseInt(chapter), parseInt(verse), version)
    return [result]
  }

  // Try verse range: "Romans 8:28-30"
  match = cleaned.match(verseRangePattern)
  if (match) {
    const [, book, chapter, startVerse, endVerse] = match
    return getVerseRange(book, parseInt(chapter), parseInt(startVerse), parseInt(endVerse), version)
  }

  // Try chapter: "Psalm 23"
  match = cleaned.match(chapterPattern)
  if (match) {
    const [, book, chapter] = match
    const result = await getChapter(book, parseInt(chapter), version)
    return result.verses
  }

  throw new Error(`Could not parse Bible reference: "${reference}"`)
}

/**
 * Format verses for display
 */
export function formatVerses(verses: BibleVerse[]): string {
  if (verses.length === 0) return ''

  const firstVerse = verses[0]
  const lastVerse = verses[verses.length - 1]

  const reference = verses.length === 1
    ? `${firstVerse.book} ${firstVerse.chapter}:${firstVerse.verse}`
    : `${firstVerse.book} ${firstVerse.chapter}:${firstVerse.verse}-${lastVerse.verse}`

  const text = verses.map(v => `${v.verse} ${v.text}`).join(' ')

  return `${text}\n\n— ${reference} (${BIBLE_VERSIONS[firstVerse.version as EnglishVersion]?.name || firstVerse.version})`
}

/**
 * Format a single verse for display (simpler format)
 */
export function formatVerse(verse: BibleVerse): string {
  return `"${verse.text}"\n— ${verse.book} ${verse.chapter}:${verse.verse}`
}

// ============================================
// POPULAR VERSES FOR QUICK ACCESS
// ============================================

export const POPULAR_VERSES = {
  salvation: [
    'John 3:16',
    'Romans 10:9',
    'Ephesians 2:8-9',
    'Acts 16:31'
  ],
  comfort: [
    'Psalm 23:4',
    'Isaiah 41:10',
    'Matthew 11:28',
    'Romans 8:28',
    '2 Corinthians 1:3-4'
  ],
  strength: [
    'Philippians 4:13',
    'Isaiah 40:31',
    'Joshua 1:9',
    'Psalm 46:1'
  ],
  peace: [
    'John 14:27',
    'Philippians 4:6-7',
    'Isaiah 26:3',
    'Psalm 29:11'
  ],
  love: [
    '1 Corinthians 13:4-7',
    'John 15:13',
    '1 John 4:19',
    'Romans 8:38-39'
  ],
  faith: [
    'Hebrews 11:1',
    'Romans 10:17',
    'Mark 11:24',
    'James 1:6'
  ],
  wisdom: [
    'Proverbs 3:5-6',
    'James 1:5',
    'Proverbs 9:10',
    'Colossians 2:3'
  ],
  hope: [
    'Jeremiah 29:11',
    'Romans 15:13',
    'Hebrews 6:19',
    'Psalm 42:11'
  ],
  prayer: [
    'Matthew 6:9-13',
    'Philippians 4:6',
    '1 Thessalonians 5:17',
    'James 5:16'
  ]
} as const

export type VerseCategory = keyof typeof POPULAR_VERSES

/**
 * Get a random verse from a category
 */
export async function getVerseByCategory(
  category: VerseCategory,
  version: EnglishVersion = DEFAULT_VERSION
): Promise<BibleVerse[]> {
  const references = POPULAR_VERSES[category]
  const randomRef = references[Math.floor(Math.random() * references.length)]
  return parseReference(randomRef, version)
}

/**
 * Get the verse of the day (deterministic based on date)
 */
export async function getVerseOfTheDay(
  version: EnglishVersion = DEFAULT_VERSION
): Promise<BibleVerse[]> {
  // Create a list of all popular verses
  const allVerses = Object.values(POPULAR_VERSES).flat()

  // Use the day of the year to pick a verse (cycles through ~50 verses)
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)

  const verseIndex = dayOfYear % allVerses.length
  const reference = allVerses[verseIndex]

  return parseReference(reference, version)
}

// ============================================
// SEARCH (via category matching)
// ============================================

/**
 * Find verses by topic/keyword
 * Maps keywords to categories
 */
export async function findVersesByTopic(
  topic: string,
  version: EnglishVersion = DEFAULT_VERSION
): Promise<{ category: VerseCategory; verses: BibleVerse[] } | null> {
  const topicLower = topic.toLowerCase()

  const topicMappings: Record<string, VerseCategory> = {
    'save': 'salvation',
    'saved': 'salvation',
    'salvation': 'salvation',
    'forgive': 'salvation',
    'comfort': 'comfort',
    'sad': 'comfort',
    'grief': 'comfort',
    'loss': 'comfort',
    'hurt': 'comfort',
    'strong': 'strength',
    'strength': 'strength',
    'weak': 'strength',
    'tired': 'strength',
    'peace': 'peace',
    'anxious': 'peace',
    'anxiety': 'peace',
    'worry': 'peace',
    'stress': 'peace',
    'love': 'love',
    'relationship': 'love',
    'marriage': 'love',
    'faith': 'faith',
    'believe': 'faith',
    'trust': 'faith',
    'doubt': 'faith',
    'wisdom': 'wisdom',
    'guidance': 'wisdom',
    'decision': 'wisdom',
    'direction': 'wisdom',
    'hope': 'hope',
    'future': 'hope',
    'despair': 'hope',
    'hopeless': 'hope',
    'pray': 'prayer',
    'prayer': 'prayer'
  }

  const category = topicMappings[topicLower]

  if (!category) {
    return null
  }

  const verses = await getVerseByCategory(category, version)
  return { category, verses }
}

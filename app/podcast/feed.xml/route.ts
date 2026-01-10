import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tpcministries.com'

  // Fetch all published podcast episodes
  const { data: episodes, error } = await supabase
    .from('teachings')
    .select('*')
    .eq('content_type', 'podcast')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching podcast episodes:', error)
    return new NextResponse('Error generating feed', { status: 500 })
  }

  // Podcast metadata
  const podcastTitle = 'TPC Ministries Podcast'
  const podcastDescription = 'Prophetic teachings, spiritual insights, and Kingdom wisdom from TPC Ministries. Join us as we explore the depths of God\'s Word and His prophetic voice for today.'
  const podcastAuthor = 'TPC Ministries'
  const podcastEmail = 'info@tpcministries.com'
  const podcastImage = `${baseUrl}/images/podcast-cover.jpg`
  const podcastCategory = 'Religion &amp; Spirituality'
  const podcastSubCategory = 'Christianity'
  const podcastLanguage = 'en-us'
  const podcastCopyright = `© ${new Date().getFullYear()} TPC Ministries. All rights reserved.`

  // Generate RSS XML
  const rssItems = (episodes || []).map(episode => {
    const pubDate = new Date(episode.published_at).toUTCString()
    const duration = episode.duration_minutes ? formatDuration(episode.duration_minutes) : '00:00:00'
    const guid = `${baseUrl}/podcast/${episode.slug || episode.id}`
    const episodeUrl = episode.audio_url || ''
    const fileSize = episode.file_size || 0

    return `
    <item>
      <title><![CDATA[${escapeXml(episode.title)}]]></title>
      <description><![CDATA[${escapeXml(episode.description || '')}]]></description>
      <link>${guid}</link>
      <guid isPermaLink="true">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${podcastEmail} (${episode.author || podcastAuthor})</author>
      ${episodeUrl ? `<enclosure url="${escapeXml(episodeUrl)}" length="${fileSize}" type="audio/mpeg" />` : ''}
      <itunes:title><![CDATA[${escapeXml(episode.title)}]]></itunes:title>
      <itunes:author>${escapeXml(episode.author || podcastAuthor)}</itunes:author>
      <itunes:summary><![CDATA[${escapeXml(episode.description || '')}]]></itunes:summary>
      <itunes:duration>${duration}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      ${episode.thumbnail ? `<itunes:image href="${escapeXml(episode.thumbnail)}" />` : ''}
      ${episode.episode_number ? `<itunes:episode>${episode.episode_number}</itunes:episode>` : ''}
      ${episode.season_number ? `<itunes:season>${episode.season_number}</itunes:season>` : ''}
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${podcastTitle}</title>
    <description><![CDATA[${podcastDescription}]]></description>
    <link>${baseUrl}/podcast</link>
    <language>${podcastLanguage}</language>
    <copyright>${podcastCopyright}</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/podcast/feed.xml" rel="self" type="application/rss+xml" />
    <itunes:author>${podcastAuthor}</itunes:author>
    <itunes:summary><![CDATA[${podcastDescription}]]></itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:owner>
      <itunes:name>${podcastAuthor}</itunes:name>
      <itunes:email>${podcastEmail}</itunes:email>
    </itunes:owner>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="${podcastCategory}">
      <itunes:category text="${podcastSubCategory}" />
    </itunes:category>
    <itunes:image href="${podcastImage}" />
    <image>
      <url>${podcastImage}</url>
      <title>${podcastTitle}</title>
      <link>${baseUrl}/podcast</link>
    </image>
    ${rssItems}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = 0
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TeachingClient from './teaching-client'

interface Props {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  // Try to find by slug first, then by ID
  let teaching = null

  const { data: bySlug } = await supabase
    .from('teachings')
    .select('title, description, author, thumbnail, published_at, type, topic')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (bySlug) {
    teaching = bySlug
  } else {
    // Try by ID
    const { data: byId } = await supabase
      .from('teachings')
      .select('title, description, author, thumbnail, published_at, type, topic')
      .eq('id', slug)
      .eq('is_published', true)
      .single()
    teaching = byId
  }

  if (!teaching) {
    return {
      title: 'Teaching Not Found',
      description: 'The teaching you are looking for does not exist.'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tpcministries.com'
  const typeLabels: Record<string, string> = {
    video: 'Video Teaching',
    article: 'Article',
    book: 'Book',
    audio: 'Audio Teaching'
  }

  return {
    title: teaching.title,
    description: teaching.description || `${typeLabels[teaching.type] || 'Teaching'} by ${teaching.author} on TPC Ministries.`,
    authors: teaching.author ? [{ name: teaching.author }] : undefined,
    openGraph: {
      title: teaching.title,
      description: teaching.description || `${typeLabels[teaching.type] || 'Teaching'} by ${teaching.author}`,
      type: teaching.type === 'video' ? 'video.other' : 'article',
      publishedTime: teaching.published_at,
      authors: teaching.author ? [teaching.author] : undefined,
      images: teaching.thumbnail ? [
        {
          url: teaching.thumbnail,
          width: 1200,
          height: 630,
          alt: teaching.title
        }
      ] : undefined,
      url: `${baseUrl}/teachings/${slug}`,
      siteName: 'TPC Ministries'
    },
    twitter: {
      card: 'summary_large_image',
      title: teaching.title,
      description: teaching.description || `${typeLabels[teaching.type] || 'Teaching'} by ${teaching.author}`,
      images: teaching.thumbnail ? [teaching.thumbnail] : undefined
    },
    alternates: {
      canonical: `${baseUrl}/teachings/${slug}`
    },
    keywords: teaching.topic ? [teaching.topic, 'teaching', 'sermon', 'TPC Ministries'] : ['teaching', 'sermon', 'TPC Ministries']
  }
}

export default async function TeachingPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch teaching data for SSR
  let teaching = null

  const { data: bySlug } = await supabase
    .from('teachings')
    .select(`
      id,
      slug,
      title,
      type,
      author,
      description,
      duration,
      views,
      topic,
      thumbnail,
      video_url,
      audio_url,
      pdf_url,
      content,
      scriptures,
      published_at
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (bySlug) {
    teaching = bySlug
  } else {
    // Try by ID
    const { data: byId } = await supabase
      .from('teachings')
      .select(`
        id,
        slug,
        title,
        type,
        author,
        description,
        duration,
        views,
        topic,
        thumbnail,
        video_url,
        audio_url,
        pdf_url,
        content,
        scriptures,
        published_at
      `)
      .eq('id', slug)
      .eq('is_published', true)
      .single()
    teaching = byId
  }

  // Increment view count in the background
  if (teaching) {
    supabase
      .from('teachings')
      .update({ views: (teaching.views || 0) + 1 })
      .eq('id', teaching.id)
      .then(() => {})
  }

  return <TeachingClient slug={slug} initialTeaching={teaching} />
}

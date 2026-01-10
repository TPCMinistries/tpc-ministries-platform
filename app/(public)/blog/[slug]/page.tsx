import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BlogPostClient from './blog-post-client'

interface Props {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, featured_image_url, author_name, published_at, category')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The article you are looking for does not exist.'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tpcministries.com'

  return {
    title: post.title,
    description: post.excerpt || `Read ${post.title} on TPC Ministries blog.`,
    authors: post.author_name ? [{ name: post.author_name }] : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read ${post.title} on TPC Ministries blog.`,
      type: 'article',
      publishedTime: post.published_at,
      authors: post.author_name ? [post.author_name] : undefined,
      images: post.featured_image_url ? [
        {
          url: post.featured_image_url,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ] : undefined,
      url: `${baseUrl}/blog/${slug}`,
      siteName: 'TPC Ministries'
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || `Read ${post.title} on TPC Ministries blog.`,
      images: post.featured_image_url ? [post.featured_image_url] : undefined
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`
    }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  return <BlogPostClient slug={slug} />
}

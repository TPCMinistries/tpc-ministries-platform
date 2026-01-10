import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Get single blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient()
    const { slug } = params

    // Fetch the post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment view count (fire and forget)
    supabase
      .from('blog_posts')
      .update({ views_count: (post.views_count || 0) + 1 })
      .eq('id', post.id)
      .then(() => {})

    // Fetch approved comments
    const { data: comments } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', post.id)
      .eq('is_approved', true)
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    // Fetch related posts (same category, excluding current)
    const { data: relatedPosts } = await supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, featured_image_url, published_at, category')
      .eq('status', 'published')
      .eq('category', post.category)
      .neq('id', post.id)
      .order('published_at', { ascending: false })
      .limit(3)

    return NextResponse.json({
      post,
      comments: comments || [],
      relatedPosts: relatedPosts || []
    })
  } catch (error) {
    console.error('Error in blog post GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

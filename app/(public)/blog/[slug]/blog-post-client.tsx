'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  User,
  MessageSquare,
  Send,
  ArrowRight
} from 'lucide-react'
import { ArticleSchema } from '@/components/seo/json-ld'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt?: string
  content: string
  featured_image_url?: string
  category: string
  tags: string[]
  author_name?: string
  author_image_url?: string
  published_at: string
  views_count: number
  likes_count: number
  comments_enabled: boolean
  meta_title?: string
  meta_description?: string
}

interface Comment {
  id: string
  content: string
  guest_name?: string
  member_id?: string
  created_at: string
}

interface RelatedPost {
  id: string
  slug: string
  title: string
  excerpt?: string
  featured_image_url?: string
  published_at: string
  category: string
}

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-800',
  announcements: 'bg-yellow-100 text-yellow-800',
  devotionals: 'bg-purple-100 text-purple-800',
  'ministry-updates': 'bg-green-100 text-green-800',
  'event-recaps': 'bg-red-100 text-red-800',
  testimonies: 'bg-orange-100 text-orange-800'
}

interface BlogPostClientProps {
  slug: string
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Comment form
  const [commentForm, setCommentForm] = useState({
    content: '',
    guest_name: '',
    guest_email: ''
  })
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentSuccess, setCommentSuccess] = useState('')

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/public/blog/${slug}`)
      if (!res.ok) {
        setError('Post not found')
        return
      }
      const data = await res.json()
      setPost(data.post)
      setComments(data.comments || [])
      setRelatedPosts(data.relatedPosts || [])
    } catch (err) {
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !commentForm.content.trim()) return

    setSubmittingComment(true)
    setCommentSuccess('')

    try {
      const res = await fetch(`/api/public/blog/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm)
      })

      const data = await res.json()

      if (res.ok) {
        setCommentSuccess(data.message)
        setCommentForm({ content: '', guest_name: '', guest_email: '' })
        // Refresh comments if auto-approved
        if (data.comment?.is_approved) {
          fetchPost()
        }
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to submit comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getReadTime = (content: string) => {
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-navy mb-4">Post Not Found</h1>
        <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link href="/blog">
          <Button className="bg-navy hover:bg-navy/90">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Article Schema */}
      <ArticleSchema
        title={post.title}
        description={post.excerpt || post.content.substring(0, 160)}
        url={`${baseUrl}/blog/${post.slug}`}
        imageUrl={post.featured_image_url}
        authorName={post.author_name || 'TPC Ministries'}
        publishedAt={post.published_at}
      />

      {/* Hero/Header */}
      <section className="bg-gradient-to-br from-navy to-navy-800 px-4 py-12 md:py-20">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          <Badge className={categoryColors[post.category] || 'bg-gray-100 text-gray-800'}>
            {post.category.replace('-', ' ')}
          </Badge>

          <h1 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-300">
            {post.author_name && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center overflow-hidden relative">
                  {post.author_image_url ? (
                    <Image
                      src={post.author_image_url}
                      alt={post.author_name || 'Author'}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gold" />
                  )}
                </div>
                <span>{post.author_name}</span>
              </div>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {getReadTime(post.content)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views_count} views
            </span>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="container mx-auto max-w-4xl px-4 -mt-8">
          <div className="relative w-full h-64 md:h-96 rounded-lg shadow-lg overflow-hidden">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-12 gap-8">
            {/* Share Sidebar */}
            <div className="md:col-span-1">
              <div className="sticky top-24 flex md:flex-col gap-3">
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank')}
                  className="p-2 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  title="Share on Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </button>
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${post.title}`, '_blank')}
                  className="p-2 bg-gray-100 rounded-full hover:bg-sky-100 hover:text-sky-600 transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </button>
                <button
                  onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}`, '_blank')}
                  className="p-2 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </button>
                <button
                  onClick={copyLink}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  title="Copy link"
                >
                  <LinkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-11">
              <div
                className="prose prose-lg max-w-none prose-headings:text-navy prose-a:text-gold prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br/>')
                    .replace(/^/, '<p>')
                    .replace(/$/, '</p>')
                    .replace(/## (.*?)(<br\/>|<\/p>)/g, '</p><h2>$1</h2><p>')
                    .replace(/### (.*?)(<br\/>|<\/p>)/g, '</p><h3>$1</h3><p>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/- (.*?)(<br\/>)/g, '<li>$1</li>')
                    .replace(/(\d+)\. (.*?)(<br\/>)/g, '<li>$2</li>')
                }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      {post.comments_enabled && (
        <section className="px-4 py-12 bg-gray-50">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-navy mb-8 flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guest_name">Name</Label>
                      <Input
                        id="guest_name"
                        value={commentForm.guest_name}
                        onChange={(e) => setCommentForm({ ...commentForm, guest_name: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guest_email">Email</Label>
                      <Input
                        id="guest_email"
                        type="email"
                        value={commentForm.guest_email}
                        onChange={(e) => setCommentForm({ ...commentForm, guest_email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Comment</Label>
                    <Textarea
                      id="content"
                      value={commentForm.content}
                      onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                      placeholder="Share your thoughts..."
                      rows={4}
                      required
                    />
                  </div>

                  {commentSuccess && (
                    <p className="text-green-600 text-sm">{commentSuccess}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={submittingComment}
                    className="bg-navy hover:bg-navy/90"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submittingComment ? 'Submitting...' : 'Post Comment'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map(comment => (
                  <Card key={comment.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-navy" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-navy">
                              {comment.guest_name || 'Member'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-600">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </section>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="px-4 py-12 bg-white">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-navy mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map(related => (
                <Card key={related.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/blog/${related.slug}`}>
                    {related.featured_image_url ? (
                      <div
                        className="h-40 bg-cover bg-center"
                        style={{ backgroundImage: `url(${related.featured_image_url})` }}
                      />
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-navy/80 to-navy" />
                    )}
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/blog/${related.slug}`}>
                      <h3 className="font-semibold text-navy hover:text-gold transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-2">
                      {formatDate(related.published_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 py-12 bg-gradient-to-br from-gold to-amber-500">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-navy mb-4">
            Want More Content Like This?
          </h2>
          <p className="text-navy/80 mb-6">
            Subscribe to receive our latest articles and devotionals.
          </p>
          <Link href="/#newsletter">
            <Button size="lg" className="bg-navy text-white hover:bg-navy/90">
              Subscribe Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

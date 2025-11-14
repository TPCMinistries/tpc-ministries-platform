'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Play,
  Pause,
  Volume2,
  Maximize,
  Bookmark,
  Share2,
  CheckCircle,
  Clock,
  Eye,
  ChevronLeft,
  BookOpen,
  FileText,
  Headphones
} from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'

interface Teaching {
  id: string
  slug: string
  title: string
  type: 'video' | 'article' | 'book' | 'audio'
  author: string
  description: string
  duration: string
  views: number
  publishedAt: string
  topic: string
  content?: string
  videoUrl?: string
  audioUrl?: string
  pdfUrl?: string
  scriptures?: string[]
  thumbnail?: string
}

export default function TeachingPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [teaching, setTeaching] = useState<Teaching | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [progress, setProgress] = useState(0)

  // Mock data - will be replaced with API call
  useEffect(() => {
    const mockTeaching: Teaching = {
      id: '1',
      slug: params.slug,
      title: 'The Power of Purpose-Driven Faith',
      type: 'video',
      author: 'Pastor Lorenzo',
      description: 'Discover how aligning your faith with your God-given purpose can transform every area of your life. This powerful teaching explores the intersection of divine calling and practical application.',
      duration: '42 min',
      views: 1234,
      publishedAt: '2 days ago',
      topic: 'purpose',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      scriptures: [
        'Romans 8:28 - "And we know that in all things God works for the good of those who love him, who have been called according to his purpose."',
        'Jeremiah 29:11 - "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
        'Proverbs 19:21 - "Many are the plans in a person\'s heart, but it is the Lord\'s purpose that prevails."'
      ],
      content: `
        <h2>Introduction</h2>
        <p>Purpose-driven faith is about more than just believing—it's about aligning your entire life with God's calling for you. When we discover our purpose and pursue it with faith, we unlock transformative power in every area of life.</p>

        <h2>Key Points</h2>
        <ul>
          <li>Understanding your God-given purpose</li>
          <li>Aligning faith with action</li>
          <li>Overcoming obstacles through purpose</li>
          <li>Living with intentionality</li>
        </ul>

        <h2>Application</h2>
        <p>Take time this week to pray and reflect on your purpose. Ask God to reveal the specific calling He has placed on your life, and commit to taking one concrete step toward it.</p>
      `
    }

    setTimeout(() => {
      setTeaching(mockTeaching)
      setLoading(false)
    }, 500)
  }, [params.slug])

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // TODO: API call to save bookmark
  }

  const handleMarkComplete = () => {
    // TODO: API call to mark as complete
    alert('Marked as complete!')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: teaching?.title,
        text: teaching?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const relatedTeachings = [
    {
      id: '2',
      slug: 'leadership-principles-from-nehemiah',
      title: 'Leadership Principles from Nehemiah',
      type: 'article',
      author: 'Dr. Sarah Mitchell',
      duration: '8 min read',
      thumbnail: '/placeholder-article.jpg',
    },
    {
      id: '3',
      slug: 'faith-and-business-excellence',
      title: 'Faith and Business Excellence',
      type: 'book',
      author: 'Rev. John Chambers',
      duration: '245 pages',
      thumbnail: '/placeholder-book.jpg',
    },
    {
      id: '4',
      slug: 'prayer-that-moves-mountains',
      title: 'Prayer That Moves Mountains',
      type: 'audio',
      author: 'Pastor Maria Lopez',
      duration: '35 min',
      thumbnail: '/placeholder-audio.jpg',
    },
  ]

  const getTypeIcon = (type: string) => {
    const icons = {
      video: Play,
      article: FileText,
      book: BookOpen,
      audio: Headphones,
    }
    const Icon = icons[type as keyof typeof icons] || FileText
    return <Icon className="h-4 w-4" />
  }

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      video: 'bg-red-100 text-red-700',
      article: 'bg-blue-100 text-blue-700',
      book: 'bg-purple-100 text-purple-700',
      audio: 'bg-green-100 text-green-700',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy border-t-transparent"></div>
      </div>
    )
  }

  if (!teaching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Teaching not found</h1>
          <Link href="/teachings">
            <Button>Back to Teachings</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <Link
            href="/teachings"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Teachings
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Audio Player or Article Content */}
            {teaching.type === 'video' && (
              <Card className="overflow-hidden">
                <div className="aspect-video bg-black">
                  <iframe
                    src={teaching.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-300 rounded-md"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-navy h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {teaching.type === 'audio' && (
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-navy to-navy-800 flex items-center justify-center">
                  <Headphones className="h-24 w-24 text-gold" />
                </div>
                <CardContent className="p-4">
                  <audio controls className="w-full">
                    <source src={teaching.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </CardContent>
              </Card>
            )}

            {teaching.type === 'book' && (
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-[3/4] max-w-md mx-auto bg-gray-200 flex items-center justify-center mb-6">
                    <BookOpen className="h-24 w-24 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <Button className="bg-navy hover:bg-navy/90">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Read Book
                    </Button>
                    <p className="text-sm text-gray-600 mt-2">
                      PDF Viewer • {teaching.duration}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {teaching.type === 'article' && (
              <Card>
                <CardContent className="p-8 prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: teaching.content || '' }} />
                </CardContent>
              </Card>
            )}

            {/* Teaching Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getTypeBadgeColor(teaching.type)}`}>
                        {getTypeIcon(teaching.type)}
                        {teaching.type.charAt(0).toUpperCase() + teaching.type.slice(1)}
                      </span>
                    </div>
                    <CardTitle className="text-3xl text-navy mb-2">
                      {teaching.title}
                    </CardTitle>
                    <p className="text-gray-600">By {teaching.author}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleBookmark}
                      className={isBookmarked ? 'text-gold' : ''}
                    >
                      <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {teaching.description}
                </p>

                <div className="flex items-center gap-6 text-sm text-gray-600 border-t border-b py-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {teaching.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {teaching.views.toLocaleString()} views
                  </div>
                  <div>{teaching.publishedAt}</div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-navy hover:bg-navy/90"
                    onClick={handleMarkComplete}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scriptures */}
            {teaching.scriptures && teaching.scriptures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-navy">Related Scriptures</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teaching.scriptures.map((scripture, index) => (
                    <div key={index} className="p-4 bg-gold/10 rounded-lg border-l-4 border-gold">
                      <p className="text-gray-700 italic">{scripture}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-navy">About the Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-navy">
                      {teaching.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">{teaching.author}</h3>
                    <p className="text-sm text-gray-600">Senior Pastor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Teachings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-navy">Related Teachings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedTeachings.map((related) => (
                  <Link
                    key={related.id}
                    href={`/teachings/${related.slug}`}
                    className="block group"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0">
                        <ImagePlaceholder aspectRatio="1/1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-navy group-hover:text-gold transition-colors line-clamp-2 mb-1">
                          {related.title}
                        </h4>
                        <p className="text-xs text-gray-600">{related.author}</p>
                        <p className="text-xs text-gray-500 mt-1">{related.duration}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-navy">Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/teachings?topic=${teaching.topic}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      {teaching.topic.charAt(0).toUpperCase() + teaching.topic.slice(1)}
                    </Button>
                  </Link>
                  <Link href="/teachings?topic=faith">
                    <Button variant="outline" size="sm" className="text-xs">
                      Faith
                    </Button>
                  </Link>
                  <Link href="/teachings?topic=leadership">
                    <Button variant="outline" size="sm" className="text-xs">
                      Leadership
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

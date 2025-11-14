'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import {
  ArrowLeft,
  Bookmark,
  CheckCircle,
  Share2,
  Clock,
  User,
  Calendar,
  Play,
  Pause
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Comments } from '@/components/Comments'

export default function ContentViewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<any>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [relatedContent, setRelatedContent] = useState<any[]>([])
  const [memberId, setMemberId] = useState<string | null>(null)

  useEffect(() => {
    fetchContent()
  }, [params.id])

  const fetchContent = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      setMemberId(member.id)

      const { data } = await supabase
        .from('teachings')
        .select(`
          *,
          seasons (
            name,
            color
          )
        `)
        .eq('id', params.id)
        .single()

      setContent(data)

      // Fetch progress
      const { data: progressData } = await supabase
        .from('content_progress')
        .select('progress_percentage, completed')
        .eq('member_id', member.id)
        .eq('teaching_id', params.id)
        .maybeSingle()

      if (progressData) {
        setProgress(progressData.completed ? 100 : progressData.progress_percentage || 0)
        setIsCompleted(progressData.completed || false)
      }

      // Check if bookmarked
      const { data: bookmarkData } = await supabase
        .from('member_bookmarks')
        .select('id')
        .eq('member_id', member.id)
        .eq('teaching_id', params.id)
        .maybeSingle()
        .then(res => res)
        .catch(() => ({ data: null }))

      setIsBookmarked(!!bookmarkData)

      // Fetch related content from same season
      if (data?.season_id) {
        const { data: related } = await supabase
          .from('teachings')
          .select('id, title, duration_minutes, thumbnail_url')
          .eq('season_id', data.season_id)
          .eq('is_published', true)
          .neq('id', params.id)
          .limit(3)

        setRelatedContent(related || [])
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      await supabase
        .from('content_progress')
        .upsert({
          member_id: member.id,
          teaching_id: params.id,
          progress_percentage: 100,
          completed: true,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'member_id,teaching_id'
        })

      setIsCompleted(true)
      setProgress(100)
    } catch (error) {
      console.error('Error marking complete:', error)
    }
  }

  const handleBookmark = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!member) return

      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('member_bookmarks')
          .delete()
          .eq('member_id', member.id)
          .eq('teaching_id', params.id)
      } else {
        // Add bookmark
        await supabase
          .from('member_bookmarks')
          .insert({
            member_id: member.id,
            teaching_id: params.id
          })
          .then(res => res)
          .catch(() => {
            // Table might not exist yet
            console.log('Bookmarks table not available')
          })
      }

      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/4"></div>
          <div className="aspect-video bg-gray-200 rounded-lg"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="p-8">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-xl font-semibold text-navy mb-2">Content not found</h3>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? 'text-gold border-gold' : ''}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-gold' : ''}`} />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Content Player */}
            {content.content_type === 'video' && (
              <Card>
                <div className="aspect-video bg-gray-900 rounded-t-lg relative overflow-hidden">
                  {content.content_url ? (
                    <>
                      {content.content_url.includes('vimeo.com') ? (
                        <iframe
                          src={content.content_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                          className="absolute inset-0 w-full h-full"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      ) : content.content_url.includes('youtube.com') || content.content_url.includes('youtu.be') ? (
                        <iframe
                          src={content.content_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="absolute inset-0 w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={content.content_url}
                          controls
                          className="w-full h-full"
                        />
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm opacity-75">Video player will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audio Player */}
            {content.content_type === 'audio' && (
              <Card>
                <CardContent className="pt-6">
                  {content.content_url ? (
                    <audio
                      src={content.content_url}
                      controls
                      className="w-full"
                    />
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <p>Audio player will appear here</p>
                    </div>
                  )}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Article Content */}
            {content.content_type === 'article' && (
              <Card>
                <CardContent className="pt-6 prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: content.content || '<p>Content will be displayed here...</p>' }} />
                </CardContent>
              </Card>
            )}

            {/* Title and Meta */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                {content.seasons && (
                  <Badge style={{ backgroundColor: content.seasons.color, color: 'white' }}>
                    {content.seasons.name}
                  </Badge>
                )}
                {content.is_premium && (
                  <Badge className="bg-gold text-white">Premium</Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold text-navy mb-4">{content.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {content.author || 'TPC Ministries'}
                </div>
                {content.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {content.duration_minutes} minutes
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(content.published_at || content.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-gray-700 text-lg">{content.description}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-navy hover:bg-navy/90"
                onClick={handleMarkComplete}
                disabled={isCompleted}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {isCompleted ? 'Completed' : 'Mark as Complete'}
              </Button>
            </div>

            {/* Comments Section */}
            <Comments teachingId={params.id} memberId={memberId || undefined} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Content */}
            {relatedContent.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Content</CardTitle>
                  <CardDescription>Continue your journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedContent.map(item => (
                    <Link key={item.id} href={`/member/content/${item.id}`}>
                      <div className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-24 h-16 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-24 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2 text-navy">
                            {item.title}
                          </p>
                          {item.duration_minutes && (
                            <p className="text-xs text-gray-600 mt-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {item.duration_minutes} min
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Scripture References */}
            {content.scripture_references && (
              <Card>
                <CardHeader>
                  <CardTitle>Scripture References</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {content.scripture_references.split(',').map((ref: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">{ref.trim()}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

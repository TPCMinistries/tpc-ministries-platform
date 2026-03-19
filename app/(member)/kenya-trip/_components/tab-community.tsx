'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Users, Star, ExternalLink } from 'lucide-react'
import type { DelegateData } from './use-delegate-data'

interface TabCommunityProps {
  data: DelegateData
}

export function TabCommunity({ data }: TabCommunityProps) {
  const { participant, announcements, allParticipants, feedPosts } = data
  const [postContent, setPostContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitPost = async () => {
    if (!postContent.trim()) return
    setSubmitting(true)
    const success = await data.submitFeedPost(postContent.trim())
    if (success) {
      setPostContent('')
    }
    setSubmitting(false)
  }

  // Separate pinned announcements
  const pinned = announcements.filter(a => a.is_pinned)
  const regular = announcements.filter(a => !a.is_pinned)
  const sortedAnnouncements = [...pinned, ...regular]

  return (
    <div className="space-y-6">
      {/* WhatsApp Groups */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <h3 className="text-base font-semibold text-green-900 mb-3 flex items-center gap-2">
            Team Communication
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="https://chat.whatsapp.com/REPLACE_WITH_MAIN_GROUP"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <span className="text-xl">💬</span>
              <div>
                <p className="text-sm font-semibold text-green-900">General Chat</p>
                <p className="text-xs text-green-600">Updates, coordination, fellowship</p>
              </div>
              <ExternalLink className="h-4 w-4 text-green-400 ml-auto" />
            </a>
            <a
              href="https://chat.whatsapp.com/REPLACE_WITH_MEDIA_GROUP"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <span className="text-xl">📸</span>
              <div>
                <p className="text-sm font-semibold text-green-900">Media Sharing</p>
                <p className="text-xs text-green-600">Photos, videos, content drops</p>
              </div>
              <ExternalLink className="h-4 w-4 text-green-400 ml-auto" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Announcements Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Team Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAnnouncements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No announcements yet</p>
          ) : (
            <div className="space-y-4">
              {sortedAnnouncements.map(ann => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-lg border ${
                    ann.is_pinned ? 'border-gold bg-gold/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      ann.priority === 'urgent' ? 'bg-red-500' :
                      ann.priority === 'high' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-navy">{ann.title}</h4>
                        {ann.is_pinned && <Star className="h-4 w-4 text-gold" />}
                        {ann.priority === 'urgent' && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{ann.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(ann.publish_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trip Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Feed</CardTitle>
          <p className="text-sm text-gray-500">Share updates, highlights, and prayer points with the team.</p>
        </CardHeader>
        <CardContent>
          {/* Post form */}
          {participant && (
            <div className="mb-6">
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share an update, prayer point, or highlight..."
                rows={3}
                className="mb-2"
              />
              <Button
                onClick={handleSubmitPost}
                disabled={submitting || !postContent.trim()}
                size="sm"
              >
                {submitting ? 'Posting...' : 'Post Update'}
              </Button>
            </div>
          )}

          {/* Feed posts */}
          {feedPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No posts yet. Be the first to share!</p>
          ) : (
            <div className="space-y-4">
              {feedPosts.map((post) => {
                const author = post.kenya_trip_participants
                return (
                  <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-navy text-white rounded-full flex items-center justify-center text-[11px] font-medium">
                        {author?.first_name?.[0]}{author?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{author?.first_name} {author?.last_name}</p>
                        <p className="text-[11px] text-gray-400">
                          {author?.service_track} &middot; {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delegate Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Delegation Directory ({allParticipants.length})
          </CardTitle>
          <p className="text-sm text-gray-500">Your fellow delegates</p>
        </CardHeader>
        <CardContent>
          {allParticipants.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Directory will be available once delegates are confirmed.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {allParticipants.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                    {p.first_name?.[0]}{p.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-500">
                      {p.service_track || 'Flex'}
                      {p.ministry_role ? ` \u00b7 ${p.ministry_role}` : ''}
                    </p>
                    {(p.instagram_handle || p.tiktok_handle || p.twitter_handle) && (
                      <div className="flex gap-2 mt-1">
                        {p.instagram_handle && (
                          <a href={`https://instagram.com/${p.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-pink-600 hover:underline">
                            @{p.instagram_handle.replace('@', '')}
                          </a>
                        )}
                        {p.tiktok_handle && (
                          <a href={`https://tiktok.com/@${p.tiktok_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-600 hover:underline">
                            TikTok
                          </a>
                        )}
                        {p.twitter_handle && (
                          <a href={`https://x.com/${p.twitter_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:underline">
                            X
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

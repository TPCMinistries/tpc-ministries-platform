'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  ArrowLeft,
  Calendar,
  MapPin,
  Video,
  Heart,
  MessageCircle,
  Send,
  Pin,
  MoreVertical,
  User,
  Plus,
  Settings,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'

interface Group {
  id: string
  name: string
  description: string
  group_type: string
  image_url?: string
  cover_image_url?: string
  meeting_schedule?: string
  meeting_location?: string
  meeting_link?: string
  members_count: number
  leader_id: string
  leader?: {
    first_name: string
    last_name: string
  }
}

interface Post {
  id: string
  content: string
  post_type: string
  image_url?: string
  likes_count: number
  comments_count: number
  is_pinned: boolean
  created_at: string
  member?: {
    first_name: string
    last_name: string
  }
  has_liked?: boolean
}

interface Member {
  id: string
  role: string
  member?: {
    id: string
    first_name: string
    last_name: string
  }
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [isLeader, setIsLeader] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts')

  // New post state
  const [showPostForm, setShowPostForm] = useState(false)
  const [newPost, setNewPost] = useState({ content: '', post_type: 'discussion' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMember()
  }, [])

  useEffect(() => {
    if (memberId) {
      fetchGroup()
      fetchPosts()
      fetchMembers()
    }
  }, [memberId, groupId])

  const fetchMember = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (member) setMemberId(member.id)
    }
  }

  const fetchGroup = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('community_groups')
      .select(`
        *,
        leader:members!community_groups_leader_id_fkey(first_name, last_name)
      `)
      .eq('id', groupId)
      .single()

    if (!error && data) {
      setGroup(data)
      setIsLeader(data.leader_id === memberId)
    }
    setLoading(false)
  }

  const fetchPosts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('group_posts')
      .select(`
        *,
        member:members(first_name, last_name)
      `)
      .eq('group_id', groupId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (data && memberId) {
      // Check likes
      const { data: likes } = await supabase
        .from('group_post_likes')
        .select('post_id')
        .eq('member_id', memberId)

      const likedIds = new Set(likes?.map(l => l.post_id) || [])
      setPosts(data.map(p => ({ ...p, has_liked: likedIds.has(p.id) })))
    }
  }

  const fetchMembers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('group_members')
      .select(`
        id,
        role,
        member:members(id, first_name, last_name)
      `)
      .eq('group_id', groupId)
      .eq('status', 'active')
      .order('role')

    if (data) {
      // Supabase returns nested relations as arrays, extract first item
      const processedMembers = data.map((m: any) => ({
        id: m.id,
        role: m.role,
        member: Array.isArray(m.member) ? m.member[0] : m.member
      }))
      setMembers(processedMembers)
    }
  }

  const handleCreatePost = async () => {
    if (!memberId || !newPost.content.trim()) return

    setSubmitting(true)
    const supabase = createClient()

    await supabase.from('group_posts').insert({
      group_id: groupId,
      member_id: memberId,
      content: newPost.content,
      post_type: newPost.post_type
    })

    await supabase
      .from('community_groups')
      .update({ posts_count: (group?.members_count || 0) + 1 })
      .eq('id', groupId)

    setNewPost({ content: '', post_type: 'discussion' })
    setShowPostForm(false)
    setSubmitting(false)
    fetchPosts()
  }

  const handleLikePost = async (postId: string) => {
    if (!memberId) return

    const supabase = createClient()
    const post = posts.find(p => p.id === postId)

    if (post?.has_liked) {
      await supabase
        .from('group_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('member_id', memberId)

      await supabase
        .from('group_posts')
        .update({ likes_count: post.likes_count - 1 })
        .eq('id', postId)
    } else {
      await supabase.from('group_post_likes').insert({
        post_id: postId,
        member_id: memberId
      })

      await supabase
        .from('group_posts')
        .update({ likes_count: (post?.likes_count || 0) + 1 })
        .eq('id', postId)
    }

    fetchPosts()
  }

  const getPostTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      discussion: 'Discussion',
      prayer_request: 'Prayer Request',
      announcement: 'Announcement',
      testimony: 'Testimony',
      question: 'Question'
    }
    return labels[type] || type
  }

  const getPostTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      discussion: 'bg-blue-100 text-blue-800',
      prayer_request: 'bg-purple-100 text-purple-800',
      announcement: 'bg-gold/20 text-amber-800',
      testimony: 'bg-green-100 text-green-800',
      question: 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Group not found</h2>
          <Link href="/groups">
            <Button className="mt-4">Back to Groups</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-br from-navy to-navy/70 relative">
        {group.cover_image_url && (
          <img src={group.cover_image_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back Button */}
        <Link href="/groups" className="absolute top-4 left-4">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        {/* Group Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-white/80 text-sm">{group.members_count} members</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Group Info Card */}
        <Card className="-mt-8 relative z-10 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-600 mb-4">{group.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {group.meeting_schedule && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-navy" />
                      {group.meeting_schedule}
                    </div>
                  )}
                  {group.meeting_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-navy" />
                      {group.meeting_location}
                    </div>
                  )}
                  {group.meeting_link && (
                    <a
                      href={group.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-navy hover:underline"
                    >
                      <Video className="h-4 w-4" />
                      Join Virtual Meeting
                    </a>
                  )}
                </div>

                {group.leader && (
                  <p className="text-sm text-gray-500 mt-3">
                    Led by <span className="font-medium">{group.leader.first_name} {group.leader.last_name}</span>
                  </p>
                )}
              </div>

              {isLeader && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'posts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('posts')}
            className={activeTab === 'posts' ? 'bg-navy' : ''}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Discussions
          </Button>
          <Button
            variant={activeTab === 'members' ? 'default' : 'outline'}
            onClick={() => setActiveTab('members')}
            className={activeTab === 'members' ? 'bg-navy' : ''}
          >
            <Users className="h-4 w-4 mr-2" />
            Members ({members.length})
          </Button>
        </div>

        {activeTab === 'posts' && (
          <>
            {/* New Post Button */}
            {!showPostForm ? (
              <Button
                onClick={() => setShowPostForm(true)}
                className="w-full mb-4 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 justify-start"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start a discussion...
              </Button>
            ) : (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-3">
                    {['discussion', 'prayer_request', 'question', 'testimony'].map(type => (
                      <Button
                        key={type}
                        size="sm"
                        variant={newPost.post_type === type ? 'default' : 'outline'}
                        onClick={() => setNewPost({ ...newPost, post_type: type })}
                        className={newPost.post_type === type ? 'bg-navy' : ''}
                      >
                        {getPostTypeLabel(type)}
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="What's on your heart?"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                    className="mb-3"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowPostForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={submitting || !newPost.content.trim()}
                      className="bg-gold hover:bg-gold/90 text-navy"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No posts yet</h3>
                  <p className="text-gray-500">Be the first to start a discussion!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <Card key={post.id} className={post.is_pinned ? 'ring-2 ring-gold' : ''}>
                    {post.is_pinned && (
                      <div className="bg-gold/10 text-gold text-xs font-medium px-4 py-1 flex items-center gap-1">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </div>
                    )}
                    <CardContent className="p-4">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-navy" />
                          </div>
                          <div>
                            <p className="font-medium text-navy">
                              {post.member?.first_name} {post.member?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge className={getPostTypeColor(post.post_type)}>
                          {getPostTypeLabel(post.post_type)}
                        </Badge>
                      </div>

                      {/* Post Content */}
                      <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>

                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt=""
                          className="rounded-lg mb-4 max-h-64 object-cover"
                        />
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4 pt-3 border-t">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            post.has_liked
                              ? 'text-red-500'
                              : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${post.has_liked ? 'fill-current' : ''}`} />
                          <span>{post.likes_count}</span>
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy">
                          <MessageCircle className="h-5 w-5" />
                          <span>{post.comments_count}</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'members' && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-navy" />
                      </div>
                      <div>
                        <p className="font-medium text-navy">
                          {m.member?.first_name} {m.member?.last_name}
                        </p>
                      </div>
                    </div>
                    {m.role !== 'member' && (
                      <Badge variant="outline" className="capitalize">
                        {m.role}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

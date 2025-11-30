'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Star,
  Sparkles,
  Send,
  X,
  Image as ImageIcon,
  Filter,
  User
} from 'lucide-react'

interface Testimony {
  id: string
  title: string
  content: string
  category: string
  image_url?: string
  is_anonymous: boolean
  is_featured: boolean
  likes_count: number
  comments_count: number
  created_at: string
  member?: {
    first_name: string
    last_name: string
  }
  has_liked?: boolean
}

interface Comment {
  id: string
  content: string
  created_at: string
  member?: {
    first_name: string
    last_name: string
  }
}

const categories = [
  { value: 'all', label: 'All Testimonies' },
  { value: 'healing', label: 'Healing' },
  { value: 'provision', label: 'Provision' },
  { value: 'breakthrough', label: 'Breakthrough' },
  { value: 'salvation', label: 'Salvation' },
  { value: 'deliverance', label: 'Deliverance' },
  { value: 'answered_prayer', label: 'Answered Prayer' },
  { value: 'other', label: 'Other' }
]

export default function TestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [memberId, setMemberId] = useState<string | null>(null)
  const [expandedTestimony, setExpandedTestimony] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'breakthrough',
    is_anonymous: false
  })

  useEffect(() => {
    fetchMember()
    fetchTestimonies()
  }, [selectedCategory])

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

  const fetchTestimonies = async () => {
    const supabase = createClient()
    setLoading(true)

    let query = supabase
      .from('testimonies')
      .select(`
        *,
        member:members(first_name, last_name)
      `)
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory)
    }

    const { data, error } = await query

    if (!error && data) {
      // Check if current user has liked each testimony
      if (memberId) {
        const { data: likes } = await supabase
          .from('testimony_likes')
          .select('testimony_id')
          .eq('member_id', memberId)

        const likedIds = new Set(likes?.map(l => l.testimony_id) || [])
        setTestimonies(data.map(t => ({ ...t, has_liked: likedIds.has(t.id) })))
      } else {
        setTestimonies(data)
      }
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberId || !formData.title || !formData.content) return

    setSubmitting(true)
    const supabase = createClient()

    const { error } = await supabase.from('testimonies').insert({
      member_id: memberId,
      ...formData,
      is_approved: false // Requires admin approval
    })

    if (!error) {
      setShowForm(false)
      setFormData({ title: '', content: '', category: 'breakthrough', is_anonymous: false })
      // Show success message
      alert('Your testimony has been submitted for review. Thank you for sharing!')
    }
    setSubmitting(false)
  }

  const handleLike = async (testimonyId: string) => {
    if (!memberId) return

    const supabase = createClient()
    const testimony = testimonies.find(t => t.id === testimonyId)

    if (testimony?.has_liked) {
      // Unlike
      await supabase
        .from('testimony_likes')
        .delete()
        .eq('testimony_id', testimonyId)
        .eq('member_id', memberId)

      await supabase
        .from('testimonies')
        .update({ likes_count: testimony.likes_count - 1 })
        .eq('id', testimonyId)
    } else {
      // Like
      await supabase.from('testimony_likes').insert({
        testimony_id: testimonyId,
        member_id: memberId
      })

      await supabase
        .from('testimonies')
        .update({ likes_count: (testimony?.likes_count || 0) + 1 })
        .eq('id', testimonyId)
    }

    fetchTestimonies()
  }

  const fetchComments = async (testimonyId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('testimony_comments')
      .select(`
        *,
        member:members(first_name, last_name)
      `)
      .eq('testimony_id', testimonyId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true })

    if (data) {
      setComments(prev => ({ ...prev, [testimonyId]: data }))
    }
  }

  const handleComment = async (testimonyId: string) => {
    if (!memberId || !newComment.trim()) return

    const supabase = createClient()
    await supabase.from('testimony_comments').insert({
      testimony_id: testimonyId,
      member_id: memberId,
      content: newComment.trim()
    })

    await supabase
      .from('testimonies')
      .update({ comments_count: (testimonies.find(t => t.id === testimonyId)?.comments_count || 0) + 1 })
      .eq('id', testimonyId)

    setNewComment('')
    fetchComments(testimonyId)
    fetchTestimonies()
  }

  const toggleComments = (testimonyId: string) => {
    if (expandedTestimony === testimonyId) {
      setExpandedTestimony(null)
    } else {
      setExpandedTestimony(testimonyId)
      fetchComments(testimonyId)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      healing: 'bg-green-100 text-green-800',
      provision: 'bg-blue-100 text-blue-800',
      breakthrough: 'bg-purple-100 text-purple-800',
      salvation: 'bg-gold/20 text-amber-800',
      deliverance: 'bg-red-100 text-red-800',
      answered_prayer: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.other
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-gold" />
            <h1 className="text-3xl font-bold text-navy">Testimony Wall</h1>
          </div>
          <p className="text-gray-600">
            Celebrate God's faithfulness. Share your breakthroughs and encourage others.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
            {categories.map(cat => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className={selectedCategory === cat.value ? 'bg-navy text-white' : ''}
              >
                {cat.label}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gold hover:bg-gold/90 text-navy font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Testimony
          </Button>
        </div>

        {/* Submit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-navy">Share Your Testimony</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., God Healed My Marriage"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      {categories.filter(c => c.value !== 'all').map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Testimony
                    </label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Share what God has done in your life..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={formData.is_anonymous}
                      onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="anonymous" className="text-sm text-gray-600">
                      Share anonymously
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-navy hover:bg-navy/90"
                    >
                      {submitting ? 'Submitting...' : 'Submit Testimony'}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Your testimony will be reviewed before being published.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Testimonies Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading testimonies...</p>
          </div>
        ) : testimonies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No testimonies yet</h3>
              <p className="text-gray-500 mt-1">Be the first to share what God has done!</p>
              <Button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-gold hover:bg-gold/90 text-navy"
              >
                Share Your Testimony
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {testimonies.map(testimony => (
              <Card
                key={testimony.id}
                className={`overflow-hidden transition-all ${testimony.is_featured ? 'ring-2 ring-gold' : ''}`}
              >
                {testimony.is_featured && (
                  <div className="bg-gradient-to-r from-gold to-amber-400 text-navy text-xs font-semibold px-4 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Featured Testimony
                  </div>
                )}
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-navy" />
                      </div>
                      <div>
                        <p className="font-semibold text-navy">
                          {testimony.is_anonymous
                            ? 'Anonymous'
                            : `${testimony.member?.first_name || 'Member'} ${testimony.member?.last_name?.[0] || ''}.`
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(testimony.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(testimony.category)}>
                      {categories.find(c => c.value === testimony.category)?.label || testimony.category}
                    </Badge>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-navy mb-2">{testimony.title}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{testimony.content}</p>

                  {/* Image */}
                  {testimony.image_url && (
                    <img
                      src={testimony.image_url}
                      alt=""
                      className="mt-4 rounded-lg max-h-64 object-cover"
                    />
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleLike(testimony.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        testimony.has_liked
                          ? 'text-red-500'
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${testimony.has_liked ? 'fill-current' : ''}`} />
                      <span>{testimony.likes_count}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(testimony.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{testimony.comments_count}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy transition-colors ml-auto">
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedTestimony === testimony.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {comments[testimony.id]?.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-lg p-3">
                            <p className="font-medium text-sm text-navy">
                              {comment.member?.first_name} {comment.member?.last_name?.[0]}.
                            </p>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      <div className="flex gap-2 mt-3">
                        <Input
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add an encouraging comment..."
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(testimony.id)}
                        />
                        <Button
                          onClick={() => handleComment(testimony.id)}
                          size="sm"
                          className="bg-navy hover:bg-navy/90"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

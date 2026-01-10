'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Pin, Lock, Plus, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Discussion {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  reply_count: number
  last_activity_at: string
  created_at: string
  member: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

interface DiscussionListProps {
  groupId: string
  onSelectDiscussion: (discussionId: string) => void
}

export default function DiscussionList({ groupId, onSelectDiscussion }: DiscussionListProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  useEffect(() => {
    fetchDiscussions()
  }, [groupId])

  const fetchDiscussions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/groups/${groupId}/discussions`)

      if (!response.ok) {
        throw new Error('Failed to fetch discussions')
      }

      const data = await response.json()
      setDiscussions(data.discussions || [])
    } catch (err) {
      console.error('Error fetching discussions:', err)
      setError('Failed to load discussions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) return

    try {
      setCreating(true)
      const response = await fetch(`/api/groups/${groupId}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create discussion')
      }

      const data = await response.json()
      setDiscussions([data.discussion, ...discussions])
      setNewTitle('')
      setNewContent('')
      setIsCreateOpen(false)
    } catch (err) {
      console.error('Error creating discussion:', err)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button onClick={fetchDiscussions} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Discussions
        </h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Start a Discussion</DialogTitle>
              <DialogDescription>
                Share something with your group members
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="What's on your mind?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, questions, or encouragement..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateDiscussion}
                disabled={creating || !newTitle.trim() || !newContent.trim()}
              >
                {creating ? 'Posting...' : 'Post Discussion'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {discussions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No discussions yet
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Be the first to start a conversation in this group
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              Start a Discussion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {discussions.map((discussion) => (
            <Card
              key={discussion.id}
              className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
              onClick={() => onSelectDiscussion(discussion.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {discussion.is_pinned && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                      {discussion.is_locked && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {discussion.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {discussion.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        by {discussion.member.first_name} {discussion.member.last_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {discussion.reply_count} {discussion.reply_count === 1 ? 'reply' : 'replies'}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(discussion.last_activity_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

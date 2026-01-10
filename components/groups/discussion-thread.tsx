'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  Pin,
  Lock,
  MoreVertical,
  Reply,
  Trash2,
  Edit2,
  Send,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Member {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
}

interface Reply {
  id: string
  content: string
  parent_reply_id: string | null
  is_edited: boolean
  created_at: string
  updated_at: string
  member: Member
}

interface Discussion {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  reply_count: number
  last_activity_at: string
  created_at: string
  updated_at: string
  member: Member
}

interface DiscussionThreadProps {
  groupId: string
  discussionId: string
  onBack: () => void
}

export default function DiscussionThread({ groupId, discussionId, onBack }: DiscussionThreadProps) {
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [membership, setMembership] = useState<{ role: string; memberId: string } | null>(null)

  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'discussion' | 'reply'; id: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchDiscussion()
  }, [groupId, discussionId])

  const fetchDiscussion = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/groups/${groupId}/discussions/${discussionId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch discussion')
      }

      const data = await response.json()
      setDiscussion(data.discussion)
      setReplies(data.replies || [])
      setMembership(data.membership)
    } catch (err) {
      console.error('Error fetching discussion:', err)
      setError('Failed to load discussion')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || submitting) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/groups/${groupId}/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          parent_reply_id: replyingTo
        })
      })

      if (!response.ok) {
        throw new Error('Failed to post reply')
      }

      const data = await response.json()
      setReplies([...replies, data.reply])
      setReplyContent('')
      setReplyingTo(null)
    } catch (err) {
      console.error('Error posting reply:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      setDeleting(true)

      if (deleteTarget.type === 'discussion') {
        const response = await fetch(`/api/groups/${groupId}/discussions/${discussionId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          onBack()
        }
      } else {
        const response = await fetch(
          `/api/groups/${groupId}/discussions/${discussionId}/replies?reply_id=${deleteTarget.id}`,
          { method: 'DELETE' }
        )

        if (response.ok) {
          setReplies(replies.filter(r => r.id !== deleteTarget.id))
        }
      }
    } catch (err) {
      console.error('Error deleting:', err)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleTogglePin = async () => {
    if (!discussion) return

    try {
      const response = await fetch(`/api/groups/${groupId}/discussions/${discussionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: !discussion.is_pinned })
      })

      if (response.ok) {
        setDiscussion({ ...discussion, is_pinned: !discussion.is_pinned })
      }
    } catch (err) {
      console.error('Error toggling pin:', err)
    }
  }

  const handleToggleLock = async () => {
    if (!discussion) return

    try {
      const response = await fetch(`/api/groups/${groupId}/discussions/${discussionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_locked: !discussion.is_locked })
      })

      if (response.ok) {
        setDiscussion({ ...discussion, is_locked: !discussion.is_locked })
      }
    } catch (err) {
      console.error('Error toggling lock:', err)
    }
  }

  const isAdmin = membership?.role === 'admin' || membership?.role === 'leader'
  const isAuthor = (memberId: string) => membership?.memberId === memberId

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error || !discussion) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error || 'Discussion not found'}</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Discussions
      </Button>

      {/* Main Discussion */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {discussion.is_pinned && (
                <Badge variant="secondary" className="gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
              {discussion.is_locked && (
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={handleTogglePin}>
                      <Pin className="mr-2 h-4 w-4" />
                      {discussion.is_pinned ? 'Unpin' : 'Pin'} Discussion
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleLock}>
                      <Lock className="mr-2 h-4 w-4" />
                      {discussion.is_locked ? 'Unlock' : 'Lock'} Discussion
                    </DropdownMenuItem>
                  </>
                )}
                {(isAuthor(discussion.member.id) || isAdmin) && (
                  <DropdownMenuItem
                    onClick={() => setDeleteTarget({ type: 'discussion', id: discussion.id })}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Discussion
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {discussion.title}
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={discussion.member.avatar_url} />
              <AvatarFallback className="bg-navy text-white">
                {discussion.member.first_name?.[0]}{discussion.member.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {discussion.member.first_name} {discussion.member.last_name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {discussion.content}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>

        {replies.map((reply) => (
          <Card key={reply.id} className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={reply.member.avatar_url} />
                    <AvatarFallback className="bg-navy text-white text-xs">
                      {reply.member.first_name?.[0]}{reply.member.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {reply.member.first_name} {reply.member.last_name}
                      {reply.is_edited && (
                        <span className="text-xs text-gray-500 ml-2">(edited)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {(isAuthor(reply.member.id) || isAdmin) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget({ type: 'reply', id: reply.id })}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Reply
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <p className="mt-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {reply.content}
              </p>

              {!discussion.is_locked && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 -ml-2 text-gray-500"
                  onClick={() => setReplyingTo(reply.id)}
                >
                  <Reply className="mr-1 h-3 w-3" />
                  Reply
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      {!discussion.is_locked && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            {replyingTo && (
              <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Replying to a comment
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex gap-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                className="flex-1"
              />
              <Button
                onClick={handleSubmitReply}
                disabled={submitting || !replyContent.trim()}
                className="self-end"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {discussion.is_locked && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <CardContent className="p-4 flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Lock className="h-4 w-4" />
            <span className="text-sm">This discussion is locked. No new replies can be added.</span>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteTarget?.type}
              {deleteTarget?.type === 'discussion' && ' and all its replies'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

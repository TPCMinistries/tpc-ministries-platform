'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  UserPlus,
  UserMinus,
  Send,
  Award,
  Users,
  Lock,
  Loader2,
  X
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MemberProfileCardProps {
  member: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
    bio?: string
    is_profile_public?: boolean
    followers_count?: number
    following_count?: number
  }
  badges?: Array<{
    id: string
    earned_at: string
    badge: {
      id: string
      name: string
      description: string
      icon_url?: string
    }
  }>
  isFollowing?: boolean
  isOwnProfile?: boolean
  isPrivate?: boolean
  onFollow?: () => Promise<void>
  onUnfollow?: () => Promise<void>
  onEncourage?: (message: string) => Promise<void>
  className?: string
}

export default function MemberProfileCard({
  member,
  badges = [],
  isFollowing = false,
  isOwnProfile = false,
  isPrivate = false,
  onFollow,
  onUnfollow,
  onEncourage,
  className
}: MemberProfileCardProps) {
  const [loading, setLoading] = useState(false)
  const [showEncourageDialog, setShowEncourageDialog] = useState(false)
  const [encourageMessage, setEncourageMessage] = useState('')
  const [sendingEncouragement, setSendingEncouragement] = useState(false)

  const handleFollow = async () => {
    if (!onFollow) return
    setLoading(true)
    try {
      await onFollow()
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (!onUnfollow) return
    setLoading(true)
    try {
      await onUnfollow()
    } finally {
      setLoading(false)
    }
  }

  const handleSendEncouragement = async () => {
    if (!onEncourage || !encourageMessage.trim()) return
    setSendingEncouragement(true)
    try {
      await onEncourage(encourageMessage)
      setEncourageMessage('')
      setShowEncourageDialog(false)
    } finally {
      setSendingEncouragement(false)
    }
  }

  return (
    <>
      <Card className={`dark:bg-gray-800 dark:border-gray-700 ${className}`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-20 w-20 flex-shrink-0">
              <AvatarImage src={member.avatar_url} />
              <AvatarFallback className="bg-navy text-white text-2xl">
                {member.first_name?.[0]}{member.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {member.first_name} {member.last_name}
                  </h3>
                  {isPrivate ? (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm">Private Profile</span>
                    </div>
                  ) : (
                    <>
                      {member.bio && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <strong className="text-gray-900 dark:text-white">
                            {member.followers_count || 0}
                          </strong>{' '}
                          followers
                        </span>
                        <span>
                          <strong className="text-gray-900 dark:text-white">
                            {member.following_count || 0}
                          </strong>{' '}
                          following
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                {!isOwnProfile && !isPrivate && (
                  <div className="flex gap-2 flex-shrink-0">
                    {isFollowing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUnfollow}
                        disabled={loading}
                        className="gap-1"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                        Following
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleFollow}
                        disabled={loading}
                        className="gap-1 bg-navy hover:bg-navy/90"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                        Follow
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEncourageDialog(true)}
                      className="gap-1"
                    >
                      <Send className="h-4 w-4" />
                      Encourage
                    </Button>
                  </div>
                )}
              </div>

              {/* Badges */}
              {!isPrivate && badges.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-gold" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Badges
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {badges.slice(0, 5).map((b) => (
                      <Badge
                        key={b.id}
                        variant="secondary"
                        className="text-xs"
                        title={b.badge.description}
                      >
                        {b.badge.name}
                      </Badge>
                    ))}
                    {badges.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{badges.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Encourage Dialog */}
      <Dialog open={showEncourageDialog} onOpenChange={setShowEncourageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Encouragement</DialogTitle>
            <DialogDescription>
              Send a word of encouragement to {member.first_name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Write your encouragement..."
            value={encourageMessage}
            onChange={(e) => setEncourageMessage(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 text-right">
            {encourageMessage.length}/500
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEncourageDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEncouragement}
              disabled={sendingEncouragement || !encourageMessage.trim()}
              className="bg-gold hover:bg-gold/90 text-navy"
            >
              {sendingEncouragement ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

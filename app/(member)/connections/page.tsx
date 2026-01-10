'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MemberProfileCard from '@/components/member/member-profile-card'

interface Connection {
  id: string
  created_at: string
  member: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
    bio?: string
  }
  isFollowingBack?: boolean
}

interface ConnectionsResponse {
  connections: Connection[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ConnectionsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following')
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchConnections = async (type: 'following' | 'followers', page = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/members/connections?type=${type}&page=${page}`)
      if (res.ok) {
        const data: ConnectionsResponse = await res.json()
        setConnections(data.connections)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections(activeTab)
  }, [activeTab])

  const handleFollow = async (memberId: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}/connect`, {
        method: 'POST'
      })
      if (res.ok) {
        // Refresh the list
        fetchConnections(activeTab, pagination.page)
      }
    } catch (error) {
      console.error('Error following member:', error)
    }
  }

  const handleUnfollow = async (memberId: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}/connect`, {
        method: 'DELETE'
      })
      if (res.ok) {
        // Refresh the list
        fetchConnections(activeTab, pagination.page)
      }
    } catch (error) {
      console.error('Error unfollowing member:', error)
    }
  }

  const handleEncourage = async (memberId: string, message: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}/encourage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      if (!res.ok) {
        throw new Error('Failed to send encouragement')
      }
    } catch (error) {
      console.error('Error sending encouragement:', error)
      throw error
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-navy dark:text-gold" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Connections
          </h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'following' | 'followers')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="following" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Following
          </TabsTrigger>
          <TabsTrigger value="followers" className="gap-2">
            <Users className="h-4 w-4" />
            Followers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-navy dark:text-gold" />
            </div>
          ) : connections.length === 0 ? (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Not following anyone yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Connect with other members to see their activity and send encouragement.
                </p>
                <Button
                  onClick={() => router.push('/members')}
                  className="bg-navy hover:bg-navy/90"
                >
                  Browse Members
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <MemberProfileCard
                  key={connection.id}
                  member={{
                    ...connection.member,
                    followers_count: 0,
                    following_count: 0
                  }}
                  isFollowing={true}
                  onUnfollow={() => handleUnfollow(connection.member.id)}
                  onEncourage={(message) => handleEncourage(connection.member.id, message)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="followers">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-navy dark:text-gold" />
            </div>
          ) : connections.length === 0 ? (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No followers yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  As you engage with the community, others will start following you.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <MemberProfileCard
                  key={connection.id}
                  member={{
                    ...connection.member,
                    followers_count: 0,
                    following_count: 0
                  }}
                  isFollowing={connection.isFollowingBack}
                  onFollow={() => handleFollow(connection.member.id)}
                  onUnfollow={() => handleUnfollow(connection.member.id)}
                  onEncourage={(message) => handleEncourage(connection.member.id, message)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => fetchConnections(activeTab, pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchConnections(activeTab, pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

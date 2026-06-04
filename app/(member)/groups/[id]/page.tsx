'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  ArrowLeft,
  Calendar,
  MapPin,
  Video,
  MessageCircle,
  User,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import DiscussionList from '@/components/groups/discussion-list'
import DiscussionThread from '@/components/groups/discussion-thread'

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

interface Member {
  id: string
  role: string
  member?: {
    id: string
    first_name: string
    last_name: string
  } | null
}

type MemberRelation = Member['member'] | Member['member'][] | null

interface GroupMemberRow {
  id: string
  role: string
  member?: MemberRelation
}

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [isLeader, setIsLeader] = useState(false)
  const [activeTab, setActiveTab] = useState<'discussions' | 'members'>('discussions')
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null)

  const fetchMember = useCallback(async () => {
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
  }, [])

  const fetchGroup = useCallback(async () => {
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
  }, [groupId, memberId])

  const fetchMembers = useCallback(async () => {
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
      const processedMembers = data.map((m: GroupMemberRow) => ({
        id: m.id,
        role: m.role,
        member: Array.isArray(m.member) ? m.member[0] : m.member
      }))
      setMembers(processedMembers)
    }
  }, [groupId])

  useEffect(() => {
    fetchMember()
  }, [fetchMember])

  useEffect(() => {
    if (memberId) {
      fetchGroup()
      fetchMembers()
    }
  }, [fetchGroup, fetchMembers, memberId])

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
          <Image src={group.cover_image_url} alt={group.name} fill className="object-cover" sizes="100vw" priority />
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
            variant={activeTab === 'discussions' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('discussions')
              setSelectedDiscussionId(null)
            }}
            className={activeTab === 'discussions' ? 'bg-navy' : ''}
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

        {activeTab === 'discussions' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            {selectedDiscussionId ? (
              <DiscussionThread
                groupId={groupId}
                discussionId={selectedDiscussionId}
                onBack={() => setSelectedDiscussionId(null)}
              />
            ) : (
              <DiscussionList
                groupId={groupId}
                onSelectDiscussion={(id) => setSelectedDiscussionId(id)}
              />
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="space-y-3">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy/10 dark:bg-navy/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-navy dark:text-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-navy dark:text-white">
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

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Users,
  Search,
  MapPin,
  Video,
  Calendar,
  Lock,
  Globe,
  ChevronRight,
  UserPlus,
  CheckCircle,
  Clock,
  Heart,
  BookOpen,
  MessageCircle,
  Sparkles
} from 'lucide-react'

interface Group {
  id: string
  name: string
  description: string
  group_type: string
  image_url?: string
  is_public: boolean
  requires_approval: boolean
  meeting_schedule?: string
  meeting_location?: string
  meeting_link?: string
  members_count: number
  posts_count: number
  leader?: {
    first_name: string
    last_name: string
  }
  membership_status?: 'active' | 'pending' | null
}

const groupTypes = [
  { value: 'all', label: 'All Groups' },
  { value: 'small_group', label: 'Small Groups' },
  { value: 'prayer_group', label: 'Prayer Groups' },
  { value: 'study_group', label: 'Bible Study' },
  { value: 'ministry_team', label: 'Ministry Teams' },
  { value: 'interest', label: 'Interest Groups' }
]

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [myGroups, setMyGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [memberId, setMemberId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups'>('discover')

  useEffect(() => {
    fetchMember()
  }, [])

  useEffect(() => {
    if (memberId) {
      fetchGroups()
      fetchMyGroups()
    }
  }, [memberId, selectedType])

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

  const fetchGroups = async () => {
    const supabase = createClient()
    setLoading(true)

    let query = supabase
      .from('community_groups')
      .select(`
        *,
        leader:members!community_groups_leader_id_fkey(first_name, last_name)
      `)
      .eq('is_active', true)
      .eq('is_public', true)
      .order('members_count', { ascending: false })

    if (selectedType !== 'all') {
      query = query.eq('group_type', selectedType)
    }

    const { data, error } = await query

    if (!error && data && memberId) {
      // Check membership status for each group
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id, status')
        .eq('member_id', memberId)

      const membershipMap = new Map(memberships?.map(m => [m.group_id, m.status]) || [])

      setGroups(data.map(g => ({
        ...g,
        membership_status: membershipMap.get(g.id) as 'active' | 'pending' | null
      })))
    }
    setLoading(false)
  }

  const fetchMyGroups = async () => {
    if (!memberId) return

    const supabase = createClient()

    const { data } = await supabase
      .from('group_members')
      .select(`
        status,
        group:community_groups(
          *,
          leader:members!community_groups_leader_id_fkey(first_name, last_name)
        )
      `)
      .eq('member_id', memberId)
      .eq('status', 'active')

    if (data) {
      setMyGroups(data.map(d => ({ ...d.group as any, membership_status: d.status })))
    }
  }

  const handleJoinGroup = async (groupId: string, requiresApproval: boolean) => {
    if (!memberId) return

    const supabase = createClient()

    await supabase.from('group_members').insert({
      group_id: groupId,
      member_id: memberId,
      status: requiresApproval ? 'pending' : 'active'
    })

    // Update members count if immediately active
    if (!requiresApproval) {
      const group = groups.find(g => g.id === groupId)
      if (group) {
        await supabase
          .from('community_groups')
          .update({ members_count: group.members_count + 1 })
          .eq('id', groupId)
      }
    }

    fetchGroups()
    fetchMyGroups()
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      small_group: Users,
      prayer_group: Heart,
      study_group: BookOpen,
      ministry_team: Sparkles,
      interest: MessageCircle
    }
    return icons[type] || Users
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      small_group: 'bg-blue-100 text-blue-800',
      prayer_group: 'bg-purple-100 text-purple-800',
      study_group: 'bg-green-100 text-green-800',
      ministry_team: 'bg-gold/20 text-amber-800',
      interest: 'bg-pink-100 text-pink-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-8 w-8 text-gold" />
            <h1 className="text-3xl font-bold text-navy">Community Groups</h1>
          </div>
          <p className="text-gray-600">Connect, grow, and serve together</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'discover' ? 'default' : 'outline'}
            onClick={() => setActiveTab('discover')}
            className={activeTab === 'discover' ? 'bg-navy' : ''}
          >
            <Globe className="h-4 w-4 mr-2" />
            Discover Groups
          </Button>
          <Button
            variant={activeTab === 'my-groups' ? 'default' : 'outline'}
            onClick={() => setActiveTab('my-groups')}
            className={activeTab === 'my-groups' ? 'bg-navy' : ''}
          >
            <Users className="h-4 w-4 mr-2" />
            My Groups ({myGroups.length})
          </Button>
        </div>

        {activeTab === 'discover' && (
          <>
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {groupTypes.map(type => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type.value)}
                    className={selectedType === type.value ? 'bg-navy' : ''}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Groups Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
              </div>
            ) : filteredGroups.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No groups found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map(group => {
                  const TypeIcon = getTypeIcon(group.group_type)

                  return (
                    <Card key={group.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Cover Image */}
                      <div className="h-32 bg-gradient-to-br from-navy to-navy/70 relative">
                        {group.image_url ? (
                          <img src={group.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <TypeIcon className="h-16 w-16 text-white/20" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className={getTypeColor(group.group_type)}>
                            {groupTypes.find(t => t.value === group.group_type)?.label || group.group_type}
                          </Badge>
                        </div>
                        {!group.is_public && (
                          <div className="absolute top-3 right-3">
                            <Lock className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-navy text-lg mb-1">{group.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {group.description || 'Join us for fellowship and growth!'}
                        </p>

                        {/* Meeting Info */}
                        <div className="space-y-1 text-sm text-gray-500 mb-3">
                          {group.meeting_schedule && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{group.meeting_schedule}</span>
                            </div>
                          )}
                          {group.meeting_location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{group.meeting_location}</span>
                            </div>
                          )}
                          {group.meeting_link && (
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              <span>Virtual meetings available</span>
                            </div>
                          )}
                        </div>

                        {/* Stats & Leader */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{group.members_count} members</span>
                          </div>
                          {group.leader && (
                            <span>Led by {group.leader.first_name}</span>
                          )}
                        </div>

                        {/* Action Button */}
                        {group.membership_status === 'active' ? (
                          <Link href={`/groups/${group.id}`}>
                            <Button className="w-full bg-navy hover:bg-navy/90">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              View Group
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            </Button>
                          </Link>
                        ) : group.membership_status === 'pending' ? (
                          <Button disabled className="w-full bg-gray-100 text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            Pending Approval
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleJoinGroup(group.id, group.requires_approval)}
                            className="w-full bg-gold hover:bg-gold/90 text-navy"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {group.requires_approval ? 'Request to Join' : 'Join Group'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'my-groups' && (
          <>
            {myGroups.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">You haven't joined any groups yet</h3>
                  <p className="text-gray-500 mt-1 mb-4">Discover groups to connect with your community</p>
                  <Button onClick={() => setActiveTab('discover')} className="bg-gold hover:bg-gold/90 text-navy">
                    <Globe className="h-4 w-4 mr-2" />
                    Discover Groups
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroups.map(group => {
                  const TypeIcon = getTypeIcon(group.group_type)

                  return (
                    <Link key={group.id} href={`/groups/${group.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="h-24 bg-gradient-to-br from-navy to-navy/70 relative">
                          {group.image_url ? (
                            <img src={group.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <TypeIcon className="h-12 w-12 text-white/20" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-navy">{group.name}</h3>
                              <p className="text-sm text-gray-500">{group.members_count} members</p>
                            </div>
                            <Badge className={getTypeColor(group.group_type)}>
                              {groupTypes.find(t => t.value === group.group_type)?.label?.split(' ')[0] || ''}
                            </Badge>
                          </div>
                          {group.meeting_schedule && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {group.meeting_schedule}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

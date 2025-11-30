'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Search,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface Group {
  id: string
  name: string
  description: string
  group_type: string
  is_public: boolean
  requires_approval: boolean
  meeting_schedule?: string
  meeting_location?: string
  meeting_link?: string
  max_members?: number
  members_count: number
  posts_count: number
  is_active: boolean
  created_at: string
  leader?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

interface PendingMember {
  id: string
  group_id: string
  member: {
    first_name: string
    last_name: string
    email: string
  }
  group: {
    name: string
  }
}

const groupTypes = [
  { value: 'small_group', label: 'Small Group' },
  { value: 'prayer_group', label: 'Prayer Group' },
  { value: 'study_group', label: 'Bible Study' },
  { value: 'ministry_team', label: 'Ministry Team' },
  { value: 'interest', label: 'Interest Group' }
]

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [members, setMembers] = useState<any[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'small_group',
    is_public: true,
    requires_approval: false,
    meeting_schedule: '',
    meeting_location: '',
    meeting_link: '',
    max_members: '',
    leader_id: ''
  })

  useEffect(() => {
    fetchGroups()
    fetchPendingMembers()
    fetchMembers()
  }, [])

  const fetchGroups = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase
      .from('community_groups')
      .select(`
        *,
        leader:members!community_groups_leader_id_fkey(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setGroups(data)
    }
    setLoading(false)
  }

  const fetchPendingMembers = async () => {
    const supabase = createClient()

    const { data } = await supabase
      .from('group_members')
      .select(`
        id,
        group_id,
        member:members(first_name, last_name, email),
        group:community_groups(name)
      `)
      .eq('status', 'pending')

    if (data) {
      setPendingMembers(data as any)
    }
  }

  const fetchMembers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('members')
      .select('id, first_name, last_name, email')
      .order('first_name')

    if (data) setMembers(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const groupData = {
      name: formData.name,
      description: formData.description,
      group_type: formData.group_type,
      is_public: formData.is_public,
      requires_approval: formData.requires_approval,
      meeting_schedule: formData.meeting_schedule || null,
      meeting_location: formData.meeting_location || null,
      meeting_link: formData.meeting_link || null,
      max_members: formData.max_members ? parseInt(formData.max_members) : null,
      leader_id: formData.leader_id || null
    }

    if (editingGroup) {
      await supabase
        .from('community_groups')
        .update(groupData)
        .eq('id', editingGroup.id)
    } else {
      await supabase.from('community_groups').insert(groupData)
    }

    resetForm()
    fetchGroups()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      group_type: 'small_group',
      is_public: true,
      requires_approval: false,
      meeting_schedule: '',
      meeting_location: '',
      meeting_link: '',
      max_members: '',
      leader_id: ''
    })
    setEditingGroup(null)
    setShowForm(false)
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      group_type: group.group_type,
      is_public: group.is_public,
      requires_approval: group.requires_approval,
      meeting_schedule: group.meeting_schedule || '',
      meeting_location: group.meeting_location || '',
      meeting_link: group.meeting_link || '',
      max_members: group.max_members?.toString() || '',
      leader_id: group.leader?.id || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    const supabase = createClient()
    await supabase.from('community_groups').delete().eq('id', id)
    fetchGroups()
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient()
    await supabase.from('community_groups').update({ is_active: !isActive }).eq('id', id)
    fetchGroups()
  }

  const handleApproveMember = async (membershipId: string, groupId: string) => {
    const supabase = createClient()

    await supabase
      .from('group_members')
      .update({ status: 'active' })
      .eq('id', membershipId)

    // Update member count
    const group = groups.find(g => g.id === groupId)
    if (group) {
      await supabase
        .from('community_groups')
        .update({ members_count: group.members_count + 1 })
        .eq('id', groupId)
    }

    fetchPendingMembers()
    fetchGroups()
  }

  const handleRejectMember = async (membershipId: string) => {
    const supabase = createClient()
    await supabase.from('group_members').delete().eq('id', membershipId)
    fetchPendingMembers()
  }

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Users className="h-6 w-6 text-gold" />
            Community Groups
          </h1>
          <p className="text-gray-500">Manage groups and memberships</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold/90 text-navy">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Groups</p>
            <p className="text-2xl font-bold text-navy">{groups.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active Groups</p>
            <p className="text-2xl font-bold text-green-600">
              {groups.filter(g => g.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Members</p>
            <p className="text-2xl font-bold text-navy">
              {groups.reduce((sum, g) => sum + g.members_count, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => {}}>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-600">{pendingMembers.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingMembers.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Membership Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingMembers.map(pm => (
                <div key={pm.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {pm.member.first_name} {pm.member.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      wants to join <span className="font-medium">{pm.group.name}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveMember(pm.id, pm.group_id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectMember(pm.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Groups Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No groups found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map(group => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-navy">{group.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {group.description?.substring(0, 50)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {groupTypes.find(t => t.value === group.group_type)?.label || group.group_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {group.leader ? (
                        <span>{group.leader.first_name} {group.leader.last_name}</span>
                      ) : (
                        <span className="text-gray-400">No leader</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {group.members_count}
                        {group.max_members && (
                          <span className="text-gray-400">/{group.max_members}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={group.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {group.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(group)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(group.id, group.is_active)}
                        >
                          {group.is_active ? (
                            <XCircle className="h-4 w-4 text-gray-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{editingGroup ? 'Edit Group' : 'Create New Group'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Group Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Group Type</label>
                    <select
                      value={formData.group_type}
                      onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      {groupTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Leader</label>
                    <select
                      value={formData.leader_id}
                      onChange={(e) => setFormData({ ...formData, leader_id: e.target.value })}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      <option value="">Select a leader</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.first_name} {m.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Meeting Schedule</label>
                    <Input
                      value={formData.meeting_schedule}
                      onChange={(e) => setFormData({ ...formData, meeting_schedule: e.target.value })}
                      placeholder="e.g., Every Tuesday at 7pm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Max Members</label>
                    <Input
                      type="number"
                      value={formData.max_members}
                      onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Meeting Location</label>
                    <Input
                      value={formData.meeting_location}
                      onChange={(e) => setFormData({ ...formData, meeting_location: e.target.value })}
                      placeholder="Physical location"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Virtual Meeting Link</label>
                    <Input
                      value={formData.meeting_link}
                      onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                      placeholder="https://zoom.us/..."
                    />
                  </div>

                  <div className="col-span-2 flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_public}
                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Public group (visible to all)</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.requires_approval}
                        onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Require approval to join</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-navy hover:bg-navy/90">
                    {editingGroup ? 'Update Group' : 'Create Group'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

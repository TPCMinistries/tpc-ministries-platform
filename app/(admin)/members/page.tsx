'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Crown,
  Sparkles,
  User,
  Eye,
  Mail,
  Calendar,
  Loader2,
  Users,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Tag,
  Phone,
  X,
  Check,
  UserPlus,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Send
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MemberTag {
  id: string
  name: string
  color: string
}

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  tier: 'free' | 'partner' | 'covenant'
  is_admin: boolean
  avatar_url?: string
  bio?: string
  location?: string
  notes?: string
  joined_at: string
  last_active_at?: string
  created_at: string
  tags: MemberTag[]
}

interface Tag {
  id: string
  name: string
  color: string
  description?: string
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Modal states
  const [showAddMember, setShowAddMember] = useState(false)
  const [showEditMember, setShowEditMember] = useState(false)
  const [showManageTags, setShowManageTags] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [saving, setSaving] = useState(false)

  // Import states
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    imported: number
    skipped: number
    total: number
    errors: string[]
  } | null>(null)

  // Bulk selection states
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [showBulkTagModal, setShowBulkTagModal] = useState(false)
  const [showBulkTierModal, setShowBulkTierModal] = useState(false)
  const [bulkProcessing, setBulkProcessing] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    tier: 'free' as 'free' | 'partner' | 'covenant',
    is_admin: false,
    notes: '',
    tags: [] as string[]
  })

  // New tag form
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6B7280')

  const { toast } = useToast()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/members')
      const data = await res.json()

      if (data.success) {
        setMembers(data.members || [])
        setAvailableTags(data.availableTags || [])
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load members',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load members',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Success', description: 'Member added successfully' })
        setShowAddMember(false)
        resetForm()
        fetchMembers()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to add member',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateMember = async () => {
    if (!selectedMember) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMember.id,
          ...formData
        })
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Success', description: 'Member updated successfully' })
        setShowEditMember(false)
        setSelectedMember(null)
        fetchMembers()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update member',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update member',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/members?id=${member.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Success', description: 'Member deleted successfully' })
        fetchMembers()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete member',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete member',
        variant: 'destructive',
      })
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName,
          color: newTagColor
        })
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Success', description: 'Tag created successfully' })
        setNewTagName('')
        setNewTagColor('#6B7280')
        fetchMembers() // Refresh to get new tags
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create tag',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create tag',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    try {
      const res = await fetch(`/api/admin/tags?id=${tagId}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Success', description: 'Tag deleted successfully' })
        fetchMembers()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete tag',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive',
      })
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/members/import', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (data.success) {
        setImportResults(data.results)
        if (data.results.imported > 0) {
          fetchMembers()
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to import members',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import members',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const downloadTemplate = () => {
    const csvContent = `first_name,last_name,email,phone,tier,is_admin,tags,notes
John,Doe,john@example.com,555-123-4567,free,false,New Member;Volunteer,Welcome to the church!
Jane,Smith,jane@example.com,555-987-6543,partner,false,Leadership;Prayer Team,Active in ministry`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'member_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Bulk selection handlers
  const toggleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(memberId)) {
        newSet.delete(memberId)
      } else {
        newSet.add(memberId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set())
    } else {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)))
    }
  }

  const handleBulkAddTags = async (tagIds: string[]) => {
    if (selectedMembers.size === 0 || tagIds.length === 0) return

    setBulkProcessing(true)
    try {
      let successCount = 0
      for (const memberId of Array.from(selectedMembers)) {
        const member = members.find(m => m.id === memberId)
        if (!member) continue

        const existingTagIds = member.tags.map(t => t.id)
        const newTagIds = Array.from(new Set([...existingTagIds, ...tagIds]))

        const res = await fetch('/api/admin/members', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: memberId,
            tags: newTagIds
          })
        })
        if ((await res.json()).success) successCount++
      }

      toast({
        title: 'Success',
        description: `Added tags to ${successCount} members`
      })
      setShowBulkTagModal(false)
      setSelectedMembers(new Set())
      fetchMembers()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update some members',
        variant: 'destructive',
      })
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleBulkChangeTier = async (tier: string) => {
    if (selectedMembers.size === 0) return

    setBulkProcessing(true)
    try {
      let successCount = 0
      for (const memberId of Array.from(selectedMembers)) {
        const res = await fetch('/api/admin/members', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: memberId,
            tier: tier
          })
        })
        if ((await res.json()).success) successCount++
      }

      toast({
        title: 'Success',
        description: `Updated tier for ${successCount} members`
      })
      setShowBulkTierModal(false)
      setSelectedMembers(new Set())
      fetchMembers()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update some members',
        variant: 'destructive',
      })
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMembers.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedMembers.size} members? This cannot be undone.`)) {
      return
    }

    setBulkProcessing(true)
    try {
      let successCount = 0
      for (const memberId of Array.from(selectedMembers)) {
        const res = await fetch(`/api/admin/members?id=${memberId}`, {
          method: 'DELETE'
        })
        if ((await res.json()).success) successCount++
      }

      toast({
        title: 'Success',
        description: `Deleted ${successCount} members`
      })
      setSelectedMembers(new Set())
      fetchMembers()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some members',
        variant: 'destructive',
      })
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleSendInvite = async (member: Member) => {
    try {
      const res = await fetch('/api/email/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: `${member.first_name} ${member.last_name}`,
          email: member.email,
          loginUrl: 'https://tpcmin.org/login'
        })
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Invite Sent',
          description: `Welcome email sent to ${member.email}`
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send invite',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invite',
        variant: 'destructive',
      })
    }
  }

  const handleBulkSendInvites = async () => {
    if (selectedMembers.size === 0) return

    setBulkProcessing(true)
    try {
      let successCount = 0
      for (const memberId of Array.from(selectedMembers)) {
        const member = members.find(m => m.id === memberId)
        if (!member) continue

        const res = await fetch('/api/email/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberName: `${member.first_name} ${member.last_name}`,
            email: member.email,
            loginUrl: 'https://tpcmin.org/login'
          })
        })
        if ((await res.json()).success) successCount++
      }

      toast({
        title: 'Invites Sent',
        description: `Sent ${successCount} welcome emails`
      })
      setSelectedMembers(new Set())
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send some invites',
        variant: 'destructive',
      })
    } finally {
      setBulkProcessing(false)
    }
  }

  const openEditModal = (member: Member) => {
    setSelectedMember(member)
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone || '',
      tier: member.tier,
      is_admin: member.is_admin,
      notes: member.notes || '',
      tags: member.tags.map(t => t.id)
    })
    setShowEditMember(true)
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      tier: 'free' as 'free' | 'partner' | 'covenant',
      is_admin: false,
      notes: '',
      tags: []
    })
  }

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'covenant':
        return <Crown className="h-4 w-4 text-gold" />
      case 'partner':
        return <Sparkles className="h-4 w-4 text-blue-600" />
      default:
        return <User className="h-4 w-4 text-gray-400" />
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'covenant':
        return 'bg-gold/20 text-gold border-gold/30'
      case 'partner':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTier = tierFilter === 'all' || member.tier === tierFilter
    const matchesRole = roleFilter === 'all' ||
      (roleFilter === 'admin' && member.is_admin) ||
      (roleFilter === 'member' && !member.is_admin)
    const matchesTag = tagFilter === 'all' ||
      member.tags.some(t => t.id === tagFilter)

    return matchesSearch && matchesTier && matchesRole && matchesTag
  })

  const stats = {
    total: members.length,
    free: members.filter(m => m.tier === 'free').length,
    partner: members.filter(m => m.tier === 'partner').length,
    covenant: members.filter(m => m.tier === 'covenant').length,
    admins: members.filter(m => m.is_admin).length,
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-navy" />
              <h1 className="text-4xl font-bold text-navy">Members</h1>
            </div>
            <p className="text-gray-600">Manage members, roles, tiers, and tags</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowManageTags(true)}>
              <Tag className="h-4 w-4 mr-2" />
              Manage Tags
            </Button>
            <Button variant="outline" onClick={() => { setImportResults(null); setShowImportModal(true) }}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => { resetForm(); setShowAddMember(true) }} className="bg-navy hover:bg-navy/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Free Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{stats.free}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Partner Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.partner}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Covenant Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">{stats.covenant}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.admins}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search members by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-40">
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="covenant">Covenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-40">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admins Only</SelectItem>
                    <SelectItem value="member">Members Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-48">
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {availableTags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedMembers.size > 0 && (
          <Card className="mb-6 bg-navy text-white">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMembers(new Set())}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleBulkSendInvites}
                    disabled={bulkProcessing}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Invites
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowBulkTagModal(true)}
                    disabled={bulkProcessing}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Add Tags
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowBulkTierModal(true)}
                    disabled={bulkProcessing}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Change Tier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkProcessing}
                  >
                    {bulkProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-navy">All Members</CardTitle>
            <CardDescription>{filteredMembers.length} members</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No members found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Member</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tier</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tags</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className={`border-b hover:bg-gray-50 ${selectedMembers.has(member.id) ? 'bg-blue-50' : ''}`}>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedMembers.has(member.id)}
                            onChange={() => toggleSelectMember(member.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-navy" />
                            </div>
                            <div>
                              <div className="font-medium text-navy flex items-center gap-2">
                                {member.first_name} {member.last_name}
                                {member.is_admin && (
                                  <Shield className="h-4 w-4 text-purple-600" />
                                )}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${getTierBadgeColor(member.tier)}`}>
                            {getTierIcon(member.tier)}
                            <span className="capitalize">{member.tier}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={member.is_admin ? "default" : "outline"} className={member.is_admin ? "bg-purple-600" : ""}>
                            {member.is_admin ? 'Admin' : 'Member'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {member.tags.slice(0, 3).map(tag => (
                              <Badge
                                key={tag.id}
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: tag.color,
                                  color: tag.color
                                }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {member.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs text-gray-500">
                                +{member.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(member.joined_at || member.created_at)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/members/${member.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditModal(member)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Member
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendInvite(member)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Invite
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteMember(member)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Member Modal */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Create a new member account. They can sign up later to claim their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Membership Tier</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(v: any) => setFormData(prev => ({ ...prev, tier: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="covenant">Covenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={e => setFormData(prev => ({ ...prev, is_admin: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Shield className="h-4 w-4 text-purple-600" />
                    Admin Access
                  </span>
                </label>
              </div>
            </div>
            {availableTags.length > 0 && (
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={formData.tags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      style={formData.tags.includes(tag.id) ? {
                        backgroundColor: tag.color
                      } : {
                        borderColor: tag.color,
                        color: tag.color
                      }}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                      {formData.tags.includes(tag.id) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Internal notes about this member..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={saving} className="bg-navy hover:bg-navy/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={showEditMember} onOpenChange={setShowEditMember}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member details, tier, and tags.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_first_name">First Name *</Label>
                <Input
                  id="edit_first_name"
                  value={formData.first_name}
                  onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_last_name">Last Name *</Label>
                <Input
                  id="edit_last_name"
                  value={formData.last_name}
                  onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_email">Email *</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Membership Tier</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(v: any) => setFormData(prev => ({ ...prev, tier: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="covenant">Covenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={e => setFormData(prev => ({ ...prev, is_admin: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Shield className="h-4 w-4 text-purple-600" />
                    Admin Access
                  </span>
                </label>
              </div>
            </div>
            {availableTags.length > 0 && (
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={formData.tags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      style={formData.tags.includes(tag.id) ? {
                        backgroundColor: tag.color
                      } : {
                        borderColor: tag.color,
                        color: tag.color
                      }}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                      {formData.tags.includes(tag.id) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Internal notes about this member..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditMember(false)}>Cancel</Button>
            <Button onClick={handleUpdateMember} disabled={saving} className="bg-navy hover:bg-navy/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Tags Modal */}
      <Dialog open={showManageTags} onOpenChange={setShowManageTags}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Create and manage tags to categorize members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Create new tag */}
            <div className="flex gap-2">
              <Input
                placeholder="New tag name..."
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                className="flex-1"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={e => setNewTagColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Button onClick={handleCreateTag} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Existing tags */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableTags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {availableTags.length === 0 && (
                <p className="text-center text-gray-500 py-4">No tags yet. Create one above!</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import CSV Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Import Members from CSV
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk import members. Download the template to see the expected format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Template download */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Download Template</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Get the CSV template with all supported columns
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={downloadTemplate}
                    className="text-blue-600 p-0 h-auto mt-1"
                  >
                    Download member_import_template.csv
                  </Button>
                </div>
              </div>
            </div>

            {/* Column info */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-gray-900 mb-2">Supported Columns:</p>
              <div className="grid grid-cols-2 gap-1 text-gray-600">
                <div><span className="font-medium">first_name</span> - Required</div>
                <div><span className="font-medium">last_name</span> - Required</div>
                <div><span className="font-medium">email</span> - Required</div>
                <div><span className="font-medium">phone</span> - Optional</div>
                <div><span className="font-medium">tier</span> - free/partner/covenant</div>
                <div><span className="font-medium">is_admin</span> - true/false</div>
                <div><span className="font-medium">tags</span> - Semicolon-separated</div>
                <div><span className="font-medium">notes</span> - Optional</div>
              </div>
            </div>

            {/* File upload */}
            {!importResults && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-navy transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="hidden"
                  id="csv-upload"
                  disabled={importing}
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  {importing ? (
                    <>
                      <Loader2 className="h-10 w-10 mx-auto text-navy animate-spin" />
                      <p className="mt-2 text-sm font-medium text-gray-900">Importing...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        Click to upload CSV file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        or drag and drop
                      </p>
                    </>
                  )}
                </label>
              </div>
            )}

            {/* Import results */}
            {importResults && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Import Complete</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{importResults.imported}</div>
                      <div className="text-green-700">Imported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{importResults.skipped}</div>
                      <div className="text-yellow-700">Skipped</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{importResults.total}</div>
                      <div className="text-gray-700">Total</div>
                    </div>
                  </div>
                </div>

                {importResults.errors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Errors/Warnings</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                      {importResults.errors.map((error, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={() => setImportResults(null)}
                  variant="outline"
                  className="w-full"
                >
                  Import Another File
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Tags Modal */}
      <Dialog open={showBulkTagModal} onOpenChange={setShowBulkTagModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Add Tags to {selectedMembers.size} Members
            </DialogTitle>
            <DialogDescription>
              Select tags to add to all selected members. Existing tags will be preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {availableTags.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={formData.tags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      style={formData.tags.includes(tag.id) ? {
                        backgroundColor: tag.color
                      } : {
                        borderColor: tag.color,
                        color: tag.color
                      }}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                      {formData.tags.includes(tag.id) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No tags available. Create tags first using Manage Tags.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBulkTagModal(false); setFormData(prev => ({ ...prev, tags: [] })) }}>
              Cancel
            </Button>
            <Button
              onClick={() => handleBulkAddTags(formData.tags)}
              disabled={bulkProcessing || formData.tags.length === 0}
              className="bg-navy hover:bg-navy/90"
            >
              {bulkProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Tag className="h-4 w-4 mr-2" />
              )}
              Add Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Change Tier Modal */}
      <Dialog open={showBulkTierModal} onOpenChange={setShowBulkTierModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Change Tier for {selectedMembers.size} Members
            </DialogTitle>
            <DialogDescription>
              Select a new membership tier for all selected members.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div
              onClick={() => handleBulkChangeTier('free')}
              className="p-4 border rounded-lg cursor-pointer hover:border-navy hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">Free</div>
                  <div className="text-sm text-gray-500">Basic membership with limited access</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleBulkChangeTier('partner')}
              className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-blue-600">Partner</div>
                  <div className="text-sm text-gray-500">Monthly supporters with additional features</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleBulkChangeTier('covenant')}
              className="p-4 border rounded-lg cursor-pointer hover:border-gold hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <div className="font-medium text-gold">Covenant</div>
                  <div className="text-sm text-gray-500">Premium annual supporters with full access</div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkTierModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

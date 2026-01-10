'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Send,
  TrendingUp,
  Flame,
  Target,
  MoreVertical,
  UserCheck,
  MessageSquare,
  Copy,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getLeads,
  getLeadStats,
  getLeadById,
  updateLead,
  deleteLead,
  convertLeadToMember,
  type Lead,
  type LeadActivity,
  type LeadFilters,
  type LeadStats,
} from '@/lib/db/lead-queries'

// ============ INTERFACES ============
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
  role: 'free' | 'member' | 'partner' | 'staff' | 'admin'
  is_admin: boolean
  avatar_url?: string
  bio?: string
  location?: string
  notes?: string
  joined_at: string
  last_active_at?: string
  last_login_at?: string
  login_count?: number
  created_at: string
  tags: MemberTag[]
}

interface AvailableTag {
  id: string
  name: string
  color: string
  description?: string
}

interface Invite {
  id: string
  code: string
  email: string | null
  name: string | null
  role: string
  max_uses: number
  use_count: number
  expires_at: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  used_at: string | null
  inviter: { first_name: string; last_name: string } | null
  used_by_member: { first_name: string; last_name: string; email: string } | null
}

const interestLabels: Record<string, string> = {
  teachings: 'Teachings & Sermons',
  prayer: 'Prayer Support',
  giving: 'Giving & Supporting Missions',
  events: 'Live Events & Gatherings',
  prophecy: 'Personal Prophecy',
  missions: 'Mission Work',
}

export default function AdminMembersPage() {
  const [activeTab, setActiveTab] = useState('members')
  const { toast } = useToast()

  // ============ MEMBERS STATE ============
  const [members, setMembers] = useState<Member[]>([])
  const [availableTags, setAvailableTags] = useState<AvailableTag[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [showAddMember, setShowAddMember] = useState(false)
  const [showEditMember, setShowEditMember] = useState(false)
  const [showManageTags, setShowManageTags] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{ imported: number; skipped: number; total: number; errors: string[] } | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [showBulkTagModal, setShowBulkTagModal] = useState(false)
  const [showBulkTierModal, setShowBulkTierModal] = useState(false)
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'free' as 'free' | 'member' | 'partner' | 'staff' | 'admin',
    tier: 'free' as 'free' | 'partner' | 'covenant',
    is_admin: false,
    notes: '',
    tags: [] as string[]
  })
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6B7280')

  // ============ LEADS STATE ============
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null)
  const [leadsLoading, setLeadsLoading] = useState(true)
  const [leadFilters, setLeadFilters] = useState<LeadFilters>({
    search: '',
    status: 'all',
    interestLevel: 'all',
    source: 'all',
    dateRange: 'all',
  })
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([])
  const [leadDetailsOpen, setLeadDetailsOpen] = useState(false)
  const [deleteLeadDialogOpen, setDeleteLeadDialogOpen] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [leadProcessing, setLeadProcessing] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [leadNotes, setLeadNotes] = useState('')

  // ============ INVITES STATE ============
  const [invites, setInvites] = useState<Invite[]>([])
  const [invitesLoading, setInvitesLoading] = useState(true)
  const [createInviteOpen, setCreateInviteOpen] = useState(false)
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false)
  const [inviteFilter, setInviteFilter] = useState<'all' | 'active' | 'used'>('all')
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteNotes, setInviteNotes] = useState('')
  const [sendInviteEmail, setSendInviteEmail] = useState(true)
  const [inviteExpiresInDays, setInviteExpiresInDays] = useState<number | ''>('')
  const [creatingInvite, setCreatingInvite] = useState(false)
  const [createdInvite, setCreatedInvite] = useState<{ code: string; url: string } | null>(null)
  const [bulkInviteList, setBulkInviteList] = useState('')
  const [bulkSendEmails, setBulkSendEmails] = useState(true)
  const [bulkExpiresInDays, setBulkExpiresInDays] = useState<number | ''>('')
  const [bulkCreatingInvites, setBulkCreatingInvites] = useState(false)

  // ============ EFFECTS ============
  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers()
    } else if (activeTab === 'leads') {
      fetchLeads()
    } else if (activeTab === 'invites') {
      fetchInvites()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeads()
    }
  }, [leadFilters])

  useEffect(() => {
    if (activeTab === 'invites') {
      fetchInvites()
    }
  }, [inviteFilter])

  // ============ MEMBERS FUNCTIONS ============
  const fetchMembers = async () => {
    setMembersLoading(true)
    try {
      const res = await fetch('/api/admin/members')
      const data = await res.json()
      if (data.success) {
        setMembers(data.members || [])
        setAvailableTags(data.availableTags || [])
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to load members', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error:', error)
      toast({ title: 'Error', description: 'Failed to load members', variant: 'destructive' })
    } finally {
      setMembersLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' })
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
        resetMemberForm()
        fetchMembers()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to add member', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add member', variant: 'destructive' })
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
        body: JSON.stringify({ id: selectedMember.id, ...formData })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Member updated successfully' })
        setShowEditMember(false)
        setSelectedMember(null)
        fetchMembers()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update member', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update member', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}?`)) return
    try {
      const res = await fetch(`/api/admin/members?id=${member.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Member deleted successfully' })
        fetchMembers()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to delete member', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete member', variant: 'destructive' })
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName, color: newTagColor })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Tag created successfully' })
        setNewTagName('')
        setNewTagColor('#6B7280')
        fetchMembers()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to create tag', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create tag', variant: 'destructive' })
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    try {
      const res = await fetch(`/api/admin/tags?id=${tagId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Success', description: 'Tag deleted successfully' })
        fetchMembers()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to delete tag', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete tag', variant: 'destructive' })
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
      const res = await fetch('/api/admin/members/import', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setImportResults(data.results)
        if (data.results.imported > 0) fetchMembers()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to import members', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to import members', variant: 'destructive' })
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const downloadTemplate = () => {
    const csvContent = `first_name,last_name,email,phone,tier,is_admin,tags,notes
John,Doe,john@example.com,555-123-4567,free,false,New Member;Volunteer,Welcome!`
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'member_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const toggleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(memberId)) newSet.delete(memberId)
      else newSet.add(memberId)
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
          body: JSON.stringify({ id: memberId, tags: newTagIds })
        })
        if ((await res.json()).success) successCount++
      }
      toast({ title: 'Success', description: `Added tags to ${successCount} members` })
      setShowBulkTagModal(false)
      setSelectedMembers(new Set())
      fetchMembers()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update some members', variant: 'destructive' })
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleBulkChangeRole = async (role: string) => {
    if (selectedMembers.size === 0) return
    setBulkProcessing(true)
    try {
      let successCount = 0
      const isAdmin = role === 'admin'
      const tier = ['partner', 'staff', 'admin'].includes(role) ? 'partner' : 'free'
      for (const memberId of Array.from(selectedMembers)) {
        const res = await fetch('/api/admin/members', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: memberId, role, tier, is_admin: isAdmin })
        })
        if ((await res.json()).success) successCount++
      }
      toast({ title: 'Success', description: `Updated role for ${successCount} members` })
      setShowBulkTierModal(false)
      setSelectedMembers(new Set())
      fetchMembers()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update some members', variant: 'destructive' })
    } finally {
      setBulkProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMembers.size === 0) return
    if (!confirm(`Delete ${selectedMembers.size} members? This cannot be undone.`)) return
    setBulkProcessing(true)
    try {
      let successCount = 0
      for (const memberId of Array.from(selectedMembers)) {
        const res = await fetch(`/api/admin/members?id=${memberId}`, { method: 'DELETE' })
        if ((await res.json()).success) successCount++
      }
      toast({ title: 'Success', description: `Deleted ${successCount} members` })
      setSelectedMembers(new Set())
      fetchMembers()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete some members', variant: 'destructive' })
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
        toast({ title: 'Invite Sent', description: `Welcome email sent to ${member.email}` })
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to send invite', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send invite', variant: 'destructive' })
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
      toast({ title: 'Invites Sent', description: `Sent ${successCount} welcome emails` })
      setSelectedMembers(new Set())
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send some invites', variant: 'destructive' })
    } finally {
      setBulkProcessing(false)
    }
  }

  const openEditModal = (member: Member) => {
    setSelectedMember(member)
    const effectiveRole = member.role || (member.is_admin ? 'admin' : member.tier || 'free')
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone || '',
      role: effectiveRole as any,
      tier: member.tier,
      is_admin: member.is_admin,
      notes: member.notes || '',
      tags: member.tags.map(t => t.id)
    })
    setShowEditMember(true)
  }

  const resetMemberForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'free',
      tier: 'free',
      is_admin: false,
      notes: '',
      tags: []
    })
  }

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) ? prev.tags.filter(id => id !== tagId) : [...prev.tags, tagId]
    }))
  }

  const getEffectiveRole = (member: Member) => member.role || (member.is_admin ? 'admin' : member.tier || 'free')
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-gold" />
      case 'staff': return <Shield className="h-4 w-4 text-purple-600" />
      case 'partner': case 'covenant': return <Sparkles className="h-4 w-4 text-blue-600" />
      case 'member': return <User className="h-4 w-4 text-green-600" />
      default: return <User className="h-4 w-4 text-gray-400" />
    }
  }
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gold/20 text-gold border-gold/30'
      case 'staff': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'partner': case 'covenant': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'member': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'staff': return 'Staff'
      case 'partner': case 'covenant': return 'Partner'
      case 'member': return 'Member'
      default: return 'Free'
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never'
    const diffInDays = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const effectiveRole = getEffectiveRole(member)
    const matchesRole = roleFilter === 'all' || effectiveRole === roleFilter
    const matchesTag = tagFilter === 'all' || member.tags.some(t => t.id === tagFilter)
    return matchesSearch && matchesRole && matchesTag
  })

  const memberStats = {
    total: members.length,
    free: members.filter(m => getEffectiveRole(m) === 'free').length,
    member: members.filter(m => getEffectiveRole(m) === 'member').length,
    partner: members.filter(m => ['partner', 'covenant'].includes(getEffectiveRole(m))).length,
    staff: members.filter(m => getEffectiveRole(m) === 'staff').length,
    admin: members.filter(m => getEffectiveRole(m) === 'admin').length,
  }

  // ============ LEADS FUNCTIONS ============
  const fetchLeads = async () => {
    setLeadsLoading(true)
    try {
      const [leadsData, statsData] = await Promise.all([getLeads(leadFilters), getLeadStats()])
      setLeads(leadsData)
      setLeadStats(statsData)
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast({ title: 'Error', description: 'Failed to load leads', variant: 'destructive' })
    } finally {
      setLeadsLoading(false)
    }
  }

  const openLeadDetails = async (lead: Lead) => {
    setSelectedLead(lead)
    setLeadNotes(lead.notes || '')
    setLeadDetailsOpen(true)
    try {
      const { activities } = await getLeadById(lead.id)
      setLeadActivities(activities)
    } catch (error) {
      console.error('Error fetching lead activities:', error)
    }
  }

  const handleUpdateLeadStatus = async (status: Lead['status']) => {
    if (!selectedLead) return
    setLeadProcessing(true)
    try {
      await updateLead(selectedLead.id, { status })
      toast({ title: 'Success', description: 'Lead status updated' })
      fetchLeads()
      const updated = await getLeadById(selectedLead.id)
      setSelectedLead(updated.lead)
      setLeadActivities(updated.activities)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    } finally {
      setLeadProcessing(false)
    }
  }

  const handleUpdateLeadInterest = async (interestLevel: Lead['interest_level']) => {
    if (!selectedLead) return
    setLeadProcessing(true)
    try {
      await updateLead(selectedLead.id, { interest_level: interestLevel })
      toast({ title: 'Success', description: 'Interest level updated' })
      fetchLeads()
      const updated = await getLeadById(selectedLead.id)
      setSelectedLead(updated.lead)
      setLeadActivities(updated.activities)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update interest level', variant: 'destructive' })
    } finally {
      setLeadProcessing(false)
    }
  }

  const handleSaveLeadNotes = async () => {
    if (!selectedLead) return
    setLeadProcessing(true)
    try {
      await updateLead(selectedLead.id, { notes: leadNotes })
      toast({ title: 'Success', description: 'Notes saved' })
      setEditingNotes(false)
      fetchLeads()
      const updated = await getLeadById(selectedLead.id)
      setSelectedLead(updated.lead)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save notes', variant: 'destructive' })
    } finally {
      setLeadProcessing(false)
    }
  }

  const handleMarkContacted = async () => {
    if (!selectedLead) return
    setLeadProcessing(true)
    try {
      await updateLead(selectedLead.id, {
        last_contacted_at: new Date().toISOString(),
        status: selectedLead.status === 'new' ? 'contacted' : selectedLead.status,
      })
      toast({ title: 'Success', description: 'Lead marked as contacted' })
      fetchLeads()
      const updated = await getLeadById(selectedLead.id)
      setSelectedLead(updated.lead)
      setLeadActivities(updated.activities)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark as contacted', variant: 'destructive' })
    } finally {
      setLeadProcessing(false)
    }
  }

  const handleConvertToMember = async () => {
    if (!selectedLead) return
    setLeadProcessing(true)
    try {
      await convertLeadToMember(selectedLead.id)
      toast({ title: 'Success', description: `${selectedLead.name} has been converted to a member` })
      setConvertDialogOpen(false)
      setLeadDetailsOpen(false)
      fetchLeads()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to convert to member', variant: 'destructive' })
    } finally {
      setLeadProcessing(false)
    }
  }

  const handleDeleteLead = async () => {
    if (!selectedLead) return
    setLeadProcessing(true)
    try {
      await deleteLead(selectedLead.id)
      toast({ title: 'Success', description: 'Lead deleted' })
      setDeleteLeadDialogOpen(false)
      setLeadDetailsOpen(false)
      fetchLeads()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete lead', variant: 'destructive' })
    } finally {
      setLeadProcessing(false)
    }
  }

  const clearLeadFilters = () => {
    setLeadFilters({ search: '', status: 'all', interestLevel: 'all', source: 'all', dateRange: 'all' })
  }

  const getLeadStatusBadge = (status: Lead['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-purple-100 text-purple-700',
      nurturing: 'bg-yellow-100 text-yellow-700',
      converted: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={colors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  const getInterestLevelBadge = (level: Lead['interest_level']) => {
    const colors = { cold: 'bg-blue-100 text-blue-700', warm: 'bg-yellow-100 text-yellow-700', hot: 'bg-red-100 text-red-700' }
    return (
      <Badge className={colors[level]}>
        {level === 'hot' && <Flame className="h-3 w-3 mr-1" />}
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    )
  }

  // ============ INVITES FUNCTIONS ============
  const fetchInvites = async () => {
    setInvitesLoading(true)
    try {
      const response = await fetch(`/api/admin/invites?status=${inviteFilter}`)
      if (!response.ok) throw new Error('Failed to fetch invites')
      const data = await response.json()
      setInvites(data)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load invites', variant: 'destructive' })
    } finally {
      setInvitesLoading(false)
    }
  }

  const handleCreateInvite = async () => {
    setCreatingInvite(true)
    try {
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: inviteName || undefined,
          email: inviteEmail || undefined,
          sendEmail: sendInviteEmail && !!inviteEmail,
          expiresInDays: inviteExpiresInDays || undefined,
          notes: inviteNotes || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create invite')
      setCreatedInvite({ code: data.invite.code, url: data.inviteUrl })
      toast({ title: 'Invite Created!', description: data.emailSent ? `Email sent to ${inviteEmail}` : 'Copy the link to share' })
      fetchInvites()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setCreatingInvite(false)
    }
  }

  const handleBulkCreateInvites = async () => {
    setBulkCreatingInvites(true)
    try {
      const lines = bulkInviteList.split('\n').filter((l) => l.trim())
      const inviteList = lines.map((line) => {
        const parts = line.split(',').map((p) => p.trim())
        if (parts.length >= 2) return { name: parts[0], email: parts[1] }
        return { email: parts[0] }
      })
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_create',
          invites: inviteList,
          sendEmails: bulkSendEmails,
          expiresInDays: bulkExpiresInDays || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create invites')
      toast({ title: 'Invites Created!', description: `Created ${data.created} invites${data.failed > 0 ? `, ${data.failed} failed` : ''}` })
      setBulkInviteOpen(false)
      setBulkInviteList('')
      fetchInvites()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setBulkCreatingInvites(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied!', description: 'Link copied to clipboard' })
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', inviteId }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      toast({ title: 'Email Sent!', description: 'Reminder email sent successfully' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const handleDeactivateInvite = async (inviteId: string) => {
    try {
      await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deactivate', inviteId }),
      })
      fetchInvites()
      toast({ title: 'Deactivated', description: 'Invite link has been deactivated' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to deactivate invite', variant: 'destructive' })
    }
  }

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('Delete this invite? This cannot be undone.')) return
    try {
      await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', inviteId }),
      })
      fetchInvites()
      toast({ title: 'Deleted', description: 'Invite has been deleted' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete invite', variant: 'destructive' })
    }
  }

  const getInviteStatusBadge = (invite: Invite) => {
    if (invite.use_count > 0) return <Badge className="bg-green-100 text-green-800">Used</Badge>
    if (!invite.is_active) return <Badge variant="secondary">Deactivated</Badge>
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) return <Badge variant="destructive">Expired</Badge>
    return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
  }

  const resetInviteForm = () => {
    setInviteName('')
    setInviteEmail('')
    setInviteNotes('')
    setSendInviteEmail(true)
    setInviteExpiresInDays('')
    setCreatedInvite(null)
  }

  const inviteStats = {
    total: invites.length,
    active: invites.filter(i => i.is_active && i.use_count === 0 && (!i.expires_at || new Date(i.expires_at) > new Date())).length,
    used: invites.filter(i => i.use_count > 0).length,
  }

  // ============ RENDER ============
  if (membersLoading && activeTab === 'members') {
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
            <p className="text-gray-600">Manage members, leads, and invitations</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Members
              {memberStats.total > 0 && <Badge variant="secondary" className="ml-1">{memberStats.total}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Leads
              {leadStats?.newThisWeek ? <Badge className="ml-1 bg-gold text-navy">{leadStats.newThisWeek}</Badge> : null}
            </TabsTrigger>
            <TabsTrigger value="invites" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Invites
            </TabsTrigger>
          </TabsList>

          {/* ============ MEMBERS TAB ============ */}
          <TabsContent value="members" className="space-y-6">
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowManageTags(true)}>
                <Tag className="h-4 w-4 mr-2" />
                Manage Tags
              </Button>
              <Button variant="outline" onClick={async () => {
                const res = await fetch('/api/admin/members/export?format=csv')
                if (res.ok) {
                  const blob = await res.blob()
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `members-export-${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                  window.URL.revokeObjectURL(url)
                }
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => { setImportResults(null); setShowImportModal(true) }}>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button onClick={() => { resetMemberForm(); setShowAddMember(true) }} className="bg-navy hover:bg-navy/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-6">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-navy">{memberStats.total}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1"><User className="h-4 w-4 text-gray-400" />Free</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-600">{memberStats.free}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1"><User className="h-4 w-4 text-green-600" />Member</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{memberStats.member}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1"><Sparkles className="h-4 w-4 text-blue-600" />Partner</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{memberStats.partner}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1"><Shield className="h-4 w-4 text-purple-600" />Staff</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-purple-600">{memberStats.staff}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1"><Crown className="h-4 w-4 text-gold" />Admin</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gold">{memberStats.admin}</div></CardContent></Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="All Roles" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="All Tags" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {availableTags.map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedMembers.size > 0 && (
              <Card className="bg-navy text-white">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{selectedMembers.size} selected</span>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedMembers(new Set())} className="text-white hover:bg-white/20"><X className="h-4 w-4 mr-1" />Clear</Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={handleBulkSendInvites} disabled={bulkProcessing}><Send className="h-4 w-4 mr-2" />Send Invites</Button>
                      <Button variant="secondary" size="sm" onClick={() => setShowBulkTagModal(true)} disabled={bulkProcessing}><Tag className="h-4 w-4 mr-2" />Add Tags</Button>
                      <Button variant="secondary" size="sm" onClick={() => setShowBulkTierModal(true)} disabled={bulkProcessing}><Crown className="h-4 w-4 mr-2" />Change Tier</Button>
                      <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkProcessing}>{bulkProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}</Button>
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
                            <input type="checkbox" checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded" />
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Member</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tags</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Last Active</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.map((member) => (
                          <tr key={member.id} className={`border-b hover:bg-gray-50 ${selectedMembers.has(member.id) ? 'bg-blue-50' : ''}`}>
                            <td className="py-3 px-4">
                              <input type="checkbox" checked={selectedMembers.has(member.id)} onChange={() => toggleSelectMember(member.id)} className="w-4 h-4 rounded" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center"><User className="h-5 w-5 text-navy" /></div>
                                <div>
                                  <div className="font-medium text-navy">{member.first_name} {member.last_name}</div>
                                  <div className="text-sm text-gray-600 flex items-center gap-1"><Mail className="h-3 w-3" />{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${getRoleBadgeColor(getEffectiveRole(member))}`}>
                                {getRoleIcon(getEffectiveRole(member))}
                                <span>{getRoleLabel(getEffectiveRole(member))}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {member.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag.id} variant="outline" className="text-xs" style={{ borderColor: tag.color, color: tag.color }}>{tag.name}</Badge>
                                ))}
                                {member.tags.length > 2 && <Badge variant="outline" className="text-xs">+{member.tags.length - 2}</Badge>}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{getTimeAgo(member.last_login_at || member.last_active_at)}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{formatDate(member.joined_at || member.created_at)}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/members/${member.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditModal(member)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSendInvite(member)}><Send className="h-4 w-4 mr-2" />Send Invite</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteMember(member)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
          </TabsContent>

          {/* ============ LEADS TAB ============ */}
          <TabsContent value="leads" className="space-y-6">
            {/* Stats */}
            {leadStats && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-600" />New This Week</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-navy">{leadStats.newThisWeek}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2"><Users className="h-4 w-4 text-green-600" />New This Month</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-navy">{leadStats.newThisMonth}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2"><Flame className="h-4 w-4 text-red-600" />Hot Leads</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-navy">{leadStats.hotLeads}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2"><Target className="h-4 w-4 text-gold" />Conversion Rate</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-navy">{leadStats.conversionRate}%</p></CardContent></Card>
              </div>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search leads..." value={leadFilters.search} onChange={(e) => setLeadFilters({ ...leadFilters, search: e.target.value })} className="pl-10" />
                  </div>
                  <Select value={leadFilters.status} onValueChange={(v) => setLeadFilters({ ...leadFilters, status: v })}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="nurturing">Nurturing</SelectItem><SelectItem value="converted">Converted</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
                  <Select value={leadFilters.interestLevel} onValueChange={(v) => setLeadFilters({ ...leadFilters, interestLevel: v })}><SelectTrigger><SelectValue placeholder="Interest" /></SelectTrigger><SelectContent><SelectItem value="all">All Levels</SelectItem><SelectItem value="hot">Hot</SelectItem><SelectItem value="warm">Warm</SelectItem><SelectItem value="cold">Cold</SelectItem></SelectContent></Select>
                  <Select value={leadFilters.source} onValueChange={(v) => setLeadFilters({ ...leadFilters, source: v })}><SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger><SelectContent><SelectItem value="all">All Sources</SelectItem><SelectItem value="website">Website</SelectItem><SelectItem value="event">Event</SelectItem><SelectItem value="referral">Referral</SelectItem><SelectItem value="social_media">Social Media</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <Select value={leadFilters.dateRange} onValueChange={(v) => setLeadFilters({ ...leadFilters, dateRange: v })}><SelectTrigger className="w-48"><SelectValue placeholder="Date Range" /></SelectTrigger><SelectContent><SelectItem value="all">All Time</SelectItem><SelectItem value="7days">Last 7 Days</SelectItem><SelectItem value="30days">Last 30 Days</SelectItem><SelectItem value="90days">Last 90 Days</SelectItem></SelectContent></Select>
                  <Button variant="outline" size="sm" onClick={clearLeadFilters}><X className="h-4 w-4 mr-2" />Clear</Button>
                </div>
              </CardContent>
            </Card>

            {/* Leads Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-navy">{leads.length} Leads</CardTitle>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-navy" /></div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-12 text-gray-500"><UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No leads found</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contact</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Interest</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Source</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Created</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openLeadDetails(lead)}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center"><User className="h-4 w-4 text-gold" /></div>
                                <span className="font-medium text-navy">{lead.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div className="flex items-center gap-1 text-gray-700"><Mail className="h-3 w-3" />{lead.email}</div>
                                {lead.phone && <div className="flex items-center gap-1 text-gray-500 mt-1"><Phone className="h-3 w-3" />{lead.phone}</div>}
                              </div>
                            </td>
                            <td className="py-3 px-4">{getLeadStatusBadge(lead.status)}</td>
                            <td className="py-3 px-4">{getInterestLevelBadge(lead.interest_level)}</td>
                            <td className="py-3 px-4"><Badge variant="outline" className="text-xs">{lead.source}</Badge></td>
                            <td className="py-3 px-4 text-sm text-gray-600">{formatDate(lead.created_at)}</td>
                            <td className="py-3 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openLeadDetails(lead) }}>View Details</DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${lead.email}` }}>Send Email</DropdownMenuItem>
                                  {lead.status !== 'converted' && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setConvertDialogOpen(true) }}>Convert to Member</DropdownMenuItem>}
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setDeleteLeadDialogOpen(true) }} className="text-red-600">Delete Lead</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ INVITES TAB ============ */}
          <TabsContent value="invites" className="space-y-6">
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Dialog open={bulkInviteOpen} onOpenChange={setBulkInviteOpen}>
                <DialogTrigger asChild><Button variant="outline"><Users className="mr-2 h-4 w-4" />Bulk Invite</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Bulk Create Invites</DialogTitle>
                    <DialogDescription>Add multiple people at once. One per line: name, email</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Invite List</Label>
                      <Textarea placeholder="John Doe, john@example.com" value={bulkInviteList} onChange={(e) => setBulkInviteList(e.target.value)} rows={6} />
                    </div>
                    <div className="flex items-center justify-between"><Label>Send invitation emails</Label><Switch checked={bulkSendEmails} onCheckedChange={setBulkSendEmails} /></div>
                    <div><Label>Expires in (days)</Label><Input type="number" placeholder="Never" value={bulkExpiresInDays} onChange={(e) => setBulkExpiresInDays(e.target.value ? parseInt(e.target.value) : '')} /></div>
                    <Button onClick={handleBulkCreateInvites} disabled={bulkCreatingInvites} className="w-full">{bulkCreatingInvites ? 'Creating...' : 'Create Invites'}</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={createInviteOpen} onOpenChange={(open) => { setCreateInviteOpen(open); if (!open) resetInviteForm() }}>
                <DialogTrigger asChild><Button className="bg-navy hover:bg-navy/90"><Plus className="mr-2 h-4 w-4" />Create Invite</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{createdInvite ? 'Invite Created!' : 'Create New Invite'}</DialogTitle>
                    <DialogDescription>{createdInvite ? 'Share this link' : 'Generate a unique invite link'}</DialogDescription>
                  </DialogHeader>
                  {createdInvite ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="font-mono text-lg font-bold text-green-800">{createdInvite.code}</p>
                      </div>
                      <div className="flex gap-2"><Input value={createdInvite.url} readOnly className="font-mono text-sm" /><Button onClick={() => copyToClipboard(createdInvite.url)}><Copy className="h-4 w-4" /></Button></div>
                      <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={resetInviteForm}>Create Another</Button><Button className="flex-1" onClick={() => setCreateInviteOpen(false)}>Done</Button></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div><Label>Name (optional)</Label><Input placeholder="John Doe" value={inviteName} onChange={(e) => setInviteName(e.target.value)} /></div>
                      <div><Label>Email (optional)</Label><Input type="email" placeholder="john@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} /></div>
                      {inviteEmail && <div className="flex items-center justify-between"><Label>Send invitation email</Label><Switch checked={sendInviteEmail} onCheckedChange={setSendInviteEmail} /></div>}
                      <div><Label>Expires in (days)</Label><Input type="number" placeholder="Never" value={inviteExpiresInDays} onChange={(e) => setInviteExpiresInDays(e.target.value ? parseInt(e.target.value) : '')} /></div>
                      <div><Label>Notes (optional)</Label><Textarea placeholder="Internal notes..." value={inviteNotes} onChange={(e) => setInviteNotes(e.target.value)} rows={2} /></div>
                      <Button onClick={handleCreateInvite} disabled={creatingInvite} className="w-full">{creatingInvite ? 'Creating...' : 'Generate Invite Link'}</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardHeader className="pb-2"><CardDescription>Total Invites</CardDescription><CardTitle className="text-3xl">{inviteStats.total}</CardTitle></CardHeader></Card>
              <Card><CardHeader className="pb-2"><CardDescription>Active (Unused)</CardDescription><CardTitle className="text-3xl text-blue-600">{inviteStats.active}</CardTitle></CardHeader></Card>
              <Card><CardHeader className="pb-2"><CardDescription>Used</CardDescription><CardTitle className="text-3xl text-green-600">{inviteStats.used}</CardTitle></CardHeader></Card>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <Button variant={inviteFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setInviteFilter('all')}>All</Button>
              <Button variant={inviteFilter === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setInviteFilter('active')}>Active</Button>
              <Button variant={inviteFilter === 'used' ? 'default' : 'outline'} size="sm" onClick={() => setInviteFilter('used')}>Used</Button>
              <Button variant="ghost" size="sm" onClick={fetchInvites}><RefreshCw className="h-4 w-4" /></Button>
            </div>

            {/* Invites Table */}
            <Card>
              <CardContent className="p-0">
                {invitesLoading ? (
                  <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-navy" /></div>
                ) : invites.length === 0 ? (
                  <div className="p-8 text-center text-gray-500"><LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No invites yet</p></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invite</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invites.map((invite) => (
                        <TableRow key={invite.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{invite.name || invite.email || 'General Invite'}</p>
                              {invite.email && invite.name && <p className="text-sm text-gray-500">{invite.email}</p>}
                              {invite.used_by_member && <p className="text-sm text-green-600">Used by: {invite.used_by_member.first_name} {invite.used_by_member.last_name}</p>}
                            </div>
                          </TableCell>
                          <TableCell><code className="bg-gray-100 px-2 py-1 rounded text-sm">{invite.code}</code></TableCell>
                          <TableCell>{getInviteStatusBadge(invite)}</TableCell>
                          <TableCell className="text-gray-500">{new Date(invite.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => copyToClipboard(`${window.location.origin}/join/${invite.code}`)}><Copy className="mr-2 h-4 w-4" />Copy Link</DropdownMenuItem>
                                {invite.email && invite.use_count === 0 && <DropdownMenuItem onClick={() => handleResendInvite(invite.id)}><Mail className="mr-2 h-4 w-4" />Resend Email</DropdownMenuItem>}
                                {invite.is_active && invite.use_count === 0 && <DropdownMenuItem onClick={() => handleDeactivateInvite(invite.id)}><XCircle className="mr-2 h-4 w-4" />Deactivate</DropdownMenuItem>}
                                <DropdownMenuItem onClick={() => handleDeleteInvite(invite.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ============ MODALS ============ */}

        {/* Add Member Modal */}
        <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>Create a new member account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name *</Label><Input value={formData.first_name} onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))} /></div>
                <div><Label>Last Name *</Label><Input value={formData.last_name} onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))} /></div>
              </div>
              <div><Label>Email *</Label><Input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} /></div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v: any) => { const isAdmin = v === 'admin'; const tier = ['partner', 'staff', 'admin'].includes(v) ? 'partner' : 'free'; setFormData(prev => ({ ...prev, role: v, is_admin: isAdmin, tier })) }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free - Limited access</SelectItem>
                    <SelectItem value="member">Member - Standard access</SelectItem>
                    <SelectItem value="partner">Partner - Premium access</SelectItem>
                    <SelectItem value="staff">Staff - Admin portal</SelectItem>
                    <SelectItem value="admin">Admin - Full control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {availableTags.length > 0 && (
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags.map(tag => (
                      <Badge key={tag.id} variant={formData.tags.includes(tag.id) ? "default" : "outline"} className="cursor-pointer" style={formData.tags.includes(tag.id) ? { backgroundColor: tag.color } : { borderColor: tag.color, color: tag.color }} onClick={() => toggleTag(tag.id)}>
                        {tag.name}
                        {formData.tags.includes(tag.id) && <Check className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Internal notes..." /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
              <Button onClick={handleAddMember} disabled={saving} className="bg-navy hover:bg-navy/90">{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}Add Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Member Modal */}
        <Dialog open={showEditMember} onOpenChange={setShowEditMember}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>Update member details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name *</Label><Input value={formData.first_name} onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))} /></div>
                <div><Label>Last Name *</Label><Input value={formData.last_name} onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))} /></div>
              </div>
              <div><Label>Email *</Label><Input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} /></div>
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v: any) => { const isAdmin = v === 'admin'; const tier = ['partner', 'staff', 'admin'].includes(v) ? 'partner' : 'free'; setFormData(prev => ({ ...prev, role: v, is_admin: isAdmin, tier })) }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {availableTags.length > 0 && (
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags.map(tag => (
                      <Badge key={tag.id} variant={formData.tags.includes(tag.id) ? "default" : "outline"} className="cursor-pointer" style={formData.tags.includes(tag.id) ? { backgroundColor: tag.color } : { borderColor: tag.color, color: tag.color }} onClick={() => toggleTag(tag.id)}>
                        {tag.name}
                        {formData.tags.includes(tag.id) && <Check className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Internal notes..." /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditMember(false)}>Cancel</Button>
              <Button onClick={handleUpdateMember} disabled={saving} className="bg-navy hover:bg-navy/90">{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Tags Modal */}
        <Dialog open={showManageTags} onOpenChange={setShowManageTags}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Tags</DialogTitle>
              <DialogDescription>Create and manage member tags.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input placeholder="New tag name..." value={newTagName} onChange={e => setNewTagName(e.target.value)} className="flex-1" />
                <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                <Button onClick={handleCreateTag} size="icon"><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableTags.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} /><span>{tag.name}</span></div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTag(tag.id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                {availableTags.length === 0 && <p className="text-center text-gray-500 py-4">No tags yet.</p>}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import CSV Modal */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" />Import Members from CSV</DialogTitle>
              <DialogDescription>Upload a CSV file to bulk import members.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div><p className="text-sm font-medium text-blue-900">Download Template</p><Button variant="link" size="sm" onClick={downloadTemplate} className="text-blue-600 p-0 h-auto">Download member_import_template.csv</Button></div>
                </div>
              </div>
              {!importResults && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input type="file" accept=".csv" onChange={handleImport} className="hidden" id="csv-upload" disabled={importing} />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    {importing ? (<><Loader2 className="h-10 w-10 mx-auto text-navy animate-spin" /><p className="mt-2 text-sm font-medium">Importing...</p></>) : (<><Upload className="h-10 w-10 mx-auto text-gray-400" /><p className="mt-2 text-sm font-medium">Click to upload CSV</p></>)}
                  </label>
                </div>
              )}
              {importResults && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800"><CheckCircle2 className="h-5 w-5" /><span className="font-medium">Import Complete</span></div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center"><div className="text-2xl font-bold text-green-600">{importResults.imported}</div><div className="text-green-700">Imported</div></div>
                      <div className="text-center"><div className="text-2xl font-bold text-yellow-600">{importResults.skipped}</div><div className="text-yellow-700">Skipped</div></div>
                      <div className="text-center"><div className="text-2xl font-bold text-gray-600">{importResults.total}</div><div className="text-gray-700">Total</div></div>
                    </div>
                  </div>
                  {importResults.errors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-800 mb-2"><AlertCircle className="h-5 w-5" /><span className="font-medium">Errors</span></div>
                      <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">{importResults.errors.map((error, i) => <li key={i}>• {error}</li>)}</ul>
                    </div>
                  )}
                  <Button onClick={() => setImportResults(null)} variant="outline" className="w-full">Import Another</Button>
                </div>
              )}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowImportModal(false)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Add Tags Modal */}
        <Dialog open={showBulkTagModal} onOpenChange={setShowBulkTagModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Tag className="h-5 w-5" />Add Tags to {selectedMembers.size} Members</DialogTitle>
              <DialogDescription>Select tags to add.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge key={tag.id} variant={formData.tags.includes(tag.id) ? "default" : "outline"} className="cursor-pointer" style={formData.tags.includes(tag.id) ? { backgroundColor: tag.color } : { borderColor: tag.color, color: tag.color }} onClick={() => toggleTag(tag.id)}>
                      {tag.name}
                      {formData.tags.includes(tag.id) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              ) : (<p className="text-center text-gray-500 py-4">No tags available.</p>)}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowBulkTagModal(false); setFormData(prev => ({ ...prev, tags: [] })) }}>Cancel</Button>
              <Button onClick={() => handleBulkAddTags(formData.tags)} disabled={bulkProcessing || formData.tags.length === 0} className="bg-navy hover:bg-navy/90">{bulkProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Tag className="h-4 w-4 mr-2" />}Add Tags</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Change Tier Modal */}
        <Dialog open={showBulkTierModal} onOpenChange={setShowBulkTierModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5" />Change Tier for {selectedMembers.size} Members</DialogTitle>
              <DialogDescription>Select a new tier.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              {['free', 'member', 'partner', 'staff', 'admin'].map((role) => (
                <div key={role} onClick={() => handleBulkChangeRole(role)} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-3">
                  {getRoleIcon(role)}
                  <span className="font-medium capitalize">{role}</span>
                </div>
              ))}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowBulkTierModal(false)}>Cancel</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lead Details Dialog */}
        <Dialog open={leadDetailsOpen} onOpenChange={setLeadDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedLead && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl text-navy flex items-center gap-2"><User className="h-6 w-6 text-gold" />{selectedLead.name}</DialogTitle>
                  <DialogDescription>Lead created {getTimeAgo(selectedLead.created_at)}</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  <div>
                    <h3 className="font-semibold text-navy mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-gray-500" /><a href={`mailto:${selectedLead.email}`} className="text-blue-600 hover:underline">{selectedLead.email}</a></div>
                      {selectedLead.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-gray-500" /><a href={`tel:${selectedLead.phone}`} className="text-blue-600 hover:underline">{selectedLead.phone}</a></div>}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="mb-2 block">Status</Label>
                      <Select value={selectedLead.status} onValueChange={(v) => handleUpdateLeadStatus(v as Lead['status'])} disabled={leadProcessing}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="nurturing">Nurturing</SelectItem><SelectItem value="converted">Converted</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-2 block">Interest Level</Label>
                      <Select value={selectedLead.interest_level} onValueChange={(v) => handleUpdateLeadInterest(v as Lead['interest_level'])} disabled={leadProcessing}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="cold">Cold</SelectItem><SelectItem value="warm">Warm</SelectItem><SelectItem value="hot">Hot</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedLead.interests && selectedLead.interests.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-navy mb-3 flex items-center gap-2"><Tag className="h-4 w-4" />Interests</h3>
                      <div className="flex flex-wrap gap-2">{selectedLead.interests.map((interest) => <Badge key={interest} variant="outline">{interestLabels[interest] || interest}</Badge>)}</div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-navy flex items-center gap-2"><MessageSquare className="h-4 w-4" />Notes</h3>
                      {!editingNotes && <Button variant="outline" size="sm" onClick={() => setEditingNotes(true)}>Edit</Button>}
                    </div>
                    {editingNotes ? (
                      <div className="space-y-2">
                        <Textarea value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} placeholder="Add notes..." rows={4} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveLeadNotes} disabled={leadProcessing} className="bg-gold hover:bg-gold/90 text-navy">{leadProcessing ? 'Saving...' : 'Save'}</Button>
                          <Button variant="outline" size="sm" onClick={() => { setEditingNotes(false); setLeadNotes(selectedLead.notes || '') }} disabled={leadProcessing}>Cancel</Button>
                        </div>
                      </div>
                    ) : (<p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedLead.notes || 'No notes added yet'}</p>)}
                  </div>
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button onClick={handleMarkContacted} disabled={leadProcessing} className="bg-gold hover:bg-gold/90 text-navy">Mark as Contacted</Button>
                    <Button variant="outline" onClick={() => window.location.href = `mailto:${selectedLead.email}`}><Mail className="h-4 w-4 mr-2" />Send Email</Button>
                    {selectedLead.status !== 'converted' && <Button variant="outline" onClick={() => setConvertDialogOpen(true)} className="text-green-600"><UserCheck className="h-4 w-4 mr-2" />Convert to Member</Button>}
                    <Button variant="outline" onClick={() => setDeleteLeadDialogOpen(true)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Delete Lead</Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Lead Confirmation */}
        <Dialog open={deleteLeadDialogOpen} onOpenChange={setDeleteLeadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy flex items-center gap-2"><AlertCircle className="h-6 w-6 text-red-600" />Delete Lead?</DialogTitle>
              <DialogDescription>Are you sure you want to delete {selectedLead?.name}? This cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteLeadDialogOpen(false)} disabled={leadProcessing}>Cancel</Button>
              <Button onClick={handleDeleteLead} disabled={leadProcessing} className="bg-red-600 hover:bg-red-700">{leadProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete Lead</>}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Convert to Member Confirmation */}
        <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy flex items-center gap-2"><UserCheck className="h-6 w-6 text-green-600" />Convert to Member?</DialogTitle>
              <DialogDescription>This will create a member account for {selectedLead?.name} and send them a welcome email.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)} disabled={leadProcessing}>Cancel</Button>
              <Button onClick={handleConvertToMember} disabled={leadProcessing} className="bg-green-600 hover:bg-green-700">{leadProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Converting...</> : <><UserCheck className="h-4 w-4 mr-2" />Convert to Member</>}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

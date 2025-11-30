'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload,
  Sparkles,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Plus,
  CheckCircle,
  UserPlus,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Prophecy {
  id: string
  title: string
  content: string
  prophecy_type: 'public' | 'personal'
  prophecy_date: string
  status: 'active' | 'archived'
  themes?: string
  audio_url?: string
  video_url?: string
  user_id?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  tier: string
}

export default function AdminProphecyPage() {
  const [prophecies, setProphecies] = useState<Prophecy[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'public' | 'personal'>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [editingProphecy, setEditingProphecy] = useState<Prophecy | null>(null)
  const [assigningProphecy, setAssigningProphecy] = useState<Prophecy | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    prophecy_type: 'public' as 'public' | 'personal',
    themes: '',
    audio_url: '',
    video_url: '',
    is_featured: false,
  })

  useEffect(() => {
    fetchProphecies()
    fetchMembers()
  }, [])

  const fetchProphecies = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('prophecies')
        .select('*')
        .order('prophecy_date', { ascending: false })

      if (error) {
        console.error('Error fetching prophecies:', error)
        toast({
          title: 'Error',
          description: 'Failed to load prophecies',
          variant: 'destructive',
        })
      } else {
        setProphecies(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, tier')
        .order('first_name', { ascending: true })

      if (!error && data) {
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      prophecy_type: 'public',
      themes: '',
      audio_url: '',
      video_url: '',
      is_featured: false,
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('prophecies')
        .insert({
          title: formData.title,
          content: formData.content,
          prophecy_type: formData.prophecy_type,
          themes: formData.themes || null,
          audio_url: formData.audio_url || null,
          video_url: formData.video_url || null,
          is_featured: formData.is_featured,
          prophecy_date: new Date().toISOString(),
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating prophecy:', error)
        toast({
          title: 'Error',
          description: 'Failed to create prophecy',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Prophecy created successfully',
        })
        setIsAddDialogOpen(false)
        resetForm()
        fetchProphecies()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProphecy) return

    setSubmitting(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('prophecies')
        .update({
          title: formData.title,
          content: formData.content,
          prophecy_type: formData.prophecy_type,
          themes: formData.themes || null,
          audio_url: formData.audio_url || null,
          video_url: formData.video_url || null,
          is_featured: formData.is_featured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingProphecy.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating prophecy:', error)
        toast({
          title: 'Error',
          description: 'Failed to update prophecy',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Prophecy updated successfully',
        })
        setIsEditDialogOpen(false)
        setEditingProphecy(null)
        resetForm()
        fetchProphecies()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('prophecies')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting prophecy:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete prophecy',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Prophecy deleted successfully',
        })
        fetchProphecies()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  const toggleArchive = async (prophecy: Prophecy) => {
    const supabase = createClient()
    const newStatus = prophecy.status === 'active' ? 'archived' : 'active'

    try {
      const { error } = await supabase
        .from('prophecies')
        .update({ status: newStatus })
        .eq('id', prophecy.id)

      if (error) {
        console.error('Error toggling archive:', error)
        toast({
          title: 'Error',
          description: 'Failed to update status',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: `Prophecy ${newStatus === 'archived' ? 'archived' : 'restored'}`,
        })
        fetchProphecies()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAssignToMember = async () => {
    if (!assigningProphecy || !selectedMemberId) {
      toast({
        title: 'Error',
        description: 'Please select a member',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    try {
      // Update the prophecy to assign it to the member
      const { error } = await supabase
        .from('prophecies')
        .update({
          prophecy_type: 'personal',
          user_id: selectedMemberId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assigningProphecy.id)

      if (error) {
        console.error('Error assigning prophecy:', error)
        toast({
          title: 'Error',
          description: 'Failed to assign prophecy',
          variant: 'destructive',
        })
      } else {
        const member = members.find(m => m.id === selectedMemberId)
        toast({
          title: 'Success',
          description: `Prophecy assigned to ${member?.first_name} ${member?.last_name}`,
        })
        setIsAssignDialogOpen(false)
        setAssigningProphecy(null)
        setSelectedMemberId('')
        setMemberSearchQuery('')
        fetchProphecies()
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openAssignDialog = (prophecy: Prophecy) => {
    setAssigningProphecy(prophecy)
    setSelectedMemberId('')
    setMemberSearchQuery('')
    setIsAssignDialogOpen(true)
  }

  const openEditDialog = (prophecy: Prophecy) => {
    setEditingProphecy(prophecy)
    setFormData({
      title: prophecy.title,
      content: prophecy.content,
      prophecy_type: prophecy.prophecy_type,
      themes: prophecy.themes || '',
      audio_url: prophecy.audio_url || '',
      video_url: prophecy.video_url || '',
      is_featured: prophecy.is_featured,
    })
    setIsEditDialogOpen(true)
  }

  const filteredProphecies = prophecies.filter((prophecy) => {
    const matchesSearch =
      prophecy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prophecy.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || prophecy.prophecy_type === filterType
    return matchesSearch && matchesType
  })

  const stats = {
    total: prophecies.length,
    public: prophecies.filter((p) => p.prophecy_type === 'public').length,
    personal: prophecies.filter((p) => p.prophecy_type === 'personal').length,
    active: prophecies.filter((p) => p.status === 'active').length,
    archived: prophecies.filter((p) => p.status === 'archived').length,
    featured: prophecies.filter((p) => p.is_featured).length,
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8 text-gold" />
              <h1 className="text-4xl font-bold text-navy">Prophecy Management</h1>
            </div>
            <p className="text-gray-600">
              Manage public prophetic words and personal prophecies
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy/90">
                <Plus className="mr-2 h-4 w-4" />
                Add New Prophecy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-navy">Add New Prophecy</DialogTitle>
                <DialogDescription>
                  Create a new prophetic word
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate}>
                <div className="space-y-4 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.prophecy_type}
                        onValueChange={(value: any) => setFormData({ ...formData, prophecy_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public Word</SelectItem>
                          <SelectItem value="personal">Personal Prophecy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <textarea
                      id="content"
                      className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="themes">Themes (comma-separated)</Label>
                    <Input
                      id="themes"
                      placeholder="e.g. Breakthrough, Healing, Purpose"
                      value={formData.themes}
                      onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audio_url">Audio URL</Label>
                    <Input
                      id="audio_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.audio_url}
                      onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video_url">Video URL</Label>
                    <Input
                      id="video_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded text-navy focus:ring-navy"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      Feature this prophecy
                    </Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      resetForm()
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-navy hover:bg-navy/90" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Prophecy'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">Edit Prophecy</DialogTitle>
              <DialogDescription>
                Update prophecy details
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEdit}>
              <div className="space-y-4 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Type *</Label>
                    <Select
                      value={formData.prophecy_type}
                      onValueChange={(value: any) => setFormData({ ...formData, prophecy_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public Word</SelectItem>
                        <SelectItem value="personal">Personal Prophecy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-content">Content *</Label>
                  <textarea
                    id="edit-content"
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-themes">Themes</Label>
                  <Input
                    id="edit-themes"
                    value={formData.themes}
                    onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-audio_url">Audio URL</Label>
                  <Input
                    id="edit-audio_url"
                    type="url"
                    value={formData.audio_url}
                    onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-video_url">Video URL</Label>
                  <Input
                    id="edit-video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded text-navy focus:ring-navy"
                  />
                  <Label htmlFor="edit-featured" className="cursor-pointer">
                    Feature this prophecy
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingProphecy(null)
                    resetForm()
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-navy hover:bg-navy/90" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Prophecy'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Assign to Member Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">Assign Prophecy to Member</DialogTitle>
              <DialogDescription>
                Assign "{assigningProphecy?.title}" to a specific member
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Search Members */}
              <div className="space-y-2">
                <Label htmlFor="member-search">Search Member</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="member-search"
                    type="search"
                    placeholder="Search by name or email..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Member List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {members
                  .filter(
                    (m) =>
                      m.first_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                      m.last_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                      m.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
                  )
                  .map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMemberId === member.id
                          ? 'border-navy bg-navy/5'
                          : 'border-gray-200 hover:border-navy/30'
                      }`}
                      onClick={() => setSelectedMemberId(member.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-navy">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-gray-600">{member.email}</div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {member.tier}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>

              {selectedMemberId && (
                <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="h-4 w-4 text-gold" />
                    <span>
                      Selected:{' '}
                      {members.find((m) => m.id === selectedMemberId)?.first_name}{' '}
                      {members.find((m) => m.id === selectedMemberId)?.last_name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAssignDialogOpen(false)
                  setAssigningProphecy(null)
                  setSelectedMemberId('')
                  setMemberSearchQuery('')
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignToMember}
                className="bg-navy hover:bg-navy/90"
                disabled={submitting || !selectedMemberId}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign to Member
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Prophecies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Public Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">{stats.public}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.personal}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.featured}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search prophecies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="public">Public Words</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prophecies Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-navy">All Prophecies</CardTitle>
            <CardDescription>{filteredProphecies.length} items</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProphecies.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No prophecies found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProphecies.map((prophecy) => (
                      <tr key={prophecy.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-navy">{prophecy.title}</div>
                          {prophecy.is_featured && (
                            <div className="flex items-center gap-1 mt-1">
                              <Sparkles className="h-3 w-3 text-gold" />
                              <span className="text-xs text-gold">Featured</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              prophecy.prophecy_type === 'public'
                                ? 'bg-gold/20 text-gold'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {prophecy.prophecy_type === 'public' ? 'Public' : 'Personal'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(prophecy.prophecy_date)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              prophecy.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {prophecy.status === 'active' ? 'Active' : 'Archived'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAssignDialog(prophecy)}
                              title="Assign to Member"
                            >
                              <UserPlus className="h-4 w-4 text-gold" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleArchive(prophecy)}
                            >
                              {prophecy.status === 'active' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(prophecy)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(prophecy.id, prophecy.title)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Play,
  BookOpen,
  FileText,
  Headphones,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Lock,
  Globe,
  Users,
  Eye,
  Star,
  MoreVertical,
  Grid3X3,
  List,
  CheckCircle,
  XCircle,
  Sparkles,
  Clock,
  TrendingUp,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import ImageUpload from '@/components/ui/image-upload'
import Image from 'next/image'

interface Teaching {
  id: string
  title: string
  description?: string
  author: string
  content_type?: string
  content_url?: string
  thumbnail_url?: string
  duration_minutes?: number
  is_premium?: boolean
  is_published?: boolean
  is_featured?: boolean
  view_count: number
  series_name?: string
  published_at?: string
  created_at: string
  updated_at: string
}

export default function ContentManagementPage() {
  const [teachings, setTeachings] = useState<Teaching[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTeaching, setEditingTeaching] = useState<Teaching | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    content_type: 'video' as string,
    content_url: '',
    thumbnail_url: '',
    duration_minutes: '',
    series_name: '',
    is_premium: false,
    is_published: true,
    is_featured: false,
  })

  // Get unique series names
  const seriesNames = [...new Set(teachings.filter(t => t.series_name).map(t => t.series_name!))]

  useEffect(() => {
    fetchTeachings()
  }, [])

  const fetchTeachings = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('teachings')
        .select('*')
        .order('published_at', { ascending: false })

      if (error) {
        console.error('Error fetching teachings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load teachings',
          variant: 'destructive',
        })
      } else {
        setTeachings(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      content_type: 'video',
      content_url: '',
      thumbnail_url: '',
      duration_minutes: '',
      series_name: '',
      is_premium: false,
      is_published: true,
      is_featured: false,
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('teachings')
        .insert({
          title: formData.title,
          author: formData.author,
          description: formData.description || null,
          content_type: formData.content_type,
          content_url: formData.content_url || null,
          thumbnail_url: formData.thumbnail_url || null,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
          series_name: formData.series_name || null,
          is_premium: formData.is_premium,
          is_published: formData.is_published,
          is_featured: formData.is_featured,
          view_count: 0,
          published_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        toast({ title: 'Error', description: 'Failed to create teaching', variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Teaching created successfully' })
        setIsAddDialogOpen(false)
        resetForm()
        fetchTeachings()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeaching) return

    setSubmitting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('teachings')
        .update({
          title: formData.title,
          author: formData.author,
          description: formData.description || null,
          content_type: formData.content_type,
          content_url: formData.content_url || null,
          thumbnail_url: formData.thumbnail_url || null,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
          series_name: formData.series_name || null,
          is_premium: formData.is_premium,
          is_published: formData.is_published,
          is_featured: formData.is_featured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTeaching.id)

      if (error) {
        toast({ title: 'Error', description: 'Failed to update teaching', variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Teaching updated successfully' })
        setIsEditDialogOpen(false)
        setEditingTeaching(null)
        resetForm()
        fetchTeachings()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from('teachings').delete().eq('id', id)
      if (error) {
        toast({ title: 'Error', description: 'Failed to delete teaching', variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'Teaching deleted successfully' })
        fetchTeachings()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    }
  }

  const handleQuickToggle = async (id: string, field: 'is_published' | 'is_featured', currentValue: boolean) => {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('teachings')
        .update({ [field]: !currentValue, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
      } else {
        setTeachings(teachings.map(t => t.id === id ? { ...t, [field]: !currentValue } : t))
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    }
  }

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'delete') => {
    if (selectedItems.size === 0) return

    if (action === 'delete' && !confirm(`Delete ${selectedItems.size} items? This cannot be undone.`)) return

    setBulkProcessing(true)
    const supabase = createClient()

    try {
      const ids = Array.from(selectedItems)

      if (action === 'delete') {
        const { error } = await supabase.from('teachings').delete().in('id', ids)
        if (error) throw error
        toast({ title: 'Success', description: `${ids.length} items deleted` })
      } else {
        const updateData: Record<string, boolean> = {}
        if (action === 'publish') updateData.is_published = true
        if (action === 'unpublish') updateData.is_published = false
        if (action === 'feature') updateData.is_featured = true
        if (action === 'unfeature') updateData.is_featured = false

        const { error } = await supabase.from('teachings').update(updateData).in('id', ids)
        if (error) throw error
        toast({ title: 'Success', description: `${ids.length} items updated` })
      }

      setSelectedItems(new Set())
      fetchTeachings()
    } catch (error) {
      toast({ title: 'Error', description: 'Bulk action failed', variant: 'destructive' })
    } finally {
      setBulkProcessing(false)
    }
  }

  const openEditDialog = (teaching: Teaching) => {
    setEditingTeaching(teaching)
    setFormData({
      title: teaching.title,
      author: teaching.author || '',
      description: teaching.description || '',
      content_type: teaching.content_type || 'video',
      content_url: teaching.content_url || '',
      thumbnail_url: teaching.thumbnail_url || '',
      duration_minutes: teaching.duration_minutes?.toString() || '',
      series_name: teaching.series_name || '',
      is_premium: teaching.is_premium || false,
      is_published: teaching.is_published !== false,
      is_featured: teaching.is_featured || false,
    })
    setIsEditDialogOpen(true)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredTeachings.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredTeachings.map(t => t.id)))
    }
  }

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const getTypeIcon = (type?: string) => {
    if (type === 'video') return <Play className="h-4 w-4" />
    if (type === 'audio') return <Headphones className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getTypeBadgeColor = (type?: string) => {
    if (type === 'video') return 'bg-red-100 text-red-700'
    if (type === 'audio') return 'bg-green-100 text-green-700'
    return 'bg-blue-100 text-blue-700'
  }

  const filteredTeachings = teachings.filter((teaching) => {
    const matchesSearch =
      teaching.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teaching.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teaching.series_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || teaching.content_type === selectedCategory
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'published' && teaching.is_published) ||
      (selectedStatus === 'draft' && !teaching.is_published) ||
      (selectedStatus === 'featured' && teaching.is_featured)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: teachings.length,
    published: teachings.filter(t => t.is_published).length,
    featured: teachings.filter(t => t.is_featured).length,
    totalViews: teachings.reduce((sum, t) => sum + (t.view_count || 0), 0),
  }

  // Form dialog content (shared between add and edit)
  const FormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
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
          <Label htmlFor="author">Author/Speaker *</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="content_type">Content Type *</Label>
          <Select
            value={formData.content_type}
            onValueChange={(value) => setFormData({ ...formData, content_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="article">Article</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="0"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="series">Series/Collection</Label>
          <Input
            id="series"
            placeholder="e.g., Faith Foundations"
            value={formData.series_name}
            onChange={(e) => setFormData({ ...formData, series_name: e.target.value })}
            list="series-suggestions"
          />
          <datalist id="series-suggestions">
            {seriesNames.map(name => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content_url">Content URL</Label>
        <Input
          id="content_url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={formData.content_url}
          onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Thumbnail Image</Label>
        <ImageUpload
          folder="teachings"
          currentImageUrl={formData.thumbnail_url}
          onUploadComplete={(url) => setFormData({ ...formData, thumbnail_url: url })}
          onUploadError={(error) => toast({ title: 'Upload Error', description: error, variant: 'destructive' })}
        />
      </div>

      <div className="flex flex-wrap gap-6 pt-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_published}
            onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
          />
          <Label className="text-sm">Published</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_featured}
            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
          />
          <Label className="text-sm">Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_premium}
            onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
          />
          <Label className="text-sm">Premium Only</Label>
        </div>
      </div>
    </div>
  )

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
            <h1 className="text-3xl font-bold text-navy mb-1">Content Management</h1>
            <p className="text-gray-600">Manage teachings, sermons, and audio content</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Teaching
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-navy">Add New Teaching</DialogTitle>
                <DialogDescription>Create a new teaching or sermon</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <FormContent />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm() }} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-navy hover:bg-navy/90" disabled={submitting}>
                    {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Teaching'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Content</p>
                  <p className="text-3xl font-bold text-navy">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-navy/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-navy" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-3xl font-bold text-green-600">{stats.published}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Featured</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.featured}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions Bar */}
        {selectedItems.size > 0 && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleBulkAction('publish')} disabled={bulkProcessing}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Publish
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleBulkAction('unpublish')} disabled={bulkProcessing}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Unpublish
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleBulkAction('feature')} disabled={bulkProcessing}>
                    <Star className="h-4 w-4 mr-1" />
                    Feature
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')} disabled={bulkProcessing}>
                    {bulkProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4 mr-1" />Delete</>}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search by title, author, or series..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="article">Articles</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-navy">All Content</CardTitle>
              <CardDescription>{filteredTeachings.length} items</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTeachings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No content found</p>
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 w-10">
                        <input
                          type="checkbox"
                          checked={selectedItems.size === filteredTeachings.length && filteredTeachings.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Content</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Views</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachings.map((teaching) => (
                      <tr key={teaching.id} className={`border-b hover:bg-gray-50 ${selectedItems.has(teaching.id) ? 'bg-blue-50' : ''}`}>
                        <td className="py-3 px-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(teaching.id)}
                            onChange={() => toggleSelectItem(teaching.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {teaching.thumbnail_url ? (
                              <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image src={teaching.thumbnail_url} alt="" width={64} height={40} className="object-cover w-full h-full" />
                              </div>
                            ) : (
                              <div className="w-16 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-navy">{teaching.title}</div>
                              <div className="text-xs text-gray-500">
                                {teaching.author}
                                {teaching.series_name && <span className="ml-2 text-purple-600">• {teaching.series_name}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${getTypeBadgeColor(teaching.content_type)}`}>
                            {getTypeIcon(teaching.content_type)}
                            {teaching.content_type || 'Article'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            <button onClick={() => handleQuickToggle(teaching.id, 'is_published', teaching.is_published || false)}>
                              {teaching.is_published ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer">Published</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">Draft</Badge>
                              )}
                            </button>
                            <button onClick={() => handleQuickToggle(teaching.id, 'is_featured', teaching.is_featured || false)}>
                              {teaching.is_featured && (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </button>
                            {teaching.is_premium && (
                              <Badge className="bg-purple-100 text-purple-700">
                                <Lock className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {(teaching.view_count || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(teaching)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {teaching.content_url && (
                                  <DropdownMenuItem onClick={() => window.open(teaching.content_url, '_blank')}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Content
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleQuickToggle(teaching.id, 'is_featured', teaching.is_featured || false)}>
                                  <Star className="h-4 w-4 mr-2" />
                                  {teaching.is_featured ? 'Remove Featured' : 'Mark Featured'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(teaching.id, teaching.title)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
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
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeachings.map((teaching) => (
                  <Card key={teaching.id} className={`overflow-hidden ${selectedItems.has(teaching.id) ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="relative aspect-video bg-gray-100">
                      {teaching.thumbnail_url ? (
                        <Image src={teaching.thumbnail_url} alt="" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {getTypeIcon(teaching.content_type)}
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(teaching.id)}
                          onChange={() => toggleSelectItem(teaching.id)}
                          className="rounded h-5 w-5"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeColor(teaching.content_type)}`}>
                          {teaching.content_type || 'Article'}
                        </span>
                      </div>
                      {teaching.duration_minutes && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                          {teaching.duration_minutes}m
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-navy line-clamp-1">{teaching.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{teaching.author}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {teaching.is_featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                          {!teaching.is_published && <Badge variant="outline" className="text-xs">Draft</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Eye className="h-3 w-3" />
                          {teaching.view_count || 0}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(teaching)}>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(teaching.id, teaching.title)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">Edit Teaching</DialogTitle>
              <DialogDescription>Update teaching details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit}>
              <FormContent isEdit />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingTeaching(null); resetForm() }} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-navy hover:bg-navy/90" disabled={submitting}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : 'Update Teaching'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

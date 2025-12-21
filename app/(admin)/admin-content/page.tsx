'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Play, BookOpen, FileText, Headphones, Plus, Edit2, Trash2, Search, Loader2, Lock, Globe, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import ImageUpload from '@/components/ui/image-upload'

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
  published_at?: string
  created_at: string
  updated_at: string
}

export default function ContentManagementPage() {
  const [teachings, setTeachings] = useState<Teaching[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTeaching, setEditingTeaching] = useState<Teaching | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    content_type: 'video' as string,
    content_url: '',
    thumbnail_url: '',
    duration_minutes: '',
    is_premium: false,
    is_published: true,
    is_featured: false,
  })

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
          is_premium: formData.is_premium,
          is_published: formData.is_published,
          is_featured: formData.is_featured,
          view_count: 0,
          published_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating teaching:', error)
        toast({
          title: 'Error',
          description: 'Failed to create teaching',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Teaching created successfully',
        })
        setIsAddDialogOpen(false)
        resetForm()
        fetchTeachings()
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
    if (!editingTeaching) return

    setSubmitting(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('teachings')
        .update({
          title: formData.title,
          author: formData.author,
          description: formData.description || null,
          content_type: formData.content_type,
          content_url: formData.content_url || null,
          thumbnail_url: formData.thumbnail_url || null,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
          is_premium: formData.is_premium,
          is_published: formData.is_published,
          is_featured: formData.is_featured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTeaching.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating teaching:', error)
        toast({
          title: 'Error',
          description: 'Failed to update teaching',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Teaching updated successfully',
        })
        setIsEditDialogOpen(false)
        setEditingTeaching(null)
        resetForm()
        fetchTeachings()
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
        .from('teachings')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting teaching:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete teaching',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Teaching deleted successfully',
        })
        fetchTeachings()
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
      is_premium: teaching.is_premium || false,
      is_published: teaching.is_published || true,
      is_featured: teaching.is_featured || false,
    })
    setIsEditDialogOpen(true)
  }

  const getTypeIcon = (teaching: Teaching) => {
    if (teaching.content_type === 'video') return <Play className="h-4 w-4" />
    if (teaching.content_type === 'audio') return <Headphones className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getTypeBadgeColor = (teaching: Teaching) => {
    if (teaching.content_type === 'video') return 'bg-red-100 text-red-700'
    if (teaching.content_type === 'audio') return 'bg-green-100 text-green-700'
    return 'bg-blue-100 text-blue-700'
  }

  const getTypeLabel = (teaching: Teaching) => {
    if (teaching.content_type === 'video') return 'Video'
    if (teaching.content_type === 'audio') return 'Audio'
    return teaching.content_type || 'Article'
  }

  const filteredTeachings = teachings.filter((teaching) => {
    const matchesSearch =
      teaching.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teaching.author || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || teaching.content_type === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: teachings.length,
    videos: teachings.filter(t => t.content_type === 'video').length,
    audio: teachings.filter(t => t.content_type === 'audio').length,
    totalViews: teachings.reduce((sum, t) => sum + (t.view_count || 0), 0),
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
            <h1 className="text-4xl font-bold text-navy mb-2">Content Management</h1>
            <p className="text-gray-600">
              Manage teachings, sermons, and audio content
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy/90">
                <Plus className="mr-2 h-4 w-4" />
                Add New Teaching
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-navy">Add New Teaching</DialogTitle>
                <DialogDescription>
                  Create a new teaching or sermon
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="content_type">Content Type *</Label>
                      <Select
                        value={formData.content_type}
                        onValueChange={(value: any) => setFormData({ ...formData, content_type: value })}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content_url">Content URL (YouTube, etc.)</Label>
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
                      onUploadError={(error) => toast({
                        title: 'Upload Error',
                        description: error,
                        variant: 'destructive',
                      })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Published</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Featured</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_premium}
                        onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Premium Only</span>
                    </label>
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
                      'Create Teaching'
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
              <DialogTitle className="text-2xl text-navy">Edit Teaching</DialogTitle>
              <DialogDescription>
                Update teaching details
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
                    <Label htmlFor="edit-author">Author/Speaker *</Label>
                    <Input
                      id="edit-author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <textarea
                    id="edit-description"
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-content_type">Content Type *</Label>
                    <Select
                      value={formData.content_type}
                      onValueChange={(value: any) => setFormData({ ...formData, content_type: value })}
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
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      min="0"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-content_url">Content URL (YouTube, etc.)</Label>
                  <Input
                    id="edit-content_url"
                    type="url"
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
                    onUploadError={(error) => toast({
                      title: 'Upload Error',
                      description: error,
                      variant: 'destructive',
                    })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Published</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_premium}
                      onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Premium Only</span>
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingTeaching(null)
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
                    'Update Teaching'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Teachings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.videos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.audio}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">
                {stats.totalViews.toLocaleString()}
              </div>
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
                    placeholder="Search teachings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="article">Articles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-navy">All Teachings</CardTitle>
            <CardDescription>{filteredTeachings.length} items</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTeachings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No teachings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Author</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Views</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachings.map((teaching) => (
                      <tr key={teaching.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-navy">{teaching.title}</div>
                          {teaching.series && (
                            <div className="text-xs text-gray-500">Series: {teaching.series}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${getTypeBadgeColor(teaching)}`}>
                            {getTypeIcon(teaching)}
                            {getTypeLabel(teaching)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{teaching.author}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {teaching.is_published ? (
                              <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">Published</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">Draft</span>
                            )}
                            {teaching.is_featured && (
                              <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">Featured</span>
                            )}
                            {teaching.is_premium && (
                              <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">Premium</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{teaching.view_count || 0}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(teaching)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(teaching.id, teaching.title)}
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

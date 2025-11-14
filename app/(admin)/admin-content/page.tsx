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
import { Play, BookOpen, FileText, Headphones, Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import ImageUpload from '@/components/ui/image-upload'

interface Teaching {
  id: string
  title: string
  description?: string
  speaker: string
  series?: string
  scripture_reference?: string
  video_url?: string
  audio_url?: string
  thumbnail_url?: string
  duration_minutes?: number
  tier_required: 'free' | 'partner' | 'covenant'
  category?: 'sermon' | 'teaching' | 'prophecy' | 'testimony' | 'other'
  view_count: number
  published_at: string
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
    speaker: '',
    description: '',
    series: '',
    scripture_reference: '',
    category: 'teaching' as 'sermon' | 'teaching' | 'prophecy' | 'testimony' | 'other',
    tier_required: 'free' as 'free' | 'partner' | 'covenant',
    video_url: '',
    audio_url: '',
    thumbnail_url: '',
    duration_minutes: '',
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
      speaker: '',
      description: '',
      series: '',
      scripture_reference: '',
      category: 'teaching',
      tier_required: 'free',
      video_url: '',
      audio_url: '',
      thumbnail_url: '',
      duration_minutes: '',
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
          speaker: formData.speaker,
          description: formData.description || null,
          series: formData.series || null,
          scripture_reference: formData.scripture_reference || null,
          category: formData.category,
          tier_required: formData.tier_required,
          video_url: formData.video_url || null,
          audio_url: formData.audio_url || null,
          thumbnail_url: formData.thumbnail_url || null,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
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
          speaker: formData.speaker,
          description: formData.description || null,
          series: formData.series || null,
          scripture_reference: formData.scripture_reference || null,
          category: formData.category,
          tier_required: formData.tier_required,
          video_url: formData.video_url || null,
          audio_url: formData.audio_url || null,
          thumbnail_url: formData.thumbnail_url || null,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
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
      speaker: teaching.speaker,
      description: teaching.description || '',
      series: teaching.series || '',
      scripture_reference: teaching.scripture_reference || '',
      category: teaching.category || 'teaching',
      tier_required: teaching.tier_required,
      video_url: teaching.video_url || '',
      audio_url: teaching.audio_url || '',
      thumbnail_url: teaching.thumbnail_url || '',
      duration_minutes: teaching.duration_minutes?.toString() || '',
    })
    setIsEditDialogOpen(true)
  }

  const getTypeIcon = (teaching: Teaching) => {
    if (teaching.video_url) return <Play className="h-4 w-4" />
    if (teaching.audio_url) return <Headphones className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const getTypeBadgeColor = (teaching: Teaching) => {
    if (teaching.video_url) return 'bg-red-100 text-red-700'
    if (teaching.audio_url) return 'bg-green-100 text-green-700'
    return 'bg-blue-100 text-blue-700'
  }

  const getTypeLabel = (teaching: Teaching) => {
    if (teaching.video_url) return 'Video'
    if (teaching.audio_url) return 'Audio'
    return 'Article'
  }

  const filteredTeachings = teachings.filter((teaching) => {
    const matchesSearch =
      teaching.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teaching.speaker.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || teaching.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: teachings.length,
    videos: teachings.filter(t => t.video_url).length,
    audio: teachings.filter(t => t.audio_url && !t.video_url).length,
    totalViews: teachings.reduce((sum, t) => sum + t.view_count, 0),
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
                      <Label htmlFor="speaker">Speaker *</Label>
                      <Input
                        id="speaker"
                        value={formData.speaker}
                        onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
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
                      <Label htmlFor="series">Series</Label>
                      <Input
                        id="series"
                        value={formData.series}
                        onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scripture">Scripture Reference</Label>
                      <Input
                        id="scripture"
                        placeholder="e.g. John 3:16"
                        value={formData.scripture_reference}
                        onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sermon">Sermon</SelectItem>
                          <SelectItem value="teaching">Teaching</SelectItem>
                          <SelectItem value="prophecy">Prophecy</SelectItem>
                          <SelectItem value="testimony">Testimony</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tier">Access Tier *</Label>
                      <Select
                        value={formData.tier_required}
                        onValueChange={(value: any) => setFormData({ ...formData, tier_required: value })}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video_url">Video URL (YouTube embed)</Label>
                    <Input
                      id="video_url"
                      type="url"
                      placeholder="https://www.youtube.com/embed/..."
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
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
                    <Label htmlFor="edit-speaker">Speaker *</Label>
                    <Input
                      id="edit-speaker"
                      value={formData.speaker}
                      onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
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
                    <Label htmlFor="edit-series">Series</Label>
                    <Input
                      id="edit-series"
                      value={formData.series}
                      onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-scripture">Scripture Reference</Label>
                    <Input
                      id="edit-scripture"
                      value={formData.scripture_reference}
                      onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sermon">Sermon</SelectItem>
                        <SelectItem value="teaching">Teaching</SelectItem>
                        <SelectItem value="prophecy">Prophecy</SelectItem>
                        <SelectItem value="testimony">Testimony</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-tier">Access Tier *</Label>
                    <Select
                      value={formData.tier_required}
                      onValueChange={(value: any) => setFormData({ ...formData, tier_required: value })}
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
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="sermon">Sermons</SelectItem>
                    <SelectItem value="teaching">Teachings</SelectItem>
                    <SelectItem value="prophecy">Prophecies</SelectItem>
                    <SelectItem value="testimony">Testimonies</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Speaker</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
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
                        <td className="py-3 px-4 text-sm text-gray-600">{teaching.speaker}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-gray-600 capitalize">
                            {teaching.category || 'other'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{teaching.view_count}</td>
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

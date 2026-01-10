'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import Image from 'next/image'
import {
  Camera,
  Search,
  Plus,
  Images,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Calendar,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Album {
  id: string
  title: string
  slug: string
  description: string
  category: string
  date: string
  location: string
  photographer: string
  photo_count: number
  view_count: number
  is_public: boolean
  is_featured: boolean
  created_at: string
  cover_photo?: {
    id: string
    thumbnail_url: string
    medium_url: string
  }
}

const categoryLabels: Record<string, string> = {
  events: 'Events',
  worship: 'Worship',
  outreach: 'Outreach',
  missions: 'Missions',
  baptism: 'Baptisms',
  community: 'Community',
  other: 'Other'
}

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  // New album form state
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    location: '',
    photographer: '',
    is_public: false,
    is_featured: false
  })

  useEffect(() => {
    fetchAlbums()
  }, [currentPage, searchQuery, selectedCategory])

  const fetchAlbums = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      })

      const res = await fetch(`/api/admin/gallery?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAlbums(data.albums || [])
        setCategories(data.categories || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching albums:', error)
      toast({
        title: 'Error',
        description: 'Failed to load albums',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlbum = async () => {
    if (!newAlbum.title.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlbum)
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Album created successfully'
        })
        setIsCreateDialogOpen(false)
        setNewAlbum({
          title: '',
          description: '',
          category: '',
          date: '',
          location: '',
          photographer: '',
          is_public: false,
          is_featured: false
        })
        fetchAlbums()
      } else {
        const data = await res.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to create album',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error creating album:', error)
      toast({
        title: 'Error',
        description: 'Failed to create album',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublic = async (album: Album) => {
    try {
      const res = await fetch(`/api/admin/gallery/${album.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: !album.is_public })
      })

      if (res.ok) {
        setAlbums(albums.map(a =>
          a.id === album.id ? { ...a, is_public: !a.is_public } : a
        ))
        toast({
          title: 'Success',
          description: `Album ${!album.is_public ? 'published' : 'unpublished'}`
        })
      }
    } catch (error) {
      console.error('Error toggling public:', error)
    }
  }

  const handleToggleFeatured = async (album: Album) => {
    try {
      const res = await fetch(`/api/admin/gallery/${album.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !album.is_featured })
      })

      if (res.ok) {
        setAlbums(albums.map(a =>
          a.id === album.id ? { ...a, is_featured: !a.is_featured } : a
        ))
        toast({
          title: 'Success',
          description: `Album ${!album.is_featured ? 'featured' : 'unfeatured'}`
        })
      }
    } catch (error) {
      console.error('Error toggling featured:', error)
    }
  }

  const handleDeleteAlbum = async () => {
    if (!selectedAlbum) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/gallery/${selectedAlbum.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Album deleted successfully'
        })
        setIsDeleteDialogOpen(false)
        setSelectedAlbum(null)
        fetchAlbums()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete album',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting album:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete album',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const stats = {
    total: albums.length,
    public: albums.filter(a => a.is_public).length,
    featured: albums.filter(a => a.is_featured).length,
    totalPhotos: albums.reduce((sum, a) => sum + (a.photo_count || 0), 0)
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Camera className="h-8 w-8 text-gold" />
              <h1 className="text-4xl font-bold text-navy">Photo Gallery</h1>
            </div>
            <p className="text-gray-600">Manage photo albums and galleries</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-navy hover:bg-navy-800">
            <Plus className="mr-2 h-4 w-4" />
            New Album
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Albums</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.public}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">{stats.featured}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalPhotos}</div>
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
                    placeholder="Search albums..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Albums Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-navy">Albums</CardTitle>
            <CardDescription>
              {albums.length} album{albums.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : albums.length === 0 ? (
              <div className="text-center py-12">
                <Images className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Albums Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first album to get started'}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Album
                </Button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albums.map(album => (
                    <Card key={album.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-40">
                        {album.cover_photo?.medium_url ? (
                          <Image
                            src={album.cover_photo.medium_url}
                            alt={album.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <Images className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          {album.is_featured && (
                            <span className="bg-gold text-navy px-2 py-1 rounded text-xs font-medium">
                              Featured
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            album.is_public
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {album.is_public ? 'Public' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-navy mb-1 line-clamp-1">{album.title}</h3>
                        {album.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{album.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
                          {album.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(album.date)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Images className="h-3 w-3" />
                            {album.photo_count} photos
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {album.view_count} views
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin-gallery/${album.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Edit2 className="mr-1 h-3 w-3" />
                              Manage
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePublic(album)}
                            title={album.is_public ? 'Unpublish' : 'Publish'}
                          >
                            {album.is_public ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFeatured(album)}
                            title={album.is_featured ? 'Unfeature' : 'Feature'}
                          >
                            {album.is_featured ? (
                              <Star className="h-4 w-4 text-gold fill-gold" />
                            ) : (
                              <StarOff className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAlbum(album)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Album Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">Create New Album</DialogTitle>
              <DialogDescription>Add a new photo album to the gallery</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                  placeholder="Album title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAlbum.description}
                  onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                  placeholder="Brief description of the album"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newAlbum.category}
                    onValueChange={(value) => setNewAlbum({ ...newAlbum, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAlbum.date}
                    onChange={(e) => setNewAlbum({ ...newAlbum, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newAlbum.location}
                    onChange={(e) => setNewAlbum({ ...newAlbum, location: e.target.value })}
                    placeholder="Event location"
                  />
                </div>

                <div>
                  <Label htmlFor="photographer">Photographer</Label>
                  <Input
                    id="photographer"
                    value={newAlbum.photographer}
                    onChange={(e) => setNewAlbum({ ...newAlbum, photographer: e.target.value })}
                    placeholder="Photo credit"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_public"
                    checked={newAlbum.is_public}
                    onCheckedChange={(checked) => setNewAlbum({ ...newAlbum, is_public: checked })}
                  />
                  <Label htmlFor="is_public">Publish immediately</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={newAlbum.is_featured}
                    onCheckedChange={(checked) => setNewAlbum({ ...newAlbum, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleCreateAlbum} disabled={saving} className="bg-navy hover:bg-navy-800">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Album'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl text-red-600">Delete Album</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedAlbum?.title}&quot;? This will also delete all {selectedAlbum?.photo_count || 0} photos in this album. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAlbum}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Album
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

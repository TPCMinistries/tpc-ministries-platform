'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  BookOpen,
  File,
  Loader2,
  ExternalLink,
  Upload,
} from 'lucide-react'
import FileUpload from '@/components/ui/file-upload'
import ImageUpload from '@/components/ui/image-upload'
import { createClient } from '@/lib/supabase/client'

interface Resource {
  id: string
  title: string
  description?: string
  type: 'ebook' | 'guide' | 'worksheet' | 'document' | 'other'
  file_url: string
  thumbnail_url?: string
  category?: string
  tier_required: 'free' | 'partner' | 'covenant'
  published: boolean
  download_count: number
  author?: string
  created_at: string
  updated_at: string
}

const defaultFormData = {
  title: '',
  description: '',
  type: 'ebook' as const,
  file_url: '',
  thumbnail_url: '',
  category: '',
  tier_required: 'free' as const,
  is_published: false,
  author: '',
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [storageFiles, setStorageFiles] = useState<any[]>([])
  const [loadingStorage, setLoadingStorage] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{imported: number, skipped: number} | null>(null)

  useEffect(() => {
    fetchResources()
  }, [typeFilter, tierFilter, statusFilter])

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (tierFilter !== 'all') params.set('tier', tierFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/admin/resources?${params}`)
      const result = await response.json()

      if (response.ok) {
        setResources(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchResources()
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.file_url) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsCreateOpen(false)
        setFormData(defaultFormData)
        fetchResources()
      }
    } catch (error) {
      console.error('Error creating resource:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedResource || !formData.title) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/resources/${selectedResource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsEditOpen(false)
        setSelectedResource(null)
        setFormData(defaultFormData)
        fetchResources()
      }
    } catch (error) {
      console.error('Error updating resource:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedResource) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/resources/${selectedResource.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setIsDeleteOpen(false)
        setSelectedResource(null)
        fetchResources()
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (resource: Resource) => {
    setSelectedResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description || '',
      type: resource.type,
      file_url: resource.file_url,
      thumbnail_url: resource.thumbnail_url || '',
      category: resource.category || '',
      tier_required: resource.tier_required,
      is_published: resource.published,
      author: resource.author || '',
    })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (resource: Resource) => {
    setSelectedResource(resource)
    setIsDeleteOpen(true)
  }

  const fetchStorageFiles = async () => {
    setLoadingStorage(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('tpc-media')
        .list('ebooks', { limit: 100 })

      if (error) throw error

      // Filter out files that are already in resources
      const existingUrls = resources.map(r => r.file_url)
      const newFiles = (data || []).filter(file => {
        const url = `https://naulwwnzrznslvhhxfed.supabase.co/storage/v1/object/public/tpc-media/ebooks/${file.name}`
        return !existingUrls.includes(url) && file.name !== '.emptyFolderPlaceholder'
      })

      setStorageFiles(newFiles)
    } catch (error) {
      console.error('Error fetching storage files:', error)
    } finally {
      setLoadingStorage(false)
    }
  }

  const openImportDialog = () => {
    setIsImportOpen(true)
    fetchStorageFiles()
  }

  const handleAutoImport = async () => {
    setImporting(true)
    setImportResult(null)
    try {
      const response = await fetch('/api/admin/resources/import-storage', {
        method: 'POST',
      })
      const result = await response.json()

      if (response.ok) {
        setImportResult({ imported: result.imported, skipped: result.skipped })
        fetchResources()
        fetchStorageFiles()
      }
    } catch (error) {
      console.error('Error auto-importing:', error)
    } finally {
      setImporting(false)
    }
  }

  const importFile = (file: any) => {
    const url = `https://naulwwnzrznslvhhxfed.supabase.co/storage/v1/object/public/tpc-media/ebooks/${file.name}`
    const title = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase())

    setFormData({
      ...defaultFormData,
      title,
      file_url: url,
      type: file.name.endsWith('.pdf') ? 'ebook' : 'document',
    })
    setIsImportOpen(false)
    setIsCreateOpen(true)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ebook':
        return <BookOpen className="h-4 w-4" />
      case 'guide':
      case 'worksheet':
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ebook':
        return 'bg-purple-100 text-purple-700'
      case 'guide':
        return 'bg-blue-100 text-blue-700'
      case 'worksheet':
        return 'bg-green-100 text-green-700'
      case 'document':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-700'
      case 'partner':
        return 'bg-blue-100 text-blue-700'
      case 'covenant':
        return 'bg-gold/20 text-gold-dark'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const stats = {
    total: resources.length,
    published: resources.filter(r => r.published).length,
    ebooks: resources.filter(r => r.type === 'ebook').length,
    downloads: resources.reduce((sum, r) => sum + r.download_count, 0),
  }

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Resources & Ebooks</h1>
          <p className="text-gray-600 mt-1">Manage downloadable resources for members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openImportDialog}>
            <Upload className="mr-2 h-4 w-4" />
            Import from Storage
          </Button>
          <Button onClick={() => { setFormData(defaultFormData); setIsCreateOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ebooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.ebooks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.downloads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ebook">Ebooks</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="worksheet">Worksheets</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="covenant">Covenant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No resources found</p>
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Resource
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                          {getTypeIcon(resource.type)}
                        </div>
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          {resource.author && (
                            <p className="text-sm text-gray-500">{resource.author}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierColor(resource.tier_required)}>
                        {resource.tier_required}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={resource.published ? 'default' : 'secondary'}>
                        {resource.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4 text-gray-400" />
                        {resource.download_count}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View File
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(resource)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(resource)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false)
          setIsEditOpen(false)
          setSelectedResource(null)
          setFormData(defaultFormData)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
            <DialogDescription>
              {isEditOpen ? 'Update the resource details' : 'Upload a new ebook, guide, or document'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Resource title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the resource"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ebook">Ebook</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="worksheet">Worksheet</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Access Tier</Label>
                <Select
                  value={formData.tier_required}
                  onValueChange={(value: any) => setFormData({ ...formData, tier_required: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (Everyone)</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="covenant">Covenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Prayer, Faith, Leadership"
              />
            </div>

            <div className="grid gap-2">
              <Label>File Upload *</Label>
              <FileUpload
                folder="ebooks"
                currentFileUrl={formData.file_url}
                onUploadComplete={(url) => setFormData({ ...formData, file_url: url })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Thumbnail Image (Optional)</Label>
              <ImageUpload
                folder="resources"
                currentImageUrl={formData.thumbnail_url}
                onUploadComplete={(url) => setFormData({ ...formData, thumbnail_url: url })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="published">Published (visible to members)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false)
              setIsEditOpen(false)
            }}>
              Cancel
            </Button>
            <Button
              onClick={isEditOpen ? handleEdit : handleCreate}
              disabled={saving || !formData.title || !formData.file_url}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditOpen ? 'Save Changes' : 'Create Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedResource?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import from Storage Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import from Storage</DialogTitle>
            <DialogDescription>
              Import ebooks from your Supabase storage bucket
            </DialogDescription>
          </DialogHeader>

          {/* Auto Import Button */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Auto Import All Files</p>
                <p className="text-sm text-blue-700">Automatically import all ebooks from storage</p>
              </div>
              <Button onClick={handleAutoImport} disabled={importing}>
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import All
                  </>
                )}
              </Button>
            </div>
            {importResult && (
              <div className="mt-3 text-sm">
                <p className="text-green-700">Imported: {importResult.imported} files</p>
                <p className="text-gray-600">Skipped (already exist): {importResult.skipped} files</p>
              </div>
            )}
          </div>

          <div className="py-4">
            <p className="text-sm text-gray-600 mb-3">Or select individual files:</p>
            {loadingStorage ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : storageFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No new files found in storage</p>
                <p className="text-sm mt-1">All files have already been imported</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {storageFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    onClick={() => importFile(file)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.metadata?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Import
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

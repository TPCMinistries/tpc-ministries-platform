'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Image as ImageIcon,
  Search,
  Loader2,
  Trash2,
  Copy,
  Folder,
  Calendar,
  HardDrive,
  Upload,
  Music,
  Video,
  FileText,
  Grid3X3,
  List,
  Download,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface MediaItem {
  id: string
  file_name: string
  original_name: string
  file_path: string
  public_url: string
  media_type: string
  mime_type: string
  file_size_bytes: number
  alt_text?: string
  caption?: string
  tags: string[]
  folder?: string
  usage_count: number
  created_at: string
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterFolder, setFilterFolder] = useState('all')
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [editAlt, setEditAlt] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchQueryRef = useRef(searchQuery)
  const { toast } = useToast()

  const folders = ['all', 'teachings', 'prophecies', 'events', 'resources', 'profiles', 'missions', 'blog', 'general']
  searchQueryRef.current = searchQuery

  const fetchMedia = useCallback(async (search = searchQueryRef.current) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.set('type', filterType)
      if (filterFolder !== 'all') params.set('folder', filterFolder)
      if (search) params.set('search', search)
      params.set('page', page.toString())
      params.set('limit', '40')

      const res = await fetch(`/api/admin/media?${params}`)
      const json = await res.json()

      setMedia(json.data || [])
      setTotal(json.pagination?.total || 0)
      setTotalPages(json.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching media:', error)
      toast({ title: 'Error', description: 'Failed to load media', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [filterFolder, filterType, page, toast])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleSearch = () => {
    setPage(1)
    fetchMedia(searchQuery)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    let uploaded = 0

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', filterFolder !== 'all' ? filterFolder : 'general')

        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) uploaded++
      }

      toast({ title: 'Success', description: `${uploaded} file${uploaded > 1 ? 's' : ''} uploaded` })
      fetchMedia()
    } catch (error) {
      console.error('Media upload failed:', error)
      toast({ title: 'Error', description: 'Upload failed', variant: 'destructive' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleImportExisting = async () => {
    setImporting(true)
    try {
      const res = await fetch('/api/admin/media/import-existing', { method: 'POST' })
      const json = await res.json()
      toast({
        title: 'Import Complete',
        description: `Imported ${json.imported} files, skipped ${json.skipped} (already in library)`,
      })
      fetchMedia()
    } catch (error) {
      console.error('Media import failed:', error)
      toast({ title: 'Error', description: 'Import failed', variant: 'destructive' })
    } finally {
      setImporting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    if (!confirm(`Delete "${selectedItem.original_name || selectedItem.file_name}"? This cannot be undone.`)) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/media/${selectedItem.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Deleted', description: 'File deleted successfully' })
        setIsDetailOpen(false)
        setSelectedItem(null)
        fetchMedia()
      }
    } catch (error) {
      console.error('Media delete failed:', error)
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveMetadata = async () => {
    if (!selectedItem) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/media/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt_text: editAlt, caption: editCaption }),
      })
      if (res.ok) {
        const json = await res.json()
        setSelectedItem(json.data)
        setMedia(media.map(m => m.id === selectedItem.id ? json.data : m))
        toast({ title: 'Saved', description: 'Metadata updated' })
      }
    } catch (error) {
      console.error('Media metadata save failed:', error)
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({ title: 'Copied', description: 'URL copied to clipboard' })
  }

  const openDetail = (item: MediaItem) => {
    setSelectedItem(item)
    setEditAlt(item.alt_text || '')
    setEditCaption(item.caption || '')
    setIsDetailOpen(true)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />
      case 'audio': return <Music className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon className="h-8 w-8 text-gold" />
              <h1 className="text-4xl font-bold text-navy">Media Library</h1>
            </div>
            <p className="text-gray-600">
              {total} file{total !== 1 ? 's' : ''} in library
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
              accept="image/*,video/*,audio/*,.pdf,.epub,.docx"
            />
            <Button
              variant="outline"
              onClick={handleImportExisting}
              disabled={importing}
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Import Existing
            </Button>
            <Button
              className="bg-navy hover:bg-navy/90"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload
            </Button>
          </div>
        </div>

        {/* Type filter tabs */}
        <Tabs value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1) }} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search by filename, alt text, or caption..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterFolder} onValueChange={(v) => { setFilterFolder(v); setPage(1) }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folders.map(f => (
                    <SelectItem key={f} value={f}>
                      {f === 'all' ? 'All Folders' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid/List */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-navy" />
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No media found</p>
                <p className="text-sm mt-1">Upload files or import existing ones from storage</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                {media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-navy cursor-pointer transition-colors text-left"
                    onClick={() => openDetail(item)}
                  >
                    {item.media_type === 'image' ? (
                      <Image
                        src={item.public_url}
                        alt={item.alt_text || item.file_name}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-3">
                        {getTypeIcon(item.media_type)}
                        <span className="text-xs text-gray-600 mt-2 truncate w-full text-center">
                          {item.original_name || item.file_name}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {formatSize(item.file_size_bytes)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-center text-white p-2">
                        <p className="text-xs font-medium truncate">
                          {item.original_name || item.file_name}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">{formatSize(item.file_size_bytes)}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-navy/80 text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                      {getTypeIcon(item.media_type)}
                      {item.folder || 'general'}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:border-navy transition-colors text-left"
                    onClick={() => openDetail(item)}
                  >
                    <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden relative">
                      {item.media_type === 'image' ? (
                        <Image src={item.public_url} alt="" fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          {getTypeIcon(item.media_type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.original_name || item.file_name}</p>
                      <p className="text-xs text-gray-500">{item.media_type} &middot; {formatSize(item.file_size_bytes)} &middot; {item.folder}</p>
                    </div>
                    <div className="text-xs text-gray-400">{formatDate(item.created_at)}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">File Details</DialogTitle>
              <DialogDescription>{selectedItem?.original_name || selectedItem?.file_name}</DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-4">
                {/* Preview */}
                <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                  {selectedItem.media_type === 'image' ? (
                    <Image
                      src={selectedItem.public_url}
                      alt={selectedItem.alt_text || selectedItem.file_name}
                      fill
                      className="object-contain"
                    />
                  ) : selectedItem.media_type === 'audio' ? (
                    <div className="flex items-center justify-center h-full">
                      <audio controls src={selectedItem.public_url} className="w-3/4" />
                    </div>
                  ) : selectedItem.media_type === 'video' ? (
                    <video controls src={selectedItem.public_url} className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FileText className="h-16 w-16 text-gray-400" />
                      <p className="text-gray-500 mt-2">{selectedItem.mime_type}</p>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Folder className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Folder:</span>
                    <span className="font-medium">{selectedItem.folder || 'general'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{formatSize(selectedItem.file_size_bytes)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-medium">{formatDate(selectedItem.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {getTypeIcon(selectedItem.media_type)}
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedItem.mime_type}</span>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-alt" className="text-sm">Alt Text</Label>
                    <Input
                      id="edit-alt"
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      placeholder="Describe this media..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-caption" className="text-sm">Caption</Label>
                    <Input
                      id="edit-caption"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Optional caption..."
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveMetadata}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Save Metadata
                  </Button>
                </div>

                {/* URL */}
                <div>
                  <Label className="text-sm">Public URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={selectedItem.public_url} readOnly className="font-mono text-xs" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyUrl(selectedItem.public_url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                ) : (
                  <><Trash2 className="mr-2 h-4 w-4" />Delete File</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

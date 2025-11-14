'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  Image as ImageIcon,
  Search,
  Loader2,
  Trash2,
  Copy,
  X,
  Folder,
  Calendar,
  HardDrive,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface StorageFile {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: {
    eTag: string
    size: number
    mimetype: string
    cacheControl: string
    lastModified: string
    contentLength: number
    httpStatusCode: number
  }
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFolder, setFilterFolder] = useState<string>('all')
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const itemsPerPage = 20
  const folders = ['all', 'teachings', 'prophecies', 'events', 'resources', 'profiles', 'missions']

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase.storage.from('tpc-media').list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

      if (error) {
        console.error('Error fetching files:', error)
        toast({
          title: 'Error',
          description: 'Failed to load media files',
          variant: 'destructive',
        })
      } else {
        // Fetch all files from all folders
        const allFiles: StorageFile[] = []
        for (const folder of folders.filter((f) => f !== 'all')) {
          const { data: folderData, error: folderError } = await supabase.storage
            .from('tpc-media')
            .list(folder, {
              limit: 1000,
              sortBy: { column: 'created_at', order: 'desc' },
            })

          if (!folderError && folderData) {
            allFiles.push(...folderData.map((file) => ({ ...file, name: `${folder}/${file.name}` })))
          }
        }
        setFiles(allFiles)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPublicUrl = (fileName: string) => {
    const supabase = createClient()
    const { data } = supabase.storage.from('tpc-media').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleCopyUrl = (fileName: string) => {
    const url = getPublicUrl(fileName)
    navigator.clipboard.writeText(url)
    toast({
      title: 'Copied',
      description: 'Image URL copied to clipboard',
    })
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return
    }

    const supabase = createClient()
    setDeleting(true)

    try {
      const { error } = await supabase.storage.from('tpc-media').remove([fileName])

      if (error) {
        console.error('Error deleting file:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete file',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'File deleted successfully',
        })
        setIsDetailDialogOpen(false)
        setSelectedFile(null)
        fetchFiles()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setDeleting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFolderFromPath = (fileName: string) => {
    return fileName.split('/')[0] || 'root'
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = filterFolder === 'all' || getFolderFromPath(file.name) === filterFolder
    return matchesSearch && matchesFolder
  })

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage)

  const stats = {
    total: files.length,
    size: files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0),
    byFolder: folders
      .filter((f) => f !== 'all')
      .reduce((acc, folder) => {
        acc[folder] = files.filter((f) => getFolderFromPath(f.name) === folder).length
        return acc
      }, {} as Record<string, number>),
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="h-8 w-8 text-gold" />
            <h1 className="text-4xl font-bold text-navy">Media Library</h1>
          </div>
          <p className="text-gray-600">Manage uploaded images and media files</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{formatFileSize(stats.size)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Teachings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.byFolder.teachings || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Prophecies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">{stats.byFolder.prophecies || 0}</div>
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
                    placeholder="Search by filename..."
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
                  value={filterFolder}
                  onValueChange={(value) => {
                    setFilterFolder(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Folders</SelectItem>
                    <SelectItem value="teachings">Teachings</SelectItem>
                    <SelectItem value="prophecies">Prophecies</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="resources">Resources</SelectItem>
                    <SelectItem value="profiles">Profiles</SelectItem>
                    <SelectItem value="missions">Missions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-navy">All Files</CardTitle>
            <CardDescription>
              {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
              {filterFolder !== 'all' && ` in ${filterFolder}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paginatedFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No files found</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
                  {paginatedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-navy cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedFile(file)
                        setIsDetailDialogOpen(true)
                      }}
                    >
                      <Image
                        src={getPublicUrl(file.name)}
                        alt={file.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-center text-white p-2">
                          <p className="text-xs font-medium truncate">{file.name.split('/').pop()}</p>
                          <p className="text-xs text-gray-300 mt-1">
                            {formatFileSize(file.metadata?.size || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-navy/80 text-white px-2 py-1 rounded text-xs">
                        {getFolderFromPath(file.name)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* File Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-navy">File Details</DialogTitle>
              <DialogDescription>{selectedFile?.name.split('/').pop()}</DialogDescription>
            </DialogHeader>

            {selectedFile && (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={getPublicUrl(selectedFile.name)}
                    alt={selectedFile.name}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Metadata */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Folder className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Folder:</span>
                    <span className="font-medium">{getFolderFromPath(selectedFile.name)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{formatFileSize(selectedFile.metadata?.size || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-medium">{formatDate(selectedFile.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedFile.metadata?.mimetype || 'image'}</span>
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Public URL</label>
                  <div className="flex gap-2">
                    <Input value={getPublicUrl(selectedFile.name)} readOnly className="font-mono text-xs" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyUrl(selectedFile.name)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailDialogOpen(false)}
                disabled={deleting}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedFile && handleDelete(selectedFile.name)}
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
                    Delete File
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

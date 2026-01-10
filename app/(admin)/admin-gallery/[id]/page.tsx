'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
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
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import Image from 'next/image'
import {
  Camera,
  ArrowLeft,
  Save,
  Upload,
  Images,
  Trash2,
  Star,
  Loader2,
  GripVertical,
  Check,
  X,
  ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Photo {
  id: string
  original_url: string
  thumbnail_url: string
  medium_url: string
  large_url: string
  title: string
  description: string
  alt_text: string
  width: number
  height: number
  sort_order: number
}

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
  is_public: boolean
  is_featured: boolean
  cover_photo_id: string | null
  cover_photo?: {
    id: string
    thumbnail_url: string
    medium_url: string
    original_url: string
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

export default function AlbumManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [album, setAlbum] = useState<Album | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
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
    fetchAlbum()
  }, [id])

  const fetchAlbum = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/gallery/${id}`)
      if (res.ok) {
        const data = await res.json()
        setAlbum(data.album)
        setPhotos(data.photos || [])
        setFormData({
          title: data.album.title || '',
          description: data.album.description || '',
          category: data.album.category || '',
          date: data.album.date?.split('T')[0] || '',
          location: data.album.location || '',
          photographer: data.album.photographer || '',
          is_public: data.album.is_public || false,
          is_featured: data.album.is_featured || false
        })
      } else {
        toast({
          title: 'Error',
          description: 'Album not found',
          variant: 'destructive'
        })
        router.push('/admin-gallery')
      }
    } catch (error) {
      console.error('Error fetching album:', error)
      toast({
        title: 'Error',
        description: 'Failed to load album',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const data = await res.json()
        setAlbum(data.album)
        toast({
          title: 'Success',
          description: 'Album saved successfully'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save album',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving album:', error)
      toast({
        title: 'Error',
        description: 'Failed to save album',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const supabase = createClient()
    const uploadedPhotos: {
      original_url: string
      thumbnail_url: string
      medium_url: string
      large_url: string
      title: string
      width: number
      height: number
      file_size: number
      mime_type: string
    }[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `gallery/${album?.slug || id}/${fileName}`

        // Upload to storage
        const { data, error } = await supabase.storage
          .from('tpc-media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Error uploading file:', error)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('tpc-media')
          .getPublicUrl(filePath)

        // Get image dimensions
        const dimensions = await getImageDimensions(file)

        uploadedPhotos.push({
          original_url: publicUrl,
          thumbnail_url: publicUrl,
          medium_url: publicUrl,
          large_url: publicUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          width: dimensions.width,
          height: dimensions.height,
          file_size: file.size,
          mime_type: file.type
        })

        setUploadProgress(Math.round(((i + 1) / files.length) * 100))
      }

      // Add photos to album
      if (uploadedPhotos.length > 0) {
        const res = await fetch(`/api/admin/gallery/${id}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photos: uploadedPhotos })
        })

        if (res.ok) {
          const data = await res.json()
          setPhotos([...photos, ...data.photos])
          toast({
            title: 'Success',
            description: `${uploadedPhotos.length} photo(s) uploaded successfully`
          })
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload photos',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset input
      e.target.value = ''
    }
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = document.createElement('img')
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => {
        resolve({ width: 0, height: 0 })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleSetCover = async (photoId: string) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_photo_id: photoId })
      })

      if (res.ok) {
        const photo = photos.find(p => p.id === photoId)
        if (album && photo) {
          setAlbum({
            ...album,
            cover_photo_id: photoId,
            cover_photo: {
              id: photo.id,
              thumbnail_url: photo.thumbnail_url,
              medium_url: photo.medium_url,
              original_url: photo.original_url
            }
          })
        }
        toast({
          title: 'Success',
          description: 'Cover photo updated'
        })
      }
    } catch (error) {
      console.error('Error setting cover:', error)
    }
  }

  const handleDeletePhotos = async () => {
    if (selectedPhotos.size === 0) return

    setDeleting(true)
    try {
      const ids = Array.from(selectedPhotos).join(',')
      const res = await fetch(`/api/admin/gallery/${id}/photos?ids=${ids}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setPhotos(photos.filter(p => !selectedPhotos.has(p.id)))
        setSelectedPhotos(new Set())
        toast({
          title: 'Success',
          description: `${selectedPhotos.size} photo(s) deleted`
        })
      }
    } catch (error) {
      console.error('Error deleting photos:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete photos',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  const togglePhotoSelection = (photoId: string) => {
    const newSelected = new Set(selectedPhotos)
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId)
    } else {
      newSelected.add(photoId)
    }
    setSelectedPhotos(newSelected)
  }

  const selectAllPhotos = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)))
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  if (!album) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <Images className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy mb-4">Album Not Found</h1>
          <Link href="/admin-gallery">
            <Button>Back to Gallery</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin-gallery"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-navy mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-8 w-8 text-gold" />
              <div>
                <h1 className="text-3xl font-bold text-navy">{album.title}</h1>
                <p className="text-gray-600">Manage album and photos</p>
              </div>
            </div>
            <div className="flex gap-2">
              {album.is_public && (
                <Link href={`/gallery/${album.slug}`} target="_blank">
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Public
                  </Button>
                </Link>
              )}
              <Button onClick={handleSave} disabled={saving} className="bg-navy hover:bg-navy-800">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Album Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Album Details</CardTitle>
                <CardDescription>Basic information about this album</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="photographer">Photographer</Label>
                  <Input
                    id="photographer"
                    value={formData.photographer}
                    onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="is_public">Published</Label>
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Featured</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cover Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Cover Photo</CardTitle>
                <CardDescription>Click a photo below to set as cover</CardDescription>
              </CardHeader>
              <CardContent>
                {album.cover_photo?.medium_url ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={album.cover_photo.medium_url}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                    <Images className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Photos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Photos ({photos.length})</CardTitle>
                    <CardDescription>Upload and manage album photos</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {selectedPhotos.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeletePhotos}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1 h-4 w-4" />
                        )}
                        Delete ({selectedPhotos.size})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllPhotos}
                      disabled={photos.length === 0}
                    >
                      {selectedPhotos.size === photos.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Upload Area */}
                <div className="mb-6">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-navy mb-2" />
                          <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-navy">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>

                {/* Photos Grid */}
                {photos.length === 0 ? (
                  <div className="text-center py-12">
                    <Images className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No photos yet. Upload some photos to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`relative aspect-square rounded-lg overflow-hidden group border-2 transition-colors ${
                          selectedPhotos.has(photo.id)
                            ? 'border-navy'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={photo.thumbnail_url || photo.original_url}
                          alt={photo.alt_text || photo.title || ''}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />

                        {/* Selection Overlay */}
                        <div
                          className={`absolute inset-0 transition-colors cursor-pointer ${
                            selectedPhotos.has(photo.id)
                              ? 'bg-navy/30'
                              : 'bg-black/0 group-hover:bg-black/20'
                          }`}
                          onClick={() => togglePhotoSelection(photo.id)}
                        />

                        {/* Selection Checkbox */}
                        <button
                          className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedPhotos.has(photo.id)
                              ? 'bg-navy border-navy text-white'
                              : 'bg-white/80 border-gray-400 opacity-0 group-hover:opacity-100'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePhotoSelection(photo.id)
                          }}
                        >
                          {selectedPhotos.has(photo.id) && <Check className="h-4 w-4" />}
                        </button>

                        {/* Cover Badge */}
                        {album.cover_photo_id === photo.id && (
                          <div className="absolute top-2 right-2 bg-gold text-navy px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Cover
                          </div>
                        )}

                        {/* Set as Cover Button */}
                        {album.cover_photo_id !== photo.id && (
                          <button
                            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-navy px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSetCover(photo.id)
                            }}
                          >
                            <Star className="h-3 w-3" />
                            Set Cover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

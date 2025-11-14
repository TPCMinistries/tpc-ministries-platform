'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface ImageUploadProps {
  folder: 'teachings' | 'prophecies' | 'events' | 'resources' | 'profiles' | 'missions'
  currentImageUrl?: string
  onUploadComplete: (url: string) => void
  onUploadError?: (error: string) => void
  maxSizeMB?: number
  acceptedFormats?: string[]
  className?: string
}

export default function ImageUpload({
  folder,
  currentImageUrl,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 2,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = async (file: File, maxSizeMB: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = document.createElement('img')
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calculate new dimensions to keep aspect ratio
          const maxDimension = 2000
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          // Try different quality levels to get under maxSizeMB
          const tryCompress = (quality: number) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const sizeMB = blob.size / 1024 / 1024
                  if (sizeMB <= maxSizeMB || quality <= 0.3) {
                    const compressedFile = new File([blob], file.name, {
                      type: file.type,
                      lastModified: Date.now(),
                    })
                    resolve(compressedFile)
                  } else {
                    // Try again with lower quality
                    tryCompress(quality - 0.1)
                  }
                } else {
                  reject(new Error('Failed to compress image'))
                }
              },
              file.type,
              quality
            )
          }

          tryCompress(0.9)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
    })
  }

  const deleteOldImage = async (url: string) => {
    try {
      const supabase = createClient()
      // Extract path from URL
      const urlParts = url.split('/storage/v1/object/public/tpc-media/')
      if (urlParts.length > 1) {
        const path = urlParts[1]
        await supabase.storage.from('tpc-media').remove([path])
      }
    } catch (error) {
      console.error('Error deleting old image:', error)
      // Don't throw - allow new upload to proceed even if delete fails
    }
  }

  const uploadToSupabase = async (file: File) => {
    const supabase = createClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Delete old image if exists
    if (currentImageUrl) {
      await deleteOldImage(currentImageUrl)
    }

    // Upload new image
    const { data, error } = await supabase.storage
      .from('tpc-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tpc-media')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  const handleFileSelect = async (file: File) => {
    setError(null)
    setProgress(0)

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      const errorMsg = 'Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    // Validate file size (before compression)
    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > 10) {
      const errorMsg = 'File is too large. Maximum size is 10MB.'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    try {
      setUploading(true)
      setProgress(10)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setProgress(30)

      // Compress image if needed
      let fileToUpload = file
      if (fileSizeMB > maxSizeMB) {
        fileToUpload = await compressImage(file, maxSizeMB)
      }
      setProgress(50)

      // Upload to Supabase
      const publicUrl = await uploadToSupabase(fileToUpload)
      setProgress(100)

      // Callback with URL
      onUploadComplete(publicUrl)
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to upload image'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      setPreview(null)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {preview ? (
        <Card className="relative overflow-hidden">
          <div className="relative aspect-video w-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          {!uploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">Uploading...</p>
                <div className="w-48 mt-2">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragging
              ? 'border-navy bg-navy/5'
              : 'border-gray-300 hover:border-navy'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-navy/10 p-4 mb-4">
              {uploading ? (
                <Loader2 className="h-8 w-8 text-navy animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-navy" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {uploading ? 'Uploading...' : 'Drop your image here, or click to browse'}
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, WebP or GIF (max {maxSizeMB}MB)
            </p>
            {uploading && (
              <div className="w-64 mt-4">
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

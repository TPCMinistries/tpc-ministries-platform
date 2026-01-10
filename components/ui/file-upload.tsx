'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Loader2, AlertCircle, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

interface FileUploadProps {
  folder?: string
  currentFileUrl?: string
  onUploadComplete: (url: string, fileName: string) => void
  onUploadError?: (error: string) => void
  maxSizeMB?: number
  acceptedFormats?: string[]
  className?: string
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function FileUpload({
  folder = 'ebooks',
  currentFileUrl,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 50,
  acceptedFormats = [
    'application/pdf',
    'application/epub+zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],
  className = '',
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<{name: string, size: number, url?: string} | null>(
    currentFileUrl ? { name: currentFileUrl.split('/').pop() || 'File', size: 0, url: currentFileUrl } : null
  )
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const deleteOldFile = async (url: string) => {
    try {
      const supabase = createClient()
      const urlParts = url.split('/storage/v1/object/public/tpc-media/')
      if (urlParts.length > 1) {
        const path = urlParts[1]
        await supabase.storage.from('tpc-media').remove([path])
      }
    } catch (error) {
      console.error('Error deleting old file:', error)
    }
  }

  const uploadToSupabase = async (file: File) => {
    const supabase = createClient()

    const fileExt = file.name.split('.').pop()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${folder}/${Date.now()}-${safeFileName}`

    if (currentFileUrl) {
      await deleteOldFile(currentFileUrl)
    }

    const { data, error } = await supabase.storage
      .from('tpc-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw error
    }

    const { data: urlData } = supabase.storage
      .from('tpc-media')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  const handleFileSelect = async (file: File) => {
    setError(null)
    setProgress(0)

    // Validate file type
    const isValidType = acceptedFormats.some(format => {
      if (format === 'application/pdf' && file.type === 'application/pdf') return true
      if (format === 'application/epub+zip' && (file.type === 'application/epub+zip' || file.name.endsWith('.epub'))) return true
      if (format.includes('word') && (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc'))) return true
      return file.type === format
    })

    if (!isValidType) {
      const errorMsg = 'Invalid file type. Please upload a PDF, EPUB, or Word document.'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > maxSizeMB) {
      const errorMsg = `File is too large. Maximum size is ${maxSizeMB}MB.`
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    try {
      setUploading(true)
      setProgress(20)

      setSelectedFile({ name: file.name, size: file.size })
      setProgress(40)

      const publicUrl = await uploadToSupabase(file)
      setProgress(100)

      setSelectedFile({ name: file.name, size: file.size, url: publicUrl })
      onUploadComplete(publicUrl, file.name)
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to upload file'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      setSelectedFile(null)
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
    []
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
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return <FileText className="h-8 w-8 text-red-500" />
    if (fileName.endsWith('.epub')) return <File className="h-8 w-8 text-green-500" />
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return <FileText className="h-8 w-8 text-blue-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.epub,.docx,.doc"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {selectedFile ? (
        <Card className="relative p-4">
          <div className="flex items-center gap-4">
            {getFileIcon(selectedFile.name)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              {selectedFile.size > 0 && (
                <p className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</p>
              )}
              {selectedFile.url && (
                <a
                  href={selectedFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View file
                </a>
              )}
            </div>
            {!uploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                aria-label="Remove file"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
          {uploading && (
            <div className="mt-3" role="status" aria-live="polite">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-navy" aria-hidden="true" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
              <Progress value={progress} className="h-2" aria-label={`Upload progress: ${progress}%`} />
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
              {uploading ? 'Uploading...' : 'Drop your file here, or click to browse'}
            </p>
            <p className="text-xs text-gray-500">
              PDF, EPUB, or Word document (max {maxSizeMB}MB)
            </p>
            {uploading && (
              <div className="w-64 mt-4">
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </Card>
      )}

      <div role="alert" aria-live="assertive">
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Plus } from 'lucide-react'
import type { FieldConfig } from '@/lib/content/content-types'
import ImageUpload from '@/components/ui/image-upload'
import FileUpload from '@/components/ui/file-upload'
import VideoInput from './video-input'
import dynamic from 'next/dynamic'

const TiptapEditor = dynamic(() => import('@/components/editor/tiptap-editor'), { ssr: false })

interface DynamicFieldProps {
  field: FieldConfig
  value: any
  onChange: (value: any) => void
  onImagePickerOpen?: (fieldName: string) => void
}

export default function DynamicField({ field, value, onChange, onImagePickerOpen }: DynamicFieldProps) {
  const [tagInput, setTagInput] = useState('')

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <textarea
            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy resize-y text-sm"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        )

      case 'richtext':
        return (
          <TiptapEditor
            content={value || ''}
            onChange={onChange}
            placeholder={field.placeholder || 'Start writing...'}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            min="0"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : '')}
            placeholder={field.placeholder}
          />
        )

      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'switch':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={value ?? field.defaultValue ?? false}
              onCheckedChange={onChange}
            />
            <span className="text-sm text-gray-600">{value ? 'Yes' : 'No'}</span>
          </div>
        )

      case 'image':
        return (
          <ImageUpload
            folder="general"
            currentImageUrl={value || undefined}
            onUploadComplete={onChange}
          />
        )

      case 'file':
        return (
          <FileUpload
            folder="resources"
            currentFileUrl={value || undefined}
            onUploadComplete={(url) => onChange(url)}
          />
        )

      case 'video_url':
        return (
          <VideoInput
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        )

      case 'url':
        return (
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'https://...'}
          />
        )

      case 'tags': {
        const tags: string[] = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                      onChange([...tags, tagInput.trim()])
                      setTagInput('')
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                    onChange([...tags, tagInput.trim()])
                    setTagInput('')
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => onChange(tags.filter(t => t !== tag))}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )
      }

      case 'date':
        return (
          <Input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )

      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
          />
        )

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        )
    }
  }

  // For switch fields, render inline
  if (field.type === 'switch') {
    return (
      <div className="flex items-center justify-between py-1">
        <Label className="text-sm font-medium">{field.label}</Label>
        {renderField()}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {field.helpText && (
        <p className="text-xs text-gray-500">{field.helpText}</p>
      )}
    </div>
  )
}

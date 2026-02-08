'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ArrowLeft, Save, Eye } from 'lucide-react'
import { CONTENT_TYPES, getContentType, generateSlug, type ContentTypeConfig } from '@/lib/content/content-types'
import DynamicField from '@/components/content-hub/dynamic-field'
import ContentPreview from '@/components/content-hub/content-preview'
import { useToast } from '@/hooks/use-toast'

export default function CreateContentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type') || CONTENT_TYPES[0].id
  const [contentType, setContentType] = useState(initialType)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  const config = getContentType(contentType)

  // Initialize form with defaults when type changes
  useEffect(() => {
    const newConfig = getContentType(contentType)
    if (!newConfig) return

    const defaults: Record<string, any> = {}
    for (const field of newConfig.fields) {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue
      }
    }
    setFormData(defaults)
  }, [contentType])

  // Auto-save to localStorage
  useEffect(() => {
    const key = `content-hub-draft-${contentType}`
    const timer = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        try { localStorage.setItem(key, JSON.stringify(formData)) } catch {}
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [formData, contentType])

  // Load draft from localStorage
  useEffect(() => {
    const key = `content-hub-draft-${contentType}`
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Object.keys(parsed).length > 0) {
          setFormData(prev => ({ ...prev, ...parsed }))
        }
      }
    } catch {}
  }, [contentType])

  const updateField = (name: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      // Auto-generate slug from title
      if (name === config?.titleField && config?.slugField) {
        if (!prev[config.slugField] || prev._autoSlug) {
          updated[config.slugField] = generateSlug(value)
          updated._autoSlug = true
        }
      }
      return updated
    })
  }

  const handleSave = async () => {
    if (!config) return

    // Validate required fields
    for (const field of config.fields) {
      if (field.required && !formData[field.name]) {
        toast({ title: 'Missing field', description: `${field.label} is required`, variant: 'destructive' })
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/content-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: contentType, ...formData }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.details || err.error)
      }

      const json = await res.json()

      // Clear localStorage draft
      try { localStorage.removeItem(`content-hub-draft-${contentType}`) } catch {}

      toast({ title: 'Created', description: `${config.label} created successfully` })
      router.push('/content-hub')
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (!config) return null

  const mainFields = config.fields.filter(f => f.group === 'main')
  const sidebarFields = config.fields.filter(f => f.group === 'sidebar')

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/content-hub')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-navy">Create {config.label}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button className="bg-navy hover:bg-navy/90" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Publish
            </Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left */}
          <div className="lg:col-span-2 space-y-6">
            {mainFields.map((field) => (
              <DynamicField
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={(val) => updateField(field.name, val)}
              />
            ))}
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sidebarFields.map((field) => (
                  <DynamicField
                    key={field.name}
                    field={field}
                    value={formData[field.name]}
                    onChange={(val) => updateField(field.name, val)}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <ContentPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={formData[config.titleField] || 'Untitled'}
        html={formData[config.bodyField] || ''}
      />
    </div>
  )
}

'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Save, Eye, Trash2 } from 'lucide-react'
import { getContentType } from '@/lib/content/content-types'
import DynamicField from '@/components/content-hub/dynamic-field'
import ContentPreview from '@/components/content-hub/content-preview'
import { useToast } from '@/hooks/use-toast'

export default function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const contentType = searchParams.get('type') || ''
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  const config = getContentType(contentType)

  const fetchContent = useCallback(async () => {
    if (!config) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/content-hub/${id}?type=${contentType}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()

      // Populate form with existing data
      const data: Record<string, unknown> = {}
      if (config) {
        for (const field of config.fields) {
          if (json.data[field.name] !== undefined) {
            data[field.name] = json.data[field.name]
          }
        }
        // If content_html exists and body is plain text, prefer HTML version
        if (config.bodyHtmlField && json.data[config.bodyHtmlField]) {
          data[config.bodyField] = json.data[config.bodyHtmlField]
        }
        // Auto-wrap plain text in paragraphs
        if (config.formatField && json.data[config.formatField] !== 'html' && data[config.bodyField]) {
          const text = String(data[config.bodyField])
          if (!text.startsWith('<')) {
            data[config.bodyField] = text
              .split('\n\n')
              .map((p: string) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
              .join('')
          }
        }
      }
      setFormData(data)
    } catch {
      toast({ title: 'Error', description: 'Failed to load content', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [config, contentType, id, toast])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const updateField = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!config) return

    for (const field of config.fields) {
      if (field.required && !formData[field.name]) {
        toast({ title: 'Missing field', description: `${field.label} is required`, variant: 'destructive' })
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content-hub/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: contentType, ...formData }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.details || err.error)
      }

      toast({ title: 'Saved', description: `${config.label} updated successfully` })
    } catch (error: unknown) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!config) return
    if (!confirm(`Delete this ${config.label.toLowerCase()}? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/content-hub/${id}?type=${contentType}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Deleted', description: `${config.label} deleted` })
        router.push('/content-hub')
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  if (!config) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <p className="text-gray-500">Invalid content type</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

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
              <h1 className="text-2xl font-bold text-navy">Edit {config.label}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button className="bg-navy hover:bg-navy/90" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
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
        title={String(formData[config.titleField] || 'Untitled')}
        html={String(formData[config.bodyField] || '')}
      />
    </div>
  )
}

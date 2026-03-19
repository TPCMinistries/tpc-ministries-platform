'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { TrackPlan } from '../../_components/types'

interface TabPlanProps {
  trackPlans: TrackPlan[]
  createPlan: (title: string, content: string, planType: string) => Promise<boolean>
  updatePlan: (id: string, updates: Partial<Pick<TrackPlan, 'title' | 'content' | 'plan_type' | 'status'>>) => Promise<boolean>
  deletePlan: (id: string) => Promise<boolean>
}

const PLAN_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'prep', label: 'Preparation' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  shared: { label: 'Shared', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
}

export function TabPlan({ trackPlans, createPlan, updatePlan, deletePlan }: TabPlanProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Create form state
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState('general')

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editType, setEditType] = useState('general')
  const [editStatus, setEditStatus] = useState('draft')

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    const success = await createPlan(newTitle.trim(), newContent.trim(), newType)
    if (success) {
      setNewTitle('')
      setNewContent('')
      setNewType('general')
      setShowCreateForm(false)
    }
    setCreating(false)
  }

  const handleStartEdit = (plan: TrackPlan) => {
    setEditingId(plan.id)
    setEditTitle(plan.title)
    setEditContent(plan.content || '')
    setEditType(plan.plan_type)
    setEditStatus(plan.status)
    setExpandedId(plan.id)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editTitle.trim()) return
    setSaving(true)
    const success = await updatePlan(editingId, {
      title: editTitle.trim(),
      content: editContent.trim(),
      plan_type: editType,
      status: editStatus,
    })
    if (success) {
      setEditingId(null)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    setDeleting(id)
    await deletePlan(id)
    setDeleting(null)
    if (expandedId === id) setExpandedId(null)
    if (editingId === id) setEditingId(null)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
    if (editingId && editingId !== id) setEditingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Track Plans ({trackPlans.length})
        </h2>
        <Button
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? 'outline' : 'default'}
        >
          <Plus className="h-4 w-4 mr-1" />
          {showCreateForm ? 'Cancel' : 'New Plan'}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-navy">Create New Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Plan title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex gap-3">
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Plan content... (describe your approach, timeline, tasks, etc.)"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={6}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating || !newTitle.trim()}>
                {creating ? 'Creating...' : 'Create Plan'}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans List */}
      {trackPlans.length === 0 && !showCreateForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No plans created yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Create plans to organize your track's preparation and logistics.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {trackPlans.map((plan) => {
            const isExpanded = expandedId === plan.id
            const isEditing = editingId === plan.id
            const statusInfo = STATUS_LABELS[plan.status] || STATUS_LABELS.draft
            const typeInfo = PLAN_TYPES.find(t => t.value === plan.plan_type)

            return (
              <Card key={plan.id} className={isExpanded ? 'ring-1 ring-navy/20' : ''}>
                <div
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleExpand(plan.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-navy text-sm truncate">{plan.title}</h3>
                      <Badge className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</Badge>
                      {typeInfo && (
                        <Badge variant="outline" className="text-xs">{typeInfo.label}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {plan.service_track} | Created {new Date(plan.created_at).toLocaleDateString()}
                      {plan.updated_at !== plan.created_at && (
                        <> | Updated {new Date(plan.updated_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {!isEditing && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEdit(plan)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(plan.id)
                          }}
                          disabled={deleting === plan.id}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                        </Button>
                      </>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Plan title"
                        />
                        <div className="flex gap-3">
                          <Select value={editType} onValueChange={setEditType}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PLAN_TYPES.map(t => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={editStatus} onValueChange={setEditStatus}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="shared">Shared</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Plan content..."
                          rows={8}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={saving || !editTitle.trim()}
                          >
                            <Save className="h-3.5 w-3.5 mr-1" />
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {plan.content ? (
                          <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                            {plan.content}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No content yet. Click edit to add details.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

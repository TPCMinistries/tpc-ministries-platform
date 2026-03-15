'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ClipboardList, Save, Check } from 'lucide-react'
import type { ActionItem } from './types'
import { actionCategories, emojiStatuses } from './constants'

interface TabActionsProps {
  actionItems: ActionItem[]
  addActionItem: (item: { title: string; category: string; priority: string }) => void
  updateActionItemField: (id: string, field: string, value: string | null) => void
  deleteActionItem: (id: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

function getCategoryStyle(value: string) {
  return actionCategories.find((c) => c.value === value) ?? null
}

export function TabActions({
  actionItems,
  addActionItem,
  updateActionItemField,
  deleteActionItem,
  saveStatus,
}: TabActionsProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('conference')
  const [newPriority, setNewPriority] = useState('medium')

  // --- Stats ---
  const doneCount = actionItems.filter((item) => item.status === 'done').length
  const totalCount = actionItems.length
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  // --- Filter ---
  const filteredItems =
    filterCategory === 'all'
      ? actionItems
      : actionItems.filter((item) => item.category === filterCategory)

  // --- Add handler ---
  const handleAdd = () => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    addActionItem({ title: trimmed, category: newCategory, priority: newPriority })
    setNewTitle('')
    setNewCategory('conference')
    setNewPriority('medium')
    setShowAddForm(false)
  }

  // --- Save indicator ---
  const renderSaveIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Save className="h-3 w-3 animate-pulse" /> Saving...
          </span>
        )
      case 'saved':
        return (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Check className="h-3 w-3" /> Saved
          </span>
        )
      case 'error':
        return <span className="text-xs text-red-600">Save failed</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Row: Progress + Add Button */}
      <div className="flex items-center gap-4">
        {/* Progress */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">
              {doneCount} of {totalCount} complete
            </span>
            <span className="font-medium text-navy">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-navy rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Save indicator */}
        <div className="shrink-0">{renderSaveIndicator()}</div>

        {/* Add Action toggle */}
        <Button size="sm" onClick={() => setShowAddForm((prev) => !prev)}>
          <Plus className="h-4 w-4 mr-1" /> Add Action
        </Button>
      </div>

      {/* Inline Add Form */}
      {showAddForm && (
        <div className="flex items-end gap-3 p-4 border rounded-lg bg-gray-50">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Action item title..."
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
            />
          </div>
          <div className="w-36">
            <label className="text-xs font-medium text-gray-700 mb-1 block">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
            >
              {actionCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-36">
            <label className="text-xs font-medium text-gray-700 mb-1 block">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
            >
              {emojiStatuses.actionPriority.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <Button size="sm" onClick={handleAdd}>
            Add
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {[{ value: 'all', label: 'All' }, ...actionCategories].map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterCategory === cat.value
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No action items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Title</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 w-32">
                      Category
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 w-32">
                      Assigned
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 w-36">Due</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 w-36">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 w-28">
                      Priority
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const isDone = item.status === 'done'
                    const catStyle = getCategoryStyle(item.category)

                    return (
                      <tr
                        key={item.id}
                        className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                          isDone ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Title */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            defaultValue={item.title}
                            onBlur={(e) => {
                              const val = e.target.value.trim()
                              if (val && val !== item.title) {
                                updateActionItemField(item.id, 'title', val)
                              }
                            }}
                            className={`w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:outline-none transition-colors ${
                              isDone ? 'line-through text-gray-500' : ''
                            }`}
                          />
                        </td>

                        {/* Category */}
                        <td className="py-2 px-3 w-32">
                          <div className="relative">
                            <select
                              defaultValue={item.category}
                              onChange={(e) =>
                                updateActionItemField(item.id, 'category', e.target.value)
                              }
                              className="absolute inset-0 w-full opacity-0 cursor-pointer"
                            >
                              {actionCategories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                            <Badge
                              className={`pointer-events-none text-xs ${
                                catStyle?.color ?? 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {catStyle?.label ?? item.category}
                            </Badge>
                          </div>
                        </td>

                        {/* Assigned */}
                        <td className="py-2 px-3 w-32">
                          <input
                            type="text"
                            defaultValue={item.assigned_to ?? ''}
                            onBlur={(e) => {
                              const val = e.target.value.trim()
                              updateActionItemField(
                                item.id,
                                'assigned_to',
                                val || null
                              )
                            }}
                            placeholder="--"
                            className="w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:outline-none transition-colors"
                          />
                        </td>

                        {/* Due Date */}
                        <td className="py-2 px-3 w-36">
                          <input
                            type="date"
                            defaultValue={item.due_date ?? ''}
                            onChange={(e) =>
                              updateActionItemField(
                                item.id,
                                'due_date',
                                e.target.value || null
                              )
                            }
                            className="w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:outline-none transition-colors"
                          />
                        </td>

                        {/* Status */}
                        <td className="py-2 px-3 w-36">
                          <select
                            defaultValue={item.status}
                            onChange={(e) =>
                              updateActionItemField(item.id, 'status', e.target.value)
                            }
                            className="w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:outline-none cursor-pointer transition-colors"
                          >
                            {emojiStatuses.actionStatus.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Priority */}
                        <td className="py-2 px-3 w-28">
                          <select
                            defaultValue={item.priority}
                            onChange={(e) =>
                              updateActionItemField(item.id, 'priority', e.target.value)
                            }
                            className="w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:outline-none cursor-pointer transition-colors"
                          >
                            {emojiStatuses.actionPriority.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Delete */}
                        <td className="py-2 px-1 w-10">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                            onClick={() => deleteActionItem(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
